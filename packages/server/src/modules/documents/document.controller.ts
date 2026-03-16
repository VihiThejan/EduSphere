import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { documentService } from './document.service.js';
import { ApiResponse } from '@edusphere/shared';

export class DocumentController {
  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'No document file provided', statusCode: 400 },
        });
        return;
      }

      const userId = req.user!.userId;
      const courseId = req.body.courseId as string | undefined;

      const doc = await documentService.createDocument(req.file, userId, courseId);

      const response: ApiResponse = {
        success: true,
        data: {
          documentId: doc._id,
          filename: doc.filename,
          originalName: doc.originalName,
          size: doc.size,
          mimetype: doc.mimetype,
        },
        message: 'Document uploaded successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const userId = req.user!.userId;
      await documentService.deleteDocument(documentId, userId);

      res.status(200).json({ success: true, message: 'Document deleted' });
    } catch (error) {
      next(error);
    }
  }

  async getUserDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const docs = await documentService.getUserDocuments(userId);

      res.status(200).json({ success: true, data: { documents: docs } });
    } catch (error) {
      next(error);
    }
  }

  async serveDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const doc = await documentService.getDocumentById(documentId);

      if (!fs.existsSync(doc.filepath)) {
        res.status(404).json({ success: false, error: { message: 'File not found on disk' } });
        return;
      }

      res.setHeader('Content-Type', doc.mimetype);
      res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
      fs.createReadStream(doc.filepath).pipe(res);
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
