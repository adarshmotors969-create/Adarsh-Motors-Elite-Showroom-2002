import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BadgeIndianRupee,
  Calculator,
  CalendarCheck,
  Check,
  CheckCircle2,
  Expand,
  FileCheck2,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  RotateCw,
  Scale,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import type { Bike, SitePhones } from '../types';
import {
  buildBikeShareUrl,
  calcBikeMonthlyEmi,
  formatINR,
  formatShortLakh,
  getBikeImagesList,
  getBikeModelFallbackImage,
  openWhatsApp,
  parseEngineCcNumber,
} from '../lib/helpers';
import { fetchBikeFullGallery } from '../lib/supabase';

interface BikeDetailModalProps {
  bike: Bike | null;
  allBikes: Bike[];
  wishlistIds: string[];
  compareIds: string[];
  onToggleWishlist: (bikeId: string) => void;
  onToggleCompare: (bikeId: string) => void;
  onOpenCompareModal: () => void;
  onSelectBike: (bike: Bike) => void;
  onReserveBike: (bike: Bike) => void;
  onClose: () => void;
  onBookTestRide: (bikeName: string) => void;
  onApplyFinance: (prefill: {
    bikeName: string;
    bikePrice: string;
    loanAmount: string;
    tenure: string;
  }) => void;
  onOpenLightbox: (images: string[], startIndex: number, title: string) => void;
  onShareLink: (title: string, url: string, toastMsg: string) => void;
  sitePhones: SitePhones;
}

