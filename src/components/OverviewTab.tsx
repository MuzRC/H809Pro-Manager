import React, { useState, useEffect } from 'react';
import {
  Radio,
  ArrowDown,
  ArrowUp,
  Volume2,
  VolumeX,
  RefreshCw,
  HardDrive,
  Cpu,
  Zap,
  TowerControl,
  Wifi,
} from 'lucide-react';
import { ModemStatus } from '../types/modem';
import { startSignalBeeper, stopSignalBeeper, updateSignalTone } from '../utils/audioSignal';

interface OverviewTabProps {
  status: ModemStatus;
  speedHistory: { dl: number; ul: number }[];
  onRefreshSignal: () => void;
  onResetNetwork: () => void;
  onSwitchBandClick: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  status,
  speedHistory,
  onRefreshSignal,
  onResetNetwork,
  onSwitchBandClick,
}) => {
  const [isBeeperActive, setIsBeeperActive] = useState(false);

  // Sync beeper with RSRP updates
  useEffect(() => {
    if (isBeeperActive) {
      updateSignalTone(status.signal.rsrp);
    }
  }, [status.signal.rsrp, isBeeperActive]);

  // Clean up audio when unmounting
  useEffect(() => {
    return () => {
      stopSignalBeeper();
    };
  }, []);

  const toggleBeeper = () => {
    if (isBeeperActive) {
      stopSignalBeeper();
      setIsBeeperActive(false);
    } else {
      const started = startSignalBeeper(status.signal.rsrp);
      if (started) {
        setIsBeeperActive(true);
      }
    }
  };

  // RSRP Quality helper
  const getRsrpQuality = (rsrp: number) => {
    if (rsrp >= -80) return { label: 'Sangat Bagus (Excellent)', color: 'text-emerald-400', bar: 'w-full bg-emerald-500' };
    if (rsrp >= -90) return { label: 'Bagus (Good)', color: 'text-cyan-400', bar: 'w-3/4 bg-cyan-500' };
    if (rsrp >= -105) return { label: 'Sedang (Fair)', color: 'text-amber-400', bar: 'w-1/2 bg-amber-500' };
    return { label: 'Lemah (Poor)', color: 'text-rose-400', bar: 'w-1/4 bg-rose-500' };
  };

  // SINR Quality helper
  const getSinrQuality = (sinr: number) => {
    if (sinr >= 20) return { label: 'Kualitas Prima (>20 dB)', color: 'text-emerald-400' };
    if (sinr >= 13) return { label: 'Bersih (13 - 20 dB)', color: 'text-cyan-400' };
    if (sinr >= 0) return { label: 'Cukup Terinterferensi (0 - 12 dB)', color: 'text-amber-400' };
    return { label: 'Bising / Interferensi Berat (<0 dB)', color: 'text-rose-400' };
  };

  const rsrpQual = getRsrpQuality(status.signal.rsrp);
  const sinrQual = getSinrQuality(status.signal.sinr);

  // SVG speed sparkline
  const maxSpeed = Math.max(...speedHistory.map((s) => Math.max(s.dl, s.ul)), 100);
  const dlPoints = speedHistory
    .map((s, idx) => {
      const x = (idx / Math.max(speedHistory.length - 1, 1)) * 300;
      const y = 80 - (s.dl / maxSpeed) * 70;
      return `${x},${Math.max(5, y)}`;
    })
    .join(' ');

  const ulPoints = speedHistory
    .map((s, idx) => {
      const x = (idx / Math.max(speedHistory.length - 1, 1)) * 300;
      const y = 80 - (s.ul / maxSpeed) * 70;
      return `${x},${Math.max(5, y)}`;
    })
    .join(' ');

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs} jam ${mins} menit`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Device Spotlight Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Device Visual & Hardware Specs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Modem 4G H809Pro
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>ASR Cat-4 Chipset</span>
                  <span aria-hidden="true">·</span>
                  <span>Portable CPE Router</span>
                </div>
              </div>

              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/80 text-emerald-400">
                {status.simStatus === 'READY' ? 'SIM AKTIF' : 'NO SIM'}
              </span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-[4/3] mb-4 flex items-center justify-center">
              <img
                src="/src/assets/images/h809pro_modem_device_1794120095759.jpg"
                alt="Modem H809Pro 4G LTE Router"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-3">
                <div className="flex items-center justify-between w-full text-xs font-mono">
                  <span className="text-slate-300">H809Pro v4.2.1-ID</span>
                  <span className="text-emerald-400">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hardware Indicators */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <div className="text-slate-500 text-[11px] flex items-center gap-1 mb-0.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Daya</span>
              </div>
              <div className="text-slate-200 font-semibold truncate">
                {status.batteryStatus === 'BYPASS_DIRECT_POWER' ? 'Bypass (USB)' : 'Baterai'}
              </div>
            </div>

            <div>
              <div className="text-slate-500 text-[11px] flex items-center gap-1 mb-0.5">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>Suhu CPU</span>
              </div>
              <div className="text-slate-200 font-semibold tabular-nums">
                {status.temperature}°C (Normal)
              </div>
            </div>

            <div>
              <div className="text-slate-500 text-[11px] flex items-center gap-1 mb-0.5">
                <HardDrive className="w-3 h-3 text-emerald-400" />
                <span>Uptime</span>
              </div>
              <div className="text-slate-200 font-semibold truncate">
                {formatUptime(status.uptimeSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Live Signal Telemetry & Band Quick Action */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Koneksi Seluler Aktif
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xl font-bold tracking-tight text-white"
                    style={{ color: status.operator.color }}
                  >
                    {status.operator.name}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 rounded">
                    {status.networkType}
                  </span>
                  <span className="text-xs font-mono text-cyan-400">
                    B{status.signal.band} ({status.signal.frequency})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onRefreshSignal}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
                  title="Ambil data sinyal terbaru dari modem"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Sinyal</span>
                </button>

                <button
                  onClick={onSwitchBandClick}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap"
                >
                  Kunci Band
                </button>
              </div>
            </div>

            {/* Signal Telemetry Cards (RSRP, RSRQ, RSSI, SINR) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {/* RSRP */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] font-mono text-slate-400 mb-1">RSRP (Power)</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
                  {status.signal.rsrp} <span className="text-xs font-normal text-slate-400">dBm</span>
                </div>
                <div className={`text-[11px] font-medium mt-1 truncate ${rsrpQual.color}`}>
                  {rsrpQual.label.split(' ')[0]}
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className={`h-full ${rsrpQual.bar} transition-all duration-300`} />
                </div>
              </div>

              {/* SINR */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] font-mono text-slate-400 mb-1">SINR (SNR)</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
                  {status.signal.sinr} <span className="text-xs font-normal text-slate-400">dB</span>
                </div>
                <div className={`text-[11px] font-medium mt-1 truncate ${sinrQual.color}`}>
                  {status.signal.sinr >= 15 ? 'Jernih' : 'Cukup'}
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(10, ((status.signal.sinr + 5) / 35) * 100))}%` }}
                  />
                </div>
              </div>

              {/* RSRQ */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] font-mono text-slate-400 mb-1">RSRQ (Quality)</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
                  {status.signal.rsrq} <span className="text-xs font-normal text-slate-400">dB</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Normal Range</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(10, ((status.signal.rsrq + 20) / 17) * 100))}%` }}
                  />
                </div>
              </div>

              {/* RSSI */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] font-mono text-slate-400 mb-1">RSSI (Strength)</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
                  {status.signal.rssi} <span className="text-xs font-normal text-slate-400">dBm</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">CSQ: {status.signal.csq}/31</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-400 transition-all duration-300"
                    style={{ width: `${(status.signal.csq / 31) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cell Tower Details Table Strip */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-3 text-xs font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
                <div>
                  <span className="text-slate-500 block text-[11px]">Cell ID (eNB)</span>
                  <span className="text-slate-200 font-medium">{status.signal.cellId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">PCI</span>
                  <span className="text-slate-200 font-medium">{status.signal.pci}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">TAC (Area Code)</span>
                  <span className="text-slate-200 font-medium">{status.signal.tac}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Mode Jaringan</span>
                  <span className="text-cyan-400 font-medium">
                    {status.networkMode === 'LTE_ONLY' ? '4G Only (Terkunci)' : 'Otomatis'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pointing Tool Strip (Antenna Aiming Audio Beeper) */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TowerControl className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-200">
                  Bantuan Pointing Antena Luar (Beeper Audio)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Nada audio makin tinggi seiring membaiknya sinyal RSRP saat mengarahkan antena Yagi/Log-Periodic.
                </span>
              </div>
            </div>

            <button
              onClick={toggleBeeper}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1.5 ${
                isBeeperActive
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isBeeperActive ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hentikan Beeper</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Nyalakan Beeper</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Traffic & Speed Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Realtime Speed & Sparkline Canvas */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Kecepatan Data Realtime
              </h3>
              <p className="text-xs text-slate-400">
                Pemantauan lalu lintas unduh & unggah secara langsung
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-slate-300">Unduh:</span>
                <span className="text-cyan-400 font-semibold tabular-nums">
                  {(status.downloadSpeed / 1024).toFixed(2)} MB/s
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Unggah:</span>
                <span className="text-emerald-400 font-semibold tabular-nums">
                  {(status.uploadSpeed / 1024).toFixed(2)} MB/s
                </span>
              </div>
            </div>
          </div>

          {/* SVG Sparkline Graph */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 relative h-36 flex flex-col justify-between overflow-hidden">
            <svg
              viewBox="0 0 300 80"
              preserveAspectRatio="none"
              className="w-full h-full absolute inset-0 px-2 py-2"
            >
              {/* Grid lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="40" x2="300" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Download line */}
              <polyline
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={dlPoints}
              />

              {/* Upload line */}
              <polyline
                fill="none"
                stroke="#34d399"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={ulPoints}
              />
            </svg>

            {/* Graph overlay tags */}
            <div className="flex justify-between items-start z-10 text-[10px] font-mono text-slate-500">
              <span>Maks: {(maxSpeed / 1024).toFixed(1)} MB/s</span>
              <span>30 detik terakhir</span>
            </div>
            <div className="flex justify-between items-end z-10 text-[10px] font-mono text-slate-500">
              <span>0 KB/s</span>
              <span>Live Monitor</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono">
            <div className="flex items-center gap-2 p-2.5 rounded bg-slate-950/60 border border-slate-800/70">
              <div className="p-2 rounded bg-cyan-950/60 text-cyan-400">
                <ArrowDown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">Kecepatan Download</div>
                <div className="text-white font-bold text-sm tabular-nums">
                  {status.downloadSpeed.toLocaleString()} KB/s
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded bg-slate-950/60 border border-slate-800/70">
              <div className="p-2 rounded bg-emerald-950/60 text-emerald-400">
                <ArrowUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">Kecepatan Upload</div>
                <div className="text-white font-bold text-sm tabular-nums">
                  {status.uploadSpeed.toLocaleString()} KB/s
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quota & Quick Network Controls */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Statistik Kuota Data
              </h3>
              <span className="text-xs font-mono text-slate-400">Bulan Ini</span>
            </div>

            {/* Quota Progress */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs text-slate-400">Total Terpakai:</span>
                <span className="text-lg font-bold font-mono text-white tabular-nums">
                  {status.totalDataMonth.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {status.quotaLimitGb} GB</span>
                </span>
              </div>

              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (status.totalDataMonth / status.quotaLimitGb) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Sisa: {(status.quotaLimitGb - status.totalDataMonth).toFixed(1)} GB</span>
                <span>{((status.totalDataMonth / status.quotaLimitGb) * 100).toFixed(0)}% terpakai</span>
              </div>
            </div>

            {/* Quick WiFi & APN Snapshot */}
            <div className="space-y-2 text-xs font-mono mb-4">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SSID Wi-Fi:</span>
                </span>
                <span className="text-slate-200 font-semibold">{status.wifiSsid}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kanal / Saluran:</span>
                </span>
                <span className="text-slate-200 font-semibold">{status.wifiChannel}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={onResetNetwork}
              className="w-full py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset & Reconnect Jaringan LTE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
