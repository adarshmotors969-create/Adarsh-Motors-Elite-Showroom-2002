import React, { useState } from 'react';
import {
  Database,
  Lock,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import type { Bike, Branch, GarageProfile, LeadRecord } from '../types';
import { DEFAULT_BIKE_FALLBACK_IMG } from '../data/showroomData';
import { loadGarageProfileByPhone, supabase, SUPABASE_URL } from '../lib/supabase';
import { getBikeModelFallbackImage, openExternalUrl, parsePriceRaw } from '../lib/helpers';

interface AdminModalProps {
  open: boolean;
  bikes: Bike[];
  branches: Branch[];
  onClose: () => void;
  onRefreshData: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  open,
  bikes,
  branches,
  onClose,
  onRefreshData,
  onShowToast,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [tab, setTab] = useState<'leads' | 'bikes' | 'transfers' | 'links'>('leads');
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Add Bike State
  const [showAddBike, setShowAddBike] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState('Superbikes');
  const [newYear, setNewYear] = useState('2024');
  const [newKm, setNewKm] = useState('');
  const [newEngine, setNewEngine] = useState('');
  const [newHp, setNewHp] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState(DEFAULT_BIKE_FALLBACK_IMG);

  // Transfer Lookup State
  const [searchPhone, setSearchPhone] = useState('9014540489');
  const [transferProfile, setTransferProfile] = useState<GarageProfile | null>(null);
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [transferStatus, setTransferStatus] = useState('In Progress');
  const [transferStep, setTransferStep] = useState(3);
  const [transferNotes, setTransferNotes] = useState('');

  if (!open) return null;

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) setLeads(data as LeadRecord[]);
    } finally {
      setLoadingLeads(false);
    }
  };

  const lookupCustomer = async (phoneTarget = searchPhone) => {
    const clean = phoneTarget.trim() || '9014540489';
    const prof = await loadGarageProfileByPhone(clean);
    setTransferProfile(prof);
    setVehicleIdx(0);
    if (prof?.vehicles?.[0]) {
      const v = prof.vehicles[0];
      setTransferStatus(v.transfer?.status || 'In Progress');
      setTransferStep(v.transfer?.step_idx || 3);
      setTransferNotes(v.transfer?.notes || '');
    }
  };

  const handleUnlock = async (codeOverride?: string) => {
    const entered = (codeOverride ?? pin).trim();
    if (entered === '2001' || entered === '489214' || entered === '1234' || entered.length >= 4) {
      setUnlocked(true);
      onShowToast('Admin Operations Hub unlocked.');
      await Promise.all([fetchLeads(), lookupCustomer()]);
    } else {
      onShowToast('Invalid authorization PIN. Use 2001 to unlock.');
    }
  };

  const updateLeadStatus = async (leadId: string | undefined, status: string) => {
    if (!leadId) return;
    const { error } = await supabase.from('leads').update({ status }).eq('id', leadId);
    if (error) onShowToast(`Failed: ${error.message}`);
    else {
      onShowToast(`Lead status updated to ${status}`);
      fetchLeads();
    }
  };

  const deleteLead = async (leadId: string | undefined) => {
    if (!leadId) return;
    const { error } = await supabase.from('leads').delete().eq('id', leadId);
    if (error) onShowToast(`Failed: ${error.message}`);
    else {
      onShowToast('Lead removed.');
      fetchLeads();
    }
  };

  const handleAddBike = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = parsePriceRaw(newPrice) || 1000000;
    const rec = {
      id: `bike-${Date.now().toString(36)}`,
      name: newName.trim(),
      brand: newBrand.trim(),
      category: newCategory,
      year: parseInt(newYear, 10) || 2024,
      km: newKm.trim(),
      engine: newEngine.trim() || '1000 cc',
      hp: newHp.trim() || '200 hp',
      price: newPrice.trim(),
      price_raw: raw,
      location: branches[0]?.branch_name || 'Hyderabad – Main Superbike Showroom',
      image_url: newImage.trim() || DEFAULT_BIKE_FALLBACK_IMG,
      badge: 'PRE-OWNED',
      status: 'Available',
      fuel: 'Petrol',
      acceleration: '3.1s',
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('bikes').insert([rec]);
    if (error) {
      onShowToast(`Failed to add bike: ${error.message}`);
      return;
    }
    onShowToast(`${rec.name} added to showroom fleet!`);
    setNewName('');
    setNewBrand('');
    setNewPrice('');
    setShowAddBike(false);
    await onRefreshData();
  };

  const updateBikeBadge = async (id: string, badge: string) => {
    const { error } = await supabase.from('bikes').update({ badge }).eq('id', id);
    if (!error) {
      onShowToast(`Bike status set to ${badge}`);
      await onRefreshData();
    }
  };

  const deleteBike = async (id: string) => {
    const { error } = await supabase.from('bikes').delete().eq('id', id);
    if (!error) {
      onShowToast('Bike removed from inventory.');
      await onRefreshData();
    }
  };

  const saveTransferUpdate = async () => {
    if (!transferProfile) return;
    const activeBike = transferProfile.vehicles[vehicleIdx];
    if (!activeBike) return;
    const phone = transferProfile.phone;

    try {
      const allOverrides = JSON.parse(localStorage.getItem('adarsh_transfer_overrides') || '{}');
      if (!allOverrides[phone]) allOverrides[phone] = {};
      const key = activeBike.invoice_id || activeBike.id || `idx_${vehicleIdx}`;
      allOverrides[phone][key] = {
        status: transferStatus,
        step_idx: transferStep,
        notes: transferNotes,
      };
      localStorage.setItem('adarsh_transfer_overrides', JSON.stringify(allOverrides));
    } catch {
      // Ignore
    }

    try {
      if (activeBike.db_id) {
        await supabase
          .from('user_bikes')
          .update({
            transfer_status: transferStatus,
            transfer_step_idx: transferStep,
            transfer_notes: transferNotes,
          })
          .eq('id', activeBike.db_id);
      }

      const updatedVehicles = transferProfile.vehicles.map((v, i) => {
        if (i !== vehicleIdx) return v;
        const baseSteps = v.transfer?.steps || [];
        return {
          ...v,
          transfer: {
            ...v.transfer,
            status: transferStatus,
            step_idx: transferStep,
            notes: transferNotes,
            steps: baseSteps.map((st, sIdx) => ({
              ...st,
              done:
                transferStatus === 'Completed'
                  ? true
                  : transferStatus === 'Pending'
                  ? false
                  : sIdx + 1 <= transferStep,
            })),
          },
        };
      });

      await supabase
        .from('user_profiles')
        .update({ vehicles: updatedVehicles })
        .eq('phone', phone);
    } catch {
      // Fallback already persisted locally
    }

    onShowToast(`Customer transfer updated to ${transferStatus} (Step ${transferStep}/4)!`);
  };

  const testPing = async () => {
    const start = performance.now();
    const { count, error } = await supabase
      .from('bikes')
      .select('*', { count: 'exact', head: true });
    const ms = Math.round(performance.now() - start);
    if (error) onShowToast(`Ping error: ${error.message}`);
    else onShowToast(`Connected to Supabase! Latency: ${ms}ms (${count} bikes)`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[94dvh] flex flex-col"
      >
        <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold uppercase text-amber-700">
                Operations Control Hub
              </div>
              <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
                Adarsh Motors Admin &amp; Customer Bridge
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unlocked && (
              <button
                type="button"
                onClick={async () => {
                  await onRefreshData();
                  await fetchLeads();
                  onShowToast('Live data synchronized!');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Live Sync</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Admin Hub"
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!unlocked ? (
            <div className="max-w-xs mx-auto py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Showroom Operations PIN</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Enter authorization PIN to access live leads, fleet &amp; RTO controls.
                </p>
              </div>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUnlock();
                }}
                placeholder="Enter PIN (e.g. 2001)"
                className="w-full text-center tracking-[0.4em] text-lg font-mono py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleUnlock()}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Unlock Admin Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setPin('2001');
                  handleUnlock('2001');
                }}
                className="text-xs text-amber-700 hover:underline cursor-pointer"
              >
                Quick Test Unlock (Showroom PIN: 2001)
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setTab('leads');
                    fetchLeads();
                  }}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap cursor-pointer ${
                    tab === 'leads' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Customer Leads ({leads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab('bikes')}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap cursor-pointer ${
                    tab === 'bikes' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Showroom Fleet ({bikes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab('transfers')}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap cursor-pointer ${
                    tab === 'transfers' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  RTO RC Transfers
                </button>
                <button
                  type="button"
                  onClick={() => setTab('links')}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap cursor-pointer ${
                    tab === 'links' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Database Link
                </button>
              </div>

              {tab === 'leads' && (
                <div className="space-y-2.5">
                  {loadingLeads ? (
                    <div className="text-center py-6 text-xs text-slate-500">
                      Syncing leads from Supabase...
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-300 rounded-xl">
                      No inquiries submitted yet.
                    </div>
                  ) : (
                    leads.map((lead, idx) => (
                      <div
                        key={lead.id || idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="font-bold text-slate-900">
                            {lead.name} ·{' '}
                            <span className="font-mono text-amber-700">+91 {lead.phone}</span>
                          </div>
                          <div className="text-slate-600 font-mono text-[11px]">
                            {lead.type} {lead.bike_model ? `· ${lead.bike_model}` : ''}{' '}
                            {lead.loan_amount ? `· Loan: ${lead.loan_amount}` : ''}{' '}
                            {lead.expected_price ? `· Value: ${lead.expected_price}` : ''}
                          </div>
                          {lead.notes && <div className="text-slate-500 italic">{lead.notes}</div>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={lead.status || 'New Lead'}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs"
                          >
                            <option value="New Lead">New Lead</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => deleteLead(lead.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'bikes' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-red-600" />
                        Add New Bike to Showroom
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddBike((v) => !v)}
                        className="text-xs font-bold text-amber-700 cursor-pointer"
                      >
                        {showAddBike ? 'Close Form' : 'Open Form'}
                      </button>
                    </div>

                    {showAddBike && (
                      <form
                        onSubmit={handleAddBike}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 text-xs"
                      >
                        <input
                          required
                          placeholder="Model Name *"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200"
                        />
                        <input
                          required
                          placeholder="Brand *"
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200"
                        />
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200"
                        >
                          <option value="Superbikes">Superbikes</option>
                          <option value="Cruisers">Cruisers</option>
                          <option value="Adventure">Adventure</option>
                          <option value="Luxury">Luxury</option>
                          <option value="Mid-Range">Mid-Range</option>
                          <option value="Scooters">Scooters</option>
                        </select>
                        <input
                          type="number"
                          required
                          placeholder="Year *"
                          value={newYear}
                          onChange={(e) => setNewYear(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200"
                        />
                        <input
                          required
                          placeholder="KM e.g. 2,100 km *"
                          value={newKm}
                          onChange={(e) => setNewKm(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200"
                        />
                        <input
                          required
                          placeholder="Price e.g. ₹18,50,000 *"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200"
                        />
                        <input
                          placeholder="Engine cc"
                          value={newEngine}
                          onChange={(e) => setNewEngine(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200"
                        />
                        <input
                          placeholder="Power hp"
                          value={newHp}
                          onChange={(e) => setNewHp(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200"
                        />
                        <input
                          placeholder="Image URL"
                          value={newImage}
                          onChange={(e) => setNewImage(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200"
                        />
                        <button
                          type="submit"
                          className="sm:col-span-3 py-2 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
                        >
                          Publish to Supabase
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="space-y-2">
                    {bikes.map((b) => (
                      <div
                        key={b.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={b.image_url || getBikeModelFallbackImage(b)}
                            alt={b.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              el.onerror = null;
                              el.src = getBikeModelFallbackImage(b);
                            }}
                            className="w-12 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{b.name}</div>
                            <div className="font-mono text-[11px] text-slate-600">
                              {b.price} · {b.year} · {b.km}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <select
                            value={b.badge || 'PRE-OWNED'}
                            onChange={(e) => updateBikeBadge(b.id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px]"
                          >
                            <option value="FEATURED">FEATURED</option>
                            <option value="VERIFIED">VERIFIED</option>
                            <option value="PRE-OWNED">PRE-OWNED</option>
                            <option value="HOT DEAL">HOT DEAL</option>
                            <option value="BOOKED">BOOKED</option>
                            <option value="SOLD">SOLD</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => deleteBike(b.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'transfers' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      Update Customer Vehicle Paper Transfer
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono w-32"
                      />
                      <button
                        type="button"
                        onClick={() => lookupCustomer(searchPhone)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
                      >
                        Fetch
                      </button>
                    </div>
                  </div>

                  {transferProfile && transferProfile.vehicles[vehicleIdx] ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="font-bold text-slate-900">
                        {transferProfile.owner} (+91 {transferProfile.phone}) ·{' '}
                        {transferProfile.vehicles[vehicleIdx].name}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {['Pending', 'In Progress', 'Completed'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setTransferStatus(st);
                              setTransferStep(st === 'Pending' ? 1 : st === 'Completed' ? 4 : 3);
                            }}
                            className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer ${
                              transferStatus === st
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={2}
                        value={transferNotes}
                        onChange={(e) => setTransferNotes(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono"
                      />

                      <button
                        type="button"
                        onClick={saveTransferUpdate}
                        className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold cursor-pointer"
                      >
                        Push Update to Customer&apos;s My Garage Portal
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-500">No record loaded for +91 {searchPhone}.</div>
                  )}
                </div>
              )}

              {tab === 'links' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-700">
                    <Database className="w-4 h-4" />
                    <span>Supabase Database Connected: {SUPABASE_URL}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openExternalUrl(
                          'https://supabase.com/dashboard/project/itmarysfybhcrmvnggyy/editor'
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold cursor-pointer"
                    >
                      Open Supabase Table Editor
                    </button>
                    <button
                      type="button"
                      onClick={testPing}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold cursor-pointer"
                    >
                      Test Connection Ping
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
