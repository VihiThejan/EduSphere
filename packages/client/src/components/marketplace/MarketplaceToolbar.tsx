import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { MARKETPLACE_SORT_OPTIONS, MarketplaceSortValue } from './types';

interface MarketplaceToolbarProps {
  totalCount: number;
  sort: MarketplaceSortValue;
  onSortChange: (value: MarketplaceSortValue) => void;
}

const MarketplaceToolbar: React.FC<MarketplaceToolbarProps> = ({ totalCount, sort, onSortChange }) => {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Marketplace Listings</h1>
        <p className="mt-1 text-sm text-slate-500">Showing {totalCount} items in your area</p>
      </div>

      <label className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
        <ArrowUpDown size={16} className="text-primary-900" />
        <span>Sort by:</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as MarketplaceSortValue)}
          className="border-none bg-transparent pr-6 text-sm font-semibold text-slate-700 outline-none"
        >
          {MARKETPLACE_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default MarketplaceToolbar;
