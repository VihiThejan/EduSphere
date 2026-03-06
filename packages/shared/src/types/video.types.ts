import { VideoStatus } from '../constants/status';

export interface Video {
  _id: string;
  filename: string;
  originalName: string;
  filepath: string;
  mimetype: string;
  size: number; // in bytes
  duration?: number; // in seconds
  uploadedBy: string;
  status: VideoStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoUploadResponse {
  videoId: string;
  filename: string;
  size: number;
  status: VideoStatus;
}

export interface VideoAccessToken {
  videoId: string;
  userId: string;
  expiresAt: Date;
}
