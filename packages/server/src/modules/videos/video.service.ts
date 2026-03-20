import { Readable } from 'stream';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { VideoModel, IVideo } from './video.model.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../../shared/utils/errors.js';
import { config } from '../../config/index.js';
import { VIDEO_STATUS } from '@edusphere/shared';

// ── configure Cloudinary once at module load ──────────────────────────────────
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key:    config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure:     true,
});

// ── helper: stream a Buffer up to Cloudinary ─────────────────────────────────
function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId: string
): Promise<{ publicId: string; secureUrl: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder,
        public_id: publicId,
        // No eager transformations — raw storage is near-instant
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve({ publicId: result.public_id, secureUrl: result.secure_url });
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

// ── service ───────────────────────────────────────────────────────────────────
export class VideoService {
  private get folder() {
    return config.cloudinary.folder;
  }

  async createVideo(file: Express.Multer.File, userId: string): Promise<IVideo> {
    const publicId = `video-${userId}-${Date.now()}`;
    const { publicId: cloudinaryId, secureUrl: cloudUrl } = await uploadToCloudinary(
      file.buffer,
      this.folder,
      publicId
    );

    return VideoModel.create({
      filename:     cloudinaryId,
      originalName: file.originalname,
      cloudinaryId,
      cloudUrl,
      mimetype:   file.mimetype,
      size:       file.size,
      uploadedBy: userId,
      status:     VIDEO_STATUS.READY,
    });
  }

  async createBulkVideos(files: Express.Multer.File[], userId: string): Promise<IVideo[]> {
    const docs = await Promise.all(
      files.map((file, i) => {
        const publicId = `video-${userId}-${Date.now()}-${i}`;
        return uploadToCloudinary(file.buffer, this.folder, publicId).then((cloud) => ({
          filename:     cloud.publicId,
          originalName: file.originalname,
          cloudinaryId: cloud.publicId,
          cloudUrl:     cloud.secureUrl,
          mimetype:     file.mimetype,
          size:         file.size,
          uploadedBy:   userId,
          status:       VIDEO_STATUS.READY,
        }));
      })
    );
    return VideoModel.insertMany(docs) as unknown as Promise<IVideo[]>;
  }

  async getVideoById(videoId: string): Promise<IVideo> {
    const video = await VideoModel.findById(videoId);
    if (!video) throw new NotFoundError('Video');
    return video;
  }

  /** Returns the Cloudinary HTTPS URL so the client can stream directly from CDN. */
  async getVideoStreamUrl(videoId: string, userId: string): Promise<string> {
    const video = await VideoModel.findById(videoId).populate('uploadedBy');
    if (!video) throw new NotFoundError('Video');

    // TODO: replace with enrollment check
    if (video.uploadedBy.toString() !== userId) {
      throw new AuthorizationError('You do not have access to this video');
    }

    if (video.cloudUrl) return video.cloudUrl;
    throw new NotFoundError('Video stream URL not available');
  }

  async deleteVideo(videoId: string, userId: string): Promise<void> {
    const video = await VideoModel.findById(videoId);
    if (!video) throw new NotFoundError('Video');

    if (video.uploadedBy.toString() !== userId) {
      throw new AuthorizationError('You can only delete your own videos');
    }

    if (video.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(video.cloudinaryId, { resource_type: 'video' });
      } catch (err) {
        console.error('Cloudinary delete error:', err);
      }
    }

    await VideoModel.findByIdAndDelete(videoId);
  }

  async getUserVideos(userId: string): Promise<IVideo[]> {
    return VideoModel.find({ uploadedBy: userId }).sort({ createdAt: -1 });
  }

  // ── Direct upload helpers ─────────────────────────────────────────────────

  /**
   * Generate a signed upload signature so the browser can POST directly to
   * Cloudinary without routing the binary through this server.
   */
  generateUploadSignature(userId: string): {
    signature: string;
    timestamp: number;
    publicId: string;
    apiKey: string;
    cloudName: string;
    folder: string;
  } {
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `video-${userId}-${timestamp}`;
    const folder = this.folder;

    const paramsToSign: Record<string, string | number> = { folder, public_id: publicId, timestamp };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, config.cloudinary.apiSecret);

    return { signature, timestamp, publicId, apiKey: config.cloudinary.apiKey, cloudName: config.cloudinary.cloudName, folder };
  }

  /**
   * Called after the browser finishes a direct Cloudinary upload.
   * Saves only the metadata returned by Cloudinary to MongoDB.
   */
  async confirmVideoUpload(data: {
    cloudinaryId: string;
    secureUrl: string;
    originalName: string;
    size: number;
    mimetype: string;
    userId: string;
  }): Promise<IVideo> {
    return VideoModel.create({
      filename:     data.cloudinaryId,
      originalName: data.originalName,
      cloudinaryId: data.cloudinaryId,
      cloudUrl:     data.secureUrl,
      mimetype:     data.mimetype,
      size:         data.size,
      uploadedBy:   data.userId,
      status:       VIDEO_STATUS.READY,
    });
  }
}

export const videoService = new VideoService();

// ── Multer: memory storage – files are buffered, then pushed to Cloudinary ────
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new ValidationError('Invalid file type. Only video files are allowed.'));
};

export const videoUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});
