import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { UserModel } from '../modules/users/user.model';
import { CourseModel } from '../modules/courses/course.model';
import { LessonModel } from '../modules/courses/lesson.model';
import { EnrollmentModel } from '../modules/enrollments/enrollment.model';
import { USER_ROLES, COURSE_STATUS, ENROLLMENT_STATUS } from '@edusphere/shared';
import { logger } from '../shared/utils/logger';

/**
 * Seed script to populate the database with sample data for evaluation.
 * Run with: npm run seed  (from packages/server)
 */

async function clearDatabase() {
  logger.info('🧹 Clearing existing data...');
  await UserModel.deleteMany({});
  await CourseModel.deleteMany({});
  await LessonModel.deleteMany({});
  await EnrollmentModel.deleteMany({});
  logger.info('✅ Database cleared');
}

async function seedUsers() {
  logger.info('👥 Seeding users...');

  const passwordHash = await bcrypt.hash('Test1234', 10);

  const users = await UserModel.create([
    {
      email: 'admin@edusphere.com',
      passwordHash,
      roles: [USER_ROLES.ADMIN, USER_ROLES.TUTOR],
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        bio: 'Platform administrator and full-stack educator.',
        avatar: 'https://i.pravatar.cc/150?u=admin',
      },
    },
    {
      email: 'john.tutor@edusphere.com',
      passwordHash,
      roles: [USER_ROLES.TUTOR],
      profile: {
        firstName: 'John',
        lastName: 'Smith',
        bio: 'Experienced web developer and instructor with 10+ years in full-stack development.',
        avatar: 'https://i.pravatar.cc/150?u=john',
      },
    },
    {
      email: 'sarah.tutor@edusphere.com',
      passwordHash,
      roles: [USER_ROLES.TUTOR],
      profile: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        bio: 'Data Science expert and university lecturer specializing in Machine Learning and Python.',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
      },
    },
    {
      email: 'priya.tutor@edusphere.com',
      passwordHash,
      roles: [USER_ROLES.TUTOR],
      profile: {
        firstName: 'Priya',
        lastName: 'Nair',
        bio: 'Mathematics professor with a passion for making abstract concepts accessible.',
        avatar: 'https://i.pravatar.cc/150?u=priya',
      },
    },
    {
      email: 'mike.student@edusphere.com',
      passwordHash,
      roles: [USER_ROLES.STUDENT],
      profile: {
        firstName: 'Mike',
        lastName: 'Davis',
        bio: 'Computer Science student passionate about learning new technologies.',
        avatar: 'https://i.pravatar.cc/150?u=mike',
      },
    },
    {
      email: 'emma.student@edusphere.com',
      passwordHash,
      roles: [USER_ROLES.STUDENT],
      profile: {
        firstName: 'Emma',
        lastName: 'Wilson',
        bio: 'Business student interested in technology and entrepreneurship.',
        avatar: 'https://i.pravatar.cc/150?u=emma',
      },
    },
    {
      email: 'alex.student@edusphere.com',
      passwordHash,
      roles: [USER_ROLES.STUDENT],
      profile: {
        firstName: 'Alex',
        lastName: 'Brown',
        bio: 'Engineering student focused on software development and AI.',
        avatar: 'https://i.pravatar.cc/150?u=alex',
      },
    },
  ]);

  logger.info(`✅ Created ${users.length} users`);
  return users;
}

