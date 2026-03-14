import React from 'react';
import { BookType, CircleDollarSign, Layers3, SlidersHorizontal } from 'lucide-react';
import { COURSE_CATEGORIES, COURSE_LEVELS, CourseCategory, CourseLevel } from '@edusphere/shared';

interface CatalogFiltersProps {
  selectedCategory?: CourseCategory;
  selectedLevel?: CourseLevel;
  isFree: boolean;
  isPaid: boolean;
  onCategoryChange: (category?: CourseCategory) => void;
  onLevelChange: (level?: CourseLevel) => void;
  onStatusChange: (type: 'free' | 'paid', checked: boolean) => void;
}

const toLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  selectedCategory,
  selectedLevel,
  isFree,
  isPaid,
  onCategoryChange,
  onLevelChange,
  onStatusChange,
}) => {
  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5">
          <h1 className="text-lg font-bold text-slate-900">Filters</h1>
          <p className="mt-1 text-xs text-slate-500">Refine your course search</p>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onCategoryChange(undefined)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
              !selectedCategory ? 'bg-primary-900/10 text-primary-900' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <BookType size={18} />
            <span className="text-sm font-semibold">All Categories</span>
          </button>

          {COURSE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                selectedCategory === category
                  ? 'bg-primary-900/10 text-primary-900'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal size={18} />
              <span className="text-sm font-medium">{toLabel(category)}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Layers3 size={16} />
            Level
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onLevelChange(undefined)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                !selectedLevel ? 'bg-primary-900/10 font-semibold text-primary-900' : 'hover:bg-slate-100'
              }`}
            >
              All Levels
            </button>
            {COURSE_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onLevelChange(level)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  selectedLevel === level
                    ? 'bg-primary-900/10 font-semibold text-primary-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {toLabel(level)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CircleDollarSign size={16} />
            Price
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(event) => onStatusChange('free', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-900 focus:ring-primary-900"
              />
              Free Courses
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(event) => onStatusChange('paid', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-900 focus:ring-primary-900"
              />
              Paid Courses
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CatalogFilters;
