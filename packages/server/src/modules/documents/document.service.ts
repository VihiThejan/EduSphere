import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import { DocumentModel, IDocument } from './document.model.js';
import { NotFoundError, AuthorizationError } from '../../shared/utils/errors.js';
import { config } from '../../config/index.js';

export class DocumentService {
  async createDocument(
    file: Express.Multer.File,
    userId: string,
    courseId?: string
  ): Promise<IDocument> {
    const doc = await DocumentModel.create({
      filename: file.filename,
      originalName: file.originalname,
      filepath: file.path,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: userId,
      ...(courseId && { courseId }),
    });

    return doc;
  }

  async getDocumentById(documentId: string): Promise<IDocument> {
    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      throw new NotFoundError('Document');
    }
    return doc;
  }

  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      throw new NotFoundError('Document');
    }
    if (doc.uploadedBy.toString() !== userId) {
      throw new AuthorizationError('You can only delete your own documents');
    }

    try {
      await fs.unlink(doc.filepath);
    } catch {
      // File may already be gone; proceed to remove DB record
    }

    await DocumentModel.findByIdAndDelete(documentId);
  }

  async getUserDocuments(userId: string): Promise<IDocument[]> {
    return DocumentModel.find({ uploadedBy: userId }).sort({ createdAt: -1 });
  }

  async getCourseDocuments(courseId: string): Promise<IDocument[]> {
    return DocumentModel.find({ courseId }).sort({ createdAt: -1 });
  }
}

export const documentService = new DocumentService();

// ---- Multer configuration ----
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), config.upload.uploadDir, 'documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error: unknown) {
      cb(error instanceof Error ? error : new Error(String(error)), uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed'));
  }
};

export const documentUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});
