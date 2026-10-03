import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileCode,
  Shield,
  Clock,
  Sparkles,
  Phone,
  Sheet,
} from 'lucide-react';
import { SystemConfig } from '../types/attendance';
import { generateN8nWorkflow } from '../data/n8nWorkflowTemplate';

interface ConfiguratorProps {
  config: SystemConfig;
  onUpdateConfig: (updated: SystemConfig) => void;
  onDownloadWorkflow: () => void;
  onCopyWorkflow: () => void;
  copied: boolean;
}

export const Configurator: React.FC<ConfiguratorProps> = ({
  config,
  onUpdateConfig,
  onDownloadWorkflow,
  onCopyWorkflow,
  copied,
}) => {
  const [localConfig, setLocalConfig] = useState<SystemConfig>({ ...config });
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupId, setNewGroupId] = useState('');

  // Handle Add Group
  const handleAddGroup = () => {
    if (!newGroupName.trim() || !newGroupId.trim()) return;
    const updated = {
      ...localConfig,
      groupIds: [
        ...localConfig.groupIds,
        { id: newGroupId.trim(), name: newGroupName.trim(), sheetName: 'DATA_ABSENSI' },
      ],
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    setNewGroupName('');
    setNewGroupId('');
  };

  // Handle Remove Group
  const handleRemoveGroup = (index: number) => {
    const updated = {
      ...localConfig,
      groupIds: localConfig.groupIds.filter((_, i) => i !== index),
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
  };

  // Handle generic input change
  const handleChange = (field: keyof SystemConfig, value: any) => {
    const updated = { ...localConfig, [field]: value };
    setLocalConfig(updated);
    onUpdateConfig(updated);
  };

  const workflowJsonString = JSON.stringify(generateN8nWorkflow(localConfig), null, 2);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-600 text-white shadow-xs">
              <Settings className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Konfigurasi Parameter & Generator File n8n JSON
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ubah parameter di bawah ini. File JSON n8n akan diperbarui secara otomatis dan siap
            di-import ke instance n8n Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopyWorkflow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin JSON</span>
              </>
            )}
          </button>
          <button
            onClick={onDownloadWorkflow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download workflow.json</span>
          </button>
        </div>
      </div>

      {/* 2 Columns: Config Forms vs Live JSON Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Settings (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Whitelist WhatsApp Groups */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Whitelist Grup WhatsApp yang Diproses</span>
              </span>
              <span className="text-xs text-slate-500">{localConfig.groupIds.length} Grup</span>
            </h3>

            <p className="text-xs text-slate-500">
              Hanya foto absensi dari grup terdaftar di bawah ini yang akan diproses oleh filter
              n8n. Chat pribadi atau grup di luar daftar akan diabaikan (IGNORE).
            </p>

            <div className="space-y-2">
              {localConfig.groupIds.map((g, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{g.name}</span>
                    <span className="text-[11px] font-mono text-slate-500">{g.id}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveGroup(idx)}
                    disabled={localConfig.groupIds.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Group Inputs */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Nama Cabang / Grup (mis. Grup Bogor)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 flex-1 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Group ID (mis. 120363028...@g.us)"
                value={newGroupId}
                onChange={(e) => setNewGroupId(e.target.value)}
                className="text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 flex-1 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleAddGroup}
                disabled={!newGroupName || !newGroupId}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Operational Parameters (Jam Masuk, Confidence, Google Sheet ID) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Parameter Operasional Absensi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Batas Jam Masuk Normal
                </label>
                <input
                  type="text"
                  value={localConfig.jamMasuk}
                  onChange={(e) => handleChange('jamMasuk', e.target.value)}
                  placeholder="08:00"
                  className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  &gt; jam ini dianggap TERLAMBAT
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Ambang Batas Minimum Confidence AI
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="1.0"
                  value={localConfig.confidenceMinimum}
                  onChange={(e) => handleChange('confidenceMinimum', parseFloat(e.target.value))}
                  className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  &lt; nilai ini ditandai PERLU_VERIFIKASI
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Google Spreadsheet ID Target
                </label>
                <input
                  type="text"
                  value={localConfig.googleSheetId}
                  onChange={(e) => handleChange('googleSheetId', e.target.value)}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Dapat diambil dari URL Google Sheets: docs.google.com/spreadsheets/d/
                  <strong>ID_INI</strong>/edit
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nomor WhatsApp Admin (Notifikasi Error)
                </label>
                <input
                  type="text"
                  value={localConfig.adminPhone}
                  onChange={(e) => handleChange('adminPhone', e.target.value)}
                  placeholder="6281234567890"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Zona Waktu Operasional
                </label>
                <input
                  type="text"
                  value={localConfig.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  placeholder="Asia/Jakarta"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live n8n JSON Preview (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-600" />
              <span>Live Generated n8n Workflow JSON (v1.x Ready)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {workflowJsonString.split('\n').length} baris
            </span>
          </div>

          <p className="text-xs text-slate-500">
            File JSON ini valid dan terverifikasi untuk n8n versi 1.x+. Anda dapat langsung
            mengimpornya via <strong>Settings &gt; Import from File</strong> atau membuka n8n canvas
            dan menekan tombol <strong>Ctrl + V</strong>.
          </p>

          <div className="bg-slate-950 rounded-xl p-4 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed">
            <pre>{workflowJsonString}</pre>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Otomatis sync dengan form konfigurasi</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onCopyWorkflow}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Copy'}</span>
              </button>
              <button
                onClick={onDownloadWorkflow}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
