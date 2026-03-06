import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
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
          status: video.status,
        },
        message: 'Video uploaded successfully',
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

      const videoPath = await videoService.getVideoPath(videoId, userId);

      // Get file stats
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        // Parse range header
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        // Create read stream
        const stream = fs.createReadStream(videoPath, { start, end });

        // Set headers for partial content
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
        });

        stream.pipe(res);
      } else {
        // No range, send entire file
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        });

        fs.createReadStream(videoPath).pipe(res);
      }
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
