import React, { useState } from 'react';
import {
  BookOpen,
  Server,
  Key,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  Terminal,
  ExternalLink,
  Code2,
  Layers,
  MessageSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { DOCKER_COMPOSE_TEMPLATE } from '../data/n8nWorkflowTemplate';

export const DeploymentGuide: React.FC = () => {
  const [copiedDocker, setCopiedDocker] = useState(false);
  const [copiedCron, setCopiedCron] = useState(false);

  const handleCopy = (text: string, type: 'docker' | 'cron') => {
    navigator.clipboard.writeText(text);
    if (type === 'docker') {
      setCopiedDocker(true);
      setTimeout(() => setCopiedDocker(false), 2000);
    } else {
      setCopiedCron(true);
      setTimeout(() => setCopiedCron(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/80">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">Panduan Implementasi & Deployment Production</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Instruksi lengkap langkah demi langkah untuk mengaktifkan sistem rekap absensi otomatis
          berbasis n8n, WhatsApp API resmi / gateway berlisensi, AI Vision OCR (Gemini), dan Google
          Sheets API di server VPS Ubuntu Anda.
        </p>
      </div>

      {/* 1. System Architecture */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            1. Arsitektur Sistem & Data Flow Pipeline
          </h3>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 space-y-3 font-mono">
          <div className="flex flex-col gap-1.5">
            <div className="font-bold text-slate-900">Alur Eksekusi Data Real-time:</div>
            <div>[Karyawan di Toko/Cabang] ──(Kirim Foto Selfie/Absen)──&gt; [Grup WhatsApp Terpilih]</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</div>
            <div>[WhatsApp Cloud API / WAHA] ──(Webhook POST JSON)──────────&gt; [n8n Webhook Node (SSL)]</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</div>
            <div>[Filter Group ID] ──(Hanya Bogor/Sukabumi/Cianjur/Jasinga)──&gt; [Check Media (isImage?)]</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</div>
            <div>[Download Binary File] ──(HTTP Bearer Auth)─────────────────&gt; [Gemini 3.8/2.5 Flash Vision]</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ (Ekstraksi 9 Kolom JSON)</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</div>
            <div>[Code Node: Validasi + Hitung Terlambat (Batas 08:00)] ─────&gt; [Anti-Duplikasi (Check Message ID)]</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</div>
            <div>[Google Sheets API] ───(Insert DATA_ABSENSI &amp; Update REKAP_HARIAN, REKAP_CABANG)</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</div>
            <div>[Kirim Balasan Otomatis WhatsApp] ──(✅ Berhasil direkap / ⚠️ Foto blur / ℹ️ Duplikat)</div>
          </div>
        </div>
      </div>

      {/* 2. WhatsApp API Setup */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            2. Konfigurasi WhatsApp API Gateway (Anti-Scraping)
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Sesuai ketentuan resmi WhatsApp, sistem ini <strong>tidak menggunakan web scraping</strong>{' '}
          yang rentan pemblokiran nomor. Anda dapat memilih salah satu dari 2 gateway resmi:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="font-bold text-slate-900 block">Opsi A: Meta WhatsApp Cloud API (Resmi)</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li>Buat App di <strong>developers.facebook.com</strong> &gt; Tambahkan produk WhatsApp.</li>
              <li>Daftarkan nomor telepon bisnis perusahaan Anda.</li>
              <li>
                Di menu <strong>Configuration &gt; Webhook</strong>, masukkan URL webhook n8n:
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 block my-1 font-mono text-[10px]">
                  https://n8n.domainanda.com/webhook/whatsapp
                </code>
              </li>
              <li>Centang subscription event: <code className="font-bold">messages</code>.</li>
              <li>Salin System User Access Token permanen ke n8n Credentials.</li>
            </ol>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="font-bold text-slate-900 block">
              Opsi B: WAHA (WhatsApp HTTP API Self-Hosted)
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li>Jalankan container WAHA di VPS Anda (sudah support webhook otomatis).</li>
              <li>Scan QR Code nomor WhatsApp admin absensi sekali via web dashboard WAHA.</li>
              <li>
                Atur parameter Webhook URL di WAHA mengarah ke n8n:
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 block my-1 font-mono text-[10px]">
                  http://n8n:5678/webhook/whatsapp
                </code>
              </li>
              <li>Pilih event: <code className="font-bold">message.any</code> atau <code className="font-bold">message</code>.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 3. Google Sheets Connection */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <FileSpreadsheet className="w-5 h-5 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900">
            3. Cara Menghubungkan Google Sheets ke n8n
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              1
            </span>
            <div>
              <strong>Buat Spreadsheet dan 7 Sheet Otomatis:</strong> Buka Google Sheets baru di akun
              Google Drive Anda. Jalankan kode Apps Script bawaan (tombol "Apps Script Sheets" di
              atas) untuk langsung meng-generate sheet DASHBOARD, DATA_ABSENSI, REKAP_HARIAN,
              REKAP_CABANG, REKAP_KARYAWAN, CONFIG, dan LOG_PROSES.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              2
            </span>
            <div>
              <strong>Service Account Google Cloud:</strong> Buka Google Cloud Console &gt; Enable
              "Google Sheets API" &gt; Buat Service Account &gt; Unduh kunci dalam format JSON.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              3
            </span>
            <div>
              <strong>Share Spreadsheet:</strong> Salin email service account (contoh:{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">
                n8n-bot@project-absensi.iam.gserviceaccount.com
              </code>
              ) dan berikan akses <strong>Editor</strong> pada Google Spreadsheet absensi Anda.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              4
            </span>
            <div>
              <strong>Koneksi di n8n:</strong> Buka n8n &gt; Credentials &gt; Pilih "Google Sheets
              OAuth2" atau "Google Service Account" &gt; Paste JSON Key. Semua node Sheets akan
              langsung aktif!
            </div>
          </div>
        </div>
      </div>

      {/* 4. VPS Docker Deployment */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              4. Deploy n8n Production di VPS (docker-compose.yml)
            </h3>
          </div>
          <button
            onClick={() => handleCopy(DOCKER_COMPOSE_TEMPLATE, 'docker')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            {copiedDocker ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin docker-compose.yml</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Simpan konfigurasi berikut di VPS Anda pada direktori{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">
            /opt/n8n/docker-compose.yml
          </code>{' '}
          dan jalankan dengan perintah{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800 font-bold">
            docker compose up -d
          </code>
          .
        </p>

        <div className="bg-slate-950 rounded-xl p-4 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
          <pre>{DOCKER_COMPOSE_TEMPLATE}</pre>
        </div>
      </div>

      {/* 5. Cron Setup & Testing Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Jadwal Cron Rekap Harian (06, 12, 18, 23 WIB)
            </h4>
          </div>
          <p className="text-xs text-slate-600">
            Node Schedule Trigger diatur dengan ekspresi cron standar:
          </p>
          <div className="p-2.5 rounded-lg bg-slate-900 text-amber-400 font-mono text-xs flex items-center justify-between">
            <span>0 6,12,18,23 * * *</span>
            <button
              onClick={() => handleCopy('0 6,12,18,23 * * *', 'cron')}
              className="text-slate-400 hover:text-white"
            >
              {copiedCron ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
            <li><strong>06:00:</strong> Inisialisasi sheet harian baru</li>
            <li><strong>12:00:</strong> Monitoring absensi masuk siang</li>
            <li><strong>18:00:</strong> Konsolidasi rekap jam pulang shift normal</li>
            <li><strong>23:00:</strong> Finalisasi rekap, tandai Alpa jika tidak absen</li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Error Handling & Retry Policy
            </h4>
          </div>
          <div className="text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span>Unduh Foto WhatsApp:</span>
              <span className="font-bold text-emerald-700">Retry 3x (delay 2s)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span>Panggilan Gemini Vision:</span>
              <span className="font-bold text-emerald-700">Retry 2x (delay 3s)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span>Google Sheets Append:</span>
              <span className="font-bold text-emerald-700">Retry 3x (delay 2s)</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Jika seluruh retry gagal, n8n secara otomatis mencatat error ke sheet{' '}
              <strong>LOG_PROSES</strong> dan meneruskan notifikasi darurat ke nomor WhatsApp Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
