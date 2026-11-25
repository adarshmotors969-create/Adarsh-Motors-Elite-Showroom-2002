import React, { useState } from 'react';
import {
  ArrowRight,
  BadgeIndianRupee,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  FileWarning,
  ShieldCheck,
  Star,
  Wrench,
} from 'lucide-react';
import type { AppView } from '../types';

interface SellViewProps {
  onOpenSellModal: (prefill?: { bikeModel?: string; year?: string; km?: string }) => void;
  onChangeView: (view: AppView) => void;
}

const SELL_BRANDS = [
  'Kawasaki',
  'BMW',
  'Ducati',
  'Triumph',
  'Harley-Davidson',
  'Royal Enfield',
  'KTM',
  'Honda',
];

const STORY_FILTERS = [
  'All Stories',
  'Instant Payments',
  'Doorstep Inspection',
  'Higher Quotes',
  'RC Transfer',
];

const SOLD_STORIES = [
  {
    name: 'Vikramaditya S · Jubilee Hills',
    bike: 'Sold 2022 Kawasaki Ninja ZX-10R',
    tag: 'Instant Payments',
    quote: 'Inspected at my office parking in 20 minutes and IMPS credited before the pickup van left.',
  },
  {
    name: 'Anirudh Kulkarni · Gachibowli',
    bike: 'Sold 2023 Triumph Street Triple RS',
    tag: 'RC Transfer',
    quote: 'Zero brokerage headache. Received official RTO transfer acknowledgement directly on WhatsApp.',
  },
  {
    name: 'Meghna Reddy · Banjara Hills',
    bike: 'Sold 2022 Royal Enfield Interceptor 650',
    tag: 'Higher Quotes',
    quote: 'Offered ₹28,000 more than two local dealers with transparent same-day bank settlement.',
  },
];

export const SellView: React.FC<SellViewProps> = ({ onOpenSellModal, onChangeView }) => {
  const [regNo, setRegNo] = useState('');
  const [activeStoryFilter, setActiveStoryFilter] = useState('All Stories');

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = regNo.trim().toUpperCase();
    onOpenSellModal({
      bikeModel: cleaned ? `Reg: ${cleaned}` : undefined,
    });
  };

  const visibleStories =
    activeStoryFilter === 'All Stories'
      ? SOLD_STORIES
      : SOLD_STORIES.filter((s) => s.tag === activeStoryFilter);

  return (
    <div className="bg-[#F8FAFC] pb-20 md:pb-10">
      {/* Dark Carbon Hero + White Instant Valuation Card (Screenshot 2) */}
      <section className="bg-[#0F172A] text-white pt-5 pb-8 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-1.5">
            <span className="inline-block px-3 py-1 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold uppercase tracking-wider">
              15-Minute Valuation · Zero Brokerage
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Sell Your Superbike or Bike at the Best Price
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Free doorstep dyno inspection, instant IMPS payout, and 100% legal RC transfer.
            </p>
          </div>

          <div className="bg-white text-[#0F172A] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
            <form onSubmit={handleRegSubmit} className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 block">
                Enter your bike registration number to get instant price
              </label>
              <div className="flex items-stretch border-2 border-slate-200 focus-within:border-[#DC2626] rounded-xl overflow-hidden bg-[#F8FAFC]">
                <div className="px-3 bg-slate-900 text-white flex flex-col items-center justify-center text-[10px] font-extrabold tracking-widest shrink-0">
                  <span>IND</span>
                </div>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="TS 09 EX 9901"
                  className="flex-1 px-3.5 h-12 bg-transparent text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-extrabold uppercase tracking-wider cursor-pointer transition shadow-md"
              >
                Get Instant Price
              </button>
            </form>

            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase">
              <div className="flex-1 h-px bg-slate-200" />
              <span>OR SELECT YOUR BIKE BRAND</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SELL_BRANDS.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onOpenSellModal({ bikeModel: brand })}
                  className="h-10 px-3 rounded-xl bg-[#F8FAFC] hover:bg-red-50 hover:border-[#DC2626] border border-slate-200 text-xs font-bold text-[#0F172A] cursor-pointer transition truncate"
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sell Your Bike in 3 Simple Steps */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] mb-3">
          Sell your bike in 3 simple steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[
            {
              step: '01',
              title: 'Quick Price Estimate',
              desc: 'Share reg number or model details for an instant fair market quote.',
              icon: Calculator,
            },
            {
              step: '02',
              title: 'Free Doorstep Inspection',
              desc: 'Master technician checks 150 points at your home or office.',
              icon: ClipboardCheck,
            },
            {
              step: '03',
              title: 'Same-Day IMPS Payout',
              desc: 'Instant bank transfer before handover with legal RC transfer.',
              icon: BadgeIndianRupee,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-[#DC2626] uppercase tracking-wider">
                    Step {item.step}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                    {item.title}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trusted Across India Dark Strip (Screenshot 2) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
        <div className="rounded-2xl sm:rounded-3xl bg-[#0F172A] text-white p-5 sm:p-7">
          <div className="text-xs font-extrabold uppercase tracking-wider text-red-400 mb-1">
            Trusted by riders across India
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <div className="text-xl sm:text-3xl font-extrabold text-white tabular-nums">
                50,000+
              </div>
              <div className="text-[11px] sm:text-xs text-slate-300">Machines Delivered</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-extrabold text-white tabular-nums">
                25+ Yrs
              </div>
              <div className="text-[11px] sm:text-xs text-slate-300">Serving Since 2001</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-extrabold text-amber-400 tabular-nums inline-flex items-center gap-1">
                <span>4.9</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-[11px] sm:text-xs text-slate-300">Verified Seller Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sold Rider Stories */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] mb-3">
          Sold Rider Stories
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
          {STORY_FILTERS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveStoryFilter(tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition ${
                activeStoryFilter === tag
                  ? 'bg-[#DC2626] text-white'
                  : 'bg-white border border-slate-200 text-[#0F172A]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {visibleStories.map((story) => (
            <div
              key={story.name}
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs"
            >
              <span className="inline-block px-2 py-0.5 rounded bg-[#0F172A] text-white text-[10px] font-extrabold uppercase">
                SOLD
              </span>
              <div className="text-xs font-extrabold text-[#DC2626]">{story.bike}</div>
              <p className="text-xs text-slate-600 leading-relaxed">&ldquo;{story.quote}&rdquo;</p>
              <div className="text-[11px] font-bold text-[#0F172A] pt-1 border-t border-slate-100">
                {story.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore Other Services (Screenshot 2 Bottom Cards) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] mb-3">
          Explore Other Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onChangeView('challan')}
            className="bg-white border border-slate-200 hover:border-[#DC2626] rounded-2xl p-4 text-left flex items-center justify-between gap-3 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0">
                <FileWarning className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-[#0F172A]">Check E-Challan</div>
                <div className="text-xs text-slate-500">One-click pending fine check</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => onChangeView('service')}
            className="bg-white border border-slate-200 hover:border-[#DC2626] rounded-2xl p-4 text-left flex items-center justify-between gap-3 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-[#0F172A]">Dyno &amp; Service</div>
                <div className="text-xs text-slate-500">150-pt inspection &amp; Motul care</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => onChangeView('loans')}
            className="bg-white border border-slate-200 hover:border-[#DC2626] rounded-2xl p-4 text-left flex items-center justify-between gap-3 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-[#0F172A]">Superbike Loans</div>
                <div className="text-xs text-slate-500">Up to 90% on-road financing</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </section>
    </div>
  );
};
