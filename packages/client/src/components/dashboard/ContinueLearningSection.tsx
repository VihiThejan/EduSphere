import React from 'react';
import { Link } from 'react-router-dom';
import { LearningCourse } from './types';

interface ContinueLearningSectionProps {
  courses: LearningCourse[];
}

const ContinueLearningSection: React.FC<ContinueLearningSectionProps> = ({ courses }) => {
  return (
    <section className="lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Continue Learning</h3>
        <a href="#" className="text-sm font-medium text-primary-900">
          View All
        </a>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <article
            key={course.id}
            className="flex flex-col gap-4 rounded-xl border border-primary-900/10 bg-white p-4 sm:flex-row sm:items-center"
          >
            <img
              src={course.imageUrl}
              alt={course.title}
              className="h-20 w-full rounded-lg object-cover sm:w-32"
            />

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded bg-primary-900/10 px-2 py-0.5 text-xs font-medium text-primary-900">
                  {course.badgeLabel}
                </span>
                <span className="text-xs text-slate-400">{course.progressLabel}</span>
              </div>

              <h4 className="mt-2 font-semibold text-slate-900">{course.title}</h4>

              <div className="mt-3 h-2 w-full rounded-full bg-primary-900/10">
                <div
                  className="h-2 rounded-full bg-primary-900"
                  style={{ width: `${course.progressPercent}%` }}
                />
              </div>
            </div>

            <Link
              to={`/courses/${course.id}`}
              className="rounded-lg border border-primary-900 px-4 py-2 text-sm font-semibold text-primary-900 transition hover:bg-primary-900/5"
            >
              Resume
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ContinueLearningSection;
