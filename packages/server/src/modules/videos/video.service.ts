import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import { VideoModel, IVideo } from './video.model.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../../shared/utils/errors.js';
import { config } from '../../config/index.js';
import { VIDEO_STATUS } from '@edusphere/shared';

export class VideoService {
  async createVideo(file: Express.Multer.File, userId: string): Promise<IVideo> {
    const video = await VideoModel.create({
      filename: file.filename,
      originalName: file.originalname,
      filepath: file.path,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: userId,
      status: VIDEO_STATUS.READY,
    });

    return video;
  }

  async createBulkVideos(files: Express.Multer.File[], userId: string): Promise<IVideo[]> {
    const docs = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      filepath: file.path,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: userId,
      status: VIDEO_STATUS.READY,
    }));

    const videos = await VideoModel.insertMany(docs);
    return videos as unknown as IVideo[];
  }

  async getVideoById(videoId: string): Promise<IVideo> {
    const video = await VideoModel.findById(videoId);

    if (!video) {
      throw new NotFoundError('Video');
    }

    return video;
  }

  async getVideoPath(videoId: string, userId: string): Promise<string> {
    const video = await VideoModel.findById(videoId).populate('uploadedBy');

    if (!video) {
      throw new NotFoundError('Video');
    }

    // TODO: Add enrollment check here
    // For now, only allow video owner to access
    if (video.uploadedBy.toString() !== userId) {
      throw new AuthorizationError('You do not have access to this video');
    }

    return video.filepath;
  }

  async deleteVideo(videoId: string, userId: string): Promise<void> {
    const video = await VideoModel.findById(videoId);

    if (!video) {
      throw new NotFoundError('Video');
    }

    // Check ownership
    if (video.uploadedBy.toString() !== userId) {
      throw new AuthorizationError('You can only delete your own videos');
    }

    // Delete file from filesystem
    try {
      await fs.unlink(video.filepath);
    } catch (error) {
      // File might already be deleted, log but don't throw
      console.error('Error deleting video file:', error);
    }

    // Delete from database
    await VideoModel.findByIdAndDelete(videoId);
  }

  async getUserVideos(userId: string) {
    const videos = await VideoModel.find({ uploadedBy: userId }).sort({ createdAt: -1 });
    return videos;
  }
}

export const videoService = new VideoService();

// Multer configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), config.upload.uploadDir, 'videos');
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error: any) {
      cb(error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file type. Only video files are allowed.'));
  }
};

export const videoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});