async function seedCourses(users: any[]) {
  logger.info('📚 Seeding courses...');

  const [, johnTutor, sarahTutor, priyaTutor] = users;

  const courses = await CourseModel.create([
    // ── Programming ──────────────────────────────────────────────────
    {
      title: 'Full-Stack Web Development with MERN Stack',
      description:
        'Master the MERN stack end-to-end. You will build real-world applications using MongoDB, Express.js, React, and Node.js. By the end of this course you will confidently architect, build, and deploy production-ready full-stack applications.\n\nTopics covered: REST API design, authentication with JWT, React state management, Mongoose ODM, deployment on cloud platforms, and more.',
      instructorId: johnTutor._id,
      instructorName: `${johnTutor.profile.firstName} ${johnTutor.profile.lastName}`,
      category: 'programming',
      level: 'intermediate',
      status: COURSE_STATUS.PUBLISHED,
      thumbnail:
        'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=900&q=80',
      tags: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'Full-Stack'],
      pricing: { amount: 4999, currency: 'LKR' },
      stats: { enrollmentCount: 152, avgRating: 4.7, reviewCount: 38 },
    },
    {
      title: 'Introduction to Python Programming',
      description:
        'A beginner-friendly journey into programming with Python. No prior experience required. You will learn variables, data types, loops, functions, and file I/O — then apply them in a final mini-project.\n\nPerfect for students stepping into software development for the first time.',
      instructorId: sarahTutor._id,
      instructorName: `${sarahTutor.profile.firstName} ${sarahTutor.profile.lastName}`,
      category: 'programming',
      level: 'beginner',
      status: COURSE_STATUS.PUBLISHED,
      thumbnail:
        'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80',
      tags: ['Python', 'Programming', 'Beginner', 'Fundamentals'],
      pricing: { amount: 0, currency: 'LKR' },
      stats: { enrollmentCount: 410, avgRating: 4.9, reviewCount: 87 },
    },
    {
      title: 'React Advanced Patterns and Best Practices',
      description:
        'Take your React skills to the next level. Dive deep into custom hooks, compound components, render props, context architecture, and performance tuning with useMemo, useCallback, and React.memo.\n\nIncludes a capstone project building a performant dashboard application.',
      instructorId: johnTutor._id,
      instructorName: `${johnTutor.profile.firstName} ${johnTutor.profile.lastName}`,
      category: 'programming',
      level: 'advanced',
      status: COURSE_STATUS.PUBLISHED,
      thumbnail:
        'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=900&q=80',
      tags: ['React', 'JavaScript', 'Advanced', 'Patterns', 'Performance'],
      pricing: { amount: 5999, currency: 'LKR', discountPrice: 4499 },
      stats: { enrollmentCount: 95, avgRating: 4.8, reviewCount: 24 },
    },
    // ── Mathematics ──────────────────────────────────────────────────
    {
      title: 'Calculus for Engineering Students',
      description:
        'A rigorous yet approachable treatment of differential and integral calculus tailored for engineering undergraduates. Covers limits, derivatives, integrals, and their engineering applications including area-under-curve, optimisation problems, and differential equations.',
      instructorId: priyaTutor._id,
      instructorName: `${priyaTutor.profile.firstName} ${priyaTutor.profile.lastName}`,
      category: 'mathematics',
      level: 'intermediate',
      status: COURSE_STATUS.PUBLISHED,
      thumbnail:
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=80',
      tags: ['Calculus', 'Mathematics', 'Engineering', 'Derivatives', 'Integrals'],
      pricing: { amount: 3500, currency: 'LKR' },
      stats: { enrollmentCount: 203, avgRating: 4.6, reviewCount: 52 },
    },
    {
      title: 'Linear Algebra Essentials',
      description:
        'Vectors, matrices, determinants, eigenvalues, and linear transformations explained clearly with visualisation-first teaching. This course is essential for anyone heading into machine learning, computer graphics, or data science.',
      instructorId: priyaTutor._id,
      instructorName: `${priyaTutor.profile.firstName} ${priyaTutor.profile.lastName}`,
      category: 'mathematics',
      level: 'beginner',
      status: COURSE_STATUS.PUBLISHED,
      thumbnail:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=80',
      tags: ['Linear Algebra', 'Mathematics', 'Matrices', 'Vectors'],
      pricing: { amount: 2500, currency: 'LKR' },
      stats: { enrollmentCount: 178, avgRating: 4.5, reviewCount: 41 },
    },
    // ── Data Science / Programming ────────────────────────────────────
    {
      title: 'Machine Learning Fundamentals',
      description:
        'Understand how machines learn. This course walks you through supervised and unsupervised learning, feature engineering, model evaluation, and common pitfalls. Implemented in Python with scikit-learn, pandas, and matplotlib.\n\nCulminating project: build a predictive model and evaluate it with real dataset.',
      instructorId: sarahTutor._id,
      instructorName: `${sarahTutor.profile.firstName} ${sarahTutor.profile.lastName}`,
      category: 'programming',
      level: 'advanced',
      status: COURSE_STATUS.PUBLISHED,
      thumbnail:
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=80',
      tags: ['Machine Learning', 'AI', 'Python', 'scikit-learn', 'Data Science'],
      pricing: { amount: 7999, currency: 'LKR', discountPrice: 5999 },
      stats: { enrollmentCount: 88, avgRating: 4.8, reviewCount: 19 },
    },
    // ── Business ─────────────────────────────────────────────────────
    {
      title: 'Microeconomics for Business Students',
      description:
        'Understand how markets work. This course covers supply and demand, consumer behaviour, firm theory, pricing strategies, market structures, and game theory fundamentals — all with real Sri Lankan and global business examples.',
      instructorId: johnTutor._id,
      instructorName: `${johnTutor.profile.firstName} ${johnTutor.profile.lastName}`,
      category: 'business',
      level: 'beginner',
      status: COURSE_STATUS.PUBLISHED,
      thumbnail:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
      tags: ['Economics', 'Business', 'Markets', 'Microeconomics'],
      pricing: { amount: 3999, currency: 'LKR' },
      stats: { enrollmentCount: 134, avgRating: 4.4, reviewCount: 31 },
    },
    // ── Physics ──────────────────────────────────────────────────────
    {
      title: 'Classical Mechanics: From Newton to Lagrange',
      description:
        'A complete first-year university physics course covering kinematics, Newton\'s laws, energy, momentum, rotational motion, and an introduction to Lagrangian mechanics. Includes worked examples and practice problem sets.',
      instructorId: priyaTutor._id,
      instructorName: `${priyaTutor.profile.firstName} ${priyaTutor.profile.lastName}`,
      category: 'physics',
      level: 'intermediate',
      status: COURSE_STATUS.PUBLISHED,
      thumbnail:
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=900&q=80',
      tags: ['Physics', 'Mechanics', 'Newton', 'Energy', 'University'],
      pricing: { amount: 4500, currency: 'LKR' },
      stats: { enrollmentCount: 77, avgRating: 4.6, reviewCount: 16 },
    },
    // ── Design ───────────────────────────────────────────────────────
    {
      title: 'UI/UX Design Fundamentals with Figma',
      description:
        'Learn to design beautiful, user-centred interfaces from scratch using Figma. Topics include design principles, typography, colour theory, wireframing, prototyping, and design handoff.\n\nBy the end you will have a portfolio-ready mobile app UI case study.',
      instructorId: sarahTutor._id,
      instructorName: `${sarahTutor.profile.firstName} ${sarahTutor.profile.lastName}`,
      category: 'design',
      level: 'beginner',
      status: COURSE_STATUS.PUBLISHED,
      thumbnail:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80',
      tags: ['UI/UX', 'Figma', 'Design', 'Prototyping', 'Wireframing'],
      pricing: { amount: 0, currency: 'LKR' },
      stats: { enrollmentCount: 293, avgRating: 4.7, reviewCount: 65 },
    },
  ]);

  logger.info(`✅ Created ${courses.length} courses`);
  return courses;
}

