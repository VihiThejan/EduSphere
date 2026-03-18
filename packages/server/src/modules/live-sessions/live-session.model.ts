import mongoose, { Schema, Document, Model } from 'mongoose';

export type LiveSessionStatus = 'scheduled' | 'live' | 'ended';

export interface ILiveSession extends Document {
  title: string;
  description?: string;
  courseId?: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  /** Daily.co room name (slug) */
  roomName: string;
  /** Full Daily.co room URL  e.g. https://your-domain.daily.co/room-name */
  roomUrl: string;
  status: LiveSessionStatus;
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  maxParticipants: number;
  createdAt: Date;
  updatedAt: Date;
}

const liveSessionSchema = new Schema<ILiveSession>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roomName: { type: String, required: true, unique: true },
    roomUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended'],
      default: 'scheduled',
    },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    endedAt: { type: Date },
    maxParticipants: { type: Number, default: 50, min: 2 },
  },
  { timestamps: true }
);

export const LiveSessionModel: Model<ILiveSession> = mongoose.model<ILiveSession>(
  'LiveSession',
  liveSessionSchema
);
