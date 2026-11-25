import React, { useState } from 'react';
import { Copy, ExternalLink, MapPin, Phone, Clock, Users } from 'lucide-react';
import type { Branch, SectionVisibility, SitePhones } from '../types';
import { LEGACY_METRICS } from '../data/showroomData';
import { buildBranchEmbedUrl, getSectionPhone, openExternalUrl } from '../lib/helpers';

interface LegacyAndBranchesSectionProps {
  branches: Branch[];
  activeBranchIdx: number;
  onSelectBranch: (idx: number) => void;
  visibility: SectionVisibility;
  sitePhones: SitePhones;
  onShowToast: (msg: string) => void;
}

export const LegacyAndBranchesSection: React.FC<LegacyAndBranchesSectionProps> = ({
  branches,
  activeBranchIdx,
  onSelectBranch,
  visibility,
  sitePhones,
  onShowToast,
}) => {
  const [darkMap, setDarkMap] = useState(false);
  const currentBranch = branches[activeBranchIdx] || branches[0];
  const branchPhone = currentBranch?.phone || getSectionPhone(sitePhones, 'branches');

  const copyAddress = () => {
    if (!currentBranch?.address) return;
    navigator.clipboard?.writeText(currentBranch.address).then(
      () => onShowToast('Showroom address copied to clipboard!'),
      () => onShowToast(currentBranch.address)
    );
  };

  return (
    <>
      {visibility.legacy && (
        <section id="legacy" className="py-10 sm:py-16 bg-[#0F172A] text-white">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-7">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-3">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                  Serving Riders Since 2001
                </p>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  25+ Years of Trust, Community &amp; Sunday Breakfast Rides
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Almost 25+ years in the market. Over 50,000+ machines delivered to passionate
                  riders across India. Built on strict 150-point inspections, ironclad warranties,
                  and zero hidden clauses.
                </p>
              </div>

              <div className="lg:col-span-5 bg-white/10 border border-white/15 rounded-2xl p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>VIP Riders &amp; Sunday Breakfast Rides</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Join 2,500+ Adarsh Motors riders for curated highway breakfast runs and track-day
                  experiences.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {LEGACY_METRICS.map((m) => (
                <div
                  key={m.label}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5"
                >
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tabular-nums">
                    {m.value}
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{m.label}</div>
                  <div className="text-xs text-slate-300 mt-0.5">{m.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {visibility.branches && currentBranch && (
        <section id="showroom" className="py-12 sm:py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 mb-1">
                  Visit Our Physical Experience Centers
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Showroom Locations &amp; Service Lounges
                </h2>
              </div>

              {branches.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {branches.map((b, idx) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onSelectBranch(idx)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition ${
                        idx === activeBranchIdx
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {b.city || b.branch_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                      Verified Flagship Hub
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                      {currentBranch.branch_name}
                    </h3>
                  </div>

                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-1" />
                      <span>{currentBranch.address}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                      <span>{currentBranch.timings}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-emerald-700 shrink-0 mt-1" />
                      <a
                        href={`tel:${branchPhone.replace(/[^\d+]/g, '')}`}
                        className="font-mono font-bold text-slate-900 hover:text-red-600"
                      >
                        {branchPhone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Address</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openExternalUrl(currentBranch.maps_url)}
                    className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-slate-200 min-h-[300px] bg-slate-100">
                <button
                  type="button"
                  onClick={() => setDarkMap((d) => !d)}
                  className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-lg bg-white/95 border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs cursor-pointer"
                >
                  {darkMap ? 'Day Map View' : 'Night Map View'}
                </button>
                <iframe
                  title={`${currentBranch.branch_name} Map`}
                  src={buildBranchEmbedUrl(currentBranch)}
                  loading="lazy"
                  className={`w-full h-full min-h-[300px] border-0 transition ${
                    darkMap ? 'invert hue-rotate-180 contrast-90' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
