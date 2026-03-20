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

  /**
   * GET /api/v1/videos/sign-upload
   * Returns a Cloudinary signed-upload signature so the browser can upload
   * the binary directly to Cloudinary CDN (skipping this server entirely).
   */
  async signUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const signData = videoService.generateUploadSignature(userId);
      res.json({ success: true, data: signData });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/videos/confirm
   * Called by the browser after a successful direct Cloudinary upload.
   * Saves Cloudinary metadata to MongoDB and returns the videoId.
   */
  async confirmUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { cloudinaryId, secureUrl, originalName, size, mimetype } = req.body as {
        cloudinaryId: string;
        secureUrl: string;
        originalName: string;
        size: number;
        mimetype: string;
      };

      if (!cloudinaryId || !secureUrl || !originalName) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields', statusCode: 400 },
        });
        return;
      }

      const video = await videoService.confirmVideoUpload({ cloudinaryId, secureUrl, originalName, size, mimetype, userId });

      res.status(201).json({
        success: true,
        data: {
          videoId: video._id,
          filename: video.filename,
          originalName: video.originalName,
          size: video.size,
          cloudUrl: video.cloudUrl,
          status: video.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const videoController = new VideoController();
