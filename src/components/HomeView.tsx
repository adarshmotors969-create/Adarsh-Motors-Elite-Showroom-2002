import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BadgeIndianRupee,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileCheck2,
  Flame,
  Gauge,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Wrench,
  Zap,
} from 'lucide-react';
import type {
  AppView,
  Bike,
  Branch,
  BudgetTierKey,
  HeroSlide,
  SitePhones,
  SortKey,
} from '../types';
import { BUNDLED_BIKE_ASSETS, resolveBundledAssetUrl } from '../data/bundledAssets';
import {
  DEFAULT_BIKE_FALLBACK_IMG,
  PARTNER_BANNER_IMG,
  RIDER_DELIVERY_STORY_IMG,
  SHOWROOM_HUB_IMG,
} from '../data/showroomData';
import {
  calcBikeMonthlyEmi,
  formatINR,
  formatShortLakh,
  getBikeModelFallbackImage,
  openExternalUrl,
} from '../lib/helpers';

interface HomeViewProps {
  bikes: Bike[];
  branches: Branch[];
  activeBranchIdx: number;
  heroSlides: HeroSlide[];
  wishlistIds: string[];
  onToggleWishlist: (bikeId: string) => void;
  onOpenSearch: () => void;
  onSelectBike: (bike: Bike) => void;
  onExploreWithFilter: (opts: {
    budget?: BudgetTierKey;
    bikeType?: string;
    brand?: string;
    query?: string;
    kmRanges?: string[];
    owners?: string[];
    sortBy?: SortKey;
  }) => void;
  onChangeView: (view: AppView) => void;
  onExecuteSlideAction: (action: string) => void;
  sitePhones: SitePhones;
}

const BIKE_TYPE_PILLS = [
  'All',
  'Superbikes',
  'Cruisers',
  'Naked',
  'Adventure',
  'Budget Bikes',
];

