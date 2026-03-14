import React from 'react';
import { ArrowRight } from 'lucide-react';

const CatalogPromoBanner: React.FC = () => {
  return (
    <div className="group relative flex h-[200px] cursor-pointer items-center overflow-hidden rounded-2xl bg-primary-900 text-white">
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary-900 via-primary-900/80 to-transparent" />
      <div
        className="absolute right-0 top-0 h-full w-1/2 bg-cover bg-center transition duration-500 group-hover:scale-105"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80)',
        }}
      />
      <div className="relative z-20 max-w-md px-8 py-6">
        <h2 className="mb-4 text-2xl font-black leading-tight md:text-3xl">
          Exams coming? See Popular Kuppi Sessions
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2 text-sm font-bold text-primary-900 transition hover:bg-slate-100"
        >
          Explore Now
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default CatalogPromoBanner;
