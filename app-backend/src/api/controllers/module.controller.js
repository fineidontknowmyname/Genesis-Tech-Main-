// FILE: app-backend/src/api/controllers/module.controller.js
// PURPOSE: Handles the business logic for creating and retrieving AI-generated learning modules.

import { generateLearningModule } from '../services/openai.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../../config/db.js';

// --- Service Layer ---
const moduleService = {
  async processModuleRequest(nodeId, userId, forceRegenerate) {
    const nodeData = await this.verifyNodeOwnership(nodeId, userId);

    const existingModule = await this.findExistingModule(nodeId);
    if (existingModule && !forceRegenerate) {
      console.log(`[Health] Cache hit for module on nodeId '${nodeId}'.`);
      return { status: 200, data: existingModule, message: "Module retrieved from cache." };
    }

    console.log(`[Health] Cache miss or regeneration for module on nodeId '${nodeId}'.`);
    const generatedContent = await this.generateModuleContent(nodeData);

    const moduleData = {
      nodeId,
      userId,
      content: generatedContent,
      generatedAt: new Date().toISOString()
    };
    
    const savedModule = await this.saveOrUpdateModule(moduleData, existingModule);
    const status = existingModule ? 200 : 201;
    const message = existingModule ? "Module regenerated successfully." : "Module created successfully.";
    
    return { status, data: savedModule, message };
  },

  async verifyNodeOwnership(nodeId, userId) {
    const nodeDoc = await db.collection('nodes').doc(nodeId).get();
    if (!nodeDoc.exists) throw new ApiError(404, "Node not found.");

    const nodeData = nodeDoc.data();
    const sourceDoc = await db.collection('sources').doc(nodeData.sourceId).get();
    if (!sourceDoc.exists || sourceDoc.data().ownerId !== userId) {
      throw new ApiError(403, "Access denied. You do not own the source material.");
    }
    return nodeData;
  },

  async findExistingModule(nodeId) {
    const snapshot = await db.collection('modules').where('nodeId', '==', nodeId).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async generateModuleContent(nodeData) {
    const sourceText = `Title: ${nodeData.title}\nSummary: ${nodeData.summary}`;
    return generateLearningModule(sourceText);
  },

  async saveOrUpdateModule(moduleData, existingModule) {
    if (existingModule) {
      console.log("[Health] Module regenerated and updated successfully.");
      await db.collection('modules').doc(existingModule.id).update(moduleData);
      return { id: existingModule.id, ...moduleData };
    } else {
      console.log("[Health] New module created and saved successfully.");
      const newModuleRef = await db.collection('modules').add(moduleData);
      return { id: newModuleRef.id, ...moduleData };
    }
  }
};

// --- Controller Layer ---
export const getOrCreateModuleByNodeId = async (req, res, next) => {
  console.log("[Health] Endpoint hit: getOrCreateModuleByNodeId");

  try {
    const { nodeId } = req.params;
    const { regenerate } = req.query;
    const userId = req.user?.uid;

    if (!nodeId) {
      return next(new ApiError(400, "Node ID is required in the URL path."));
    }
     if (!userId) {
      return next(new ApiError(401, "Authentication is required."));
    }

    const forceRegenerate = regenerate === 'true';
    const result = await moduleService.processModuleRequest(nodeId, userId, forceRegenerate);

    return res.status(result.status).json(new ApiResponse(result.status, result.data, result.message));
  } catch (error) {
    console.error("Error in getOrCreateModuleByNodeId:", error);
    return next(error instanceof ApiError ? error : new ApiError(500, "Failed to process module request."));
  }
};
