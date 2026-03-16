import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDocument extends Document {
  filename: string;
  originalName: string;
  filepath: string;
  mimetype: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
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
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel: Model<IDocument> = mongoose.model<IDocument>('Document', documentSchema);
