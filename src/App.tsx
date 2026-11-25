import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type {
  Accessory,
  AppView,
  Bike,
  Branch,
  BudgetTierKey,
  ExploreFilters,
  HeroSlide,
  SectionVisibility,
  SitePhones,
} from './types';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_PRIMARY_BRANCH,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_SITE_PHONES,
  SAMPLE_ACCESSORIES,
  SAMPLE_BIKES,
} from './data/showroomData';
import {
  fetchBikeCoverImagesBatched,
  fetchLiveAccessoriesFromSupabase,
  fetchLiveBikesFromSupabase,
  fetchLiveBranchesFromSupabase,
  fetchLiveSiteSettingsFromSupabase,
  supabase,
} from './lib/supabase';
import { getBikeSectionKey, openExternalUrl, openWhatsApp } from './lib/helpers';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { SellView } from './components/SellView';
import { ChallanView, LoansView } from './components/LoansAndChallanViews';
import { ServiceHubSection } from './components/ServiceHubSection';
import { AccessoriesSection } from './components/AccessoriesSection';
import { LegacyAndBranchesSection } from './components/LegacyAndBranchesSection';
import { Footer } from './components/Footer';
import { SearchOverlay } from './components/SearchOverlay';
import { FilterDrawerModal } from './components/FilterDrawerModal';
import { BikeDetailModal } from './components/BikeDetailModal';
import { CompareModal } from './components/CompareModal';
import { AccessoryDetailModal } from './components/AccessoryDetailModal';
import { LightboxModal } from './components/LightboxModal';
import { FinanceModal } from './components/FinanceModal';
import { SellModal } from './components/SellModal';
import { ServiceModal } from './components/ServiceModal';
import { TestRideModal } from './components/TestRideModal';
import { GarageModal } from './components/GarageModal';
import { AdminModal } from './components/AdminModal';

const INITIAL_FILTERS: ExploreFilters = {
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
};

const WISHLIST_STORAGE_KEY = 'adarsh_motors_wishlist_v1';
const RECENT_SEARCH_STORAGE_KEY = 'adarsh_motors_recent_searches_v1';

