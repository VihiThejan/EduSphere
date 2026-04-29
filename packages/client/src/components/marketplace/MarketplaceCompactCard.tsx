import React from 'react';
import { Link } from 'react-router-dom';
import { MarketplaceListing } from './types';

interface MarketplaceCompactCardProps {
  listing: MarketplaceListing;
}

const MarketplaceCompactCard: React.FC<MarketplaceCompactCardProps> = ({ listing }) => {
  return (
    <Link to={`/marketplace/${listing.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="aspect-[3/4] overflow-hidden">
        <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <p className="truncate text-sm font-bold text-slate-900">{listing.title}</p>
        <p className="mt-1 text-lg font-black tracking-tight text-primary-900">LKR {listing.price.toLocaleString()}</p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{listing.condition}</p>
      </div>
    </Link>
  );
};

export default MarketplaceCompactCard;
