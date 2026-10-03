import React, { useState } from 'react';
import {
  Sheet,
  Search,
  Filter,
  Download,
  Calendar,
  Building,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  X,
  Code2,
  Copy,
  Check,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Briefcase,
} from 'lucide-react';
import {
  AttendanceRecord,
  DailyRecapItem,
  BranchRecapItem,
  EmployeeRecapItem,
  SystemConfig,
  ProcessLogItem,
} from '../types/attendance';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/n8nWorkflowTemplate';
import { CsvExportModal } from './CsvExportModal';

interface GoogleSheetsViewerProps {
  config: SystemConfig;
  attendanceData: AttendanceRecord[];
  dailyRecap: DailyRecapItem[];
  branchRecap: BranchRecapItem[];
  employeeRecap: EmployeeRecapItem[];
  logData: ProcessLogItem[];
  onOpenAppsScript: () => void;
}

type TabKey =
  | 'DASHBOARD'
  | 'DATA_ABSENSI'
  | 'REKAP_HARIAN'
  | 'REKAP_CABANG'
  | 'REKAP_KARYAWAN'
  | 'CONFIG'
  | 'LOG_PROSES';

export const GoogleSheetsViewer: React.FC<GoogleSheetsViewerProps> = ({
  config,
  attendanceData,
  dailyRecap,
  branchRecap,
  employeeRecap,
  logData,
  onOpenAppsScript,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCabang, setFilterCabang] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filtered attendance data
  const filteredAttendance = attendanceData.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nik.includes(searchQuery) ||
      item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCabang = filterCabang === 'ALL' || item.cabang === filterCabang;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;

    return matchesSearch && matchesCabang && matchesStatus;
  });

  // KPI Calculations
  const totalKaryawan = 38;
  const hadirCount = dailyRecap.filter(
    (r) => r.status === 'HADIR' || r.status === 'BELUM PULANG'
  ).length;
  const terlambatCount = attendanceData.filter(
    (a) => a.status === 'MASUK' && (a.lateMinutes || 0) > 0
  ).length;
  const izinSakitCount = attendanceData.filter(
    (a) => a.status === 'IZIN' || a.status === 'SAKIT'
  ).length;
  const dinasCutiCount = attendanceData.filter(
    (a) => a.status === 'DINAS' || a.status === 'CUTI'
  ).length;

  // Export current table to CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `export_${activeTab.toLowerCase()}.csv`;

    if (activeTab === 'DATA_ABSENSI') {
      headers = [
        'ID',
        'Timestamp',
        'Group ID',
        'Nama Grup',
        'Nama',
        'NIK',
        'Jabatan',
        'Cabang',
        'Tanggal',
        'Jam',
        'Status',
        'Lokasi',
        'Keterangan',
        'Confidence',
        'Message ID',
        'URL Foto',
        'Status Validasi',
        'Waktu Update',
      ];
      rows = filteredAttendance.map((d) => [
        d.id,
        d.timestamp,
        d.groupId,
        d.groupName,
        d.nama,
        d.nik,
        d.jabatan,
        d.cabang,
        d.tanggal,
        d.jam,
        d.status,
        `"${d.lokasi}"`,
        `"${d.keterangan}"`,
        String(d.confidence),
        d.messageId,
        d.urlFoto,
        d.statusValidasi,
        d.waktuUpdate,
      ]);
    } else if (activeTab === 'REKAP_HARIAN') {
      headers = [
        'Tanggal',
        'Nama',
        'NIK',
        'Jabatan',
        'Cabang',
        'Jam Masuk',
        'Jam Pulang',
        'Status',
        'Keterangan',
        'Total Kehadiran',
        'Status Kehadiran',
        'Batas Masuk',
        'Keterlambatan',
        'Status Ketepatan',
      ];
      rows = dailyRecap.map((d) => [
        d.tanggal,
        d.nama,
        d.nik,
        d.jabatan,
        d.cabang,
        d.jamMasuk,
        d.jamPulang,
        d.status,
        `"${d.keterangan}"`,
        d.totalKehadiran,
        d.statusKehadiran,
        d.batasMasuk,
        d.keterlambatan,
        d.statusKetepatan,
      ]);
    } else {
      headers = ['Data', 'Value'];
      rows = [['Total Records', String(attendanceData.length)]];
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Spreadsheet Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Google Sheets Live Mirror (Spreadsheet Absensi)
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-slate-100 text-slate-600 border border-slate-200">
                ID: {config.googleSheetId.substring(0, 16)}...
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sinkronisasi real-time 7 sheet absensi otomatis diperbarui oleh n8n.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAppsScript}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-2xs"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Generate 7 Sheet via Apps Script</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-300 rounded-lg hover:bg-teal-100 transition-colors shadow-2xs"
            title="Buka menu ekspor CSV lengkap untuk semua sheet dan format HRD Payroll"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Pusat Ekspor CSV &amp; HRD</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Download CSV untuk tab sheet yang sedang aktif"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span>Unduh CSV [{activeTab}]</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Tabs Header */}
      <div className="bg-slate-100 p-1 rounded-xl flex flex-wrap gap-1 border border-slate-200">
        {[
          { key: 'DASHBOARD', label: '📊 DASHBOARD' },
          { key: 'DATA_ABSENSI', label: '📝 DATA_ABSENSI (18 Kolom)' },
          { key: 'REKAP_HARIAN', label: '📅 REKAP_HARIAN' },
          { key: 'REKAP_CABANG', label: '🏢 REKAP_CABANG' },
          { key: 'REKAP_KARYAWAN', label: '👥 REKAP_KARYAWAN' },
          { key: 'CONFIG', label: '⚙️ CONFIG' },
          { key: 'LOG_PROSES', label: '📜 LOG_PROSES' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. TAB: DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block mb-1">
                TOTAL KARYAWAN
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900">{totalKaryawan}</span>
                <span className="text-xs text-slate-400">4 Cabang</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-emerald-600 font-semibold block mb-1">TOTAL HADIR</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-700">{hadirCount}</span>
                <span className="text-xs font-semibold text-emerald-600">
                  {Math.round((hadirCount / totalKaryawan) * 100)}%
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-amber-600 font-semibold block mb-1">TERLAMBAT</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-amber-600">{terlambatCount}</span>
                <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                  &gt; 08:00 WIB
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-blue-600 font-semibold block mb-1">IZIN / SAKIT</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-blue-700">{izinSakitCount}</span>
                <span className="text-xs text-slate-400">Surat Dokter</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
              <span className="text-xs text-purple-600 font-semibold block mb-1">DINAS / CUTI</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-purple-700">{dinasCutiCount}</span>
                <span className="text-xs text-slate-400">Tugas Luar</span>
              </div>
            </div>
          </div>

          {/* Charts & Aggregations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Rekap Per Cabang Progress (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>Tingkat Kehadiran Per Cabang Hari Ini (03/10/2026)</span>
                </span>
                <span className="text-xs font-normal text-slate-500">Normal 08:00 WIB</span>
              </h3>

              <div className="space-y-4">
                {branchRecap.map((branch) => {
                  const pct = Math.round((branch.hadir / branch.jumlahKaryawan) * 100);
                  return (
                    <div key={branch.cabang} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800 font-bold">{branch.cabang}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-normal">
                            {branch.hadir} / {branch.jumlahKaryawan} Karyawan
                          </span>
                          <span className="text-emerald-700 font-bold">{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Status Breakdown (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Distribusi Ketepatan Waktu</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-emerald-950">Tepat Waktu (≤ 08:00)</span>
                  </div>
                  <span className="font-bold text-emerald-800">
                    {attendanceData.filter((a) => a.statusKetepatan === 'TEPAT WAKTU').length} Karyawan
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="font-semibold text-amber-950">Terlambat (&gt; 08:00)</span>
                  </div>
                  <span className="font-bold text-amber-800">{terlambatCount} Karyawan</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-semibold text-slate-800">Izin / Sakit / Dinas</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {izinSakitCount + dinasCutiCount} Karyawan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: DATA_ABSENSI (All 18 Columns A - R) */}
      {activeTab === 'DATA_ABSENSI' && (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, ID, lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={filterCabang}
                onChange={(e) => setFilterCabang(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700"
              >
                <option value="ALL">Semua Cabang</option>
                <option value="Bogor">Bogor</option>
                <option value="Sukabumi">Sukabumi</option>
                <option value="Cianjur">Cianjur</option>
                <option value="Jasinga">Jasinga</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700"
              >
                <option value="ALL">Semua Status</option>
                <option value="MASUK">MASUK</option>
                <option value="PULANG">PULANG</option>
                <option value="DINAS">DINAS</option>
                <option value="IZIN">IZIN</option>
                <option value="SAKIT">SAKIT</option>
                <option value="CUTI">CUTI</option>
              </select>
            </div>

            <span className="text-xs text-slate-500">
              Menampilkan <strong>{filteredAttendance.length}</strong> baris data
            </span>
          </div>

          {/* Spreadsheet Table Container */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#0F766E] text-white uppercase font-bold sticky top-0 z-10 text-[11px] tracking-wider">
                  <tr>
                    <th className="p-2.5 border-r border-teal-800">A: ID</th>
                    <th className="p-2.5 border-r border-teal-800">B: Timestamp</th>
                    <th className="p-2.5 border-r border-teal-800">C: Group ID</th>
                    <th className="p-2.5 border-r border-teal-800">D: Nama Grup</th>
                    <th className="p-2.5 border-r border-teal-800">E: Nama</th>
                    <th className="p-2.5 border-r border-teal-800">F: NIK</th>
                    <th className="p-2.5 border-r border-teal-800">G: Jabatan</th>
                    <th className="p-2.5 border-r border-teal-800">H: Cabang</th>
                    <th className="p-2.5 border-r border-teal-800">I: Tanggal</th>
                    <th className="p-2.5 border-r border-teal-800">J: Jam</th>
                    <th className="p-2.5 border-r border-teal-800">K: Status</th>
                    <th className="p-2.5 border-r border-teal-800">L: Lokasi</th>
                    <th className="p-2.5 border-r border-teal-800">M: Keterangan</th>
                    <th className="p-2.5 border-r border-teal-800">N: Confidence</th>
                    <th className="p-2.5 border-r border-teal-800">O: Message ID</th>
                    <th className="p-2.5 border-r border-teal-800">P: Foto</th>
                    <th className="p-2.5 border-r border-teal-800">Q: Status Validasi</th>
                    <th className="p-2.5">R: Waktu Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {filteredAttendance.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100'}
                    >
                      <td className="p-2.5 font-bold text-slate-800 border-r border-slate-200">
                        {row.id}
                      </td>
                      <td className="p-2.5 text-slate-600 border-r border-slate-200">
                        {row.timestamp}
                      </td>
                      <td className="p-2.5 text-slate-500 border-r border-slate-200">
                        {row.groupId.substring(0, 16)}...
                      </td>
                      <td className="p-2.5 font-sans font-medium text-slate-700 border-r border-slate-200">
                        {row.groupName}
                      </td>
                      <td className="p-2.5 font-sans font-bold text-slate-900 border-r border-slate-200">
                        {row.nama}
                      </td>
                      <td className="p-2.5 text-slate-600 border-r border-slate-200">
                        {row.nik}
                      </td>
                      <td className="p-2.5 font-sans text-slate-700 border-r border-slate-200">
                        {row.jabatan}
                      </td>
                      <td className="p-2.5 font-sans font-semibold text-slate-800 border-r border-slate-200">
                        {row.cabang}
                      </td>
                      <td className="p-2.5 text-slate-700 border-r border-slate-200">
                        {row.tanggal}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">
                        {row.jam}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            row.status === 'MASUK'
                              ? 'bg-blue-100 text-blue-800'
                              : row.status === 'PULANG'
                                ? 'bg-emerald-100 text-emerald-800'
                                : row.status === 'SAKIT'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-sans text-slate-600 border-r border-slate-200 max-w-[180px] truncate">
                        {row.lokasi}
                      </td>
                      <td className="p-2.5 font-sans text-slate-500 border-r border-slate-200 max-w-[160px] truncate">
                        {row.keterangan || '-'}
                      </td>
                      <td className="p-2.5 border-r border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold ${
                              row.confidence >= 0.8 ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {Math.round(row.confidence * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-400 border-r border-slate-200 truncate max-w-[120px]">
                        {row.messageId}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">
                        {row.urlFoto ? (
                          <button
                            onClick={() => setSelectedImage(row.urlFoto)}
                            className="inline-flex items-center gap-1 text-[10px] text-teal-700 hover:text-teal-900 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200"
                          >
                            <span>Lihat Foto</span>
                            <Maximize2 className="w-2.5 h-2.5" />
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.statusValidasi === 'VALID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.statusValidasi === 'DUPLIKAT'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {row.statusValidasi}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500 font-sans">{row.waktuUpdate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: REKAP_HARIAN */}
      {activeTab === 'REKAP_HARIAN' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#1D4ED8] text-white uppercase font-bold sticky top-0 z-10 text-[11px] tracking-wider">
                <tr>
                  <th className="p-2.5 border-r border-blue-900">Tanggal</th>
                  <th className="p-2.5 border-r border-blue-900">Nama</th>
                  <th className="p-2.5 border-r border-blue-900">NIK</th>
                  <th className="p-2.5 border-r border-blue-900">Jabatan</th>
                  <th className="p-2.5 border-r border-blue-900">Cabang</th>
                  <th className="p-2.5 border-r border-blue-900">Jam Masuk</th>
                  <th className="p-2.5 border-r border-blue-900">Jam Pulang</th>
                  <th className="p-2.5 border-r border-blue-900">Status</th>
                  <th className="p-2.5 border-r border-blue-900">Keterangan</th>
                  <th className="p-2.5 border-r border-blue-900">Total Kehadiran</th>
                  <th className="p-2.5 border-r border-blue-900">Status Kehadiran</th>
                  <th className="p-2.5 border-r border-blue-900">Batas Masuk</th>
                  <th className="p-2.5 border-r border-blue-900">Keterlambatan</th>
                  <th className="p-2.5">Status Ketepatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {dailyRecap.map((row, idx) => (
                  <tr
                    key={row.nik + idx}
                    className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100'}
                  >
                    <td className="p-2.5 font-mono text-slate-700 border-r border-slate-200">
                      {row.tanggal}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">
                      {row.nama}
                    </td>
                    <td className="p-2.5 font-mono text-slate-600 border-r border-slate-200">
                      {row.nik}
                    </td>
                    <td className="p-2.5 text-slate-700 border-r border-slate-200">{row.jabatan}</td>
                    <td className="p-2.5 font-semibold text-slate-800 border-r border-slate-200">
                      {row.cabang}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 border-r border-slate-200">
                      {row.jamMasuk}
                    </td>
                    <td className="p-2.5 font-mono text-slate-700 border-r border-slate-200">
                      {row.jamPulang}
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          row.status === 'HADIR'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status === 'BELUM PULANG'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500 border-r border-slate-200 max-w-[180px] truncate">
                      {row.keterangan}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200 text-center">
                      {row.totalKehadiran}
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800 border-r border-slate-200">
                      {row.statusKehadiran}
                    </td>
                    <td className="p-2.5 font-mono text-slate-500 border-r border-slate-200">
                      {row.batasMasuk}
                    </td>
                    <td className="p-2.5 font-bold border-r border-slate-200 text-amber-700">
                      {row.keterlambatan}
                    </td>
                    <td className="p-2.5 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          row.statusKetepatan === 'TEPAT WAKTU'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.statusKetepatan.startsWith('TERLAMBAT')
                              ? 'bg-amber-100 text-amber-800'
                              : 'text-slate-400'
                        }`}
                      >
                        {row.statusKetepatan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB: REKAP_CABANG */}
      {activeTab === 'REKAP_CABANG' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#7C3AED] text-white uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="p-2.5 border-r border-purple-900">Tanggal</th>
                  <th className="p-2.5 border-r border-purple-900">Cabang</th>
                  <th className="p-2.5 border-r border-purple-900">Jumlah Karyawan</th>
                  <th className="p-2.5 border-r border-purple-900">Hadir</th>
                  <th className="p-2.5 border-r border-purple-900">Tidak Hadir</th>
                  <th className="p-2.5 border-r border-purple-900">Izin</th>
                  <th className="p-2.5 border-r border-purple-900">Sakit</th>
                  <th className="p-2.5 border-r border-purple-900">Cuti</th>
                  <th className="p-2.5">Dinas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {branchRecap.map((row, idx) => (
                  <tr
                    key={row.cabang}
                    className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100'}
                  >
                    <td className="p-2.5 font-mono text-slate-700 border-r border-slate-200">
                      {row.tanggal}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">
                      {row.cabang}
                    </td>
                    <td className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                      {row.jumlahKaryawan}
                    </td>
                    <td className="p-2.5 font-bold text-emerald-700 border-r border-slate-200">
                      {row.hadir}
                    </td>
                    <td className="p-2.5 font-bold text-rose-600 border-r border-slate-200">
                      {row.tidakHadir}
                    </td>
                    <td className="p-2.5 text-slate-700 border-r border-slate-200">{row.izin}</td>
                    <td className="p-2.5 text-slate-700 border-r border-slate-200">{row.sakit}</td>
                    <td className="p-2.5 text-slate-700 border-r border-slate-200">{row.cuti}</td>
                    <td className="p-2.5 text-slate-700">{row.dinas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB: REKAP_KARYAWAN */}
      {activeTab === 'REKAP_KARYAWAN' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#C2410C] text-white uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="p-2.5 border-r border-orange-900">Nama</th>
                  <th className="p-2.5 border-r border-orange-900">NIK</th>
                  <th className="p-2.5 border-r border-orange-900">Jabatan</th>
                  <th className="p-2.5 border-r border-orange-900">Cabang</th>
                  <th className="p-2.5 border-r border-orange-900">Hadir</th>
                  <th className="p-2.5 border-r border-orange-900">Tidak Hadir</th>
                  <th className="p-2.5 border-r border-orange-900">Izin</th>
                  <th className="p-2.5 border-r border-orange-900">Sakit</th>
                  <th className="p-2.5 border-r border-orange-900">Cuti</th>
                  <th className="p-2.5 border-r border-orange-900">Dinas</th>
                  <th className="p-2.5 border-r border-orange-900">Terlambat</th>
                  <th className="p-2.5">Total Hari Kerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {employeeRecap.map((row, idx) => (
                  <tr
                    key={row.nik}
                    className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100'}
                  >
                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">
                      {row.nama}
                    </td>
                    <td className="p-2.5 font-mono text-slate-600 border-r border-slate-200">
                      {row.nik}
                    </td>
                    <td className="p-2.5 text-slate-700 border-r border-slate-200">{row.jabatan}</td>
                    <td className="p-2.5 font-semibold text-slate-800 border-r border-slate-200">
                      {row.cabang}
                    </td>
                    <td className="p-2.5 font-bold text-emerald-700 border-r border-slate-200">
                      {row.hadir}
                    </td>
                    <td className="p-2.5 font-bold text-rose-600 border-r border-slate-200">
                      {row.tidakHadir}
                    </td>
                    <td className="p-2.5 text-slate-700 border-r border-slate-200">{row.izin}</td>
                    <td className="p-2.5 text-slate-700 border-r border-slate-200">{row.sakit}</td>
                    <td className="p-2.5 text-slate-700 border-r border-slate-200">{row.cuti}</td>
                    <td className="p-2.5 text-slate-700 border-r border-slate-200">{row.dinas}</td>
                    <td className="p-2.5 font-bold text-amber-600 border-r border-slate-200">
                      {row.terlambat}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">{row.totalHariKerja}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB: CONFIG */}
      {activeTab === 'CONFIG' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Sheet CONFIG (Daftar Parameter Terkonfigurasi)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E293B] text-white uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-2.5 w-1/3">PARAMETER</th>
                  <th className="p-2.5">VALUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">GROUP_ID</td>
                  <td className="p-2.5 text-slate-600 break-all">
                    {config.groupIds.map((g) => g.id).join(', ')}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">GOOGLE_SHEET_ID</td>
                  <td className="p-2.5 text-slate-600">{config.googleSheetId}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">SHEET_DATA</td>
                  <td className="p-2.5 text-slate-600">{config.sheetData}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">SHEET_REKAP</td>
                  <td className="p-2.5 text-slate-600">{config.sheetRekap}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">JAM_MASUK_NORMAL</td>
                  <td className="p-2.5 text-emerald-700 font-bold">{config.jamMasuk}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">CONFIDENCE_MINIMUM</td>
                  <td className="p-2.5 text-slate-600">{config.confidenceMinimum}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">ADMIN_PHONE</td>
                  <td className="p-2.5 text-slate-600">{config.adminPhone}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">TIMEZONE</td>
                  <td className="p-2.5 text-slate-600">{config.timezone}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB: LOG_PROSES */}
      {activeTab === 'LOG_PROSES' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#374151] text-white uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="p-2.5 border-r border-slate-600">Timestamp</th>
                  <th className="p-2.5 border-r border-slate-600">Message ID</th>
                  <th className="p-2.5 border-r border-slate-600">Group ID</th>
                  <th className="p-2.5 border-r border-slate-600">Nama File</th>
                  <th className="p-2.5 border-r border-slate-600">Nama</th>
                  <th className="p-2.5 border-r border-slate-600">Tanggal</th>
                  <th className="p-2.5 border-r border-slate-600">Status</th>
                  <th className="p-2.5 border-r border-slate-600">Confidence</th>
                  <th className="p-2.5 border-r border-slate-600">Hasil</th>
                  <th className="p-2.5 border-r border-slate-600">Error / Detail</th>
                  <th className="p-2.5">Processing Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {logData.map((log, idx) => (
                  <tr
                    key={log.messageId + idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    <td className="p-2.5 text-slate-700 border-r border-slate-200">
                      {log.timestamp}
                    </td>
                    <td className="p-2.5 text-slate-500 border-r border-slate-200 max-w-[120px] truncate">
                      {log.messageId}
                    </td>
                    <td className="p-2.5 text-slate-500 border-r border-slate-200 max-w-[120px] truncate">
                      {log.groupId}
                    </td>
                    <td className="p-2.5 text-slate-600 border-r border-slate-200">
                      {log.namaFile}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200 font-sans">
                      {log.nama}
                    </td>
                    <td className="p-2.5 text-slate-600 border-r border-slate-200">{log.tanggal}</td>
                    <td className="p-2.5 border-r border-slate-200 font-sans">{log.status}</td>
                    <td className="p-2.5 border-r border-slate-200">
                      {Math.round(log.confidence * 100)}%
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.hasil === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.hasil === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.hasil}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500 border-r border-slate-200 max-w-[200px] truncate font-sans">
                      {log.error}
                    </td>
                    <td className="p-2.5 font-bold text-slate-700">{log.processingTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSV Export Multi-Sheet Modal */}
      <CsvExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeSheet={activeTab}
        config={config}
        attendanceData={attendanceData}
        dailyRecap={dailyRecap}
        branchRecap={branchRecap}
        employeeRecap={employeeRecap}
        logData={logData}
      />

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-semibold">Preview Foto Absensi WhatsApp</span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={selectedImage}
                alt="Foto Absensi"
                className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
            <div className="p-3 bg-white border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedImage(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
