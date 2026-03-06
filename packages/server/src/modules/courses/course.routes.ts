import { Router } from 'express';
import { courseController } from './course.controller.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { validateBody } from '../../shared/middleware/validate.js';
import {
  courseCreateSchema,
  courseUpdateSchema,
  lessonCreateSchema,
  USER_ROLES,
} from '@edusphere/shared';

const router = Router();

/**
 * @route   GET /api/v1/courses
 * @desc    Get all published courses with filters
 * @access  Public
 */
router.get('/', courseController.getCourses.bind(courseController));

/**
 * @route   GET /api/v1/courses/:courseId
 * @desc    Get course by ID
 * @access  Public (published) / Private (drafts - owner only)
 */
router.get('/:courseId', courseController.getCourseById.bind(courseController));

/**
 * @route   POST /api/v1/courses
 * @desc    Create a new course
 * @access  Private (Tutor only)
 */
router.post(
  '/',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  validateBody(courseCreateSchema),
  courseController.createCourse.bind(courseController)
);

/**
 * @route   PUT /api/v1/courses/:courseId
 * @desc    Update course
 * @access  Private (Owner only)
 */
router.put(
  '/:courseId',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  validateBody(courseUpdateSchema),
  courseController.updateCourse.bind(courseController)
);

/**
 * @route   DELETE /api/v1/courses/:courseId
 * @desc    Delete course (soft delete)
 * @access  Private (Owner only)
 */
router.delete(
  '/:courseId',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  courseController.deleteCourse.bind(courseController)
);

/**
 * @route   GET /api/v1/courses/:courseId/lessons
 * @desc    Get all lessons for a course
 * @access  Public (published courses) / Private (owner for drafts)
 */
router.get('/:courseId/lessons', courseController.getCourseLessons.bind(courseController));

/**
 * @route   POST /api/v1/courses/:courseId/lessons
 * @desc    Add a lesson to a course
 * @access  Private (Owner only)
 */
router.post(
  '/:courseId/lessons',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  validateBody(lessonCreateSchema),
  courseController.addLesson.bind(courseController)
);

export default router;
