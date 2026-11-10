import React, { useState, useEffect } from 'react';
import { RotateCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface RebootModalProps {
  isOpen: boolean;
  onConfirmReboot: () => void;
  onCancel: () => void;
  isRebooting: boolean;
}

export const RebootModal: React.FC<RebootModalProps> = ({
  isOpen,
  onConfirmReboot,
  onCancel,
  isRebooting,
}) => {
  const [countdown, setCountdown] = useState(25);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRebooting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isRebooting, countdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
        {!isRebooting ? (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
              <RotateCw className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight mb-2">
              But Semula (Reboot) Modem H809Pro?
            </h3>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Sambungan internet dan Wi-Fi akan terputus seketika selama lebih kurang 25 saat sementara modem memulakan semula perkakasan dan mendaftar semula ke rangkaian selular.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setCountdown(25);
                  onConfirmReboot();
                }}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex-1"
              >
                Ya, But Semula Sekarang
              </button>
            </div>
          </>
        ) : countdown > 0 ? (
          <>
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
              <RotateCw className="w-6 h-6 animate-spin" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight mb-1">
              Modem Sedang Melakukan But Semula...
            </h3>

            <p className="text-xs text-slate-400 mb-5">
              Sila tunggu sebentar, modem H809Pro sedang memuat semula perisian tegar dan mendaftar kad SIM.
            </p>

            <div className="text-3xl font-bold font-mono text-cyan-400 mb-3 tabular-nums">
              {countdown} <span className="text-sm font-normal text-slate-400">saat</span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-cyan-400 transition-all duration-1000"
                style={{ width: `${((25 - countdown) / 25) * 100}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight mb-1">
              But Semula Selesai!
            </h3>

            <p className="text-xs text-slate-400 mb-6">
              Modem H809Pro telah kembali dalam talian dan rangkaian 4G LTE telah bersambung dengan lancar.
            </p>

            <button
              onClick={onCancel}
              className="w-full py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              Kembali ke Papan Pemuka
            </button>
          </>
        )}
      </div>
    </div>
  );
};
