import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { User } from '../modules/users/user.model';
import { Course } from '../modules/courses/course.model';
import { Lesson } from '../modules/courses/lesson.model';
import { Video } from '../modules/videos/video.model';
import { USER_ROLES, COURSE_STATUS, VIDEO_STATUS, COURSE_LEVELS, COURSE_CATEGORIES } from '@edusphere/shared';
import logger from '../shared/utils/logger';

/**
 * Seed script to populate the database with sample data for development
 * Run with: npm run seed
 */

async function clearDatabase() {
  logger.info('🧹 Clearing existing data...');
  await User.deleteMany({});
  await Course.deleteMany({});
  await Lesson.deleteMany({});
  await Video.deleteMany({});
  logger.info('✅ Database cleared');
}

async function seedUsers() {
  logger.info('👥 Seeding users...');

  const hashedPassword = await bcrypt.hash('Test1234', 10);

  const users = await User.create([
    {
      email: 'admin@edusphere.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      roles: [USER_ROLES.ADMIN, USER_ROLES.TUTOR],
      bio: 'Platform administrator',
    },
    {
      email: 'john.tutor@edusphere.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Smith',
      roles: [USER_ROLES.TUTOR],
      bio: 'Experienced web developer and instructor with 10+ years in full-stack development.',
    },
    {
      email: 'sarah.tutor@edusphere.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      roles: [USER_ROLES.TUTOR],
      bio: 'Data Science expert and university lecturer specializing in Machine Learning.',
    },
    {
      email: 'mike.student@edusphere.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Davis',
      roles: [USER_ROLES.STUDENT],
      bio: 'Computer Science student passionate about learning new technologies.',
    },
    {
      email: 'emma.student@edusphere.com',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'Wilson',
      roles: [USER_ROLES.STUDENT],
      bio: 'Business student interested in technology and entrepreneurship.',
    },
    {
      email: 'alex.student@edusphere.com',
      password: hashedPassword,
      firstName: 'Alex',
      lastName: 'Brown',
      roles: [USER_ROLES.STUDENT],
      bio: 'Engineering student focused on software development and AI.',
    },
  ]);

  logger.info(`✅ Created ${users.length} users`);
  return users;
}

async function seedCourses(users: any[]) {
  logger.info('📚 Seeding courses...');

  const [admin, johnTutor, sarahTutor] = users;

  const courses = await Course.create([
    {
      title: 'Full-Stack Web Development with MERN Stack',
      description: 'Learn to build modern web applications using MongoDB, Express, React, and Node.js. This comprehensive course covers everything from basics to advanced topics.',
      instructorId: johnTutor._id,
      instructorName: `${johnTutor.firstName} ${johnTutor.lastName}`,
      category: COURSE_CATEGORIES.PROGRAMMING,
      level: COURSE_LEVELS.INTERMEDIATE,
      status: COURSE_STATUS.PUBLISHED,
      thumbnail: 'https://picsum.photos/seed/mern/800/450',
      tags: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'Full-Stack'],
      pricing: {
        type: 'paid',
        amount: 49.99,
        currency: 'USD',
      },
    },
    {
      title: 'Introduction to Python Programming',
      description: 'A beginner-friendly course to learn Python from scratch. Perfect for students with no programming experience.',
      instructorId: sarahTutor._id,
      instructorName: `${sarahTutor.firstName} ${sarahTutor.lastName}`,
      category: COURSE_CATEGORIES.PROGRAMMING,
      level: COURSE_LEVELS.BEGINNER,
      status: COURSE_STATUS.PUBLISHED,
      thumbnail: 'https://picsum.photos/seed/python/800/450',
      tags: ['Python', 'Programming', 'Beginner', 'Fundamentals'],
      pricing: {
        type: 'free',
      },
    },
    {
      title: 'Machine Learning Fundamentals',
      description: 'Dive into the world of Machine Learning. Learn algorithms, data preprocessing, model training, and evaluation.',
      instructorId: sarahTutor._id,
      instructorName: `${sarahTutor.firstName} ${sarahTutor.lastName}`,
      category: COURSE_CATEGORIES.DATA_SCIENCE,
      level: COURSE_LEVELS.ADVANCED,
      status: COURSE_STATUS.PUBLISHED,
      thumbnail: 'https://picsum.photos/seed/ml/800/450',
      tags: ['Machine Learning', 'AI', 'Python', 'Data Science', 'Algorithms'],
      pricing: {
        type: 'paid',
        amount: 79.99,
        currency: 'USD',
      },
    },
    {
      title: 'Microeconomics for Business Students',
      description: 'Understanding economic principles, market dynamics, and decision-making strategies for business applications.',
      instructorId: johnTutor._id,
      instructorName: `${johnTutor.firstName} ${johnTutor.lastName}`,
      category: COURSE_CATEGORIES.BUSINESS,
      level: COURSE_LEVELS.BEGINNER,
      status: COURSE_STATUS.PUBLISHED,
      thumbnail: 'https://picsum.photos/seed/econ/800/450',
      tags: ['Economics', 'Business', 'Markets', 'Theory'],
      pricing: {
        type: 'paid',
        amount: 39.99,
        currency: 'USD',
      },
    },
    {
      title: 'React Advanced Patterns and Best Practices',
      description: 'Take your React skills to the next level with advanced patterns, performance optimization, and architectural best practices.',
      instructorId: johnTutor._id,
      instructorName: `${johnTutor.firstName} ${johnTutor.lastName}`,
      category: COURSE_CATEGORIES.PROGRAMMING,
      level: COURSE_LEVELS.ADVANCED,
      status: COURSE_STATUS.PUBLISHED,
      thumbnail: 'https://picsum.photos/seed/react/800/450',
      tags: ['React', 'JavaScript', 'Advanced', 'Patterns', 'Performance'],
      pricing: {
        type: 'paid',
        amount: 59.99,
        currency: 'USD',
      },
    },
  ]);

  logger.info(`✅ Created ${courses.length} courses`);
  return courses;
}

