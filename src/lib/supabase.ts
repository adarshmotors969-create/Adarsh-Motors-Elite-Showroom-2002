import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Accessory,
  Bike,
  Branch,
  GarageProfile,
  HeroSlide,
  LeadRecord,
  SectionVisibility,
  SitePhones,
} from '../types';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_PRIMARY_BRANCH,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_SITE_PHONES,
  SAMPLE_ACCESSORIES,
  SAMPLE_BIKES,
  SAMPLE_GARAGE_PROFILES,
} from '../data/showroomData';
import {
  isAccessoryPubliclyVisible,
  isAccessoryRecord,
  mergeAdminHeroSlides,
  normalizeAccessoryRecord,
  normalizeBikeRecord,
  normalizeBranchRecord,
} from './helpers';

export const SUPABASE_URL = 'https://itmarysfybhcrmvnggyy.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0bWFyeXNmeWJoY3Jtdm5nZ3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4ODIyOTUsImV4cCI6MjEwOTQ1ODI5NX0.1CaJDVO727VVbMNoh8O9Yx_khb7_TMMCp7UkZEIt9Uc';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BIKE_LIGHT_COLUMNS =
  'id,name,brand,category,year,km,engine,hp,price_raw,price,location,badge,fuel,acceleration,tagline,addon_name,addon_price,created_at,fuel_type,displacement_cc,engine_type,max_power,addon_gear_name,addon_gear_price,colorways,warranty_badge,status,bike_category,engine_cc,power_hp,inspection_score,owners,rto,insurance';
const BIKE_CORE_COLUMNS =
  'id,name,brand,category,year,km,engine,hp,price_raw,price,location,badge,fuel,acceleration,tagline,addon_name,addon_price,created_at';

const bikeImageCache = new Map<string, { image_url?: string; gallery_urls?: string[] | string }>();

export async function fetchLiveBikesFromSupabase(): Promise<{
  bikes: Bike[];
  extraAccessories: Accessory[];
  imageIdsToFetch: string[];
}> {
  try {
    let { data, error } = await supabase
      .from('bikes')
      .select(BIKE_LIGHT_COLUMNS)
      .order('created_at', { ascending: false });

    if (error && (error.code === '42703' || String(error.message || '').includes('column'))) {
      const retry = await supabase
        .from('bikes')
        .select(BIKE_CORE_COLUMNS)
        .order('created_at', { ascending: false });
      data = retry.data as any;
      error = retry.error;
    }

    if (error || !Array.isArray(data) || data.length === 0) {
      return { bikes: [...SAMPLE_BIKES], extraAccessories: [], imageIdsToFetch: [] };
    }

    const rawBikes: any[] = [];
    const extraAccessories: Accessory[] = [];

    data.forEach((row: any) => {
      if (isAccessoryRecord(row)) {
        const normAcc = normalizeAccessoryRecord(row);
        if (isAccessoryPubliclyVisible(normAcc)) {
          extraAccessories.push(normAcc);
        }
      } else {
        rawBikes.push(row);
      }
    });

    const bikes = rawBikes.map((r) => {
      const norm = normalizeBikeRecord(r);
      const cached = bikeImageCache.get(norm.id);
      if (cached?.image_url) {
        norm.image_url = cached.image_url;
        norm._imgLoaded = true;
      }
      if (cached?.gallery_urls) {
        norm.gallery_urls = cached.gallery_urls;
        norm._galleryLoaded = true;
      }
      return norm;
    });

    const imageIdsToFetch = bikes
      .filter((b) => !bikeImageCache.get(b.id)?.image_url)
      .map((b) => b.id);

    return {
      bikes: bikes.length > 0 ? bikes : [...SAMPLE_BIKES],
      extraAccessories,
      imageIdsToFetch,
    };
  } catch {
    return { bikes: [...SAMPLE_BIKES], extraAccessories: [], imageIdsToFetch: [] };
  }
}

export async function fetchBikeCoverImagesBatched(
  bikeIds: string[],
  onBatchLoaded: (updates: Record<string, string>) => void
): Promise<void> {
  if (!bikeIds.length) return;
  const BATCH_SIZE = 3;
  const CONCURRENCY = 2;
  const chunks: string[][] = [];
  for (let i = 0; i < bikeIds.length; i += BATCH_SIZE) {
    chunks.push(bikeIds.slice(i, i + BATCH_SIZE));
  }

  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const group = chunks.slice(i, i + CONCURRENCY);
    await Promise.all(
      group.map(async (batch) => {
        try {
          let { data, error } = await supabase
            .from('bikes')
            .select('id,image_url,images')
            .in('id', batch);

          if (error && (error.code === '42703' || String(error.message || '').includes('column'))) {
            const retry = await supabase
              .from('bikes')
              .select('id,image_url')
              .in('id', batch);
            data = retry.data as any;
            error = retry.error;
          }

          if (!error && Array.isArray(data)) {
            const updates: Record<string, string> = {};
            data.forEach((row: any) => {
              const id = String(row.id);
              const img = String(
                row.image_url ||
                  (Array.isArray(row.images) && typeof row.images[0] === 'string'
                    ? row.images[0]
                    : '') ||
                  ''
              ).trim();
              const prev = bikeImageCache.get(id) || {};
              bikeImageCache.set(id, { ...prev, image_url: img });
              if (img) updates[id] = img;
            });
            if (Object.keys(updates).length > 0) onBatchLoaded(updates);
          }
        } catch {
          // Non-fatal fallback
        }
      })
    );
  }
}

