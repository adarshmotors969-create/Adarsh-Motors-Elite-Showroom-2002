import type { Accessory, Bike, Branch, HeroSlide, SitePhones } from '../types';
import {
  BUNDLED_ACCESSORY_ASSETS,
  BUNDLED_BIKE_ASSETS,
  resolveBundledAssetUrl,
} from '../data/bundledAssets';
import {
  DEFAULT_BIKE_FALLBACK_IMG,
  DEFAULT_HERO_SLIDES,
  DEFAULT_PRIMARY_BRANCH,
  DEFAULT_SITE_PHONES,
} from '../data/showroomData';

export function getAccessoryFallbackImage(item: Partial<Accessory>): string {
  const text = `${item?.brand || ''} ${item?.name || item?.title || ''} ${item?.category || ''}`.toLowerCase();
  if (text.includes('sc-project') || text.includes('sc project'))
    return BUNDLED_ACCESSORY_ASSETS.scProject[0];
  if (text.includes('brembo')) return BUNDLED_ACCESSORY_ASSETS.brembo[0];
  if (text.includes('dainese') || text.includes('suit'))
    return BUNDLED_ACCESSORY_ASSETS.dainese[0];
  if (text.includes('agv') || text.includes('helmet'))
    return BUNDLED_ACCESSORY_ASSETS.agvHelmet[0];
  if (text.includes('ohlins') || text.includes('öhlins') || text.includes('shock'))
    return BUNDLED_ACCESSORY_ASSETS.ohlins[0];
  if (text.includes('evotech') || text.includes('slider') || text.includes('guard'))
    return BUNDLED_ACCESSORY_ASSETS.evotech[0];
  if (text.includes('pirelli') || text.includes('tire') || text.includes('tyre'))
    return BUNDLED_ACCESSORY_ASSETS.pirelli[0];
  return BUNDLED_ACCESSORY_ASSETS.akrapovic[0];
}

export function isAccessoryRecord(item: Record<string, any> | null | undefined): boolean {
  if (!item) return false;
  const id = String(item.id || '').trim().toLowerCase();
  const cat = String(item.category || '').trim().toLowerCase();
  const badge = String(item.badge || '').trim().toLowerCase();
  const type = String(item.type || '').trim().toLowerCase();
  if (id.startsWith('acc_') || id.startsWith('acc-')) return true;
  if (type === 'accessory' || type === 'accessories') return true;
  if (badge === 'accessory' || badge === 'accessories') return true;
  if (
    cat.includes('accessor') ||
    cat === 'gear' ||
    cat === 'riding gear' ||
    cat.includes('exhaust') ||
    cat === 'performance' ||
    cat === 'protection' ||
    cat.includes('helmet') ||
    cat === 'apparel'
  ) {
    return true;
  }
  return false;
}

