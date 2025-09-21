// FILE: app-backend/src/api/controllers/progressController.js
// PURPOSE: Handles logging and retrieving user study progress.

// --- Mock Dependencies ---
// This section simulates necessary imports for a standalone, runnable example.
const mockDb = {
  batch: () => {
    const operations = [];
    return {
      set: (ref, data) => operations.push({ type: 'SET', ref, data }),
      update: (ref, data) => operations.push({ type: 'UPDATE', ref, data }),
      commit: () => {
        console.log('[DB Sim] Committing batch with operations:', operations);
        return Promise.resolve();
      },
    };
  },
  collection: (name) => ({
    doc: (id) => ({
      get: () => {
        console.log(`[DB Sim] GET on ${name}/${id || '(new doc)'}`);
        if (name === 'nodes' && id === 'node-123') {
          return Promise.resolve({ exists: true, data: () => ({ sourceId: 'source-abc' }) });
        }
        if (name === 'sources' && id === 'source-abc') {
          return Promise.resolve({ exists: true, data: () => ({ ownerId: 'user-xyz' }) });
        }
        return Promise.resolve({ exists: false });
      },
    }),
    where: (field, op, value) => ({
      get: () => {
        console.log(`[DB Sim] QUERY on ${name} where ${field} ${op} ${value}`);
        if (name === 'sources') return Promise.resolve({ docs: [{ id: 'source-abc' }, { id: 'source-def' }] });
        if (name === 'nodes') return Promise.resolve({ docs: [
            { id: 'node-123', data: () => ({}) },
            { id: 'node-456', data: () => ({}) },
            { id: 'node-789', data: () => ({}) },
        ]});
        return Promise.resolve({ docs: [] });
      },
       orderBy: () => ({
        get: () => {
             if (name === 'progress') return Promise.resolve({ docs: [
                { id: 'p1', data: () => ({ nodeId: 'node-123', status: 'completed', timeSpentMinutes: 15 }) },
                { id: 'p2', data: () => ({ nodeId: 'node-456', status: 'in_progress', timeSpentMinutes: 10 }) },
                { id: 'p3', data: () => ({ nodeId: 'node-123', status: 'in_progress', timeSpentMinutes: 5 }) }, // Older entry for same node
            ]});
            return Promise.resolve({ docs: [] });
        }
       })
    }),
  }),
};

class ApiError extends Error {
  constructor(statusCode, message) { super(message); this.statusCode = statusCode; }
}
class ApiResponse {
  constructor(statusCode, data, message) { this.statusCode = statusCode; this.data = data; this.message = message; }
}


