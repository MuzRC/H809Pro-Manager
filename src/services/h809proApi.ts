import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { ModemStatus, SMSMessage, NetworkMode } from '../types/modem';
import { MALAYSIAN_OPERATORS } from '../data/constants';

// --- FUNGSI MD5 RINGAN (KENDIRI - TANPA PERLU PASANG CRYPTO LUAR) ---
function md5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(str: string) {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWordsTemp1 = lMessageLength + 8;
    const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue: number) {
    let WordToHexValue = '', WordToHexValueTemp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValueTemp = '0' + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
    }
    return WordToHexValue;
  }

  const x = convertToWordArray(string);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

class H809ProApiService {
  private gatewayIp: string = '192.168.1.1';
  private username: string = 'admin';
  private password: string = 'admin';
  private realm: string = 'Highwmg';
  private nonce: string = '718337c309eacc5dc1d2558936225417';
  private qop: string = 'auth';
  private gnCount: number = 1;

  public setGatewayIp(ip: string) {
    this.gatewayIp = ip;
  }

  public getGatewayIp(): string {
    return this.gatewayIp;
  }

  public setCredentials(user: string, pass: string) {
    this.username = user;
    this.password = pass;
  }

  // --- 1. PENJANAAN PENGESAHAN DIGEST AUTH (SESUAI CIP PXA1802) ---
  private generateAuthHeader(method: 'GET' | 'POST'): string {
    const HA1 = md5(`${this.username}:${this.realm}:${this.password}`);
    const HA2 = md5(`${method}:/cgi/xml_action.cgi`);

    const rand = Math.floor(Math.random() * 100001);
    const date = new Date().getTime();
    const cnonce = md5(`${rand}${date}`).substring(0, 16);

    const ncHex = this.gnCount.toString(16).toUpperCase();
    const authCount = ('00000000' + ncHex).slice(-8);

    const digestRes = md5(`${HA1}:${this.nonce}:${authCount}:${cnonce}:${this.qop}:${HA2}`);
    this.gnCount++;

    return `Digest username="${this.username}", realm="${this.realm}", nonce="${this.nonce}", uri="/cgi/xml_action.cgi", response="${digestRes}", qop=${this.qop}, nc=${authCount}, cnonce="${cnonce}"`;
  }

  // --- 2. PENGEKSTRAK / NYAHKOD UCS-2 HEX & MASA SMS ---
  public uniDecode(hexStr: string): string {
    if (!hexStr || hexStr.length % 4 !== 0) return hexStr;
    try {
      let str = '';
      for (let i = 0; i < hexStr.length; i += 4) {
        const code = parseInt(hexStr.substr(i, 4), 16);
        if (code !== 0) str += String.fromCharCode(code);
      }
      return str || hexStr;
    } catch {
      return hexStr;
    }
  }

  public uniEncode(str: string): string {
    if (!str) return '';
    let hex = '';
    for (let i = 0; i < str.length; i++) {
      let charCode = str.charCodeAt(i).toString(16);
      while (charCode.length < 4) {
        charCode = '0' + charCode;
      }
      hex += charCode;
    }
    return hex;
  }

  private getSmsTime(): string {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const h = now.getHours();
    const min = now.getMinutes();
    const s = now.getSeconds();
    const offset = 0 - now.getTimezoneOffset() / 60;
    const tzStr = offset > 0 ? `%2B${offset}` : `${offset}`;
    return `${yy},${m},${d},${h},${min},${s},${tzStr}`;
  }

  // --- 3. PEMANGGIL DASAR GET & POST MODUL DUSTER ---
  public async getModuleXml(file: string): Promise<string | null> {
    try {
      const response: HttpResponse = await CapacitorHttp.get({
        url: `http://${this.gatewayIp}/xml_action.cgi?method=get&module=duster&file=${file}`,
        headers: {
          Authorization: this.generateAuthHeader('GET'),
        },
        connectTimeout: 4000,
        readTimeout: 4000,
      });

      if (response.status === 200 && response.data) {
        return response.data.toString();
      }
      return null;
    } catch (err) {
      console.error(`Gagal GET modul ${file}:`, err);
      return null;
    }
  }

  public async postModuleXml(file: string, xmlPayload: string): Promise<boolean> {
    try {
      const response: HttpResponse = await CapacitorHttp.post({
        url: `http://${this.gatewayIp}/xml_action.cgi?method=set&module=duster&file=${file}`,
        headers: {
          'Content-Type': 'application/xml',
          Authorization: this.generateAuthHeader('POST'),
        },
        data: xmlPayload,
        connectTimeout: 5000,
        readTimeout: 5000,
      });

      return response.status === 200;
    } catch (err) {
      console.error(`Gagal POST modul ${file}:`, err);
      return false;
    }
  }

