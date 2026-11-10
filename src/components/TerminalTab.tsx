import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, Copy, Check, HelpCircle, Sparkles, Globe } from 'lucide-react';
import { ATCommandLog } from '../types/modem';
import { COMMON_AT_COMMANDS, COMMON_CGI_COMMANDS } from '../data/constants';

interface TerminalTabProps {
  logs: ATCommandLog[];
  onExecuteCommand: (cmd: string) => void;
  onClearLogs: () => void;
}

export const TerminalTab: React.FC<TerminalTabProps> = ({
  logs,
  onExecuteCommand,
  onClearLogs,
}) => {
  const [inputCmd, setInputCmd] = useState('');
  const [activeCategory, setActiveCategory] = useState<'AT' | 'CGI'>('AT');
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;
    onExecuteCommand(inputCmd.trim());
    setInputCmd('');
  };

  const handleQuickCmd = (cmd: string) => {
    onExecuteCommand(cmd);
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.command}\n${l.response}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Pengenalan Tab */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Konsol & Terminal Arahan AT / CGI-BIN H809Pro
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Hantar arahan AT secara terus atau laksanakan skrip CGI-BIN (/cgi-bin/qcmap_web_cgi & /cgi-bin/enode.cgi) untuk diagnostik perkakasan dan semakan rangkaian modem.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              disabled={logs.length === 0}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Disalin' : 'Salin Log'}</span>
            </button>

            <button
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Utama Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Paparan Skrin Terminal & Input */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          {/* Suis Kategori Pintasan: Arahan AT vs Skrip CGI */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveCategory('AT')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  activeCategory === 'AT'
                    ? 'bg-slate-800 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Arahan AT</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('CGI')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  activeCategory === 'CGI'
                    ? 'bg-slate-800 text-amber-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Skrip CGI-BIN</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              Klik butang untuk hantar terus
            </span>
          </div>

          {/* Bar Butang Pintasan Mengikut Kategori */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {activeCategory === 'AT'
              ? COMMON_AT_COMMANDS.slice(0, 6).map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => handleQuickCmd(item.cmd)}
                    className="px-2.5 py-1 text-xs font-mono bg-slate-950 hover:bg-cyan-950/50 text-cyan-300 hover:text-cyan-200 border border-slate-800 hover:border-cyan-700 rounded transition-colors"
                  >
                    {item.cmd}
                  </button>
                ))
              : COMMON_CGI_COMMANDS.map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => handleQuickCmd(item.cmd)}
                    className="px-2.5 py-1 text-xs font-mono bg-slate-950 hover:bg-amber-950/50 text-amber-300 hover:text-amber-200 border border-slate-800 hover:border-amber-700 rounded transition-colors"
                  >
                    {item.cmd.split('?')[0].replace('/cgi-bin/', '')} ({item.desc.slice(0, 16)}...)
                  </button>
                ))}
          </div>

          {/* Ruang Konsol Terminal */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
            <div className="text-slate-500 pb-2 border-b border-slate-900 text-[11px]">
              Konsol Bersiri AT & Skrip CGI Modem H809Pro [192.168.1.1]
              <br />
              Menyokong format AT (contoh: AT+CSQ) dan laluan CGI (/cgi-bin/qcmap_web_cgi atau /cgi-bin/enode.cgi).
            </div>

            {logs.length === 0 ? (
              <div className="text-slate-600 italic py-12 text-center">
                Terminal sedia. Klik butang pintasan di atas atau masukkan arahan AT / CGI di bawah.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <span className="text-slate-600 text-[10px]">{log.timestamp}</span>
                    <span className="text-slate-500">&gt;</span>
                    <span className="font-bold">{log.command}</span>
                  </div>

                  <div
                    className={`pl-4 whitespace-pre-wrap ${
                      log.status === 'error' ? 'text-rose-400' : 'text-slate-200'
                    }`}
                  >
                    {log.response}
                  </div>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Borang Input Arahan Terminal */}
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-cyan-400 font-mono text-xs font-bold">
                &gt;
              </span>
              <input
                type="text"
                placeholder="Taip arahan (contoh: AT+CSQ atau /cgi-bin/qcmap_web_cgi?action=get_status)..."
                value={inputCmd}
                onChange={(e) => setInputCmd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={!inputCmd.trim()}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Hantar</span>
            </button>
          </form>
        </div>

        {/* Panel Rujukan & Dokumentasi Arahan */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Rujukan Arahan H809Pro
            </h3>
          </div>

          <div>
            <div className="text-xs font-bold text-cyan-300 font-mono mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Arahan AT Utama:</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              {COMMON_AT_COMMANDS.slice(0, 5).map((item) => (
                <div
                  key={item.cmd}
                  onClick={() => handleQuickCmd(item.cmd)}
                  className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-700/60 cursor-pointer transition-colors"
                >
                  <div className="text-cyan-300 font-bold mb-0.5">{item.cmd}</div>
                  <div className="text-[11px] text-slate-400">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-amber-300 font-mono mb-2 flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-400" />
              <span>Skrip CGI-BIN Modem:</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              {COMMON_CGI_COMMANDS.map((item) => (
                <div
                  key={item.cmd}
                  onClick={() => handleQuickCmd(item.cmd)}
                  className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-amber-700/60 cursor-pointer transition-colors"
                >
                  <div className="text-amber-300 font-bold text-[11px] break-all mb-0.5">{item.cmd}</div>
                  <div className="text-[11px] text-slate-400">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
