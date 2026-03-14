import React from 'react';
import { COURSE_LEVELS, CourseLevel } from '@edusphere/shared';

interface CatalogLevelChipsProps {
  selectedLevel?: CourseLevel;
  onLevelChange: (level?: CourseLevel) => void;
}

const labelForLevel = (level: CourseLevel) => level.charAt(0).toUpperCase() + level.slice(1);

const CatalogLevelChips: React.FC<CatalogLevelChipsProps> = ({ selectedLevel, onLevelChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 text-sm font-semibold text-slate-500">Quick Filter:</span>
      <button
        type="button"
        onClick={() => onLevelChange(undefined)}
        className={`flex h-9 items-center justify-center rounded-full px-5 text-sm font-semibold shadow-sm transition ${
          !selectedLevel ? 'bg-primary-900 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        All Levels
      </button>
      {COURSE_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onLevelChange(level)}
          className={`flex h-9 items-center justify-center rounded-full px-5 text-sm font-medium transition ${
            selectedLevel === level
              ? 'bg-primary-900 text-white'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {labelForLevel(level)}
        </button>
      ))}
    </div>
  );
};

export default CatalogLevelChips;
