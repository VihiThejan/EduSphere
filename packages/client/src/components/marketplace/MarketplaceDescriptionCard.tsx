import React from 'react';

interface MarketplaceDescriptionCardProps {
  description: string;
  relevantCourses: string[];
}

const MarketplaceDescriptionCard: React.FC<MarketplaceDescriptionCardProps> = ({ description, relevantCourses }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900">Description</h3>
      <p className="mt-4 leading-relaxed text-slate-600">{description}</p>

      <div className="mt-6 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Relevant Courses</h4>
        <div className="flex flex-wrap gap-2">
          {relevantCourses.map((course) => (
            <span key={course} className="rounded-full border border-primary-900/20 bg-primary-900/10 px-3 py-1 text-xs font-semibold text-primary-900">
              {course}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketplaceDescriptionCard;