export function normalizeAccessoryRecord(row: Record<string, any>): Accessory {
  const rawPrice =
    Number(
      row.price_raw ??
        (typeof row.price === 'number'
          ? row.price
          : String(row.price || '').replace(/[^\d]/g, ''))
    ) || 0;
  const formattedPrice =
    typeof row.price === 'string' && row.price.trim().startsWith('₹')
      ? row.price.trim()
      : rawPrice > 0
      ? `₹${rawPrice.toLocaleString('en-IN')}`
      : 'On Request';

  const fitmentText =
    row.fitment ||
    (Array.isArray(row.compatibility_models) && row.compatibility_models.length > 0
      ? row.compatibility_models.join(' / ')
      : typeof row.compatibility_models === 'string' && row.compatibility_models.trim()
      ? row.compatibility_models.trim()
      : 'Universal Superbike Fitment');

  const inStock =
    typeof row.in_stock === 'boolean'
      ? row.in_stock
      : typeof row.stock_count === 'number'
      ? row.stock_count > 0
      : String(row.status || '').trim().toLowerCase() !== 'sold';

  const badgeLabel =
    row.badge && String(row.badge).trim().toUpperCase() !== 'ACCESSORY'
      ? String(row.badge)
      : row.warranty_badge
      ? 'OFFICIAL WARRANTY'
      : row.category
      ? String(row.category).toUpperCase()
      : 'PRO SPEC';

  return {
    id: String(row.id || `acc-${Date.now()}`),
    name: String(row.name || row.title || 'Performance Accessory'),
    title: row.title,
    brand: String(row.brand || 'Adarsh Spec'),
    category:
      row.category && String(row.category).toLowerCase() !== 'accessories'
        ? String(row.category)
        : String(row.engine || 'Exhausts'),
    price_raw: rawPrice,
    price: formattedPrice,
    spec: String(
      row.spec ||
        row.description ||
        row.tagline ||
        row.warranty_badge ||
        'Authentic Motorsport Hardware'
    ),
    fitment: String(fitmentText),
    in_stock: inStock,
    stock_count: row.stock_count,
    status: row.status,
    badge: badgeLabel,
    warranty_badge: row.warranty_badge,
    image_url: resolveBundledAssetUrl(row.image_url, getAccessoryFallbackImage(row)),
    images: Array.isArray(row.images)
      ? row.images.map((u: string) => resolveBundledAssetUrl(u, getAccessoryFallbackImage(row)))
      : undefined,
    gallery_urls: row.gallery_urls,
    is_visible_on_portal: row.is_visible_on_portal,
    is_public: row.is_public,
    is_visible: row.is_visible,
    created_at: row.created_at,
  };
}

export function isAccessoryPubliclyVisible(item: Partial<Accessory> | null | undefined): boolean {
  if (!item) return false;
  if (item.is_visible_on_portal === false || item.is_public === false || item.is_visible === false) {
    return false;
  }
  return true;
}