export default function App() {
  // Core Live Data
  const [bikes, setBikes] = useState<Bike[]>(SAMPLE_BIKES);
  const [accessories, setAccessories] = useState<Accessory[]>(SAMPLE_ACCESSORIES);
  const [branches, setBranches] = useState<Branch[]>([DEFAULT_PRIMARY_BRANCH]);
  const [activeBranchIdx, setActiveBranchIdx] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [sitePhones, setSitePhones] = useState<SitePhones>(DEFAULT_SITE_PHONES);
  const [visibility, setVisibility] = useState<SectionVisibility>(DEFAULT_SECTION_VISIBILITY);
  const [adminLeadCount, setAdminLeadCount] = useState(0);

  // Spinny Multi-View Navigation & Persistent Discovery State
  const [activeView, setActiveView] = useState<AppView>('home');
  const [filters, setFilters] = useState<ExploreFilters>(INITIAL_FILTERS);
  const [accCategory, setAccCategory] = useState('all');
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['Kawasaki Z900', 'BMW S1000RR'];
    } catch {
      return ['Kawasaki Z900', 'BMW S1000RR'];
    }
  });

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Overlays & Modals State
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [filterDrawerState, setFilterDrawerState] = useState<{ open: boolean; tab?: string }>({
    open: false,
    tab: 'brands',
  });
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  const [lightbox, setLightbox] = useState<{
    open: boolean;
    images: string[];
    startIndex: number;
    title: string;
  }>({ open: false, images: [], startIndex: 0, title: '' });

  const [financeModal, setFinanceModal] = useState<{
    open: boolean;
    prefill?: { bikeName?: string; bikePrice?: string; loanAmount?: string; tenure?: string };
  }>({ open: false });

  const [sellModal, setSellModal] = useState<{
    open: boolean;
    prefill?: { bikeModel?: string; year?: string; km?: string };
  }>({ open: false });

  const [serviceModal, setServiceModal] = useState<{
    open: boolean;
    prefillBike?: string;
    prefillPackage?: string;
  }>({ open: false });

  const [testRideModal, setTestRideModal] = useState<{ open: boolean; bikeName: string }>({
    open: false,
    bikeName: '',
  });

  const [garageOpen, setGarageOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 3500);
    return () => clearTimeout(t);
  }, [toastMsg]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore storage errors
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(recentSearches));
    } catch {
      // Ignore storage errors
    }
  }, [recentSearches]);

  const isAnyOverlayOpen = Boolean(
    selectedBike ||
      compareOpen ||
      searchOverlayOpen ||
      filterDrawerState.open ||
      selectedAccessory ||
      lightbox.open ||
      financeModal.open ||
      sellModal.open ||
      serviceModal.open ||
      testRideModal.open ||
      garageOpen ||
      adminOpen
  );

  useEffect(() => {
    if (!isAnyOverlayOpen) return;
    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;
    const prevOverscroll = body.style.overscrollBehavior;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overscrollBehavior = 'none';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      body.style.overscrollBehavior = prevOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [isAnyOverlayOpen]);

  const changeView = useCallback((nextView: AppView) => {
    setActiveView(nextView);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
    return () => cancelAnimationFrame(id);
  }, [activeView]);

  const syncAllFromSupabase = useCallback(async () => {
    const [bikeResult, liveBranches, liveSettings, leadsCountRes] = await Promise.all([
      fetchLiveBikesFromSupabase(),
      fetchLiveBranchesFromSupabase(),
      fetchLiveSiteSettingsFromSupabase(),
      supabase.from('leads').select('*', { count: 'exact', head: true }),
    ]);

    setBikes(bikeResult.bikes);
    setBranches(liveBranches);
    setSitePhones(liveSettings.phones);
    setVisibility(liveSettings.visibility);
    setHeroSlides(liveSettings.heroSlides);
    if (typeof leadsCountRes.count === 'number') setAdminLeadCount(leadsCountRes.count);

    const liveAcc = await fetchLiveAccessoriesFromSupabase(bikeResult.extraAccessories);
    setAccessories(liveAcc);

    if (bikeResult.imageIdsToFetch.length > 0) {
      fetchBikeCoverImagesBatched(bikeResult.imageIdsToFetch, (updates) => {
        setBikes((prev) =>
          prev.map((b) =>
            updates[b.id] ? { ...b, image_url: updates[b.id], _imgLoaded: true } : b
          )
        );
      });
    }
  }, []);

  useEffect(() => {
    syncAllFromSupabase();

    // Parse URL Deep Links (?bike=, ?accessory=, ?section=, ?form=, ?category=, ?brand=)
    try {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category') || params.get('cat');
      const brand = params.get('brand');
      const form = (params.get('form') || params.get('modal') || '').toLowerCase();
      const section = (params.get('section') || '').toLowerCase();

      if (cat || brand) {
        setFilters((prev) => ({
          ...prev,
          bikeType: cat || prev.bikeType,
          brands: brand ? [brand] : prev.brands,
        }));
        setActiveView('explore');
      }

      if (form === 'service') setServiceModal({ open: true });
      else if (form === 'sell') setSellModal({ open: true });
      else if (form === 'finance' || form === 'loan') setFinanceModal({ open: true });
      else if (form === 'testride') {
        setTestRideModal({ open: true, bikeName: params.get('bike') || 'Superbike Model' });
      } else if (form === 'garage') setGarageOpen(true);
      else if (section === 'sell') setActiveView('sell');
      else if (section === 'finance' || section === 'loans') setActiveView('loans');
      else if (section === 'challan') setActiveView('challan');
      else if (section === 'service') setActiveView('service');
      else if (section === 'accessories') setActiveView('accessories');
      else if (section === 'collection' || section === 'explore') setActiveView('explore');
    } catch {
      // Ignore malformed query
    }

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('adarsh-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bikes' }, () => {
        syncAllFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accessories' }, () => {
        syncAllFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'branches' }, () => {
        syncAllFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
        syncAllFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .then((res) => {
            if (typeof res.count === 'number') setAdminLeadCount(res.count);
          });
      })
      .subscribe();

    const handleFocus = () => {
      syncAllFromSupabase();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      supabase.removeChannel(channel);
    };
  }, [syncAllFromSupabase]);

  // Handle ?bike= & ?accessory= deep links once live data arrives
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const bikeParam = params.get('bike');
      const accParam = params.get('accessory') || params.get('acc');
      if (bikeParam && !selectedBike) {
        const match = bikes.find(
          (b) => b.id === bikeParam || b.name.toLowerCase() === bikeParam.toLowerCase()
        );
        if (match) setSelectedBike(match);
      }
      if (accParam && !selectedAccessory) {
        const match = accessories.find(
          (a) => a.id === accParam || a.name.toLowerCase() === accParam.toLowerCase()
        );
        if (match) setSelectedAccessory(match);
      }
    } catch {
      // Ignore
    }
  }, [bikes, accessories, selectedBike, selectedAccessory]);

  const executeSlideAction = (action: string) => {
    const act = action.trim();
    const lower = act.toLowerCase();
    if (lower === 'collection' || lower === 'inventory' || lower === '#collection') {
      changeView('explore');
    } else if (lower === 'finance' || lower === 'loan' || lower === '#finance') {
      changeView('loans');
    } else if (lower === 'sell' || lower === '#sell') {
      changeView('sell');
    } else if (lower === 'service' || lower === '#service') {
      changeView('service');
    } else if (lower === 'legacy' || lower === '#legacy' || lower === 'showroom' || lower === '#showroom') {
      document.getElementById('showroom')?.scrollIntoView({ behavior: 'smooth' });
    } else if (lower.startsWith('whatsapp:')) {
      const parts = act.substring(9).split(':');
      if (parts.length >= 2) {
        openWhatsApp(parts.slice(1).join(':'), sitePhones, parts[0] as keyof SitePhones['sections']);
      } else {
        openWhatsApp(act.substring(9), sitePhones);
      }
    } else if (/^https?:\/\//i.test(act)) {
      openExternalUrl(act);
    }
  };

  const handleShareLink = (title: string, url: string, toastText: string) => {
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {
        navigator.clipboard?.writeText(url);
        showToast(toastText);
      });
    } else {
      navigator.clipboard?.writeText(url);
      showToast(toastText);
    }
  };

  const toggleWishlist = (bikeId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(bikeId);
      const next = exists ? prev.filter((id) => id !== bikeId) : [bikeId, ...prev];
      showToast(exists ? 'Removed from shortlist' : 'Saved to your shortlist');
      return next;
    });
  };

  const toggleCompare = (bikeId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(bikeId)) return prev.filter((id) => id !== bikeId);
      if (prev.length >= 3) {
        showToast('Compare up to 3 motorcycles side by side.');
        return prev;
      }
      return [...prev, bikeId];
    });
  };

  const handleApplySearchQuery = (q: string) => {
    const clean = q.trim();
    if (clean) {
      setRecentSearches((prev) => [clean, ...prev.filter((t) => t !== clean)].slice(0, 5));
    }
    setFilters({ ...INITIAL_FILTERS, query: clean });
    setWishlistOnly(false);
    changeView('explore');
  };

  const handleApplyBudgetFromSearch = (budget: BudgetTierKey) => {
    setFilters({ ...INITIAL_FILTERS, budget });
    setWishlistOnly(false);
    changeView('explore');
  };

  const handleExploreWithFilter = (opts: {
    budget?: BudgetTierKey;
    bikeType?: string;
    brand?: string;
    query?: string;
    kmRanges?: string[];
    owners?: string[];
    sortBy?: ExploreFilters['sortBy'];
  }) => {
    setFilters({
      ...INITIAL_FILTERS,
      budget: opts.budget ?? 'all',
      bikeType: opts.bikeType ?? 'all',
      brands: opts.brand ? [opts.brand] : [],
      query: opts.query ?? '',
      kmRanges: opts.kmRanges ?? [],
      owners: opts.owners ?? [],
      sortBy: opts.sortBy ?? 'featured',
    });
    setWishlistOnly(false);
    changeView('explore');
  };

  const handleReserveBike = (bike: Bike) => {
    const msg = `Hello Adarsh Motors Concierge, I want to BOOK NOW (100% Refundable Hold) for ${bike.year} ${bike.name} (${bike.price}). Please share the refundable booking link & delivery schedule.`;
    openWhatsApp(msg, sitePhones, getBikeSectionKey(bike));
    showToast(`Priority Hold initiated for ${bike.name}. Opening WhatsApp Concierge...`);
  };

  const compareBikes = bikes.filter((b) => compareIds.includes(b.id));
  const activeBranch = branches[activeBranchIdx] || branches[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Navbar
        activeView={activeView}
        onChangeView={(v) => {
          setWishlistOnly(false);
          changeView(v);
        }}
        branches={branches}
        activeBranchIdx={activeBranchIdx}
        onSelectBranch={setActiveBranchIdx}
        sitePhones={sitePhones}
        wishlistCount={wishlistIds.length}
        compareCount={compareIds.length}
        onOpenWishlist={() => {
          setWishlistOnly(true);
          changeView('explore');
        }}
        onOpenCompare={() => setCompareOpen(true)}
        onOpenSearch={() => setSearchOverlayOpen(true)}
        onOpenGarage={() => setGarageOpen(true)}
      />

      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <HomeView
              bikes={bikes}
              branches={branches}
              activeBranchIdx={activeBranchIdx}
              heroSlides={heroSlides}
              wishlistIds={wishlistIds}
              onToggleWishlist={toggleWishlist}
              onOpenSearch={() => setSearchOverlayOpen(true)}
              onSelectBike={(b) => setSelectedBike(b)}
              onExploreWithFilter={handleExploreWithFilter}
              onChangeView={changeView}
              onExecuteSlideAction={executeSlideAction}
              sitePhones={sitePhones}
            />
            <LegacyAndBranchesSection
              branches={branches}
              activeBranchIdx={activeBranchIdx}
              onSelectBranch={setActiveBranchIdx}
              visibility={visibility}
              sitePhones={sitePhones}
              onShowToast={showToast}
            />
          </>
        )}

        {activeView === 'explore' && (
          <ExploreView
            bikes={bikes}
            cityLabel={activeBranch?.city || 'Hyderabad'}
            filters={filters}
            onChangeFilters={setFilters}
            onResetFilters={() => {
              setFilters(INITIAL_FILTERS);
              setWishlistOnly(false);
            }}
            onOpenFilterDrawer={(tab) => setFilterDrawerState({ open: true, tab: tab || 'brands' })}
            wishlistIds={wishlistIds}
            wishlistOnly={wishlistOnly}
            onToggleWishlistOnly={() => setWishlistOnly((v) => !v)}
            onToggleWishlist={toggleWishlist}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
            onOpenCompareModal={() => setCompareOpen(true)}
            onClearCompare={() => setCompareIds([])}
            onSelectBike={(b) => setSelectedBike(b)}
            onApplyLoanForBike={(b) =>
              setFinanceModal({
                open: true,
                prefill: { bikeName: b.name, bikePrice: b.price },
              })
            }
            onChangeView={changeView}
          />
        )}

        {activeView === 'sell' && (
          <SellView
            onOpenSellModal={(prefill) => setSellModal({ open: true, prefill })}
            onChangeView={changeView}
          />
        )}

        {activeView === 'loans' && (
          <LoansView
            bikes={bikes}
            onApplyLoan={(prefill) => setFinanceModal({ open: true, prefill })}
          />
        )}

        {activeView === 'challan' && <ChallanView sitePhones={sitePhones} />}

        {activeView === 'service' && (
          <>
            <ServiceHubSection
              onOpenServiceModal={(pkg) =>
                setServiceModal({ open: true, prefillPackage: pkg })
              }
            />
            <LegacyAndBranchesSection
              branches={branches}
              activeBranchIdx={activeBranchIdx}
              onSelectBranch={setActiveBranchIdx}
              visibility={visibility}
              sitePhones={sitePhones}
              onShowToast={showToast}
            />
          </>
        )}

        {activeView === 'accessories' && (
          <AccessoriesSection
            accessories={accessories}
            category={accCategory}
            onCategoryChange={setAccCategory}
            onOpenAccessoryDetail={(acc) => setSelectedAccessory(acc)}
            onShareLink={handleShareLink}
            sitePhones={sitePhones}
          />
        )}
      </main>

      <Footer
        primaryBranch={activeBranch}
        sitePhones={sitePhones}
        onChangeView={changeView}
        onOpenGarage={() => setGarageOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        adminLeadCount={adminLeadCount}
      />

      {/* Spinny Search & Two-Column Filter Overlays */}
      <SearchOverlay
        open={searchOverlayOpen}
        bikes={bikes}
        recentSearches={recentSearches}
        onClearRecent={() => setRecentSearches([])}
        onClose={() => setSearchOverlayOpen(false)}
        onApplySearchQuery={handleApplySearchQuery}
        onApplyBudget={handleApplyBudgetFromSearch}
        onSelectBike={(b) => setSelectedBike(b)}
      />

      <FilterDrawerModal
        open={filterDrawerState.open}
        initialTab={filterDrawerState.tab}
        filters={filters}
        bikes={bikes}
        onClose={() => setFilterDrawerState({ open: false })}
        onApply={(next) => {
          setFilters(next);
          changeView('explore');
        }}
        onClearAll={() => {
          setFilters(INITIAL_FILTERS);
          setWishlistOnly(false);
        }}
      />

      {/* Interactive Modals */}
      <BikeDetailModal
        bike={selectedBike}
        allBikes={bikes}
        wishlistIds={wishlistIds}
        compareIds={compareIds}
        onToggleWishlist={toggleWishlist}
        onToggleCompare={toggleCompare}
        onOpenCompareModal={() => setCompareOpen(true)}
        onSelectBike={(b) => setSelectedBike(b)}
        onReserveBike={handleReserveBike}
        onClose={() => setSelectedBike(null)}
        onBookTestRide={(bikeName) => {
          setSelectedBike(null);
          setTestRideModal({ open: true, bikeName });
        }}
        onApplyFinance={(prefill) => {
          setSelectedBike(null);
          setFinanceModal({ open: true, prefill });
        }}
        onOpenLightbox={(images, startIndex, title) =>
          setLightbox({ open: true, images, startIndex, title })
        }
        onShareLink={handleShareLink}
        sitePhones={sitePhones}
      />

      <CompareModal
        open={compareOpen}
        bikes={compareBikes}
        allBikes={bikes}
        onClose={() => setCompareOpen(false)}
        onAddBike={(id) => toggleCompare(id)}
        onRemoveBike={(id) => toggleCompare(id)}
        onClearAll={() => setCompareIds([])}
        onBookTestRide={(bikeName) => setTestRideModal({ open: true, bikeName })}
        onApplyLoan={(b) =>
          setFinanceModal({
            open: true,
            prefill: { bikeName: b.name, bikePrice: b.price },
          })
        }
      />

      <AccessoryDetailModal
        accessory={selectedAccessory}
        onClose={() => setSelectedAccessory(null)}
        onOpenLightbox={(images, startIndex, title) =>
          setLightbox({ open: true, images, startIndex, title })
        }
        onShareLink={handleShareLink}
        sitePhones={sitePhones}
      />

      <LightboxModal
        open={lightbox.open}
        images={lightbox.images}
        startIndex={lightbox.startIndex}
        title={lightbox.title}
        onClose={() => setLightbox((prev) => ({ ...prev, open: false }))}
      />

      <FinanceModal
        open={financeModal.open}
        prefill={financeModal.prefill}
        onClose={() => setFinanceModal({ open: false })}
        onShowToast={showToast}
        sitePhones={sitePhones}
      />

      <SellModal
        open={sellModal.open}
        prefill={sellModal.prefill}
        onClose={() => setSellModal({ open: false })}
        onShowToast={showToast}
        sitePhones={sitePhones}
      />

      <ServiceModal
        open={serviceModal.open}
        branches={branches}
        prefillBike={serviceModal.prefillBike}
        prefillPackage={serviceModal.prefillPackage}
        onClose={() => setServiceModal({ open: false })}
        onShowToast={showToast}
        sitePhones={sitePhones}
      />

      <TestRideModal
        open={testRideModal.open}
        bikeName={testRideModal.bikeName}
        branches={branches}
        onClose={() => setTestRideModal({ open: false, bikeName: '' })}
        onShowToast={showToast}
        sitePhones={sitePhones}
      />

      <GarageModal
        open={garageOpen}
        onClose={() => setGarageOpen(false)}
        onShowToast={showToast}
        onBookServiceForBike={(bikeName) =>
          setServiceModal({ open: true, prefillBike: bikeName })
        }
        onBrowseCollection={() => changeView('explore')}
        onBrowseAccessories={() => changeView('accessories')}
        sitePhones={sitePhones}
      />

      <AdminModal
        open={adminOpen}
        bikes={bikes}
        branches={branches}
        onClose={() => setAdminOpen(false)}
        onRefreshData={syncAllFromSupabase}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[70] bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs sm:text-sm font-semibold max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
