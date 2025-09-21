// FILE: app-backend/src/api/services/prompts.js
// PURPOSE: To centralize all prompt engineering for AI model interactions.

// --- Service Implementation ---
// This is the actual code generated from your pseudocode.

// ----------------------------------------------------
// 1. PROMPT GENERATION FUNCTIONS
// ----------------------------------------------------

/**
 * Creates the prompt for generating a learning module.
 * @param {string} contextText - The source text from a mind map node.
 * @returns {string} The fully formatted prompt.
 */
function createLearningModulePrompt(contextText) {
  console.log("[Health] Service function executed: createLearningModulePrompt");
  const prompt = `
Based on the following text, create two distinct sections:
1. A simple, real-world analogy to explain the core concept.
2. A small, practical micro-project or exercise for a beginner.

Text: "${contextText}"
  `;
  return prompt.trim();
}

/**
 * Creates the prompt for generating flashcards.
 * @param {string} contextText - The source text.
 * @returns {string} The fully formatted prompt.
 */
function createFlashcardsPrompt(contextText) {
  console.log("[Health] Service function executed: createFlashcardsPrompt");
  const prompt = `
Generate exactly three distinct question and answer pairs from the following text.
Format each pair strictly on two lines as:
Q: [question]
A: [answer]

Text: "${contextText}"
  `;
  return prompt.trim();
}

/**
 * Creates the prompt for summarizing text.
 * @param {string} contextText - The text to be summarized.
 * @returns {string} The fully formatted prompt.
 */
function createSummaryPrompt(contextText) {
  console.log("[Health] Service function executed: createSummaryPrompt");
  // For instruction-tuned models, a clear instruction is helpful.
  const prompt = `Summarize the following text concisely, focusing on the main points: "${contextText}"`;
  return prompt;
}

// Export all the prompt-generating functions
export {
  createLearningModulePrompt,
  createFlashcardsPrompt,
  createSummaryPrompt,
};