async function seedLessons(courses: any[]) {
  logger.info('📝 Seeding lessons...');

  const allLessons: any[] = [];

  const lessonDefs: Record<number, { title: string; description: string; duration: number; isFree?: boolean }[]> = {
    // MERN Stack
    0: [
      { title: 'Course Overview & Goals', description: 'What you will build and how to get the most from this course.', duration: 540, isFree: true },
      { title: 'Development Environment Setup', description: 'Installing Node.js, VS Code, MongoDB, and project scaffolding.', duration: 1080 },
      { title: 'Building a REST API with Express', description: 'Routes, middleware, controllers, and error handling.', duration: 2400 },
      { title: 'Mongoose Models & Validation', description: 'Schemas, virtuals, hooks, and complex validators.', duration: 1800 },
      { title: 'JWT Authentication End-to-End', description: 'Access tokens, refresh tokens, and protected routes.', duration: 2100 },
      { title: 'React Fundamentals Refresher', description: 'Components, props, hooks — ensuring a solid baseline.', duration: 1500 },
      { title: 'State Management with Zustand', description: 'Global state patterns without Redux complexity.', duration: 1200 },
      { title: 'Connecting Frontend to Backend', description: 'Axios, React Query, and API error handling.', duration: 1800 },
      { title: 'Deployment on Railway & Vercel', description: 'CI/CD pipelines, env variables, and domain setup.', duration: 1200 },
    ],
    // Python Intro
    1: [
      { title: 'Why Python? Installation & First Script', description: 'Setup Python and write your first working program.', duration: 600, isFree: true },
      { title: 'Variables, Data Types & Operators', description: 'Numbers, strings, booleans, and type conversion.', duration: 900 },
      { title: 'Control Flow: if / elif / else', description: 'Conditional logic and boolean expressions.', duration: 900 },
      { title: 'Loops: for and while', description: 'Iteration patterns, break, continue, and range().', duration: 1200 },
      { title: 'Functions & Scope', description: 'Defining, calling, and composing functions.', duration: 1200 },
      { title: 'Lists, Tuples & Dictionaries', description: 'Python\'s core collection types.', duration: 1500 },
      { title: 'File I/O & Exception Handling', description: 'Reading/writing files and graceful error handling.', duration: 1200 },
      { title: 'Mini-Project: Student Grade Calculator', description: 'End-to-end project applying everything learned.', duration: 1800 },
    ],
    // React Advanced
    2: [
      { title: 'Advanced Hooks Deep Dive', description: 'useReducer, useRef, useImperativeHandle, and custom hooks.', duration: 2100, isFree: true },
      { title: 'Compound Component Pattern', description: 'Build flexible component APIs like Tabs or Accordion.', duration: 1800 },
      { title: 'Render Props & HOCs', description: 'Classic patterns and when to still use them.', duration: 1500 },
      { title: 'Context API at Scale', description: 'Structuring context to avoid unnecessary re-renders.', duration: 1800 },
      { title: 'Performance: Memoisation & Profiling', description: 'useMemo, useCallback, React.memo, and the Profiler.', duration: 2400 },
      { title: 'Code Splitting & Lazy Loading', description: 'React.lazy, Suspense, dynamic imports.', duration: 1500 },
      { title: 'Testing with React Testing Library', description: 'Unit and integration tests with confidence.', duration: 2100 },
    ],
    // Calculus
    3: [
      { title: 'Limits & Continuity', description: 'Intuition and formal definition of a limit.', duration: 1800, isFree: true },
      { title: 'Derivatives — Rules & Techniques', description: 'Chain rule, product rule, implicit differentiation.', duration: 2400 },
      { title: 'Applications of Derivatives', description: 'Optimisation, curve sketching, related rates.', duration: 2100 },
      { title: 'Riemann Sums & Definite Integrals', description: 'Building intuition for integration.', duration: 1800 },
      { title: 'Fundamental Theorem of Calculus', description: 'Bridging differentiation and integration.', duration: 1500 },
      { title: 'Integration Techniques', description: 'Substitution, integration by parts, partial fractions.', duration: 2400 },
      { title: 'Differential Equations Introduction', description: 'Separable DEs and engineering applications.', duration: 1800 },
    ],
    // Linear Algebra
    4: [
      { title: 'Vectors: Geometry & Algebra', description: 'Dot product, cross product, angles, and projections.', duration: 1500, isFree: true },
      { title: 'Matrices & Linear Transformations', description: 'Matrix multiplication as composition of transformations.', duration: 1800 },
      { title: 'Systems of Linear Equations', description: 'Gaussian elimination and row echelon form.', duration: 1800 },
      { title: 'Determinants', description: 'Computation, geometric meaning, and Cramer\'s rule.', duration: 1200 },
      { title: 'Eigenvalues & Eigenvectors', description: 'Characteristic polynomial and diagonalisation.', duration: 2100 },
      { title: 'Applications: PCA & Computer Graphics', description: 'How linear algebra powers ML and 3D engines.', duration: 1500 },
    ],
    // Machine Learning
    5: [
      { title: 'The ML Workflow Overview', description: 'Problem framing, data, models, evaluation, deployment.', duration: 1200, isFree: true },
      { title: 'Data Preprocessing with pandas', description: 'Handling missing values, encoding, and normalisation.', duration: 2100 },
      { title: 'Linear & Logistic Regression', description: 'Deriving models from first principles and implementing them.', duration: 2400 },
      { title: 'Decision Trees & Random Forests', description: 'Tree-based methods, overfitting, and bagging.', duration: 2100 },
      { title: 'Model Evaluation & Cross-Validation', description: 'Metrics, bias-variance tradeoff, k-fold CV.', duration: 1800 },
      { title: 'Unsupervised Learning: k-Means & PCA', description: 'Clustering and dimensionality reduction.', duration: 1800 },
      { title: 'Capstone: End-to-End ML Project', description: 'Kaggle-style project from raw data to submission.', duration: 3600 },
    ],
    // Microeconomics
    6: [
      { title: 'Introduction to Economic Thinking', description: 'Scarcity, opportunity cost, and rationality.', duration: 900, isFree: true },
      { title: 'Supply and Demand', description: 'Market equilibrium, elasticity, and price floors/ceilings.', duration: 1500 },
      { title: 'Consumer Theory', description: 'Utility maximisation, indifference curves, budget constraints.', duration: 1800 },
      { title: 'Production & Costs', description: 'Short-run and long-run cost curves.', duration: 1500 },
      { title: 'Market Structures', description: 'Perfect competition, monopoly, oligopoly, monopolistic competition.', duration: 2100 },
      { title: 'Game Theory Basics', description: 'Nash equilibrium, prisoner\'s dilemma, strategic interaction.', duration: 1500 },
    ],
    // Classical Mechanics
    7: [
      { title: 'Kinematics in 1D & 2D', description: 'Position, velocity, acceleration — equations of motion.', duration: 1800, isFree: true },
      { title: 'Newton\'s Laws of Motion', description: 'Forces, free-body diagrams, and Newton\'s three laws.', duration: 2100 },
      { title: 'Work, Energy & Power', description: 'Work-energy theorem and conservation of energy.', duration: 1800 },
      { title: 'Linear Momentum & Collisions', description: 'Impulse, elastic and inelastic collisions.', duration: 1500 },
      { title: 'Rotational Motion', description: 'Torque, moment of inertia, angular momentum.', duration: 2100 },
      { title: 'Introduction to Lagrangian Mechanics', description: 'Generalised coordinates and the Euler-Lagrange equation.', duration: 2400 },
    ],
    // UI/UX Design
    8: [
      { title: 'Design Thinking & the UX Process', description: 'Empathise, Define, Ideate, Prototype, Test.', duration: 1200, isFree: true },
      { title: 'Typography & Colour Theory', description: 'Type anatomy, font pairing, colour palettes.', duration: 1500 },
      { title: 'Figma Fundamentals', description: 'Frames, components, auto-layout, and grids.', duration: 2100 },
      { title: 'Wireframing & Information Architecture', description: 'Lo-fi wireframes, user flows, site maps.', duration: 1800 },
      { title: 'High-Fidelity Mockups', description: 'Visual polish, design systems, and icon libraries.', duration: 2400 },
      { title: 'Prototyping & Usability Testing', description: 'Interactive prototypes and heuristic evaluation.', duration: 1800 },
      { title: 'Case Study: Mobile Banking App', description: 'Full design sprint from brief to portfolio piece.', duration: 3000 },
    ],
  };

  for (const [i, defs] of Object.entries(lessonDefs)) {
    const courseIndex = Number(i);
    const created = await LessonModel.create(
      defs.map((d, j) => ({
        courseId: courses[courseIndex]._id,
        title: d.title,
        description: d.description,
        order: j + 1,
        duration: d.duration,
        isFree: d.isFree ?? false,
      }))
    );
    allLessons.push(...created);

    // Update course stats
    const totalLessons = created.length;
    const totalDuration = Math.floor(created.reduce((s: number, l: any) => s + l.duration, 0) / 60); // minutes
    await CourseModel.findByIdAndUpdate(courses[courseIndex]._id, {
      $set: {
        'stats.totalLessons': totalLessons,
        'stats.totalDuration': totalDuration,
        lessonIds: created.map((l: any) => l._id),
      },
    });
  }

  logger.info(`✅ Created ${allLessons.length} lessons`);
  return allLessons;
}

