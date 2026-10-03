import React from 'react';
import {
  Workflow,
  Sparkles,
  Sheet,
  MessageSquare,
  Download,
  Copy,
  Check,
  Code2,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  onDownloadWorkflow: () => void;
  onCopyWorkflow: () => void;
  onOpenAppsScript: () => void;
  onOpenCsvExport?: () => void;
  copied: boolean;
  currentUser?: FirebaseUser | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onDownloadWorkflow,
  onCopyWorkflow,
  onOpenAppsScript,
  onOpenCsvExport,
  copied,
  currentUser,
  onLogin,
  onLogout,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  n8n WhatsApp Absensi AI
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Auto-Rekap Foto Absensi Grup WhatsApp → AI Vision OCR → Google Sheets Harian
              </p>
            </div>
          </div>

          {/* Quick Badges & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Webhook</span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gemini Vision OCR</span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <Sheet className="w-3.5 h-3.5 text-teal-600" />
              <span>Google Sheets v4</span>
            </div>

            {/* Apps Script Auto-setup */}
            <button
              onClick={onOpenAppsScript}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs"
              title="Salin kode Google Apps Script untuk otomatis membuat 7 sheet di Google Drive"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Apps Script Sheets</span>
            </button>

            {/* CSV Export Center */}
            {onOpenCsvExport && (
              <button
                onClick={onOpenCsvExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-300 rounded-lg hover:bg-teal-100 transition-colors shadow-2xs"
                title="Buka menu ekspor CSV lengkap untuk semua sheet dan format HRD"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Ekspor CSV</span>
              </button>
            )}

            {/* Copy Workflow JSON */}
            <button
              onClick={onCopyWorkflow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy JSON n8n</span>
                </>
              )}
            </button>

            {/* Download Workflow JSON */}
            <button
              onClick={onDownloadWorkflow}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm hover:shadow-md transition-all shadow-emerald-600/25"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download workflow.json</span>
            </button>

            {/* Firebase Auth Google Sign In Button / User Profile */}
            <div className="pl-2 border-l border-slate-200 flex items-center">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-7 h-7 rounded-full border border-emerald-500 shadow-2xs"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {currentUser.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="hidden md:block text-left text-xs">
                    <span className="font-bold text-slate-800 block leading-tight truncate max-w-[120px]">
                      {currentUser.displayName || 'Admin HRD'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block leading-tight">
                      Firestore Connected
                    </span>
                  </div>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Keluar / Sign Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                onLogin && (
                  <button
                    onClick={onLogin}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-lg transition-colors shadow-2xs"
                    title="Masuk dengan Akun Google untuk sinkronisasi data ke Cloud Firestore"
                  >
                    <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Masuk Google</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
