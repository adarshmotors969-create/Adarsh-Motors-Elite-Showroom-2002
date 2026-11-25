import React, { useEffect, useState } from 'react';
import { Expand, MessageCircle, Share2, ShieldCheck, Wrench, X } from 'lucide-react';
import type { Accessory, SitePhones } from '../types';
import {
  buildAccessoryShareUrl,
  getAccessoryFallbackImage,
  getAccessoryImagesList,
  openWhatsApp,
} from '../lib/helpers';

interface AccessoryDetailModalProps {
  accessory: Accessory | null;
  onClose: () => void;
  onOpenLightbox: (images: string[], startIndex: number, title: string) => void;
  onShareLink: (title: string, url: string, toastMsg: string) => void;
  sitePhones: SitePhones;
}

export const AccessoryDetailModal: React.FC<AccessoryDetailModalProps> = ({
  accessory,
  onClose,
  onOpenLightbox,
  onShareLink,
  sitePhones,
}) => {
  const [idx, setIdx] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!accessory) return;
    setIdx(0);
    setImages(getAccessoryImagesList(accessory));
  }, [accessory]);

  if (!accessory) return null;

  const fallback = getAccessoryFallbackImage(accessory);
  const mainImg = images[idx] || fallback;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92dvh] flex flex-col"
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600">
              {accessory.brand} · {accessory.category}
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
              {accessory.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                onShareLink(
                  `${accessory.name} | Adarsh Motors`,
                  buildAccessoryShareUrl(accessory, sitePhones),
                  `${accessory.name} link copied!`
                )
              }
              aria-label="Share Accessory"
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center cursor-pointer transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Accessory Modal"
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div
              onClick={() => onOpenLightbox(images, idx, accessory.name)}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-zoom-in"
            >
              <img
                src={mainImg}
                alt={accessory.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.onerror = null;
                  el.src = fallback;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-950/80 text-white text-[11px] font-semibold inline-flex items-center gap-1">
                <Expand className="w-3 h-3" />
                <span>Zoom</span>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {images.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                      i === idx ? 'border-red-600' : 'border-slate-200 opacity-75'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${accessory.name} ${i + 1}`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.onerror = null;
                        el.src = fallback;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Showroom Price</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
                {accessory.price}
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 font-semibold block">Specifications</span>
                <span className="text-slate-900">{accessory.spec}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-semibold block">Compatibility &amp; Sizes</span>
                <span className="text-slate-900 font-medium">{accessory.fitment}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Genuine Brand-Certified Hardware with GST Bill</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Workshop Fitment Available at Jubilee Hills Showroom</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const url = buildAccessoryShareUrl(accessory, sitePhones);
                openWhatsApp(
                  `Hello Adarsh Motors Accessories Desk, I would like to order / check fitment for ${accessory.name} (${accessory.price}).\n\nProduct Link: ${url}`,
                  sitePhones,
                  'accessories'
                );
              }}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order &amp; Enquire on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
