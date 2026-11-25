export interface Bike {
  id: string;
  name: string;
  brand: string;
  category: string;
  bike_category?: string;
  year: number;
  km: string;
  engine: string;
  engine_cc?: string;
  hp: string;
  power_hp?: string;
  price_raw: number;
  price: string;
  location: string;
  image_url: string;
  gallery_urls?: string[] | string;
  badge?: string;
  status?: string;
  fuel?: string;
  acceleration?: string;
  tagline?: string;
  owners?: string;
  rto?: string;
  insurance?: string;
  inspection_score?: number;
  addon_name?: string;
  addon_price?: string;
  addon_gear_name?: string;
  addon_gear_price?: string;
  displacement_cc?: string;
  engine_type?: string;
  max_power?: string;
  fuel_type?: string;
  colorways?: string;
  warranty_badge?: string;
  created_at?: string;
  updated_at?: string;
  _imgLoaded?: boolean;
  _galleryLoaded?: boolean;
}

export type AppView = 'home' | 'explore' | 'sell' | 'loans' | 'challan' | 'service' | 'accessories';

export type BudgetTierKey = 'all' | 'under-2l' | '2l-6l' | '6l-12l' | 'above-12l';

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'year-desc' | 'km-asc';

export interface ExploreFilters {
  query: string;
  bikeType: string;
  budget: BudgetTierKey;
  brands: string[];
  engineCcRanges: string[];
  years: string[];
  kmRanges: string[];
  owners: string[];
  rtos: string[];
  sortBy: SortKey;
}

export interface Accessory {
  id: string;
  name: string;
  title?: string;
  category: string;
  brand: string;
  price_raw: number;
  price: string;
  spec: string;
  description?: string;
  fitment: string;
  compatibility_models?: string[] | string;
  in_stock: boolean;
  stock_count?: number;
  status?: string;
  badge: string;
  warranty_badge?: string;
  image_url: string;
  images?: string[];
  gallery_urls?: string[] | string;
  is_visible_on_portal?: boolean;
  is_public?: boolean;
  is_visible?: boolean;
  created_at?: string;
}

export interface Branch {
  id: string;
  name: string;
  branch_name: string;
  city: string;
  address: string;
  timings: string;
  phone: string;
  maps_query: string;
  maps_url: string;
  google_maps_url?: string;
  map_url?: string;
  embed_url?: string;
  status: string;
  is_primary?: boolean;
}

export interface HeroSlide {
  id: string;
  slug?: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  ctaAction: string;
  secondaryText?: string;
  secondaryAction?: string;
  image: string;
  fallbackImage?: string;
  isActive?: boolean;
}

export interface TransferStep {
  title: string;
  date: string;
  done: boolean;
}

export interface GarageVehicle {
  id: string;
  db_id?: string;
  name: string;
  reg_no: string;
  vin: string;
  invoice_id: string;
  delivery_date: string;
  warranty: string;
  warranty_status: string;
  transfer_status?: string;
  transfer_step_idx?: number;
  transfer_notes?: string;
  transfer?: {
    status: string;
    badge_class?: string;
    step_idx: number;
    steps: TransferStep[];
    notes: string;
  };
}

export interface GarageService {
  id: string;
  vehicle: string;
  date: string;
  odometer: string;
  next_service_date?: string;
  next_service_km?: string;
  type: string;
  technician: string;
  cost: string;
  status: string;
  items: string;
}

export interface GarageAccessoryOrder {
  id: string;
  item: string;
  date: string;
  amount: string;
  status: string;
  receipt: string;
  warranty: string;
}

export interface GarageProfile {
  owner: string;
  phone: string;
  email: string;
  joined: string;
  city: string;
  vip_status: string;
  vehicles: GarageVehicle[];
  services: GarageService[];
  accessory_orders: GarageAccessoryOrder[];
}

export interface SitePhones {
  general: string;
  whatsapp: string;
  rsa: string;
  sections: {
    superbikes: string;
    budgetBikes: string;
    accessories: string;
    service: string;
    tradeIn: string;
    testRide: string;
    finance: string;
    billing: string;
    branches: string;
    community: string;
  };
  topBannerEnabled: boolean;
  topBannerText: string;
  instagramUrl: string;
  customerSiteUrl: string;
}

export interface SectionVisibility {
  inventory: boolean;
  accessories: boolean;
  service: boolean;
  sell: boolean;
  finance: boolean;
  legacy: boolean;
  branches: boolean;
}

export interface LeadRecord {
  id?: string;
  type: string;
  name: string;
  phone: string;
  bike_model?: string;
  registration_number?: string;
  service_type?: string;
  preferred_date?: string;
  branch?: string;
  year?: string;
  km?: string;
  expected_price?: string;
  condition?: string;
  photos_count?: number;
  license_status?: string;
  loan_amount?: string;
  tenure?: string;
  employment_type?: string;
  notes?: string;
  status?: string;
  created_at: string;
}