async function seedLessons(courses: any[]) {
  logger.info('📝 Seeding lessons...');

  const lessons = [];

  // Lessons for MERN Stack Course
  const mernLessons = await Lesson.create([
    {
      courseId: courses[0]._id,
      title: 'Introduction to MERN Stack',
      description: 'Overview of MongoDB, Express, React, and Node.js ecosystem',
      order: 1,
      duration: 900, // 15 minutes
    },
    {
      courseId: courses[0]._id,
      title: 'Setting Up Development Environment',
      description: 'Installing Node.js, MongoDB, and essential tools',
      order: 2,
      duration: 1200, // 20 minutes
    },
    {
      courseId: courses[0]._id,
      title: 'Building RESTful APIs with Express',
      description: 'Creating robust backend APIs with Express and MongoDB',
      order: 3,
      duration: 2400, // 40 minutes
    },
    {
      courseId: courses[0]._id,
      title: 'React Fundamentals',
      description: 'Components, props, state, and hooks in React',
      order: 4,
      duration: 1800, // 30 minutes
    },
    {
      courseId: courses[0]._id,
      title: 'Connecting Frontend to Backend',
      description: 'Making API calls and managing application state',
      order: 5,
      duration: 2100, // 35 minutes
    },
  ]);
  lessons.push(...mernLessons);

  // Lessons for Python Course
  const pythonLessons = await Lesson.create([
    {
      courseId: courses[1]._id,
      title: 'Python Installation and Setup',
      description: 'Getting started with Python on your system',
      order: 1,
      duration: 600, // 10 minutes
    },
    {
      courseId: courses[1]._id,
      title: 'Variables and Data Types',
      description: 'Understanding Python data types and variables',
      order: 2,
      duration: 900, // 15 minutes
    },
    {
      courseId: courses[1]._id,
      title: 'Control Flow and Loops',
      description: 'If statements, for loops, and while loops',
      order: 3,
      duration: 1200, // 20 minutes
    },
  ]);
  lessons.push(...pythonLessons);

  // Lessons for ML Course
  const mlLessons = await Lesson.create([
    {
      courseId: courses[2]._id,
      title: 'What is Machine Learning?',
      description: 'Introduction to ML concepts and applications',
      order: 1,
      duration: 1200, // 20 minutes
    },
    {
      courseId: courses[2]._id,
      title: 'Data Preprocessing Techniques',
      description: 'Cleaning and preparing data for ML models',
      order: 2,
      duration: 1800, // 30 minutes
    },
    {
      courseId: courses[2]._id,
      title: 'Supervised Learning Algorithms',
      description: 'Linear regression, decision trees, and more',
      order: 3,
      duration: 2400, // 40 minutes
    },
  ]);
  lessons.push(...mlLessons);

  // Lessons for Economics Course
  const econLessons = await Lesson.create([
    {
      courseId: courses[3]._id,
      title: 'Supply and Demand',
      description: 'Understanding market equilibrium',
      order: 1,
      duration: 1500, // 25 minutes
    },
    {
      courseId: courses[3]._id,
      title: 'Consumer Behavior',
      description: 'How consumers make purchasing decisions',
      order: 2,
      duration: 1800, // 30 minutes
    },
  ]);
  lessons.push(...econLessons);

  // Lessons for React Advanced Course
  const reactLessons = await Lesson.create([
    {
      courseId: courses[4]._id,
      title: 'Advanced Hooks Patterns',
      description: 'Custom hooks, useReducer, and complex state management',
      order: 1,
      duration: 2100, // 35 minutes
    },
    {
      courseId: courses[4]._id,
      title: 'Performance Optimization',
      description: 'Memoization, code splitting, and lazy loading',
      order: 2,
      duration: 1800, // 30 minutes
    },
    {
      courseId: courses[4]._id,
      title: 'Testing React Applications',
      description: 'Unit tests, integration tests, and E2E testing',
      order: 3,
      duration: 2400, // 40 minutes
    },
  ]);
  lessons.push(...reactLessons);

  // Update courses with lesson stats
  for (const course of courses) {
    const courseLessons = lessons.filter((l: any) => l.courseId.toString() === course._id.toString());
    course.stats.totalLessons = courseLessons.length;
    course.stats.totalDuration = courseLessons.reduce((sum: number, l: any) => sum + l.duration, 0);
    await course.save();
  }

  logger.info(`✅ Created ${lessons.length} lessons`);
  return lessons;
}