async function seedEnrollments(users: any[], courses: any[], lessons: any[]) {
  logger.info('🎓 Seeding enrollments...');

  const [, , , , mike, emma, alex] = users;

  // Helper: get lessons for a course
  const lessonsFor = (courseId: string) =>
    lessons.filter((l: any) => l.courseId.toString() === courseId.toString());

  const enrollmentDefs = [
    // Mike: enrolled in 3 courses with good progress
    {
      userId: mike._id,
      courseId: courses[0]._id, // MERN
      completedFraction: 0.67,  // 6/9
      daysAgo: 30,
    },
    {
      userId: mike._id,
      courseId: courses[1]._id, // Python (free)
      completedFraction: 1.0,   // completed
      daysAgo: 60,
    },
    {
      userId: mike._id,
      courseId: courses[5]._id, // ML
      completedFraction: 0.2,   // just started
      daysAgo: 5,
    },
    // Emma: enrolled in business + math + design
    {
      userId: emma._id,
      courseId: courses[6]._id, // Microeconomics
      completedFraction: 0.5,
      daysAgo: 20,
    },
    {
      userId: emma._id,
      courseId: courses[8]._id, // UI/UX
      completedFraction: 0.86,  // almost done
      daysAgo: 45,
    },
    {
      userId: emma._id,
      courseId: courses[4]._id, // Linear Algebra
      completedFraction: 0.33,
      daysAgo: 10,
    },
    // Alex: enrolled in engineering-leaning courses
    {
      userId: alex._id,
      courseId: courses[3]._id, // Calculus
      completedFraction: 0.57,
      daysAgo: 25,
    },
    {
      userId: alex._id,
      courseId: courses[7]._id, // Classical Mechanics
      completedFraction: 0.33,
      daysAgo: 15,
    },
    {
      userId: alex._id,
      courseId: courses[2]._id, // React Advanced
      completedFraction: 0.71,
      daysAgo: 40,
    },
    {
      userId: alex._id,
      courseId: courses[1]._id, // Python (free)
      completedFraction: 1.0,
      daysAgo: 70,
    },
  ];

  const enrollments = [];

  for (const def of enrollmentDefs) {
    const courseLessons = lessonsFor(def.courseId.toString());
    const completedCount = Math.round(courseLessons.length * def.completedFraction);
    const completedLessons = courseLessons.slice(0, completedCount).map((l: any) => l._id);
    const progressPercentage = courseLessons.length > 0
      ? Math.round((completedCount / courseLessons.length) * 100)
      : 0;
    const isCompleted = completedFraction(def.completedFraction);
    const enrolledAt = new Date(Date.now() - def.daysAgo * 86_400_000);

    const enrollment = await EnrollmentModel.create({
      userId: def.userId,
      courseId: def.courseId,
      status: isCompleted ? ENROLLMENT_STATUS.COMPLETED : ENROLLMENT_STATUS.ACTIVE,
      enrolledAt,
      completedAt: isCompleted ? new Date(Date.now() - 2 * 86_400_000) : undefined,
      completedLessons,
      progressPercentage,
      lastAccessedAt: new Date(Date.now() - Math.floor(Math.random() * 3) * 86_400_000),
      certificateIssued: isCompleted,
    });

    enrollments.push(enrollment);
  }

  logger.info(`✅ Created ${enrollments.length} enrollments`);
  return enrollments;
}

