import React, { useState } from 'react';
import { Lock, CheckCircle2, ShieldAlert, Zap, Radio, AlertTriangle } from 'lucide-react';
import { BandOption, NetworkMode } from '../types/modem';
import { LTE_BANDS_AVAILABLE, MALAYSIAN_OPERATORS } from '../data/constants';

interface BandLockTabProps {
  currentLockedBands: number[];
  currentNetworkMode: NetworkMode;
  onApplyBandConfig: (bands: number[], mode: NetworkMode) => void;
  operatorId: string;
}

export const BandLockTab: React.FC<BandLockTabProps> = ({
  currentLockedBands,
  currentNetworkMode,
  onApplyBandConfig,
  operatorId,
}) => {
  const [selectedBands, setSelectedBands] = useState<number[]>(currentLockedBands);
  const [selectedMode, setSelectedMode] = useState<NetworkMode>(currentNetworkMode);
  const [isApplying, setIsApplying] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const currentOp = MALAYSIAN_OPERATORS.find((op) => op.id === operatorId) || MALAYSIAN_OPERATORS[0];

  const handleToggleBand = (bandNum: number) => {
    if (selectedBands.includes(bandNum)) {
      if (selectedBands.length === 1) {
        setFeedbackMsg({
          type: 'info',
          text: 'Peringatan: Sekurang-kurangnya 1 jalur frekuensi mesti diaktifkan supaya modem kekal bersambung ke menara pemancar (BTS).',
        });
        return;
      }
      setSelectedBands(selectedBands.filter((b) => b !== bandNum));
    } else {
      setSelectedBands([...selectedBands, bandNum]);
    }
    setFeedbackMsg(null);
  };

  const handleSelectAllBands = () => {
    setSelectedBands(LTE_BANDS_AVAILABLE.map((b) => b.band));
    setFeedbackMsg(null);
  };

  const handleSelectOperatorRecommended = () => {
    setSelectedBands(currentOp.supportedBands);
    setSelectedMode('LTE_ONLY');
    setFeedbackMsg({
      type: 'info',
      text: `Cadangan bagi pengendali ${currentOp.name} telah dimuatkan (Jalur: ${currentOp.supportedBands.join(', ')}).`,
    });
  };

  const handleApply = () => {
    setIsApplying(true);
    setFeedbackMsg(null);

    setTimeout(() => {
      onApplyBandConfig(selectedBands, selectedMode);
      setIsApplying(false);
      setFeedbackMsg({
        type: 'success',
        text: `Berjaya! Kunci jalur frekuensi ${selectedBands.map((b) => `B${b}`).join(', ')} dan mod ${
          selectedMode === 'LTE_ONLY' ? '4G LTE Sahaja' : selectedMode
        } telah selamat diterapkan pada modem H809Pro.`,
      });
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Pengenalan Tab */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Kunci Jalur Frekuensi LTE (Band Locking)
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Pilih satu atau gabungan jalur 4G LTE tertentu untuk memaksa modem H809Pro bersambung ke menara pemancar dengan kestabilan dan kelajuan terbaik, serta mengelakkan modem bertukar secara rawak ke jalur yang sesak.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSelectOperatorRecommended}
              className="px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Syor {currentOp.name}</span>
            </button>
            <button
              onClick={handleSelectAllBands}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors whitespace-nowrap"
            >
              Pilih Semua Jalur
            </button>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-800/70 text-emerald-200'
              : 'bg-cyan-950/50 border-cyan-800/70 text-cyan-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Pemilih Mod Rangkaian */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">
          1. Mod Rangkaian Selular
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Tentukan generasi rangkaian selular utama. Disyorkan menggunakan "4G LTE Sahaja" bagi mengelakkan sambungan jatuh ke 3G apabila isyarat menurun seketika.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'LTE_ONLY' as NetworkMode,
              title: '4G LTE Sahaja (Disyorkan)',
              desc: 'Hanya mengunci sambungan 4G LTE. Mencegah daripada jatuh ke mod 3G.',
              badge: 'Kekal 4G',
            },
            {
              id: 'AUTO' as NetworkMode,
              title: 'Automatik (4G / 3G Auto)',
              desc: 'Modem akan memilih 4G atau 3G mengikut tahap kekuatan isyarat semasa.',
              badge: 'Fleksibel',
            },
            {
              id: 'WCDMA_ONLY' as NetworkMode,
              title: '3G / WCDMA Sahaja',
              desc: 'Hanya digunakan jika lokasi anda tiada liputan rangkaian 4G.',
              badge: 'Warisan',
            },
          ].map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-semibold text-white">
                    {mode.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {mode.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{mode.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kad Jalur Frekuensi LTE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            2. Jalur Frekuensi 4G LTE
          </h3>
          <span className="text-xs font-mono text-cyan-400">
            {selectedBands.length} daripada {LTE_BANDS_AVAILABLE.length} Jalur Aktif
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Klik kad jalur untuk hidupkan atau matikan. Anda boleh mengunci satu jalur sahaja (contohnya Jalur 3 untuk kelajuan tinggi) atau gabungan beberapa jalur.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {LTE_BANDS_AVAILABLE.map((bandItem: BandOption) => {
            const isChecked = selectedBands.includes(bandItem.band);
            const isOpSupported = currentOp.supportedBands.includes(bandItem.band);

            return (
              <div
                key={bandItem.band}
                onClick={() => handleToggleBand(bandItem.band)}
                className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isChecked
                    ? 'bg-slate-950 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold font-mono text-white">
                        Jalur {bandItem.band}
                      </span>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                        {bandItem.freq}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isChecked
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {bandItem.duplex}
                    </span>
                    {isOpSupported && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                        Disokong {currentOp.name}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                    {bandItem.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono truncate">
                  Pengendali: {bandItem.operators}
                </div>
              </div>
            );
          })}
        </div>

        {/* Butang Terapkan Kunci Jalur */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Jalur yang akan dikunci:{' '}
            <span className="text-cyan-400 font-semibold">
              {selectedBands.length > 0 ? selectedBands.map((b) => `B${b}`).join(', ') : 'Belum dipilih'}
            </span>
          </div>

          <button
            onClick={handleApply}
            disabled={isApplying || selectedBands.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isApplying ? (
              <>
                <Radio className="w-4 h-4 animate-spin" />
                <span>Menetapkan pada Modem H809Pro...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Terapkan Kunci Jalur Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Rujukan Jalur Telco Malaysia */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>Panduan Jalur Frekuensi Telco Malaysia untuk H809Pro</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-rose-400 font-bold mb-1">Tune Talk / CelcomDigi</div>
            <div className="text-slate-300">B3 (1800 MHz) & B1 (2100 MHz)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Kunci ke Jalur 3 untuk kelajuan muat turun paling pantas. Jalur 8 (900 MHz) untuk kawasan luar bandar atau isyarat terhalang.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">Maxis / Hotlink</div>
            <div className="text-slate-300">B3 (1800 MHz) & B1 (2100 MHz)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Jalur 3 memberikan kapasiti lebar jalur terbesar dan kependaman rendah bagi permainan dalam talian.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-orange-400 font-bold mb-1">U Mobile</div>
            <div className="text-slate-300">B3 (1800 MHz) & B1 (2100 MHz)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Jalur 3 ialah tulang belakang rangkaian 4G di kawasan bandar dan perumahan.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-amber-400 font-bold mb-1">Unifi Mobile</div>
            <div className="text-slate-300">B40 (2300 MHz) & B5 (850 MHz)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Gunakan Jalur 40 untuk data pantas, manakala Jalur 5 untuk isyarat yang mudah menembusi dinding rumah.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-pink-400 font-bold mb-1">Yes 4G / 5G</div>
            <div className="text-slate-300">Jalur 20 (800 MHz) & Jalur 40</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Jalur 40 TDD menawarkan kelajuan tanpa wayar yang sangat tinggi.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-cyan-400 font-bold mb-1">Petua Isyarat H809Pro</div>
            <div className="text-slate-300">Talaan Antena Luaran</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Gunakan ciri Beeper Audio di tab Ringkasan untuk memusing arah antena luaran tepat menghadap menara pemancar telco.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
