export type AttendanceStatus =
  | 'MASUK'
  | 'PULANG'
  | 'DINAS'
  | 'IZIN'
  | 'SAKIT'
  | 'CUTI'
  | 'LAINNYA';

export type ValidationStatus = 'VALID' | 'PERLU_VERIFIKASI' | 'DUPLIKAT';

export type PunctualityStatus = 'TEPAT_WAKTU' | 'TERLAMBAT' | '-';

export interface AttendanceRecord {
  id: string; // A: ID (e.g. ABS-20261003-001)
  timestamp: string; // B: Timestamp (ISO / formatted)
  groupId: string; // C: Group ID
  groupName: string; // D: Nama Grup
  nama: string; // E: Nama
  nik: string; // F: NIK
  jabatan: string; // G: Jabatan
  cabang: string; // H: Cabang
  tanggal: string; // I: Tanggal (YYYY-MM-DD)
  jam: string; // J: Jam (HH:mm:ss)
  status: AttendanceStatus; // K: Status
  lokasi: string; // L: Lokasi
  keterangan: string; // M: Keterangan
  confidence: number; // N: Confidence (0.00 - 1.00)
  messageId: string; // O: Message ID
  urlFoto: string; // P: URL Foto
  statusValidasi: ValidationStatus; // Q: Status Validasi
  waktuUpdate: string; // R: Waktu Update
  lateMinutes?: number;
  statusKetepatan?: string;
}

export interface DailyRecapItem {
  tanggal: string;
  nama: string;
  nik: string;
  jabatan: string;
  cabang: string;
  jamMasuk: string;
  jamPulang: string;
  status: string; // e.g. HADIR, BELUM PULANG, DINAS, IZIN, SAKIT, CUTI, TIDAK ADA ABSENSI
  keterangan: string;
  totalKehadiran: string; // e.g. 1 / 0.5 / 0
  statusKehadiran: string;
  batasMasuk: string; // e.g. 08:00
  keterlambatan: string; // e.g. 0 Menit / Terlambat 12 Menit
  statusKetepatan: string; // TEPAT_WAKTU / TERLAMBAT
}

export interface BranchRecapItem {
  tanggal: string;
  cabang: string;
  jumlahKaryawan: number;
  hadir: number;
  tidakHadir: number;
  izin: number;
  sakit: number;
  cuti: number;
  dinas: number;
}

export interface EmployeeRecapItem {
  nama: string;
  nik: string;
  jabatan: string;
  cabang: string;
  hadir: number;
  tidakHadir: number;
  izin: number;
  sakit: number;
  cuti: number;
  dinas: number;
  terlambat: number;
  totalHariKerja: number;
}

export interface EmployeeMaster {
  id: string;
  nip: string; // NIP atau NIK Karyawan
  nama: string; // Nama Lengkap
  noHp: string; // Nomor WhatsApp / HP
  jabatan: string; // Jabatan / Posisi
  kantorCabang: string; // Kantor Cabang
  statusAktif: 'Aktif' | 'Nonaktif';
  email?: string;
  updatedAt?: string;
}

export interface SystemConfig {
  groupIds: { id: string; name: string; sheetName?: string }[];
  googleSheetId: string;
  sheetData: string;
  sheetRekap: string;
  sheetCabang: string;
  sheetKaryawan: string;
  sheetLog: string;
  jamMasuk: string; // '08:00'
  confidenceMinimum: number; // 0.80
  adminPhone: string;
  timezone: string; // 'Asia/Jakarta'
  whatsappProvider: 'meta_cloud_api' | 'waha' | 'fonnte';
  whatsappApiUrl: string;
  whatsappToken: string;
}

export interface ProcessLogItem {
  timestamp: string;
  messageId: string;
  groupId: string;
  namaFile: string;
  nama: string;
  tanggal: string;
  status: string;
  confidence: number;
  hasil: 'SUCCESS' | 'WARNING' | 'ERROR';
  error: string;
  processingTime: string;
}

export interface WorkflowNodeInfo {
  id: string;
  name: string;
  type: string;
  category: 'trigger' | 'filter' | 'ai' | 'sheets' | 'logic' | 'notify' | 'schedule';
  description: string;
  retryConfig: {
    maxTries: number;
    waitBetweenTries: number;
  };
  expressions?: Record<string, string>;
  codeSnippet?: string;
  configSummary: Record<string, string | number | boolean>;
}
