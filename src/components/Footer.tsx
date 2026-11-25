import React from 'react';
import { Instagram, Phone, Shield } from 'lucide-react';
import type { AppView, Branch, SitePhones } from '../types';
import { getSectionPhone } from '../lib/helpers';
import { AdarshLogo } from './AdarshLogo';

interface FooterProps {
  primaryBranch: Branch;
  sitePhones: SitePhones;
  onChangeView: (view: AppView) => void;
  onOpenGarage: () => void;
  onOpenAdmin: () => void;
  adminLeadCount: number;
}

export const Footer: React.FC<FooterProps> = ({
  primaryBranch,
  sitePhones,
  onChangeView,
  onOpenGarage,
  onOpenAdmin,
  adminLeadCount,
}) => {
  const phoneDisplay = getSectionPhone(sitePhones);

  return (
    <footer className="bg-[#0F172A] text-slate-300 pt-10 pb-24 md:pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          <div className="md:col-span-2 space-y-3">
            <AdarshLogo variant="dark" size="footer" />
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              The Biker&apos;s Paradise · Est. 2001 · Hyderabad. Over 50,000+ certified superbikes,
              cruisers &amp; two-wheelers delivered with 150-point dyno verification and 100% legal
              pan-India RC transfer.
            </p>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="text-xs font-extrabold uppercase tracking-wider text-white">
              Showroom Quick Links
            </div>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onChangeView('explore')}
                  className="hover:text-white cursor-pointer"
                >
                  Buy Certified Superbikes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onChangeView('sell')}
                  className="hover:text-white cursor-pointer"
                >
                  Sell or Exchange Bike
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onChangeView('loans')}
                  className="hover:text-white cursor-pointer"
                >
                  Bike Loan &amp; EMI Calculator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onChangeView('challan')}
                  className="hover:text-white cursor-pointer"
                >
                  Check E-Challan Status
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onChangeView('service')}
                  className="hover:text-white cursor-pointer"
                >
                  Workshop &amp; Dyno Hub
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenGarage}
                  className="hover:text-white cursor-pointer"
                >
                  My Garage (RC Tracker)
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="text-xs font-extrabold uppercase tracking-wider text-white">
              Flagship Showroom
            </div>
            <p className="text-slate-400 leading-relaxed">{primaryBranch.address}</p>
            <a
              href={`tel:${phoneDisplay.replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center gap-2 text-white font-mono font-bold hover:text-[#DC2626] tabular-nums"
            >
              <Phone className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>{phoneDisplay}</span>
            </a>
            <div className="pt-1 flex items-center gap-3">
              <a
                href={sitePhones.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
              >
                <Instagram className="w-4 h-4 text-[#DC2626]" />
                <span>@adarsh_motors9</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>&copy; {new Date().getFullYear()} Adarsh Motors. All rights reserved.</div>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold cursor-pointer transition"
          >
            <Shield className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Showroom Admin Hub</span>
            {adminLeadCount > 0 && (
              <span className="font-mono text-[10px] text-amber-300 tabular-nums">
                ({adminLeadCount})
              </span>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};
