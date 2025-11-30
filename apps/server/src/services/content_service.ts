import { Content } from '../models';
import { IContentDocument, IContentInput, IContentUpdate } from '../types/content_interfaces';
import { NotFoundException, ForbiddenException, ContentServiceException } from '../exceptions';
import logger from '../utils/logger';
import { Types } from 'mongoose';
import { queueService } from './queue_service';
import { IContentGenerationJobData } from '../types/queue_interfaces';

// content service to handle business logic
export class ContentService {
  // private helper method to validate content exists
  private validateContentExists(content: IContentDocument | null, contentId: string): void {
    if (!content) {
      logger.warn(`Content not found: ${contentId}`);
      throw new NotFoundException('Content not found');
    }
  }

  // private helper method to validate content ownership
  private validateContentOwnership(
    content: IContentDocument,
    userId: string,
    contentId: string
  ): void {
    if (content.userId.toString() !== userId) {
      logger.warn(`Unauthorized access attempt to content: ${contentId} by user: ${userId}`);
      throw new ForbiddenException('You do not have permission to access this content');
    }
  }

  // create new content
  async createContent(contentData: IContentInput): Promise<IContentDocument> {
    try {
      const { userId, title, contentType, prompt, generatedText, status, jobId, generationStatus } =
        contentData;

      // create new content
      const newContent = await Content.create({
        userId: new Types.ObjectId(userId),
        title,
        contentType,
        prompt,
        generatedText: generatedText || '',
        status: status || 'draft',
        jobId,
        generationStatus: generationStatus || 'completed',
      });

      logger.info(`New content created: ${newContent._id} by user: ${userId}`);

      return newContent;
    } catch (error: any) {
      logger.error('Failed to create content:', error);
      throw new ContentServiceException(`Failed to create content: ${error.message}`);
    }
  }

  // get content by ID
  async getContentById(contentId: string, userId: string): Promise<IContentDocument> {
    try {
      const content = await Content.findById(contentId);

      this.validateContentExists(content, contentId);
      this.validateContentOwnership(content!, userId, contentId);

      return content!;
    } catch (error: any) {
      // re-throw if it's already a custom exception
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      logger.error(`Failed to get content ${contentId}:`, error);
      throw new ContentServiceException(`Failed to retrieve content: ${error.message}`);
    }
  }

  // get all content for a user with optional filters
  async getUserContent(
    userId: string,
    filters: {
      contentType?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ contents: IContentDocument[]; total: number; page: number; totalPages: number }> {
    try {
      const { contentType, status, page = 1, limit = 10 } = filters;

      // build query
      const query: any = { userId: new Types.ObjectId(userId) };

      if (contentType) {
        query.contentType = contentType;
      }

      if (status) {
        query.status = status;
      }

      // calculate pagination
      const skip = (page - 1) * limit;

      // execute query with pagination
      const [contents, total] = await Promise.all([
        Content.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Content.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      logger.info(`Retrieved ${contents.length} contents for user: ${userId}`);

      return {
        contents,
        total,
        page,
        totalPages,
      };
    } catch (error: any) {
      logger.error(`Failed to get user content for user ${userId}:`, error);
      throw new ContentServiceException(`Failed to retrieve user content: ${error.message}`);
    }
  }

  // update content
  async updateContent(
    contentId: string,
    userId: string,
    updateData: IContentUpdate
  ): Promise<IContentDocument> {
    try {
      const content = await Content.findById(contentId);

      this.validateContentExists(content, contentId);
      this.validateContentOwnership(content!, userId, contentId);

      // update fields
      if (updateData.title !== undefined) content!.title = updateData.title;
      if (updateData.contentType !== undefined) content!.contentType = updateData.contentType;
      if (updateData.prompt !== undefined) content!.prompt = updateData.prompt;
      if (updateData.generatedText !== undefined) content!.generatedText = updateData.generatedText;
      if (updateData.status !== undefined) content!.status = updateData.status;
      if (updateData.generationStatus !== undefined)
        content!.generationStatus = updateData.generationStatus;
      if (updateData.failureReason !== undefined) content!.failureReason = updateData.failureReason;

      await content!.save();

      logger.info(`Content updated: ${contentId} by user: ${userId}`);

      return content!;
    } catch (error: any) {
      // re-throw if it's already a custom exception
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      logger.error(`Failed to update content ${contentId}:`, error);
      throw new ContentServiceException(`Failed to update content: ${error.message}`);
    }
  }

  // delete content (soft delete)
  async deleteContent(contentId: string, userId: string): Promise<void> {
    try {
      const content = await Content.findById(contentId);

      this.validateContentExists(content, contentId);
      this.validateContentOwnership(content!, userId, contentId);

      // soft delete
      content!.isDeleted = true;
      await content!.save();

      logger.info(`Content soft deleted: ${contentId} by user: ${userId}`);
    } catch (error: any) {
      // re-throw if it's already a custom exception
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      logger.error(`Failed to delete content ${contentId}:`, error);
      throw new ContentServiceException(`Failed to delete content: ${error.message}`);
    }
  }

  // queue content generation
  async queueContentGeneration(
    contentData: IContentInput
  ): Promise<{ content: IContentDocument; jobId: string }> {
    try {
      const { userId, title, contentType, prompt } = contentData;

      // create content record with pending status
      const newContent = await Content.create({
        userId: new Types.ObjectId(userId),
        title,
        contentType,
        prompt,
        generatedText: '',
        status: 'draft',
        generationStatus: 'pending',
      });

      logger.info(`Content created for generation: ${newContent._id} by user: ${userId}`);

      // prepare job data
      const jobData: IContentGenerationJobData = {
        userId,
        contentId: newContent._id.toString(),
        contentType,
        prompt,
        title,
      };

      // add job to queue
      const jobId = await queueService.addContentGenerationJob(jobData);

      // update content with jobId
      newContent.jobId = jobId;
      await newContent.save();

      logger.info(`Content generation job queued: ${jobId} for content: ${newContent._id}`);

      return {
        content: newContent,
        jobId,
      };
    } catch (error: any) {
      logger.error('Failed to queue content generation:', error);
      throw new ContentServiceException(`Failed to queue content generation: ${error.message}`);
    }
  }
}

// export singleton instance
export const contentService = new ContentService();