// --- Service Layer ---
// Encapsulates all business logic for progress tracking.
const progressService = {
  /**
   * Validates input, verifies ownership, and logs progress using an atomic batch write.
   * @returns {Promise<object>} The newly created progress entry.
   */
  async logUserProgress({ userId, nodeId, timeSpentMinutes, status }) {
    // 1. Security & Data Verification
    await this.verifyNodeOwnership(nodeId, userId);

    // 2. Atomic Database Write
    const batch = mockDb.batch();
    const nodeRef = mockDb.collection('nodes').doc(nodeId);
    const progressRef = mockDb.collection('progress').doc(); // Auto-generates ID

    const progressEntry = { userId, nodeId, timeSpentMinutes, status, loggedAt: new Date().toISOString() };
    
    batch.set(progressRef, progressEntry);
    batch.update(nodeRef, { statusBadge: status });
    
    await batch.commit();

    return { id: progressRef.id, ...progressEntry };
  },

  /**
   * Fetches all user data and aggregates it into a dashboard-ready format.
   * @param {string} userId - The ID of the authenticated user.
   * @returns {Promise<object>} Aggregated progress data.
   */
  async getAggregatedProgress(userId) {
    // 1. Fetch all necessary data in parallel
    const sourcesSnapshot = await mockDb.collection('sources').where('ownerId', '==', userId).get();
    const sourceIds = sourcesSnapshot.docs.map(doc => doc.id);
    
    // Firestore 'in' query is limited to 30 items. Handle this constraint.
    if (sourceIds.length > 30) {
        console.warn(`User ${userId} has ${sourceIds.length} sources, exceeding the Firestore 'in' query limit of 30. Truncating for this query.`);
        sourceIds.length = 30; // Truncate to avoid an error
    }

    let allUserNodes = [];
    if (sourceIds.length > 0) {
        const nodesSnapshot = await mockDb.collection('nodes').where('sourceId', 'in', sourceIds).get();
        allUserNodes = nodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    const progressSnapshot = await mockDb.collection('progress').where('userId', '==', userId).orderBy('loggedAt', 'desc').get();
    const timeline = progressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Perform Data Aggregation
    const chartData = this.calculateChartData(allUserNodes, timeline);
    const totalMinutes = timeline.reduce((sum, entry) => sum + entry.timeSpentMinutes, 0);

    return {
      chartData,
      totals: { totalMinutes, totalHours: (totalMinutes / 60).toFixed(2), totalNodes: allUserNodes.length },
      timeline,
    };
  },
  
  calculateChartData(allUserNodes, timeline) {
    const chartData = { completed: 0, in_progress: 0, not_started: 0 };
    const nodeStatusMap = new Map();

    // The timeline is sorted descending, so the first status we see for a node is the latest one.
    for (const entry of timeline) {
      if (!nodeStatusMap.has(entry.nodeId)) {
        nodeStatusMap.set(entry.nodeId, entry.status);
      }
    }

    for (const node of allUserNodes) {
      const status = nodeStatusMap.get(node.id);
      if (status === 'completed') chartData.completed++;
      else if (status === 'in_progress') chartData.in_progress++;
      else chartData.not_started++;
    }
    return chartData;
  },

  async verifyNodeOwnership(nodeId, userId) {
    const nodeDoc = await mockDb.collection('nodes').doc(nodeId).get();
    if (!nodeDoc.exists) throw new ApiError(404, "Node not found.");
    
    const sourceDoc = await mockDb.collection('sources').doc(nodeDoc.data().sourceId).get();
    if (!sourceDoc.exists || sourceDoc.data().ownerId !== userId) {
      throw new ApiError(403, "Access denied.");
    }
  },
};


// --- Controller Layer ---
// Handles HTTP requests/responses and delegates logic to the service.

export const logProgress = async (req, res, next) => {
  console.log("[Health] Backend Route executed: logProgress");
  try {
    const { nodeId, timeSpentMinutes, status } = req.body;
    const userId = req.user?.uid;
    
    // Basic validation in controller before hitting service
    if (!nodeId || timeSpentMinutes === undefined || !status) {
      return next(new ApiError(400, "nodeId, timeSpentMinutes, and status are required."));
    }
    if (!['in_progress', 'completed'].includes(status)) {
      return next(new ApiError(400, "Status must be 'in_progress' or 'completed'."));
    }
    if (!userId) return next(new ApiError(401, "Authentication required."));

    const result = await progressService.logUserProgress({ userId, nodeId, timeSpentMinutes, status });
    res.status(201).json(new ApiResponse(201, result, "Progress logged successfully."));
  
  } catch (error) {
    console.error("Error in logProgress:", error);
    next(error instanceof ApiError ? error : new ApiError(500, "Failed to log progress."));
  }
};

export const getProgress = async (req, res, next) => {
  console.log("[Health] Backend Route executed: getProgress");
  try {
    const userId = req.user?.uid;
    if (!userId) return next(new ApiError(401, "Authentication required."));
    
    const result = await progressService.getAggregatedProgress(userId);
    res.status(200).json(new ApiResponse(200, result, "Progress retrieved successfully."));

  } catch (error) {
    console.error("Error in getProgress:", error);
    next(error instanceof ApiError ? error : new ApiError(500, "Failed to retrieve progress."));
  }
};