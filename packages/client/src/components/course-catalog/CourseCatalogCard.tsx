import React from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CatalogCourseCardData } from './types';

interface CourseCatalogCardProps {
  item: CatalogCourseCardData;
  canEnroll: boolean;
  isEnrolling: boolean;
  onEnroll: (courseId: string) => void;
}

const toLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const CourseCatalogCard: React.FC<CourseCatalogCardProps> = ({
  item,
  canEnroll,
  isEnrolling,
  onEnroll,
}) => {
  const { course, imageUrl, priceLabel, ratingLabel } = item;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg">
      <Link to={`/courses/${course._id}`} className="relative block w-full aspect-video bg-slate-100">
        <img src={imageUrl} alt={course.title} className="h-full w-full object-cover" />
        <div className="absolute right-3 top-3 rounded bg-white/90 px-2 py-1 text-xs font-bold shadow-sm">
          {toLabel(course.level)}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-primary-900/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-900">
            {toLabel(course.category)}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold">{ratingLabel}</span>
          </div>
        </div>

        <Link to={`/courses/${course._id}`} className="text-lg font-bold leading-tight text-slate-900">
          {course.title}
        </Link>
        <p className="mb-4 mt-2 text-sm text-slate-500">{course.instructorName || 'EduSphere Tutor'}</p>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <span className={`text-lg font-bold ${priceLabel === 'FREE' ? 'text-emerald-600' : 'text-primary-900'}`}>
            {priceLabel}
          </span>
          {canEnroll ? (
            <button
              type="button"
              onClick={() => onEnroll(course._id)}
              disabled={isEnrolling}
              className="rounded-lg bg-primary-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEnrolling ? 'Enrolling...' : 'Enroll'}
            </button>
          ) : (
            <Link
              to={`/courses/${course._id}`}
              className="rounded-lg bg-primary-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-800"
            >
              View Course
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default CourseCatalogCard;
