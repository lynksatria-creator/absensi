import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  Check,
  Layers,
  Settings2,
  Table,
  CheckCircle2,
  Sparkles,
  Briefcase,
  FileText,
  Users,
} from 'lucide-react';
import {
  AttendanceRecord,
  DailyRecapItem,
  BranchRecapItem,
  EmployeeRecapItem,
  ProcessLogItem,
  SystemConfig,
} from '../types/attendance';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSheet: string;
  config: SystemConfig;
  attendanceData: AttendanceRecord[];
  dailyRecap: DailyRecapItem[];
  branchRecap: BranchRecapItem[];
  employeeRecap: EmployeeRecapItem[];
  logData: ProcessLogItem[];
}

export const CsvExportModal: React.FC<CsvExportModalProps> = ({
  isOpen,
  onClose,
  activeSheet,
  config,
  attendanceData,
  dailyRecap,
  branchRecap,
  employeeRecap,
  logData,
}) => {
  const [selectedSheet, setSelectedSheet] = useState<string>(activeSheet || 'DATA_ABSENSI');
  const [delimiter, setDelimiter] = useState<',' | ';'>(',');
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Helper function to build CSV data for each sheet
  const getSheetData = (sheetKey: string): { filename: string; headers: string[]; rows: string[][] } => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

    switch (sheetKey) {
      case 'DATA_ABSENSI':
        return {
          filename: `DATA_ABSENSI_${today}.csv`,
          headers: [
            'ID',
            'Timestamp',
            'Group_ID',
            'Nama_Grup',
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
            'Message_ID',
            'URL_Foto',
            'Status_Validasi',
            'Menit_Terlambat',
            'Ketepatan',
            'Waktu_Update',
          ],
          rows: attendanceData.map((d) => [
            d.id,
            d.timestamp,
            d.groupId,
            `"${d.groupName.replace(/"/g, '""')}"`,
            `"${d.nama.replace(/"/g, '""')}"`,
            d.nik,
            `"${d.jabatan.replace(/"/g, '""')}"`,
            d.cabang,
            d.tanggal,
            d.jam,
            d.status,
            `"${d.lokasi.replace(/"/g, '""')}"`,
            `"${(d.keterangan || '').replace(/"/g, '""')}"`,
            String(d.confidence),
            d.messageId,
            d.urlFoto,
            d.statusValidasi,
            String(d.lateMinutes || 0),
            `"${d.statusKetepatan || '-'}"`,
            d.waktuUpdate,
          ]),
        };

      case 'REKAP_HARIAN':
        return {
          filename: `REKAP_HARIAN_${today}.csv`,
          headers: [
            'Tanggal',
            'Nama',
            'NIK',
            'Jabatan',
            'Cabang',
            'Jam_Masuk',
            'Jam_Pulang',
            'Status',
            'Keterangan',
            'Total_Kehadiran',
            'Status_Kehadiran',
            'Batas_Masuk',
            'Keterlambatan',
            'Status_Ketepatan',
          ],
          rows: dailyRecap.map((d) => [
            d.tanggal,
            `"${d.nama.replace(/"/g, '""')}"`,
            d.nik,
            `"${d.jabatan.replace(/"/g, '""')}"`,
            d.cabang,
            d.jamMasuk,
            d.jamPulang,
            d.status,
            `"${(d.keterangan || '').replace(/"/g, '""')}"`,
            d.totalKehadiran,
            d.statusKehadiran,
            d.batasMasuk,
            `"${d.keterlambatan}"`,
            `"${d.statusKetepatan}"`,
          ]),
        };

      case 'REKAP_CABANG':
        return {
          filename: `REKAP_CABANG_${today}.csv`,
          headers: [
            'Tanggal',
            'Cabang',
            'Jumlah_Karyawan',
            'Hadir',
            'Tidak_Hadir',
            'Izin',
            'Sakit',
            'Cuti',
            'Dinas',
            'Persentase_Kehadiran',
          ],
          rows: branchRecap.map((d) => [
            d.tanggal,
            d.cabang,
            String(d.jumlahKaryawan),
            String(d.hadir),
            String(d.tidakHadir),
            String(d.izin),
            String(d.sakit),
            String(d.cuti),
            String(d.dinas),
            `${Math.round((d.hadir / d.jumlahKaryawan) * 100)}%`,
          ]),
        };

      case 'REKAP_KARYAWAN':
        return {
          filename: `REKAP_KARYAWAN_${today}.csv`,
          headers: [
            'Nama',
            'NIK',
            'Jabatan',
            'Cabang',
            'Hadir',
            'Tidak_Hadir',
            'Izin',
            'Sakit',
            'Cuti',
            'Dinas',
            'Terlambat',
            'Total_Hari_Kerja',
            'Skor_Kedisiplinan',
          ],
          rows: employeeRecap.map((d) => [
            `"${d.nama.replace(/"/g, '""')}"`,
            d.nik,
            `"${d.jabatan.replace(/"/g, '""')}"`,
            d.cabang,
            String(d.hadir),
            String(d.tidakHadir),
            String(d.izin),
            String(d.sakit),
            String(d.cuti),
            String(d.dinas),
            String(d.terlambat),
            String(d.totalHariKerja),
            `${Math.round(((d.hadir - d.terlambat * 0.2) / d.totalHariKerja) * 100)}%`,
          ]),
        };

      case 'CONFIG':
        return {
          filename: `CONFIG_ABSENSI_${today}.csv`,
          headers: ['Parameter', 'Value', 'Keterangan'],
          rows: [
            ['GROUP_ID', `"${config.groupIds.map((g) => g.id).join(' | ')}"`, 'Whitelist Grup WhatsApp yang diproses'],
            ['GOOGLE_SHEET_ID', config.googleSheetId, 'Spreadsheet ID tujuan'],
            ['JAM_MASUK_NORMAL', config.jamMasuk, 'Batas toleransi jam masuk normal'],
            ['CONFIDENCE_MINIMUM', String(config.confidenceMinimum), 'Skor keyakinan OCR sebelum flag verifikasi'],
            ['ADMIN_PHONE', config.adminPhone, 'Nomor darurat notifikasi error'],
            ['TIMEZONE', config.timezone, 'Zona waktu operasional'],
            ['WHATSAPP_PROVIDER', config.whatsappProvider, 'Gateway WhatsApp yang digunakan'],
          ],
        };

      case 'LOG_PROSES':
        return {
          filename: `LOG_PROSES_${today}.csv`,
          headers: [
            'Timestamp',
            'Message_ID',
            'Group_ID',
            'Nama_File',
            'Nama',
            'Tanggal',
            'Status',
            'Confidence',
            'Hasil',
            'Error_Detail',
            'Processing_Time',
          ],
          rows: logData.map((d) => [
            d.timestamp,
            d.messageId,
            d.groupId,
            d.namaFile,
            `"${d.nama.replace(/"/g, '""')}"`,
            d.tanggal,
            d.status,
            `${Math.round(d.confidence * 100)}%`,
            d.hasil,
            `"${(d.error || '-').replace(/"/g, '""')}"`,
            d.processingTime,
          ]),
        };

      case 'TEMPLATE_KARYAWAN':
        return {
          filename: `TEMPLATE_DATABASE_KARYAWAN_${today}.csv`,
          headers: ['NIP', 'Nama', 'No_HP', 'Jabatan', 'Kantor_Cabang', 'Status_Aktif', 'Email'],
          rows: [
            ['123456', 'Budi Santoso', '628129101011', 'Sales Promotor', 'Bogor', 'Aktif', 'budi.santoso@perusahaan.com'],
            ['123457', 'Siti Rahma', '628129101012', 'Promotor Handphone', 'Sukabumi', 'Aktif', 'siti.rahma@perusahaan.com'],
            ['123458', 'Ahmad Dani', '628129101013', 'Field Coordinator', 'Cianjur', 'Aktif', 'ahmad.dani@perusahaan.com'],
            ['123459', 'Dewi Lestari', '628129101014', 'Promotor Handphone', 'Jasinga', 'Aktif', 'dewi.lestari@perusahaan.com'],
            ['123460', 'Rian Pratama', '628129101015', 'Sales Promotor', 'Bogor', 'Aktif', 'rian.pratama@perusahaan.com'],
          ],
        };

      case 'HRD_PAYROLL':
      default:
        // Format khusus HRD Payroll & Software HR (mis. Talenta, Gadjian, Mekari, SAP)
        return {
          filename: `HRD_PAYROLL_EXPORT_${today}.csv`,
          headers: [
            'Employee_NIK',
            'Employee_Name',
            'Department_Branch',
            'Position',
            'Work_Days',
            'Present_Days',
            'Late_Count',
            'Total_Late_Minutes',
            'Sick_Leave',
            'Permit_Leave',
            'Annual_Leave',
            'Duty_Trip',
            'Attendance_Rate',
          ],
          rows: employeeRecap.map((emp) => {
            // Find total late minutes from attendance records
            const empLateRecords = attendanceData.filter(
              (a) => a.nik === emp.nik && (a.lateMinutes || 0) > 0
            );
            const totalLateMinutes = empLateRecords.reduce((acc, cur) => acc + (cur.lateMinutes || 0), 0);

            return [
              emp.nik,
              `"${emp.nama.replace(/"/g, '""')}"`,
              emp.cabang,
              `"${emp.jabatan.replace(/"/g, '""')}"`,
              String(emp.totalHariKerja),
              String(emp.hadir),
              String(emp.terlambat),
              String(totalLateMinutes),
              String(emp.sakit),
              String(emp.izin),
              String(emp.cuti),
              String(emp.dinas),
              `${Math.round((emp.hadir / emp.totalHariKerja) * 100)}%`,
            ];
          }),
        };
    }
  };

  // Trigger single CSV download
  const downloadSingleCsv = (sheetKey: string) => {
    const { filename, headers, rows } = getSheetData(sheetKey);
    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel compatibility
      [headers.join(delimiter), ...rows.map((row) => row.join(delimiter))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportedSuccess(`Berhasil mengunduh ${filename}!`);
    setTimeout(() => setExportedSuccess(null), 3000);
  };

  // Trigger export all sheets
  const handleExportAll = async () => {
    setIsExportingAll(true);
    const allSheets = [
      'DATA_ABSENSI',
      'REKAP_HARIAN',
      'REKAP_CABANG',
      'REKAP_KARYAWAN',
      'HRD_PAYROLL',
      'CONFIG',
      'LOG_PROSES',
    ];

    for (let i = 0; i < allSheets.length; i++) {
      downloadSingleCsv(allSheets[i]);
      await new Promise((r) => setTimeout(r, 400));
    }

    setIsExportingAll(false);
    setExportedSuccess('Semua 7 sheet berhasil diekspor ke format CSV!');
    setTimeout(() => setExportedSuccess(null), 3500);
  };

  const currentData = getSheetData(selectedSheet);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Ekspor Data Absensi ke Format CSV</h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Arsip &amp; HRD Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Unduh data setiap sheet ke format CSV untuk arsip lokal, Excel, atau integrasi software HRD.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Success Banner */}
          {exportedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{exportedSuccess}</span>
            </div>
          )}

          {/* Sheet Selection Grid */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              1. Pilih Sheet yang Ingin Diekspor:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'DATA_ABSENSI', label: 'DATA_ABSENSI', count: `${attendanceData.length} Baris`, desc: 'Raw 18 Kolom' },
                { id: 'REKAP_HARIAN', label: 'REKAP_HARIAN', count: `${dailyRecap.length} Baris`, desc: 'Masuk/Pulang' },
                { id: 'REKAP_CABANG', label: 'REKAP_CABANG', count: `${branchRecap.length} Cabang`, desc: 'Agregasi' },
                { id: 'REKAP_KARYAWAN', label: 'REKAP_KARYAWAN', count: `${employeeRecap.length} Promotor`, desc: 'Historis' },
                { id: 'HRD_PAYROLL', label: '💼 HRD PAYROLL', count: `${employeeRecap.length} Karyawan`, desc: 'Format HRD' },
                { id: 'TEMPLATE_KARYAWAN', label: '📥 TEMPLATE_KARYAWAN', count: 'Template CSV', desc: 'Import Karyawan' },
                { id: 'CONFIG', label: 'CONFIG', count: '7 Parameter', desc: 'Whitelist & Jam' },
                { id: 'LOG_PROSES', label: 'LOG_PROSES', count: `${logData.length} Audit`, desc: 'Traceability' },
              ].map((sheet) => {
                const isSelected = selectedSheet === sheet.id;
                return (
                  <button
                    key={sheet.id}
                    onClick={() => setSelectedSheet(sheet.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 shadow-xs ring-1 ring-teal-500 text-teal-950 font-bold'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="truncate text-xs">{sheet.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-normal">
                      <span>{sheet.count}</span>
                      <span>{sheet.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delimiter & Options */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 block">2. Format Pembatas (Delimiter):</span>
              <span className="text-[11px] text-slate-500">
                Pilih titik koma (;) jika membuka langsung di Microsoft Excel dengan regional setting Indonesia.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg cursor-pointer text-xs font-semibold">
                <input
                  type="radio"
                  name="delimiter"
                  checked={delimiter === ','}
                  onChange={() => setDelimiter(',')}
                  className="text-teal-600"
                />
                <span>Koma ( , )</span>
              </label>
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg cursor-pointer text-xs font-semibold">
                <input
                  type="radio"
                  name="delimiter"
                  checked={delimiter === ';'}
                  onChange={() => setDelimiter(';')}
                  className="text-teal-600"
                />
                <span>Titik Koma ( ; )</span>
              </label>
            </div>
          </div>

          {/* Preview Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-slate-500" />
                <span>Preview Struktur CSV: {currentData.filename}</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {currentData.headers.length} Kolom • {currentData.rows.length} Baris Data
              </span>
            </div>

            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
              <div className="overflow-x-auto max-h-48 text-[11px] font-mono text-slate-300 p-2.5">
                <div className="text-emerald-400 font-bold border-b border-slate-800 pb-1.5 mb-1.5 whitespace-nowrap">
                  {currentData.headers.join(delimiter)}
                </div>
                {currentData.rows.slice(0, 4).map((row, idx) => (
                  <div key={idx} className="whitespace-nowrap py-0.5 text-slate-300 truncate">
                    {row.join(delimiter)}
                  </div>
                ))}
                {currentData.rows.length > 4 && (
                  <div className="text-slate-500 italic pt-1">
                    ... dan {currentData.rows.length - 4} baris lainnya siap diunduh
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mendukung UTF-8 BOM untuk karakter nama Indonesia &amp; timestamp</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Batch Export All */}
            <button
              onClick={handleExportAll}
              disabled={isExportingAll}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>{isExportingAll ? 'Sedang Mengunduh...' : 'Unduh Semua Sheet Sekaligus'}</span>
            </button>

            {/* Single Export Active */}
            <button
              onClick={() => downloadSingleCsv(selectedSheet)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-md shadow-teal-600/25"
            >
              <Download className="w-4 h-4" />
              <span>Unduh {currentData.filename}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
