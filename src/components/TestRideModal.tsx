import React, { useEffect, useState } from 'react';
import { Flag, X } from 'lucide-react';
import type { Branch, SitePhones } from '../types';
import { insertLeadToSupabase } from '../lib/supabase';
import { openWhatsApp } from '../lib/helpers';

interface TestRideModalProps {
  open: boolean;
  bikeName: string;
  branches: Branch[];
  onClose: () => void;
  onShowToast: (msg: string) => void;
  sitePhones: SitePhones;
}

export const TestRideModal: React.FC<TestRideModalProps> = ({
  open,
  bikeName,
  branches,
  onClose,
  onShowToast,
  sitePhones,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(today);
  const [license, setLicense] = useState('Yes');
  const [branch, setBranch] = useState(branches[0]?.branch_name || 'Hyderabad – Main Superbike Showroom');

  useEffect(() => {
    if (!open) return;
    setDate(new Date().toISOString().split('T')[0]);
    if (branches[0]?.branch_name) setBranch(branches[0].branch_name);
  }, [open, branches]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = {
      type: 'test_ride_booking',
      name: name.trim(),
      phone: phone.trim(),
      bike_model: bikeName || 'Superbike Model',
      preferred_date: date,
      license_status: license,
      branch,
      created_at: new Date().toISOString(),
    };

    const waMessage = `*Test Ride Reservation Request*\n*Rider:* ${leadData.name}\n*Phone:* ${leadData.phone}\n*Vehicle:* ${leadData.bike_model}\n*Preferred Date:* ${date}\n*Branch:* ${branch}\n*Driving License:* ${license}`;

    openWhatsApp(waMessage, sitePhones, 'testRide');
    await insertLeadToSupabase(leadData);
    onClose();
    onShowToast('Test Ride Confirmed! Connecting with Sales Desk...');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92dvh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600">
              Experience the Pure Power
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Schedule VIP Test Ride
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Book guided studio rides and physical inspections with our showroom marshals.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Test Ride Modal"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selected Vehicle *
            </label>
            <input
              type="text"
              readOnly
              value={bikeName || 'Superbike Model'}
              className="w-full h-11 px-3.5 rounded-xl bg-red-50 border border-red-200 text-sm font-bold text-red-700 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rider's full name"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile (WhatsApp) *
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valid Driving License *
              </label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="Yes">Yes, MCWG License with me</option>
                <option value="Applying">Learner / Renewal in progress</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Showroom Location *
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
            </select>
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Flag className="w-4 h-4" />
            <span>Confirm Test Ride Reservation</span>
          </button>
        </form>
      </div>
    </div>
  );
};
