import React, { useState } from 'react';
import { Network, Plus, Check, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { APNProfile } from '../types/modem';
import { DEFAULT_APN_LIST } from '../data/constants';

interface ApnTabProps {
  apnProfiles: APNProfile[];
  onSetDefaultApn: (id: string) => void;
  onAddApn: (profile: APNProfile) => void;
}

export const ApnTab: React.FC<ApnTabProps> = ({
  apnProfiles,
  onSetDefaultApn,
  onAddApn,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newApn, setNewApn] = useState('');
  const [newOperator, setNewOperator] = useState('Telkomsel');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAuthType, setNewAuthType] = useState<'NONE' | 'PAP' | 'CHAP'>('NONE');
  const [newPdpType, setNewPdpType] = useState<'IPv4' | 'IPv6' | 'IPv4v6'>('IPv4v6');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelectDefault = (id: string, name: string) => {
    onSetDefaultApn(id);
    setFeedback(`Profil APN "${name}" berhasil diaktifkan sebagai default.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCreateApn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newApn.trim()) return;

    const newProfile: APNProfile = {
      id: `apn-custom-${Date.now()}`,
      name: newName.trim(),
      operator: newOperator,
      apn: newApn.trim(),
      username: newUsername.trim(),
      password: newPassword.trim(),
      authType: newAuthType,
      pdpType: newPdpType,
      isDefault: false,
    };

    onAddApn(newProfile);
    setShowAddForm(false);
    setNewName('');
    setNewApn('');
    setNewUsername('');
    setNewPassword('');
    setFeedback(`Profil APN baru "${newProfile.name}" berhasil ditambahkan.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Pengaturan APN (Access Point Name)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Konfigurasi APN jalur koneksi internet seluler untuk modem H809Pro. Pilih preset operator atau buat APN kustom untuk paket bypass tertentu.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah APN Kustom</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Add Custom APN Form Modal / Dropdown */}
      {showAddForm && (
        <div className="bg-slate-900 border border-cyan-500/50 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
            Buat Profil APN Baru
          </h3>

          <form onSubmit={handleCreateApn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nama Profil</label>
              <input
                type="text"
                placeholder="Misal: Telkomsel Gaming / ByU Fast"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">APN (Access Point Name)</label>
              <input
                type="text"
                placeholder="Misal: internet / aha / byu"
                value={newApn}
                onChange={(e) => setNewApn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Operator</label>
              <input
                type="text"
                placeholder="Misal: Telkomsel / XL"
                value={newOperator}
                onChange={(e) => setNewOperator(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Username (Opsional)</label>
              <input
                type="text"
                placeholder="Kosongkan jika tidak ada"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Password (Opsional)</label>
              <input
                type="text"
                placeholder="Kosongkan jika tidak ada"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Otentikasi</label>
                <select
                  value={newAuthType}
                  onChange={(e) => setNewAuthType(e.target.value as 'NONE' | 'PAP' | 'CHAP')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="NONE">NONE</option>
                  <option value="PAP">PAP</option>
                  <option value="CHAP">CHAP</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">PDP Type</label>
                <select
                  value={newPdpType}
                  onChange={(e) => setNewPdpType(e.target.value as 'IPv4' | 'IPv6' | 'IPv4v6')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="IPv4v6">IPv4/IPv6</option>
                  <option value="IPv4">IPv4 Saja</option>
                  <option value="IPv6">IPv6 Saja</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
              >
                Simpan & Tambahkan APN
              </button>
            </div>
          </form>
        </div>
      )}

      {/* APN Profiles List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
          Daftar APN Tersimpan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {apnProfiles.map((profile) => (
            <div
              key={profile.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                profile.isDefault
                  ? 'bg-slate-950 border-cyan-500 ring-1 ring-cyan-500/20 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-mono">
                      {profile.name}
                    </span>
                    {profile.isDefault && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                        AKTIF / DEFAULT
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    {profile.operator}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 mb-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">APN</span>
                    <span className="text-cyan-300 font-semibold">{profile.apn}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Protokol PDP</span>
                    <span className="text-slate-300">{profile.pdpType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Username</span>
                    <span className="text-slate-300">{profile.username || '(Kosong)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Otentikasi</span>
                    <span className="text-slate-300">{profile.authType}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                {profile.isDefault ? (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 py-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Sedang Digunakan Modem</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleSelectDefault(profile.id, profile.name)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
                  >
                    Jadikan Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
