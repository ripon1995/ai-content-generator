import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { env } from './env';
import logger from '../utils/logger';

// initialize Google Gemini AI client
const genAI = new GoogleGenerativeAI(env.geminiApiKey);

// get generative model instance
export const getGenerativeModel = () => {
  try {
    const model = genAI.getGenerativeModel({
      model: env.geminiModel,
    });

    logger.info(`Gemini AI initialized with model: ${env.geminiModel}`);
    return model;
  } catch (error) {
    logger.error('Failed to initialize Gemini AI:', error);
    throw error;
  }
};

// generation configuration
export const generationConfig = {
  temperature: env.geminiTemperature,
  maxOutputTokens: env.geminiMaxTokens,
  topP: 0.95,
  topK: 40,
};

// safety settings to prevent harmful content
export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];
