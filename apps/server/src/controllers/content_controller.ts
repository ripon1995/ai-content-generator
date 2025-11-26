import { Request, Response } from 'express';
import { contentService } from '../services/content_service';
import { sendSuccess } from '../utils/response';
import { IContentUpdate, IContentResponse } from '../types/content_interfaces';
import logger from '../utils/logger';
import { HTTP_STATUS_CODES } from '../utils/messages';

export class ContentController {
  // private helper method to transform content document to response format
  private transformContentToResponse(content: any): IContentResponse {
    return {
      id: content._id.toString(),
      userId: content.userId.toString(),
      title: content.title,
      contentType: content.contentType,
      prompt: content.prompt,
      generatedText: content.generatedText,
      status: content.status,
      jobId: content.jobId,
      generationStatus: content.generationStatus,
      failureReason: content.failureReason,
    };
  }

  // create new content
  async createContent(req: Request, res: Response): Promise<Response> {
    const userId = (req as any).user.userId; // from auth middleware
    const { title, contentType, prompt, generatedText, status } = req.body;

    // create content through service
    const content = await contentService.createContent({
      userId,
      title,
      contentType,
      prompt,
      generatedText,
      status,
    });

    const contentResponse: IContentResponse = this.transformContentToResponse(content);

    logger.info(`Content created successfully: ${content._id}`);

    return sendSuccess(
      res,
      contentResponse,
      'Content created successfully',
      HTTP_STATUS_CODES.CREATED
    );
  }


  // get content list for authenticated user
  async getUserContent(req: Request, res: Response): Promise<Response> {
    const userId = (req as any).user.userId;
    const { contentType, status, page, limit } = req.query;

    const filters = {
      contentType: contentType as string,
      status: status as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    };

    const result = await contentService.getUserContent(userId, filters);

    const contentResponses: IContentResponse[] = result.contents.map((content) =>
      this.transformContentToResponse(content)
    );

    return sendSuccess(
      res,
      {
        contents: contentResponses,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: filters.limit,
        },
      },
      'Contents retrieved successfully',
      HTTP_STATUS_CODES.OK
    );
  }


  // get content by ID
  async getContentById(req: Request, res: Response): Promise<Response> {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const content = await contentService.getContentById(id, userId);

    const contentResponse: IContentResponse = this.transformContentToResponse(content);

    return sendSuccess(res, contentResponse, 'Content retrieved successfully', HTTP_STATUS_CODES.OK);
  }

  // update content
  async updateContent(req: Request, res: Response): Promise<Response> {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const updateData: IContentUpdate = req.body;

    const content = await contentService.updateContent(id, userId, updateData);

    const contentResponse: IContentResponse = this.transformContentToResponse(content);

    logger.info(`Content updated successfully: ${id}`);

    return sendSuccess(res, contentResponse, 'Content updated successfully', HTTP_STATUS_CODES.OK);
  }

  // delete content
  async deleteContent(req: Request, res: Response): Promise<Response> {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    await contentService.deleteContent(id, userId);

    logger.info(`Content deleted successfully: ${id}`);

    return sendSuccess(res, null, 'Content deleted successfully', HTTP_STATUS_CODES.OK);
  }
}

// export singleton instance
export const contentController = new ContentController();
