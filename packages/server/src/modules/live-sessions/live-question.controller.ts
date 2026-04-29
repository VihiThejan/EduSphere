import { Request, Response, NextFunction } from 'express';
import { liveQuestionService } from './live-question.service.js';
import { ApiResponse } from '@edusphere/shared';

export class LiveQuestionController {
  /** POST /api/v1/live-sessions/:sessionId/questions */
  async ask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.userId;
      const { question } = req.body as { question: string };
      const askerName =
        (req.user as any).firstName
          ? `${(req.user as any).firstName} ${(req.user as any).lastName ?? ''}`.trim()
          : 'Anonymous';

      const q = await liveQuestionService.askQuestion(sessionId, userId, askerName, question);
      const response: ApiResponse = { success: true, data: { question: q }, message: 'Question submitted.' };
      res.status(201).json(response);
    } catch (error) { next(error); }
  }

  /** GET /api/v1/live-sessions/:sessionId/questions */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const questions = await liveQuestionService.getSessionQuestions(sessionId);
      res.status(200).json({ success: true, data: { questions } });
    } catch (error) { next(error); }
  }

  /** PATCH /api/v1/live-sessions/:sessionId/questions/:questionId/answer */
  async answer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questionId } = req.params;
      const hostId = req.user!.userId;
      const { answer } = req.body as { answer: string };
      const q = await liveQuestionService.answerQuestion(questionId, hostId, answer);
      res.status(200).json({ success: true, data: { question: q } });
    } catch (error) { next(error); }
  }

  /** POST /api/v1/live-sessions/:sessionId/questions/:questionId/upvote */
  async upvote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questionId } = req.params;
      const userId = req.user!.userId;
      const q = await liveQuestionService.upvoteQuestion(questionId, userId);
      res.status(200).json({ success: true, data: { question: q } });
    } catch (error) { next(error); }
  }
}

export const liveQuestionController = new LiveQuestionController();
