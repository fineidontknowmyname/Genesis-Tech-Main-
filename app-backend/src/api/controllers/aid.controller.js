// FILE: app-backend/src/api/controllers/aid.controller.js
// PURPOSE: To handle the business logic for generating and retrieving AI aids.

import {
  generateSummary,
  generateLearningModule,
  generateFlashcards,
  generateStudyPlan
} from '../services/openai.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../../config/db.js';

// --- Service Layer ---
const aidService = {
  async fetchOrCreateAid(nodeId, type, userId) {
    const aidConfig = this.getAidConfig(type);
    if (!aidConfig) {
      throw new ApiError(400, "Invalid aid type specified.");
    }
    const { collectionName, generationFn } = aidConfig;

    const nodeData = await this.verifyNodeOwnership(nodeId, userId);

    const cachedAid = await this.findExistingAid(collectionName, nodeId);
    if (cachedAid) {
      return { status: 200, data: cachedAid, message: "Aid retrieved from cache." };
    }

    const newAid = await this.generateAndStoreAid(nodeData, userId, collectionName, generationFn);
    return { status: 201, data: newAid, message: "Aid generated successfully." };
  },

  getAidConfig(type) {
    const configs = {
      summary: { collectionName: "summaries", generationFn: generateSummary },
      module: { collectionName: "modules", generationFn: generateLearningModule },
      flashcards: { collectionName: "flashcards", generationFn: generateFlashcards },
      study_plan: { collectionName: "study_plans", generationFn: generateStudyPlan },
    };
    return configs[type];
  },

  async verifyNodeOwnership(nodeId, userId) {
    const nodeDoc = await db.collection('nodes').doc(nodeId).get();
    if (!nodeDoc.exists) {
      throw new ApiError(404, "Node not found.");
    }
    const nodeData = nodeDoc.data();
    const sourceDoc = await db.collection('sources').doc(nodeData.sourceId).get();
    if (!sourceDoc.exists || sourceDoc.data().ownerId !== userId) {
      throw new ApiError(403, "Access denied. You do not own the source material.");
    }
    return { id: nodeId, ...nodeData };
  },

  async findExistingAid(collectionName, nodeId) {
    const snapshot = await db.collection(collectionName).where('nodeId', '==', nodeId).limit(1).get();
    if (!snapshot.empty) {
      console.log(`[Health] Cache hit for aid in '${collectionName}' on nodeId '${nodeId}'.`);
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  },

  async generateAndStoreAid(nodeData, userId, collectionName, generationFn) {
    console.log(`[Health] Cache miss. Generating new aid in '${collectionName}' for nodeId '${nodeData.id}'.`);
    const sourceText = `Title: ${nodeData.title}\nSummary: ${nodeData.summary}`;
    const generatedContent = await generationFn(sourceText);

    const newAidData = {
      nodeId: nodeData.id,
      userId,
      content: generatedContent,
      generatedAt: new Date().toISOString()
    };
    const newAidRef = await db.collection(collectionName).add(newAidData);
    return { id: newAidRef.id, ...newAidData };
  }
};

// --- Controller Layer ---
export const getOrCreateAid = async (req, res, next) => {
  console.log("[Health] Backend Route executed: getOrCreateAid");

  const { nodeId, type } = req.body;
  const userId = req.user?.uid;

  if (!nodeId || !type) {
    return next(new ApiError(400, "nodeId and type are required."));
  }
  if (!userId) {
    return next(new ApiError(401, "Authentication required."));
  }

  try {
    const result = await aidService.fetchOrCreateAid(nodeId, type, userId);
    return res.status(result.status).json(new ApiResponse(result.status, result.data, result.message));
  } catch (error) {
    console.error("Error in getOrCreateAid controller:", error);
    return next(error instanceof ApiError ? error : new ApiError(500, "Failed to process aid request."));
  }
};
