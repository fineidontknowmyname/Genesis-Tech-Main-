// FILE: app-backend/src/api/controllers/mindmap.controller.js
// PURPOSE: Handles fetching mind map data and generating related aids like flashcards.

import { generateFlashcards } from '../services/openai.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../../config/db.js';

// --- Service Layer ---
const mindmapService = {
  async fetchMindmapBySourceId(sourceId, userId) {
    const sourceDoc = await db.collection('sources').doc(sourceId).get();
    if (!sourceDoc.exists || sourceDoc.data().ownerId !== userId) {
      throw new ApiError(404, "Source not found or access denied.");
    }

    const [nodesSnapshot, edgesSnapshot] = await Promise.all([
      db.collection('nodes').where('sourceId', '==', sourceId).get(),
      db.collection('edges').where('sourceId', '==', sourceId).get()
    ]);

    const nodes = nodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const edges = edgesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { nodes, edges };
  },

  async fetchOrCreateFlashcards(nodeId, userId) {
    const nodeData = await this.verifyNodeOwnership(nodeId, userId);

    const flashcardsSnapshot = await db.collection('flashcards').where('nodeId', '==', nodeId).limit(1).get();
    if (!flashcardsSnapshot.empty) {
      console.log(`[Health] Cache hit for flashcards on nodeId '${nodeId}'.`);
      const cachedCards = flashcardsSnapshot.docs[0].data();
      return { data: { id: flashcardsSnapshot.docs[0].id, ...cachedCards }, isNew: false };
    }

    console.log(`[Health] Cache miss. Generating flashcards for nodeId '${nodeId}'.`);
    const sourceText = `Title: ${nodeData.title}\nSummary: ${nodeData.summary}`;
    const generatedCards = await generateFlashcards(sourceText);

    const flashcardsData = {
      nodeId,
      userId,
      cards: generatedCards,
      generatedAt: new Date().toISOString()
    };
    const newFlashcardsRef = await db.collection('flashcards').add(flashcardsData);
    
    return { data: { id: newFlashcardsRef.id, ...flashcardsData }, isNew: true };
  },
  
  async verifyNodeOwnership(nodeId, userId) {
    const nodeDoc = await db.collection('nodes').doc(nodeId).get();
    if (!nodeDoc.exists) {
      throw new ApiError(404, "Node not found.");
    }
    const nodeData = nodeDoc.data();
    const sourceDoc = await db.collection('sources').doc(nodeData.sourceId).get();
    if (!sourceDoc.exists || sourceDoc.data().ownerId !== userId) {
      throw new ApiError(403, "Access denied.");
    }
    return nodeData;
  }
};

// --- Controller Layer ---
export const getMindmap = async (req, res, next) => {
  console.log("[Health] Backend Route executed: getMindmap");
  try {
    const { sourceId } = req.query;
    const userId = req.user?.uid;

    if (!sourceId) return next(new ApiError(400, "sourceId query parameter is required."));
    if (!userId) return next(new ApiError(401, "Authentication required."));

    const mindmapData = await mindmapService.fetchMindmapBySourceId(sourceId, userId);
    res.status(200).json(new ApiResponse(200, mindmapData, "Mindmap retrieved successfully."));

  } catch (error) {
    console.error("Error in getMindmap:", error);
    next(error instanceof ApiError ? error : new ApiError(500, "Failed to retrieve mindmap."));
  }
};

export const getOrCreateFlashcardsByNodeId = async (req, res, next) => {
  console.log("[Health] Backend Route executed: getOrCreateFlashcardsByNodeId");
  try {
    const { nodeId } = req.params;
    const userId = req.user?.uid;

    if (!nodeId) return next(new ApiError(400, "Node ID is required in the URL path."));
    if (!userId) return next(new ApiError(401, "Authentication required."));
    
    const result = await mindmapService.fetchOrCreateFlashcards(nodeId, userId);
    
    const status = result.isNew ? 201 : 200;
    const message = result.isNew ? "Flashcards generated successfully." : "Flashcards retrieved from cache.";
    
    res.status(status).json(new ApiResponse(status, result.data, message));

  } catch (error) {
    console.error("Error in getOrCreateFlashcardsByNodeId:", error);
    next(error instanceof ApiError ? error : new ApiError(500, "Failed to process flashcards."));
  }
};
