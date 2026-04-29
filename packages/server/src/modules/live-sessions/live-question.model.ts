import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILiveQuestion extends Document {
  sessionId: mongoose.Types.ObjectId;
  askedBy: mongoose.Types.ObjectId;
  askerName: string;
  question: string;
  answered: boolean;
  answer?: string;
  answeredBy?: mongoose.Types.ObjectId;
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const liveQuestionSchema = new Schema<ILiveQuestion>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'LiveSession', required: true, index: true },
    askedBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    askerName: { type: String, required: true },
    question:  { type: String, required: true, trim: true, maxlength: 500 },
    answered:  { type: Boolean, default: false },
    answer:    { type: String, trim: true },
    answeredBy:{ type: Schema.Types.ObjectId, ref: 'User' },
    upvotes:   { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const LiveQuestionModel: Model<ILiveQuestion> = mongoose.model<ILiveQuestion>(
  'LiveQuestion',
  liveQuestionSchema
);
