import React, { useEffect, useRef, useState } from 'react';
import { Camera, Handshake, Laptop, Trash2, UploadCloud, X } from 'lucide-react';
import type { SitePhones } from '../types';
import { DEFAULT_BIKE_FALLBACK_IMG } from '../data/showroomData';
import { insertLeadToSupabase } from '../lib/supabase';
import { openWhatsApp } from '../lib/helpers';

interface SellModalProps {
  open: boolean;
  prefill?: { bikeModel?: string; year?: string; km?: string };
  onClose: () => void;
  onShowToast: (msg: string) => void;
  sitePhones: SitePhones;
}

interface UploadedPhoto {
  name: string;
  url: string;
}

export const SellModal: React.FC<SellModalProps> = ({
  open,
  prefill,
  onClose,
  onShowToast,
  sitePhones,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [year, setYear] = useState('2022');
  const [km, setKm] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [condition, setCondition] = useState('Very Good (Clean / Well maintained)');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (prefill?.bikeModel) setBikeModel(prefill.bikeModel);
    if (prefill?.year) setYear(prefill.year);
    if (prefill?.km) setKm(prefill.km);
  }, [open, prefill]);

  if (!open) return null;

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const next: UploadedPhoto[] = [];
    files.forEach((f) => {
      if (f.type.startsWith('image/')) {
        next.push({ name: f.name, url: URL.createObjectURL(f) });
      }
    });
    setPhotos((prev) => [...prev, ...next]);
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = {
      type: 'sell_or_exchange_valuation',
      name: name.trim(),
      phone: phone.trim(),
      bike_model: bikeModel.trim(),
      year: year.trim(),
      km: km.trim(),
      expected_price: expectedPrice.trim(),
      condition,
      photos_count: photos.length,
      notes: notes.trim(),
      created_at: new Date().toISOString(),
    };

    const waMsg = `*Sell Your Bike / Exchange Value Request*\n*Owner Name:* ${leadData.name}\n*Phone:* ${leadData.phone}\n*Vehicle:* ${leadData.bike_model} (${leadData.year})\n*Total KM:* ${leadData.km} km\n*Expected Value:* ${leadData.expected_price}\n*Current Condition:* ${condition}\n*Photos Attached:* ${
      photos.length > 0
        ? `${photos.length} bike photos selected (sharing photos in this chat)`
        : 'Will share photos in chat'
    }\n*Notes / Upgrades:* ${leadData.notes || 'None'}`;

    openWhatsApp(waMsg, sitePhones, 'tradeIn');
    await insertLeadToSupabase(leadData);
    onClose();
    onShowToast('Valuation Details Received! Opening WhatsApp to share quotation & photos...');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[94dvh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600">
              Fastest Two-Wheeler Valuation
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Sell / Exchange Bike
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              15-minute doorstep valuation, instant bank payout, and 100% legal RTO transfer
              guarantee.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Sell Modal"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Owner name"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Make &amp; Model *
              </label>
              <input
                type="text"
                required
                value={bikeModel}
                onChange={(e) => setBikeModel(e.target.value)}
                placeholder="e.g. Royal Enfield / Z900"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Year of Reg. *
              </label>
              <input
                type="number"
                required
                min={2000}
                max={2026}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2022"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total KM *</label>
              <input
                type="number"
                required
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="e.g. 8500"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Price (₹ INR) *
              </label>
              <input
                type="text"
                required
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                placeholder="e.g. ₹4,50,000"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Vehicle Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="Excellent (Like New / Mint)">Excellent (Like New / Mint)</option>
                <option value="Very Good (Clean / Well maintained)">
                  Very Good (Clean / Well maintained)
                </option>
                <option value="Good (Normal wear / Minor scratches)">
                  Good (Normal wear / Minor scratches)
                </option>
                <option value="Fair (Needs minor servicing)">Fair (Needs minor servicing)</option>
                <option value="Restoration / Project condition">
                  Restoration / Project condition
                </option>
              </select>
            </div>
          </div>

          {/* Photo Upload Area */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-red-600" />
                  <span>Upload Photos of Current Bike Condition</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Front, Rear, Odometer reading, Left &amp; Right angles
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-700">
                {photos.length} photos
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-red-50 border border-slate-200 text-xs font-semibold text-slate-800 inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <UploadCloud className="w-4 h-4 text-red-600" />
                <span>Gallery / Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Laptop className="w-4 h-4 text-slate-600" />
                <span>Browse Files</span>
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoAdd}
              className="hidden"
            />

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {photos.map((p, idx) => (
                  <div
                    key={`${p.name}-${idx}`}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white"
                  >
                    <img
                      src={p.url}
                      alt={p.name}
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.onerror = null;
                        el.src = DEFAULT_BIKE_FALLBACK_IMG;
                      }}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Details / Upgrades (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Single owner, aftermarket exhaust, full service record..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Handshake className="w-4 h-4" />
            <span>Submit Valuation &amp; Send via WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
};