  // --- 4. UJI SAMBUNGAN GET LALUAN ---
  public async pingGateway(): Promise<boolean> {
    try {
      const res: HttpResponse = await CapacitorHttp.get({
        url: `http://${this.gatewayIp}/xml_action.cgi?method=get&module=duster&file=status1`,
        connectTimeout: 2500,
        readTimeout: 2500,
      });
      return res.status === 200;
    } catch {
      return false;
    }
  }

  // --- 5. TARIK TELEMETRI & STATUS (FILE=STATUS1) ---
  public async fetchLiveStatus(): Promise<Partial<ModemStatus>> {
    const rawXml = await this.getModuleXml('status1');
    if (!rawXml) return {};

    const getTag = (tag: string) => {
      const match = rawXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return match ? match[1].trim() : '';
    };

    const rawRssi = parseInt(getTag('rssi') || '37', 10);
    const csq = Math.min(31, Math.round((rawRssi / 100) * 31)) || 22;
    const estimatedRsrp = -113 + csq * 2;

    const opName = getTag('network_name') || getTag('roaming_network_name') || 'BeONE';
    const matchedOp =
      MALAYSIAN_OPERATORS.find((o) =>
        o.name.toLowerCase().includes(opName.toLowerCase())
      ) || {
        id: 'beone',
        name: opName,
        code: '50212',
        color: 'from-blue-600 to-indigo-700',
        supportedBands: [1, 3, 7, 8],
      };

    const rxBytesAll = parseInt(getTag('rx_byte_all') || '0', 10);
    const txBytesAll = parseInt(getTag('tx_byte_all') || '0', 10);
    const totalGb = parseFloat(((rxBytesAll + txBytesAll) / (1024 * 1024 * 1024)).toFixed(2));

    const rxRate = Math.round(parseInt(getTag('rx_rate') || '0', 10) / 1024);
    const txRate = Math.round(parseInt(getTag('tx_rate') || '0', 10) / 1024);

    const runMinutes = parseInt(getTag('run_minutes') || '0', 10);
    const runSeconds = parseInt(getTag('run_seconds') || '0', 10);
    const uptimeSec = runMinutes * 60 + runSeconds;

    const rawSsid = getTag('ssid');
    const wifiSsid = rawSsid ? this.uniDecode(rawSsid) : '4G-MIFI_F0C7';

    const batteryVolt = parseInt(getTag('Battery_voltage') || '99', 10);
    const isCharging = getTag('Battery_charging') === '1';

    return {
      isConnected: getTag('wan_conn_status') === 'connected',
      operator: matchedOp,
      simStatus: getTag('sim_status') === '0' ? 'READY' : 'NO_SIM',
      networkType: getTag('sys_mode') === '17' ? '4G LTE' : '3G WCDMA',
      imei: getTag('IMEI') || '352811045562786',
      macAddress: getTag('current_device_mac') || getTag('mac') || 'AC:B5:7D:44:87:3F',
      firmwareVersion: getTag('version_num') || 'H809Pro-EU-V5.3.6y',
      hardwareVersion: getTag('hardware_version') || 'H809Pro-EU',
      downloadSpeed: rxRate,
      uploadSpeed: txRate,
      totalDataMonth: totalGb,
      temperature: 39,
      batteryLevel: batteryVolt,
      batteryStatus: isCharging ? 'CHARGING' : 'BYPASS_DIRECT_POWER',
      uptimeSeconds: uptimeSec,
      wifiSsid,
      maxClients: parseInt(getTag('nr_connected_dev') || '1', 10),
      signal: {
        rsrp: estimatedRsrp,
        rsrq: -9,
        rssi: -65,
        sinr: 16,
        csq,
        cellId: getTag('ipv4') || '10.133.200.83',
        pci: 142,
        tac: '9201',
        band: 3,
        bandName: 'Jalur 3',
        frequency: '1800 MHz (FDD)',
      },
    };
  }

