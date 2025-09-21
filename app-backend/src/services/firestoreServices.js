// FILE: app-backend/src/api/services/firestoreServices.js
// PURPOSE: To centralize and manage all direct interactions with the Firestore database.

// --- Mock Dependencies ---
// This section simulates the Firestore database and custom error utility
// to create a runnable and easy-to-understand standalone example.

// 1. Mock Firestore Database (db)
const mockDb = {
  _data: {
    sources: {
      'source-owned': { ownerId: 'user-123', content: 'This is my source.' },
      'source-other': { ownerId: 'user-xyz', content: 'This is not my source.' },
    },
    nodes: {
      'node-owned': { sourceId: 'source-owned', title: 'My Node' },
      'node-other': { sourceId: 'source-other', title: 'Another Node' },
    },
  },
  collection: function(collectionName) {
    return {
      doc: (docId) => ({
        get: async () => {
          console.log(`[DB Sim] Getting ${collectionName}/${docId}`);
          const doc = this._data[collectionName]?.[docId];
          return {
            id: docId,
            exists: !!doc,
            data: () => doc,
          };
        },
        update: async (updateData) => {
           console.log(`[DB Sim] Updating ${collectionName}/${docId} with`, updateData);
           if (this._data[collectionName]?.[docId]) {
               Object.assign(this._data[collectionName][docId], updateData);
           }
           return true;
        },
      }),
      add: async (data) => {
        const newId = `new-doc-${Date.now()}`;
        console.log(`[DB Sim] Adding to ${collectionName} with new ID ${newId}`);
        if (!this._data[collectionName]) this._data[collectionName] = {};
        this._data[collectionName][newId] = data;
        return { id: newId };
      }
    };
  },
};

// 2. Mock ApiError Utility
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// --- Service Implementation ---
// This is the actual code generated from your pseudocode.

// Import dependencies
const db = mockDb; // Using our mock Firestore db

// ----------------------------------------------------
// 1. SECURE DATA RETRIEVAL FUNCTIONS
// ----------------------------------------------------

/**
 * Finds a source by its ID and verifies ownership.
 * @param {string} sourceId - The ID of the source document.
 * @param {string} userId - The ID of the user requesting the document.
 * @returns {Promise<object>} The source document data.
 * @throws {ApiError} If not found or access is denied.
 */
export async function findSourceByIdAndOwner(sourceId, userId) {
  console.log(`[Health] Service function executed: findSourceByIdAndOwner for sourceId ${sourceId}`);
  const sourceDoc = await db.collection('sources').doc(sourceId).get();

  if (!sourceDoc.exists || sourceDoc.data().ownerId !== userId) {
    throw new ApiError(404, "Source not found or access denied.");
  }

  return { id: sourceDoc.id, ...sourceDoc.data() };
}

/**
 * Finds a mind map node by ID and verifies ownership via its parent source.
 * @param {string} nodeId - The ID of the node document.
 * @param {string} userId - The ID of the user requesting the document.
 * @returns {Promise<object>} The node document data.
 * @throws {ApiError} If not found or access is denied.
 */
export async function findNodeByIdAndOwner(nodeId, userId) {
  console.log(`[Health] Service function executed: findNodeByIdAndOwner for nodeId ${nodeId}`);
  const nodeDoc = await db.collection('nodes').doc(nodeId).get();
  if (!nodeDoc.exists) {
    throw new ApiError(404, "Node not found.");
  }

  // Verify ownership by checking the parent source document
  await findSourceByIdAndOwner(nodeDoc.data().sourceId, userId);

  return { id: nodeDoc.id, ...nodeDoc.data() };
}

// ----------------------------------------------------
// 2. DATA CREATION AND UPDATE FUNCTIONS
// ----------------------------------------------------

/**
 * A generic function to create a document in any collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {object} data - The data for the new document.
 * @returns {Promise<string>} The ID of the newly created document.
 */
export async function createDocument(collectionName, data) {
  console.log(`[Health] Service function executed: createDocument in collection ${collectionName}`);
  const docRef = await db.collection(collectionName).add({
    ...data,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

/**
 * Updates the status badge of a specific node.
 * @param {string} nodeId - The ID of the node to update.
 * @param {string} status - The new status value.
 * @returns {Promise<boolean>} True if successful.
 */
export async function updateNodeStatus(nodeId, status) {
  console.log(`[Health] Service function executed: updateNodeStatus for nodeId ${nodeId}`);
  await db.collection('nodes').doc(nodeId).update({ statusBadge: status });
  return true;
}