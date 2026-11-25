import bmwS1000rrImg from '../assets/images/bmw_s1000rr_studio_1795512788349.jpg';
import kawasakiZ900Img from '../assets/images/kawasaki_z900_studio_1795512788116.jpg';
import ducatiDiavelImg from '../assets/images/ducati_diavel_studio_1795512788530.jpg';
import kawasakiZx10rImg from '../assets/images/kawasaki_zx10r_studio_1795512788918.jpg';
import triumphTripleImg from '../assets/images/triumph_triple_studio_1795512789684.jpg';
import reGt650Img from '../assets/images/re_gt650_studio_1795512790170.jpg';
import hondaCbr650rImg from '../assets/images/honda_cbr650r_studio_1795512790142.jpg';
import ktmSuperdukeImg from '../assets/images/ktm_superduke_studio_1795512811661.jpg';
import yamahaR15Img from '../assets/images/yamaha_r15_studio_1795512790742.jpg';
import budgetCommuterImg from '../assets/images/news_budget_commuter_1795411965542.jpg';
import newsSuperbikeLaunchImg from '../assets/images/news_superbike_launch_1795411965373.jpg';
import partnerPerformanceImg from '../assets/images/partner_banner_performance_1795411965915.jpg';
import riderDeliveryStoryImg from '../assets/images/rider_delivery_story_1795512812577.jpg';
import showroomHubImg from '../assets/images/showroom_hub_photo.jpg';
import serviceDynoHubImg from '../assets/images/service_dyno_hub_1795429952822.jpg';

import akrapovicImg from '../assets/accessories/akrapovic_exhaust.jpg';
import akrapovicDetailImg from '../assets/accessories/akrapovic_exhaust_detail.jpg';
import akrapovicAngleImg from '../assets/accessories/akrapovic_exhaust_angle.jpg';
import scProjectImg from '../assets/accessories/sc_project_exhaust.jpg';
import scProjectDetailImg from '../assets/accessories/sc_project_exhaust_detail.jpg';
import scProjectAngleImg from '../assets/accessories/sc_project_exhaust_angle.jpg';
import bremboImg from '../assets/accessories/brembo_calipers.jpg';
import bremboDetailImg from '../assets/accessories/brembo_calipers_detail.jpg';
import bremboAngleImg from '../assets/accessories/brembo_calipers_angle.jpg';
import daineseImg from '../assets/accessories/dainese_suit.jpg';
import daineseDetailImg from '../assets/accessories/dainese_suit_detail.jpg';
import daineseAngleImg from '../assets/accessories/dainese_suit_angle.jpg';
import agvHelmetImg from '../assets/accessories/agv_carbon_helmet.jpg';
import agvHelmetDetailImg from '../assets/accessories/agv_carbon_helmet_detail.jpg';
import agvHelmetAngleImg from '../assets/accessories/agv_carbon_helmet_angle.jpg';
import ohlinsImg from '../assets/accessories/ohlins_shock.jpg';
import ohlinsDetailImg from '../assets/accessories/ohlins_shock_detail.jpg';
import ohlinsAngleImg from '../assets/accessories/ohlins_shock_angle.jpg';
import evotechImg from '../assets/accessories/evotech_sliders.jpg';
import evotechDetailImg from '../assets/accessories/evotech_sliders_detail.jpg';
import evotechAngleImg from '../assets/accessories/evotech_sliders_angle.jpg';
import pirelliImg from '../assets/accessories/pirelli_tires.jpg';
import pirelliDetailImg from '../assets/accessories/pirelli_tires_detail.jpg';
import pirelliAngleImg from '../assets/accessories/pirelli_tires_angle.jpg';

export const BUNDLED_BIKE_ASSETS = {
  bmwS1000rr: bmwS1000rrImg,
  kawasakiZ900: kawasakiZ900Img,
  ducatiDiavel: ducatiDiavelImg,
  kawasakiZx10r: kawasakiZx10rImg,
  triumphTriple: triumphTripleImg,
  reGt650: reGt650Img,
  hondaCbr650r: hondaCbr650rImg,
  ktmSuperduke: ktmSuperdukeImg,
  yamahaR15: yamahaR15Img,
  budgetCommuter: budgetCommuterImg,
  newsSuperbikeLaunch: newsSuperbikeLaunchImg,
  partnerPerformance: partnerPerformanceImg,
  riderDeliveryStory: riderDeliveryStoryImg,
  showroomHub: showroomHubImg,
  serviceDynoHub: serviceDynoHubImg,
} as const;

