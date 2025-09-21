// FILE: app-frontend/src/services/firebaseApi.js
// PURPOSE: A centralized service for all frontend-to-backend API calls.

import axios from 'axios';

// Configure the base URL for all API requests.
// This should be stored in an environment variable.
const API_BASE_URL = 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the auth token in all requests.
apiClient.interceptors.request.use(async (config) => {
  console.log('[Health] API Interceptor: Attaching auth token.');
  // In a real app, you would get the token from your auth context (e.g., Firebase Auth).
  // const token = await auth.currentUser?.getIdToken();
  const token = 'valid_jwt_token'; // Using a mock token for this example.
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


/**
 * @description A generic wrapper for making API calls.
 * @param {string} method - The HTTP method (get, post, etc.).
 * @param {string} endpoint - The API endpoint to call.
 * @param {object} [payload] - The data to send with the request.
 * @returns {Promise<any>} The data from the API response.
 */
const callApi = async (method, endpoint, payload) => {
  console.log(`[Health] API Call executed: ${method.toUpperCase()} ${endpoint}`);
  try {
    const response = await apiClient[method](endpoint, payload);
    return response.data.data; // Return the 'data' field from our standard ApiResponse
  } catch (error) {
    console.error(`Error calling API endpoint '${endpoint}':`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * @description Uploads a new content source (e.g., from a URL) to be processed.
 * @param {{url: string}} data - The URL of the content to process.
 * @returns {Promise<{sourceId: string}>} The ID of the newly created source document.
 */
export const createSource = (data) => {
  return callApi('post', '/sources', data);
};

/**
 * @description Retrieves the data for a specific mind map.
 * @param {string} sourceId - The ID of the mind map source.
 * @returns {Promise<object>} The full mind map object (nodes, edges, etc.).
 */
export const getMindmap = (sourceId) => {
  return callApi('get', `/mindmaps?sourceId=${sourceId}`);
};

/**
 * @description Generates a specific learning aid for a mind map node.
 * @param {string} nodeId - The ID of the node.
 * @param {string} aidType - The type of aid to generate (e.g., 'flashcards', 'quiz').
 * @returns {Promise<object>} The generated learning aid content.
 */
export const generateAid = (nodeId, aidType) => {
  return callApi('post', '/aids', { nodeId, type: aidType });
};

/**
 * @description Retrieves the user's aggregated progress data.
 * @returns {Promise<object>} The user's progress dashboard data.
 */
export const getProgress = () => {
  return callApi('get', '/progress');
};
