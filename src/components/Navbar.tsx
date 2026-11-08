import React from 'react';
import { RotateCw, ExternalLink, Globe } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gatewayIp: string;
  onOpenGatewayModal: () => void;
  onRebootClick: () => void;
  isRebooting: boolean;
  operatorName: string;
  networkType: string;
  rsrp: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  gatewayIp,
  onOpenGatewayModal,
  onRebootClick,
  isRebooting,
  operatorName,
  networkType,
  rsrp,
}) => {
  const navItems = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'bandlock', label: 'Kunci Jalur' },
    { id: 'sms', label: 'SMS & OTP' },
    { id: 'ussd', label: 'Dail USSD' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'apn', label: 'APN' },
    { id: 'terminal', label: 'Terminal AT' },
    { id: 'system', label: 'Sistem' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Logo & Status Pantas */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group flex items-baseline gap-2"
            >
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors whitespace-nowrap">
                H809Pro
              </span>
              <span className="text-xs text-slate-400 tracking-wider font-mono hidden sm:inline">
                4G LTE CPE
              </span>
            </button>

            <span className="text-slate-700 hidden md:inline">|</span>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="text-emerald-400">{networkType}</span>
              <span>·</span>
              <span className="text-slate-300">{operatorName}</span>
              <span>·</span>
              <span>{rsrp} dBm</span>
            </div>
          </div>

          {/* Pautan Navigasi Desktop */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-400">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-xs tracking-wide uppercase font-semibold ${
                    isActive
                      ? 'text-cyan-400 border-cyan-400'
                      : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Kawalan Get Laluan & But Semula */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenGatewayModal}
              className="px-3 py-1.5 text-xs font-mono font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
              title="Konfigurasi IP Get Laluan Modem"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{gatewayIp}</span>
            </button>

            <a
              href={`http://${gatewayIp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-md border border-slate-700 transition-colors whitespace-nowrap"
              title="Buka WebGUI Asal Modem di Tab Baharu"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WebGUI</span>
            </a>

            <button
              onClick={onRebootClick}
              disabled={isRebooting}
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRebooting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">But Semula</span>
            </button>
          </div>
        </div>

        {/* Bar Navigasi Skrin Sentuh / Telefon */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
