import React, { useState } from 'react';
import {
  Cpu,
  RotateCw,
  AlertTriangle,
  Zap,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { ModemStatus } from '../types/modem';

interface SystemTabProps {
  status: ModemStatus;
  onRebootClick: () => void;
  isRebooting: boolean;
  onFactoryResetClick: () => void;
  onUpdateLimit: (limitGb: number) => void;
}

export const SystemTab: React.FC<SystemTabProps> = ({
  status,
  onRebootClick,
  isRebooting,
  onFactoryResetClick,
  onUpdateLimit,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState(status.quotaLimitGb.toString());
  const [limitUpdated, setLimitUpdated] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(limitInput);
    if (!isNaN(val) && val > 0) {
      onUpdateLimit(val);
      setLimitUpdated(true);
      setTimeout(() => setLimitUpdated(false), 2500);
    }
  };

  const handleExportConfig = () => {
    const backupData = {
      model: 'H809Pro',
      firmware: status.firmwareVersion,
      gatewayIp: status.gatewayIp,
      wifiSsid: status.wifiSsid,
      wifiChannel: status.wifiChannel,
      lockedBands: status.lockedBands,
      networkMode: status.networkMode,
      quotaLimitGb: status.quotaLimitGb,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `h809pro-config-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Informasi Sistem & Pemeliharaan Modem
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Spesifikasi perangkat keras, identitas IMEI/MAC, pemantauan status bypass baterai 24 jam, dan alat pemeliharaan modem H809Pro.
            </p>
          </div>

          <button
            onClick={handleExportConfig}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Ekspor Cadangan Konfigurasi</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Hardware & Identity Specs (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Spesifikasi Hardware & Identitas
          </h3>

          <div className="divide-y divide-slate-800/80 font-mono text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Model Perangkat:</span>
              <span className="text-white font-bold">H809Pro 4G LTE Router</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Chipset Baseband:</span>
              <span className="text-slate-200">ASR 1802S (Cat 4 150/50 Mbps)</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Versi Firmware:</span>
              <span className="text-cyan-400 font-semibold">{status.firmwareVersion}</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Nomor IMEI:</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-200">{status.imei}</span>
                <button
                  onClick={() => handleCopy(status.imei, 'imei')}
                  className="p-1 hover:text-cyan-400 text-slate-400 transition-colors"
                  title="Salin IMEI"
                >
                  {copiedKey === 'imei' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">MAC Address Modem:</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-200">{status.macAddress}</span>
                <button
                  onClick={() => handleCopy(status.macAddress, 'mac')}
                  className="p-1 hover:text-cyan-400 text-slate-400 transition-colors"
                  title="Salin MAC Address"
                >
                  {copiedKey === 'mac' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">IP Gateway Bawaan:</span>
              <span className="text-slate-200">{status.gatewayIp}</span>
            </div>
          </div>

          {/* Bypass Battery Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white font-mono">
                  Mode Bypass Baterai (Direct USB 5V)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                AKTIF 24 JAM
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modem beroperasi langsung dari daya charger/adaptor USB tanpa memerlukan baterai terpasang. Mencegah baterai hamil/kembung dan aman digunakan untuk hotspot rumahan nonstop.
            </p>
          </div>
        </div>

        {/* Maintenance, Quota Settings & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quota Limit Setting Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Batas Kuota Bulanan
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Atur target batas kuota bulanan untuk memantau grafik pemakaian data secara akurat.
            </p>

            <form onSubmit={handleSaveLimit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-slate-500">
                  GB
                </span>
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
              >
                Simpan
              </button>
            </form>

            {limitUpdated && (
              <div className="mt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Batas kuota berhasil disimpan!</span>
              </div>
            )}
          </div>

          {/* Device Actions (Reboot / Reset) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Operasi Perangkat Modem
            </h3>

            <div>
              <button
                onClick={onRebootClick}
                disabled={isRebooting}
                className="w-full py-2.5 px-4 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 ${isRebooting ? 'animate-spin' : ''}`} />
                <span>Reboot / Mulai Ulang Modem</span>
              </button>
              <p className="text-[11px] text-slate-500 mt-1">
                Memulai ulang perangkat keras H809Pro untuk menyegarkan sistem dan kartu SIM.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={onFactoryResetClick}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Reset ke Pengaturan Pabrik</span>
              </button>
              <p className="text-[11px] text-slate-500 mt-1">
                Mengembalikan semua pengaturan APN, Wi-Fi, dan sandi ke default pabrik (192.168.100.1 / admin).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
