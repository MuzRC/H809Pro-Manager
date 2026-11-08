import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isRebootModalOpen, setIsRebootModalOpen] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);

  // Status awal modem
  const [status, setStatus] = useState<ModemStatus>(() => {
    const saved = localStorage.getItem('h809pro_status');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // sandaran jika ralat parse
      }
    }
    return {
      gatewayIp: '192.168.100.1',
      isConnected: true,
      connectionMode: 'simulated',
      simStatus: 'READY',
      operator: MALAYSIAN_OPERATORS[0], // Tune Talk lalai
      networkType: '4G LTE',
      networkMode: 'LTE_ONLY',
      lockedBands: [1, 3],
      signal: {
        rsrp: -82,
        rsrq: -9,
        rssi: -64,
        sinr: 18,
        csq: 27,
        cellId: '3819201',
        pci: 142,
        tac: '9201',
        band: 3,
        bandName: 'Jalur 3',
        frequency: '1800 MHz (FDD)',
      },
      downloadSpeed: 1840, // KB/s
      uploadSpeed: 420, // KB/s
      totalDataMonth: 21.4,
      quotaLimitGb: 50,
      temperature: 38,
      batteryStatus: 'BYPASS_DIRECT_POWER',
      batteryLevel: 100,
      uptimeSeconds: 14820,
      wifiSsid: 'H809Pro_4G_WiFi',
      wifiSecurity: 'WPA2-PSK',
      wifiHideSsid: false,
      wifiChannel: 'Auto (Disyorkan)',
      maxClients: 10,
      imei: '868940051283941',
      macAddress: '7C:B0:C2:59:E4:10',
      firmwareVersion: 'H809PRO_V4.2.1_MY_BYPASS',
      hardwareVersion: 'H809-PCB-V2.0',
    };
  });

  // Sejarah carta kelajuan (20 titik terakhir)
  const [speedHistory, setSpeedHistory] = useState<{ dl: number; ul: number }[]>([
    { dl: 1400, ul: 320 },
    { dl: 1650, ul: 380 },
    { dl: 1900, ul: 410 },
    { dl: 2100, ul: 540 },
    { dl: 1840, ul: 420 },
  ]);

  // Peti mesej SMS
  const [messages, setMessages] = useState<SMSMessage[]>(() => {
    const saved = localStorage.getItem('h809pro_sms');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // sandaran
      }
    }
    return INITIAL_SMS;
  });

  // Profil APN
  const [apnProfiles, setApnProfiles] = useState<APNProfile[]>(() => {
    const saved = localStorage.getItem('h809pro_apn');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // sandaran
      }
    }
    return DEFAULT_APN_LIST;
  });

  // Senarai peranti bersambung
  const [devices, setDevices] = useState<ConnectedDevice[]>([
    {
      id: 'dev-1',
      hostname: 'Telefon Redmi Note 12',
      ip: '192.168.100.12',
      mac: '44:85:00:23:AA:01',
      connectedAt: '10:14 Pagi',
      currentDownloadSpeed: 950,
      currentUploadSpeed: 180,
      totalDataUsed: 1420,
      isBlocked: false,
    },
    {
      id: 'dev-2',
      hostname: 'Komputer Riba Lenovo',
      ip: '192.168.100.15',
      mac: 'A8:64:F2:19:9C:55',
      connectedAt: '08:30 Pagi',
      currentDownloadSpeed: 820,
      currentUploadSpeed: 210,
      totalDataUsed: 3850,
      isBlocked: false,
    },
    {
      id: 'dev-3',
      hostname: 'Smart TV Ruang Tamu',
      ip: '192.168.100.20',
      mac: '60:01:94:44:11:3E',
      connectedAt: 'Semalam',
      currentDownloadSpeed: 70,
      currentUploadSpeed: 30,
      totalDataUsed: 5200,
      isBlocked: false,
    },
  ]);

  // Log Perintah AT
  const [atLogs, setAtLogs] = useState<ATCommandLog[]>([
    {
      id: 'cmd-0',
      command: 'ATI',
      response:
        'Penghala H809Pro LTE CPE\nPengilang: ASR Microelectronics\nModel: H809Pro-4G\nSemakan: V4.2.1-BYPASS\nIMEI: 868940051283941\n\nOK',
      timestamp: '22:40:02',
      status: 'success',
    },
  ]);

  // Simpan status dalam localStorage
  useEffect(() => {
    localStorage.setItem('h809pro_status', JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    localStorage.setItem('h809pro_sms', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('h809pro_apn', JSON.stringify(apnProfiles));
  }, [apnProfiles]);

  // Pemantau langsung trafik & telemetri isyarat
  useEffect(() => {
    if (isRebooting) return;

    const interval = setInterval(() => {
      setStatus((prev) => {
        const dlDelta = (Math.random() - 0.48) * 300;
        const ulDelta = (Math.random() - 0.48) * 80;
        const newDl = Math.max(120, Math.min(3800, Math.round(prev.downloadSpeed + dlDelta)));
        const newUl = Math.max(40, Math.min(950, Math.round(prev.uploadSpeed + ulDelta)));

        const rsrpFluct = (Math.random() - 0.5) * 1.5;
        const newRsrp = Math.max(-115, Math.min(-62, Math.round((prev.signal.rsrp + rsrpFluct) * 10) / 10));

        return {
          ...prev,
          downloadSpeed: newDl,
          uploadSpeed: newUl,
          uptimeSeconds: prev.uptimeSeconds + 2,
          signal: {
            ...prev.signal,
            rsrp: newRsrp,
          },
        };
      });

      setSpeedHistory((prev) => {
        const next = [
          ...prev.slice(1),
          {
            dl: status.downloadSpeed,
            ul: status.uploadSpeed,
          },
        ];
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isRebooting, status.downloadSpeed, status.uploadSpeed]);

  // Kemas kini isyarat secara manual
  const handleRefreshSignal = () => {
    setStatus((prev) => ({
      ...prev,
      signal: {
        ...prev.signal,
        rsrp: Math.round(-78 - Math.random() * 8),
        sinr: Math.round(16 + Math.random() * 6),
        csq: Math.round(25 + Math.random() * 5),
      },
    }));
  };

  // Tetapkan semula sambungan rangkaian
  const handleResetNetwork = () => {
    setStatus((prev) => ({ ...prev, downloadSpeed: 0, uploadSpeed: 0 }));
    setTimeout(() => {
      setStatus((prev) => ({
        ...prev,
        downloadSpeed: 2150,
        uploadSpeed: 480,
      }));
    }, 1200);
  };

  // Tetapan Kunci Jalur LTE
  const handleApplyBandConfig = (bands: number[], mode: NetworkMode) => {
    const primaryBand = bands.includes(3) ? 3 : bands[0] || 1;
    const bandFreqMap: Record<number, { name: string; freq: string }> = {
      1: { name: 'Jalur 1', freq: '2100 MHz (FDD)' },
      3: { name: 'Jalur 3', freq: '1800 MHz (FDD)' },
      5: { name: 'Jalur 5', freq: '850 MHz (FDD)' },
      8: { name: 'Jalur 8', freq: '900 MHz (FDD)' },
      40: { name: 'Jalur 40', freq: '2300 MHz (TDD)' },
    };

    const targetInfo = bandFreqMap[primaryBand] || bandFreqMap[3];

    setStatus((prev) => ({
      ...prev,
      lockedBands: bands,
      networkMode: mode,
      signal: {
        ...prev.signal,
        band: primaryBand,
        bandName: targetInfo.name,
        frequency: targetInfo.freq,
        sinr: primaryBand === 40 ? 22 : primaryBand === 3 ? 19 : 14,
        rsrp: primaryBand === 40 ? -79 : primaryBand === 3 ? -82 : -88,
      },
    }));

    const timeStr = new Date().toLocaleTimeString('ms-MY');
    setAtLogs((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: `AT+SETBAND=${bands.join(',')},MODE=${mode}`,
        response: `+SETBAND: JALUR_DIKUNCI=[${bands.join(',')}]\n+SYSMODE: ${mode}\nOK`,
        timestamp: timeStr,
        status: 'success',
      },
    ]);
  };

  // Pengendali SMS
  const handleSendMessage = (recipient: string, text: string) => {
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

    // Simulasi balasan operator automatik
    if (recipient === '133' || recipient === '118' || recipient === '100') {
      setTimeout(() => {
        const replyMsg: SMSMessage = {
          id: `sms-${Date.now() + 1}`,
          sender: recipient,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          content: `Balasan daripada ${recipient}: Permintaan "${text}" telah berjaya diproses. Baki kuota aktif anda ialah 48.2 GB dengan tempoh sah 30 hari.`,
          isRead: false,
          folder: 'inbox',
        };
        setMessages((prev) => [replyMsg, ...prev]);
      }, 1500);
    }
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMarkAsRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
    );
  };

  // Kemas kini tetapan Wi-Fi
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

  // Pengendali Profil APN
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

  // Pelaksana Perintah AT
  const handleExecuteATCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim().toUpperCase();
    const timeStr = new Date().toLocaleTimeString('ms-MY');
    let response = 'OK';
    let statusType: 'success' | 'error' = 'success';

    if (cmd === 'ATI') {
      response = `Penghala H809Pro LTE CPE\nPengilang: ASR Microelectronics\nModel: H809Pro-4G\nFirmware: ${status.firmwareVersion}\nIMEI: ${status.imei}\nMAC: ${status.macAddress}\n\nOK`;
    } else if (cmd === 'AT+CSQ') {
      response = `+CSQ: ${status.signal.csq},99\n\nOK`;
    } else if (cmd === 'AT+COPS?') {
      response = `+COPS: 0,0,"${status.operator.name.toUpperCase()}",7\n\nOK`;
    } else if (cmd === 'AT+CREG?') {
      response = `+CREG: 0,1\n\nOK`;
    } else if (cmd === 'AT^SYSINFO') {
      response = `^SYSINFO: 2,3,0,1,1\nMod: LTE Cat-4\nPerkhidmatan: SAH\nSIM: SEDIA\n\nOK`;
    } else if (cmd === 'AT+TEMP?' || cmd === 'AT+CPUTEMP') {
      response = `+TEMP: ${status.temperature}.2 C (SELAMAT)\n\nOK`;
    } else if (cmd === 'AT+CBC') {
      response = `+CBC: 0,100,5000\nMOD_KUASA: PINTASAN_USB_TERUS\nSTATUS: DALAM_TALIAN_24JAM\n\nOK`;
    } else if (cmd === 'AT+CGDCONT?') {
      const activeApn = apnProfiles.find((a) => a.isDefault) || apnProfiles[0];
      response = `+CGDCONT: 1,"${activeApn.pdpType}","${activeApn.apn}","0.0.0.0",0,0\n\nOK`;
    } else if (cmd === 'AT+RESET' || cmd === 'AT+REBOOT') {
      response = `^SYSRESET: MEMULAKAN URUTAN BUT SEMULA...\nOK`;
      setTimeout(() => {
        setIsRebootModalOpen(true);
        setIsRebooting(true);
      }, 500);
    } else if (cmd.startsWith('AT+')) {
      response = `ARAHAN DITERIMA\n+MODEM: ${cmd}\n\nOK`;
    } else {
      response = `+CME ERROR: 100 (ARAHAN TIDAK DIKETAHUI: "${cmd}")`;
      statusType = 'error';
    }

    setAtLogs((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: rawCmd,
        response,
        timestamp: timeStr,
        status: statusType,
      },
    ]);
  };

  // But Semula
  const handleRebootTrigger = () => {
    setIsRebootModalOpen(true);
    setIsRebooting(true);
  };

  const handleFinishReboot = () => {
    setIsRebootModalOpen(false);
    setIsRebooting(false);
    handleRefreshSignal();
  };

  // Tetapan Semula Kilang
  const handleFactoryReset = () => {
    if (
      window.confirm(
        'AMARAN: Adakah anda pasti ingin menetapkan semula modem H809Pro ke tetapan asal kilang?'
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
      {/* Bar Navigasi Atas */}
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

      {/* Paparan Kandungan Utama */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            status={status}
            speedHistory={speedHistory}
            onRefreshSignal={handleRefreshSignal}
            onResetNetwork={handleResetNetwork}
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

      {/* Modal Konfigurasi Get Laluan IP */}
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
        onConfirmReboot={() => setIsRebooting(true)}
        onCancel={handleFinishReboot}
        isRebooting={isRebooting}
      />

      {/* Kaki Halaman */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>Pengurus CPE 4G LTE H809Pro</span>
            <span className="mx-2">·</span>
            <span>Get Laluan: http://{status.gatewayIp}</span>
          </div>
          <div>
            <span>Status Pintasan: 5V USB Aktif</span>
            <span className="mx-2">·</span>
            <span className="text-emerald-400">Bersambung</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
