import React, { useState } from 'react';
import {
  Mail,
  Send,
  Trash2,
  Copy,
  Check,
  KeyRound,
  Search,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { SMSMessage } from '../types/modem';

interface SmsTabProps {
  messages: SMSMessage[];
  onSendMessage: (recipient: string, text: string) => void;
  onDeleteMessage: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

export const SmsTab: React.FC<SmsTabProps> = ({
  messages,
  onSendMessage,
  onDeleteMessage,
  onMarkAsRead,
}) => {
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOtpOnly, setFilterOtpOnly] = useState(false);
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<SMSMessage | null>(messages[0] || null);

  const handleCopyOtp = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtpId(id);
    setTimeout(() => setCopiedOtpId(null), 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !content.trim()) return;
    onSendMessage(recipient.trim(), content.trim());
    setContent('');
    setRecipient('');
  };

  const handleApplyTemplate = (phone: string, text: string) => {
    setRecipient(phone);
    setContent(text);
  };

  const filteredMessages = messages.filter((msg) => {
    if (filterOtpOnly && !msg.isOtp) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      msg.sender.toLowerCase().includes(q) ||
      msg.content.toLowerCase().includes(q) ||
      (msg.otpCode && msg.otpCode.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Manajer Pesan SMS & Deteksi Otomatis OTP
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Baca SMS masuk, salin kode verifikasi OTP dalam satu klik, dan kirim SMS perintah kuota langsung melalui kartu SIM modem H809Pro.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0">
            <span>Kapasitas SIM:</span>
            <span className="text-cyan-400 font-semibold tabular-nums">
              {messages.length} / 100 SMS
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Messages List & Composer/Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: SMS List (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari SMS atau pengirim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
              <button
                onClick={() => setFilterOtpOnly(false)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  !filterOtpOnly
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua ({messages.length})
              </button>
              <button
                onClick={() => setFilterOtpOnly(true)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  filterOtpOnly
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3 h-3 text-cyan-400" />
                <span>OTP ({messages.filter((m) => m.isOtp).length})</span>
              </button>
            </div>
          </div>

          {/* SMS Messages List */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredMessages.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 font-mono">
                Tidak ada pesan SMS yang ditemukan.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (!msg.isRead) onMarkAsRead(msg.id);
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500/60 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 font-mono truncate max-w-[140px]">
                          {msg.sender}
                        </span>
                        {!msg.isRead && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono">
                            BARU
                          </span>
                        )}
                        {msg.isOtp && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono flex items-center gap-0.5">
                            <KeyRound className="w-2.5 h-2.5" />
                            <span>OTP</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono shrink-0">
                        {msg.timestamp}
                      </span>
                    </div>

                    <p className="text-slate-400 line-clamp-2 leading-relaxed mb-2">
                      {msg.content}
                    </p>

                    {/* Quick OTP Copy Row */}
                    {msg.isOtp && msg.otpCode && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400">Kode OTP:</span>
                          <span className="text-sm font-bold font-mono tracking-widest text-cyan-300">
                            {msg.otpCode}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyOtp(msg.otpCode!, msg.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-1"
                        >
                          {copiedOtpId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-slate-950" />
                              <span>Disalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin Kode</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Message Details & Composer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Message Detail Box */}
          {selectedMessage && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="text-xs font-mono text-slate-400">Detail Pesan Masuk</div>
                  <div className="text-base font-bold text-white font-mono">
                    {selectedMessage.sender}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onDeleteMessage(selectedMessage.id);
                    setSelectedMessage(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  title="Hapus Pesan SMS Ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-500 mb-3">
                Waktu Terima: {selectedMessage.timestamp}
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap mb-4">
                {selectedMessage.content}
              </div>

              {selectedMessage.isOtp && selectedMessage.otpCode && (
                <div className="bg-cyan-950/40 border border-cyan-800/60 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-cyan-300 font-semibold">
                      Kode Verifikasi Terdeteksi
                    </div>
                    <div className="text-xl font-bold font-mono text-white tracking-widest">
                      {selectedMessage.otpCode}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyOtp(selectedMessage.otpCode!, selectedMessage.id)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-1.5"
                  >
                    {copiedOtpId === selectedMessage.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin OTP</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SMS Composer Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Tulis & Kirim SMS Baru</span>
            </h3>

            {/* Quick Templates */}
            <div className="mb-4">
              <div className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Template SMS Cepat:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('363', 'FLASH INFO')}
                  className="px-2 py-1 text-[11px] font-mono bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded transition-colors"
                >
                  363: FLASH INFO
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('234', 'USAGE')}
                  className="px-2 py-1 text-[11px] font-mono bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded transition-colors"
                >
                  234: USAGE (Tri)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('995', 'CEK')}
                  className="px-2 py-1 text-[11px] font-mono bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded transition-colors"
                >
                  995: CEK (Smartfren)
                </button>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Nomor Tujuan / Shortcode
                </label>
                <input
                  type="text"
                  placeholder="Misal: 363 atau 08123456789"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-[11px] font-mono text-slate-400">
                    Isi Pesan SMS
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {content.length} / 160 karakter (1 SMS)
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Ketik isi pesan SMS di sini..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!recipient.trim() || !content.trim()}
                className="w-full py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim SMS via SIM Modem</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
