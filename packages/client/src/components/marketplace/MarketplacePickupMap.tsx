import React from 'react';

interface MarketplacePickupMapProps {
  imageUrl: string;
}

const MarketplacePickupMap: React.FC<MarketplacePickupMapProps> = ({ imageUrl }) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-36 bg-slate-200">
        <img src={imageUrl} alt="Campus pickup map" className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 animate-pulse rounded-full border-4 border-white bg-primary-900 shadow-lg" />
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Pickup Location</span>
        <button type="button" className="text-xs font-bold text-primary-900 transition hover:text-primary-700">
          View full map
        </button>
      </div>
    </section>
  );
};

export default MarketplacePickupMap;
