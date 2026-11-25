import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import type { Bike, ExploreFilters } from '../types';

interface FilterDrawerModalProps {
  open: boolean;
  initialTab?: string;
  filters: ExploreFilters;
  bikes: Bike[];
  onClose: () => void;
  onApply: (next: ExploreFilters) => void;
  onClearAll: () => void;
}

const SIDEBAR_TABS = [
  { id: 'brands', label: 'Brands + Models' },
  { id: 'bikeType', label: 'Bike Type' },
  { id: 'engineCc', label: 'Engine CC' },
  { id: 'year', label: 'Year' },
  { id: 'km', label: 'Kms Driven' },
  { id: 'owner', label: 'Owner' },
  { id: 'rto', label: 'RTO' },
];

export const FilterDrawerModal: React.FC<FilterDrawerModalProps> = ({
  open,
  initialTab = 'brands',
  filters,
  bikes,
  onClose,
  onApply,
  onClearAll,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [draft, setDraft] = useState<ExploreFilters>(filters);
  const [brandQuery, setBrandQuery] = useState('');

  React.useEffect(() => {
    if (open) {
      setDraft(filters);
      setActiveTab(initialTab || 'brands');
      setBrandQuery('');
    }
  }, [open, filters, initialTab]);

  const brandList = useMemo(() => {
    const map = new Map<string, number>();
    bikes.forEach((b) => {
      const br = (b.brand || '').trim();
      if (br) map.set(br, (map.get(br) || 0) + 1);
    });
    const q = brandQuery.trim().toLowerCase();
    return Array.from(map.entries())
      .filter(([name]) => !q || name.toLowerCase().includes(q))
      .sort((a, b) => b[1] - a[1]);
  }, [bikes, brandQuery]);

  const rtoList = useMemo(() => {
    const set = new Set<string>(['TS09', 'TS07', 'TS08', 'AP29', 'KA01', 'MH01']);
    bikes.forEach((b) => {
      if (b.rto) set.add(b.rto);
    });
    return Array.from(set);
  }, [bikes]);

  if (!open) return null;

  const toggleArr = (key: 'brands' | 'engineCcRanges' | 'years' | 'kmRanges' | 'owners' | 'rtos', val: string) => {
    setDraft((prev) => {
      const exists = prev[key].includes(val);
      return {
        ...prev,
        [key]: exists ? prev[key].filter((item) => item !== val) : [...prev[key], val],
      };
    });
  };

  const bikeTypes = ['all', 'Superbikes', 'Cruisers', 'Naked / Street', 'Adventure', 'Budget Bikes'];
  const engineOptions = [
    { id: 'under-350', label: 'Up to 350 cc (Entry & Commuter)' },
    { id: '350-650', label: '350 cc – 650 cc (Mid-Weight Twins)' },
    { id: '650-999', label: '650 cc – 999 cc (Track & Street)' },
    { id: '1000-plus', label: '1000 cc+ (Flagship Litre-Class)' },
  ];
  const yearOptions = ['2025', '2024', '2023', '2022', '2021', '2020 & Older'];
  const kmOptions = ['Under 2,500 km', 'Under 5,000 km', 'Under 10,000 km', 'Above 10,000 km'];
  const ownerOptions = ['1st Owner', '2nd Owner', '3rd Owner'];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Top Header (Matches Screenshot 7 & 8) */}
      <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Filter Drawer"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#0F172A] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-base font-extrabold text-[#0F172A]">Filter</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onClearAll();
            setDraft({
              query: '',
              bikeType: 'all',
              budget: 'all',
              brands: [],
              engineCcRanges: [],
              years: [],
              kmRanges: [],
              owners: [],
              rtos: [],
              sortBy: 'featured',
            });
          }}
          className="text-xs font-extrabold uppercase tracking-wider text-[#DC2626] hover:underline cursor-pointer"
        >
          CLEAR ALL
        </button>
      </div>

      {/* Two-Column Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-32 sm:w-52 bg-[#F8FAFC] border-r border-slate-200 overflow-y-auto shrink-0">
          {SIDEBAR_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3.5 py-4 text-xs sm:text-sm font-bold border-b border-slate-200/60 cursor-pointer relative transition ${
                  isActive ? 'bg-white text-[#DC2626]' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#DC2626]" />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Options Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
          {activeTab === 'brands' && (
            <div className="space-y-3">
              <div className="flex items-center bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 h-10">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={brandQuery}
                  onChange={(e) => setBrandQuery(e.target.value)}
                  placeholder="Search brand (Kawasaki, BMW, Ducati...)"
                  className="w-full bg-transparent text-xs sm:text-sm text-[#0F172A] focus:outline-none"
                />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Top Superbike &amp; Bike Brands
              </div>
              <div className="divide-y divide-slate-100">
                {brandList.map(([brandName, count]) => {
                  const checked = draft.brands.includes(brandName);
                  return (
                    <label
                      key={brandName}
                      className="py-3 flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArr('brands', brandName)}
                          className="w-4 h-4 accent-[#DC2626] rounded cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-[#0F172A]">{brandName}</span>
                      </span>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'bikeType' && (
            <div className="divide-y divide-slate-100">
              {bikeTypes.map((type) => {
                const selected = draft.bikeType.toLowerCase() === type.toLowerCase();
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, bikeType: type }))}
                    className="w-full py-3.5 flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-[#0F172A]">
                      {type === 'all' ? 'All Bikes (Superbikes, Cruisers & Budget)' : type}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selected ? 'border-[#DC2626]' : 'border-slate-300'
                      }`}
                    >
                      {selected && <span className="w-2 h-2 rounded-full bg-[#DC2626]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'engineCc' && (
            <div className="divide-y divide-slate-100">
              {engineOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="py-3.5 flex items-center gap-3 cursor-pointer text-sm font-semibold text-[#0F172A]"
                >
                  <input
                    type="checkbox"
                    checked={draft.engineCcRanges.includes(opt.id)}
                    onChange={() => toggleArr('engineCcRanges', opt.id)}
                    className="w-4 h-4 accent-[#DC2626] cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'year' && (
            <div className="divide-y divide-slate-100">
              {yearOptions.map((y) => (
                <label
                  key={y}
                  className="py-3.5 flex items-center gap-3 cursor-pointer text-sm font-semibold text-[#0F172A]"
                >
                  <input
                    type="checkbox"
                    checked={draft.years.includes(y)}
                    onChange={() => toggleArr('years', y)}
                    className="w-4 h-4 accent-[#DC2626] cursor-pointer"
                  />
                  <span>{y}</span>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'km' && (
            <div className="divide-y divide-slate-100">
              {kmOptions.map((km) => (
                <label
                  key={km}
                  className="py-3.5 flex items-center gap-3 cursor-pointer text-sm font-semibold text-[#0F172A]"
                >
                  <input
                    type="checkbox"
                    checked={draft.kmRanges.includes(km)}
                    onChange={() => toggleArr('kmRanges', km)}
                    className="w-4 h-4 accent-[#DC2626] cursor-pointer"
                  />
                  <span>{km}</span>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'owner' && (
            <div className="divide-y divide-slate-100">
              {ownerOptions.map((ow) => (
                <label
                  key={ow}
                  className="py-3.5 flex items-center gap-3 cursor-pointer text-sm font-semibold text-[#0F172A]"
                >
                  <input
                    type="checkbox"
                    checked={draft.owners.includes(ow)}
                    onChange={() => toggleArr('owners', ow)}
                    className="w-4 h-4 accent-[#DC2626] cursor-pointer"
                  />
                  <span>{ow}</span>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'rto' && (
            <div className="divide-y divide-slate-100">
              {rtoList.map((rto) => (
                <label
                  key={rto}
                  className="py-3.5 flex items-center gap-3 cursor-pointer text-sm font-semibold text-[#0F172A]"
                >
                  <input
                    type="checkbox"
                    checked={draft.rtos.includes(rto)}
                    onChange={() => toggleArr('rtos', rto)}
                    className="w-4 h-4 accent-[#DC2626] cursor-pointer"
                  />
                  <span>{rto} Registered</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Full-Width Racing-Red APPLY Button */}
      <div className="p-3.5 sm:px-6 border-t border-slate-200 bg-white shrink-0">
        <button
          type="button"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
          className="w-full max-w-2xl mx-auto block h-12 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-extrabold uppercase tracking-wider cursor-pointer transition shadow-md"
        >
          APPLY
        </button>
      </div>
    </div>
  );
};
