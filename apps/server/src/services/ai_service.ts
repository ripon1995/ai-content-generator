import { getGenerativeModel, generationConfig, safetySettings } from '../config/ai';
import { getPromptTemplate, SYSTEM_INSTRUCTION } from '../utils/ai_prompts';
import { ContentType } from '../types/content_interfaces';
import { AIServiceException } from '../exceptions';
import logger from '../utils/logger';

// AI service to handle content generation
// todo : improvement of the catch block
class AIService {
  // generate content using Gemini AI
  async generateContent(prompt: string, contentType: ContentType): Promise<string> {
    try {
      logger.info(`Generating ${contentType} content with Gemini AI`);

      // format the prompt based on content type
      const formattedPrompt = this.formatPrompt(prompt, contentType);

      // get the generative model
      const model = getGenerativeModel();

      // create chat session with system instruction
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Understood. I will generate high-quality content based on your requirements.',
              },
            ],
          },
        ],
      });

      // send the formatted prompt
      const result = await chat.sendMessage(formattedPrompt);
      const response = result.response;
      logger.info(response);
      const generatedText = response.text();

      if (!generatedText || generatedText.trim().length === 0) {
        logger.error('AI generated empty content');
        throw new AIServiceException('AI service returned empty content');
      }

      logger.info(
        `Successfully generated ${contentType} content (${generatedText.length} characters)`
      );

      return generatedText.trim();
    } catch (error: any) {
      logger.error('AI content generation failed:', error);

      // handle specific Gemini API errors
      if (error.message?.includes('API key')) {
        throw new AIServiceException('Invalid or missing Gemini API key');
      }

      if (error.message?.includes('quota')) {
        throw new AIServiceException('Gemini API quota exceeded');
      }

      if (error.message?.includes('SAFETY')) {
        throw new AIServiceException('Content blocked by safety filters');
      }

      if (error.message?.includes('timeout')) {
        throw new AIServiceException('AI service timeout - please try again');
      }

      // re-throw if already AIServiceException
      if (error instanceof AIServiceException) {
        throw error;
      }

      // generic error
      throw new AIServiceException(
        `AI content generation failed: ${error.message || 'Unknown error'}`
      );
    }
  }

  // format prompt based on content type
  private formatPrompt(userPrompt: string, contentType: ContentType): string {
    try {
      const formattedPrompt = getPromptTemplate(contentType, userPrompt);

      logger.debug(`Formatted prompt for ${contentType} (${formattedPrompt.length} characters)`);

      return formattedPrompt;
    } catch (error: any) {
      logger.error('Failed to format prompt:', error);
      throw new AIServiceException(`Failed to format prompt: ${error.message}`);
    }
  }
}

// export singleton instance
export const aiService = new AIService();
