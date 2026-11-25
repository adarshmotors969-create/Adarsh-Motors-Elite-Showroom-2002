import React, { useMemo, useState } from 'react';
import {
  BadgeCheck,
  BadgeIndianRupee,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileWarning,
  Landmark,
  MessageCircle,
  ShieldCheck,
  Star,
} from 'lucide-react';
import type { Bike, SitePhones } from '../types';
import { formatINR, openWhatsApp } from '../lib/helpers';

interface LoansViewProps {
  bikes: Bike[];
  onApplyLoan: (prefill?: {
    bikeName?: string;
    bikePrice?: string;
    loanAmount?: string;
    tenure?: string;
  }) => void;
}

const LOAN_PARTNERS = [
  'HDFC Bank Two-Wheeler',
  'ICICI Superbike Finance',
  'IDFC First Bank',
  'Kotak Mahindra Prime',
];

const LOAN_FAQS = [
  {
    q: 'How much funding can I get for a pre-owned superbike?',
    a: 'Eligible salaried and business profiles can unlock up to 90% on-road funding with 2-hour spot sanction at Adarsh Motors.',
  },
  {
    q: 'What is the interest rate and tenure range?',
    a: 'Interest rates start at 10.5% p.a. depending on CIBIL profile, with flexible repayment tenures from 12 to 60 months.',
  },
  {
    q: 'Which documents are needed for 2-hour loan approval?',
    a: 'PAN Card, Aadhaar, latest 3 months bank statements, and salary slips or ITR returns are sufficient for instant underwriting.',
  },
];

