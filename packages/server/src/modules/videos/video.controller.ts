import { Request, Response, NextFunction } from 'express';
import { videoService } from './video.service.js';
import { ApiResponse } from '@edusphere/shared';

export class VideoController {
  async uploadVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No video file provided',
            statusCode: 400,
          },
        });
        return;
      }

      const userId = req.user!.userId;
      const video = await videoService.createVideo(req.file, userId);

      const response: ApiResponse = {
        success: true,
        data: {
          videoId: video._id,
          filename: video.filename,
          originalName: video.originalName,
          size: video.size,
          cloudUrl: video.cloudUrl,
          status: video.status,
        },
        message: 'Video uploaded successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async uploadBulkVideos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No video files provided',
            statusCode: 400,
          },
        });
        return;
      }

      const userId = req.user!.userId;
      const videos = await videoService.createBulkVideos(files, userId);

      const response: ApiResponse = {
        success: true,
        data: {
          videos: videos.map((v) => ({
            videoId: v._id,
            filename: v.filename,
            originalName: v.originalName,
            size: v.size,
            cloudUrl: v.cloudUrl,
            status: v.status,
          })),
          count: videos.length,
        },
        message: `${videos.length} video(s) uploaded successfully`,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { videoId } = req.params;
      const video = await videoService.getVideoById(videoId);

      const response: ApiResponse = {
        success: true,
        data: { video },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async streamVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { videoId } = req.params;
      const userId = req.user!.userId;

      // Get Cloudinary URL – client streams directly from CDN (no server bandwidth used)
      const cloudUrl = await videoService.getVideoStreamUrl(videoId, userId);

      // 302 redirect to the Cloudinary CDN URL
      res.redirect(302, cloudUrl);
    } catch (error) {
      next(error);
    }
  }

  async deleteVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { videoId } = req.params;
      const userId = req.user!.userId;

      await videoService.deleteVideo(videoId, userId);

      const response: ApiResponse = {
        success: true,
        message: 'Video deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserVideos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const videos = await videoService.getUserVideos(userId);

      const response: ApiResponse = {
        success: true,
        data: { videos },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const videoController = new VideoController();
