import React, { useState } from 'react';
import {
  Wifi,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Laptop,
  Tv,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { ConnectedDevice } from '../types/modem';

interface WifiTabProps {
  currentSsid: string;
  currentChannel: string;
  hideSsid: boolean;
  maxClients: number;
  devices: ConnectedDevice[];
  onUpdateWifiSettings: (ssid: string, pass: string, hide: boolean, ch: string) => void;
  onToggleBlockDevice: (deviceId: string) => void;
}

export const WifiTab: React.FC<WifiTabProps> = ({
  currentSsid,
  currentChannel,
  hideSsid,
  maxClients,
  devices,
  onUpdateWifiSettings,
  onToggleBlockDevice,
}) => {
  const [ssid, setSsid] = useState(currentSsid);
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [hideSsidState, setHideSsidState] = useState(hideSsid);
  const [channel, setChannel] = useState(currentChannel);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid.trim() || password.length < 8) return;
    setIsSaving(true);
    setSuccessMsg(false);

    setTimeout(() => {
      onUpdateWifiSettings(ssid.trim(), password, hideSsidState, channel);
      setIsSaving(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 600);
  };

  const getDeviceIcon = (hostname: string) => {
    const lower = hostname.toLowerCase();
    if (lower.includes('laptop') || lower.includes('pc') || lower.includes('komputer')) {
      return <Laptop className="w-4 h-4 text-cyan-400" />;
    }
    if (lower.includes('tv') || lower.includes('smart')) {
      return <Tv className="w-4 h-4 text-emerald-400" />;
    }
    return <Smartphone className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Pengenalan Tab */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Tetapan Wi-Fi & Hotspot H809Pro
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Ubah nama SSID hotspot, kata laluan WPA2, sorokkan nama rangkaian, dan pantau senarai peranti yang sedang bersambung ke modem.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <span>Peranti Aktif:</span>
            <span className="text-cyan-400 font-bold tabular-nums">
              {devices.filter((d) => !d.isBlocked).length} / {maxClients} Klien
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Tetapan Wi-Fi berjaya dikemas kini! Peranti akan bersambung semula secara automatik.</span>
        </div>
      )}

      {/* Grid: Borang Wi-Fi & Senarai Peranti Bersambung */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kad Konfigurasi Wi-Fi */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Konfigurasi Hotspot</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Nama Hotspot (SSID)
              </label>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Kata Laluan Wi-Fi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Sekurang-kurangnya 8 aksara WPA2-PSK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Saluran (Channel)
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="Auto (Disyorkan)">Auto (Disyorkan)</option>
                  <option value="Saluran 1 (2412 MHz)">Saluran 1</option>
                  <option value="Saluran 6 (2437 MHz)">Saluran 6</option>
                  <option value="Saluran 11 (2462 MHz)">Saluran 11</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Keselamatan
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 font-mono">
                  WPA2-PSK (AES)
                </div>
              </div>
            </div>

            {/* Suis Sorokkan SSID */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <input
                  type="checkbox"
                  checked={hideSsidState}
                  onChange={(e) => setHideSsidState(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Sorokkan Nama SSID (Tersembunyi)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Nama Wi-Fi tidak akan dipaparkan dalam senarai imbasan sekeliling.
                  </div>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Tetapan...</span>
                </>
              ) : (
                <span>Simpan Tetapan Wi-Fi</span>
              )}
            </button>
          </form>
        </div>

        {/* Jadual Peranti Bersambung */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Peranti Bersambung (Klien)
              </h3>
              <p className="text-xs text-slate-400">
                Senarai telefon, komputer riba, dan peranti pintar yang bersambung ke modem
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-3 font-semibold">Peranti</th>
                  <th className="pb-3 font-semibold">Alamat IP / MAC</th>
                  <th className="pb-3 font-semibold text-right">Trafik Semasa</th>
                  <th className="pb-3 font-semibold text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {devices.map((device) => (
                  <tr
                    key={device.id}
                    className={`hover:bg-slate-950/40 transition-colors ${
                      device.isBlocked ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.hostname)}
                        <div>
                          <div className="font-semibold text-slate-200">
                            {device.hostname}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Sejak: {device.connectedAt}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <div className="text-slate-300">{device.ip}</div>
                      <div className="text-[10px] text-slate-500">{device.mac}</div>
                    </td>

                    <td className="py-3 text-right tabular-nums">
                      <div className="text-cyan-400">
                        ↓ {device.currentDownloadSpeed} KB/s
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Jumlah {device.totalDataUsed} MB
                      </div>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={() => onToggleBlockDevice(device.id)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                          device.isBlocked
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-800/80'
                        }`}
                      >
                        {device.isBlocked ? 'Buka Sekatan' : 'Sekat'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
