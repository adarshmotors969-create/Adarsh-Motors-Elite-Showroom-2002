import React from 'react';
import { ArrowRight, Cpu, Gauge, ShieldCheck, Sparkles, Wrench } from 'lucide-react';

interface ServiceHubSectionProps {
  onOpenServiceModal: (packageType?: string) => void;
}

const SERVICE_PACKAGES = [
  {
    id: 'Scheduled Servicing',
    title: 'Scheduled Servicing',
    subtitle: 'Periodic Factory Maintenance',
    details:
      'Motul 300V Factory Line oil flushes, OEM filters, chain slack & torque calibration, and coolant gravity checks.',
    icon: Wrench,
  },
  {
    id: 'Inspection & Diagnostics',
    title: 'Inspection & Diagnostics',
    subtitle: 'ECU & OBD Health Scans',
    details:
      'Full chassis alignment, engine compression test, OBD fault clearing, and throttle body synchronization.',
    icon: Cpu,
  },
  {
    id: 'Detailing & Ceramic Finish',
    title: 'Detailing & Ceramic Finish',
    subtitle: 'Showroom Paint Shield',
    details:
      'Multi-stage paint correction, hydrophobic ceramic armor, and titanium exhaust thermal polishing.',
    icon: Sparkles,
  },
  {
    id: 'Track Pre-Check & Dyno Tuning',
    title: 'Track Pre-Check & Dyno Tuning',
    subtitle: 'Dyno & Brake Bleed',
    details:
      'Race-spec brake fluid bleed, suspension sag setup, and dyno pull verification by master technicians.',
    icon: Gauge,
  },
];

export const ServiceHubSection: React.FC<ServiceHubSectionProps> = ({ onOpenServiceModal }) => {
  return (
    <section id="service" className="py-10 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#DC2626] mb-1">
              Factory-Trained Superbike Care
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Service, Workshop &amp; Dyno Hub
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
              Motul 300V oil flushes, ECU dyno tuning, brake bleed &amp; laser alignment by master
              technicians with HSRP bay slot allocation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenServiceModal()}
            className="h-11 px-5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition shrink-0"
          >
            <span>Book Workshop Slot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar pb-1 snap-x">
          {SERVICE_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.id}
                className="min-w-[260px] sm:min-w-0 snap-start bg-[#F8FAFC] border border-slate-200 hover:border-[#DC2626]/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 shrink-0 transition"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#DC2626] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    {pkg.subtitle}
                  </div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">{pkg.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{pkg.details}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenServiceModal(pkg.id)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#DC2626] text-[#0F172A] hover:text-white border border-slate-200 hover:border-[#DC2626] text-xs font-bold inline-flex items-center justify-between cursor-pointer transition"
                >
                  <span>Select Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Dedicated master technicians · Digital service history synced directly to your My
            Garage account.
          </span>
        </div>
      </div>
    </section>
  );
};
