import React from 'react';
import { Heart, MapPin, ShieldCheck, UserRound, WalletCards } from 'lucide-react';
import { MarketplaceListing } from './types';

interface MarketplaceListingCardProps {
  listing: MarketplaceListing;
}

const MarketplaceListingCard: React.FC<MarketplaceListingCardProps> = ({ listing }) => {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {listing.verifiedSeller ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              <ShieldCheck size={11} />
              Verified Seller
            </span>
          ) : null}

          {listing.negotiable ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-900/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-900 backdrop-blur-sm">
              <WalletCards size={11} />
              Negotiable
            </span>
          ) : null}
        </div>

        <button
          type="button"
          aria-label="Save listing"
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-600 shadow-sm transition hover:bg-white hover:text-primary-900"
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900">{listing.title}</h3>
        <p className="mt-2 text-2xl font-black tracking-tight text-primary-900">
          LKR {listing.price.toLocaleString()}
        </p>

        <div className="mt-4 space-y-2 text-xs text-slate-500">
          <p className="flex items-center gap-2">
            <UserRound size={14} />
            {listing.sellerName}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={14} />
            {listing.campus}
          </p>
        </div>

        <button
          type="button"
          className="mt-5 rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-800"
        >
          View Details
        </button>
      </div>
    </article>
  );
};

export default MarketplaceListingCard;
