import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  BadgeIndianRupee,
  Check,
  ChevronDown,
  Heart,
  MapPin,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  AppView,
  Bike,
  BudgetTierKey,
  ExploreFilters,
  SortKey,
} from '../types';
import {
  calcBikeMonthlyEmi,
  formatINR,
  formatShortLakh,
  getBikeModelFallbackImage,
  parseEngineCcNumber,
  parseKmNumber,
} from '../lib/helpers';

interface ExploreViewProps {
  bikes: Bike[];
  cityLabel: string;
  filters: ExploreFilters;
  onChangeFilters: (next: ExploreFilters) => void;
  onResetFilters: () => void;
  onOpenFilterDrawer: (tab?: string) => void;
  wishlistIds: string[];
  wishlistOnly: boolean;
  onToggleWishlistOnly: () => void;
  onToggleWishlist: (bikeId: string) => void;
  compareIds: string[];
  onToggleCompare: (bikeId: string) => void;
  onOpenCompareModal: () => void;
  onClearCompare: () => void;
  onSelectBike: (bike: Bike) => void;
  onApplyLoanForBike: (bike: Bike) => void;
  onChangeView: (view: AppView) => void;
}

const SORT_LABELS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Relevance (Featured)' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'year-desc', label: 'Year: Newest First' },
  { key: 'km-asc', label: 'Kms Driven: Lowest First' },
];

const BUDGET_PILLS: { key: BudgetTierKey; label: string }[] = [
  { key: 'all', label: 'All Budgets' },
  { key: 'under-2l', label: 'Under ₹2L' },
  { key: '2l-6l', label: '₹2L – ₹6L' },
  { key: '6l-12l', label: '₹6L – ₹12L' },
  { key: 'above-12l', label: '₹12L +' },
];

