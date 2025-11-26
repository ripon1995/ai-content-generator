import { Content } from '../models';
import {
  IContentDocument,
  IContentInput,
  IContentUpdate,
} from '../types/content_interfaces';
import { NotFoundException, ForbiddenException } from '../exceptions';
import logger from '../utils/logger';
import { Types } from 'mongoose';

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
  private validateContentOwnership(content: IContentDocument, userId: string, contentId: string): void {
    if (content.userId.toString() !== userId) {
      logger.warn(`Unauthorized access attempt to content: ${contentId} by user: ${userId}`);
      throw new ForbiddenException('You do not have permission to access this content');
    }
  }

  // create new content
  async createContent(contentData: IContentInput): Promise<IContentDocument> {
    const { userId, title, contentType, prompt, generatedText, status, jobId, generationStatus } = contentData;

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
  }

  // get content by ID
  async getContentById(contentId: string, userId: string): Promise<IContentDocument> {
    const content = await Content.findById(contentId);

    this.validateContentExists(content, contentId);
    this.validateContentOwnership(content!, userId, contentId);

    return content!;
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
  }

  // update content
  async updateContent(
    contentId: string,
    userId: string,
    updateData: IContentUpdate
  ): Promise<IContentDocument> {
    const content = await Content.findById(contentId);

    this.validateContentExists(content, contentId);
    this.validateContentOwnership(content!, userId, contentId);

    // update fields
    if (updateData.title !== undefined) content!.title = updateData.title;
    if (updateData.contentType !== undefined) content!.contentType = updateData.contentType;
    if (updateData.prompt !== undefined) content!.prompt = updateData.prompt;
    if (updateData.generatedText !== undefined) content!.generatedText = updateData.generatedText;
    if (updateData.status !== undefined) content!.status = updateData.status;
    if (updateData.generationStatus !== undefined) content!.generationStatus = updateData.generationStatus;
    if (updateData.failureReason !== undefined) content!.failureReason = updateData.failureReason;

    await content!.save();

    logger.info(`Content updated: ${contentId} by user: ${userId}`);

    return content!;
  }

  // delete content (soft delete)
  async deleteContent(contentId: string, userId: string): Promise<void> {
    const content = await Content.findById(contentId);
    
    this.validateContentExists(content, contentId);
    this.validateContentOwnership(content!, userId, contentId);

    // soft delete
    content!.isDeleted = true;
    await content!.save();

    logger.info(`Content soft deleted: ${contentId} by user: ${userId}`);
  }
}

// export singleton instance
export const contentService = new ContentService();
