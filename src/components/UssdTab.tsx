import React, { useState } from 'react';
import { PhoneCall, Send, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { INDONESIAN_OPERATORS } from '../data/constants';

interface UssdTabProps {
  currentOperatorId: string;
}

interface UssdTurn {
  type: 'request' | 'response';
  text: string;
  time: string;
}

export const UssdTab: React.FC<UssdTabProps> = ({ currentOperatorId }) => {
  const [ussdInput, setUssdInput] = useState('*888#');
  const [replyInput, setReplyInput] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTurns, setSessionTurns] = useState<UssdTurn[]>([]);

  const operator =
    INDONESIAN_OPERATORS.find((op) => op.id === currentOperatorId) || INDONESIAN_OPERATORS[0];

  const handleDial = (codeToDial?: string) => {
    const code = codeToDial || ussdInput;
    if (!code.trim()) return;

    setIsLoading(true);
    setSessionActive(true);

    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setSessionTurns([{ type: 'request', text: `Dial: ${code}`, time: now }]);

    setTimeout(() => {
      let responseText = '';
      if (code === '*888#') {
        responseText =
          'Sisa Pulsa Rp 38.500 sd 18/12/2026.\n1. Paket Internet Super Seru 50GB\n2. Cek Kuota & Status Paket\n3. Beli Paket Nelpon & SMS\n4. Layanan Darurat\n0. Menu Utama';
      } else if (code === '*363#') {
        responseText =
          'Spesial untuk Modem Orbit / 4G:\n1. 50GB / 30 Hari Rp 100.000\n2. 100GB / 30 Hari Rp 175.000\n3. 15GB / 7 Hari Rp 35.000\n4. Cek Kuota Internet\n9. Kembali';
      } else if (code === '*123#') {
        responseText =
          'Pulsa Rp 25.000 s/d 22/12/2026.\n1. Freedom Internet 50GB\n2. Cek Kuota & Akun\n3. Hot Promo Spesial\n4. Ekstra Kuota Malam';
      } else if (code === '*808#') {
        responseText =
          'Info Nomor XL: 0819-8921-3940.\nPulsa Rp 14.200 aktif sd 10/01/2027.\n1. Xtra Combo Flex 40GB\n2. Info Kuota & Benefit\n3. Bantuan XL';
      } else if (code === '*111#') {
        responseText =
          'Nomor Tri: 0896-1234-5678\nPulsa Rp 19.000 aktif s.d 30/11/2026.\n1. AlwaysOn (AON) 30GB\n2. Cek Kuota Tri\n3. Happy 50GB Rp80rb';
      } else if (code === '*999#' || code === '*995#') {
        responseText =
          'Sisa Kuota Smartfren 4G LTE:\n- Kuota 24 Jam: 28.4 GB s.d 29/11/2026\n- Kuota Malam: 10.0 GB\nPulsa Utama: Rp 12.000';
      } else {
        responseText = `Permintaan UMB [${code}] berhasil dikirim ke jaringan.\n1. Lanjut ke Pilihan Utama\n2. Cek Status Paket\n3. Batal / Tutup`;
      }

      setSessionTurns((prev) => [
        ...prev,
        {
          type: 'response',
          text: responseText,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
    }, 700);
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || isLoading) return;

    const reply = replyInput.trim();
    setReplyInput('');
    setIsLoading(true);

    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setSessionTurns((prev) => [...prev, { type: 'request', text: `Balasan: ${reply}`, time: now }]);

    setTimeout(() => {
      let responseText = '';
      if (reply === '1') {
        responseText =
          'Anda memilih Paket Internet 50GB / 30 Hari Rp 100.000.\nBalas:\n1. Beli dengan Pulsa\n2. Batalkan Permintaan';
      } else if (reply === '2') {
        responseText =
          'Status Kuota Aktif:\n- Kuota Utama: 48.2 GB berlaku s.d 07/12/2026 23:59 WIB.\n- Kuota Lokal: 0 GB.\nTerima kasih.';
      } else {
        responseText = `Pilihan [${reply}] telah diterima. Permintaan Anda sedang diproses melalui jaringan operator.`;
      }

      setSessionTurns((prev) => [
        ...prev,
        {
          type: 'response',
          text: responseText,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
    }, 600);
  };

  const handleEndSession = () => {
    setSessionActive(false);
    setSessionTurns([]);
    setReplyInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PhoneCall className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Dialer Kode USSD / UMB Interaktif
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Kirim kode perintah cepat (*888#, *363#, *123#) untuk mengecek pulsa, cek kuota, atau registrasi paket internet langsung dari SIM card modem H809Pro.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Operator:</span>
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-950 border border-slate-800"
              style={{ color: operator.color }}
            >
              {operator.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: USSD Session Console & Operator Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: USSD Interactive Terminal Box (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Sesi UMB / USSD Modem
            </h3>

            {sessionActive && (
              <button
                onClick={handleEndSession}
                className="px-2.5 py-1 text-[11px] font-medium text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 rounded transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Akhiri Sesi</span>
              </button>
            )}
          </div>

          {/* Session Display Output */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 min-h-[300px] max-h-[440px] overflow-y-auto space-y-3 font-mono text-xs mb-4">
            {sessionTurns.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-16">
                <PhoneCall className="w-8 h-8 text-slate-700 mb-2" />
                <p>Belum ada sesi USSD yang aktif.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Masukkan kode seperti *888# atau klik tombol preset di sebelah kanan.
                </p>
              </div>
            ) : (
              sessionTurns.map((turn, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg leading-relaxed ${
                    turn.type === 'request'
                      ? 'bg-slate-900 border border-slate-800 text-cyan-300 ml-6 text-right'
                      : 'bg-slate-900/90 border border-slate-700/80 text-slate-100 mr-6 whitespace-pre-wrap'
                  }`}
                >
                  <div className="text-[10px] text-slate-500 mb-1">{turn.time}</div>
                  <div>{turn.text}</div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 italic flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Menghubungi operator seluler ({operator.name})...</span>
              </div>
            )}
          </div>

          {/* Input Controls */}
          {!sessionActive ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Misal: *888# atau *363#"
                value={ussdInput}
                onChange={(e) => setUssdInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleDial()}
                disabled={isLoading || !ussdInput.trim()}
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Dial UMB</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleReply} className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik balasan angka (1, 2, dst)..."
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !replyInput.trim()}
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Balas</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Quick Operator Presets (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Pintasan UMB {operator.name}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Klik kode di bawah untuk langsung melakukan dial tanpa mengetik manual:
          </p>

          <div className="space-y-2.5">
            {operator.ussdPresets.map((preset, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-cyan-300">
                      {preset.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {preset.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{preset.desc}</div>
                </div>

                <button
                  onClick={() => {
                    setUssdInput(preset.code);
                    handleDial(preset.code);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap"
                >
                  Dial
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Catatan: Pastikan sinyal seluler modem dalam status terkoneksi (4G atau 3G) sebelum melakukan dial kode USSD.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