function completedFraction(fraction: number): boolean {
  return fraction >= 1.0;
}

async function seed() {
  try {
    logger.info('🔌 Connecting to database...');
    await mongoose.connect(config.database.uri);
    logger.info('✅ Connected to database');

    await clearDatabase();

    const users = await seedUsers();
    const courses = await seedCourses(users);
    const lessons = await seedLessons(courses);
    await seedEnrollments(users, courses, lessons);

    logger.info('');
    logger.info('🎉 Database seeding completed successfully!');
    logger.info('');
    logger.info('📝 Sample Credentials (password: Test1234):');
    logger.info('  Admin:    admin@edusphere.com');
    logger.info('  Tutor 1:  john.tutor@edusphere.com');
    logger.info('  Tutor 2:  sarah.tutor@edusphere.com');
    logger.info('  Tutor 3:  priya.tutor@edusphere.com');
    logger.info('  Student:  mike.student@edusphere.com   (3 courses, active)');
    logger.info('  Student:  emma.student@edusphere.com   (3 courses, active)');
    logger.info('  Student:  alex.student@edusphere.com   (4 courses, 1 completed)');
    logger.info('');
    logger.info('📊 Summary:');
    logger.info(`  Users:       ${users.length}`);
    logger.info(`  Courses:     ${courses.length}`);
    logger.info(`  Lessons:     ${lessons.length}`);
    logger.info(`  Enrollments: ${10}`);
    logger.info('');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