export async function fetchBikeFullGallery(
  bikeId: string
): Promise<{ image_url?: string; gallery_urls?: string[] | string } | null> {
  try {
    let { data, error } = await supabase
      .from('bikes')
      .select('id,image_url,images,gallery_urls')
      .eq('id', bikeId)
      .maybeSingle();

    if (error && (error.code === '42703' || String(error.message || '').includes('column'))) {
      const retry = await supabase
        .from('bikes')
        .select('id,image_url,gallery_urls')
        .eq('id', bikeId)
        .maybeSingle();
      data = retry.data as any;
      error = retry.error;
    }

    if (!error && data) {
      const prev = bikeImageCache.get(bikeId) || {};
      const rowAny = data as any;
      const firstImg =
        rowAny.image_url ||
        (Array.isArray(rowAny.images) && typeof rowAny.images[0] === 'string' ? rowAny.images[0] : '') ||
        prev.image_url;
      const gallery =
        rowAny.gallery_urls ||
        (Array.isArray(rowAny.images) && rowAny.images.length > 0 ? rowAny.images : undefined) ||
        prev.gallery_urls;
      const next = {
        image_url: firstImg,
        gallery_urls: gallery,
      };
      bikeImageCache.set(bikeId, next);
      return next;
    }
  } catch {
    // Ignore
  }
  return null;
}

export async function fetchLiveAccessoriesFromSupabase(
  extraAccessories: Accessory[] = []
): Promise<Accessory[]> {
  try {
    let { data, error } = await supabase
      .from('accessories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error && (error.code === '57014' || String(error.message || '').includes('timeout'))) {
      const retry = await supabase
        .from('accessories')
        .select(
          'id,title,category,brand,price,stock_count,description,compatibility_models,warranty_badge,is_visible_on_portal,created_at'
        )
        .order('created_at', { ascending: false });
      data = retry.data as any;
      error = retry.error;
    }

    const baseList =
      !error && Array.isArray(data) && data.length > 0
        ? data.map(normalizeAccessoryRecord).filter(isAccessoryPubliclyVisible)
        : [...SAMPLE_ACCESSORIES];

    const merged = [...baseList];
    extraAccessories.forEach((acc) => {
      const exists = merged.some(
        (m) =>
          m.id === acc.id || m.name.trim().toLowerCase() === acc.name.trim().toLowerCase()
      );
      if (!exists) merged.push(acc);
    });
    return merged;
  } catch {
    return [...SAMPLE_ACCESSORIES];
  }
}

export async function fetchLiveBranchesFromSupabase(): Promise<Branch[]> {
  try {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      return data
        .filter((b: any) => String(b.status || 'active').toLowerCase() !== 'inactive')
        .map((b: any, i: number) => normalizeBranchRecord(b, i));
    }
  } catch {
    // Fallback
  }
  return [{ ...DEFAULT_PRIMARY_BRANCH }];
}

export async function fetchLiveSiteSettingsFromSupabase(): Promise<{
  phones: SitePhones;
  visibility: SectionVisibility;
  heroSlides: HeroSlide[];
}> {
  const phones: SitePhones = {
    ...DEFAULT_SITE_PHONES,
    sections: { ...DEFAULT_SITE_PHONES.sections },
  };
  const visibility: SectionVisibility = { ...DEFAULT_SECTION_VISIBILITY };
  let heroSlides: HeroSlide[] = [...DEFAULT_HERO_SLIDES];

  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error || !Array.isArray(data)) {
      return { phones, visibility, heroSlides };
    }

    const byKey: Record<string, any> = {};
    data.forEach((r: any) => {
      if (r?.key) byKey[r.key] = r;
    });

    const mergePhoneVal = (val: any) => {
      if (!val || typeof val !== 'object') return;
      if (val.general) phones.general = String(val.general);
      if (val.whatsapp) phones.whatsapp = String(val.whatsapp);
      if (val.rsa) phones.rsa = String(val.rsa);
      if (typeof val.topBannerEnabled === 'boolean') phones.topBannerEnabled = val.topBannerEnabled;
      if (val.topBannerText) phones.topBannerText = String(val.topBannerText);
      if (val.instagramUrl) phones.instagramUrl = String(val.instagramUrl);
      if (val.customerSiteUrl) phones.customerSiteUrl = String(val.customerSiteUrl);
      if (val.sections && typeof val.sections === 'object') {
        Object.keys(phones.sections).forEach((k) => {
          const sk = k as keyof SitePhones['sections'];
          if (val.sections[sk]) phones.sections[sk] = String(val.sections[sk]);
        });
      }
    };

    if (byKey.phones?.value) mergePhoneVal(byKey.phones.value);
    if (byKey.general?.value) mergePhoneVal(byKey.general.value);
    if (byKey.global_config?.value) mergePhoneVal(byKey.global_config.value);

    const visRow = byKey.section_visibility?.value || byKey.visibility?.value;
    if (visRow && typeof visRow === 'object') {
      Object.keys(visibility).forEach((k) => {
        const vk = k as keyof SectionVisibility;
        if (typeof visRow[vk] === 'boolean') visibility[vk] = visRow[vk];
      });
    }

    const slideCandidate =
      (Array.isArray(byKey.hero_slides?.value) && byKey.hero_slides.value) ||
      byKey.hero_slides?.hero_slides ||
      byKey.global_config?.hero_slides ||
      byKey.global_config?.value?.heroSlides ||
      byKey.global_config?.value?.hero_slides ||
      [];

    if (Array.isArray(slideCandidate) && slideCandidate.length > 0) {
      heroSlides = mergeAdminHeroSlides(slideCandidate);
    }
  } catch {
    // Fallback
  }

  return { phones, visibility, heroSlides };
}