export const LoansView: React.FC<LoansViewProps> = ({ bikes, onApplyLoan }) => {
  const [selectedBikeId, setSelectedBikeId] = useState('');
  const [loanAmount, setLoanAmount] = useState(800000);
  const [rate, setRate] = useState(10.5);
  const [tenureMonths, setTenureMonths] = useState(36);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const selectedBike = useMemo(
    () => bikes.find((b) => b.id === selectedBikeId) || null,
    [bikes, selectedBikeId]
  );

  const { emi, totalPayable, totalInterest } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = Math.max(12, tenureMonths);
    const factor = Math.pow(1 + r, n);
    const monthly = Math.round((loanAmount * r * factor) / (factor - 1));
    const payable = monthly * n;
    return {
      emi: monthly,
      totalPayable: payable,
      totalInterest: Math.max(0, payable - loanAmount),
    };
  }, [loanAmount, rate, tenureMonths]);

  return (
    <div className="bg-[#F8FAFC] pb-20 md:pb-12">
      {/* Dark Loan Hero (Screenshot 13) */}
      <section className="bg-[#0F172A] text-white py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold uppercase tracking-wider">
              Adarsh FinServe · 2-Hour Sanction
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Get Instant Superbike &amp; Bike Loans up to 90% On-Road
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Low EMI financing starting at 10.5% APR, zero hidden charges, and instant digital approval.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {[
              { title: 'Zero Hidden Fees', sub: '100% transparent breakup', icon: ShieldCheck },
              { title: 'Up to 60 Months', sub: 'Flexible EMI tenures', icon: Clock },
              { title: '2-Hr Approval', sub: 'Fast spot sanction', icon: BadgeIndianRupee },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="bg-white/10 border border-white/15 rounded-2xl p-3 sm:p-4 space-y-1"
                >
                  <Icon className="w-4 h-4 text-[#DC2626]" />
                  <div className="text-xs sm:text-sm font-extrabold">{b.title}</div>
                  <div className="text-[10px] sm:text-xs text-slate-300">{b.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 -mt-3 space-y-6 pt-6">
        {/* Get Your Loan Offer Instantly Card */}
        <section className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-[#0F172A]">
                Get your loan offer in 3 simple steps
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pick a bike &rarr; Adjust EMI &rarr; Instant KYC &amp; Disbursal
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onApplyLoan({
                  bikeName: selectedBike?.name || 'Superbike / Showroom Stock',
                  bikePrice: selectedBike?.price,
                  loanAmount: formatINR(loanAmount),
                  tenure: `${tenureMonths} Months`,
                })
              }
              className="h-11 px-5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-extrabold cursor-pointer transition shrink-0"
            >
              Unlock My Loan Offer &rarr;
            </button>
          </div>
        </section>

        {/* Interactive EMI Calculator */}
        <section className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-[#DC2626]" />
            <h2 className="text-base sm:text-xl font-extrabold text-[#0F172A]">
              Interactive Superbike EMI Calculator
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  Optional: Pre-fill from Live Inventory
                </label>
                <select
                  value={selectedBikeId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedBikeId(id);
                    const b = bikes.find((item) => item.id === id);
                    if (b && b.price_raw > 0) {
                      setLoanAmount(Math.round(b.price_raw * 0.8));
                    }
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs sm:text-sm font-semibold text-[#0F172A]"
                >
                  <option value="">Custom Loan Amount</option>
                  {bikes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-600">Loan Amount</span>
                  <span className="text-[#0F172A] tabular-nums">{formatINR(loanAmount)}</span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={3000000}
                  step={25000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-[#DC2626] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-600">Interest Rate (APR)</span>
                  <span className="text-[#0F172A] tabular-nums">{rate.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={9.5}
                  max={16}
                  step={0.25}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-[#DC2626] cursor-pointer"
                />
              </div>

              <div>
                <div className="text-xs font-bold text-slate-600 mb-2">Loan Duration</div>
                <div className="flex flex-wrap gap-2">
                  {[12, 24, 36, 48, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenureMonths(m)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                        tenureMonths === m
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-[#F8FAFC] border border-slate-200 text-[#0F172A]'
                      }`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#0F172A] text-white rounded-2xl p-5 space-y-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Estimated Monthly EMI
                </div>
                <div className="text-3xl font-extrabold text-[#DC2626] tabular-nums mt-0.5">
                  {formatINR(emi)}
                  <span className="text-sm text-slate-300 font-semibold"> / mo</span>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Principal Loan</span>
                  <span className="font-bold tabular-nums">{formatINR(loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Interest Payable</span>
                  <span className="font-bold tabular-nums">{formatINR(totalInterest)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                  <span className="font-bold">Total Payable</span>
                  <span className="font-extrabold tabular-nums">{formatINR(totalPayable)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onApplyLoan({
                    bikeName: selectedBike?.name || 'Superbike Finance',
                    bikePrice: selectedBike?.price,
                    loanAmount: formatINR(loanAmount),
                    tenure: `${tenureMonths} Months`,
                  })
                }
                className="w-full h-11 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer transition"
              >
                Apply With Instant Eligibility
              </button>
            </div>
          </div>
        </section>

        {/* Banking Partners */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Landmark className="w-4 h-4 text-[#DC2626]" />
            <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
              Authorized Banking &amp; NBFC Partners
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {LOAN_PARTNERS.map((p) => (
              <div
                key={p}
                className="px-3 py-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] text-center"
              >
                {p}
              </div>
            ))}
          </div>
        </section>

        {/* Loan FAQs */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-2">
          <h2 className="text-base font-extrabold text-[#0F172A] mb-2">
            Frequently Asked Questions
          </h2>
          {LOAN_FAQS.map((item, i) => (
            <div key={item.q} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-4 py-3 text-left flex items-center justify-between gap-2 text-xs sm:text-sm font-bold text-[#0F172A] cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition ${openFaq === i ? 'rotate-180 text-[#DC2626]' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-xs text-slate-600 leading-relaxed">{item.a}</div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

interface ChallanViewProps {
  sitePhones: SitePhones;
}

const CHALLAN_FAQS = [
  {
    q: 'Why should I verify pending traffic e-challans before buying or selling?',
    a: 'RTO name transfer and NOC clearance cannot be completed if pending Telangana or Parivahan e-challans remain unpaid against the registration number.',
  },
  {
    q: 'Does Adarsh Motors include e-challan clearance on every bike sold?',
    a: 'Yes. Every certified superbike and commuter bike at Adarsh Motors undergoes zero-challan clearance verification before delivery.',
  },
];

export const ChallanView: React.FC<ChallanViewProps> = ({ sitePhones }) => {
  const [plate, setPlate] = useState('');
  const [checkedPlate, setCheckedPlate] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = plate.trim().toUpperCase();
    if (!cleaned) return;
    setCheckedPlate(cleaned);
  };

  return (
    <div className="bg-[#F8FAFC] pb-20 md:pb-12">
      {/* Challan Hero (Screenshot 14) */}
      <section className="bg-[#0F172A] text-white py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-1.5">
            <span className="inline-block px-3 py-1 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold uppercase tracking-wider">
              RTO &amp; Parivahan Desk
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              One-Click E-Challan Discovery
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Check pending traffic challans &amp; request instant RTO clearance support.
            </p>
          </div>

          <div className="bg-white text-[#0F172A] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
            <form onSubmit={handleCheck} className="space-y-3">
              <div className="flex items-stretch border-2 border-slate-200 focus-within:border-[#DC2626] rounded-xl overflow-hidden bg-[#F8FAFC]">
                <div className="px-3 bg-slate-900 text-white flex items-center justify-center text-[10px] font-extrabold tracking-widest">
                  IND
                </div>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  placeholder="Enter Bike Number (e.g. TS09EG7744)"
                  required
                  className="flex-1 px-3.5 h-12 bg-transparent text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-extrabold uppercase tracking-wider cursor-pointer transition"
              >
                Check Challan Status
              </button>
            </form>

            {checkedPlate && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Live RTO Lookup Queued for {checkedPlate}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-[10px] font-bold text-emerald-700">
                    VERIFIED DESK
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Our Telangana &amp; Pan-India RTO Desk pulls the official Parivahan &amp; TS
                  Traffic Challan PDF with zero-pendency clearance for {checkedPlate}.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    openWhatsApp(
                      `Hello Adarsh Motors RTO Desk, please check pending E-Challans and NOC status for bike registration number: ${checkedPlate}.`,
                      sitePhones,
                      'billing'
                    )
                  }
                  className="w-full h-10 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Get Official Challan PDF on WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
            <BadgeCheck className="w-5 h-5 text-[#DC2626]" />
            <div className="text-sm font-extrabold text-[#0F172A]">
              Why clear challans before transfer?
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pending traffic fines block Form 29/30 endorsement, insurance renewal, and clean bank NOC release.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-1 text-amber-500 font-extrabold text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.8★ Rated RTO Desk</span>
            </div>
            <div className="text-sm font-extrabold text-[#0F172A]">Hassle-Free RC Clearance</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every machine sold at Adarsh Motors carries zero-pending-challan assurance.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <FileWarning className="w-4 h-4 text-[#DC2626]" />
            <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
              Challan &amp; RC FAQs
            </h2>
          </div>
          {CHALLAN_FAQS.map((f, i) => (
            <div key={f.q} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 text-xs font-bold text-[#0F172A] cursor-pointer"
              >
                <span>{f.q}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition ${openFaq === i ? 'rotate-180 text-[#DC2626]' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-3.5 pb-3 text-xs text-slate-600 leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
