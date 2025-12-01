import { Job } from 'bull';
import { contentGenerationQueue } from '../config/queue';
import {
  IContentGenerationJobData,
  IJobStatusResponse,
  BullJobStatus,
} from '../types/queue_interfaces';
import { Content } from '../models';
import { NotFoundException, QueueServiceException } from '../exceptions';
import logger from '../utils/logger';
import { ContentGenerationStatus } from '../types/content_interfaces';

// queue service to handle job operations
// acts as an interface of the queue
// todo : improve error handling with custom errors
// todo : break into smaller method
class QueueService {
  // add content generation job to queue with 1-minute delay
  async addContentGenerationJob(jobData: IContentGenerationJobData): Promise<string> {
    try {
      const job = await contentGenerationQueue.add(jobData);

      logger.info(
        `Content generation job added to queue: ${job.id} for content: ${jobData.contentId}`
      );

      return job.id.toString();
    } catch (error: any) {
      logger.error('Failed to add job to queue:', error);
      throw new QueueServiceException(
        `Failed to add content generation job to queue: ${error.message}`
      );
    }
  }

  // get job by ID
  private async getJobById(jobId: string): Promise<Job<IContentGenerationJobData> | null> {
    try {
      const job = await contentGenerationQueue.getJob(jobId);

      if (!job) {
        logger.warn(`Job not found: ${jobId}`);
        return null;
      }

      return job;
    } catch (error: any) {
      logger.error(`Failed to get job ${jobId}:`, error);
      throw new QueueServiceException(`Failed to retrieve job ${jobId}: ${error.message}`);
    }
  }

  // get job status and content
  async getJobStatus(jobId: string): Promise<IJobStatusResponse> {
    try {
      const job = await this.getJobById(jobId);

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      // get job state from Bull
      const bullJobStatus = await job.getState();

      // find the associated content document
      const content = await Content.findById(job.data.contentId);

      if (!content) {
        logger.warn(`Content not found for job: ${jobId}`);
        throw new NotFoundException('Content not found');
      }

      // map Bull job status to our generation status
      const generationStatus = this.mapBullStatusToGenerationStatus(
        bullJobStatus,
        content.generationStatus
      );

      const response: IJobStatusResponse = {
        jobId: jobId,
        status: generationStatus,
        failureReason: content.failureReason,
      };

      // include content details if job is completed
      // otherwise no need to add the content detail
      if (generationStatus === 'completed') {
        response.content = {
          id: content._id.toString(),
          title: content.title,
          generatedText: content.generatedText,
          contentType: content.contentType,
          prompt: content.prompt,
        };
      }

      return response;
    } catch (error: any) {
      // re-throw : if custom exception
      if (error instanceof NotFoundException || error instanceof QueueServiceException) {
        throw error;
      }

      logger.error(`Failed to get job status for ${jobId}:`, error);
      throw new QueueServiceException(`Failed to get job status: ${error.message}`);
    }
  }

  // private helper to map Bull job status to our generation status
  private mapBullStatusToGenerationStatus(
    bullStatus: BullJobStatus,
    contentStatus: ContentGenerationStatus
  ): ContentGenerationStatus {
    // if content has already been marked as completed or failed, use that
    if (contentStatus === 'completed' || contentStatus === 'failed') {
      return contentStatus;
    }

    // otherwise, map from Bull job status
    switch (bullStatus) {
      case 'waiting':
      case 'delayed':
      case 'paused':
        return 'pending';
      case 'active':
        return 'processing';
      case 'completed':
        return 'completed';
      case 'failed':
      case 'stuck':
        return 'failed';
      default:
        return 'pending';
    }
  }
}

// export singleton instance
export const queueService = new QueueService();
