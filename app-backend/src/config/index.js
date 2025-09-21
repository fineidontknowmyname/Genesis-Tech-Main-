
// FILE: app-backend/src/config/index.js
// PURPOSE: To load, validate, and export all application configuration variables.

import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5001),
  OPENAI_API_KEY: Joi.string().required().description('OpenAI API Key'),
  FIREBASE_SERVICE_ACCOUNT_KEY: Joi.string().required().description('Firebase Service Account JSON'),
}).unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`❌ Config validation error: ${error.message}`);
}

console.log("[Health] Environment variables validated successfully.");

const config = Object.freeze({
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  openai: {
    apiKey: envVars.OPENAI_API_KEY,
  },
  firebase: {
    serviceAccountKey: envVars.FIREBASE_SERVICE_ACCOUNT_KEY,
  },
});

export default config;
