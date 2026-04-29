import React from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import {
  MARKETPLACE_CAMPUSES,
  MARKETPLACE_CONDITIONS,
  MARKETPLACE_ITEM_TYPES,
  MarketplaceCondition,
  MarketplaceFiltersState,
  MarketplaceItemType,
} from './types';

interface MarketplaceFiltersProps {
  filters: MarketplaceFiltersState;
  absoluteMaxPrice: number;
  onToggleType: (type: MarketplaceItemType) => void;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  onCampusChange: (value: MarketplaceFiltersState['campus']) => void;
  onConditionChange: (value: MarketplaceFiltersState['condition']) => void;
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  filters,
  absoluteMaxPrice,
  onToggleType,
  onMinPriceChange,
  onMaxPriceChange,
  onCampusChange,
  onConditionChange,
}) => {
  const minThumb = `${(filters.minPrice / absoluteMaxPrice) * 100}%`;
  const maxThumb = `${(filters.maxPrice / absoluteMaxPrice) * 100}%`;

  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:w-72 md:self-start">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
        <Filter size={18} className="text-primary-900" />
        Filters
      </h3>

      <div className="space-y-6">
        <section>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Item Type</p>
          <div className="space-y-2">
            {MARKETPLACE_ITEM_TYPES.map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => onToggleType(type)}
                  className="rounded border-slate-300 text-primary-900 focus:ring-primary-900"
                />
                <span className="text-sm font-medium text-slate-600">{type}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Price (LKR)</p>
          <div className="space-y-4">
            <div className="relative h-5">
              <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-slate-200" />
              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary-900"
                style={{ left: minThumb, right: `calc(100% - ${maxThumb})` }}
              />
              <input
                type="range"
                min={0}
                max={absoluteMaxPrice}
                step={100}
                value={filters.minPrice}
                onChange={(event) => onMinPriceChange(Number(event.target.value))}
                className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary-900"
              />
              <input
                type="range"
                min={0}
                max={absoluteMaxPrice}
                step={100}
                value={filters.maxPrice}
                onChange={(event) => onMaxPriceChange(Number(event.target.value))}
                className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary-900"
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>LKR {filters.minPrice.toLocaleString()}</span>
              <span>LKR {filters.maxPrice.toLocaleString()}</span>
            </div>
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Campus Location</p>
          <select
            value={filters.campus}
            onChange={(event) => onCampusChange(event.target.value as MarketplaceFiltersState['campus'])}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary-900"
          >
            {MARKETPLACE_CAMPUSES.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
        </section>

        <section>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Condition</p>
          <div className="flex flex-wrap gap-2">
            {MARKETPLACE_CONDITIONS.map((condition) => {
              const isActive = filters.condition === condition;

              return (
                <button
                  key={condition}
                  type="button"
                  onClick={() => onConditionChange(condition as MarketplaceCondition | 'Any')}
                  className={
                    isActive
                      ? 'rounded-full bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white'
                      : 'rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary-900 hover:text-primary-900'
                  }
                >
                  {condition}
                </button>
              );
            })}
          </div>
        </section>

        <div className="rounded-xl bg-primary-900/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-900">
            <SlidersHorizontal size={16} />
            Smart marketplace filters
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Narrow down listings by item type, price, campus, and condition to quickly find what you need.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default MarketplaceFilters;
