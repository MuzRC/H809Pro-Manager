import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { BandLockTab } from './components/BandLockTab';
import { SmsTab } from './components/SmsTab';
import { UssdTab } from './components/UssdTab';
import { WifiTab } from './components/WifiTab';
import { ApnTab } from './components/ApnTab';
import { TerminalTab } from './components/TerminalTab';
import { SystemTab } from './components/SystemTab';
import { GatewayModal } from './components/GatewayModal';
import { RebootModal } from './components/RebootModal';
import {
  ModemStatus,
  SMSMessage,
  ConnectedDevice,
  APNProfile,
  ATCommandLog,
  NetworkMode,
} from './types/modem';
import {
  MALAYSIAN_OPERATORS,
  DEFAULT_APN_LIST,
  INITIAL_SMS,
} from './data/constants';
import { h809proApi } from './services/h809proApi';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isRebootModalOpen, setIsRebootModalOpen] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);

  // Status Modem
  const [status, setStatus] = useState<ModemStatus>(() => {
    const saved = localStorage.getItem('h809pro_status');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Sandaran jika parse ralat
      }
    }
    return {
      gatewayIp: '192.168.1.1',
      isConnected: false,
      connectionMode: 'live',
      simStatus: 'READY',
      operator: MALAYSIAN_OPERATORS[0],
      networkType: '4G LTE',
      networkMode: 'LTE_ONLY',
      lockedBands: [1, 3],
      signal: {
        rsrp: -85,
        rsrq: -10,
        rssi: -65,
        sinr: 16,
        csq: 24,
        cellId: '3819201',
        pci: 142,
        tac: '9201',
        band: 3,
        bandName: 'Jalur 3',
        frequency: '1800 MHz (FDD)',
      },
      downloadSpeed: 0,
      uploadSpeed: 0,
      totalDataMonth: 18.5,
      quotaLimitGb: 50,
      temperature: 38,
      batteryStatus: 'BYPASS_DIRECT_POWER',
      batteryLevel: 100,
      uptimeSeconds: 0,
      wifiSsid: 'H809Pro_4G_WiFi',
      wifiSecurity: 'WPA2-PSK',
      wifiHideSsid: false,
      wifiChannel: 'Auto (Disyorkan)',
      maxClients: 10,
      imei: '868940051283941',
      macAddress: '7C:B0:C2:59:E4:10',
      firmwareVersion: 'H809PRO_V4.2.1_LIVE',
      hardwareVersion: 'H809-PCB-V2.0',
    };
  });

  const [speedHistory, setSpeedHistory] = useState<{ dl: number; ul: number }[]>([
    { dl: 0, ul: 0 },
    { dl: 0, ul: 0 },
    { dl: 0, ul: 0 },
    { dl: 0, ul: 0 },
    { dl: 0, ul: 0 },
  ]);

  const [messages, setMessages] = useState<SMSMessage[]>(() => {
    const saved = localStorage.getItem('h809pro_sms');
    return saved ? JSON.parse(saved) : INITIAL_SMS;
  });

  const [apnProfiles, setApnProfiles] = useState<APNProfile[]>(() => {
    const saved = localStorage.getItem('h809pro_apn');
    return saved ? JSON.parse(saved) : DEFAULT_APN_LIST;
  });

  const [devices, setDevices] = useState<ConnectedDevice[]>([
    {
      id: 'dev-1',
      hostname: 'Telefon Bimbit (Peranti Ini)',
      ip: '192.168.1.10',
      mac: '44:85:00:23:AA:01',
      connectedAt: 'Aktif',
      currentDownloadSpeed: 450,
      currentUploadSpeed: 80,
      totalDataUsed: 1250,
      isBlocked: false,
    },
  ]);

  const [atLogs, setAtLogs] = useState<ATCommandLog[]>([
    {
      id: 'cmd-init',
      command: 'ATI',
      response: 'Modem H809Pro Bersambung.\nPengilang: ASR Microelectronics\nStatus: SEDIA',
      timestamp: new Date().toLocaleTimeString('ms-MY'),
      status: 'success',
    },
  ]);

  // Kemas kini Gateway IP bila pengguna menukar tetapan
  useEffect(() => {
    h809proApi.setGatewayIp(status.gatewayIp);
  }, [status.gatewayIp]);

  // Polling Langsung: Ambil Isyarat & Maklumat daripada Modem Sebenar
  const refreshLiveTelemetry = useCallback(async () => {
    if (isRebooting) return;

    const isAlive = await h809proApi.pingGateway();
    if (!isAlive && status.connectionMode === 'live') {
      setStatus((prev) => ({ ...prev, isConnected: false }));
      return;
    }

    const liveData = await h809proApi.fetchLiveStatus();
    setStatus((prev) => ({
      ...prev,
      ...liveData,
      isConnected: true,
      uptimeSeconds: prev.uptimeSeconds + 3,
    }));
  }, [isRebooting, status.connectionMode]);

  useEffect(() => {
    refreshLiveTelemetry();
    const interval = setInterval(refreshLiveTelemetry, 3000);
    return () => clearInterval(interval);
  }, [refreshLiveTelemetry]);

  // Simpan tetapan dalam storan peranti
  useEffect(() => {
    localStorage.setItem('h809pro_status', JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    localStorage.setItem('h809pro_sms', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('h809pro_apn', JSON.stringify(apnProfiles));
  }, [apnProfiles]);

  // Kunci Jalur Sebenar
  const handleApplyBandConfig = async (bands: number[], mode: NetworkMode) => {
    const success = await h809proApi.applyBandLock(bands, mode);
    const timeStr = new Date().toLocaleTimeString('ms-MY');

    setStatus((prev) => ({
      ...prev,
      lockedBands: bands,
      networkMode: mode,
    }));

    setAtLogs((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: `AT^SETBAND=${bands.join(',')},MODE=${mode}`,
        response: success
          ? `+SETBAND: JALUR BERJAYA DIKUNCI=[${bands.join(',')}]\nOK`
          : `RALAT: Modem gagal menetapkan jalur frekuensi`,
        timestamp: timeStr,
        status: success ? 'success' : 'error',
      },
    ]);

    refreshLiveTelemetry();
  };

  // Pelaksana Arahan AT Sebenar
  const handleExecuteATCommand = async (rawCmd: string) => {
    const timeStr = new Date().toLocaleTimeString('ms-MY');
    const response = await h809proApi.executeATCommand(rawCmd);

    setAtLogs((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: rawCmd,
        response,
        timestamp: timeStr,
        status: response.startsWith('RALAT') ? 'error' : 'success',
      },
    ]);
  };

  // But Semula Perkakasan Sebenar
  const handleRebootTrigger = async () => {
    setIsRebootModalOpen(true);
    setIsRebooting(true);
    await h809proApi.rebootModem();
  };

  const handleFinishReboot = () => {
    setIsRebootModalOpen(false);
    setIsRebooting(false);
    refreshLiveTelemetry();
  };

  // Pengendali SMS Sebenar
  const handleSendMessage = async (recipient: string, text: string) => {
    const timeStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newMsg: SMSMessage = {
      id: `sms-${Date.now()}`,
      sender: `Kepada: ${recipient}`,
      recipient,
      timestamp: timeStr,
      content: text,
      isRead: true,
      folder: 'sent',
    };

    setMessages((prev) => [newMsg, ...prev]);
    await h809proApi.sendSMS(recipient, text);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMarkAsRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
    );
  };

  const handleUpdateWifiSettings = (
    ssid: string,
    pass: string,
    hide: boolean,
    ch: string
  ) => {
    setStatus((prev) => ({
      ...prev,
      wifiSsid: ssid,
      wifiHideSsid: hide,
      wifiChannel: ch,
    }));
  };

  const handleToggleBlockDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, isBlocked: !d.isBlocked } : d))
    );
  };

  const handleSetDefaultApn = (id: string) => {
    setApnProfiles((prev) =>
      prev.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
    );
  };

  const handleAddApn = (newProfile: APNProfile) => {
    setApnProfiles((prev) => [...prev, newProfile]);
  };

  const handleFactoryReset = () => {
    if (
      window.confirm(
        'AMARAN: Adakah anda pasti ingin menetapkan semula modem H809Pro ke tetapan asal kilang (192.168.1.1)?'
      )
    ) {
      localStorage.removeItem('h809pro_status');
      localStorage.removeItem('h809pro_sms');
      localStorage.removeItem('h809pro_apn');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Bar Navigasi */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gatewayIp={status.gatewayIp}
        onOpenGatewayModal={() => setIsGatewayModalOpen(true)}
        onRebootClick={() => setIsRebootModalOpen(true)}
        isRebooting={isRebooting}
        operatorName={status.operator.name}
        networkType={status.networkType}
        rsrp={status.signal.rsrp}
      />

      {/* Amaran Jika Wi-Fi Modem Belum Bersambung */}
      {!status.isConnected && (
        <div className="bg-amber-950/80 border-b border-amber-800 px-4 py-2 text-center text-xs text-amber-200 font-mono">
          Perhatian: Tidak dapat berhubung dengan modem di http://{status.gatewayIp}. Sila pastikan telefon anda telah menyambung ke Wi-Fi modem H809Pro.
        </div>
      )}

      {/* Kandungan Tab Utama */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            status={status}
            speedHistory={speedHistory}
            onRefreshSignal={refreshLiveTelemetry}
            onResetNetwork={() => handleExecuteATCommand('AT+CFUN=0\nAT+CFUN=1')}
            onSwitchBandClick={() => setActiveTab('bandlock')}
          />
        )}

        {activeTab === 'bandlock' && (
          <BandLockTab
            currentLockedBands={status.lockedBands}
            currentNetworkMode={status.networkMode}
            onApplyBandConfig={handleApplyBandConfig}
            operatorId={status.operator.id}
          />
        )}

        {activeTab === 'sms' && (
          <SmsTab
            messages={messages}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onMarkAsRead={handleMarkAsRead}
          />
        )}

        {activeTab === 'ussd' && (
          <UssdTab currentOperatorId={status.operator.id} />
        )}

        {activeTab === 'wifi' && (
          <WifiTab
            currentSsid={status.wifiSsid}
            currentChannel={status.wifiChannel}
            hideSsid={status.wifiHideSsid}
            maxClients={status.maxClients}
            devices={devices}
            onUpdateWifiSettings={handleUpdateWifiSettings}
            onToggleBlockDevice={handleToggleBlockDevice}
          />
        )}

        {activeTab === 'apn' && (
          <ApnTab
            apnProfiles={apnProfiles}
            onSetDefaultApn={handleSetDefaultApn}
            onAddApn={handleAddApn}
          />
        )}

        {activeTab === 'terminal' && (
          <TerminalTab
            logs={atLogs}
            onExecuteCommand={handleExecuteATCommand}
            onClearLogs={() => setAtLogs([])}
          />
        )}

        {activeTab === 'system' && (
          <SystemTab
            status={status}
            onRebootClick={handleRebootTrigger}
            isRebooting={isRebooting}
            onFactoryResetClick={handleFactoryReset}
            onUpdateLimit={(newLimit) =>
              setStatus((prev) => ({ ...prev, quotaLimitGb: newLimit }))
            }
          />
        )}
      </main>

      {/* Modal Get Laluan IP */}
      <GatewayModal
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
        gatewayIp={status.gatewayIp}
        onSaveGatewayIp={(newIp) =>
          setStatus((prev) => ({ ...prev, gatewayIp: newIp }))
        }
        connectionMode={status.connectionMode}
        onChangeConnectionMode={(newMode) =>
          setStatus((prev) => ({ ...prev, connectionMode: newMode }))
        }
      />

      {/* Modal But Semula */}
      <RebootModal
        isOpen={isRebootModalOpen}
        onConfirmReboot={handleRebootTrigger}
        onCancel={handleFinishReboot}
        isRebooting={isRebooting}
      />

      {/* Kaki Halaman */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>Pengurus CPE 4G LTE H809Pro (Live)</span>
            <span className="mx-2">·</span>
            <span>Get Laluan: http://{status.gatewayIp}</span>
          </div>
          <div>
            <span>Status Perkakasan: </span>
            <span className={status.isConnected ? 'text-emerald-400' : 'text-rose-400'}>
              {status.isConnected ? 'Bersambung ke Modem' : 'Tiada Sambungan'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