async function seedVideos(lessons: any[]) {
  logger.info('🎥 Seeding videos...');

  const videos = [];

  // Create placeholder videos for each lesson
  for (const lesson of lessons) {
    const video = await Video.create({
      title: `${lesson.title} - Video`,
      filename: `video-${lesson._id}.mp4`,
      originalName: `${lesson.title.replace(/\s+/g, '-').toLowerCase()}.mp4`,
      mimeType: 'video/mp4',
      size: Math.floor(Math.random() * 50000000) + 10000000, // Random size between 10-60 MB
      duration: lesson.duration,
      path: `/uploads/videos/video-${lesson._id}.mp4`,
      uploadedBy: lesson.courseId, // Using courseId as placeholder
      status: VIDEO_STATUS.PROCESSED,
    });

    // Update lesson with video reference
    lesson.videoId = video._id;
    await lesson.save();

    videos.push(video);
  }

  logger.info(`✅ Created ${videos.length} video records`);
  return videos;
}

async function seed() {
  try {
    // Connect to database
    logger.info('🔌 Connecting to database...');
    await mongoose.connect(config.database.uri);
    logger.info('✅ Connected to database');

    // Clear existing data
    await clearDatabase();

    // Seed data
    const users = await seedUsers();
    const courses = await seedCourses(users);
    const lessons = await seedLessons(courses);
    const videos = await seedVideos(lessons);

    logger.info('');
    logger.info('🎉 Database seeding completed successfully!');
    logger.info('');
    logger.info('📝 Sample Credentials:');
    logger.info('  Admin:   admin@edusphere.com / Test1234');
    logger.info('  Tutor 1: john.tutor@edusphere.com / Test1234');
    logger.info('  Tutor 2: sarah.tutor@edusphere.com / Test1234');
    logger.info('  Student: mike.student@edusphere.com / Test1234');
    logger.info('');
    logger.info('📊 Summary:');
    logger.info(`  Users: ${users.length}`);
    logger.info(`  Courses: ${courses.length}`);
    logger.info(`  Lessons: ${lessons.length}`);
    logger.info(`  Videos: ${videos.length}`);
    logger.info('');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
