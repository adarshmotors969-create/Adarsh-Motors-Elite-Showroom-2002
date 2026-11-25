import React, { useEffect, useState } from 'react';
import {
  BadgeIndianRupee,
  Calculator,
  ChevronDown,
  FileWarning,
  Heart,
  Home,
  MapPin,
  Menu,
  Phone,
  Scale,
  Search,
  Warehouse,
  X,
  Bike as BikeIcon,
} from 'lucide-react';
import type { AppView, Branch, SitePhones } from '../types';
import { getSectionPhone } from '../lib/helpers';
import { AdarshLogo } from './AdarshLogo';

interface NavbarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  branches: Branch[];
  activeBranchIdx: number;
  onSelectBranch: (idx: number) => void;
  sitePhones: SitePhones;
  wishlistCount: number;
  compareCount: number;
  onOpenWishlist: () => void;
  onOpenCompare: () => void;
  onOpenSearch: () => void;
  onOpenGarage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onChangeView,
  branches,
  activeBranchIdx,
  onSelectBranch,
  sitePhones,
  wishlistCount,
  compareCount,
  onOpenWishlist,
  onOpenCompare,
  onOpenSearch,
  onOpenGarage,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [drawerOpen]);

  const activeBranch = branches[activeBranchIdx] || branches[0];
  const phoneDisplay = getSectionPhone(sitePhones);
  const telHref = `tel:${phoneDisplay.replace(/[^\d+]/g, '')}`;

  const desktopLinks: { id: AppView; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore Bikes' },
    { id: 'sell', label: 'Sell Bike' },
    { id: 'loans', label: 'Bike Loans' },
    { id: 'challan', label: 'E-Challan' },
    { id: 'service', label: 'Dyno & Service' },
    { id: 'accessories', label: 'Gear' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-13 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-6">
          {/* Left Zone: Hamburger + Official Racing-Red Adarsh Motors Logo + Desktop City Pill */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 lg:flex-initial">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open Navigation Menu"
              className="lg:hidden w-7 h-7 sm:w-9 sm:h-9 rounded-lg text-[#0F172A] hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              onClick={() => onChangeView('home')}
              aria-label="Adarsh Motors Home"
              className="flex items-center shrink-0 cursor-pointer py-1"
            >
              <AdarshLogo variant="light" size="header" showIcon={false} referenceWordmark />
            </button>

            <div className="hidden sm:block relative min-w-0 shrink">
              <button
                type="button"
                onClick={() => setCityOpen((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 h-9 rounded-full bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-[#0F172A] cursor-pointer max-w-full min-w-0 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                <span className="truncate">
                  {activeBranch?.city || 'Hyderabad'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
              </button>

              {cityOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCityOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Select Showroom Hub
                    </div>
                    {branches.map((branch, idx) => (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => {
                          onSelectBranch(idx);
                          setCityOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition cursor-pointer ${
                          idx === activeBranchIdx
                            ? 'bg-red-50 text-[#DC2626] font-bold'
                            : 'text-[#0F172A] hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <div className="truncate">{branch.branch_name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{branch.city}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center Zone: Clean Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-4 xl:gap-5 text-[13px] xl:text-sm font-semibold text-slate-600"
          >
            {desktopLinks.map((link) => {
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onChangeView(link.id)}
                  className={`relative py-5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    isActive ? 'text-[#DC2626] font-bold' : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#DC2626] rounded-t" />
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={onOpenCompare}
              className="relative py-5 whitespace-nowrap shrink-0 cursor-pointer transition-colors text-slate-600 hover:text-[#DC2626] inline-flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Compare</span>
              {compareCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-[#DC2626] text-[10px] font-extrabold tabular-nums">
                  {compareCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Zone: Search Icon + Wishlist Heart + My Garage Account */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Open Search"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-[#0F172A] flex items-center justify-center cursor-pointer shrink-0 transition"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label="Shortlisted Bikes"
              className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#F8FAFC] hover:bg-red-50 border border-slate-200 text-[#0F172A] flex items-center justify-center cursor-pointer shrink-0 transition"
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  wishlistCount > 0 ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[#0F172A]'
                }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenGarage}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 h-7 sm:h-9 rounded-lg sm:rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition"
            >
              <Warehouse className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400 shrink-0" />
              <span className="hidden sm:inline">My Garage</span>
              <span className="sm:hidden">Garage</span>
            </button>
          </div>
        </div>

        {/* Sleek Mobile City / Hub Selector Strip (frees full width for large Logo above) */}
        <div className="sm:hidden border-t border-slate-100 bg-[#FFFBFB] px-3 py-1 flex items-center justify-between gap-2 relative">
          <button
            type="button"
            onClick={() => setCityOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F172A] cursor-pointer min-w-0"
          >
            <MapPin className="w-3 h-3 text-[#DC2626] shrink-0" />
            <span className="truncate">
              {activeBranch?.city || 'Hyderabad'} · {activeBranch?.branch_name || 'Showroom Hub'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Est. 2001
          </span>

          {cityOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setCityOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute left-2.5 top-full mt-1 w-72 max-w-[calc(100vw-20px)] bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select Showroom Hub
                </div>
                {branches.map((branch, idx) => (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => {
                      onSelectBranch(idx);
                      setCityOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition cursor-pointer ${
                      idx === activeBranchIdx
                        ? 'bg-red-50 text-[#DC2626] font-bold'
                        : 'text-[#0F172A] hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="truncate">{branch.branch_name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{branch.city}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bright Spinny-Style Buy Bike / Sell Bike Switcher */}
        {(activeView === 'home' || activeView === 'sell') && (
          <div className="bg-gradient-to-b from-white to-[#FFF5F5] border-t border-slate-100 py-2 px-3 sm:px-6">
            <div className="max-w-md mx-auto grid grid-cols-2 gap-1.5 bg-[#F8FAFC] p-1 rounded-2xl border border-slate-200/90 shadow-2xs">
              <button
                type="button"
                onClick={() => onChangeView('home')}
                className={`relative py-2 text-xs sm:text-sm font-extrabold rounded-xl cursor-pointer transition ${
                  activeView === 'home'
                    ? 'bg-white text-[#DC2626] shadow-xs ring-1 ring-red-200/80'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                <span>Buy Bike</span>
                {activeView === 'home' && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-10 h-[2.5px] rounded-full bg-[#DC2626]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => onChangeView('sell')}
                className={`relative py-2 text-xs sm:text-sm font-extrabold rounded-xl cursor-pointer transition ${
                  activeView === 'sell'
                    ? 'bg-white text-[#DC2626] shadow-xs ring-1 ring-red-200/80'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                <span>Sell Bike</span>
                {activeView === 'sell' && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-10 h-[2.5px] rounded-full bg-[#DC2626]" />
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Slide-out Mobile Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex overflow-hidden overscroll-contain"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 max-w-[85vw] bg-white h-full flex flex-col justify-between p-4 shadow-2xl overflow-y-auto overscroll-contain"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <AdarshLogo variant="light" size="drawer" />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close Menu"
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {desktopLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      onChangeView(link.id);
                      setDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition ${
                      activeView === link.id
                        ? 'bg-red-50 text-[#DC2626]'
                        : 'text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenCompare();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition bg-red-50/70 hover:bg-red-100/80 text-[#0F172A] border border-red-200/70 flex items-center justify-between gap-2 mt-1"
                >
                  <span className="inline-flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Compare Bikes</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold tabular-nums">
                    {compareCount > 0 ? `${compareCount}/3` : '2+ Specs'}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 mt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenGarage();
                }}
                className="w-full h-10 rounded-xl bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Warehouse className="w-4 h-4 text-red-400" />
                <span>My Garage &amp; RC Tracker</span>
              </button>
              <a
                href={telHref}
                className="w-full h-10 rounded-xl bg-[#F8FAFC] border border-slate-200 text-[#0F172A] text-xs font-bold flex items-center justify-center gap-2 tabular-nums"
              >
                <Phone className="w-4 h-4 text-[#DC2626]" />
                <span>Hotline: {phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Spinny Mobile App Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 grid grid-cols-5 h-14 px-1 shadow-[0_-4px_18px_rgba(15,23,42,0.08)]"
      >
        <button
          type="button"
          onClick={() => onChangeView('home')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold cursor-pointer ${
            activeView === 'home' ? 'text-[#DC2626]' : 'text-slate-500'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeView('explore')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold cursor-pointer ${
            activeView === 'explore' ? 'text-[#DC2626]' : 'text-slate-500'
          }`}
        >
          <BikeIcon className="w-4 h-4" />
          <span>Buy Bikes</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeView('sell')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold cursor-pointer ${
            activeView === 'sell' ? 'text-[#DC2626]' : 'text-slate-500'
          }`}
        >
          <BadgeIndianRupee className="w-4 h-4" />
          <span>Sell Bike</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeView('loans')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold cursor-pointer ${
            activeView === 'loans' ? 'text-[#DC2626]' : 'text-slate-500'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Loans</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeView('challan')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold cursor-pointer ${
            activeView === 'challan' ? 'text-[#DC2626]' : 'text-slate-500'
          }`}
        >
          <FileWarning className="w-4 h-4" />
          <span>E-Challan</span>
        </button>
      </nav>
    </>
  );
};
