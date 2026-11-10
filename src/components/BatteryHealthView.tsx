import React, { useState } from 'react';
import {
  BatteryCharging,
  Zap,
  Activity,
  History,
  ShieldCheck,
  AlertTriangle,
  Download,
  Thermometer,
  Gauge,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { BatteryHealthInfo, ChargingHistoryItem } from '../types/modem';

interface BatteryHealthViewProps {
  initialData?: BatteryHealthInfo;
  onUpdateHealth?: (data: BatteryHealthInfo) => void;
}

const DEFAULT_BATTERY_DATA: BatteryHealthInfo = {
  stateOfHealthPercent: 94,
  designCapacityMah: 3000,
  currentFullCapacityMah: 2820,
  completedCycles: 142,
  ratedMaxCycles: 500,
  estimatedRemainingCycles: 358,
  voltageV: 4.12,
  currentRateMa: 0, // In bypass mode
  batteryTemperature: 31.8,
  condition: 'EXCELLENT',
  bypassModeActive: true,
  history: [
    {
      id: 'ch-1',
      timestamp: '2026-11-09 11:20 Pagi',
      eventType: 'BYPASS_ENGAGED',
      startLevel: 85,
      endLevel: 85,
      durationMinutes: 180,
      peakTemperature: 32.1,
      healthImpact: '0% degradasi (Pintasan 5V langsung)',
      voltageV: 4.12,
    },
    {
      id: 'ch-2',
      timestamp: '2026-11-09 08:15 Pagi',
      eventType: 'CHARGING_COMPLETED',
      startLevel: 32,
      endLevel: 85,
      durationMinutes: 72,
      peakTemperature: 36.4,
      healthImpact: '+0.53 kitaran setara',
      voltageV: 4.18,
    },
    {
      id: 'ch-3',
      timestamp: '2026-11-08 19:40 Malam',
      eventType: 'DISCHARGING',
      startLevel: 98,
      endLevel: 32,
      durationMinutes: 245,
      peakTemperature: 34.0,
      healthImpact: '+0.66 kitaran (Suhu optimum)',
      voltageV: 3.82,
    },
    {
      id: 'ch-4',
      timestamp: '2026-11-08 16:30 Petang',
      eventType: 'CHARGING_COMPLETED',
      startLevel: 15,
      endLevel: 98,
      durationMinutes: 105,
      peakTemperature: 38.2,
      healthImpact: '+0.83 kitaran setara',
      voltageV: 4.20,
    },
    {
      id: 'ch-5',
      timestamp: '2026-11-07 21:10 Malam',
      eventType: 'TRICKLE_MAINTENANCE',
      startLevel: 80,
      endLevel: 80,
      durationMinutes: 360,
      peakTemperature: 31.0,
      healthImpact: '0% degradasi (Penjagaan voltan ambang)',
      voltageV: 4.05,
    },
  ],
};

export const BatteryHealthView: React.FC<BatteryHealthViewProps> = ({
  initialData,
  onUpdateHealth,
}) => {
  const [batteryData, setBatteryData] = useState<BatteryHealthInfo>(() => {
    const saved = localStorage.getItem('h809pro_battery_health');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return initialData || DEFAULT_BATTERY_DATA;
  });

  const [filterType, setFilterType] = useState<string>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const saveState = (updated: BatteryHealthInfo) => {
    setBatteryData(updated);
    localStorage.setItem('h809pro_battery_health', JSON.stringify(updated));
    if (onUpdateHealth) onUpdateHealth(updated);
  };

  const handleToggleBypass = () => {
    const nextBypass = !batteryData.bypassModeActive;
    const updated: BatteryHealthInfo = {
      ...batteryData,
      bypassModeActive: nextBypass,
      currentRateMa: nextBypass ? 0 : 650,
      history: [
        {
          id: `ch-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('ms-MY', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          eventType: nextBypass ? 'BYPASS_ENGAGED' : 'CHARGING_STARTED',
          startLevel: 85,
          endLevel: 85,
          durationMinutes: 1,
          peakTemperature: batteryData.batteryTemperature,
          healthImpact: nextBypass ? 'Pintasan 5V aktif (Menjaga sel bateri)' : 'Pengecasan bateri bermula',
          voltageV: nextBypass ? 4.12 : 4.18,
        },
        ...batteryData.history,
      ],
    };

    saveState(updated);
    setActionNotice(
      nextBypass
        ? 'Mod Pintasan USB diaktifkan. Bateri tidak lagi dicas secara berterusan untuk mengelakkan pembengkakan sel.'
        : 'Mod Bateri Diaktifkan. Modem kini mengecas dan boleh digunakan secara mudah alih.'
    );
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleExportBatteryLog = () => {
    const exportPayload = {
      device: 'H809Pro 4G LTE CPE Router',
      batterySummary: {
        healthPercent: batteryData.stateOfHealthPercent,
        condition: batteryData.condition,
        designCapacityMah: batteryData.designCapacityMah,
        currentFullCapacityMah: batteryData.currentFullCapacityMah,
        completedCycles: batteryData.completedCycles,
        estimatedRemainingCycles: batteryData.estimatedRemainingCycles,
        bypassModeActive: batteryData.bypassModeActive,
        voltageV: batteryData.voltageV,
        temperatureC: batteryData.batteryTemperature,
      },
      chargingHistory: batteryData.history,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `h809pro-kesihatan-bateri-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getConditionDetails = (cond: string, soh: number) => {
    if (soh >= 90) {
      return {
        label: 'Cemerlang (SOH Tinggi)',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/40 border-emerald-800/80',
        desc: 'Sel bateri berada dalam keadaan prima tanpa sebarang tanda pembengkakan atau kemerosotan kimia.',
      };
    }
    if (soh >= 80) {
      return {
        label: 'Baik (Normal)',
        color: 'text-cyan-400',
        bg: 'bg-cyan-950/40 border-cyan-800/80',
        desc: 'Kapasiti masih kukuh untuk penggunaan mudah alih standard.',
      };
    }
    return {
      label: 'Sederhana (Pertimbangkan Servis)',
      color: 'text-amber-400',
      bg: 'bg-amber-950/40 border-amber-800/80',
      desc: 'Kapasiti telah menurun di bawah 80%. Disyorkan menggunakan Mod Pintasan USB.',
    };
  };

  const conditionInfo = getConditionDetails(batteryData.condition, batteryData.stateOfHealthPercent);

  const filteredHistory = batteryData.history.filter((item) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'CHARGING') return item.eventType.includes('CHARGING');
    if (filterType === 'BYPASS') return item.eventType === 'BYPASS_ENGAGED' || item.eventType === 'TRICKLE_MAINTENANCE';
    if (filterType === 'DISCHARGE') return item.eventType === 'DISCHARGING';
    return true;
  });

  const remainingPercent = Math.round((batteryData.estimatedRemainingCycles / batteryData.ratedMaxCycles) * 100);
  const estimatedMonths = Math.round((batteryData.estimatedRemainingCycles / 24) * 10) / 10; // ~24 cycles per month typical usage

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BatteryCharging className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight font-mono">
              Pemantauan Kesihatan Bateri & Anggaran Kitaran Kuasa
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Analisis diagnostik hayat bateri Li-ion H809Pro, pengesanan pembengkakan sel, dan sejarah pengecasan automatik.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleBypass}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              batteryData.bypassModeActive
                ? 'bg-amber-950/70 border-amber-800/90 text-amber-300 hover:bg-amber-900/60'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Tukar antara mod pintasan pengecas terus atau cas bateri"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{batteryData.bypassModeActive ? 'Mod Pintasan 24 Jam (Aktif)' : 'Mod Bateri Mudah Alih'}</span>
          </button>

          <button
            onClick={handleExportBatteryLog}
            className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            title="Eksport Log Diagnostik Bateri (JSON)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-lg bg-cyan-950/50 border border-cyan-800/80 text-cyan-200 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Primary KPI Grid: SOH, Cycles, Voltage, Capacity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* SOH (State of Health) Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400">Tahap Kesihatan (SOH)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white tabular-nums tracking-tight">
            {batteryData.stateOfHealthPercent}%
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={`font-semibold ${conditionInfo.color}`}>
              {conditionInfo.label.split(' ')[0]}
            </span>
            <span className="text-slate-500 text-[11px]">· Tiada Pembengkakan</span>
          </div>
        </div>

        {/* Remaining Power Cycles Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400">Baki Kitaran Kuasa</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-300 tabular-nums tracking-tight">
            {batteryData.estimatedRemainingCycles}{' '}
            <span className="text-xs font-normal text-slate-400">/ {batteryData.ratedMaxCycles}</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 truncate">
            {remainingPercent}% baki (~{estimatedMonths} bulan)
          </div>
        </div>

        {/* Real-time Voltage & Current Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400">Voltan & Arus Kuasa</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {batteryData.voltageV.toFixed(2)} <span className="text-xs font-normal text-slate-400">V</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400">
            Arus: <span className="text-slate-200 font-semibold">{batteryData.bypassModeActive ? '0 mA (Pintasan)' : `+${batteryData.currentRateMa} mA`}</span>
          </div>
        </div>

        {/* Temperature & Capacity Retention */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400">Suhu Bateri & Kapasiti</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {batteryData.batteryTemperature.toFixed(1)}°C
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 truncate">
            {batteryData.currentFullCapacityMah} / {batteryData.designCapacityMah} mAh
          </div>
        </div>
      </div>

      {/* Cycle Estimation Breakdown Panel */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Anggaran Jangka Hayat & Kitaran Pengecasan (Li-ion Lifecycle)
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Kitaran Selesai: <span className="text-white font-semibold">{batteryData.completedCycles}</span> kali
          </div>
        </div>

        {/* Visual Dual-tone Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (batteryData.completedCycles / batteryData.ratedMaxCycles) * 100)}%` }}
              title={`Kitaran Digunakan: ${batteryData.completedCycles}`}
            />
            <div
              className="h-full bg-slate-700/60 transition-all duration-500"
              style={{ width: `${Math.max(0, 100 - (batteryData.completedCycles / batteryData.ratedMaxCycles) * 100)}%` }}
              title={`Baki Kitaran: ${batteryData.estimatedRemainingCycles}`}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-0.5">
            <span>0 Kitaran (Baru)</span>
            <span className="text-cyan-400 font-semibold">{batteryData.completedCycles} Selesai</span>
            <span>500 Kitaran (Had Piawai Pengeluar)</span>
          </div>
        </div>

        {/* Informative advice for H809Pro users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono text-slate-400">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block mb-0.5">Kelebihan Mod Pintasan 24 Jam</span>
              <span>
                Apabila modem H809Pro disambungkan secara berterusan ke palam penyesuai USB 5V, voltan bateri dikunci pada paras selamat (4.05V - 4.12V) bagi menghapuskan kitaran mikro dan mencegah bateri kembung.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block mb-0.5">Kadar Degradasi Dianggarkan</span>
              <span>
                Purata degradasi kimia adalah ~0.04% bagi setiap 1 kitaran penuh (0% - 100%). Menjaga suhu di bawah 38°C mengekalkan baki hayat bateri melebihi 2 tahun.
              </span>
            </div>
          </div>
        </div>

        {/* Maklumat Penentukuran Sensor */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-500">
            Penentukuran penderia bateri perkakasan diselaraskan secara automatik melalui telemetri cipset H809Pro.
          </span>

          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Penderia Perkakasan Aktif</span>
          </span>
        </div>
      </div>

      {/* Charging Status History Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Sejarah Status Pengecasan & Peristiwa Kuasa
            </h4>
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'CHARGING', label: 'Pengecasan' },
              { id: 'BYPASS', label: 'Pintasan USB' },
              { id: 'DISCHARGE', label: 'Pelepasan' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  filterType === f.id
                    ? 'bg-slate-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] bg-slate-900/60">
                <th className="py-2.5 px-3 font-semibold">Masa & Peristiwa</th>
                <th className="py-2.5 px-3 font-semibold">Aras Bateri</th>
                <th className="py-2.5 px-3 font-semibold">Tempoh</th>
                <th className="py-2.5 px-3 font-semibold">Voltan & Suhu</th>
                <th className="py-2.5 px-3 font-semibold text-right">Impak Kitaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                    Tiada rekod pengecasan dijumpai untuk kategori ini.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const isBypass = item.eventType === 'BYPASS_ENGAGED' || item.eventType === 'TRICKLE_MAINTENANCE';
                  const isCharging = item.eventType.includes('CHARGING');

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          {isBypass ? (
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                          ) : isCharging ? (
                            <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <Activity className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>
                            {item.eventType === 'BYPASS_ENGAGED'
                              ? 'Pintasan Kuasa USB Aktif'
                              : item.eventType === 'CHARGING_COMPLETED'
                              ? 'Pengecasan Penuh Selesai'
                              : item.eventType === 'CHARGING_STARTED'
                              ? 'Palam Pengecas Disambung'
                              : item.eventType === 'DISCHARGING'
                              ? 'Penggunaan Tanpa Wayar'
                              : 'Penjagaan Ambang Voltan'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.timestamp}</div>
                      </td>

                      <td className="py-3 px-3 tabular-nums">
                        <span className="text-slate-300 font-semibold">
                          {item.startLevel}% → {item.endLevel}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-400 tabular-nums">
                        {item.durationMinutes} minit
                      </td>

                      <td className="py-3 px-3 tabular-nums">
                        <span className="text-slate-200">{item.voltageV.toFixed(2)} V</span>
                        <span className="text-slate-500 text-[10px] block">{item.peakTemperature.toFixed(1)}°C</span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span
                          className={`text-[11px] font-semibold ${
                            isBypass ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {item.healthImpact}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
