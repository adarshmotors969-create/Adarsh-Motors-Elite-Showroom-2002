import React, { useEffect, useState } from 'react';
import { CalendarCheck, ShieldCheck, X } from 'lucide-react';
import type { Branch, SitePhones } from '../types';
import { insertLeadToSupabase } from '../lib/supabase';
import { openWhatsApp } from '../lib/helpers';

interface ServiceModalProps {
  open: boolean;
  branches: Branch[];
  prefillBike?: string;
  prefillPackage?: string;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  sitePhones: SitePhones;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  open,
  branches,
  prefillBike,
  prefillPackage,
  onClose,
  onShowToast,
  sitePhones,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bike, setBike] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [serviceType, setServiceType] = useState('Scheduled Servicing');
  const [date, setDate] = useState(today);
  const [branch, setBranch] = useState(branches[0]?.branch_name || 'Hyderabad – Main Superbike Showroom');
  const [manualBranch, setManualBranch] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    if (prefillBike) setBike(prefillBike);
    if (prefillPackage) setServiceType(prefillPackage);
    setDate(new Date().toISOString().split('T')[0]);
    if (branches[0]?.branch_name) setBranch(branches[0].branch_name);
  }, [open, prefillBike, prefillPackage, branches]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedBranch =
      manualBranch.trim() ||
      (branch === '__manual__' ? '' : branch) ||
      branches[0]?.branch_name ||
      'Hyderabad – Main Superbike Showroom';
    const upperReg = regNumber.trim().toUpperCase() || 'NOT SPECIFIED';

    const leadData = {
      type: 'service_appointment',
      name: name.trim(),
      phone: phone.trim(),
      bike_model: bike.trim(),
      registration_number: upperReg,
      service_type: serviceType,
      preferred_date: date,
      branch: resolvedBranch,
      notes: notes.trim(),
      created_at: new Date().toISOString(),
    };

    const waMessage = `*New Service Appointment Booking*\n*Rider Name:* ${leadData.name}\n*Phone:* ${leadData.phone}\n*Vehicle:* ${leadData.bike_model}\n*Reg / Number Plate:* ${upperReg}\n*Service Package:* ${serviceType}\n*Scheduled Date:* ${date}\n*Workshop Branch:* ${resolvedBranch}\n*Customer Notes:* ${leadData.notes || 'None'}`;

    openWhatsApp(waMessage, sitePhones, 'service');
    await insertLeadToSupabase(leadData);
    onClose();
    onShowToast(`Service appointment booked for ${leadData.bike_model} [${upperReg}]!`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[94dvh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600">
              Factory-Trained Superbike Care
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Service, Workshop &amp; Dyno Hub
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Motul 300V oil flushes, ECU dyno tuning, brake bleed &amp; laser alignment by master
              technicians.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Service Modal"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                placeholder="10-digit mobile"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Two-Wheeler Model *
              </label>
              <input
                type="text"
                required
                value={bike}
                onChange={(e) => setBike(e.target.value)}
                placeholder="e.g. Kawasaki Z900 / Activa"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Indian HSRP Plate Input */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-900">
                Vehicle Registration Number / Plate *
              </label>
              <span className="font-mono text-[10px] font-bold uppercase text-red-700">
                Required for Bay Slot
              </span>
            </div>
            <div className="flex items-stretch rounded-xl overflow-hidden border-2 border-slate-300 bg-white focus-within:border-red-500">
              <div className="bg-blue-700 text-white px-3 py-2 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-black tracking-widest text-amber-300">IND</span>
              </div>
              <input
                type="text"
                required
                maxLength={15}
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                placeholder="TS 09 AB 1234"
                className="w-full px-3.5 h-11 bg-transparent text-sm font-mono font-black tracking-widest uppercase text-slate-900 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Allocates dedicated mechanic bay &amp; gate verification.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Type *
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="Scheduled Servicing">Scheduled Servicing (Periodic)</option>
                <option value="Inspection & Diagnostics">Inspection &amp; Diagnostics</option>
                <option value="Detailing & Ceramic Finish">Detailing &amp; Ceramic Coating</option>
                <option value="Track Pre-Check & Dyno Tuning">
                  Track Pre-Check &amp; Dyno Tuning
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Date *
              </label>
              <input
                type="date"
                required
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Workshop Branch *
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.branch_name}>
                  {b.branch_name}
                </option>
              ))}
              <option value="__manual__">Write showroom / branch location manually...</option>
            </select>
            {branch === '__manual__' && (
              <input
                type="text"
                value={manualBranch}
                onChange={(e) => setManualBranch(e.target.value)}
                placeholder="Write workshop branch location..."
                className="mt-2 w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specific Requests or Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Chain lubrication, brake pad check, oil upgrade..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Confirm Service Booking &amp; WhatsApp Dispatch</span>
          </button>
        </form>
      </div>
    </div>
  );
};
