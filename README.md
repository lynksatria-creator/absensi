# 📱 Sistem Absensi WhatsApp AI Vision & Google Sheets Hub

Sistem otomatisasi absensi berbasis **WhatsApp Group + n8n + Gemini AI Vision OCR + Google Sheets + Cloud Firestore + WAHA Gateway**. 

Solusi enterprise siap produksi untuk mencatat, mengekstrak, memvalidasi kehadiran karyawan/promotor dari foto grup WhatsApp secara real-time, lengkap dengan **Auto Tagging Lokasi GPS**, **Geofencing Toko**, dan **Master Database Karyawan**.

---

## ✨ Fitur Utama

1. **📱 Scan Barcode WhatsApp (Pairing Perangkat & Fetch File Grup)**:
   - Terintegrasi dengan engine WhatsApp Multi-Device (WAHA / Baileys).
   - Tautkan akun bot/admin cukup dengan memindai barcode QR langsung dari WhatsApp HP (*Settings > Linked Devices*).
   - Otomatis menarik file foto absensi yang dikirimkan karyawan ke dalam grup WhatsApp (*Bogor, Sukabumi, Cianjur, Jasinga*).

2. **📍 Auto Tagging Lokasi GPS & Geofencing Toko**:
   - Menangkap koordinat GPS real-time (*Latitude, Longitude, Akurasi ±meter*).
   - Validasi Geofencing: Menghitung jarak karyawan dari titik pusat toko (maksimal 100m dari toko resmi).
   - Watermark dinamis tercetak otomatis di atas foto absensi (Koordinat, Waktu WIB, Nama Cabang, dan Status Geofence).

3. **👥 Master Database Karyawan (Bisa Diubah Kapan Saja)**:
   - Manajemen data: **Nama Lengkap, NIP/NIK, No. WhatsApp/HP, Jabatan, Kantor Cabang, Status Aktif**.
   - **Download Template CSV**: Tersedia template kosong dan template terisi contoh 12 karyawan 4 cabang.
   - **Upload Template CSV (Batch Import)**: Unggah file CSV massal dengan validasi kolom dan tabel pratinjau sebelum disimpan.
   - **Pencocokan Otomatis Pengirim**: Saat karyawan mengirim foto ke grup, sistem langsung mencocokkan nomor WhatsApp untuk mengisi NIP, Jabatan, dan Cabang secara presisi.

4. **🧠 AI Vision OCR (Gemini 2.5 / 3.8 Flash)**:
   - Ekstraksi biner foto karyawan secara otomatis: Nama, Tanggal, Jam, Status Absen (*MASUK / PULANG / DINAS / IZIN / SAKIT / CUTI*), dan Nama Cabang.
   - Deteksi foto buram, gelap, atau screenshot palsu dengan skor confidence minimum (0.80).

5. **📊 Google Sheets Hub (7 Sheet Sinkron)**:
   - `DATA_ABSENSI`: Log transaksi absensi 20 kolom (A: ID s/d T: Waktu Update).
   - `REKAP_HARIAN`: Rekapitulasi per tanggal & karyawan (Jam Masuk, Jam Pulang, Keterlambatan, Status Kehadiran).
   - `REKAP_CABANG`: Agregasi statistik cabang harian (*Hadir, Izin, Sakit, Terlambat*).
   - `REKAP_KARYAWAN`: Akumulasi kehadiran bulanan & persentase performa.
   - `HRD_PAYROLL`: Format standar ekspor software payroll (Talenta, Gadjian, Mekari, SAP).
   - `CONFIG`: Whitelist Group ID WhatsApp, jam kerja masuk, dan batas toleransi.
   - `LOG_PROSES`: Audit trail lengkap traceability setiap pesan yang masuk.

6. **💬 Balasan Bot WhatsApp Otomatis**:
   - Mengirim notifikasi konfirmasi langsung ke grup WhatsApp:
     - ✅ Absensi berhasil (Nama, Tanggal, Jam, Status, Cabang, Tag Lokasi GPS, Status Ketepatan).
     - ⚠️ Peringatan foto blur / data tidak terbaca.
     - ℹ️ Deteksi anti-duplikasi pengiriman berulang.

7. **🔄 Template n8n Workflow JSON 16-Node**:
   - 1-Klik Copy & Download Workflow JSON siap import ke instance n8n (Cloud atau Self-hosted VPS).

---

## 🏗️ Arsitektur Sistem

```
[ WhatsApp Group ] 
       │ (Karyawan kirim foto absensi)
       ▼
[ WAHA / WhatsApp Gateway ] 
       │ (Webhook POST biner & payload)
       ▼
[ n8n Workflow Engine ] ───► [ Master Database Karyawan ] (Match No HP)
       │
       ├──► [ Gemini AI Vision OCR ] (Ekstraksi Nama, NIP, Jam, Cabang)
       │
       ├──► [ Auto-Tag GPS & Geofence ] (Validasi Radius Store <= 100m)
       │
       ├──► [ Google Sheets API ] (Insert DATA_ABSENSI & Update Rekap)
       │
       ├──► [ Cloud Firestore ] (Sinkronisasi Realtime Cloud Data)
       │
       └──► [ WhatsApp API ] (Balasan konfirmasi ke grup WhatsApp)
```

---

## 🚀 Panduan Menjalankan Aplikasi (Local / Dev)

### 1. Prasyarat
- Node.js v18+ atau v20+
- npm atau bun
- Akun Google AI Studio (API Key Gemini)
- Project Firebase Firestore (opsional untuk penyimpanan cloud)

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel:
```env
GEMINI_API_KEY=AIzaSy...
PORT=3000
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Aplikasi berjalan pada: `http://localhost:3000`

### 5. Build untuk Produksi
```bash
npm run build
```

---

## 📦 Panduan Deployment ke Production (GitHub & Cloud)

### 1. Inisialisasi Repository Git Lokal & Commit
```bash
git init
git add .
git commit -m "feat: initial production release WhatsApp Absensi AI Vision & Database Karyawan"
```

### 2. Hubungkan ke Remote Repository GitHub
Buat repository baru di [GitHub](https://github.com/new), lalu jalankan perintah berikut:
```bash
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

### 3. Opsi Deployment Hosting Production:
- **Google Cloud Run / Railway / Coolify**:
  Gunakan Dockerfile atau `npm run build` dan `npm start`.
- **Vercel / Netlify**:
  Tautkan repository GitHub Anda ke Vercel/Netlify dengan build command: `npm run build` dan output directory: `dist`.

---

## 📄 Format Template CSV Database Karyawan

Gunakan format standar berikut untuk mengimpor data karyawan secara massal:
```csv
NIP,Nama,No_HP,Jabatan,Kantor_Cabang,Status_Aktif,Email
123456,Budi Santoso,628129101011,Sales Promotor,Bogor,Aktif,budi.santoso@perusahaan.com
123457,Siti Rahma,628129101012,Promotor Handphone,Sukabumi,Aktif,siti.rahma@perusahaan.com
123458,Ahmad Dani,628129101013,Field Coordinator,Cianjur,Aktif,ahmad.dani@perusahaan.com
123459,Dewi Lestari,628129101014,Promotor Handphone,Jasinga,Aktif,dewi.lestari@perusahaan.com
```

---

## 🔒 Lisensi & Keamanan
Aplikasi ini menerapkan standar keamanan **Zero-Trust**:
- Aturan keamanan Firestore disetel ke strict validation pada `firestore.rules`.
- Tidak ada rahasia API key yang diekspos di sisi klien.
- Enkripsi end-to-end pesan WhatsApp dan verifikasi whitelist Group ID.
