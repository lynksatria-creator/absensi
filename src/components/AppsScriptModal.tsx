import React, { useState } from 'react';
import { X, Copy, Check, Code2, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/n8nWorkflowTemplate';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">1-Click Google Apps Script Generator</h3>
              <p className="text-xs text-slate-300">
                Otomatis membuat 7 sheet, header, format warna, dan formula di Google Spreadsheet Anda.
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

        {/* Content & Steps */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2 text-blue-900">
            <span className="font-bold block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Cara Pakai di Google Sheets Anda:</span>
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed text-[11px]">
              <li>Buka spreadsheet baru di Google Sheets (sheets.google.com).</li>
              <li>
                Klik menu <strong>Extensions (Ekstensi) &gt; Apps Script</strong>.
              </li>
              <li>Hapus teks bawaan yang ada di editor, lalu paste kode di bawah ini.</li>
              <li>
                Klik tombol <strong>Save (Simpan)</strong> lalu klik <strong>Run (Jalankan)</strong>.
              </li>
              <li>
                Beri izin otorisasi sekali. Dalam hitungan detik, seluruh sheet (
                <strong>
                  DASHBOARD, DATA_ABSENSI, REKAP_HARIAN, REKAP_CABANG, REKAP_KARYAWAN, CONFIG, LOG_PROSES
                </strong>
                ) akan terbuat lengkap!
              </li>
            </ol>
          </div>

          {/* Code Viewer */}
          <div className="relative">
            <div className="flex items-center justify-between bg-slate-900 text-slate-400 px-3.5 py-2 rounded-t-xl text-[11px] font-mono border-b border-slate-800">
              <span>setupAbsensiSpreadsheet.gs</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Seluruh Kode</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-950 p-4 rounded-b-xl text-slate-200 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
              <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Formula dan format otomatis sudah disesuaikan dengan spesifikasi prompt.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Kode Script'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
