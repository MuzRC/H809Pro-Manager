import React, { useState } from 'react';
import { Lock, CheckCircle2, ShieldAlert, Zap, Radio, AlertTriangle } from 'lucide-react';
import { BandOption, NetworkMode } from '../types/modem';
import { LTE_BANDS_AVAILABLE, INDONESIAN_OPERATORS } from '../data/constants';

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

  const currentOp = INDONESIAN_OPERATORS.find((op) => op.id === operatorId) || INDONESIAN_OPERATORS[0];

  const handleToggleBand = (bandNum: number) => {
    if (selectedBands.includes(bandNum)) {
      // Must keep at least one band selected
      if (selectedBands.length === 1) {
        setFeedbackMsg({
          type: 'info',
          text: 'Peringatan: Minimal 1 frekuensi band harus aktif agar modem tetap terhubung ke BTS.',
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
      text: `Rekomendasi operator ${currentOp.name} dimuat (Band: ${currentOp.supportedBands.join(', ')}).`,
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
        text: `Sukses! Kunci frekuensi band ${selectedBands.map((b) => `B${b}`).join(', ')} dan mode ${
          selectedMode === 'LTE_ONLY' ? '4G LTE Saja' : selectedMode
        } berhasil diterapkan ke modem H809Pro.`,
      });
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Kunci Frekuensi Band LTE (Band Locking)
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Pilih satu atau beberapa pita frekuensi 4G LTE tertentu untuk memaksa modem H809Pro terhubung ke BTS dengan kecepatan dan stabilitas terbaik, menghindari jumping sinyal ke band yang lambat atau padat.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSelectOperatorRecommended}
              className="px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rekomendasi {currentOp.name}</span>
            </button>
            <button
              onClick={handleSelectAllBands}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors whitespace-nowrap"
            >
              Pilih Semua Band
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

      {/* Network Mode Switcher (LTE Only / Auto) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">
          1. Mode Jaringan Seluler
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Pilih preferensi generasi jaringan seluler. Sangat disarankan memilih "4G LTE Saja" untuk mencegah modem drop ke 3G/HSPA saat sinyal melemah.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'LTE_ONLY' as NetworkMode,
              title: '4G LTE Saja (Direkomendasikan)',
              desc: 'Hanya mengunci sinyal 4G LTE. Mencegah drop ke 3G/HSPA.',
              badge: 'Anti-Drop',
            },
            {
              id: 'AUTO' as NetworkMode,
              title: 'Otomatis (4G / 3G Auto)',
              desc: 'Modem akan memilih 4G atau 3G berdasarkan kekuatan sinyal.',
              badge: 'Fleksibel',
            },
            {
              id: 'WCDMA_ONLY' as NetworkMode,
              title: '3G / WCDMA Saja',
              desc: 'Hanya digunakan jika area Anda belum ada jangkauan 4G.',
              badge: 'Legacy',
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

      {/* LTE Band Cards Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            2. Frekuensi Band 4G LTE
          </h3>
          <span className="text-xs font-mono text-cyan-400">
            {selectedBands.length} dari {LTE_BANDS_AVAILABLE.length} Band Aktif
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Klik frekuensi untuk mengaktifkan atau menonaktifkan. Anda dapat mengunci satu band saja (misal B3 untuk kecepatan maksimal) atau kombinasi beberapa band.
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
                        Band {bandItem.band}
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
                        Didukung {currentOp.name}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                    {bandItem.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono truncate">
                  Operator: {bandItem.operators}
                </div>
              </div>
            );
          })}
        </div>

        {/* Apply Configuration Button */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Band yang akan dikunci:{' '}
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
                <span>Menerapkan ke Modem H809Pro...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Terapkan Kunci Band Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Operator Frequency Reference Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>Panduan Frekuensi Seluler Indonesia untuk H809Pro</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-rose-400 font-bold mb-1">Telkomsel / by.U</div>
            <div className="text-slate-300">B3 (1800 MHz) & B40 (2300 MHz)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Kunci ke B3 atau B40 untuk internet tercepat. B8 (900 MHz) untuk area terpencil.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-yellow-400 font-bold mb-1">Indosat Ooredoo</div>
            <div className="text-slate-300">B3 (1800 MHz) & B1 (2100 MHz)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              B3 memberikan kapasitas pita 20MHz terbesar untuk unduhan maksimal.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-blue-400 font-bold mb-1">XL Axiata / Axis</div>
            <div className="text-slate-300">B3 (1800 MHz) & B8 (900 MHz)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Kunci B3 untuk ping rendah game online. B8 untuk penetrasi dinding tebal.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-orange-400 font-bold mb-1">Tri 3 Indonesia</div>
            <div className="text-slate-300">B3 (1800 MHz) & B1 (2100 MHz)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              B3 adalah frekuensi utama jaringan Tri di perkotaan dan pinggiran.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-pink-400 font-bold mb-1">Smartfren 4G</div>
            <div className="text-slate-300">B40 (2300 MHz) & B5 (850 MHz)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              B40 untuk kecepatan unduh tinggi, B5 untuk sinyal stabil di dalam rumah.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">Tips Sinyal H809Pro</div>
            <div className="text-slate-300">Gunakan Antena Luar</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Gunakan fitur Beeper Audio di tab Ringkasan untuk mengarahkan antena ke arah tower BTS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
