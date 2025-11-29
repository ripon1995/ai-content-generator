import { Job } from 'bull';
import { IContentGenerationJobData } from '../types/queue_interfaces';
import { Content } from '../models';
import { aiService } from '../services/ai_service';
import { JobProcessorException } from '../exceptions';
import logger from '../utils/logger';
import { ContentType } from '../types/content_interfaces';

const findContentById = async (contentId: string) => {
  const content = await Content.findById(contentId);
  if (!content) {
    logger.error(`Content not found: ${contentId}`);
    throw new JobProcessorException('Content not found');
  }
  return content;
};

const executeGeneration = async (contentId: string, contentType: ContentType, prompt: string) => {
  // get content
  const content = await findContentById(contentId);

  // Call AI service to generate content
  const generatedText = await aiService.generateContent(prompt, contentType);

  if (!generatedText) {
    throw new JobProcessorException('AI service returned empty content');
  }

  // Update content with generated text
  content.generatedText = generatedText;
  content.generationStatus = 'completed';
  content.failureReason = undefined;
  await content.save();

  logger.info(
    `Content generation completed for content: ${contentId} (${generatedText.length} characters)`
  );
};

const updateContentStatus = async (
  contentId: string,
  status: 'processing' | 'completed' | 'failed',
  failureReason?: string
) => {
  try {
    const content = await Content.findById(contentId);
    if (content) {
      content.generationStatus = status;
      if (failureReason) {
        content.failureReason = failureReason;
      } else {
        // Clear reason on success or transition to processing
        content.failureReason = undefined;
      }
      await content.save();
      logger.info(`Content ${contentId} status updated to ${status}`);
    }
  } catch (updateError: any) {
    logger.error(`Failed to update content status for ${contentId}:`, updateError);
    throw new JobProcessorException(`Failed to update content status: ${updateError.message}`);
  }
};

// process content generation job
export const processContentGeneration = async (
  job: Job<IContentGenerationJobData>
): Promise<void> => {
  const { contentId, contentType, prompt } = job.data;

  logger.info(`Processing content generation job ${job.id} for content: ${contentId}`);

  try {
    // find the content document
    await findContentById(contentId);
    // update status to processing
    await updateContentStatus(contentId, 'processing');

    await executeGeneration(contentId, contentType, prompt);
  } catch (error: any) {
    logger.error(`Content generation failed for content ${contentId}:`, error);
    const failureReason = error.message || 'Unknown error occurred during content generation';
    await updateContentStatus(contentId, 'failed', failureReason);

    // re-throw error so Bull can handle retries
    throw error;
  }
};
