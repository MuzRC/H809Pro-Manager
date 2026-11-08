import React, { useState } from 'react';
import { PhoneCall, Send, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import { MALAYSIAN_OPERATORS } from '../data/constants';

interface UssdTabProps {
  currentOperatorId: string;
}

interface UssdTurn {
  type: 'request' | 'response';
  text: string;
  time: string;
}

export const UssdTab: React.FC<UssdTabProps> = ({ currentOperatorId }) => {
  const [ussdInput, setUssdInput] = useState('*133#');
  const [replyInput, setReplyInput] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTurns, setSessionTurns] = useState<UssdTurn[]>([]);

  const operator =
    MALAYSIAN_OPERATORS.find((op) => op.id === currentOperatorId) || MALAYSIAN_OPERATORS[0];

  const handleDial = (codeToDial?: string) => {
    const code = codeToDial || ussdInput;
    if (!code.trim()) return;

    setIsLoading(true);
    setSessionActive(true);

    const now = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
    setSessionTurns([{ type: 'request', text: `Dail: ${code}`, time: now }]);

    setTimeout(() => {
      let responseText = '';
      if (code === '*133#') {
        responseText =
          'Baki Kredit: RM 35.50 sah sehingga 18/12/2026.\n1. Pas Bulanan Fokus 50GB\n2. Semak Baki Kuota & Tempoh Sah\n3. Beli Pas Panggilan & SMS\n4. Bantuan Lanjut\n0. Menu Utama';
      } else if (code === '*134#') {
        responseText =
          'Status Kuota Aktif Tune Talk:\n- Kuota Utama: 48.2 GB tamat 08/12/2026\n- Kuota Hotspot: 5.0 GB\n- Panggilan: Tanpa Had ke semua rangkaian\nTerima kasih.';
      } else if (code === '*118#') {
        responseText =
          'Menu CelcomDigi / U Mobile:\nBaki Kredit: RM 24.00 sah sehingga 25/12/2026.\n1. Pas Internet 5G/4G 60GB\n2. Semakan Baki Kuota\n3. Servis Tambah Nilai';
      } else if (code === '*128#') {
        responseText =
          'Menu Digi CelcomDigi:\nBaki: RM 18.50.\n1. Internet 40GB RM35\n2. Semak Kuota Internet\n3. Perkongsian Kredit';
      } else if (code === '*100#' || code === '*868#') {
        responseText =
          'Menu Utama Hotlink / Maxis:\nBaki Kredit: RM 30.00 aktif sehingga 30/12/2026.\n1. Pas Pantas Bulanan 50GB\n2. Semak Status Kuota\n3. Pas Hotspot Tambahan';
      } else if (code === '*200#') {
        responseText =
          'Unifi Mobile:\nBaki Kredit: RM 15.00.\n1. Pas Data Bebas Bulanan\n2. Semak Kuota Aktif\n3. Bantuan Servis';
      } else {
        responseText = `Permintaan UMB [${code}] telah dihantar ke rangkaian selular.\n1. Teruskan Pilihan\n2. Semak Status\n3. Batal / Tutup`;
      }

      setSessionTurns((prev) => [
        ...prev,
        {
          type: 'response',
          text: responseText,
          time: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
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

    const now = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
    setSessionTurns((prev) => [...prev, { type: 'request', text: `Balasan: ${reply}`, time: now }]);

    setTimeout(() => {
      let responseText = '';
      if (reply === '1') {
        responseText =
          'Anda memilih Pas Internet 50GB / 30 Hari RM 35.00.\nBalas:\n1. Sahkan Pembelian melalui Kredit\n2. Batalkan';
      } else if (reply === '2') {
        responseText =
          'Status Kuota Semasa:\n- Kuota Utama: 48.2 GB sah sehingga 08/12/2026 23:59.\n- Hotspot: 5.0 GB.\nTerima kasih.';
      } else {
        responseText = `Pilihan [${reply}] telah diterima. Permintaan anda sedang diproses oleh pihak pengendali rangkaian.`;
      }

      setSessionTurns((prev) => [
        ...prev,
        {
          type: 'response',
          text: responseText,
          time: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
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
      {/* Pengenalan Tab */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PhoneCall className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Panggilan Kod USSD / UMB Interaktif
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Hantar kod arahan pantas (*133#, *118#, *100#) untuk menyemak baki kredit, kuota data, atau melanggan pelan internet terus melalui kad SIM modem H809Pro.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Pengendali:</span>
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-950 border border-slate-800"
              style={{ color: operator.color }}
            >
              {operator.name}
            </span>
          </div>
        </div>
      </div>

      {/* Sesi Terminal Interaktif & Pintasan Telco */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Terminal Interaktif USSD */}
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
                <span>Tamatkan Sesi</span>
              </button>
            )}
          </div>

          {/* Kotak Paparan Sesi */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 min-h-[300px] max-h-[440px] overflow-y-auto space-y-3 font-mono text-xs mb-4">
            {sessionTurns.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-16">
                <PhoneCall className="w-8 h-8 text-slate-700 mb-2" />
                <p>Tiada sesi USSD yang aktif buat masa ini.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Masukkan kod seperti *133# atau klik butang pintasan di panel sebelah kanan.
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
                <span>Menghubungi rangkaian selular ({operator.name})...</span>
              </div>
            )}
          </div>

          {/* Kawalan Input */}
          {!sessionActive ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: *133# atau *118#"
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
                <span>Dail UMB</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleReply} className="flex gap-2">
              <input
                type="text"
                placeholder="Taip pilihan nombor (1, 2, dsb)..."
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

        {/* Pintasan Pantas Pengendali */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Pintasan UMB {operator.name}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Klik mana-mana kod di bawah untuk membuat panggilan terus tanpa perlu menaip secara manual:
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
                  Dail
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Nota: Pastikan status isyarat selular modem berada dalam keadaan bersambung (4G atau 3G) sebelum memulakan panggilan kod USSD.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
