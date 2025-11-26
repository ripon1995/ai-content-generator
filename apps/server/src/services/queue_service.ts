import { Job } from 'bull';
import { contentGenerationQueue } from '../config/queue';
import { IContentGenerationJobData, IJobStatusResponse, BullJobStatus } from '../types/queue_interfaces';
import { Content } from '../models';
import { NotFoundException, QueueServiceException } from '../exceptions';
import logger from '../utils/logger';
import { ContentGenerationStatus } from '../types/content_interfaces';

// queue service to handle job operations
export class QueueService {
  // add content generation job to queue with 1-minute delay
  async addContentGenerationJob(jobData: IContentGenerationJobData): Promise<string> {
    try {
      const job = await contentGenerationQueue.add(jobData, {
        delay: 60000, // 1 minute delay (60000 milliseconds)
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      logger.info(`Content generation job added to queue: ${job.id} for content: ${jobData.contentId}`);

      return job.id.toString();
    } catch (error: any) {
      logger.error('Failed to add job to queue:', error);
      throw new QueueServiceException(`Failed to add content generation job to queue: ${error.message}`);
    }
  }

  // get job by ID
  async getJobById(jobId: string): Promise<Job<IContentGenerationJobData> | null> {
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
    const generationStatus = this.mapBullStatusToGenerationStatus(bullJobStatus, content.generationStatus);

    const response: IJobStatusResponse = {
      jobId: jobId,
      status: generationStatus,
      failureReason: content.failureReason,
    };

    // include content details if job is completed
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

  // get all jobs (for debugging/admin purposes)
  async getAllJobs() {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        contentGenerationQueue.getWaiting(),
        contentGenerationQueue.getActive(),
        contentGenerationQueue.getCompleted(),
        contentGenerationQueue.getFailed(),
        contentGenerationQueue.getDelayed(),
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      };
    } catch (error: any) {
      logger.error('Failed to get all jobs:', error);
      throw new QueueServiceException(`Failed to retrieve queue statistics: ${error.message}`);
    }
  }
}

// export singleton instance
export const queueService = new QueueService();
