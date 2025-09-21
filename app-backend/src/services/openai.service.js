
// FILE: app-backend/src/services/openai.service.js
// PURPOSE: A service wrapper for all interactions with the OpenAI API.

import OpenAI from 'openai';
import config from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

async function queryOpenAI(model, messages) {
  console.log(`[Health] Service function executed: queryOpenAI for model ${model}`);
  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error(`OpenAI API Error: ${error.message}`);
    throw new ApiError(502, "The AI model service is currently unavailable.");
  }
}

export async function generateSummary(text) {
  console.log("[Health] Service function executed: generateSummary");
  const messages = [
    { role: 'system', content: 'Summarize the following text concisely, focusing on the main points.' },
    { role: 'user', content: text },
  ];
  return await queryOpenAI('gpt-4o-mini', messages);
}

export async function generateLearningModule(text) {
  console.log("[Health] Service function executed: generateLearningModule");
  const messages = [
    { role: 'system', content: 'Based on the following concept, create a concise real-world analogy to explain it, and then suggest a simple micro-project idea for a beginner to apply the concept.' },
    { role: 'user', content: text },
  ];
  return await queryOpenAI('gpt-4o-mini', messages);
}

export async function generateFlashcards(text) {
  console.log("[Health] Service function executed: generateFlashcards");
  const messages = [
    { role: 'system', content: "From the text below, generate exactly 3 distinct question and answer pairs suitable for flashcards. Format each pair strictly as 'Q: [Your Question]' on one line, followed by 'A: [Your Answer]' on the next line." },
    { role: 'user', content: text },
  ];
  return await queryOpenAI('gpt-4o-mini', messages);
}

export async function generateStudyPlan(text) {
  console.log("[Health] Service function executed: generateStudyPlan");
  const messages = [
    { role: 'system', content: "Based on the core topic, create a 7-day study plan. Each day should have a specific, actionable goal. Format the output as a list, with each day on a new line starting with 'Day X:'." },
    { role: 'user', content: text },
  ];
  return await queryOpenAI('gpt-4o-mini', messages);
}