  // --- 6. PENGURUSAN SMS (FILE=MESSAGE DENGAN UNIENCODE/UNIDECODE) ---
  public async fetchSMSInbox(): Promise<SMSMessage[]> {
    // 1. Minta modul sediakan senarai SMS dari simpanan lokal
    const preparePayload =
      '<RGW><message><flag><message_flag>GET_RCV_SMS_LOCAL</message_flag></flag><get_message><page_number>1</page_number></get_message></message></RGW>';
    await this.postModuleXml('message', preparePayload);

    // 2. Tarik XML senarai mesej sebenar
    const smsXml = await this.getModuleXml('message');
    if (!smsXml) return [];

    const messages: SMSMessage[] = [];
    const itemRegex = /<Item>([\s\S]*?)<\/Item>/gi;
    let itemMatch: RegExpExecArray | null;

    while ((itemMatch = itemRegex.exec(smsXml)) !== null) {
      const block = itemMatch[1];
      const getVal = (t: string) => {
        const m = block.match(new RegExp(`<${t}>([\\s\\S]*?)<\\/${t}>`, 'i'));
        return m ? m[1].trim() : '';
      };

      const id = getVal('index') || `${Date.now()}`;
      const rawSubject = getVal('subject');
      const rawFrom = getVal('from');
      const recvTime = getVal('received');
      const status = getVal('status');

      const content = this.uniDecode(rawSubject);
      const sender = this.uniDecode(rawFrom).replace(/;/g, '');
      const otpMatch = content.match(/\b\d{4,6}\b/);

      messages.push({
        id,
        sender: sender || 'Telco',
        timestamp: recvTime.replace(/,/g, '/'),
        content,
        isRead: status === '1',
        isOtp: !!otpMatch,
        otpCode: otpMatch ? otpMatch[0] : undefined,
        folder: 'inbox',
      });
    }

    return messages;
  }

  public async sendSMS(recipient: string, text: string): Promise<boolean> {
    const encodedContent = this.uniEncode(text);
    const smsTime = this.getSmsTime();

    const payload = `<RGW><message><flag><message_flag>SEND_SMS</message_flag><sms_cmd>4</sms_cmd></flag><send_save_message><contacts>${recipient}</contacts><content>${encodedContent}</content><encode_type>UNICODE</encode_type><sms_time>${smsTime}</sms_time></send_save_message></message></RGW>`;

    return await this.postModuleXml('message', payload);
  }

  public async deleteSMS(smsId: string): Promise<boolean> {
    const payload = `<RGW><message><flag><message_flag>DELETE_SMS</message_flag><sms_cmd>6</sms_cmd></flag><get_message><tags>12</tags><mem_store>1</mem_store></get_message><set_message><delete_message_id>${smsId},</delete_message_id></set_message></message></RGW>`;

    return await this.postModuleXml('message', payload);
  }

  // --- 7. KUNCI JALUR LTE (FILE=CUSTOMCONFIG - FORMULA BITMASK 32-BIT) ---
  public async applyBandLock(bands: number[], _mode: NetworkMode = '4G_ONLY'): Promise<boolean> {
    let ltebandl = 0;
    let ltebandh = 0;

    // Jika senarai kosong, kembalikan ke AUTO (Semua Band)
    if (bands.length === 0) {
      ltebandl = 134742229;
      ltebandh = 416;
      const autoPayload = `<RGW><customconfig><ltebandl>${ltebandl}</ltebandl><ltebandh>${ltebandh}</ltebandh><ltebandext>0</ltebandext><band_current>0</band_current><act_current>0</act_current></customconfig></RGW>`;
      return await this.postModuleXml('customconfig', autoPayload);
    }

    // Kira bitmask untuk setiap band yang dipilih
    for (const b of bands) {
      if (b >= 1 && b <= 32) {
        ltebandl += Math.pow(2, b - 1);
      } else if (b >= 33 && b <= 64) {
        ltebandh += Math.pow(2, b - 33);
      }
    }

    const lockPayload = `<RGW><customconfig><ltebandl>${ltebandl}</ltebandl><ltebandh>${ltebandh}</ltebandh><ltebandext>0</ltebandext><band_current>1</band_current><act_current>0</act_current></customconfig></RGW>`;

    return await this.postModuleXml('customconfig', lockPayload);
  }

  // --- 8. BUT SEMULA PERKAKASAN & ARAHAN SISTEM ---
  public async rebootModem(): Promise<boolean> {
    try {
      const res: HttpResponse = await CapacitorHttp.get({
        url: `http://${this.gatewayIp}/xml_action.cgi?method=get&file=restore_defaults&command=reboot`,
        headers: {
          Authorization: this.generateAuthHeader('GET'),
        },
        connectTimeout: 3000,
      });
      return res.status === 200;
    } catch {
      return false;
    }
  }

  public async executeATCommand(command: string): Promise<string> {
    const cleanCmd = encodeURIComponent(command.trim());
    try {
      const response: HttpResponse = await CapacitorHttp.get({
        url: `http://${this.gatewayIp}/xml_action.cgi?method=set&module=duster&file=at_cmd&cmd=${cleanCmd}`,
        headers: {
          Authorization: this.generateAuthHeader('GET'),
        },
        connectTimeout: 4000,
        readTimeout: 4000,
      });

      if (response.status === 200 && response.data) {
        return response.data.toString().replace(/<[^>]+>/g, ' ').trim() || 'OK';
      }
      return `RALAT: HTTP ${response.status}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal berhubung';
      return `RALAT_RANGKAIAN: ${msg}`;
    }
  }
}

export const h809proApi = new H809ProApiService();
