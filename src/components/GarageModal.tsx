import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  FileCheck2,
  KeyRound,
  LockOpen,
  RotateCw,
  ShieldCheck,
  ShoppingBag,
  Warehouse,
  Wrench,
  X,
} from 'lucide-react';
import type { GarageProfile, SitePhones } from '../types';
import { loadGarageProfileByPhone } from '../lib/supabase';
import { openWhatsApp } from '../lib/helpers';

interface GarageModalProps {
  open: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onBookServiceForBike: (bikeName: string) => void;
  onBrowseCollection: () => void;
  onBrowseAccessories: () => void;
  sitePhones: SitePhones;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  open,
  onClose,
  onShowToast,
  onBookServiceForBike,
  onBrowseCollection,
  onBrowseAccessories,
  sitePhones,
}) => {
  const [stage, setStage] = useState<'phone' | 'otp' | 'dashboard'>('phone');
  const [phone, setPhone] = useState('');
  const [demoOtp, setDemoOtp] = useState('489214');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [profile, setProfile] = useState<GarageProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'services' | 'accessories'>('vehicles');
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!open) return null;

  const handleSendOtp = (e?: React.FormEvent, isResend = false) => {
    e?.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (!/^\d{10}$/.test(clean)) {
      onShowToast('Please enter a valid 10-digit mobile number.');
      return;
    }
    let code = Math.floor(100000 + Math.random() * 900000).toString();
    if (clean === '9014540489') code = '489214';
    if (clean === '9876543210') code = '610234';
    setDemoOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setStage('otp');
    onShowToast(isResend ? `New OTP sent to +91 ${clean}` : `6-Digit OTP sent to +91 ${clean}`);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpInput = (idx: number, val: string) => {
    const digits = val.replace(/\D/g, '');
    const next = [...otpDigits];
    if (digits.length > 1) {
      digits
        .slice(0, 6)
        .split('')
        .forEach((ch, offset) => {
          if (idx + offset < 6) next[idx + offset] = ch;
        });
      setOtpDigits(next);
      otpRefs.current[Math.min(5, idx + digits.length)]?.focus();
      return;
    }
    next[idx] = digits;
    setOtpDigits(next);
    if (digits.length === 1 && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length !== 6) {
      onShowToast('Please enter all 6 OTP digits.');
      return;
    }
    if (entered !== demoOtp && entered !== '489214') {
      onShowToast('Invalid verification code. Tap Auto-Fill Code to test.');
      return;
    }
    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, '');
    const loaded = await loadGarageProfileByPhone(cleanPhone);
    setLoading(false);
    setProfile(
      loaded || {
        owner: 'Valued Rider',
        phone: cleanPhone,
        email: '',
        joined: 'Registered Customer',
        city: 'Hyderabad',
        vip_status: 'Adarsh Rider Member',
        vehicles: [],
        services: [],
        accessory_orders: [],
      }
    );
    setActiveTab('vehicles');
    setStage('dashboard');
    onShowToast('My Garage unlocked!');
  };

  const copyValue = (val: string, msg: string) => {
    navigator.clipboard?.writeText(val).then(
      () => onShowToast(msg),
      () => onShowToast(val)
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${
          stage === 'dashboard' ? 'max-w-5xl' : 'max-w-2xl'
        } bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[94dvh] flex flex-col transition-all`}
      >
        {/* Pinned Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <Warehouse className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                Adarsh Portal · OTP Protected
              </div>
              <h3 className="text-base sm:text-xl font-extrabold text-slate-900 truncate">
                Buyer Ownership &amp; RC Transfer Hub
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close My Garage"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center cursor-pointer transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {stage === 'phone' && (
            <div className="max-w-lg mx-auto space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Look up RC smart card transfer progress, delivery notes, insurance &amp; invoices
                with direct RTO &amp; Billing Desk support. Sign in with your{' '}
                <strong className="text-slate-900">10-digit registered mobile number</strong>.
              </div>

              <form onSubmit={(e) => handleSendOtp(e, false)} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label className="font-bold text-slate-900">Registered Mobile Number *</label>
                    <span className="font-mono text-slate-500">{phone.length}/10 digits</span>
                  </div>
                  <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-red-500 rounded-xl overflow-hidden">
                    <span className="px-3.5 h-12 flex items-center font-mono font-bold text-slate-600 bg-white border-r border-slate-200">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      className="w-full h-12 px-3.5 bg-transparent font-mono font-bold text-base tracking-wider text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <span>Send Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setPhone('9014540489')}
                  className="w-full h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 cursor-pointer transition"
                >
                  Tap to fill Demo Number: <strong className="text-slate-900">9014540489</strong>
                </button>
              </form>

              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-200 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <FileCheck2 className="w-5 h-5 text-red-600 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-900">RC Transfer</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <Wrench className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-900">Service Logs</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-900">Warranty</span>
                </div>
              </div>
            </div>
          )}

          {stage === 'otp' && (
            <div className="max-w-lg mx-auto space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Verification code sent to</span>
                    <strong className="text-base font-mono text-slate-900">+91 {phone}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStage('phone')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-red-600 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-mono font-bold text-red-700">
                  <span className="inline-flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Demo Code: {demoOtp}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpDigits(demoOtp.split(''))}
                    className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs cursor-pointer"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      aria-label={`OTP digit ${i + 1}`}
                      className="w-full h-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-black rounded-xl bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none"
                    />
                  ))}
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSendOtp(undefined, true)}
                    className="py-2.5 px-4 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-600 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Resend OTP</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <LockOpen className="w-4 h-4" />
                    <span>{loading ? 'Loading Garage...' : 'Verify & Open Garage'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {stage === 'dashboard' && profile && (
            <div className="space-y-5">
              {/* Rider Identity Card */}
              <div className="bg-[#1E1B4B] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                    {profile.vip_status} · {profile.city}
                  </div>
                  <h4 className="text-xl font-extrabold mt-0.5">{profile.owner}</h4>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">
                    +91 {profile.phone} {profile.email ? `· ${profile.email}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStage('phone')}
                  className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>
              </div>

              {/* 3 Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab('vehicles')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                    activeTab === 'vehicles'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Owned Vehicles &amp; RC ({profile.vehicles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                    activeTab === 'services'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Service History ({profile.services.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('accessories')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                    activeTab === 'accessories'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Accessory Orders ({profile.accessory_orders.length})
                </button>
              </div>

              {/* Tab 1: Vehicles & RC Transfer */}
              {activeTab === 'vehicles' && (
                <div className="space-y-4">
                  {profile.vehicles.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h5 className="text-base font-bold text-slate-900">
                        No Purchased Motorcycles Linked Yet
                      </h5>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onBrowseCollection();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Browse Superbike Collection
                      </button>
                    </div>
                  ) : (
                    profile.vehicles.map((v) => {
                      const transfer = v.transfer;
                      return (
                        <div
                          key={v.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                            <div>
                              <span className="text-[11px] font-mono font-bold uppercase text-red-600">
                                Invoice {v.invoice_id} · Delivered {v.delivery_date}
                              </span>
                              <h5 className="text-base sm:text-lg font-extrabold text-slate-900">
                                {v.name}
                              </h5>
                            </div>
                            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 self-start">
                              {v.reg_no}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-slate-500 block">Chassis / VIN</span>
                                <strong className="font-mono text-slate-900 truncate block">
                                  {v.vin}
                                </strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyValue(v.vin, 'VIN copied')}
                                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-red-600" />
                              </button>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                              <span className="text-emerald-700 font-bold block">
                                Warranty Status
                              </span>
                              <span className="text-emerald-900 font-medium">{v.warranty}</span>
                            </div>
                          </div>

                          {transfer && (
                            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                  RTO RC Transfer Tracker
                                </span>
                                <span className="text-xs font-mono font-bold text-blue-700">
                                  {transfer.status} · Step {transfer.step_idx}/4
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                {transfer.steps.map((st, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className={`p-2.5 rounded-xl border text-xs ${
                                      st.done
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                                      <CheckCircle2
                                        className={`w-3.5 h-3.5 shrink-0 ${
                                          st.done ? 'text-emerald-600' : 'text-slate-400'
                                        }`}
                                      />
                                      <span>Step {sIdx + 1}</span>
                                    </div>
                                    <div className="font-semibold leading-snug">{st.title}</div>
                                    {st.date && (
                                      <div className="text-[10px] font-mono opacity-80 mt-0.5">
                                        {st.date}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {transfer.notes && (
                                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                  {transfer.notes}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onBookServiceForBike(v.name);
                              }}
                              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                            >
                              Book Service for This Bike
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openWhatsApp(
                                  `Hello Adarsh Motors RTO & Billing Desk, checking RC transfer status for ${v.name} (${v.reg_no}, Invoice ${v.invoice_id}).`,
                                  sitePhones,
                                  'billing'
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                            >
                              Contact RTO / Billing Desk
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 2: Services */}
              {activeTab === 'services' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.services.length === 0 ? (
                    <div className="md:col-span-2 text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-600">
                      No service logs recorded yet.
                    </div>
                  ) : (
                    profile.services.map((s) => (
                      <div
                        key={s.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono font-bold text-emerald-700 uppercase">
                              {s.status}
                            </span>
                            <h5 className="text-sm font-extrabold text-slate-900 mt-0.5">
                              {s.type}
                            </h5>
                            <div className="text-red-600 font-semibold">{s.vehicle}</div>
                          </div>
                          <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                            {s.cost}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-slate-500 block">Service Date</span>
                            <strong className="text-slate-900">{s.date}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Odometer</span>
                            <strong className="font-mono text-slate-900">{s.odometer}</strong>
                          </div>
                        </div>
                        <p className="text-slate-600">
                          <strong className="text-slate-900">Tech:</strong> {s.technician} ·{' '}
                          {s.items}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Accessory Orders */}
              {activeTab === 'accessories' && (
                <div className="space-y-3">
                  {profile.accessory_orders.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <ShoppingBag className="w-8 h-8 text-red-600 mx-auto" />
                      <div className="text-sm font-bold text-slate-900">
                        No Accessories or Riding Gear Orders Yet
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onBrowseAccessories();
                        }}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Browse Accessories &amp; Gear
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.accessory_orders.map((o) => (
                        <div
                          key={o.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-emerald-700">{o.status}</span>
                            <span className="font-mono font-extrabold text-sm text-slate-900">
                              {o.amount}
                            </span>
                          </div>
                          <h5 className="text-sm font-extrabold text-red-600">{o.item}</h5>
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                            <span>Receipt: {o.receipt}</span>
                            <button
                              type="button"
                              onClick={() => copyValue(o.receipt, 'Receipt copied')}
                              className="text-red-600 font-bold cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="text-emerald-800 font-medium">{o.warranty}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