export const BUNDLED_ACCESSORY_ASSETS = {
  akrapovic: [akrapovicImg, akrapovicDetailImg, akrapovicAngleImg],
  scProject: [scProjectImg, scProjectDetailImg, scProjectAngleImg],
  brembo: [bremboImg, bremboDetailImg, bremboAngleImg],
  dainese: [daineseImg, daineseDetailImg, daineseAngleImg],
  agvHelmet: [agvHelmetImg, agvHelmetDetailImg, agvHelmetAngleImg],
  ohlins: [ohlinsImg, ohlinsDetailImg, ohlinsAngleImg],
  evotech: [evotechImg, evotechDetailImg, evotechAngleImg],
  pirelli: [pirelliImg, pirelliDetailImg, pirelliAngleImg],
} as const;

const LEGACY_PATH_MAP: Record<string, string> = {
  '/assets/bikes/bmw_s1000rr.jpg': bmwS1000rrImg,
  '/assets/bikes/kawasaki_z900.jpg': kawasakiZ900Img,
  '/assets/bikes/ducati_diavel.jpg': ducatiDiavelImg,
  '/assets/bikes/kawasaki_zx10r.jpg': kawasakiZx10rImg,
  '/assets/bikes/triumph_triple.jpg': triumphTripleImg,
  '/assets/bikes/re_gt650.jpg': reGt650Img,
  '/assets/bikes/honda_cbr650r.jpg': hondaCbr650rImg,
  '/assets/bikes/ktm_superduke.jpg': ktmSuperdukeImg,
  '/assets/bikes/yamaha_r15.jpg': yamahaR15Img,
  '/assets/bikes/rider_delivery_story.jpg': riderDeliveryStoryImg,
  '/assets/generated/news_budget_commuter_1795411965542.jpg': budgetCommuterImg,
  '/assets/generated/news_superbike_launch_1795411965373.jpg': newsSuperbikeLaunchImg,
  '/assets/generated/partner_banner_performance_1795411965915.jpg': partnerPerformanceImg,
  '/assets/aistudio/WhatsApp_Image_2026-11-06_at_7.13.55_PM_a2a6625d.jpeg': showroomHubImg,
  '/assets/accessories/akrapovic_exhaust.jpg': akrapovicImg,
  '/assets/accessories/akrapovic_exhaust_detail.jpg': akrapovicDetailImg,
  '/assets/accessories/akrapovic_exhaust_angle.jpg': akrapovicAngleImg,
  '/assets/accessories/sc_project_exhaust.jpg': scProjectImg,
  '/assets/accessories/sc_project_exhaust_detail.jpg': scProjectDetailImg,
  '/assets/accessories/sc_project_exhaust_angle.jpg': scProjectAngleImg,
  '/assets/accessories/brembo_calipers.jpg': bremboImg,
  '/assets/accessories/brembo_calipers_detail.jpg': bremboDetailImg,
  '/assets/accessories/brembo_calipers_angle.jpg': bremboAngleImg,
  '/assets/accessories/dainese_suit.jpg': daineseImg,
  '/assets/accessories/dainese_suit_detail.jpg': daineseDetailImg,
  '/assets/accessories/dainese_suit_angle.jpg': daineseAngleImg,
  '/assets/accessories/agv_carbon_helmet.jpg': agvHelmetImg,
  '/assets/accessories/agv_carbon_helmet_detail.jpg': agvHelmetDetailImg,
  '/assets/accessories/agv_carbon_helmet_angle.jpg': agvHelmetAngleImg,
  '/assets/accessories/ohlins_shock.jpg': ohlinsImg,
  '/assets/accessories/ohlins_shock_detail.jpg': ohlinsDetailImg,
  '/assets/accessories/ohlins_shock_angle.jpg': ohlinsAngleImg,
  '/assets/accessories/evotech_sliders.jpg': evotechImg,
  '/assets/accessories/evotech_sliders_detail.jpg': evotechDetailImg,
  '/assets/accessories/evotech_sliders_angle.jpg': evotechAngleImg,
  '/assets/accessories/pirelli_tires.jpg': pirelliImg,
  '/assets/accessories/pirelli_tires_detail.jpg': pirelliDetailImg,
  '/assets/accessories/pirelli_tires_angle.jpg': pirelliAngleImg,
};

export function resolveBundledAssetUrl(url: string | undefined | null, fallback: string = bmwS1000rrImg): string {
  const clean = typeof url === 'string' ? url.trim() : '';
  if (!clean) return fallback;
  if (LEGACY_PATH_MAP[clean]) return LEGACY_PATH_MAP[clean];
  if (clean.startsWith('assets/') && LEGACY_PATH_MAP[`/${clean}`]) {
    return LEGACY_PATH_MAP[`/${clean}`];
  }
  // Never pass unbundled /assets/... strings if they weren't found above
  if (clean.startsWith('/assets/') || clean.startsWith('assets/')) {
    return fallback;
  }
  return clean;
}