export function parsePriceRaw(price: string | number | undefined): number {
  if (typeof price === 'number' && !Number.isNaN(price)) return price;
  const digits = String(price || '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

export function formatINR(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function calcBikeMonthlyEmi(
  priceRaw: number,
  downPaymentPercent = 20,
  annualRate = 10.5,
  tenureMonths = 36
): number {
  const numeric = Number(priceRaw) || 0;
  if (numeric <= 0) return 0;
  const principal = Math.round(numeric * ((100 - downPaymentPercent) / 100));
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate <= 0) return Math.round(principal / Math.max(1, tenureMonths));
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
}

export function parseEngineCcNumber(engineText: string | undefined): number {
  const digits = String(engineText || '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

export function parseKmNumber(kmText: string | undefined): number {
  const digits = String(kmText || '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

export function formatShortLakh(priceRaw: number, fallbackPrice?: string): string {
  if (!Number.isFinite(priceRaw) || priceRaw <= 0) return fallbackPrice || 'Price on Request';
  if (priceRaw >= 100000) {
    const lakh = priceRaw / 100000;
    const formatted = Number.isInteger(lakh) ? lakh.toFixed(0) : lakh.toFixed(2).replace(/0$/, '');
    return `₹${formatted} Lakh`;
  }
  return `₹${Math.round(priceRaw).toLocaleString('en-IN')}`;
}

export function getBikeModelFallbackImage(row: Partial<Bike> & Record<string, any>): string {
  const text = `${row?.name || ''} ${row?.brand || ''} ${row?.category || ''} ${row?.bike_category || ''}`.toLowerCase();
  if (text.includes('s1000') || text.includes('bmw')) return BUNDLED_BIKE_ASSETS.bmwS1000rr;
  if (text.includes('z900')) return BUNDLED_BIKE_ASSETS.kawasakiZ900;
  if (text.includes('zx-10') || text.includes('zx10') || text.includes('ninja') || text.includes('kawasaki')) {
    return BUNDLED_BIKE_ASSETS.kawasakiZx10r;
  }
  if (text.includes('diavel') || text.includes('ducati') || text.includes('panigale')) {
    return BUNDLED_BIKE_ASSETS.ducatiDiavel;
  }
  if (text.includes('triumph') || text.includes('triple') || text.includes('tiger')) {
    return BUNDLED_BIKE_ASSETS.triumphTriple;
  }
  if (text.includes('gt 650') || text.includes('gt650') || text.includes('interceptor') || text.includes('royal enfield')) {
    return BUNDLED_BIKE_ASSETS.reGt650;
  }
  if (text.includes('cbr') || text.includes('650r') || text.includes('fireblade')) {
    return BUNDLED_BIKE_ASSETS.hondaCbr650r;
  }
  if (text.includes('r15') || text.includes('yamaha') || text.includes('r1')) {
    return BUNDLED_BIKE_ASSETS.yamahaR15;
  }
  if (text.includes('ktm') || text.includes('duke')) return BUNDLED_BIKE_ASSETS.ktmSuperduke;
  if (text.includes('activa') || text.includes('scooter') || text.includes('commuter') || text.includes('budget')) {
    return BUNDLED_BIKE_ASSETS.budgetCommuter;
  }
  if (text.includes('cruiser') || text.includes('harley')) return BUNDLED_BIKE_ASSETS.ducatiDiavel;

  // Rotate cleanly across distinct bundled studio photos based on id/name hash
  const pool = [
    BUNDLED_BIKE_ASSETS.newsSuperbikeLaunch,
    BUNDLED_BIKE_ASSETS.bmwS1000rr,
    BUNDLED_BIKE_ASSETS.kawasakiZ900,
    BUNDLED_BIKE_ASSETS.triumphTriple,
    BUNDLED_BIKE_ASSETS.hondaCbr650r,
    BUNDLED_BIKE_ASSETS.ktmSuperduke,
  ];
  const seed = `${row?.id || ''}${row?.name || ''}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length] || DEFAULT_BIKE_FALLBACK_IMG;
}

export function normalizeBikeRecord(row: Record<string, any>): Bike {
  const priceRaw = Number(row.price_raw) || parsePriceRaw(row.price) || 0;
  const formattedPrice =
    typeof row.price === 'string' && row.price.trim().startsWith('₹')
      ? row.price.trim()
      : priceRaw > 0
      ? formatINR(priceRaw)
      : 'Price on Request';

  const engineVal = String(
    row.engine_cc || row.engine || row.displacement_cc || row.engine_type || '998 cc'
  );
  const hpVal = String(row.power_hp || row.hp || row.max_power || '150 hp');
  const categoryVal = String(row.bike_category || row.category || 'Superbikes');

  const rawDbImage =
    (typeof row.image_url === 'string' && row.image_url.trim()) ||
    (Array.isArray(row.images) && typeof row.images[0] === 'string' && row.images[0].trim()) ||
    '';
  const modelFallback = getBikeModelFallbackImage(row);
  const dbImage = rawDbImage ? resolveBundledAssetUrl(rawDbImage, modelFallback) : '';

  return {
    id: String(row.id || `bike-${Date.now()}`),
    name: String(row.name || 'Certified Motorcycle'),
    brand: String(row.brand || 'Adarsh Select'),
    category: categoryVal,
    bike_category: categoryVal,
    year: Number(row.year) || 2023,
    km: String(row.km || '2,500 km'),
    engine: engineVal,
    engine_cc: engineVal,
    hp: hpVal,
    power_hp: hpVal,
    price_raw: priceRaw,
    price: formattedPrice,
    location: String(row.location || DEFAULT_PRIMARY_BRANCH.branch_name),
    image_url: dbImage || modelFallback,
    gallery_urls: row.gallery_urls || (Array.isArray(row.images) ? row.images : undefined),
    badge: String(row.badge || 'VERIFIED'),
    status: String(row.status || 'Available'),
    fuel: String(row.fuel || row.fuel_type || 'Petrol'),
    acceleration: String(row.acceleration || '3.2s'),
    owners: String(row.owners || '1st Owner'),
    rto: String(row.rto || 'TS09'),
    insurance: String(row.insurance || 'Comprehensive Valid'),
    inspection_score: Number(row.inspection_score) || 9.8,
    tagline: String(
      row.tagline || '150-Point inspected machine with verified RTO transfer & warranty.'
    ),
    addon_name: row.addon_name || row.addon_gear_name || '',
    addon_price: row.addon_price || row.addon_gear_price || '',
    warranty_badge: row.warranty_badge,
    created_at: row.created_at,
    updated_at: row.updated_at,
    _imgLoaded: Boolean(dbImage),
    _galleryLoaded: Boolean(row.gallery_urls || (Array.isArray(row.images) && row.images.length > 0)),
  };
}

export function getBikeImagesList(bike: Partial<Bike> | null | undefined): string[] {
  if (!bike) return [DEFAULT_BIKE_FALLBACK_IMG];
  const list: string[] = [];
  if (bike.image_url && typeof bike.image_url === 'string' && bike.image_url.trim()) {
    list.push(bike.image_url.trim());
  }
  if (Array.isArray(bike.gallery_urls)) {
    bike.gallery_urls.forEach((u) => {
      if (typeof u === 'string' && u.trim() && !list.includes(u.trim())) {
        list.push(u.trim());
      }
    });
  } else if (typeof bike.gallery_urls === 'string' && bike.gallery_urls.trim()) {
    try {
      const parsed = JSON.parse(bike.gallery_urls);
      if (Array.isArray(parsed)) {
        parsed.forEach((u) => {
          if (typeof u === 'string' && u.trim() && !list.includes(u.trim())) {
            list.push(u.trim());
          }
        });
      }
    } catch {
      bike.gallery_urls
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((u) => {
          if (!list.includes(u)) list.push(u);
        });
    }
  }
  const fallback = getBikeModelFallbackImage(bike as any);
  if (list.length === 0) list.push(fallback);
  return list.map((u) => resolveBundledAssetUrl(u, fallback));
}

export function getAccessoryImagesList(acc: Partial<Accessory> | null | undefined): string[] {
  if (!acc) return [BUNDLED_ACCESSORY_ASSETS.akrapovic[0]];
  const fallback = getAccessoryFallbackImage(acc);
  const list: string[] = [];
  if (acc.image_url && acc.image_url.trim()) list.push(acc.image_url.trim());
  if (Array.isArray(acc.images)) {
    acc.images.forEach((u) => {
      if (u && u.trim() && !list.includes(u.trim())) list.push(u.trim());
    });
  }
  if (Array.isArray(acc.gallery_urls)) {
    acc.gallery_urls.forEach((u) => {
      if (u && u.trim() && !list.includes(u.trim())) list.push(u.trim());
    });
  }
  if (list.length === 0) list.push(fallback);
  return list.map((u) => resolveBundledAssetUrl(u, fallback));
}

export function normalizeBranchRecord(row: Record<string, any>, idx = 0): Branch {
  const bName = String(row.branch_name || row.name || DEFAULT_PRIMARY_BRANCH.branch_name);
  const address = String(row.address || DEFAULT_PRIMARY_BRANCH.address);
  const mapsQuery = String(row.maps_query || address);
  const mapsUrl = String(
    row.maps_url ||
      row.google_maps_url ||
      row.map_url ||
      `https://maps.google.com/?q=${encodeURIComponent(mapsQuery)}`
  );
  return {
    id: String(row.id || `branch-${idx + 1}`),
    name: bName,
    branch_name: bName,
    city: String(row.city || 'Hyderabad'),
    address,
    timings: String(row.timings || DEFAULT_PRIMARY_BRANCH.timings),
    phone: String(row.phone || DEFAULT_PRIMARY_BRANCH.phone),
    maps_query: mapsQuery,
    maps_url: mapsUrl,
    embed_url: row.embed_url,
    status: String(row.status || 'active'),
    is_primary: Boolean(row.is_primary),
  };
}

export function buildBranchEmbedUrl(branch: Branch): string {
  if (branch.embed_url && branch.embed_url.startsWith('http')) return branch.embed_url;
  const q = encodeURIComponent(branch.maps_query || branch.address || branch.branch_name);
  return `https://maps.google.com/maps?q=${q}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
}

export function getSectionPhone(
  phones: SitePhones,
  sectionKey?: keyof SitePhones['sections']
): string {
  if (sectionKey && phones.sections[sectionKey]) {
    return phones.sections[sectionKey];
  }
  return phones.general || DEFAULT_SITE_PHONES.general;
}

export function getSectionWhatsAppDigits(
  phones: SitePhones,
  sectionKey?: keyof SitePhones['sections']
): string {
  const raw =
    (sectionKey && phones.sections[sectionKey]) ||
    phones.whatsapp ||
    phones.general ||
    DEFAULT_SITE_PHONES.whatsapp;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits || DEFAULT_SITE_PHONES.whatsapp;
}

export function getBikeSectionKey(bike?: Partial<Bike> | string | null): keyof SitePhones['sections'] {
  const cat =
    typeof bike === 'string'
      ? bike.toLowerCase()
      : String(bike?.category || '').toLowerCase();
  if (cat.includes('scooter') || cat.includes('mid-range') || cat.includes('commuter')) {
    return 'budgetBikes';
  }
  return 'superbikes';
}

export function openExternalUrl(url: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function openWhatsApp(
  message: string,
  phones: SitePhones,
  sectionKey?: keyof SitePhones['sections']
): void {
  const waDigits = getSectionWhatsAppDigits(phones, sectionKey);
  const url = `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
  openExternalUrl(url);
}

export function getShareBaseUrl(phones: SitePhones): string {
  const configured = phones.customerSiteUrl?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${window.location.pathname}`;
  }
  return '';
}

export function buildBikeShareUrl(bike: Partial<Bike>, phones: SitePhones): string {
  const base = getShareBaseUrl(phones);
  const id = encodeURIComponent(String(bike.id || ''));
  return `${base}?bike=${id}`;
}

export function buildAccessoryShareUrl(acc: Partial<Accessory>, phones: SitePhones): string {
  const base = getShareBaseUrl(phones);
  const id = encodeURIComponent(String(acc.id || ''));
  return `${base}?accessory=${id}`;
}

export function mergeAdminHeroSlides(adminSlides: Record<string, any>[] = []): HeroSlide[] {
  if (!Array.isArray(adminSlides) || adminSlides.length === 0) {
    return DEFAULT_HERO_SLIDES.map((s) => ({ ...s }));
  }
  const active = adminSlides.filter((s) => s && s.isActive !== false);
  const source = active.length > 0 ? active : adminSlides;
  const legacyMap: Record<string, number> = {
    buy: 1,
    sell: 2,
    service: 3,
    loan: 4,
    legacy: 5,
  };
  return source.map((s, idx) => {
    const slug = String(s.slug || s.id || '').toLowerCase();
    const base =
      DEFAULT_HERO_SLIDES.find(
        (b) => b.id === slug || legacyMap[b.id] === Number(s.id)
      ) || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length];
    const adminImg = String(
      s.image ||
        s.image_url ||
        s.bg_image ||
        s.backgroundImage ||
        s.background_image ||
        s.banner_image ||
        s.photo ||
        s.url ||
        s.src ||
        ''
    ).trim();
    const rawTitle =
      typeof s.title === 'string' && s.title.trim()
        ? s.title.replace(/<[^>]*>/g, '').trim()
        : base.title;
    return {
      ...base,
      badge: (typeof s.badge === 'string' && s.badge.trim()) || base.badge,
      title: rawTitle,
      description:
        (typeof s.description === 'string' && s.description.trim()) ||
        (typeof s.subtitle === 'string' && s.subtitle.trim()) ||
        base.description,
      ctaText:
        (typeof s.ctaText === 'string' && s.ctaText.trim()) ||
        (typeof s.buttonText === 'string' && s.buttonText.trim()) ||
        base.ctaText,
      ctaAction:
        (typeof s.ctaAction === 'string' && s.ctaAction.trim()) ||
        (typeof s.buttonTarget === 'string' && s.buttonTarget.trim()) ||
        base.ctaAction,
      secondaryText:
        typeof s.secondaryText === 'string' && s.secondaryText.trim()
          ? s.secondaryText.trim()
          : base.secondaryText,
      secondaryAction:
        typeof s.secondaryAction === 'string' && s.secondaryAction.trim()
          ? s.secondaryAction.trim()
          : base.secondaryAction,
      image: adminImg ? resolveBundledAssetUrl(adminImg, base.image) : base.image,
      fallbackImage: base.image,
    };
  });
}
