import React, { useState } from 'react';
import { Check, Copy, Loader2, MapPin, MessageSquare, ShoppingCart, Star, Zap } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MarketplaceListingDetail } from './types';
import { cartApi } from '@/services/api/cart.api';

interface MarketplaceSellerPanelProps {
  listing: MarketplaceListingDetail;
  isAuthenticated: boolean;
}

const MarketplaceSellerPanel: React.FC<MarketplaceSellerPanelProps> = ({
  listing,
  isAuthenticated,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(listing.seller.rating));

  const [emailRevealed, setEmailRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addItem(listing.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-cart'] });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    },
  });

  const buyNowMutation = useMutation({
    mutationFn: () => cartApi.addItem(listing.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-cart'] });
      navigate('/checkout');
    },
  });

  const handleCopyEmail = () => {
    if (listing.seller.email) {
      navigator.clipboard.writeText(listing.seller.email).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const busy = addToCartMutation.isPending || buyNowMutation.isPending;

  return (
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-3xl font-black tracking-tight text-primary-900">
          LKR {listing.price.toLocaleString()}
        </p>
        {listing.negotiable && (
          <span className="mt-2 inline-flex rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
            Negotiable
          </span>
        )}
      </div>

      <div className="mb-8 space-y-4 text-sm">
        <div className="flex items-center justify-between border-b border-slate-100 py-2">
          <span className="text-slate-500">Condition</span>
          <span className="font-semibold text-slate-800">
            {listing.condition.replace('Used - ', '')}
          </span>
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
        {/* Add to Cart */}
        <button
          type="button"
          onClick={() => (isAuthenticated ? addToCartMutation.mutate() : navigate('/login'))}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-800 disabled:opacity-50"
        >
          {addToCartMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ShoppingCart size={16} />
          )}
          {addedToCart ? 'Added to Cart!' : addToCartMutation.isPending ? 'Adding…' : 'Add to Cart'}
        </button>

        {/* Buy Now */}
        <button
          type="button"
          onClick={() => (isAuthenticated ? buyNowMutation.mutate() : navigate('/login'))}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {buyNowMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Zap size={16} />
          )}
          {buyNowMutation.isPending ? 'Processing…' : 'Buy Now'}
        </button>

        {/* Contact Seller */}
        {isAuthenticated ? (
          emailRevealed && listing.seller.email ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-500">Seller contact</p>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${listing.seller.email}`}
                  className="min-w-0 flex-1 truncate text-sm font-semibold text-primary-900 hover:underline"
                >
                  {listing.seller.email}
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {copied ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEmailRevealed(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-200"
            >
              <MessageSquare size={16} />
              Contact Seller
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-200"
          >
            <MessageSquare size={16} />
            Sign in to Contact Seller
          </button>
        )}
      </div>

      <div className="my-8 h-px bg-slate-100" />

      <div className="flex items-center gap-4">
        <img
          src={listing.seller.avatarUrl}
          alt={listing.seller.name}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-bold text-slate-900">{listing.seller.name}</p>
          <div className="mt-1 flex items-center gap-1 text-amber-500">
            {stars.map((filled, index) => (
              <Star key={index} size={12} fill={filled ? 'currentColor' : 'none'} />
            ))}
            <span className="ml-1 text-xs text-slate-500">
              ({listing.seller.reviewCount} reviews)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceSellerPanel;
