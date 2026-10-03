import React, { useState } from 'react';
import {
  Workflow,
  Sparkles,
  ArrowRight,
  Sheet,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Code2,
  ExternalLink,
  ChevronRight,
  Settings,
  AlertOctagon,
} from 'lucide-react';
import { SystemConfig, WorkflowNodeInfo } from '../types/attendance';
import { WORKFLOW_NODES_DETAILS } from '../data/n8nWorkflowTemplate';

interface WorkflowVisualizerProps {
  config: SystemConfig;
  onOpenAppsScript: () => void;
  onDownloadWorkflow: () => void;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  config,
  onOpenAppsScript,
  onDownloadWorkflow,
}) => {
  const [selectedNode, setSelectedNode] = useState<WorkflowNodeInfo>(WORKFLOW_NODES_DETAILS[0]);
  const [copiedScript, setCopiedScript] = useState(false);

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
              <Workflow className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Arsitektur & Diagram Workflow n8n (Production Flow)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Klik salah satu node di bawah ini untuk menginspeksi konfigurasi detail, kode JavaScript,
            expression n8n, dan pengaturan retry policy.
          </p>
        </div>

        <button
          onClick={onDownloadWorkflow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs self-start md:self-auto"
        >
          <span>Export Seluruh Workflow (.json)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Flow Canvas & Node List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Node Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Daftar Node n8n Berurutan:
          </div>

          {WORKFLOW_NODES_DETAILS.map((node, index) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                      node.category === 'trigger'
                        ? 'bg-emerald-600'
                        : node.category === 'ai'
                          ? 'bg-indigo-600'
                          : node.category === 'sheets'
                            ? 'bg-teal-600'
                            : node.category === 'notify'
                              ? 'bg-blue-600'
                              : node.category === 'schedule'
                                ? 'bg-amber-600'
                                : 'bg-slate-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">{node.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono truncate block">
                      {node.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {node.retryConfig.maxTries > 1 && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-semibold"
                      title="Retry attempts"
                    >
                      Retry {node.retryConfig.maxTries}x
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Node Inspector & Code Viewer (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold uppercase bg-indigo-100 text-indigo-800">
                  {selectedNode.type}
                </span>
                <span className="text-xs text-slate-400">ID: {selectedNode.id}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedNode.name}</h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>
                  {selectedNode.retryConfig.maxTries > 1
                    ? `${selectedNode.retryConfig.maxTries}x Retry (${selectedNode.retryConfig.waitBetweenTries}ms)`
                    : '1x Attempt'}
                </span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            {selectedNode.description}
          </div>

          {/* Configuration Summary Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Parameter & Pengaturan Node</span>
            </h4>
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {Object.entries(selectedNode.configSummary).map(([k, v]) => (
                    <tr key={k}>
                      <td className="p-2.5 font-bold text-slate-700 w-1/3 bg-slate-100/50">{k}</td>
                      <td className="p-2.5 text-slate-900 break-all">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expressions if any */}
          {selectedNode.expressions && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                n8n Syntax & Expression
              </h4>
              <div className="bg-slate-900 rounded-xl p-3 text-emerald-300 font-mono text-xs overflow-x-auto space-y-1">
                {Object.entries(selectedNode.expressions).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-slate-400"># {k}:</span>
                    <pre className="text-emerald-400 mt-0.5">{v}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Node Script (If it's a code node or has script) */}
          {(selectedNode.id === 'extract-msg' || selectedNode.id === 'validate-data') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Production JavaScript Code (n8n Code Node)</span>
                </h4>
                <button
                  onClick={() =>
                    handleCopyScript(
                      selectedNode.id === 'validate-data'
                        ? VALIDATION_CODE_SAMPLE
                        : EXTRACT_CODE_SAMPLE
                    )
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl p-3.5 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-64 border border-slate-800 leading-relaxed">
                <pre>
                  {selectedNode.id === 'validate-data'
                    ? VALIDATION_CODE_SAMPLE
                    : EXTRACT_CODE_SAMPLE}
                </pre>
              </div>
            </div>
          )}

          {/* AI OCR Prompt Box if selected is AI node */}
          {selectedNode.id === 'ai-vision' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>System Prompt AI Vision (Anti-Halusinasi Strict JSON)</span>
                </h4>
                <button
                  onClick={() => handleCopyScript(AI_PROMPT_SAMPLE)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Copy className="w-3 h-3" />
                  <span>Salin Prompt</span>
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl p-3.5 text-indigo-200 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800 leading-relaxed whitespace-pre-wrap">
                {AI_PROMPT_SAMPLE}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EXTRACT_CODE_SAMPLE = `// Ekstrak pesan WhatsApp masuk (Support Meta Cloud API & WAHA)
const body = $json.body || $json;

let messageId = '';
let sender = '';
let groupId = '';
let messageType = '';
let mediaId = '';
let caption = '';

if (body.entry && body.entry[0]?.changes?.[0]?.value?.messages?.[0]) {
  const msgObj = body.entry[0].changes[0].value.messages[0];
  messageId = msgObj.id;
  sender = msgObj.from;
  groupId = msgObj.groupId || msgObj.recipient_id;
  messageType = msgObj.type;
  if (msgObj.type === 'image') {
    mediaId = msgObj.image.id;
    caption = msgObj.image.caption || '';
  }
} else {
  // WAHA / Fonnte
  messageId = body.id || 'MSG_' + Date.now();
  sender = body.from || body.author;
  groupId = body.chatId || body.from;
  messageType = body.type || (body.hasMedia ? 'image' : 'chat');
  mediaId = body.mediaKey || body.mediaUrl || messageId;
  caption = body.body || body.caption || '';
}

return {
  json: { messageId, sender, groupId, messageType, mediaId, caption }
};`;

const VALIDATION_CODE_SAMPLE = `// Validasi Kelengkapan & Perhitungan Keterlambatan
const rawResponse = $json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
const parsed = JSON.parse(rawResponse);

const nama = parsed.nama || null;
const tanggal = parsed.tanggal || new Date().toISOString().split('T')[0];
const jam = parsed.jam || '08:00:00';
const status = (parsed.status || 'MASUK').toUpperCase();
const confidence = parsed.confidence || 0.85;

// Validasi
let statusValidasi = 'VALID';
if (!nama || !tanggal || !jam || confidence < 0.80) {
  statusValidasi = 'PERLU_VERIFIKASI';
}

// Deteksi Keterlambatan
const JAM_NORMAL = '08:00';
let lateMinutes = 0;
let statusKetepatan = 'TEPAT WAKTU';

if (status === 'MASUK' && jam) {
  const [hNormal, mNormal] = JAM_NORMAL.split(':').map(Number);
  const [hAbsen, mAbsen] = jam.split(':').map(Number);
  const normalMin = hNormal * 60 + mNormal;
  const absenMin = hAbsen * 60 + mAbsen;
  if (absenMin > normalMin) {
    lateMinutes = absenMin - normalMin;
    statusKetepatan = 'TERLAMBAT ' + lateMinutes + ' MENIT';
  }
}

return {
  json: {
    ...parsed,
    nama,
    tanggal,
    jam,
    status,
    confidence,
    statusValidasi,
    lateMinutes,
    statusKetepatan,
    waktuUpdate: new Date().toISOString()
  }
};`;

const AI_PROMPT_SAMPLE = `Anda adalah sistem OCR absensi karyawan.

Analisis foto absensi yang diberikan.

Ambil hanya informasi yang benar-benar terlihat pada foto.

Ekstrak:
1. nama
2. NIK
3. jabatan
4. cabang
5. tanggal
6. jam
7. status absensi
8. lokasi
9. keterangan

Status hanya boleh:
MASUK
PULANG
DINAS
IZIN
SAKIT
CUTI
LAINNYA

Jika informasi tidak terlihat, gunakan null.
Jangan menebak informasi.

Kembalikan hanya JSON valid dengan format:
{
  "nama": null,
  "nik": null,
  "jabatan": null,
  "cabang": null,
  "tanggal": null,
  "jam": null,
  "status": null,
  "lokasi": null,
  "keterangan": null,
  "confidence": 0
}`;
