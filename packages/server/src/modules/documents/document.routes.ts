import { Router } from 'express';
import { documentController } from './document.controller.js';
import { documentUpload } from './document.service.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { USER_ROLES } from '@edusphere/shared';

const router = Router();

/**
 * @route   POST /api/v1/documents/upload
 * @desc    Upload a PDF or Word document
 * @access  Private (Tutor only)
 */
router.post(
  '/upload',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  documentUpload.single('document'),
  documentController.uploadDocument.bind(documentController)
);

/**
 * @route   GET /api/v1/documents/my/uploads
 * @desc    Get current user's uploaded documents
 * @access  Private (Tutor only)
 */
router.get(
  '/my/uploads',
  authenticate,
  documentController.getUserDocuments.bind(documentController)
);

/**
 * @route   GET /api/v1/documents/:documentId
 * @desc    Serve/stream a document file
 * @access  Private
 */
router.get('/:documentId', authenticate, documentController.serveDocument.bind(documentController));

/**
 * @route   DELETE /api/v1/documents/:documentId
 * @desc    Delete a document
 * @access  Private (Owner only)
 */
router.delete(
  '/:documentId',
  authenticate,
  documentController.deleteDocument.bind(documentController)
);

export default router;