export async function insertLeadToSupabase(lead: LeadRecord): Promise<void> {
  try {
    await supabase.from('leads').insert([lead]);
  } catch {
    // Fallback local
  }
  try {
    const existing = JSON.parse(localStorage.getItem('adarsh_leads') || '[]');
    existing.unshift(lead);
    localStorage.setItem('adarsh_leads', JSON.stringify(existing.slice(0, 50)));
  } catch {
    // Ignore storage error
  }
}

export function applyLocalTransferOverrides(profile: GarageProfile): GarageProfile {
  try {
    const allOverrides = JSON.parse(localStorage.getItem('adarsh_transfer_overrides') || '{}');
    const phoneOverrides = allOverrides[profile.phone];
    if (!phoneOverrides || !Array.isArray(profile.vehicles)) return profile;

    const vehicles = profile.vehicles.map((v, idx) => {
      const ov =
        phoneOverrides[v.invoice_id] || phoneOverrides[v.id] || phoneOverrides[`idx_${idx}`];
      if (!ov) return v;
      const baseSteps =
        v.transfer?.steps && v.transfer.steps.length === 4
          ? v.transfer.steps
          : [
              { title: 'Dealership Sale Invoice Issued', date: v.delivery_date || '', done: false },
              { title: 'RTO Form 29 & 30 Endorsed', date: '', done: false },
              { title: 'Documents Submitted to RTO', date: '', done: false },
              { title: 'Final RC Dispatched', date: '', done: false },
            ];

      return {
        ...v,
        transfer: {
          ...v.transfer,
          status: ov.status,
          step_idx: ov.step_idx,
          notes: ov.notes ?? v.transfer?.notes ?? '',
          steps: baseSteps.map((st, sIdx) => ({
            ...st,
            done:
              ov.status === 'Completed'
                ? true
                : ov.status === 'Pending'
                ? false
                : sIdx + 1 <= ov.step_idx,
          })),
        },
      };
    });

    return { ...profile, vehicles };
  } catch {
    return profile;
  }
}

export async function loadGarageProfileByPhone(phone: string): Promise<GarageProfile | null> {
  let profile: GarageProfile | null = null;
  try {
    const { data: profData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (profData) {
      profile = profData as GarageProfile;
    }

    const { data: bikesData } = await supabase
      .from('user_bikes')
      .select('*')
      .eq('user_phone', phone);

    if (profile && Array.isArray(bikesData) && bikesData.length > 0) {
      profile.vehicles = (profile.vehicles || []).map((pv, idx) => {
        const dbMatch =
          bikesData.find(
            (b: any) =>
              (b.invoice_id && pv.invoice_id && b.invoice_id === pv.invoice_id) ||
              b.name === pv.name
          ) || bikesData[idx];
        if (!dbMatch) return pv;
        return {
          ...pv,
          db_id: (dbMatch as any).id,
          transfer: {
            ...(pv.transfer || {
              status: 'In Progress',
              step_idx: 2,
              steps: [
                { title: 'Dealership Sale Invoice Issued', date: pv.delivery_date || '', done: true },
                { title: 'RTO Form 29 & 30 Endorsed', date: '', done: true },
                { title: 'Documents Submitted to RTO', date: '', done: false },
                { title: 'Final RC Dispatched', date: '', done: false },
              ],
              notes: '',
            }),
            status: (dbMatch as any).transfer_status || pv.transfer?.status || 'In Progress',
            step_idx: (dbMatch as any).transfer_step_idx || pv.transfer?.step_idx || 2,
            notes:
              (dbMatch as any).transfer_notes !== undefined
                ? (dbMatch as any).transfer_notes
                : pv.transfer?.notes || '',
          },
        };
      });
    }
  } catch {
    // Fallback
  }

  if (!profile && SAMPLE_GARAGE_PROFILES[phone]) {
    profile = JSON.parse(JSON.stringify(SAMPLE_GARAGE_PROFILES[phone]));
  }

  return profile ? applyLocalTransferOverrides(profile) : null;
}
