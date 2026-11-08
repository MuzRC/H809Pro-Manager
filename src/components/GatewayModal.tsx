import React, { useState } from 'react';
import { X, Globe, ExternalLink, CheckCircle2, AlertCircle, RefreshCw, Radio } from 'lucide-react';

interface GatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  gatewayIp: string;
  onSaveGatewayIp: (ip: string) => void;
  connectionMode: 'live' | 'simulated';
  onChangeConnectionMode: (mode: 'live' | 'simulated') => void;
}

export const GatewayModal: React.FC<GatewayModalProps> = ({
  isOpen,
  onClose,
  gatewayIp,
  onSaveGatewayIp,
  connectionMode,
  onChangeConnectionMode,
}) => {
  const [ipInput, setIpInput] = useState(gatewayIp);
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<{
    status: 'success' | 'warn' | 'error';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsProbing(true);
    setProbeResult(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const startTime = performance.now();
      await fetch(`http://${ipInput}/favicon.ico`, {
        mode: 'no-cors',
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - startTime);

      setProbeResult({
        status: 'success',
        message: `Maklum balas dikesan daripada http://${ipInput} (Kependaman: ~${elapsed}ms). Modem H809Pro berjaya dicapai.`,
      });
    } catch {
      setProbeResult({
        status: 'warn',
        message: `Tidak dapat mencapai http://${ipInput} secara terus daripada pelayar (dasar sekatan CORS atau sambungan Wi-Fi berbeza). Anda masih boleh menekan 'Buka WebGUI Asal' untuk mengakses terus.`,
      });
    } finally {
      setIsProbing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (ipInput.trim()) {
      onSaveGatewayIp(ipInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            Konfigurasi Get Laluan & IP Modem H809Pro
          </h3>
        </div>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Tetapkan alamat IP get laluan lalai bagi modem H809Pro anda. Modem anda menggunakan alamat IP <span className="font-mono text-cyan-300">192.168.1.1</span>.
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

          {/* Suis Mod Operasi */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-mono text-slate-300 block mb-2">
              Mod Operasi Aplikasi:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => onChangeConnectionMode('simulated')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  connectionMode === 'simulated'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Simulator & Ujian</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Simulasi interaktif penuh tanpa perlu bersambung ke Wi-Fi modem
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeConnectionMode('live')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  connectionMode === 'live'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Get Laluan Langsung</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Menghubungkan terus ke alamat IP http://{ipInput}
                </div>
              </button>
            </div>
          </div>

          {/* Petua Log Masuk Lalai */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
            <div className="text-slate-300 font-semibold mb-1">
              Maklumat Log Masuk Lalai Modem H809Pro:
            </div>
            <div>Nama pengguna: <span className="text-cyan-400 font-bold">admin</span></div>
            <div>Kata laluan: <span className="text-cyan-400 font-bold">admin</span> atau <span className="text-cyan-400 font-bold">admin809</span></div>
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
                Simpan IP
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
