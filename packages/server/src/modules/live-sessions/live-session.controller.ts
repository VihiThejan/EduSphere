import { Request, Response, NextFunction } from 'express';
import { liveSessionService } from './live-session.service.js';
import { ApiResponse } from '@edusphere/shared';

export class LiveSessionController {
  /** POST /api/v1/live-sessions — tutor creates a new session */
  async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hostId = req.user!.userId;
      const { title, description, courseId, scheduledAt, maxParticipants } = req.body as {
        title: string;
        description?: string;
        courseId?: string;
        scheduledAt?: string;
        maxParticipants?: number;
      };

      const session = await liveSessionService.createSession(hostId, title, {
        description,
        courseId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        maxParticipants,
      });

      const response: ApiResponse = {
        success: true,
        data: { session },
        message: 'Live session created.',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/live-sessions/:sessionId/join — get token + room URL */
  async joinSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { sessionId } = req.params;
      const isHost = req.query.host === 'true';

      const { session, token } = await liveSessionService.joinSession(
        sessionId,
        userId,
        isHost
      );

      const response: ApiResponse = {
        success: true,
        data: {
          roomUrl: session.roomUrl,
          token,
          sessionId: session._id,
          title: session.title,
          status: session.status,
        },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/v1/live-sessions/:sessionId/end — host ends a session */
  async endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hostId = req.user!.userId;
      const { sessionId } = req.params;

      const session = await liveSessionService.endSession(sessionId, hostId);

      const response: ApiResponse = {
        success: true,
        data: { session },
        message: 'Live session ended.',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/live-sessions/my/hosted — tutor's own sessions */
  async getHostedSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hostId = req.user!.userId;
      const sessions = await liveSessionService.getSessionsByHost(hostId);

      const response: ApiResponse = { success: true, data: { sessions } };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/live-sessions/course/:courseId — sessions for a course */
  async getCourseSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const sessions = await liveSessionService.getSessionsByCourse(courseId);

      const response: ApiResponse = { success: true, data: { sessions } };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/live-sessions — all upcoming/live sessions (students browse) */
  async getAllActiveSessions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await liveSessionService.getAllActiveSessions();

      const response: ApiResponse = { success: true, data: { sessions } };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const liveSessionController = new LiveSessionController();
