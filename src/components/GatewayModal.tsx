import React, { useState } from 'react';
import { X, Globe, ExternalLink, CheckCircle2, AlertCircle, RefreshCw, Wifi, Lock, User, Shield } from 'lucide-react';
import { h809proApi } from '../services/h809proApi';

interface GatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  gatewayIp: string;
  onSaveGatewayIp: (ip: string) => void;
  hasUserConfirmedWifi?: boolean;
  onToggleConfirmWifi?: (confirmed: boolean) => void;
}

export const GatewayModal: React.FC<GatewayModalProps> = ({
  isOpen,
  onClose,
  gatewayIp,
  onSaveGatewayIp,
  hasUserConfirmedWifi = false,
  onToggleConfirmWifi,
}) => {
  const [ipInput, setIpInput] = useState(gatewayIp);
  const [userInput, setUserInput] = useState(h809proApi.getUsername() || 'admin');
  const [passInput, setPassInput] = useState(h809proApi.getPassword() || 'admin');
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<{
    status: 'success' | 'warn' | 'error';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsProbing(true);
    setProbeResult(null);

    h809proApi.setGatewayIp(ipInput);
    h809proApi.setCredentials(userInput, passInput);

    const test = await h809proApi.testCgiEndpoint();

    if (test.success) {
      setProbeResult({
        status: 'success',
        message: `Berjaya! Maklum balas diterima daripada modem H809Pro di http://${ipInput} (Kependaman: ~${test.latencyMs}ms). Pengesahan Digest Auth aktif.`,
      });
    } else {
      setProbeResult({
        status: 'warn',
        message: `Pelayar web menyekat permintaan terus ke http://${ipInput} (dasar keselamatan Mixed Content HTTPS ke IP peribadi). Sekiranya telefon anda telah disambungkan ke hotspot Wi-Fi modem, tandakan pilihan 'Sahkan Sambungan Wi-Fi' di bawah untuk membuka papan pemuka.`,
      });
    }

    setIsProbing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (ipInput.trim()) {
      h809proApi.setCredentials(userInput.trim(), passInput.trim());
      onSaveGatewayIp(ipInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            Konfigurasi Get Laluan & Log Masuk H809Pro
          </h3>
        </div>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Tetapkan alamat IP get laluan dan maklumat log masuk Digest Auth bagi modem H809Pro anda. Modem ini menggunakan alamat lalai <span className="font-mono text-cyan-300">192.168.1.1</span>.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              Alamat IP Get Laluan Modem
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="192.168.1.1"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                required
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isProbing}
                className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
                <span>Uji Sambungan</span>
              </button>
            </div>
          </div>

          {/* Pratetap IP Pantas */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-1">
              Pratetap IP Biasa:
            </span>
            <div className="flex flex-wrap gap-2">
              {['192.168.1.1', '192.168.100.1', '192.168.0.1', '192.168.8.1'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setIpInput(preset)}
                  className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                    ipInput === preset
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Kredensial Log Masuk Digest Auth (PXA1802) */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Pengesahan Log Masuk Digest Auth (PXA1802)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>Nama Pengguna WebGUI:</span>
                </label>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Kata Laluan WebGUI:</span>
                </label>
                <input
                  type="password"
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  placeholder="admin"
                  required
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Kredensial ini digunakan untuk menjana token Digest MD5 bagi capaian modul duster (xml_action.cgi) secara automatik.
            </p>
          </div>

          {probeResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                probeResult.status === 'success'
                  ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
                  : 'bg-amber-950/50 border-amber-800 text-amber-200'
              }`}
            >
              {probeResult.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{probeResult.message}</span>
            </div>
          )}

          {/* Suis Pengesahan Wi-Fi (Bypass Sekatan Pelayar) */}
          {onToggleConfirmWifi && (
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-3">
              <input
                type="checkbox"
                id="confirmWifiToggle"
                checked={hasUserConfirmedWifi}
                onChange={(e) => onToggleConfirmWifi(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="confirmWifiToggle" className="cursor-pointer">
                <div className="text-xs font-bold text-slate-200 font-mono">
                  Sahkan Peranti Ini Telah Bersambung ke Wi-Fi H809Pro
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Tandakan ini jika telefon anda telah disambungkan ke hotspot Wi-Fi modem supaya amaran tiada sambungan tidak menghalang penggunaan aplikasi.
                </div>
              </label>
            </div>
          )}

          {/* Maklumat Sambungan Terus Perkakasan */}
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-cyan-800/60 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold mb-1">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <span>Protokol Perkakasan PXA1802 Modul Duster</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Aplikasi ini berhubung secara langsung ke modem H809Pro di <span className="text-white font-bold">http://{ipInput}</span> melalui xml_action.cgi dengan penyulitan kata laluan Digest MD5.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <a
              href={`http://${ipInput}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka WebGUI Asal</span>
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
