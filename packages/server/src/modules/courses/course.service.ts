import { CourseModel, ICourse } from './course.model.js';
import { LessonModel, ILesson } from './lesson.model.js';
import { UserModel } from '../users/user.model.js';
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
  ConflictError,
} from '../../shared/utils/errors.js';
import {
  CourseCreateInput,
  CourseUpdateInput,
  CourseFilters,
  COURSE_STATUS,
} from '@edusphere/shared';

export class CourseService {
  async createCourse(instructorId: string, input: CourseCreateInput): Promise<ICourse> {
    // Get instructor details
    const instructor = await UserModel.findById(instructorId);
    if (!instructor) {
      throw new NotFoundError('Instructor');
    }

    // Generate unique slug
    const slug = await this.generateSlug(input.title);

    // Create course
    const course = await CourseModel.create({
      ...input,
      slug,
      instructorId,
      instructorName: `${instructor.profile.firstName} ${instructor.profile.lastName}`,
      status: COURSE_STATUS.DRAFT,
    });

    return course;
  }

  async getCourseById(courseId: string, userId?: string): Promise<ICourse> {
    const course = await CourseModel.findById(courseId).populate('instructor', 'profile email');

    if (!course) {
      throw new NotFoundError('Course');
    }

    // Check if course is published or user is the owner
    if (
      course.status !== COURSE_STATUS.PUBLISHED &&
      (!userId || course.instructorId.toString() !== userId)
    ) {
      throw new NotFoundError('Course');
    }

    return course;
  }

  async getCourses(filters: CourseFilters) {
    const {
      category,
      level,
      search,
      instructorId,
      minPrice,
      maxPrice,
      tags,
      page = 1,
      limit = 10,
    } = filters;

    const query: any = {
      status: COURSE_STATUS.PUBLISHED,
    };

    if (category) query.category = category;
    if (level) query.level = level;
    if (instructorId) query.instructorId = instructorId;

    if (minPrice !== undefined || maxPrice !== undefined) {
      query['pricing.amount'] = {};
      if (minPrice !== undefined) query['pricing.amount'].$gte = minPrice;
      if (maxPrice !== undefined) query['pricing.amount'].$lte = maxPrice;
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [courses, totalItems] = await Promise.all([
      CourseModel.find(query)
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('instructor', 'profile email'),
      CourseModel.countDocuments(query),
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        hasMore: page * limit < totalItems,
      },
    };
  }

  async updateCourse(
    courseId: string,
    instructorId: string,
    input: CourseUpdateInput
  ): Promise<ICourse> {
    const course = await CourseModel.findById(courseId);

    if (!course) {
      throw new NotFoundError('Course');
    }

    // Check ownership
    if (course.instructorId.toString() !== instructorId) {
      throw new AuthorizationError('You can only update your own courses');
    }

    // Update slug if title changes
    if (input.title && input.title !== course.title) {
      course.slug = await this.generateSlug(input.title);
    }

    Object.assign(course, input);
    await course.save();

    return course;
  }

  async deleteCourse(courseId: string, instructorId: string): Promise<void> {
    const course = await CourseModel.findById(courseId);

    if (!course) {
      throw new NotFoundError('Course');
    }

    // Check ownership
    if (course.instructorId.toString() !== instructorId) {
      throw new AuthorizationError('You can only delete your own courses');
    }

    // Soft delete by setting status to archived
    course.status = COURSE_STATUS.ARCHIVED;
    await course.save();
    
    // Or hard delete:
    // await CourseModel.findByIdAndDelete(courseId);
    // await LessonModel.deleteMany({ courseId });
  }

  async getCourseLessons(courseId: string, userId?: string): Promise<ILesson[]> {
    const course = await CourseModel.findById(courseId);

    if (!course) {
      throw new NotFoundError('Course');
    }

    // Check if user can access the course
    const isOwner = userId && course.instructorId.toString() === userId;
    const isPublished = course.status === COURSE_STATUS.PUBLISHED;

    if (!isOwner && !isPublished) {
      throw new NotFoundError('Course');
    }

    const lessons = await LessonModel.find({ courseId }).sort({ order: 1 });

    return lessons;
  }

  async addLesson(
    courseId: string,
    instructorId: string,
    lessonData: Partial<ILesson>
  ): Promise<ILesson> {
    const course = await CourseModel.findById(courseId);

    if (!course) {
      throw new NotFoundError('Course');
    }

    // Check ownership
    if (course.instructorId.toString() !== instructorId) {
      throw new AuthorizationError('You can only add lessons to your own courses');
    }

    // Check if order already exists
    const existingLesson = await LessonModel.findOne({
      courseId,
      order: lessonData.order,
    });

    if (existingLesson) {
      throw new ConflictError('A lesson with this order already exists');
    }

    const lesson = await LessonModel.create({
      ...lessonData,
      courseId,
    });

    // Update course stats
    course.lessonIds.push(lesson._id as any);
    course.stats.totalLessons += 1;
    course.stats.totalDuration += lesson.duration || 0;
    await course.save();

    return lesson;
  }

  private async generateSlug(title: string): Promise<string> {
    let slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    // Check for uniqueness
    let counter = 0;
    let uniqueSlug = slug;

    while (await CourseModel.findOne({ slug: uniqueSlug })) {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    return uniqueSlug;
  }
}

export const courseService = new CourseService();
