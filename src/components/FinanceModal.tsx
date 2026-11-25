import React, { useEffect, useState } from 'react';
import { Calculator, MessageCircle, X } from 'lucide-react';
import type { SitePhones } from '../types';
import { insertLeadToSupabase } from '../lib/supabase';
import { openWhatsApp } from '../lib/helpers';

interface FinanceModalProps {
  open: boolean;
  prefill?: {
    bikeName?: string;
    bikePrice?: string;
    loanAmount?: string;
    tenure?: string;
  };
  onClose: () => void;
  onShowToast: (msg: string) => void;
  sitePhones: SitePhones;
}

const LOAN_PRESETS = [
  '₹1,00,000',
  '₹3,00,000',
  '₹5,00,000',
  '₹10,00,000',
  '₹15,00,000',
  '₹20,00,000+',
];

export const FinanceModal: React.FC<FinanceModalProps> = ({
  open,
  prefill,
  onClose,
  onShowToast,
  sitePhones,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [city, setCity] = useState('');
  const [loanAmount, setLoanAmount] = useState('₹5,00,000');
  const [tenure, setTenure] = useState('36 Months (3 Years)');
  const [employment, setEmployment] = useState('Salaried (Monthly Job)');

  useEffect(() => {
    if (!open) return;
    setBikeModel(prefill?.bikeName || '');
    setLoanAmount(prefill?.loanAmount || '₹5,00,000');
    setTenure(prefill?.tenure || '36 Months (3 Years)');
  }, [open, prefill]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedBike = bikeModel.trim() || 'Any Bike / Showroom Stock';
    const notesParts: string[] = [];
    if (city.trim()) notesParts.push(`City: ${city.trim()}`);
    if (prefill?.bikePrice) notesParts.push(`Bike Price: ${prefill.bikePrice}`);

    const leadData = {
      type: 'finance_loan',
      name: name.trim(),
      phone: phone.trim(),
      bike_model: resolvedBike,
      loan_amount: loanAmount.trim(),
      tenure,
      employment_type: employment,
      notes: notesParts.join(' | '),
      created_at: new Date().toISOString(),
    };

    const waLines = [
      '*New Bike Loan Request*',
      `*Customer Name:* ${leadData.name}`,
      `*Mobile Number:* +91 ${leadData.phone}`,
      city.trim() ? `*City / Area:* ${city.trim()}` : null,
      `*Bike Selected:* ${resolvedBike}`,
      prefill?.bikePrice ? `*Bike Price:* ${prefill.bikePrice}` : null,
      `*Loan Amount Needed:* ${leadData.loan_amount}`,
      `*Loan Time (Tenure):* ${tenure}`,
      `*Work / Income Type:* ${employment}`,
      '',
      'Please check eligibility and guide the customer on loan options.',
    ]
      .filter(Boolean)
      .join('\n');

    openWhatsApp(waLines, sitePhones, 'finance');
    await insertLeadToSupabase(leadData);
    onClose();
    onShowToast('Details sent! Opening WhatsApp to connect with our Loan Team...');
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
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700">
                Up to 90% Funding · Fast 2-Hr Sanction
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                Superbike Loan &amp; EMI Application
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Finance Modal"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {prefill?.bikeName && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-2 text-xs font-bold">
            <span className="text-slate-900 truncate">{prefill.bikeName}</span>
            {prefill.bikePrice && (
              <span className="font-mono text-emerald-700 shrink-0">{prefill.bikePrice}</span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Mobile Number *
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bike Name</label>
              <input
                type="text"
                value={bikeModel}
                onChange={(e) => setBikeModel(e.target.value)}
                placeholder="e.g. Kawasaki Ninja Z900"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your City / Area *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Hyderabad, Jubilee Hills"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">How Much Loan Do You Need? *</label>
              <span className="text-[11px] text-slate-500">Up to 90% On-Road Funding</span>
            </div>
            <input
              type="text"
              required
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="e.g. ₹5,00,000"
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {LOAN_PRESETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLoanAmount(amt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-semibold text-slate-700 hover:text-blue-700 cursor-pointer transition"
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loan Tenure *
              </label>
              <select
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="12 Months (1 Year)">1 Year (12 Months)</option>
                <option value="24 Months (2 Years)">2 Years (24 Months)</option>
                <option value="36 Months (3 Years)">3 Years (36 Months - Popular)</option>
                <option value="48 Months (4 Years)">4 Years (48 Months)</option>
                <option value="60 Months (5 Years)">5 Years (60 Months - Lowest EMI)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work / Income Type *
              </label>
              <select
                value={employment}
                onChange={(e) => setEmployment(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="Salaried (Monthly Job)">Salaried (Monthly Job)</option>
                <option value="Business / Shop Owner">Business / Shop Owner</option>
                <option value="Self-Employed / Professional">Self-Employed / Professional</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Submit &amp; Connect with Loan Desk on WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
};
