import mongoose, { Schema, Document, Model } from 'mongoose';
import { VideoStatus, VIDEO_STATUS } from '@edusphere/shared';

export interface IVideo extends Document {
  filename: string;
  originalName: string;
  filepath: string;
  mimetype: string;
  size: number;
  duration?: number;
  uploadedBy: mongoose.Types.ObjectId;
  status: VideoStatus;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filepath: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      min: 0,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(VIDEO_STATUS),
      default: VIDEO_STATUS.READY,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying videos by uploader
videoSchema.index({ uploadedBy: 1, createdAt: -1 });

export const VideoModel: Model<IVideo> = mongoose.model<IVideo>('Video', videoSchema);
