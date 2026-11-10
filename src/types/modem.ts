export type NetworkMode = 'AUTO' | 'LTE_ONLY' | 'WCDMA_ONLY';

export interface SignalMetrics {
  rsrp: number; // dBm (-140 to -44)
  rsrq: number; // dB (-20 to -3)
  rssi: number; // dBm (-110 to -25)
  sinr: number; // dB (-10 to 30)
  csq: number; // 0 to 31
  cellId: string;
  pci: number; // Physical Cell ID
  tac: string; // Tracking Area Code
  band: number; // e.g. 1, 3, 5, 8, 40
  bandName: string;
  frequency: string; // e.g. "1800 MHz (FDD)"
}

export interface OperatorInfo {
  id: string;
  name: string;
  color: string;
  mccMnc: string;
  supportedBands: number[];
  ussdPresets: { label: string; code: string; desc: string }[];
}

export interface SMSMessage {
  id: string;
  sender: string;
  recipient?: string;
  timestamp: string;
  content: string;
  isRead: boolean;
  isOtp?: boolean;
  otpCode?: string;
  folder: 'inbox' | 'sent';
}

export interface ConnectedDevice {
  id: string;
  hostname: string;
  ip: string;
  mac: string;
  connectedAt: string;
  currentDownloadSpeed: number; // KB/s
  currentUploadSpeed: number; // KB/s
  totalDataUsed: number; // MB
  isBlocked: boolean;
}

export interface APNProfile {
  id: string;
  name: string;
  operator: string;
  apn: string;
  username: string;
  password: string;
  authType: 'NONE' | 'PAP' | 'CHAP';
  pdpType: 'IPv4' | 'IPv6' | 'IPv4v6';
  isDefault: boolean;
}

export interface BandOption {
  band: number;
  freq: string;
  duplex: 'FDD' | 'TDD';
  operators: string;
  description: string;
}

export interface ATCommandLog {
  id: string;
  command: string;
  response: string;
  timestamp: string;
  status: 'success' | 'error';
}

export interface ChargingHistoryItem {
  id: string;
  timestamp: string;
  eventType: 'CHARGING_STARTED' | 'CHARGING_COMPLETED' | 'BYPASS_ENGAGED' | 'DISCHARGING' | 'TRICKLE_MAINTENANCE';
  startLevel: number;
  endLevel: number;
  durationMinutes: number;
  peakTemperature: number;
  healthImpact: string;
  voltageV: number;
}

export interface BatteryHealthInfo {
  stateOfHealthPercent: number; // e.g. 94%
  designCapacityMah: number; // 3000 mAh
  currentFullCapacityMah: number; // 2820 mAh
  completedCycles: number; // 142
  ratedMaxCycles: number; // 500
  estimatedRemainingCycles: number; // 358
  voltageV: number; // 4.12 V
  currentRateMa: number; // +850 mA or 0
  batteryTemperature: number; // 31.8 C
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'REPLACE_SOON';
  bypassModeActive: boolean;
  history: ChargingHistoryItem[];
}

export interface ModemStatus {
  gatewayIp: string;
  isConnected: boolean;
  simStatus: 'READY' | 'NO_SIM' | 'PIN_REQUIRED';
  operator: OperatorInfo;
  networkType: '4G LTE' | '3G HSPA+' | 'No Service';
  networkMode: NetworkMode;
  lockedBands: number[];
  signal: SignalMetrics;
  downloadSpeed: number; // KB/s
  uploadSpeed: number; // KB/s
  totalDataMonth: number; // GB
  quotaLimitGb: number;
  temperature: number; // Celsius
  batteryStatus: 'BYPASS_DIRECT_POWER' | 'BATTERY_CHARGING' | 'BATTERY_FULL';
  batteryLevel: number; // %
  batteryHealth?: BatteryHealthInfo;
  uptimeSeconds: number;
  wifiSsid: string;
  wifiSecurity: string;
  wifiHideSsid: boolean;
  wifiChannel: string;
  maxClients: number;
  imei: string;
  macAddress: string;
  firmwareVersion: string;
  hardwareVersion: string;
}
