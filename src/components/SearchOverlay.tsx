import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Clock, Search, Trash2 } from 'lucide-react';
import type { Bike, BudgetTierKey } from '../types';
import { formatShortLakh, getBikeModelFallbackImage } from '../lib/helpers';

interface SearchOverlayProps {
  open: boolean;
  bikes: Bike[];
  recentSearches: string[];
  onClearRecent: () => void;
  onClose: () => void;
  onApplySearchQuery: (query: string) => void;
  onApplyBudget: (budget: BudgetTierKey) => void;
  onSelectBike: (bike: Bike) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  open,
  bikes,
  recentSearches,
  onClearRecent,
  onClose,
  onApplySearchQuery,
  onApplyBudget,
  onSelectBike,
}) => {
  const [input, setInput] = useState('');

  const liveMatches = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return bikes
      .filter((b) =>
        `${b.name} ${b.brand} ${b.category} ${b.engine} ${b.year}`.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [bikes, input]);

  const popularBikes = useMemo(() => bikes.slice(0, 9), [bikes]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onApplySearchQuery(input.trim());
    onClose();
  };

  const budgetButtons: { key: BudgetTierKey; label: string }[] = [
    { key: 'under-2l', label: 'Under ₹2 Lakh' },
    { key: '2l-6l', label: '₹2 – ₹6 Lakh' },
    { key: '6l-12l', label: '₹6 – ₹12 Lakh' },
    { key: 'above-12l', label: '₹12 Lakh +' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-y-auto">
      {/* Top Search Header (Matches Screenshot 3) */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-3 sm:px-6 py-3">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex items-center gap-2.5 bg-[#F8FAFC] border border-slate-200 focus-within:border-[#DC2626] focus-within:bg-white rounded-2xl px-3 h-12 transition"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Search"
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-[#0F172A] flex items-center justify-center cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <input
            type="text"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by brand, model, engine or price..."
            className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
          />
          {input && (
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-[#DC2626] text-white text-xs font-bold cursor-pointer shrink-0"
            >
              Search
            </button>
          )}
        </form>
      </div>

      {/* Body */}
      <div className="max-w-3xl w-full mx-auto px-3.5 sm:px-6 py-5 space-y-4">
        {/* Live Instant Matches when typing */}
        {input.trim() && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Matching Motorcycles</span>
              <button
                type="button"
                onClick={() => {
                  onApplySearchQuery(input.trim());
                  onClose();
                }}
                className="text-[#DC2626] hover:underline cursor-pointer"
              >
                View all in Explore
              </button>
            </div>
            {liveMatches.length === 0 ? (
              <div className="text-xs text-slate-500 py-3">
                No direct matches. Press Search to browse all inventory.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {liveMatches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      onSelectBike(b);
                      onClose();
                    }}
                    className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 rounded-lg px-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={b.image_url || getBikeModelFallbackImage(b)}
                        alt={b.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.onerror = null;
                          el.src = getBikeModelFallbackImage(b);
                        }}
                        className="w-12 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">
                          {b.year} {b.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {b.brand} · {b.engine}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-extrabold text-[#DC2626] font-mono tabular-nums shrink-0">
                      {formatShortLakh(b.price_raw, b.price)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Searches Card */}
        {recentSearches.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Recent Searches
              </span>
              <button
                type="button"
                onClick={onClearRecent}
                aria-label="Clear Recent Searches"
                className="text-slate-400 hover:text-[#DC2626] p-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    onApplySearchQuery(term);
                    onClose();
                  }}
                  className="w-full py-2.5 flex items-center justify-between text-xs sm:text-sm font-semibold text-[#0F172A] hover:text-[#DC2626] cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{term}</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#DC2626]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Range Pills */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Price Range
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {budgetButtons.map((b) => (
              <button
                key={b.key}
                type="button"
                onClick={() => {
                  onApplyBudget(b.key);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#DC2626] hover:text-white border border-slate-200 text-xs font-bold text-[#0F172A] whitespace-nowrap shrink-0 cursor-pointer transition tabular-nums"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Superbikes & Cruisers 3x3 Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Popular Superbikes &amp; Cruisers
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {popularBikes.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  onSelectBike(b);
                  onClose();
                }}
                className="group text-center space-y-1.5 cursor-pointer"
              >
                <div className="aspect-[4/3] rounded-xl bg-[#F8FAFC] border border-slate-200 overflow-hidden">
                  <img
                    src={b.image_url || getBikeModelFallbackImage(b)}
                    alt={b.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.onerror = null;
                      el.src = getBikeModelFallbackImage(b);
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-[#0F172A] group-hover:text-[#DC2626] line-clamp-1">
                  {b.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
