import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Plus,
  Scale,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { Bike } from '../types';
import {
  calcBikeMonthlyEmi,
  formatINR,
  formatShortLakh,
  getBikeModelFallbackImage,
} from '../lib/helpers';

interface CompareModalProps {
  open: boolean;
  bikes: Bike[];
  allBikes: Bike[];
  onClose: () => void;
  onAddBike: (bikeId: string) => void;
  onRemoveBike: (bikeId: string) => void;
  onClearAll: () => void;
  onBookTestRide: (bikeName: string) => void;
  onApplyLoan: (bike: Bike) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  open,
  bikes,
  allBikes,
  onClose,
  onAddBike,
  onRemoveBike,
  onClearAll,
  onBookTestRide,
  onApplyLoan,
}) => {
  const [pickerQuery, setPickerQuery] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const selectedIds = useMemo(() => new Set(bikes.map((b) => b.id)), [bikes]);

  const pickerBikes = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    return allBikes
      .filter((b) => !selectedIds.has(b.id))
      .filter((b) =>
        q
          ? `${b.name} ${b.brand} ${b.category} ${b.engine} ${b.year}`
              .toLowerCase()
              .includes(q)
          : true
      )
      .slice(0, 12);
  }, [allBikes, pickerQuery, selectedIds]);

  if (!open) return null;

  const rows: { label: string; render: (b: Bike) => string }[] = [
    { label: 'Offer Price', render: (b) => formatShortLakh(b.price_raw, b.price) },
    {
      label: 'Est. Monthly EMI (20% Down)',
      render: (b) => {
        const emi = calcBikeMonthlyEmi(b.price_raw);
        return emi > 0 ? `${formatINR(emi)}/mo` : 'On Request';
      },
    },
    { label: 'Brand', render: (b) => b.brand },
    { label: 'Category', render: (b) => b.category },
    { label: 'Model Year', render: (b) => String(b.year) },
    { label: 'Odometer', render: (b) => b.km },
    { label: 'Engine CC', render: (b) => b.engine },
    { label: 'Peak Power', render: (b) => b.hp },
    { label: '0 – 100 km/h', render: (b) => b.acceleration || '3.2s' },
    { label: 'Fuel Type', render: (b) => b.fuel || 'Petrol' },
    { label: 'Showroom Hub', render: (b) => b.location },
    {
      label: 'Assurance',
      render: () => '150-Pt Certified · 6-Mo Warranty · Clean RC',
    },
  ];

  // Mobile-first column count: 2 columns when 0–2 bikes, 3 columns when 3 bikes
  const colGridClass =
    bikes.length === 3 ? 'grid-cols-3 gap-1.5 sm:gap-3' : 'grid-cols-2 gap-2.5 sm:gap-4';
  const pickerVisible = bikes.length < 2 || showPicker;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center sm:p-4 overflow-hidden overscroll-contain"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#F8FAFC] border border-slate-200 sm:rounded-3xl overflow-hidden shadow-2xl h-[100dvh] sm:h-auto sm:max-h-[92dvh] flex flex-col"
      >
        {/* Sticky Mobile-Aligned Header */}
        <div className="px-3.5 sm:px-6 h-14 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-[#0F172A] flex items-center justify-center cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] flex items-center gap-1">
                <Scale className="w-3 h-3 shrink-0" />
                <span>Compare System · {bikes.length}/3 Selected</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] truncate">
                Side-by-Side Bike Comparison
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {bikes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowPicker(true);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-[11px] font-bold text-slate-700 hover:text-[#DC2626] inline-flex items-center gap-1 cursor-pointer transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Compare Modal"
              className="hidden sm:flex w-8 h-8 rounded-full bg-slate-50 hover:bg-[#DC2626] text-slate-600 hover:text-white border border-slate-200 items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body (Zero horizontal table overflow on mobile) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 space-y-4">
          {/* Selected Comparison Cards Row */}
          <div className={`grid ${colGridClass}`}>
            {bikes.map((b) => {
              const emi = calcBikeMonthlyEmi(b.price_raw);
              return (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between min-w-0"
                >
                  <div>
                    <div className="relative aspect-[16/10] bg-slate-100">
                      <img
                        src={b.image_url || getBikeModelFallbackImage(b)}
                        alt={b.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.onerror = null;
                          el.src = getBikeModelFallbackImage(b);
                        }}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveBike(b.id)}
                        aria-label={`Remove ${b.name}`}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/95 text-slate-700 hover:text-[#DC2626] flex items-center justify-center cursor-pointer shadow-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-2 sm:p-3 space-y-1">
                      <div className="text-[11px] sm:text-sm font-extrabold text-[#0F172A] leading-tight line-clamp-2">
                        {b.year} {b.name}
                      </div>
                      <div className="text-xs sm:text-base font-extrabold text-[#DC2626] tabular-nums">
                        {formatShortLakh(b.price_raw, b.price)}
                      </div>
                      {emi > 0 && (
                        <div className="text-[10px] font-semibold text-slate-500 tabular-nums">
                          EMI {formatINR(emi)}/m
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-2 pb-2 sm:px-3 sm:pb-3 pt-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onBookTestRide(b.name);
                      }}
                      className="w-full py-1.5 sm:py-2 px-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[10px] sm:text-xs font-extrabold cursor-pointer transition"
                    >
                      Test Ride
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onApplyLoan(b);
                      }}
                      className="w-full py-1.5 sm:py-2 px-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-[10px] sm:text-xs font-extrabold cursor-pointer transition"
                    >
                      Bike Loan
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty Add Slot(s) when < 2 bikes selected */}
            {bikes.length < 2 &&
              Array.from({ length: 2 - bikes.length }).map((_, slotIdx) => (
                <button
                  key={`slot-${slotIdx}`}
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="min-h-[185px] rounded-2xl border-2 border-dashed border-red-300 bg-red-50/40 hover:bg-red-50 flex flex-col items-center justify-center p-3 text-center gap-2 cursor-pointer transition"
                >
                  <span className="w-9 h-9 rounded-full bg-white border border-red-200 text-[#DC2626] flex items-center justify-center shadow-2xs">
                    <Plus className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-extrabold text-[#0F172A]">
                    {bikes.length === 0 && slotIdx === 0 ? 'Add 1st Bike' : 'Add Bike to Compare'}
                  </span>
                  <span className="text-[10px] text-slate-500">Pick from live stock below</span>
                </button>
              ))}
          </div>

          {/* Toggle Add 3rd Bike button when 2 bikes selected */}
          {bikes.length === 2 && (
            <button
              type="button"
              onClick={() => setShowPicker((v) => !v)}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-red-50 border border-dashed border-slate-300 hover:border-[#DC2626] text-xs font-extrabold text-[#0F172A] inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>{showPicker ? 'Hide Bike Picker' : 'Add 3rd Bike to Compare'}</span>
            </button>
          )}

          {/* Stacked Mobile-Aligned Spec Comparison Rows (when >= 1 bike) */}
          {bikes.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {rows.map((row) => (
                <div key={row.label} className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    {row.label}
                  </div>
                  <div className={`grid ${colGridClass} text-xs sm:text-sm font-bold text-[#0F172A] tabular-nums`}>
                    {bikes.map((b) => (
                      <div key={b.id} className="min-w-0 break-words">
                        {row.render(b)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline Live Inventory Picker (aligned for mobile 2-column grid) */}
          {pickerVisible && bikes.length < 3 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                    Select Motorcycle to Compare ({bikes.length}/3)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tap any bike below to add it side by side
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  placeholder="Search brand, model or CC (e.g. Z900, BMW, 650)..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#DC2626]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {pickerBikes.map((b) => {
                  const added = selectedIds.has(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        onAddBike(b.id);
                        if (bikes.length + 1 >= 3) setShowPicker(false);
                      }}
                      className="text-left rounded-xl border border-slate-200 hover:border-[#DC2626] bg-[#F8FAFC] overflow-hidden cursor-pointer transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[16/10] bg-slate-200 overflow-hidden">
                          <img
                            src={b.image_url || getBikeModelFallbackImage(b)}
                            alt={b.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              el.onerror = null;
                              el.src = getBikeModelFallbackImage(b);
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 space-y-0.5">
                          <div className="text-[11px] font-extrabold text-[#0F172A] truncate">
                            {b.year} {b.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{b.engine}</div>
                          <div className="text-xs font-extrabold text-[#DC2626] tabular-nums">
                            {formatShortLakh(b.price_raw, b.price)}
                          </div>
                        </div>
                      </div>
                      <div className="px-2 pb-2">
                        <span className="w-full h-7 rounded-lg bg-[#0F172A] text-white text-[10px] font-bold inline-flex items-center justify-center gap-1">
                          {added ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          <span>{added ? 'Added' : 'Add to Compare'}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
