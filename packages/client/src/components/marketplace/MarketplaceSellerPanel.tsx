import React from 'react';
import { Heart, MapPin, MessageSquare, Star } from 'lucide-react';
import { MarketplaceListingDetail } from './types';

interface MarketplaceSellerPanelProps {
  listing: MarketplaceListingDetail;
}

const MarketplaceSellerPanel: React.FC<MarketplaceSellerPanelProps> = ({ listing }) => {
  const stars = Array.from({ length: 5 }, (_, index) => index < Math.round(listing.seller.rating));

  return (
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-3xl font-black tracking-tight text-primary-900">LKR {listing.price.toLocaleString()}</p>
        {listing.negotiable ? (
          <span className="mt-2 inline-flex rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
            Negotiable
          </span>
        ) : null}
      </div>

      <div className="mb-8 space-y-4 text-sm">
        <div className="flex items-center justify-between border-b border-slate-100 py-2">
          <span className="text-slate-500">Condition</span>
          <span className="font-semibold text-slate-800">{listing.condition.replace('Used - ', '')}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 py-2">
          <span className="text-slate-500">Posted</span>
          <span className="font-semibold text-slate-800">{listing.postedRelative}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 py-2">
          <span className="text-slate-500">Location</span>
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <MapPin size={14} />
            {listing.campus}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-800">
          <MessageSquare size={16} />
          Contact Seller
        </button>
        <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-200">
          <Heart size={16} />
          Save for Later
        </button>
      </div>

      <div className="my-8 h-px bg-slate-100" />

      <div className="flex items-center gap-4">
        <img src={listing.seller.avatarUrl} alt={listing.seller.name} className="h-12 w-12 rounded-full object-cover" />
        <div>
          <p className="text-sm font-bold text-slate-900">{listing.seller.name}</p>
          <div className="mt-1 flex items-center gap-1 text-amber-500">
            {stars.map((filled, index) => (
              <Star key={index} size={12} fill={filled ? 'currentColor' : 'none'} />
            ))}
            <span className="ml-1 text-xs text-slate-500">({listing.seller.reviewCount} reviews)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceSellerPanel;