export const BikeDetailModal: React.FC<BikeDetailModalProps> = ({
  bike,
  allBikes,
  wishlistIds,
  compareIds,
  onToggleWishlist,
  onToggleCompare,
  onOpenCompareModal,
  onSelectBike,
  onReserveBike,
  onClose,
  onBookTestRide,
  onApplyFinance,
  onOpenLightbox,
  onShareLink,
  sitePhones,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [addonSelected, setAddonSelected] = useState(false);
  const [downPct, setDownPct] = useState(20);
  const [tenureMo, setTenureMo] = useState(36);
  const emiSectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bike) return;
    setActiveIdx(0);
    setAddonSelected(false);
    setDownPct(20);
    setTenureMo(36);
    setImages(getBikeImagesList(bike));
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    if (!bike._galleryLoaded) {
      fetchBikeFullGallery(bike.id).then((res) => {
        if (res) {
          const mergedBike: Bike = {
            ...bike,
            image_url: res.image_url || bike.image_url,
            gallery_urls: res.gallery_urls || bike.gallery_urls,
          };
          setImages(getBikeImagesList(mergedBike));
        }
      });
    }
  }, [bike]);

  // Carousel (a): More Bikes in Similar Budget (±25% Price Range)
  const similarBudgetBikes = useMemo(() => {
    if (!bike) return [];
    const basePrice = bike.price_raw || 0;
    const minPrice = basePrice * 0.75;
    const maxPrice = basePrice * 1.25;

    const withinRange = allBikes
      .filter(
        (b) =>
          b.id !== bike.id &&
          b.price_raw > 0 &&
          (basePrice <= 0 || (b.price_raw >= minPrice && b.price_raw <= maxPrice))
      )
      .sort((a, b) => Math.abs(a.price_raw - basePrice) - Math.abs(b.price_raw - basePrice));

    if (withinRange.length >= 2) return withinRange.slice(0, 8);

    // Fallback to nearest-priced bikes if inventory has < 2 within ±25%
    return allBikes
      .filter((b) => b.id !== bike.id)
      .sort((a, b) => Math.abs(a.price_raw - basePrice) - Math.abs(b.price_raw - basePrice))
      .slice(0, 8);
  }, [allBikes, bike]);

  // Carousel (b): More in Same Category / Better Upgrade Options
  const categoryOrUpgradeBikes = useMemo(() => {
    if (!bike) return [];
    const currentCat = (bike.bike_category || bike.category || '').toLowerCase();
    const currentCc = parseEngineCcNumber(bike.engine);
    const currentPrice = bike.price_raw || 0;

    return allBikes
      .filter((b) => {
        if (b.id === bike.id) return false;
        const bCat = (b.bike_category || b.category || '').toLowerCase();
        const sameCat = Boolean(currentCat && bCat === currentCat);
        const higherCc = parseEngineCcNumber(b.engine) > currentCc;
        const higherTier = b.price_raw > currentPrice;
        return sameCat || higherCc || higherTier;
      })
      .sort((a, b) => {
        const aCat = (a.bike_category || a.category || '').toLowerCase() === currentCat ? 1 : 0;
        const bCat = (b.bike_category || b.category || '').toLowerCase() === currentCat ? 1 : 0;
        const aUp = a.price_raw > currentPrice ? 1 : 0;
        const bUp = b.price_raw > currentPrice ? 1 : 0;
        // Prefer same-category & upward upgrade options first
        const scoreDiff = bCat + bUp - (aCat + aUp);
        if (scoreDiff !== 0) return scoreDiff;
        return a.price_raw - b.price_raw;
      })
      .slice(0, 8);
  }, [allBikes, bike]);

  const compareSuggestion = similarBudgetBikes[0] || categoryOrUpgradeBikes[0] || null;

  if (!bike) return null;

  const activePhoto = images[activeIdx] || getBikeModelFallbackImage(bike);
  const estEmi = calcBikeMonthlyEmi(bike.price_raw, downPct, 10.5, tenureMo);
  const loanPrincipal = Math.round((bike.price_raw || 0) * ((100 - downPct) / 100));
  const wished = wishlistIds.includes(bike.id);
  const compared = compareIds.includes(bike.id);
  const scoreBase = Number(bike.inspection_score) || 9.8;

  const tenureLabelMap: Record<number, string> = {
    12: '12 Months (1 Year)',
    24: '24 Months (2 Years)',
    36: '36 Months (3 Years)',
    48: '48 Months (4 Years)',
    60: '60 Months (5 Years)',
  };

  const handleOneTapCompare = (otherBike: Bike) => {
    if (!compared) onToggleCompare(bike.id);
    if (!compareIds.includes(otherBike.id)) onToggleCompare(otherBike.id);
    onClose();
    onOpenCompareModal();
  };

  const renderShelfCard = (item: Bike, isUpgradeBadge = false) => {
    const itemEmi = calcBikeMonthlyEmi(item.price_raw);
    const isAdded = compareIds.includes(item.id);
    const isUpgrade =
      isUpgradeBadge &&
      (item.price_raw > bike.price_raw ||
        parseEngineCcNumber(item.engine) > parseEngineCcNumber(bike.engine));

    return (
      <div
        key={item.id}
        className="min-w-[230px] max-w-[230px] bg-white border border-slate-200 hover:border-[#DC2626]/60 rounded-2xl overflow-hidden shrink-0 shadow-2xs flex flex-col justify-between transition"
      >
        <div
          onClick={() => onSelectBike(item)}
          className="cursor-pointer"
        >
          <div className="relative aspect-[16/10] bg-slate-100">
            <img
              src={item.image_url || getBikeModelFallbackImage(item)}
              alt={item.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.onerror = null;
                el.src = getBikeModelFallbackImage(item);
              }}
              className="w-full h-full object-cover"
            />
            {isUpgrade && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#DC2626] text-white text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" />
                Upgrade
              </span>
            )}
          </div>

          <div className="p-3 space-y-1.5">
            <div className="text-xs font-extrabold text-[#0F172A] truncate">
              {item.year} {item.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate tabular-nums">
              {item.km} · {item.engine}
            </div>
            <div className="flex items-baseline justify-between gap-1 pt-0.5">
              <span className="text-sm font-extrabold text-[#0F172A] tabular-nums">
                {formatShortLakh(item.price_raw, item.price)}
              </span>
              {itemEmi > 0 && (
                <span className="text-[10px] font-bold text-[#DC2626] tabular-nums">
                  EMI {formatINR(itemEmi)}/m
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onSelectBike(item)}
            className="h-8 rounded-lg bg-[#0F172A] hover:bg-[#DC2626] text-white text-[11px] font-bold cursor-pointer transition"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => handleOneTapCompare(item)}
            className={`h-8 rounded-lg border text-[11px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition ${
              isAdded
                ? 'bg-red-50 border-[#DC2626] text-[#DC2626]'
                : 'bg-[#F8FAFC] hover:border-[#DC2626] border-slate-200 text-[#0F172A]'
            }`}
          >
            {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            <span>Compare</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center sm:p-4 overflow-hidden overscroll-contain"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-[#F8FAFC] sm:rounded-3xl overflow-hidden shadow-2xl h-[100dvh] sm:h-auto sm:max-h-[94dvh] flex flex-col"
      >
        {/* Sticky Spinny Detail Header */}
        <div className="px-3.5 sm:px-6 h-14 border-b border-slate-200 flex items-center justify-between gap-2 bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-[#0F172A] flex items-center justify-center cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] truncate">
                {bike.brand} · {bike.category} · {bike.badge || 'ASSURED'}
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] truncate">
                {bike.year} {bike.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onToggleWishlist(bike.id)}
              aria-label="Save Bike"
              className="w-9 h-9 rounded-full bg-[#F8FAFC] hover:bg-red-50 border border-slate-200 flex items-center justify-center cursor-pointer transition"
            >
              <Heart
                className={`w-4 h-4 ${wished ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[#0F172A]'}`}
              />
            </button>
            <button
              type="button"
              onClick={() =>
                onShareLink(
                  `${bike.name} | Adarsh Motors`,
                  buildBikeShareUrl(bike, sitePhones),
                  `${bike.name} link copied!`
                )
              }
              aria-label="Share Bike"
              className="w-9 h-9 rounded-full bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-[#0F172A] flex items-center justify-center cursor-pointer transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Bike Details"
              className="hidden sm:flex w-9 h-9 rounded-full bg-[#F8FAFC] hover:bg-[#DC2626] text-slate-600 hover:text-white border border-slate-200 items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Photo Gallery with 360° Badge + Compare Toggle */}
            <div className="lg:col-span-6 space-y-3">
              <div
                onClick={() => onOpenLightbox(images, activeIdx, bike.name)}
                className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 cursor-zoom-in"
              >
                <img
                  src={activePhoto}
                  alt={bike.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.onerror = null;
                    el.src = getBikeModelFallbackImage(bike);
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0F172A]/85 text-white text-[10px] font-extrabold inline-flex items-center gap-1">
                  <RotateCw className="w-3 h-3 text-[#DC2626]" />
                  <span>360° VIEW</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompare(bike.id);
                  }}
                  className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1.5 shadow-md cursor-pointer transition ${
                    compared
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-white/95 hover:bg-white text-[#0F172A]'
                  }`}
                >
                  {compared ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Scale className="w-3.5 h-3.5 text-[#DC2626]" />
                  )}
                  <span>{compared ? 'Added to Compare' : '+ Compare'}</span>
                </button>
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/75 text-white text-[11px] font-bold inline-flex items-center gap-1.5">
                  <Expand className="w-3.5 h-3.5" />
                  <span>{activeIdx + 1}/{images.length}</span>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={`w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                        idx === activeIdx
                          ? 'border-[#DC2626]'
                          : 'border-slate-200 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${bike.name} angle ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.onerror = null;
                          el.src = getBikeModelFallbackImage(bike);
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Reasons to Buy Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                  Reasons to buy
                </div>
                <div className="space-y-2">
                  {[
                    `150-Point Dyno Certified (${scoreBase.toFixed(1)}/10 overall health score)`,
                    `${bike.owners || '1st Owner'} · Clean ${bike.rto || 'TS09'} RTO Transfer Guarantee`,
                    'Includes 6-Month Engine & Gearbox Warranty at Adarsh Workshop',
                  ].map((reason) => (
                    <div key={reason} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Price, Exchange Bonus, Basic Info Grid, Add-on Gear */}
            <div className="lg:col-span-6 space-y-3.5">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Fixed Assurance Price
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tabular-nums">
                      {bike.price}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>HUB · {bike.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {estEmi > 0 && (
                      <button
                        type="button"
                        onClick={() => emiSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-right cursor-pointer transition"
                      >
                        <div className="text-[10px] font-bold uppercase text-[#DC2626]">
                          EMI Starts
                        </div>
                        <div className="text-xs sm:text-sm font-extrabold text-[#0F172A] tabular-nums">
                          {formatINR(estEmi)}/m
                        </div>
                        <div className="text-[10px] font-bold text-[#DC2626] underline">
                          Calculate your EMI
                        </div>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!compared) onToggleCompare(bike.id);
                        onClose();
                        onOpenCompareModal();
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition ${
                        compared
                          ? 'bg-red-50 border-[#DC2626] text-[#DC2626]'
                          : 'bg-[#F8FAFC] hover:border-[#DC2626] border-slate-200 text-[#0F172A]'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>{compared ? 'Compare Now' : 'Compare Specs'}</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-emerald-800 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Get ₹15,000 OFF with Bike Exchange
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Hello Adarsh Motors, I want to exchange my bike and get ₹15,000 bonus towards ${bike.name} (${bike.price}).`;
                      openWhatsApp(text, sitePhones, 'tradeIn');
                    }}
                    className="font-extrabold text-emerald-700 hover:underline cursor-pointer shrink-0"
                  >
                    Check Value &rarr;
                  </button>
                </div>
              </div>

              {/* Basic Info 2-Column Spec Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                  Basic info
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Make Year', val: String(bike.year) },
                    { label: 'Reg Year', val: String(bike.year) },
                    { label: 'Fuel Type', val: bike.fuel || 'Petrol' },
                    { label: 'Kms Driven', val: bike.km },
                    { label: 'Engine CC', val: bike.engine },
                    { label: 'Peak Power', val: bike.hp },
                    { label: 'Owners', val: bike.owners || '1st Owner' },
                    { label: 'RTO', val: bike.rto || 'TS09' },
                    { label: 'Insurance', val: bike.insurance || 'Comprehensive Valid' },
                    { label: '0–100 km/h', val: bike.acceleration || '3.1s' },
                  ].map((spec) => (
                    <div key={spec.label} className="pb-2 border-b border-slate-100">
                      <span className="text-[11px] text-slate-400 block">{spec.label}</span>
                      <strong className="font-bold text-[#0F172A] truncate block">{spec.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {bike.addon_name && (
                <button
                  type="button"
                  onClick={() => setAddonSelected((v) => !v)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 cursor-pointer transition ${
                    addonSelected
                      ? 'bg-emerald-50 border-emerald-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-bold uppercase text-[#DC2626]">
                      Showroom Recommended Add-On Gear
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                      {bike.addon_name}{' '}
                      {bike.addon_price && (
                        <span className="text-emerald-700 font-mono">({bike.addon_price})</span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                      addonSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    {addonSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* 150-Point Quality Report & Protection Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                  150-Point Quality Report
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-extrabold tabular-nums">
                  {scoreBase.toFixed(1)} / 10
                </span>
              </div>
              {[
                { label: 'Engine, Dyno & Compression', score: Math.min(10, scoreBase + 0.1) },
                { label: 'Chassis, Forks & Braking', score: scoreBase },
                { label: 'ECU, Wiring & Consumables', score: Math.max(8.8, scoreBase - 0.5) },
              ].map((row) => (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{row.label}</span>
                    <span className="font-bold text-[#0F172A] tabular-nums">
                      {row.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${row.score * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                  Protection &amp; Built-In Comparison
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                    <div className="font-bold text-[#0F172A]">6-Mo Engine Cover</div>
                    <div className="text-[11px] text-slate-500">Included free</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                    <FileCheck2 className="w-4 h-4 text-blue-600 mb-1" />
                    <div className="font-bold text-[#0F172A]">Zero-Cost RC Transfer</div>
                    <div className="text-[11px] text-slate-500">NOC verified</div>
                  </div>
                </div>
              </div>

              {compareSuggestion && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Side-by-Side Spec Check
                    </div>
                    <div className="text-xs font-bold text-[#0F172A] truncate">
                      Compare with {compareSuggestion.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOneTapCompare(compareSuggestion)}
                    className="px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#DC2626] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0 transition"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Compare Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Inline Interactive EMI Calculator */}
          {bike.price_raw > 0 && (
            <div
              ref={emiSectionRef}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#0F172A]">
                  <Calculator className="w-4 h-4 text-[#DC2626]" />
                  <span>EMI Calculator (10.5% APR)</span>
                </div>
                <div className="text-lg font-extrabold text-[#DC2626] tabular-nums">
                  {formatINR(estEmi)}/mo
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Down Payment: {downPct}%</span>
                  <span className="text-[#0F172A] tabular-nums">
                    Loan Principal: {formatINR(loanPrincipal)}
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={5}
                  value={downPct}
                  onChange={(e) => setDownPct(Number(e.target.value))}
                  className="w-full accent-[#DC2626] cursor-pointer"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {[12, 24, 36, 48, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenureMo(m)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                        tenureMo === m
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-[#F8FAFC] border border-slate-200 text-[#0F172A]'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onApplyFinance({
                      bikeName: bike.name,
                      bikePrice: bike.price,
                      loanAmount: formatINR(loanPrincipal),
                      tenure: tenureLabelMap[tenureMo] || '36 Months (3 Years)',
                    })
                  }
                  className="text-xs font-extrabold text-[#DC2626] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <BadgeIndianRupee className="w-3.5 h-3.5" />
                  <span>Check 2-Hr Eligibility &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* Smart Carousel (a): More Bikes in Similar Budget (±25% Price Range) */}
          {similarBudgetBikes.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                    More Bikes in Similar Budget
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Handpicked alternatives within &plusmn;25% of {formatShortLakh(bike.price_raw, bike.price)}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#DC2626] tabular-nums">
                  {similarBudgetBikes.length} Options
                </span>
              </div>
              <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
                {similarBudgetBikes.map((item) => renderShelfCard(item, false))}
              </div>
            </div>
          )}

          {/* Smart Carousel (b): More in Same Category / Better Upgrade Options */}
          {categoryOrUpgradeBikes.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                    More in {bike.category} &amp; Upgrade Options
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Same riding class or next higher CC &amp; performance tier from live stock
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#0F172A] tabular-nums">
                  {categoryOrUpgradeBikes.length} Matches
                </span>
              </div>
              <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
                {categoryOrUpgradeBikes.map((item) => renderShelfCard(item, true))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Spinny Two-Button Bottom Bar */}
        <div className="px-3.5 sm:px-6 py-3 border-t border-slate-200 bg-white grid grid-cols-2 gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onBookTestRide(bike.name)}
            className="h-11 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wide inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
          >
            <CalendarCheck className="w-4 h-4 shrink-0" />
            <span>FREE TEST RIDE</span>
          </button>

          <button
            type="button"
            onClick={() => onReserveBike(bike)}
            aria-label="Book Now via WhatsApp"
            className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wide inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>BOOK VIA WHATSAPP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
