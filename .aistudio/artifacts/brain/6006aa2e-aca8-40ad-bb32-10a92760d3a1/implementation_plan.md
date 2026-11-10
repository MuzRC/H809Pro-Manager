# Pelan Integrasi Protokol CGI-BIN & Pembaikan Sambungan Modem H809Pro

Pelan komprehensif untuk membolehkan komunikasi lancar antara aplikasi dengan modem H809Pro melalui endpoint `/cgi-bin/qcmap_web_cgi` dan `/cgi-bin/enode.cgi`, mengatasi ralat "Tiada sambungan ke modem" akibat sekatan pelayar web (Mixed Content / Private Network Access), serta menambah alat diagnostik terus ke skrip CGI modem.

## Keputusan & Pengesahan Pengguna (User Review & Confirmed Decisions)

> [!IMPORTANT]
> Berdasarkan maklum balas terkini daripada pengguna:
> - **Ralat Utama**: Aplikasi memaparkan amaran *"Tiada sambungan ke modem H809Pro"* walaupun telefon telah bersambung ke Wi-Fi modem. Punca utama adalah ujian ping terdahulu yang menyasarkan `/favicon.ico` (yang tiada pada modem) serta sekatan keselamatan pelayar web (Mixed Content HTTPS ke HTTP peribadi `192.168.1.1`).
> - **Endpoint CGI Modem**: Modem H809Pro menggunakan skrip `/cgi-bin/qcmap_web_cgi` dan `/cgi-bin/enode.cgi` (bukannya `/xml_action.cgi`).
> - **Penyelesaian**:
>   1. Gantikan semua panggilan API lama ke endpoint rasmi `/cgi-bin/qcmap_web_cgi` dan `/cgi-bin/enode.cgi`.
>   2. Naik taraf logik pengesanan (`pingGateway`) agar menyemak endpoint cgi-bin sebenar (`/cgi-bin/qcmap_web_cgi`, `/cgi-bin/enode.cgi`, dan `/`) menggunakan kaedah *no-cors* serta `CapacitorHttp`.
>   3. Sediakan butang **"Sahkan Sambungan Wi-Fi (Paksa Aktif)"** pada kad amaran supaya pengguna yang telah bersambung ke Wi-Fi modem tidak disekat daripada mengakses ciri-ciri aplikasi sekiranya pelayar web menyekat permintaan latar belakang.
>   4. Tambah panel **Diagnostik & Penguji CGI-BIN** dalam modal get laluan dan tab Terminal bagi membolehkan pengguna menguji arahan CGI terus serta melihat respons mentah daripada modem.

---

## 1. Gambaran Keseluruhan & Konsep Teras

- **Tujuan**: Memastikan aplikasi dapat menghantar arahan dan membaca status modem H809Pro menggunakan protokol CGI sebenar (`/cgi-bin/qcmap_web_cgi` dan `/cgi-bin/enode.cgi`).
- **Penyelesaian Isu Sambungan**:
  - Pelayar moden yang memuatkan aplikasi melalui HTTPS menyekat capaian ke IP peribadi `http://192.168.1.1` (Mixed Content / PNA). Dengan membenarkan mod **"Sahkan Sambungan Wi-Fi"**, pengguna dapat membuka sepenuhnya antaramuka dan menghantar permintaan melalui mekanisme CGI yang fleksibel tanpa dihalang amaran offline.
  - Skrip CGI modem H809Pro memproses arahan rangkaian seperti pendaftaran band, status isyarat CSQ/RSRP, SMS, dan but semula melalui parameter URL atau payload POST `cgi-bin`.

---

## 2. Pengalaman Pengguna & Reka Bentuk Visual (UX)

### A. Kad Amaran Sambungan Baharu
- Apabila pengesanan latar belakang menghadapi sekatan pelayar:
  - Paparkan status: *"Mengesan Modem di http://192.168.1.1 (CGI-BIN)"*.
  - Sediakan dua butang tindakan pantas:
    1. **"Cuba Semula Sambungan"**: Menjalankan ujian pantas terhadap `/cgi-bin/qcmap_web_cgi` dan `/cgi-bin/enode.cgi`.
    2. **"Saya Sudah Bersambung ke Wi-Fi Modem (Buka Penuh)"**: Membolehkan pengguna mengesahkan bahawa mereka telah menyambungkan telefon ke hotspot H809Pro, sekali gus membuka papan pemuka serta-merta tanpa sekatan.

