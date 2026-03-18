import { LiveQuestionModel, ILiveQuestion } from './live-question.model.js';
import { LiveSessionModel } from './live-session.model.js';
import { NotFoundError, ValidationError } from '../../shared/utils/errors.js';

export class LiveQuestionService {
  async askQuestion(
    sessionId: string,
    userId: string,
    askerName: string,
    question: string
  ): Promise<ILiveQuestion> {
    const session = await LiveSessionModel.findById(sessionId);
    if (!session) throw new NotFoundError('Live session');
    if (session.status === 'ended') throw new ValidationError('This session has already ended.');
    if (!question.trim()) throw new ValidationError('Question cannot be empty.');

    return LiveQuestionModel.create({ sessionId, askedBy: userId, askerName, question });
  }

  async getSessionQuestions(sessionId: string): Promise<ILiveQuestion[]> {
    const results = await LiveQuestionModel.find({ sessionId })
      .sort({ upvotes: -1, createdAt: 1 })
      .lean();
    return results as unknown as ILiveQuestion[];
  }

  async answerQuestion(
    questionId: string,
    hostId: string,
    answer: string
  ): Promise<ILiveQuestion> {
    const q = await LiveQuestionModel.findById(questionId);
    if (!q) throw new NotFoundError('Question');
    if (!answer.trim()) throw new ValidationError('Answer cannot be empty.');

    q.answered = true;
    q.answer = answer;
    q.answeredBy = hostId as any;
    await q.save();
    return q;
  }

  async upvoteQuestion(questionId: string, userId: string): Promise<ILiveQuestion> {
    const q = await LiveQuestionModel.findById(questionId);
    if (!q) throw new NotFoundError('Question');

    const alreadyUpvoted = q.upvotedBy.some((id) => id.toString() === userId);
    if (alreadyUpvoted) {
      // Toggle off
      q.upvotedBy = q.upvotedBy.filter((id) => id.toString() !== userId) as any;
      q.upvotes = Math.max(0, q.upvotes - 1);
    } else {
      q.upvotedBy.push(userId as any);
      q.upvotes += 1;
    }
    await q.save();
    return q;
  }
}

export const liveQuestionService = new LiveQuestionService();
