import Stripe from 'stripe';
import { CourseModel } from '../courses/course.model.js';
import { enrollmentService } from './enrollment.service.js';
import { config } from '../../config/index.js';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../../shared/utils/errors.js';
import { COURSE_STATUS, ENROLLMENT_STATUS } from '@edusphere/shared';
import { EnrollmentModel } from './enrollment.model.js';
import { logger } from '../../shared/utils/logger.js';

export interface CoursePaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  courseTitle: string;
  isFree: boolean;
}

export class EnrollmentCheckoutService {
  private stripe: Stripe | null = null;

  private getStripeClient(): Stripe {
    if (!config.stripe.secretKey) {
      throw new ValidationError('Stripe is not configured');
    }
    if (!this.stripe) {
      this.stripe = new Stripe(config.stripe.secretKey);
    }
    return this.stripe;
  }

  /**
   * Initiate checkout for a course.
   * - Free courses: enroll immediately, return isFree=true.
   * - Paid courses: create a Stripe PaymentIntent and return clientSecret.
   */
  async initiateCourseCheckout(
    userId: string,
    courseId: string
  ): Promise<CoursePaymentIntentResult> {
    const course = await CourseModel.findById(courseId);
    if (!course) throw new NotFoundError('Course');
    if (course.status !== COURSE_STATUS.PUBLISHED) {
      throw new ValidationError('Cannot enroll in an unpublished course');
    }

    // Check already enrolled
    const existing = await EnrollmentModel.findOne({ userId, courseId });
    if (existing && existing.status === ENROLLMENT_STATUS.ACTIVE) {
      throw new ConflictError('Already enrolled in this course');
    }

    const amount = course.pricing?.amount ?? 0;

    // Free course — just enroll directly
    if (amount === 0) {
      await enrollmentService.enrollInCourse(userId, courseId);
      return {
        clientSecret: '',
        paymentIntentId: '',
        amount: 0,
        currency: 'LKR',
        courseTitle: course.title,
        isFree: true,
      };
    }

    // Paid course — create Stripe PaymentIntent
    const stripe = this.getStripeClient();
    // Stripe requires amount in smallest currency unit (cents).
    // LKR doesn't have sub-units in Stripe, amount is already in LKR.
    const amountCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'lkr',
      metadata: {
        type: 'course_enrollment',
        userId,
        courseId,
        courseTitle: course.title,
      },
      automatic_payment_methods: { enabled: true },
    });

    if (!paymentIntent.client_secret) {
      throw new ValidationError('Failed to create payment intent');
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: 'LKR',
      courseTitle: course.title,
      isFree: false,
    };
  }

  /**
   * Called by the Stripe webhook when a course-enrollment payment succeeds.
   */
  async handleCoursePaymentSuccess(paymentIntentId: string): Promise<void> {
    try {
      const stripe = this.getStripeClient();
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const { type, userId, courseId } = intent.metadata;
      if (type !== 'course_enrollment' || !userId || !courseId) return;

      // Idempotency guard
      const existing = await EnrollmentModel.findOne({ userId, courseId });
      if (existing && existing.status === ENROLLMENT_STATUS.ACTIVE) {
        logger.info('Course enrollment already exists, skipping', { userId, courseId });
        return;
      }

      await enrollmentService.enrollInCourse(userId, courseId);
      logger.info('Course enrollment created after payment', { userId, courseId });
    } catch (err) {
      logger.error('Failed to process course enrollment after payment', { paymentIntentId, err });
    }
  }
}

export const enrollmentCheckoutService = new EnrollmentCheckoutService();