### B. Pemilih & Penguji Endpoint CGI-BIN dalam Tetapan
- Dalam modal get laluan (`GatewayModal.tsx`), tambah bahagian:
  - **Pilihan Endpoint CGI**:
    - `/cgi-bin/qcmap_web_cgi` (Lalai - Pengurusan Rangkaian & Sambungan)
    - `/cgi-bin/enode.cgi` (Status Isyarat LTE, Jalur & Menara Pemancar)
    - Input laluan tersuai jika modem menggunakan variasi lain.
  - **Ujian Langsung Endpoint**: Butang "Uji Endpoint CGI" yang memaparkan kod status respons HTTP dan masa tindak balas.

### C. Sokongan Arahan CGI dalam Terminal Tab
- Tambah tab kecil atau mod suis dalam `TerminalTab.tsx`:
  - **Mod Arahan AT**: `AT+CSQ`, `ATI`, `AT^SETBAND`
  - **Mod CGI Langsung**: Menghantar parameter terus ke `/cgi-bin/qcmap_web_cgi?cmd=...` atau `/cgi-bin/enode.cgi`.

---

## 3. Seni Bina Teknikal & Aliran Data

```
┌─────────────────────────────────────────────────────────────────┐
│                      H809Pro Manager Web/PWA                    │
│                      (192.168.1.1 Gateway)                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│   qcmap_web_cgi Endpoint     │  │      enode.cgi Endpoint      │
│  /cgi-bin/qcmap_web_cgi      │  │      /cgi-bin/enode.cgi      │
├──────────────────────────────┤  ├──────────────────────────────┤
│ • Status Sambungan WAN       │  │ • Bacaan RSRP / SINR / CSQ   │
│ • But Semula Perkakasan      │  │ • Kunci Jalur LTE (Band Lock)│
│ • Tetapan Wi-Fi & Hotspot    │  │ • Maklumat Cell ID & Menara  │
│ • Pengurusan APN & Profil    │  │ • Penyata SIM & Pendaftaran  │
└──────────────────────────────┘  └──────────────────────────────┘
```

---

## 4. Pelan Pelaksanaan Terperinci - SELESAI

1. [x] **Kemas Kini Perkhidmatan API (`src/services/h809proApi.ts`)**:
   - Panggilan lalai digantikan dengan `/cgi-bin/qcmap_web_cgi` dan `/cgi-bin/enode.cgi`.
   - Kaedah `pingGateway()` kini menguji kedua-dua endpoint CGI serta fallback ke root `/`.
   - Kaedah `testCgiEndpoint()`, `sendCgiRequest()`, dan `executeATCommand()` kini menggunakan format parameter CGI cipset modem H809Pro.

2. [x] **Kemas Kini `src/App.tsx`**:
   - Keadaan `hasUserConfirmedWifi` ditambah dan disimpan dalam `localStorage`.
   - Butang **"Saya Sudah Bersambung (Buka Penuh)"** disediakan pada kad amaran untuk memintas sekatan Mixed Content pelayar web.
   - Papan pemuka dibuka sepenuhnya tanpa menghalang pengguna daripada menghantar arahan dan membaca telemetri.

3. [x] **Kemas Kini `src/components/GatewayModal.tsx`**:
   - Konfigurasi endpoint CGI `/cgi-bin/qcmap_web_cgi` dan `/cgi-bin/enode.cgi` disediakan bersama butang ujian CGI-BIN kependaman masa nyata.
   - Suis pengesahan Wi-Fi peranti disertakan.

4. [x] **Kemas Kini `src/components/TerminalTab.tsx` & `src/data/constants.ts`**:
   - Templat arahan CGI pantas (`COMMON_CGI_COMMANDS`) ditambah dan disepadukan dalam terminal.

5. [x] **Pengesahan & Ujian Kompilasi**:
   - `compile_applet` dan `lint_applet` telah dijalankan serentak dengan status berjaya (0 ralat). Dev server dimulakan semula.
