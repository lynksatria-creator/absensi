import React, { useState } from 'react';
import {
  X,
  Github,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Download,
  Key,
  Terminal,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface GitHubPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPublishModal: React.FC<GitHubPublishModalProps> = ({ isOpen, onClose }) => {
  const repoUrl = 'https://github.com/lynksatria-creator/absensi.git';
  const repoWebUrl = 'https://github.com/lynksatria-creator/absensi';

  const [token, setToken] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsPushing(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/github-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.trim(),
          repoUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPushResult({
          success: true,
          message: data.message || 'Repository berhasil di-push ke GitHub!',
          details: data.output,
        });
      } else {
        setPushResult({
          success: false,
          message: data.message || data.error || 'Gagal melakukan push ke GitHub.',
          details: data.error,
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        message: 'Koneksi error ke server pengiriman: ' + err.message,
      });
    } finally {
      setIsPushing(false);
    }
  };

  const terminalCommand = `git remote set-url origin ${repoUrl}\ngit branch -M main\ngit push -u origin main`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(terminalCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white border border-white/20">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Publish ke Production GitHub</h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Kirim seluruh kode sumber dan commit history ke repository Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto max-h-[80vh] space-y-4 text-xs">
          {/* Repository Target Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Target Remote Repository:</span>
              <a
                href={repoWebUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <span>Buka di GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
              {repoUrl}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span>
                Branch: <strong className="text-slate-800 font-mono">main</strong>
              </span>
              <span>•</span>
              <span>
                Status: <strong className="text-emerald-700">30 Berkas Ter-commit</strong>
              </span>
              <span>•</span>
              <span>
                Build: <strong className="text-emerald-700">Pass (dist/)</strong>
              </span>
            </div>
          </div>

          {/* Result Alert */}
          {pushResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 animate-in slide-in-from-top-2 ${
                pushResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {pushResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold">{pushResult.message}</p>
                {pushResult.success ? (
                  <div className="mt-2">
                    <a
                      href={repoWebUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-2xs text-[11px]"
                    >
                      <span>Lihat Repository di GitHub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-rose-700 mt-1">
                    Pastikan Personal Access Token memiliki centang izin <strong>repo</strong> dan akun GitHub Anda memiliki hak write ke repository ini.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form Direct Push via GitHub Token */}
          <form onSubmit={handlePush} className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>Opsi 1: Push Langsung dengan GitHub Token (PAT)</span>
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=absensi-production"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center gap-1"
              >
                <span>Buat Token Baru</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Masukkan Personal Access Token (PAT) GitHub Anda (diawali <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">ghp_...</code>) untuk mempublikasikan repository secara instan ke GitHub.
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Tempel GitHub Personal Access Token (ghp_...)"
                className="flex-1 text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isPushing || !token.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                {isPushing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sedang Push...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-3.5 h-3.5" />
                    <span>Push Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Opsi 2: Download Full Bundle Repository */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 block">
                Opsi 2: Unduh Full Git Bundle Archive
              </span>
              <span className="text-[11px] text-slate-500">
                Berisi seluruh riwayat commit, branch main, dan berkas lengkap (.bundle).
              </span>
            </div>
            <a
              href="/api/download-bundle"
              download="absensi-whatsapp-production.bundle"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Unduh .bundle</span>
            </a>
          </div>

          {/* Opsi 3: Terminal Command */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>Opsi 3: Push Manual dari Terminal Laptop/Komputer</span>
              </span>
              <button
                onClick={handleCopyCommand}
                className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center gap-1"
              >
                {copiedCmd ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Perintah</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto select-all">
              {terminalCommand}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
