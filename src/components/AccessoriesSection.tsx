import React, { useMemo, useState } from 'react';
import { MessageCircle, Search, Share2, ShieldCheck } from 'lucide-react';
import type { Accessory, SitePhones } from '../types';
import {
  buildAccessoryShareUrl,
  getAccessoryFallbackImage,
  openWhatsApp,
} from '../lib/helpers';

interface AccessoriesSectionProps {
  accessories: Accessory[];
  category: string;
  onCategoryChange: (cat: string) => void;
  onOpenAccessoryDetail: (acc: Accessory) => void;
  onShareLink: (title: string, url: string, toastMsg: string) => void;
  sitePhones: SitePhones;
}

const ACC_TABS = [
  { id: 'all', label: 'All Pro Accessories' },
  { id: 'Exhausts', label: 'Exhaust Systems' },
  { id: 'Riding Gear', label: 'Riding Gear & Helmets' },
  { id: 'Performance', label: 'Brakes & Suspension' },
  { id: 'Protection', label: 'Sliders & Protection' },
];

export const AccessoriesSection: React.FC<AccessoriesSectionProps> = ({
  accessories,
  category,
  onCategoryChange,
  onOpenAccessoryDetail,
  onShareLink,
  sitePhones,
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const targetCat = category.trim().toLowerCase();
    return accessories.filter((item) => {
      const itemCat = (item.category || '').trim().toLowerCase();
      let catMatch = targetCat === 'all' || itemCat === targetCat;
      if (!catMatch) {
        if (targetCat === 'exhausts') catMatch = itemCat.includes('exhaust');
        else if (targetCat === 'riding gear')
          catMatch =
            itemCat.includes('gear') ||
            itemCat.includes('helmet') ||
            itemCat.includes('suit') ||
            itemCat.includes('apparel');
        else if (targetCat === 'performance')
          catMatch =
            itemCat.includes('performance') ||
            itemCat.includes('brake') ||
            itemCat.includes('suspension') ||
            itemCat.includes('tire');
        else if (targetCat === 'protection')
          catMatch =
            itemCat.includes('protect') ||
            itemCat.includes('slider') ||
            itemCat.includes('guard') ||
            itemCat.includes('armor');
      }

      const textMatch =
        !q ||
        `${item.name} ${item.brand} ${item.spec} ${item.fitment}`.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [accessories, category, search]);

  return (
    <section id="accessories" className="py-10 sm:py-16 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#DC2626] mb-1">
              Authentic OEM Hardware &amp; Protection
            </p>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Superbike Accessories &amp; Riding Gear
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-600 tabular-nums">
            Showing <strong className="text-[#0F172A]">{filtered.length}</strong> of{' '}
            {accessories.length} products
          </div>
        </div>

        {/* Category Filter + Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {ACC_TABS.map((t) => {
              const active = category.toLowerCase() === t.id.toLowerCase();
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onCategoryChange(t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition ${
                    active
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center bg-[#F8FAFC] border border-slate-200 focus-within:border-[#DC2626] rounded-xl px-3 h-10 lg:w-72">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Akrapovič, AGV, Brembo..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Accessories Grid (Horizontal swipe on mobile, 4-col grid on desktop) */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar pb-1 snap-x">
          {filtered.map((acc) => (
            <article
              key={acc.id}
              className="min-w-[245px] sm:min-w-0 snap-start bg-white border border-slate-200 hover:border-[#DC2626]/40 rounded-2xl overflow-hidden flex flex-col justify-between shrink-0 transition shadow-xs hover:shadow-md"
            >
              <div>
                <div
                  onClick={() => onOpenAccessoryDetail(acc)}
                  className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={acc.image_url || getAccessoryFallbackImage(acc)}
                    alt={acc.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.onerror = null;
                      el.src = getAccessoryFallbackImage(acc);
                    }}
                    className="w-full h-full object-cover object-center hover:scale-[1.03] transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/95 border border-slate-200 text-[10px] font-mono font-bold text-slate-900 uppercase">
                    {acc.badge}
                  </span>
                  <button
                    type="button"
                    aria-label={`Share ${acc.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareLink(
                        `${acc.name} | Adarsh Motors`,
                        buildAccessoryShareUrl(acc, sitePhones),
                        `${acc.name} link copied!`
                      );
                    }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-md bg-white/95 hover:bg-red-600 text-slate-700 hover:text-white border border-slate-200 flex items-center justify-center cursor-pointer transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div
                  onClick={() => onOpenAccessoryDetail(acc)}
                  className="p-4 space-y-2 cursor-pointer"
                >
                  <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">
                    {acc.brand} · {acc.category}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                    {acc.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{acc.spec}</p>
                  <div className="text-[11px] text-slate-500 truncate pt-1 border-t border-slate-100">
                    Fitment: {acc.fitment}
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-slate-900 font-mono tabular-nums">
                    {acc.price}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {acc.in_stock ? 'In Stock' : 'On Order'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const url = buildAccessoryShareUrl(acc, sitePhones);
                    openWhatsApp(
                      `Hello Adarsh Motors Accessories Desk, I would like to order / check fitment for ${acc.name} (${acc.price}).\n\nProduct Link: ${url}`,
                      sitePhones,
                      'accessories'
                    );
                  }}
                  className="w-full h-9 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Order / Check Fitment</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
