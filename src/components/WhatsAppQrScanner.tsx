import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  FolderDown,
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Camera,
  Play,
  Clock,
  Send,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { AttendanceRecord, SystemConfig } from '../types/attendance';

interface WhatsAppQrScannerProps {
  config: SystemConfig;
  onAddAttendanceRecord: (record: AttendanceRecord) => void;
  onViewSheetsTab: () => void;
  onViewSimulatorTab: () => void;
}

interface FetchedGroupMedia {
  id: string;
  senderName: string;
  senderPhone: string;
  groupId: string;
  groupName: string;
  timestamp: string;
  fileName: string;
  fileSize: string;
  caption: string;
  imageUrl: string;
  status: 'PENDING' | 'DOWNLOADED' | 'PROCESSED';
}

export const WhatsAppQrScanner: React.FC<WhatsAppQrScannerProps> = ({
  config,
  onAddAttendanceRecord,
  onViewSheetsTab,
  onViewSimulatorTab,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [qrCounter, setQrCounter] = useState<number>(30);
  const [qrToken, setQrToken] = useState<string>(
    '2@s8eTj9W+bYx41=...wh_session_' + Math.random().toString(36).substring(7)
  );

  // Device Info
  const [deviceInfo, setDeviceInfo] = useState({
    phoneNumber: '+62 812-9101-0110',
    accountName: 'Bot Presensi HRD Official',
    platform: 'WhatsApp Multi-Device / Chrome Linux',
    battery: 88,
    connectedAt: '',
  });

  // Group Media State
  const [isFetchingMedia, setIsFetchingMedia] = useState<boolean>(false);
  const [selectedGroupToFetch, setSelectedGroupToFetch] = useState<string>(config.groupIds[0].id);
  const [fetchedMediaList, setFetchedMediaList] = useState<FetchedGroupMedia[]>([
    {
      id: 'media_wa_101',
      senderName: 'Budi Santoso',
      senderPhone: '628129101011',
      groupId: '120363028391823901@g.us',
      groupName: 'Grup Absensi Bogor',
      timestamp: '07:54:12',
      fileName: 'IMG_20261003_075412.jpg',
      fileSize: '342 KB',
      caption: 'Absen pagi tepat waktu toko Erafone Pajajaran',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80',
      status: 'PROCESSED',
    },
    {
      id: 'media_wa_102',
      senderName: 'Siti Rahma',
      senderPhone: '628129101012',
      groupId: '120363028391823902@g.us',
      groupName: 'Grup Absensi Sukabumi',
      timestamp: '08:07:44',
      fileName: 'IMG_20261003_080744.jpg',
      fileSize: '418 KB',
      caption: 'Absen masuk Sukabumi, maaf telat macet kereta',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&fit=crop&q=80',
      status: 'PROCESSED',
    },
  ]);

  // QR countdown effect
  useEffect(() => {
    if (isConnected) return;
    const timer = setInterval(() => {
      setQrCounter((prev) => {
        if (prev <= 1) {
          // Regenerate QR
          setQrToken('2@' + Math.random().toString(36).substring(2) + '==' + Date.now());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected]);

  // Handle Simulate Connect (Scan Barcode)
  const handleSimulateScan = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setDeviceInfo((prev) => ({
        ...prev,
        connectedAt: new Date().toLocaleTimeString('id-ID', { timeZone: config.timezone }),
      }));
    }, 1500);
  };

  // Handle Disconnect
  const handleDisconnect = () => {
    setIsConnected(false);
    setQrCounter(30);
    setQrToken('2@' + Math.random().toString(36).substring(2) + '==' + Date.now());
  };

  // Handle Fetch Media from selected Group
  const handleFetchMediaFromGroup = async () => {
    setIsFetchingMedia(true);

    const groupObj = config.groupIds.find((g) => g.id === selectedGroupToFetch) || config.groupIds[0];
    const newMediaId = `media_wa_${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour12: false,
      timeZone: config.timezone,
    });
    const nowDate = new Date().toISOString().split('T')[0];

    // Pick a demo worker for the fetch simulation
    const mockWorkers = [
      {
        nama: 'Ahmad Dani',
        nik: '123458',
        jabatan: 'Field Coordinator',
        cabang: 'Cianjur',
        caption: 'Absensi briefing lapangan outlet Cianjur',
        img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=80',
      },
      {
        nama: 'Dewi Lestari',
        nik: '123459',
        jabatan: 'Promotor Handphone',
        cabang: 'Jasinga',
        caption: 'Absen masuk toko seluler Jasinga',
        img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop&q=80',
      },
      {
        nama: 'Rian Pratama',
        nik: '123460',
        jabatan: 'Sales Promotor',
        cabang: 'Bogor',
        caption: 'Absensi masuk toko Erafone shift 2',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80',
      },
    ];

    const worker = mockWorkers[Math.floor(Math.random() * mockWorkers.length)];

    await new Promise((r) => setTimeout(r, 1200));

    const newMedia: FetchedGroupMedia = {
      id: newMediaId,
      senderName: worker.nama,
      senderPhone: '628129' + Math.floor(100000 + Math.random() * 900000),
      groupId: groupObj.id,
      groupName: groupObj.name,
      timestamp: nowTime,
      fileName: `IMG_${nowDate.replace(/-/g, '')}_${nowTime.replace(/:/g, '')}.jpg`,
      fileSize: `${Math.floor(250 + Math.random() * 300)} KB`,
      caption: worker.caption,
      imageUrl: worker.img,
      status: 'PROCESSED',
    };

    setFetchedMediaList((prev) => [newMedia, ...prev]);

    // Branch GPS Mapping for Auto Tagging
    const branchCoords: Record<string, { lat: number; lng: number; address: string }> = {
      Bogor: { lat: -6.59714, lng: 106.80603, address: 'Jl. Pajajaran No. 28, Bogor Timur' },
      Sukabumi: { lat: -6.92772, lng: 106.92985, address: 'Guardian Mall Sukabumi Lt. 1' },
      Cianjur: { lat: -6.82221, lng: 107.13941, address: 'Jl. Raya Bandung No. 12, Cianjur' },
      Jasinga: { lat: -6.48391, lng: 106.45892, address: 'Jl. Raya Jasinga No. 45, Bogor Barat' },
    };
    const cInfo = branchCoords[worker.cabang] || branchCoords['Bogor'];
    const autoTaggedLocation = `Store ${worker.cabang} (${cInfo.lat.toFixed(5)}, ${cInfo.lng.toFixed(5)}) - ${cInfo.address} [Geofence GPS: 24m - VALID]`;

    // Automatically push to Google Sheets & Firestore through the pipeline
    const newRecord: AttendanceRecord = {
      id: `ABS-${nowDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: `${nowDate} ${nowTime}`,
      groupId: groupObj.id,
      groupName: groupObj.name,
      nama: worker.nama,
      nik: worker.nik,
      jabatan: worker.jabatan,
      cabang: worker.cabang,
      tanggal: nowDate,
      jam: nowTime,
      status: 'MASUK',
      lokasi: autoTaggedLocation,
      keterangan: `${worker.caption} [Auto Tag GPS: ${cInfo.lat}, ${cInfo.lng}]`,
      confidence: 0.96,
      messageId: `wamid.WAHA_${Date.now()}`,
      urlFoto: worker.img,
      statusValidasi: 'VALID',
      waktuUpdate: `${nowDate} ${nowTime}`,
      lateMinutes: 0,
      statusKetepatan: 'TEPAT WAKTU',
    };

    onAddAttendanceRecord(newRecord);
    setIsFetchingMedia(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <QrCode className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold">
                Scan Barcode WhatsApp (Tautkan Perangkat &amp; Ambil File Grup)
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Tautkan akun WhatsApp bot/admin dengan memindai barcode QR di bawah ini. Setelah
              terhubung, sistem dapat memantau grup WhatsApp dan otomatis mengunduh file foto absensi
              untuk diproses oleh AI Vision dan disimpan ke Google Sheets.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span>{isConnected ? 'PERANGKAT TERTAUT (ONLINE)' : 'MENUNGGU SCAN BARCODE'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Container: QR Pairing OR Connected Manager */}
      {!isConnected ? (
        /* STEP 1: SCAN BARCODE VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Instructions (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Langkah Menautkan WhatsApp
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  Pindai Barcode QR Ini Menggunakan WhatsApp di Ponsel Anda
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Koneksi resmi berbasis WhatsApp Multi-Device (WAHA / Gateway API). Bebas scraping
                  dan aman untuk nomor bisnis Anda.
                </p>
              </div>

              {/* Steps list */}
              <ol className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Buka WhatsApp di ponsel Anda</strong>
                    <span className="text-slate-500 text-[11px]">
                      Gunakan nomor WhatsApp yang berada di dalam grup absensi karyawan.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Buka menu Perangkat Tertaut</strong>
                    <span className="text-slate-500 text-[11px]">
                      Di Android: Ketuk <strong>titik tiga (⋮)</strong> di pojok kanan atas &gt; pilih{' '}
                      <strong>Perangkat Tertaut (Linked Devices)</strong>.<br />
                      Di iPhone: Buka tab <strong>Pengaturan (Settings)</strong> &gt; pilih{' '}
                      <strong>Perangkat Tertaut</strong>.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 block">
                      Ketuk "Tautkan Perangkat" dan Arahkan Kamera
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Arahkan kamera ponsel Anda ke kotak barcode di samping kanan ini hingga terbaca.
                    </span>
                  </div>
                </li>
              </ol>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSimulateScan}
                  disabled={isConnecting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors shadow-md shadow-emerald-600/25"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sedang Mengotentikasi Sesi...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Simulasikan Scan Barcode (Tautkan Sekarang)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setQrCounter(30);
                    setQrToken('2@' + Math.random().toString(36).substring(2) + '==' + Date.now());
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Muat Ulang Barcode</span>
                </button>
              </div>
            </div>

            {/* Right: Dynamic Barcode QR Box (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/50 shadow-xl relative max-w-[280px] w-full text-center">
                {/* QR Code Matrix Mockup (Real SVG Matrix) */}
                <div className="relative bg-white p-3 rounded-xl border border-slate-200 aspect-square flex items-center justify-center overflow-hidden">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-slate-900"
                    fill="currentColor"
                  >
                    {/* Corner 1 */}
                    <rect x="5" y="5" width="26" height="26" rx="4" fill="#0F172A" />
                    <rect x="9" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
                    <rect x="13" y="13" width="10" height="10" fill="#0F172A" />

                    {/* Corner 2 */}
                    <rect x="69" y="5" width="26" height="26" rx="4" fill="#0F172A" />
                    <rect x="73" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
                    <rect x="77" y="13" width="10" height="10" fill="#0F172A" />

                    {/* Corner 3 */}
                    <rect x="5" y="69" width="26" height="26" rx="4" fill="#0F172A" />
                    <rect x="9" y="73" width="18" height="18" rx="2" fill="#FFFFFF" />
                    <rect x="13" y="77" width="10" height="10" fill="#0F172A" />

                    {/* Dynamic QR Dots */}
                    <rect x="36" y="8" width="6" height="6" fill="#0F172A" />
                    <rect x="48" y="8" width="6" height="6" fill="#0F172A" />
                    <rect x="42" y="16" width="6" height="6" fill="#0F172A" />
                    <rect x="54" y="16" width="6" height="6" fill="#0F172A" />
                    <rect x="36" y="24" width="6" height="6" fill="#0F172A" />
                    <rect x="48" y="24" width="6" height="6" fill="#0F172A" />

                    <rect x="8" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="16" y="42" width="6" height="6" fill="#0F172A" />
                    <rect x="24" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="8" y="48" width="6" height="6" fill="#0F172A" />
                    <rect x="20" y="52" width="6" height="6" fill="#0F172A" />

                    {/* Center WhatsApp Logo Icon */}
                    <circle cx="50" cy="50" r="14" fill="#10B981" />
                    <path
                      d="M45 45 Q50 43 55 45 Q57 50 55 55 Q50 57 45 55 Z"
                      fill="#FFFFFF"
                    />

                    {/* Bottom Right Matrix */}
                    <rect x="68" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="80" y="40" width="6" height="6" fill="#0F172A" />
                    <rect x="74" y="48" width="6" height="6" fill="#0F172A" />
                    <rect x="86" y="52" width="6" height="6" fill="#0F172A" />
                    <rect x="36" y="68" width="6" height="6" fill="#0F172A" />
                    <rect x="44" y="74" width="6" height="6" fill="#0F172A" />
                    <rect x="52" y="68" width="6" height="6" fill="#0F172A" />
                    <rect x="36" y="80" width="6" height="6" fill="#0F172A" />
                    <rect x="48" y="84" width="6" height="6" fill="#0F172A" />

                    <rect x="68" y="68" width="8" height="8" fill="#0F172A" />
                    <rect x="80" y="74" width="8" height="8" fill="#0F172A" />
                    <rect x="72" y="84" width="8" height="8" fill="#0F172A" />
                    <rect x="84" y="84" width="8" height="8" fill="#0F172A" />
                  </svg>

                  {/* Scanning Laser Animation */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-lg shadow-emerald-500/50 animate-bounce top-1/3" />
                </div>

                {/* QR Timer Indicator */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Sesi Refresh:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {qrCounter} detik
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: CONNECTED DASHBOARD & GROUP FILE FETCHER */
        <div className="space-y-6">
          {/* Connected Device Info Bar */}
          <div className="bg-white border border-emerald-300 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/50 to-white">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{deviceInfo.accountName}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ONLINE
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono font-semibold text-slate-700">
                    {deviceInfo.phoneNumber}
                  </span>
                  <span>•</span>
                  <span>{deviceInfo.platform}</span>
                  <span>•</span>
                  <span>Baterai: {deviceInfo.battery}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Putuskan Sesi WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Group File Fetcher & Monitoring Control */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderDown className="w-4 h-4 text-emerald-600" />
                  <span>Ambil File Foto Absensi dari Grup WhatsApp</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih grup yang ingin dipantau untuk menarik file foto secara otomatis atau manual.
                </p>
              </div>

              {/* Group Selector & Fetch Button */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedGroupToFetch}
                  onChange={(e) => setSelectedGroupToFetch(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  {config.groupIds.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleFetchMediaFromGroup}
                  disabled={isFetchingMedia}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs shadow-emerald-600/25 disabled:opacity-50"
                >
                  {isFetchingMedia ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunduh File dari Grup...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Ambil File Foto Terbaru</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List of Whitelisted Groups Active */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Grup WhatsApp Terhubung Dalam Pantauan:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {config.groupIds.map((group) => {
                  const isSelected = selectedGroupToFetch === group.id;
                  return (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroupToFetch(group.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 truncate">{group.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                          Aktif
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 truncate">
                        ID: {group.id.substring(0, 18)}...
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Auto-download Media</span>
                        <span className="text-emerald-700 font-bold">ON</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feed of Fetched Media Files */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Log File Foto yang Diambil dari Grup WhatsApp ({fetchedMediaList.length})</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Semua file otomatis diteruskan ke AI Vision OCR dan Google Sheets
                </span>
              </div>

              <div className="space-y-2">
                {fetchedMediaList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                        <img
                          src={item.imageUrl}
                          alt="Foto Absen"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{item.senderName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ({item.senderPhone})
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 italic mt-0.5">
                          "{item.caption}"
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span>{item.groupName}</span>
                          <span>•</span>
                          <span>Jam: {item.timestamp}</span>
                          <span>•</span>
                          <span>File: {item.fileName} ({item.fileSize})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={onViewSheetsTab}
                        className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                      >
                        Lihat di Sheets →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
