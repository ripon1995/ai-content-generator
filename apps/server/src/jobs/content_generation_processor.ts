import { Job } from 'bull';
import { IContentGenerationJobData } from '../types/queue_interfaces';
import { Content } from '../models';
import { aiService } from '../services/ai_service';
import { JobProcessorException } from '../exceptions';
import logger from '../utils/logger';
import { ContentType } from '../types/content_interfaces';
import { pubSubService } from '../services/pubsub_service';

const findContentById = async (contentId: string) => {
  const content = await Content.findById(contentId);
  if (!content) {
    logger.error(`Content not found: ${contentId}`);
    throw new JobProcessorException('Content not found');
  }
  return content;
};

const executeGeneration = async (
  contentId: string,
  contentType: ContentType,
  prompt: string,
  jobId: string
) => {
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

  // publish completed : via pub/sub
  await pubSubService.publishContentGenerationCompleted(content.userId.toString(), {
    contentId: content._id.toString(),
    jobId,
    status: 'completed',
    title: content.title,
    contentType: content.contentType,
    generatedText: content.generatedText,
    timestamp: new Date(),
  });
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
  const jobId = job.id?.toString() || 'unknown';

  logger.info(`Processing content generation job ${jobId} for content: ${contentId}`);

  try {
    // find the content document
    const content = await findContentById(contentId);

    // update status to processing
    await updateContentStatus(contentId, 'processing');

    // publish processing : via pub/sub
    await pubSubService.publishContentGenerationStarted(content.userId.toString(), {
      contentId: content._id.toString(),
      jobId,
      status: 'processing',
      timestamp: new Date(),
    });
    // start the execution
    await executeGeneration(contentId, contentType, prompt, jobId);
  } catch (error: any) {
    logger.error(`Content generation failed for content ${contentId}:`, error);
    const failureReason = error.message || 'Unknown error occurred during content generation';
    await updateContentStatus(contentId, 'failed', failureReason);

    // Get content to publish failed event
    try {
      const content = await Content.findById(contentId);
      if (content) {
        // publish failed : via pub/sub
        await pubSubService.publishContentGenerationFailed(content.userId.toString(), {
          contentId: content._id.toString(),
          jobId,
          status: 'failed',
          failureReason,
          timestamp: new Date(),
        });
      }
    } catch (publishError) {
      logger.error('Failed to publish content generation failed event:', publishError);
    }

    // re-throw error so Bull can handle retries
    throw error;
  }
};