const FEATURED_BRANDS = [
  { name: 'Kawasaki', tagline: 'Ninja & Z Series', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'BMW', tagline: 'S1000RR & GS', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Ducati', tagline: 'Panigale & Diavel', badgeBg: 'bg-red-50 text-[#DC2626] border-red-200' },
  { name: 'Triumph', tagline: 'Street & Tiger', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200' },
  { name: 'Harley-Davidson', tagline: 'Cruisers & Fat Boy', badgeBg: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Honda', tagline: 'BigWing & Activa', badgeBg: 'bg-rose-50 text-rose-700 border-rose-200' },
  { name: 'Royal Enfield', tagline: '650 Twins & Classic', badgeBg: 'bg-slate-100 text-[#0F172A] border-slate-300' },
  { name: 'KTM', tagline: 'Duke & RC Series', badgeBg: 'bg-orange-50 text-orange-600 border-orange-200' },
  { name: 'Yamaha', tagline: 'R15 & R-Series', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { name: 'Aprilia', tagline: 'RS & Tuono', badgeBg: 'bg-zinc-100 text-zinc-800 border-zinc-300' },
];

const ASSURED_BENEFITS = [
  {
    title: '6-Month Warranty',
    desc: 'Ironclad engine, gearbox & ECU protection.',
    icon: ShieldCheck,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    title: '150-Point Dyno Check',
    desc: 'Compression, chassis & OBD scan certified.',
    icon: CheckCircle2,
    accent: 'text-[#DC2626] bg-red-50 border-red-200',
  },
  {
    title: 'Pan-India Clean RC',
    desc: '100% legal RTO transfer & NOC clearance.',
    icon: FileCheck2,
    accent: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    title: '2-Hr 90% Loan',
    desc: 'Spot sanction up to 60 months tenure.',
    icon: BadgeIndianRupee,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
  },
];

const DELIVERY_STORIES = [
  {
    rider: 'Karthik Rao · Jubilee Hills',
    bike: '2024 BMW S1000RR M-Sport',
    quote:
      'Transparent 150-point inspection sheet, spotless dyno numbers, and RC transferred to my name in 11 days.',
    rating: '5.0',
  },
  {
    rider: 'Syed Irfan · Banjara Hills',
    bike: '2024 Kawasaki Ninja Z900',
    quote:
      'Got 90% superbike loan sanctioned in under 2 hours at Adarsh Motors. Delivered for our Sunday breakfast ride!',
    rating: '4.9',
  },
  {
    rider: 'Rohan Deshmukh · Madhapur',
    bike: '2024 Ducati Diavel V4',
    quote:
      'Traded in my Street Triple and upgraded seamlessly. Best showroom experience for superbikes in Hyderabad.',
    rating: '5.0',
  },
];

function classifyBikeType(b: Bike): string {
  const cat = `${b.bike_category || ''} ${b.category || ''} ${b.name || ''}`.toLowerCase();
  if (
    cat.includes('scooter') ||
    cat.includes('commuter') ||
    cat.includes('budget') ||
    b.price_raw < 200000
  ) {
    return 'Budget Bikes';
  }
  if (cat.includes('cruiser') || cat.includes('diavel') || cat.includes('harley') || cat.includes('gt 650')) {
    return 'Cruisers';
  }
  if (cat.includes('adventure') || cat.includes('gs') || cat.includes('tiger') || cat.includes('trk')) {
    return 'Adventure';
  }
  if (cat.includes('naked') || cat.includes('duke') || cat.includes('z900') || cat.includes('triple')) {
    return 'Naked';
  }
  return 'Superbikes';
}

function getDistinctBikeUrl(
  bucket: Bike[],
  allPool: Bike[],
  usedUrls: Set<string>,
  dedicatedFallback: string
): string {
  // 1. Prefer a bike from this bucket whose own URL hasn't been used yet
  const fromBucket = bucket.find((b) => {
    const u = resolveBundledAssetUrl(b.image_url, '');
    return u && !usedUrls.has(u);
  });
  if (fromBucket) {
    const u = resolveBundledAssetUrl(fromBucket.image_url, dedicatedFallback);
    usedUrls.add(u);
    return u;
  }

  // 2. Fallback to any other live bike URL not yet used
  const fromPool = allPool.find((b) => {
    const u = resolveBundledAssetUrl(b.image_url, '');
    return u && !usedUrls.has(u);
  });
  if (fromPool) {
    const u = resolveBundledAssetUrl(fromPool.image_url, dedicatedFallback);
    usedUrls.add(u);
    return u;
  }

  // 3. Dedicated distinct bundled studio bike image
  if (!usedUrls.has(dedicatedFallback)) {
    usedUrls.add(dedicatedFallback);
  }
  return dedicatedFallback;
}

export const HomeView: React.FC<HomeViewProps> = ({
  bikes,
  branches,
  activeBranchIdx,
  heroSlides,
  wishlistIds,
  onToggleWishlist,
  onOpenSearch,
  onSelectBike,
  onExploreWithFilter,
  onChangeView,
  onExecuteSlideAction,
}) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [activeTypePill, setActiveTypePill] = useState('All');
  const [recStep, setRecStep] = useState<1 | 2 | 3>(1);
  const [recStyle, setRecStyle] = useState('Superbikes');
  const [recBudget, setRecBudget] = useState<BudgetTierKey>('all');

  const safeSlide = heroSlides[slideIdx % Math.max(1, heroSlides.length)] || heroSlides[0];
  const currentBranch = branches[activeBranchIdx] || branches[0];

  // Budget 4-card grid with Spinny pastel tints, ₹ tier badges, live counts & 4 STRICTLY UNIQUE bike photos
  const budgetCards: {
    key: BudgetTierKey;
    label: string;
    subtitle: string;
    rupeeBadge: string;
    tintClass: string;
    thumb: string;
  }[] = useMemo(() => {
    const under2 = bikes.filter((b) => b.price_raw > 0 && b.price_raw < 200000);
    const twoToSix = bikes.filter((b) => b.price_raw >= 200000 && b.price_raw < 600000);
    const sixToTwelve = bikes.filter((b) => b.price_raw >= 600000 && b.price_raw <= 1200000);
    const above12 = bikes.filter((b) => b.price_raw > 1200000);

    const usedUrls = new Set<string>();

    const thumbUnder2 = getDistinctBikeUrl(
      under2,
      bikes,
      usedUrls,
      BUNDLED_BIKE_ASSETS.yamahaR15
    );
    const thumb2To6 = getDistinctBikeUrl(
      twoToSix,
      bikes,
      usedUrls,
      BUNDLED_BIKE_ASSETS.reGt650
    );
    const thumb6To12 = getDistinctBikeUrl(
      sixToTwelve,
      bikes,
      usedUrls,
      BUNDLED_BIKE_ASSETS.kawasakiZ900
    );
    const thumbAbove12 = getDistinctBikeUrl(
      above12,
      bikes,
      usedUrls,
      BUNDLED_BIKE_ASSETS.bmwS1000rr
    );

    return [
      {
        key: 'under-2l',
        label: 'Under ₹2L',
        subtitle: `${under2.length > 0 ? `${under2.length}+` : '2+'} Budget Bikes`,
        rupeeBadge: '₹',
        tintClass: 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/70 border-emerald-200/80',
        thumb: thumbUnder2,
      },
      {
        key: '2l-6l',
        label: '₹2L – ₹6L',
        subtitle: `${twoToSix.length > 0 ? `${twoToSix.length}+` : '3+'} Cruisers & Twins`,
        rupeeBadge: '₹₹',
        tintClass: 'bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/70 border-sky-200/80',
        thumb: thumb2To6,
      },
      {
        key: '6l-12l',
        label: '₹6L – ₹12L',
        subtitle: `${sixToTwelve.length > 0 ? `${sixToTwelve.length}+` : '4+'} Superbikes`,
        rupeeBadge: '₹₹₹',
        tintClass: 'bg-gradient-to-br from-purple-50/80 via-white to-fuchsia-50/60 border-purple-200/80',
        thumb: thumb6To12,
      },
      {
        key: 'above-12l',
        label: '₹12 Lakhs +',
        subtitle: `${above12.length > 0 ? `${above12.length}+` : '4+'} Flagship Litre`,
        rupeeBadge: '₹₹₹₹',
        tintClass: 'bg-gradient-to-br from-rose-50/80 via-white to-amber-50/70 border-rose-200/80',
        thumb: thumbAbove12,
      },
    ];
  }, [bikes]);

  // Live bike-type counts for pills
  const typeCounts = useMemo(() => {
    const map: Record<string, number> = { All: bikes.length };
    BIKE_TYPE_PILLS.slice(1).forEach((pill) => {
      map[pill] = bikes.filter((b) => classifyBikeType(b) === pill).length;
    });
    return map;
  }, [bikes]);

  // Deduplicate displayed category model cards by photo so no repeated images appear
  const typeFilteredBikes = useMemo(() => {
    const bucket =
      activeTypePill === 'All'
        ? bikes
        : bikes.filter((b) => classifyBikeType(b) === activeTypePill);
    const source = bucket.length > 0 ? bucket : bikes;

    const uniqueByImg: Bike[] = [];
    const seenImgs = new Set<string>();
    for (const b of source) {
      const imgKey = (b.image_url || '').trim();
      if (!imgKey || !seenImgs.has(imgKey)) {
        if (imgKey) seenImgs.add(imgKey);
        uniqueByImg.push(b);
      }
      if (uniqueByImg.length >= 6) break;
    }

    if (uniqueByImg.length < 6) {
      for (const b of source) {
        if (!uniqueByImg.some((x) => x.id === b.id)) {
          uniqueByImg.push(b);
        }
        if (uniqueByImg.length >= 6) break;
      }
    }

    return uniqueByImg;
  }, [bikes, activeTypePill]);

  // Ensure Hero Banner visual is resolved to a bundled/valid URL
  const heroVisual = useMemo(() => {
    return resolveBundledAssetUrl(safeSlide?.image, BUNDLED_BIKE_ASSETS.bmwS1000rr);
  }, [safeSlide]);

  const brandCounts = useMemo(() => {
    const counts = new Map<string, number>();
    bikes.forEach((b) => {
      const br = (b.brand || '').trim().toLowerCase();
      if (br) counts.set(br, (counts.get(br) || 0) + 1);
    });
    return counts;
  }, [bikes]);

  return (
    <div className="bg-[#F8FAFC] pb-20 md:pb-8">
      {/* Warm Spinny Festive Hero Wrapper: Floating Rounded Search Bar + Full-Bleed Festive Banner */}
      <section className="bg-gradient-to-b from-[#DC2626] via-[#EA580C]/90 to-[#F59E0B]/85 text-white px-3.5 sm:px-6 lg:px-8 pt-2 pb-4 sm:pb-5 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Rounded White Search Bar */}
          <div className="max-w-3xl mx-auto">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full h-11 sm:h-12 px-4 rounded-2xl bg-white hover:bg-slate-50 flex items-center gap-3 text-left shadow-md cursor-pointer transition"
            >
              <Search className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                Search by brand, model, engine CC or price...
              </span>
            </button>
          </div>

          {/* Vibrant Festive Offer Banner + Superbike Photo */}
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#FFF7ED] via-white to-[#FEF2F2] text-[#0F172A] overflow-hidden shadow-lg border border-amber-200/80">
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-7 sm:col-span-8 p-3.5 sm:p-6 space-y-1.5 sm:space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                  <span className="truncate">{safeSlide?.badge || 'FESTIVAL OF ADARSH MOTORS'}</span>
                </div>

                <h1 className="text-base sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-[#0F172A]">
                  {safeSlide?.title || 'Save up to ₹25,000 + 0% Processing Fee'}
                </h1>

                <p className="hidden sm:block text-xs sm:text-sm text-slate-600 line-clamp-2 max-w-xl">
                  {safeSlide?.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onExecuteSlideAction(safeSlide?.ctaAction || 'collection')}
                    className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11px] sm:text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <span>{safeSlide?.ctaText || 'Explore Superbikes'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {safeSlide?.secondaryText && (
                    <button
                      type="button"
                      onClick={() => onExecuteSlideAction(safeSlide.secondaryAction || 'finance')}
                      className="hidden sm:inline-flex h-9 px-3.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold items-center cursor-pointer transition"
                    >
                      {safeSlide.secondaryText}
                    </button>
                  )}
                </div>
              </div>

              <div className="col-span-5 sm:col-span-4 relative h-32 sm:h-44 md:h-48 bg-white overflow-hidden">
                <img
                  src={heroVisual}
                  alt={safeSlide?.title || 'Adarsh Motors Superbike'}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.onerror = null;
                    el.src = DEFAULT_BIKE_FALLBACK_IMG;
                  }}
                  className="w-full h-full object-cover object-center"
                />
                {heroSlides.length > 1 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setSlideIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
                      }
                      aria-label="Previous Banner"
                      className="w-6 h-6 rounded-full bg-white/95 hover:bg-white text-[#0F172A] flex items-center justify-center shadow-sm cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideIdx((prev) => (prev + 1) % heroSlides.length)}
                      aria-label="Next Banner"
                      className="w-6 h-6 rounded-full bg-white/95 hover:bg-white text-[#0F172A] flex items-center justify-center shadow-sm cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Your Budget? 4 Pastel-Tinted Spinny Cards (Immediately Above the Fold!) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base sm:text-xl font-extrabold text-[#0F172A]">
            What&apos;s your budget?
          </h2>
          <span className="text-[11px] font-bold text-[#DC2626] tabular-nums">
            {bikes.length} Certified Machines
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {budgetCards.map((card) => (
            <button
              key={card.key}
              type="button"
              onClick={() => onExploreWithFilter({ budget: card.key })}
              className={`group rounded-2xl border p-2.5 sm:p-3.5 text-left shadow-xs hover:shadow-md hover:border-[#DC2626] transition cursor-pointer flex flex-col justify-between gap-2 ${card.tintClass}`}
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-[#0F172A] group-hover:text-[#DC2626]">
                    {card.label}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-600 font-semibold tabular-nums">
                    {card.subtitle}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold tracking-tight shrink-0 shadow-2xs">
                  {card.rupeeBadge}
                </span>
              </div>
              <div className="aspect-[16/9] rounded-xl bg-white overflow-hidden border border-white shadow-2xs">
                <img
                  src={card.thumb}
                  alt={card.label}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.onerror = null;
                    el.src = DEFAULT_BIKE_FALLBACK_IMG;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onExploreWithFilter({ budget: 'all', bikeType: 'all' })}
          className="mt-3 w-full h-11 rounded-xl bg-white hover:bg-red-50/40 border border-slate-300 hover:border-[#DC2626] text-[#0F172A] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs"
        >
          <span>Explore All Bikes ({bikes.length})</span>
          <ChevronRight className="w-4 h-4 text-[#DC2626]" />
        </button>
      </section>

      {/* Explore Models by Bike Type */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <h2 className="text-base sm:text-xl font-extrabold text-[#0F172A]">
            Explore models by bike type
          </h2>
          <button
            type="button"
            onClick={() =>
              onExploreWithFilter({ bikeType: activeTypePill === 'All' ? 'all' : activeTypePill })
            }
            className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer shrink-0"
          >
            View All &rarr;
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
          {BIKE_TYPE_PILLS.map((pill) => {
            const active = activeTypePill === pill;
            const cnt = typeCounts[pill] ?? 0;
            return (
              <button
                key={pill}
                type="button"
                onClick={() => setActiveTypePill(pill)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition inline-flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'bg-white text-[#0F172A] border border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{pill}</span>
                <span
                  className={`text-[10px] font-extrabold tabular-nums ${
                    active ? 'text-red-100' : 'text-slate-400'
                  }`}
                >
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {typeFilteredBikes.map((bike) => {
            const wished = wishlistIds.includes(bike.id);
            const emi = calcBikeMonthlyEmi(bike.price_raw);
            return (
              <div
                key={bike.id}
                onClick={() => onSelectBike(bike)}
                className="bg-white border border-slate-200 hover:border-[#DC2626]/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] bg-white">
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(bike.id);
                    }}
                    aria-label="Wishlist bike"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        wished ? 'fill-[#DC2626] text-[#DC2626]' : 'text-slate-600'
                      }`}
                    />
                  </button>
                </div>
                <div className="p-2.5 sm:p-3 space-y-1 border-t border-slate-100">
                  <div className="text-xs font-extrabold text-[#0F172A] line-clamp-1">
                    {bike.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {bike.year} · {bike.engine}
                  </div>
                  <div className="pt-0.5 flex items-baseline justify-between gap-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#DC2626] tabular-nums">
                      {formatShortLakh(bike.price_raw, bike.price)}
                    </span>
                    {emi > 0 && (
                      <span className="text-[10px] text-slate-500 font-medium truncate">
                        {formatINR(emi)}/m
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Help Us Recommend Your Preferred Bike (Spinny Question 1/3 Interactive Gradient Card) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
        <div className="bg-gradient-to-br from-rose-50 via-purple-50/70 to-indigo-50 border border-rose-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold uppercase tracking-wider">
                Question {recStep}/3
              </span>
              <h2 className="text-base sm:text-xl font-extrabold text-[#0F172A] mt-1">
                {recStep === 1 && 'Help us recommend your preferred bike: Riding Style?'}
                {recStep === 2 && `Question 2/3: Preferred budget for ${recStyle}?`}
                {recStep === 3 && 'Question 3/3: Preferred ownership priority?'}
              </h2>
            </div>
            {recStep > 1 && (
              <button
                type="button"
                onClick={() => setRecStep((s) => (s === 3 ? 2 : 1))}
                className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer shrink-0"
              >
                &larr; Back
              </button>
            )}
          </div>

          {recStep === 1 && (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {[
                {
                  id: 'Superbikes',
                  label: 'Track & Superbike',
                  sub: '650cc – 1150cc+',
                  icon: Zap,
                },
                {
                  id: 'Cruisers',
                  label: 'Highway Cruiser',
                  sub: 'Torquey V-Twins',
                  icon: Compass,
                },
                {
                  id: 'Budget Bikes',
                  label: 'Daily Street',
                  sub: 'City & Commuters',
                  icon: Wrench,
                },
              ].map((choice) => {
                const Icon = choice.icon;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => {
                      setRecStyle(choice.id);
                      setRecStep(2);
                    }}
                    className="bg-white hover:border-[#DC2626] border border-slate-200 rounded-2xl p-3 sm:p-4 text-center space-y-1.5 shadow-2xs cursor-pointer transition"
                  >
                    <div className="w-9 h-9 mx-auto rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                      {choice.label}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-500">{choice.sub}</div>
                  </button>
                );
              })}
            </div>
          )}

          {recStep === 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(
                [
                  { key: 'under-2l', label: 'Under ₹2 Lakh' },
                  { key: '2l-6l', label: '₹2L – ₹6 Lakh' },
                  { key: '6l-12l', label: '₹6L – ₹12 Lakh' },
                  { key: 'above-12l', label: '₹12 Lakhs +' },
                ] as { key: BudgetTierKey; label: string }[]
              ).map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => {
                    setRecBudget(b.key);
                    setRecStep(3);
                  }}
                  className="h-11 rounded-xl bg-white hover:bg-[#DC2626] hover:text-white border border-slate-200 text-[#0F172A] text-xs font-extrabold cursor-pointer transition shadow-2xs"
                >
                  {b.label} &rarr;
                </button>
              ))}
            </div>
          )}

          {recStep === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onExploreWithFilter({
                    bikeType: recStyle,
                    budget: recBudget,
                    owners: ['1st Owner'],
                  })
                }
                className="h-11 rounded-xl bg-[#0F172A] hover:bg-[#DC2626] text-white text-xs font-extrabold cursor-pointer transition"
              >
                Single-Owner Only &rarr;
              </button>
              <button
                type="button"
                onClick={() =>
                  onExploreWithFilter({
                    bikeType: recStyle,
                    budget: recBudget,
                    kmRanges: ['Under 5,000 km'],
                  })
                }
                className="h-11 rounded-xl bg-[#0F172A] hover:bg-[#DC2626] text-white text-xs font-extrabold cursor-pointer transition"
              >
                Low Odometer (&lt; 5,000 km) &rarr;
              </button>
              <button
                type="button"
                onClick={() =>
                  onExploreWithFilter({
                    bikeType: recStyle,
                    budget: recBudget,
                  })
                }
                className="h-11 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-extrabold cursor-pointer transition"
              >
                Show All Matching Bikes &rarr;
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Curated Collections (Spinny Horizontal Rich Graphic Cards) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
        <h2 className="text-base sm:text-xl font-extrabold text-[#0F172A] mb-3">
          Curated Collections
        </h2>
        <div className="flex lg:grid lg:grid-cols-4 gap-3 overflow-x-auto no-scrollbar pb-1">
          {[
            {
              title: 'Best in Performance',
              sub: '150+ HP Flagships',
              bg: 'from-rose-100 to-red-50 border-red-200',
              iconBg: 'bg-[#DC2626] text-white',
              icon: Flame,
              onClick: () =>
                onExploreWithFilter({ bikeType: 'Superbikes', sortBy: 'price-desc' }),
            },
            {
              title: 'Low Odometer Gems',
              sub: 'Under 5,000 km driven',
              bg: 'from-sky-100 to-cyan-50 border-sky-200',
              iconBg: 'bg-sky-600 text-white',
              icon: Gauge,
              onClick: () =>
                onExploreWithFilter({ kmRanges: ['Under 5,000 km'], sortBy: 'km-asc' }),
            },
            {
              title: 'Single-Owner Superbikes',
              sub: 'Spotless RC & Service',
              bg: 'from-emerald-100 to-teal-50 border-emerald-200',
              iconBg: 'bg-emerald-600 text-white',
              icon: BadgeCheck,
              onClick: () => onExploreWithFilter({ owners: ['1st Owner'] }),
            },
            {
              title: 'Track Ready',
              sub: 'WSBK & Quickshifter Spec',
              bg: 'from-amber-100 to-yellow-50 border-amber-200',
              iconBg: 'bg-[#0F172A] text-white',
              icon: Timer,
              onClick: () => onExploreWithFilter({ bikeType: 'Superbikes' }),
            },
          ].map((col) => {
            const Icon = col.icon;
            return (
              <button
                key={col.title}
                type="button"
                onClick={col.onClick}
                className={`min-w-[200px] lg:min-w-0 rounded-2xl border bg-gradient-to-br p-4 text-left shrink-0 cursor-pointer hover:shadow-md transition flex items-center justify-between gap-3 ${col.bg}`}
              >
                <div>
                  <div className="text-sm font-extrabold text-[#0F172A]">{col.title}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{col.sub}</div>
                  <div className="text-[11px] font-extrabold text-[#DC2626] mt-2 inline-flex items-center gap-0.5">
                    <span>Explore</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${col.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Adarsh Assured Benefits Strip */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#DC2626]" />
            <h2 className="text-base sm:text-xl font-extrabold text-[#0F172A]">
              Adarsh Assured Benefits
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Since 2001
          </span>
        </div>

        <div className="flex lg:grid lg:grid-cols-4 gap-3 overflow-x-auto no-scrollbar pb-1">
          {ASSURED_BENEFITS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="min-w-[205px] lg:min-w-0 bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shrink-0 shadow-2xs"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-extrabold text-[#0F172A]">{item.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visit Our Showroom Hub Photo Banner */}
      {currentBranch && (
        <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
          <h2 className="text-base sm:text-xl font-extrabold text-[#0F172A] mb-3">
            Visit Our Showroom Hub
          </h2>
          <div className="rounded-2xl sm:rounded-3xl bg-[#0F172A] text-white overflow-hidden border border-slate-800 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center">
              <div className="md:col-span-5 h-44 sm:h-56 bg-slate-900 relative">
                <img
                  src={SHOWROOM_HUB_IMG}
                  alt={currentBranch.branch_name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.onerror = null;
                    el.src = DEFAULT_BIKE_FALLBACK_IMG;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Flagship Experience Center
                </div>
              </div>
              <div className="md:col-span-7 p-4 sm:p-6 space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-1" />
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold">
                      {currentBranch.branch_name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                      {currentBranch.address}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-400">{currentBranch.timings}</div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openExternalUrl(currentBranch.maps_url)}
                    className="h-9 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold cursor-pointer transition"
                  >
                    Get Directions &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeView('service')}
                    className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition"
                  >
                    Workshop &amp; Dyno Hub
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeView('accessories')}
                    className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition"
                  >
                    Superbike Gear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Browse Bikes by Brands (Emblem Monogram Grid) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
        <h2 className="text-base sm:text-xl font-extrabold text-[#0F172A] mb-3">
          Browse bikes by brands
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {FEATURED_BRANDS.map((br) => {
            const count = brandCounts.get(br.name.toLowerCase()) || 0;
            const initials = br.name
              .split(/[\s-]+/)
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase();
            return (
              <button
                key={br.name}
                type="button"
                onClick={() => onExploreWithFilter({ brand: br.name })}
                className="bg-white border border-slate-200 hover:border-[#DC2626] rounded-2xl p-3 text-left shadow-2xs hover:shadow-sm transition cursor-pointer flex items-center gap-2.5"
              >
                <div
                  className={`w-9 h-9 rounded-xl border text-xs font-extrabold flex items-center justify-center shrink-0 ${br.badgeBg}`}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate">
                      {br.name}
                    </span>
                    {count > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-red-50 text-[#DC2626] text-[10px] font-bold tabular-nums shrink-0">
                        {count}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{br.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Rider Love Stories (Delivery Photo Banner + Reviews) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-xl font-extrabold text-[#0F172A]">
            Rider Love Stories
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>4.9 / 5.0 (50,000+ Delivered)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Showroom Delivery Hero Photo Card */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200 bg-[#0F172A] min-h-[210px]">
            <img
              src={RIDER_DELIVERY_STORY_IMG}
              alt="Adarsh Motors Superbike Handover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.onerror = null;
                el.src = SHOWROOM_HUB_IMG;
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute bottom-3.5 left-4 right-4 text-white">
              <span className="inline-block px-2 py-0.5 rounded bg-[#DC2626] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                Verified Handover
              </span>
              <div className="text-sm sm:text-base font-extrabold">
                Every Delivery Celebrated at Jubilee Hills Lounge
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex md:grid md:grid-cols-3 gap-3 overflow-x-auto no-scrollbar pb-1">
            {DELIVERY_STORIES.map((story) => (
              <div
                key={story.rider}
                className="min-w-[235px] md:min-w-0 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-2.5 shrink-0 shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase">
                      Delivered
                    </span>
                    <span className="text-xs font-bold text-[#0F172A] inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {story.rating}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-[#DC2626]">{story.bike}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">&ldquo;{story.quote}&rdquo;</p>
                </div>
                <div className="text-[11px] font-bold text-[#0F172A] pt-2 border-t border-slate-100">
                  {story.rider}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsored Partner Ad Banners */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Performance Partner Banner */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs grid grid-cols-12 items-center">
            <div className="col-span-5 h-32 sm:h-36 bg-slate-100">
              <img
                src={PARTNER_BANNER_IMG}
                alt="Brembo, AGV & Racing Performance Partner"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.onerror = null;
                  el.src = DEFAULT_BIKE_FALLBACK_IMG;
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="col-span-7 p-3.5 sm:p-4 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Sponsored Gear Partner
              </span>
              <div className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                AGV Carbon, Brembo &amp; Akrapovič Upgrades
              </div>
              <button
                type="button"
                onClick={() => onChangeView('accessories')}
                className="text-xs font-extrabold text-[#DC2626] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>Shop Official Gear</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pre-Approved Loans Partner Banner */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-r from-[#0F172A] to-slate-800 text-white p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                FinServe Partner · 10.5% APR
              </span>
              <div className="text-sm sm:text-lg font-extrabold">
                Pre-Approved Superbike Loans up to 90%
              </div>
              <div className="text-xs text-slate-300">
                Instant 2-hour sanction with HDFC, ICICI &amp; IDFC First Bank.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChangeView('loans')}
              className="px-3.5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer transition"
            >
              Check Offer &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