function matchBikeType(b: Bike, bikeType: string): boolean {
  if (!bikeType || bikeType === 'all') return true;
  const cat = `${b.bike_category || ''} ${b.category || ''} ${b.name || ''}`.toLowerCase();
  const target = bikeType.toLowerCase();
  if (target === 'budget bikes') {
    return (
      cat.includes('scooter') ||
      cat.includes('commuter') ||
      cat.includes('budget') ||
      b.price_raw < 200000
    );
  }
  if (target === 'cruisers') {
    return (
      cat.includes('cruiser') ||
      cat.includes('diavel') ||
      cat.includes('harley') ||
      cat.includes('gt 650')
    );
  }
  if (target === 'adventure') {
    return cat.includes('adventure') || cat.includes('gs') || cat.includes('tiger') || cat.includes('trk');
  }
  if (target === 'naked' || target === 'naked / street') {
    return cat.includes('naked') || cat.includes('duke') || cat.includes('z900') || cat.includes('street') || cat.includes('triple');
  }
  if (target === 'superbikes') {
    return (
      !cat.includes('scooter') &&
      !cat.includes('commuter') &&
      (cat.includes('superbike') || b.price_raw >= 500000 || parseEngineCcNumber(b.engine) >= 600)
    );
  }
  return cat.includes(target);
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  bikes,
  cityLabel,
  filters,
  onChangeFilters,
  onResetFilters,
  onOpenFilterDrawer,
  wishlistIds,
  wishlistOnly,
  onToggleWishlistOnly,
  onToggleWishlist,
  compareIds,
  onToggleCompare,
  onOpenCompareModal,
  onClearCompare,
  onSelectBike,
  onApplyLoanForBike,
  onChangeView,
}) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [budgetMenuOpen, setBudgetMenuOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.budget !== 'all') n += 1;
    if (filters.bikeType !== 'all') n += 1;
    if (filters.query.trim()) n += 1;
    n += filters.brands.length;
    n += filters.engineCcRanges.length;
    n += filters.years.length;
    n += filters.kmRanges.length;
    n += filters.owners.length;
    n += filters.rtos.length;
    return n;
  }, [filters]);

  const filteredBikes = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    const list = bikes.filter((b) => {
      if (wishlistOnly && !wishlistIds.includes(b.id)) return false;
      if (q && !`${b.name} ${b.brand} ${b.category} ${b.engine} ${b.year} ${b.rto || ''}`.toLowerCase().includes(q)) {
        return false;
      }
      if (!matchBikeType(b, filters.bikeType)) return false;

      if (filters.budget === 'under-2l' && !(b.price_raw > 0 && b.price_raw < 200000)) return false;
      if (filters.budget === '2l-6l' && !(b.price_raw >= 200000 && b.price_raw < 600000)) return false;
      if (filters.budget === '6l-12l' && !(b.price_raw >= 600000 && b.price_raw <= 1200000)) return false;
      if (filters.budget === 'above-12l' && !(b.price_raw > 1200000)) return false;

      if (
        filters.brands.length > 0 &&
        !filters.brands.some((br) => b.brand.toLowerCase() === br.toLowerCase())
      ) {
        return false;
      }

      if (filters.engineCcRanges.length > 0) {
        const cc = parseEngineCcNumber(b.engine);
        const matchesCc = filters.engineCcRanges.some((r) => {
          if (r === 'under-350') return cc > 0 && cc <= 350;
          if (r === '350-650') return cc > 350 && cc <= 650;
          if (r === '650-999') return cc > 650 && cc < 1000;
          if (r === '1000-plus') return cc >= 1000;
          return true;
        });
        if (!matchesCc) return false;
      }

      if (filters.years.length > 0) {
        const matchesYr = filters.years.some((y) => {
          if (y === '2020 & Older') return b.year <= 2020;
          return String(b.year) === y;
        });
        if (!matchesYr) return false;
      }

      if (filters.kmRanges.length > 0) {
        const km = parseKmNumber(b.km);
        const matchesKm = filters.kmRanges.some((range) => {
          if (range === 'Under 2,500 km') return km <= 2500;
          if (range === 'Under 5,000 km') return km <= 5000;
          if (range === 'Under 10,000 km') return km <= 10000;
          if (range === 'Above 10,000 km') return km > 10000;
          return true;
        });
        if (!matchesKm) return false;
      }

      if (
        filters.owners.length > 0 &&
        !filters.owners.includes(b.owners || '1st Owner')
      ) {
        return false;
      }

      if (
        filters.rtos.length > 0 &&
        !filters.rtos.includes((b.rto || 'TS09').toUpperCase())
      ) {
        return false;
      }

      return true;
    });

    const sorted = [...list];
    if (filters.sortBy === 'price-asc') sorted.sort((a, b) => a.price_raw - b.price_raw);
    else if (filters.sortBy === 'price-desc') sorted.sort((a, b) => b.price_raw - a.price_raw);
    else if (filters.sortBy === 'year-desc') sorted.sort((a, b) => b.year - a.year);
    else if (filters.sortBy === 'km-asc') sorted.sort((a, b) => parseKmNumber(a.km) - parseKmNumber(b.km));

    return sorted;
  }, [bikes, filters, wishlistOnly, wishlistIds]);

  const compareBikes = useMemo(
    () => bikes.filter((b) => compareIds.includes(b.id)),
    [bikes, compareIds]
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-28 md:pb-12">
      {/* Top Spinny Loan / Exchange Promo Banner (Screenshot 4 & 5) */}
      <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#DC2626] text-white">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-extrabold truncate">
              Get Superbike Loans up to 90% On-Road · ROI from 10.5%*
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              2-hour spot sanction · Flexible 12–60 month tenures
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChangeView('loans')}
            className="px-3.5 py-1.5 rounded-xl bg-white text-[#0F172A] hover:bg-red-50 text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer transition"
          >
            Check Offer
          </button>
        </div>
      </div>

      {/* Naturally Scrolling Horizontal Filter Chips Row (NEVER overlaps bike cards!) */}
      <div className="bg-white border-b border-slate-200 relative z-20">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => onOpenFilterDrawer('brands')}
              className={`h-9 px-3.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition ${
                activeFilterCount > 0
                  ? 'bg-red-50 border-[#DC2626] text-[#DC2626]'
                  : 'bg-[#F8FAFC] border-slate-200 text-[#0F172A]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold inline-flex items-center justify-center tabular-nums">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setSortMenuOpen((v) => !v);
                setBudgetMenuOpen(false);
              }}
              className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
              <span>Sort</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                setBudgetMenuOpen((v) => !v);
                setSortMenuOpen(false);
              }}
              className={`h-9 px-3.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                filters.budget !== 'all'
                  ? 'bg-red-50 border-[#DC2626] text-[#DC2626]'
                  : 'bg-[#F8FAFC] border-slate-200 text-[#0F172A]'
              }`}
            >
              <span>Price Range</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onOpenFilterDrawer('brands')}
              className={`h-9 px-3.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                filters.brands.length > 0
                  ? 'bg-red-50 border-[#DC2626] text-[#DC2626]'
                  : 'bg-[#F8FAFC] border-slate-200 text-[#0F172A]'
              }`}
            >
              <span>Make + Models</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onOpenFilterDrawer('bikeType')}
              className={`h-9 px-3.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                filters.bikeType !== 'all'
                  ? 'bg-red-50 border-[#DC2626] text-[#DC2626]'
                  : 'bg-[#F8FAFC] border-slate-200 text-[#0F172A]'
              }`}
            >
              <span>{filters.bikeType === 'all' ? 'Bike Type' : filters.bikeType}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onOpenFilterDrawer('engineCc')}
              className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Engine CC</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onOpenFilterDrawer('year')}
              className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Year</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onToggleWishlistOnly}
              className={`h-9 px-3.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                wishlistOnly
                  ? 'bg-[#DC2626] border-[#DC2626] text-white'
                  : 'bg-[#F8FAFC] border-slate-200 text-[#0F172A]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlistOnly ? 'fill-white' : 'text-[#DC2626]'}`} />
              <span>Saved ({wishlistIds.length})</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          {sortMenuOpen && (
            <div className="mt-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-lg flex flex-wrap gap-1.5">
              {SORT_LABELS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    onChangeFilters({ ...filters, sortBy: opt.key });
                    setSortMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    filters.sortBy === opt.key
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-[#F8FAFC] text-[#0F172A] hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Budget Dropdown */}
          {budgetMenuOpen && (
            <div className="mt-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-lg flex flex-wrap gap-1.5">
              {BUDGET_PILLS.map((bp) => (
                <button
                  key={bp.key}
                  type="button"
                  onClick={() => {
                    onChangeFilters({ ...filters, budget: bp.key });
                    setBudgetMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    filters.budget === bp.key
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-[#F8FAFC] text-[#0F172A] hover:bg-slate-100'
                  }`}
                >
                  {bp.label}
                </button>
              ))}
            </div>
          )}

          {/* Active Removable Filter Chips */}
          {(activeFilterCount > 0 || wishlistOnly) && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={onResetFilters}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-[11px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>

              {filters.query && (
                <button
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, query: '' })}
                  className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[#DC2626] text-[11px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>&ldquo;{filters.query}&rdquo;</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {filters.budget !== 'all' && (
                <button
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, budget: 'all' })}
                  className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[#DC2626] text-[11px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{BUDGET_PILLS.find((b) => b.key === filters.budget)?.label}</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {filters.bikeType !== 'all' && (
                <button
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, bikeType: 'all' })}
                  className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[#DC2626] text-[11px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{filters.bikeType}</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {filters.brands.map((br) => (
                <button
                  key={br}
                  type="button"
                  onClick={() =>
                    onChangeFilters({
                      ...filters,
                      brands: filters.brands.filter((x) => x !== br),
                    })
                  }
                  className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[#DC2626] text-[11px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{br}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Header & Bike Feed */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <h1 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
            {filteredBikes.length} Superbikes &amp; Certified Bikes in {cityLabel}
          </h1>
          <span className="text-[11px] font-bold text-emerald-700 hidden sm:inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            150-Point Inspected · Fixed Price
          </span>
        </div>

        {filteredBikes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
            <div className="text-base font-extrabold text-[#0F172A]">
              No matching motorcycles found
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Try clearing your filters or switching bike type to explore our live stock.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="px-5 py-2.5 rounded-xl bg-[#DC2626] text-white text-xs font-bold cursor-pointer"
            >
              Show All {bikes.length} Bikes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {filteredBikes.map((bike, idx) => {
              const wished = wishlistIds.includes(bike.id);
              const compared = compareIds.includes(bike.id);
              const emi = calcBikeMonthlyEmi(bike.price_raw);
              const isBudget =
                bike.price_raw < 200000 ||
                (bike.category || '').toLowerCase().includes('scooter');

              return (
                <React.Fragment key={bike.id}>
                  <article
                    onClick={() => onSelectBike(bike)}
                    className="bg-white border border-slate-200 hover:border-[#DC2626]/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                        <img
                          src={bike.image_url || getBikeModelFallbackImage(bike)}
                          alt={bike.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            el.onerror = null;
                            el.src = getBikeModelFallbackImage(bike);
                          }}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            isBudget
                              ? 'bg-[#0F172A] text-white'
                              : 'bg-[#DC2626] text-white'
                          }`}
                        >
                          {isBudget ? 'BUDGET' : bike.badge || 'ASSURED'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(bike.id);
                          }}
                          aria-label={`Save ${bike.name}`}
                          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              wished ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[#0F172A]'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="p-3.5 sm:p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] leading-snug truncate">
                              {bike.year} {bike.name}
                            </h3>
                            <div className="text-xs text-slate-500 truncate mt-0.5">
                              {bike.brand} · {bike.tagline || bike.category}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm sm:text-base font-extrabold text-[#0F172A] tabular-nums">
                              {formatShortLakh(bike.price_raw, bike.price)}
                            </div>
                            {emi > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onApplyLoanForBike(bike);
                                }}
                                className="text-[11px] font-bold text-[#DC2626] border-b border-dashed border-[#DC2626]/60 cursor-pointer tabular-nums"
                              >
                                EMI {formatINR(emi)}/m
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Spec Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-1 rounded-md bg-[#F8FAFC] border border-slate-200 text-[11px] font-semibold text-slate-700 tabular-nums">
                            {bike.km}
                          </span>
                          <span className="px-2 py-1 rounded-md bg-[#F8FAFC] border border-slate-200 text-[11px] font-semibold text-slate-700">
                            {bike.fuel || 'Petrol'}
                          </span>
                          <span className="px-2 py-1 rounded-md bg-[#F8FAFC] border border-slate-200 text-[11px] font-semibold text-slate-700">
                            {bike.engine}
                          </span>
                          <span className="px-2 py-1 rounded-md bg-[#F8FAFC] border border-slate-200 text-[11px] font-semibold text-slate-700">
                            {bike.rto || 'TS09'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Hub & Compare Strip */}
                    <div className="px-3.5 sm:px-4 py-2.5 border-t border-slate-100 bg-[#F8FAFC]/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                        <span className="truncate">HUB · {bike.location}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCompare(bike.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer transition ${
                          compared
                            ? 'bg-[#0F172A] text-white'
                            : 'bg-white border border-slate-200 text-[#0F172A] hover:border-[#DC2626]'
                        }`}
                      >
                        {compared ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{compared ? 'Added' : 'Compare'}</span>
                      </button>
                    </div>
                  </article>

                  {/* In-Feed Banner every 5 cards (Screenshot 4) */}
                  {(idx + 1) % 5 === 0 && (
                    <div className="sm:col-span-2 lg:col-span-3 rounded-2xl bg-gradient-to-r from-[#0F172A] to-slate-800 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                          {(idx + 1) % 10 === 5 ? (
                            <BadgeIndianRupee className="w-5 h-5" />
                          ) : (
                            <Sparkles className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-extrabold">
                            {(idx + 1) % 10 === 5
                              ? 'Pre-approved Superbike Loans · 2-Hr Sanction'
                              : '30-Day Exchange Upgrade · Get ₹15,000 Extra'}
                          </div>
                          <div className="text-xs text-slate-300">
                            {(idx + 1) % 10 === 5
                              ? 'Up to 90% on-road financing with HDFC, ICICI & IDFC First Bank.'
                              : 'Trade in your current motorcycle with 15-minute doorstep inspection.'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onChangeView((idx + 1) % 10 === 5 ? 'loans' : 'sell')
                        }
                        className="h-9 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer transition"
                      >
                        {(idx + 1) % 10 === 5 ? 'Unlock Loan Offer' : 'Get Instant Valuation'}
                      </button>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Compare Tray */}
      {compareBikes.length > 0 && (
        <div className="fixed bottom-16 md:bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-30 bg-[#0F172A] text-white border border-slate-700 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center justify-between gap-4 max-w-xl w-auto">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-[#DC2626] text-[11px] font-extrabold tabular-nums">
              {compareBikes.length}/3
            </span>
            <span className="text-xs font-bold truncate">
              {compareBikes.map((b) => b.name).join(' vs ')}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClearCompare}
              className="text-[11px] text-slate-300 hover:text-white font-semibold cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onOpenCompareModal}
              className="px-3 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-extrabold cursor-pointer"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
