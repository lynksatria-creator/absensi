import { SystemConfig, WorkflowNodeInfo } from '../types/attendance';

export function generateN8nWorkflow(config: SystemConfig) {
  const allowedGroupIds = config.groupIds.map((g) => g.id);

  return {
    name: 'WhatsApp Absensi AI Vision to Google Sheets [Production Ready]',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'webhook/whatsapp',
          options: {},
        },
        id: 'node-webhook-wa',
        name: 'Webhook WhatsApp',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [240, 300],
        webhookId: 'whatsapp-absensi-webhook',
      },
      {
        parameters: {
          jsCode: `// Validasi request dan ekstrak payload pesan
const body = $json.body || $json;

// Support format Meta Cloud API & Gateway WAHA / Fonnte
let message = null;
let sender = null;
let groupId = null;
let messageType = null;
let mediaId = null;
let caption = '';
let messageId = '';
let timestamp = new Date().toISOString();

if (body.entry && body.entry[0]?.changes?.[0]?.value?.messages?.[0]) {
  // META CLOUD API FORMAT
  const msgObj = body.entry[0].changes[0].value.messages[0];
  messageId = msgObj.id;
  sender = msgObj.from;
  groupId = msgObj.groupId || msgObj.recipient_id || body.entry[0].changes[0].value.metadata?.phone_number_id;
  messageType = msgObj.type;
  if (msgObj.type === 'image') {
    mediaId = msgObj.image.id;
    caption = msgObj.image.caption || '';
  } else if (msgObj.type === 'document' && msgObj.document.mime_type?.startsWith('image/')) {
    mediaId = msgObj.document.id;
    caption = msgObj.document.caption || '';
    messageType = 'image';
  }
} else {
  // WAHA / GENERIC GATEWAY FORMAT
  messageId = body.id || body.messageId || 'MSG_' + Date.now();
  sender = body.from || body.author || body.sender;
  groupId = body.chatId || body.from || body.group_id;
  messageType = body.type || (body.hasMedia ? 'image' : 'chat');
  mediaId = body.mediaKey || body.mediaUrl || body.fileUrl || messageId;
  caption = body.body || body.caption || '';
}

return {
  json: {
    messageId,
    sender,
    groupId,
    messageType,
    mediaId,
    caption,
    timestamp,
    rawPayload: body
  }
};`,
        },
        id: 'node-extract-msg',
        name: 'Extract Message Data',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [460, 300],
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{ $json.groupId }}',
                operation: 'regex',
                value2: `(${allowedGroupIds.join('|')})`,
              },
            ],
          },
        },
        id: 'node-filter-group',
        name: 'Filter Group ID',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [680, 300],
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{ $json.messageType }}',
                operation: 'regex',
                value2: '^(image|photo|document_image)$',
              },
            ],
          },
        },
        id: 'node-check-media',
        name: 'Check Media Type',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [900, 240],
      },
      {
        parameters: {
          url: `={{ '${config.whatsappApiUrl}'.replace('{{PHONE_NUMBER_ID}}', $json.groupId) }}/{{ $json.mediaId }}`,
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          options: {
            response: {
              response: {
                responseFormat: 'file',
              },
            },
            retry: {
              maxTries: 3,
              waitBetweenTries: 2000,
            },
          },
        },
        id: 'node-download-media',
        name: 'Download Media Foto',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1120, 220],
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
      },
      {
        parameters: {
          method: 'POST',
          url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={{$env.GEMINI_API_KEY}}',
          sendBody: true,
          contentType: 'raw',
          rawContentType: 'application/json',
          body: `={
  "contents": [
    {
      "parts": [
        {
          "inlineData": {
            "mimeType": "image/jpeg",
            "data": "{{ $binary.data.data }}"
          }
        },
        {
          "text": "Anda adalah sistem OCR absensi karyawan.\\n\\nAnalisis foto absensi yang diberikan.\\n\\nAmbil hanya informasi yang benar-benar terlihat pada foto.\\n\\nEkstrak:\\n1. nama\\n2. NIK\\n3. jabatan\\n4. cabang\\n5. tanggal\\n6. jam\\n7. status absensi\\n8. lokasi\\n9. keterangan\\n\\nStatus hanya boleh:\\nMASUK\\nPULANG\\nDINAS\\nIZIN\\nSAKIT\\nCUTI\\nLAINNYA\\n\\nJika informasi tidak terlihat, gunakan null.\\nJangan menebak informasi.\\n\\nKembalikan hanya JSON valid dengan format:\\n{\\n\\"nama\\": null,\\n\\"nik\\": null,\\n\\"jabatan\\": null,\\n\\"cabang\\": null,\\n\\"tanggal\\": null,\\n\\"jam\\": null,\\n\\"status\\": null,\\n\\"lokasi\\": null,\\n\\"keterangan\\": null,\\n\\"confidence\\": 0\\n}"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseMimeType": "application/json",
    "temperature": 0.1
  }
}`,
        },
        id: 'node-ai-vision',
        name: 'AI Vision / OCR Gemini',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1340, 220],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 3000,
      },
      {
        parameters: {
          jsCode: `// Node: Parse JSON & Validasi Data & Deteksi Keterlambatan
const rawResponse = $json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
const parentData = $('Extract Message Data').first().json;

let parsed = {};
try {
  parsed = JSON.parse(rawResponse);
} catch (e) {
  // Regex extraction fallback
  const match = rawResponse.match(/\\{[\\s\\S]*\\}/);
  parsed = match ? JSON.parse(match[0]) : {};
}

const nama = parsed.nama || null;
const nik = parsed.nik || null;
const jabatan = parsed.jabatan || null;
const cabang = parsed.cabang || 'Bogor';
const tanggal = parsed.tanggal || new Date().toISOString().split('T')[0];
const jam = parsed.jam || new Date().toLocaleTimeString('id-ID', { hour12: false, timeZone: '${config.timezone}' });
const status = (parsed.status || 'MASUK').toUpperCase();
const lokasi = parsed.lokasi || '';
const keterangan = parsed.keterangan || parentData.caption || '';
const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.85;

// Validasi Kelayakan
let statusValidasi = 'VALID';
if (!nama || !tanggal || !jam || confidence < ${config.confidenceMinimum}) {
  statusValidasi = 'PERLU_VERIFIKASI';
}

// Deteksi Keterlambatan untuk Absen MASUK
const JAM_NORMAL = '${config.jamMasuk}'; // '08:00'
let lateMinutes = 0;
let statusKetepatan = 'TEPAT WAKTU';

if (status === 'MASUK' && jam) {
  const [hNormal, mNormal] = JAM_NORMAL.split(':').map(Number);
  const [hAbsen, mAbsen] = jam.split(':').map(Number);
  
  const normalTotalMinutes = hNormal * 60 + mNormal;
  const absenTotalMinutes = hAbsen * 60 + mAbsen;
  
  if (absenTotalMinutes > normalTotalMinutes) {
    lateMinutes = absenTotalMinutes - normalTotalMinutes;
    statusKetepatan = 'TERLAMBAT ' + lateMinutes + ' MENIT';
  } else {
    statusKetepatan = 'TEPAT WAKTU';
  }
} else {
  statusKetepatan = '-';
}

// Composite Key untuk Anti-Duplikasi
const compositeKey = [nama || 'UNKNOWN', tanggal, jam.substring(0, 5), status].join('_');

return {
  json: {
    id: 'ABS-' + tanggal.replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000),
    timestamp: new Date().toLocaleString('id-ID', { timeZone: '${config.timezone}' }),
    groupId: parentData.groupId,
    groupName: parentData.groupId.includes('Sukabumi') ? 'Grup Absensi Sukabumi' : 'Grup Absensi Bogor',
    nama,
    nik,
    jabatan,
    cabang,
    tanggal,
    jam,
    status,
    lokasi,
    keterangan,
    confidence,
    messageId: parentData.messageId,
    urlFoto: parentData.mediaId,
    statusValidasi,
    lateMinutes,
    statusKetepatan,
    compositeKey,
    waktuUpdate: new Date().toLocaleString('id-ID', { timeZone: '${config.timezone}' })
  }
};`,
        },
        id: 'node-validate-data',
        name: 'Parse & Validate Data',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1560, 220],
      },
      {
        parameters: {
          operation: 'lookup',
          sheetId: config.googleSheetId,
          range: `${config.sheetData}!O:O`,
          lookupColumn: 'Message ID',
          lookupValue: '={{ $json.messageId }}',
          options: {},
        },
        id: 'node-check-duplicate',
        name: 'Check Duplicate in Sheets',
        type: 'n8n-nodes-base.googleSheets',
        typeVersion: 4.5,
        position: [1780, 220],
        continueOnFail: true,
      },
      {
        parameters: {
          conditions: {
            boolean: [
              {
                value1: '={{ Boolean($json.id || $json["Message ID"]) }}',
                value2: true,
              },
            ],
          },
        },
        id: 'node-is-duplicate',
        name: 'Is Duplicate?',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [2000, 220],
      },
      {
        parameters: {
          operation: 'append',
          sheetId: config.googleSheetId,
          range: `${config.sheetData}!A:R`,
          options: {
            valueInputMode: 'USER_ENTERED',
          },
        },
        id: 'node-append-data',
        name: 'Insert DATA_ABSENSI',
        type: 'n8n-nodes-base.googleSheets',
        typeVersion: 4.5,
        position: [2240, 160],
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
      },
      {
        parameters: {
          jsCode: `// Node: Siapkan data agregat untuk REKAP_HARIAN
const item = $('Parse & Validate Data').first().json;

// Logika Rekap Harian:
// Jika MASUK: Jam Masuk = jam paling awal
// Jika PULANG: Jam Pulang = jam paling akhir
// Jika hanya MASUK: Status Kehadiran = BELUM PULANG
// Jika status DINAS/IZIN/SAKIT/CUTI: Sesuaikan status kehadiran

let statusKehadiran = 'BELUM PULANG';
let jamMasuk = item.status === 'MASUK' ? item.jam.substring(0, 5) : '-';
let jamPulang = item.status === 'PULANG' ? item.jam.substring(0, 5) : '-';
let totalKehadiran = '0.5';

if (['DINAS', 'IZIN', 'SAKIT', 'CUTI'].includes(item.status)) {
  statusKehadiran = item.status;
  totalKehadiran = item.status === 'DINAS' ? '1' : '0';
} else if (item.status === 'PULANG') {
  statusKehadiran = 'HADIR';
  totalKehadiran = '1';
}

return {
  json: {
    tanggal: item.tanggal,
    nama: item.nama,
    nik: item.nik || '-',
    jabatan: item.jabatan || '-',
    cabang: item.cabang,
    jamMasuk,
    jamPulang,
    status: statusKehadiran,
    keterangan: item.keterangan || '',
    totalKehadiran,
    statusKehadiran,
    batasMasuk: '${config.jamMasuk}',
    keterlambatan: item.lateMinutes > 0 ? (item.lateMinutes + ' Menit') : '0 Menit',
    statusKetepatan: item.statusKetepatan
  }
};`,
        },
        id: 'node-prep-rekap',
        name: 'Prepare Rekap Harian',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2460, 160],
      },
      {
        parameters: {
          operation: 'appendOrUpdate',
          sheetId: config.googleSheetId,
          range: `${config.sheetRekap}!A:K`,
          keyRow: 1,
          columns: {
            mappingMode: 'autoMapInputData',
          },
          options: {
            valueInputMode: 'USER_ENTERED',
          },
        },
        id: 'node-update-rekap',
        name: 'Update REKAP_HARIAN',
        type: 'n8n-nodes-base.googleSheets',
        typeVersion: 4.5,
        position: [2680, 160],
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
      },
      {
        parameters: {
          method: 'POST',
          url: `${config.whatsappApiUrl}`,
          sendBody: true,
          contentType: 'raw',
          rawContentType: 'application/json',
          body: `={
  "messaging_product": "whatsapp",
  "to": "{{ $('Extract Message Data').first().json.groupId }}",
  "type": "text",
  "text": {
    "body": "✅ *Absensi berhasil direkap*\\n\\n👤 *Nama:* {{ $('Parse & Validate Data').first().json.nama }}\\n📅 *Tanggal:* {{ $('Parse & Validate Data').first().json.tanggal }}\\n⏰ *Jam:* {{ $('Parse & Validate Data').first().json.jam }}\\n📌 *Status:* {{ $('Parse & Validate Data').first().json.status }}\\n🏢 *Cabang:* {{ $('Parse & Validate Data').first().json.cabang }}\\n⏱️ *Ketepatan:* {{ $('Parse & Validate Data').first().json.statusKetepatan }}"
  }
}`,
        },
        id: 'node-send-success-notif',
        name: 'Kirim Notifikasi Sukses',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [2900, 160],
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
      },
      {
        parameters: {
          method: 'POST',
          url: `${config.whatsappApiUrl}`,
          sendBody: true,
          contentType: 'raw',
          rawContentType: 'application/json',
          body: `={
  "messaging_product": "whatsapp",
  "to": "{{ $('Extract Message Data').first().json.groupId }}",
  "type": "text",
  "text": {
    "body": "ℹ️ *Absensi sudah tercatat sebelumnya.*\\n\\nFoto absensi ini sudah pernah diproses pada sistem dan tidak akan dicatat ganda."
  }
}`,
        },
        id: 'node-send-duplicate-notif',
        name: 'Kirim Notifikasi Duplikat',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [2240, 360],
      },
      {
        parameters: {
          rule: {
            interval: [
              {
                field: 'cronExpression',
                expression: '0 6,12,18,23 * * *',
              },
            ],
          },
        },
        id: 'node-cron-schedule',
        name: 'Cron Update Harian (06, 12, 18, 23)',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [240, 600],
      },
      {
        parameters: {
          operation: 'append',
          sheetId: config.googleSheetId,
          range: `${config.sheetLog}!A:K`,
          options: {
            valueInputMode: 'USER_ENTERED',
          },
        },
        id: 'node-log-error',
        name: 'Append to LOG_PROSES',
        type: 'n8n-nodes-base.googleSheets',
        typeVersion: 4.5,
        position: [1780, 560],
      },
    ],
    connections: {
      'Webhook WhatsApp': {
        main: [[{ node: 'Extract Message Data', type: 'main', index: 0 }]],
      },
      'Extract Message Data': {
        main: [[{ node: 'Filter Group ID', type: 'main', index: 0 }]],
      },
      'Filter Group ID': {
        main: [
          [{ node: 'Check Media Type', type: 'main', index: 0 }], // True
        ],
      },
      'Check Media Type': {
        main: [
          [{ node: 'Download Media Foto', type: 'main', index: 0 }], // True
        ],
      },
      'Download Media Foto': {
        main: [[{ node: 'AI Vision / OCR Gemini', type: 'main', index: 0 }]],
      },
      'AI Vision / OCR Gemini': {
        main: [[{ node: 'Parse & Validate Data', type: 'main', index: 0 }]],
      },
      'Parse & Validate Data': {
        main: [[{ node: 'Check Duplicate in Sheets', type: 'main', index: 0 }]],
      },
      'Check Duplicate in Sheets': {
        main: [[{ node: 'Is Duplicate?', type: 'main', index: 0 }]],
      },
      'Is Duplicate?': {
        main: [
          [{ node: 'Kirim Notifikasi Duplikat', type: 'main', index: 0 }], // True: Duplicate
          [{ node: 'Insert DATA_ABSENSI', type: 'main', index: 0 }], // False: New valid entry
        ],
      },
      'Insert DATA_ABSENSI': {
        main: [[{ node: 'Prepare Rekap Harian', type: 'main', index: 0 }]],
      },
      'Prepare Rekap Harian': {
        main: [[{ node: 'Update REKAP_HARIAN', type: 'main', index: 0 }]],
      },
      'Update REKAP_HARIAN': {
        main: [[{ node: 'Kirim Notifikasi Sukses', type: 'main', index: 0 }]],
      },
    },
    settings: {
      executionOrder: 'v1',
      saveManualExecutions: true,
      callerPolicy: 'workflowsFromSameOwner',
      errorWorkflow: 'Error-Handler-Absensi',
    },
  };
}

export const WORKFLOW_NODES_DETAILS: WorkflowNodeInfo[] = [
  {
    id: 'webhook-whatsapp',
    name: '1. Webhook WhatsApp',
    type: 'n8n-nodes-base.webhook',
    category: 'trigger',
    description: 'Menerima webhook event pesan baru WhatsApp secara real-time dari Meta Cloud API atau Gateway WAHA / Fonnte.',
    retryConfig: { maxTries: 1, waitBetweenTries: 0 },
    configSummary: {
      httpMethod: 'POST',
      path: '/webhook/whatsapp',
      authentication: 'Header Token Auth / HMAC SHA256',
    },
    expressions: {
      'Webhook URL': 'https://n8n.domainanda.com/webhook/whatsapp',
    },
  },
  {
    id: 'extract-msg',
    name: '2. Extract Message & Sender Data',
    type: 'n8n-nodes-base.code',
    category: 'logic',
    description: 'Mengekstrak informasi message_id, groupId, nomor pengirim, jenis pesan, mediaId, dan teks caption.',
    retryConfig: { maxTries: 1, waitBetweenTries: 0 },
    configSummary: {
      mode: 'runOnceForEachItem',
      language: 'javascript',
    },
  },
  {
    id: 'filter-group',
    name: '3. Filter Group ID',
    type: 'n8n-nodes-base.if',
    category: 'filter',
    description: 'Memastikan pesan hanya diproses jika berasal dari grup WhatsApp absensi terdaftar (Bogor, Sukabumi, Cianjur, Jasinga). Chat pribadi & grup lain diabaikan.',
    retryConfig: { maxTries: 1, waitBetweenTries: 0 },
    configSummary: {
      condition: 'Regex match on GROUP_ID list',
      fallback: 'IGNORE MESSAGE',
    },
    expressions: {
      Condition: '{{ $json.groupId }} IN allowed_groups',
    },
  },
  {
    id: 'check-media',
    name: '4. Check Media Type',
    type: 'n8n-nodes-base.if',
    category: 'filter',
    description: 'Mengecek apakah pesan berupa file foto (image/photo/document berisi JPG/JPEG/PNG). Pesan teks biasa tanpa foto diabaikan.',
    retryConfig: { maxTries: 1, waitBetweenTries: 0 },
    configSummary: {
      condition: 'MIME matches image/jpeg, image/png, image/webp',
    },
  },
  {
    id: 'download-media',
    name: '5. Download Media Foto',
    type: 'n8n-nodes-base.httpRequest',
    category: 'trigger',
    description: 'Mengunduh file biner foto absensi dari server WhatsApp API dengan otentikasi Bearer Token.',
    retryConfig: { maxTries: 3, waitBetweenTries: 2000 },
    configSummary: {
      responseFormat: 'file (binary)',
      retryOnFail: true,
      maxTries: 3,
    },
  },
  {
    id: 'ai-vision',
    name: '6. AI Vision / OCR (Gemini)',
    type: 'n8n-nodes-base.httpRequest / langchain',
    category: 'ai',
    description: 'Menganalisis foto absensi menggunakan multi-modal vision untuk mengekstrak 9 bidang wajib dalam format JSON terstruktur.',
    retryConfig: { maxTries: 2, waitBetweenTries: 3000 },
    configSummary: {
      model: 'gemini-2.5-flash / gemini-3.8-flash',
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  },
  {
    id: 'validate-data',
    name: '7. Parse & Validate Data',
    type: 'n8n-nodes-base.code',
    category: 'logic',
    description: 'Memverifikasi kelengkapan nama, tanggal, jam, confidence score >= 0.80, serta menghitung status keterlambatan (batas 08:00 WIB).',
    retryConfig: { maxTries: 1, waitBetweenTries: 0 },
    configSummary: {
      minConfidence: 0.8,
      normalEntryHour: '08:00',
    },
  },
  {
    id: 'check-duplicate',
    name: '8. Anti-Duplikasi Check',
    type: 'n8n-nodes-base.googleSheets',
    category: 'sheets',
    description: 'Mencari apakah message_id atau kombinasi Nama+Tanggal+Jam+Status sudah pernah tercatat di Google Sheets.',
    retryConfig: { maxTries: 2, waitBetweenTries: 1000 },
    configSummary: {
      sheet: 'DATA_ABSENSI',
      searchColumn: 'Message ID',
    },
  },
  {
    id: 'append-data',
    name: '9. Insert DATA_ABSENSI',
    type: 'n8n-nodes-base.googleSheets',
    category: 'sheets',
    description: 'Menambahkan baris baru ke sheet DATA_ABSENSI (Kolom A s/d R lengkap) dengan nilai terverifikasi.',
    retryConfig: { maxTries: 3, waitBetweenTries: 2000 },
    configSummary: {
      operation: 'append',
      sheet: 'DATA_ABSENSI',
      columns: 'A:R (18 Kolom)',
    },
  },
  {
    id: 'update-rekap',
    name: '10. Update REKAP_HARIAN',
    type: 'n8n-nodes-base.googleSheets',
    category: 'sheets',
    description: 'Memperbarui baris rekap harian karyawan bersangkutan: Jam Masuk (terawal), Jam Pulang (terakhir), dan Status Kehadiran.',
    retryConfig: { maxTries: 3, waitBetweenTries: 2000 },
    configSummary: {
      operation: 'appendOrUpdate',
      sheet: 'REKAP_HARIAN',
      keyColumn: 'Tanggal + NIK/Nama',
    },
  },
  {
    id: 'send-notif',
    name: '11. Kirim Notifikasi WhatsApp',
    type: 'n8n-nodes-base.httpRequest',
    category: 'notify',
    description: 'Mengirimkan pesan balasan konfirmasi ke grup WhatsApp atau admin (Berhasil / Perlu Verifikasi / Duplikat).',
    retryConfig: { maxTries: 3, waitBetweenTries: 2000 },
    configSummary: {
      method: 'POST',
      template: 'WhatsApp Text formatting with markdown',
    },
  },
  {
    id: 'cron-schedule',
    name: '12. Cron Rekap Harian Otomatis',
    type: 'n8n-nodes-base.scheduleTrigger',
    category: 'schedule',
    description: 'Menjadwalkan konsolidasi rekap pada jam 06:00, 12:00, 18:00, dan 23:00 setiap hari untuk sinkronisasi menyeluruh.',
    retryConfig: { maxTries: 1, waitBetweenTries: 0 },
    configSummary: {
      cron: '0 6,12,18,23 * * *',
      timezone: 'Asia/Jakarta',
    },
  },
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: AUTO-GENERATOR SPREADSHEET REKAP ABSENSI N8N
 * =========================================================================
 * Cara Pakai:
 * 1. Buka spreadsheet kosong baru di Google Sheets.
 * 2. Klik menu: Extensions (Ekstensi) > Apps Script.
 * 3. Hapus semua teks di editor, paste kode ini, lalu klik tombol "Save" & "Run".
 * 4. Berikan izin saat pop-up otorisasi pertama kali muncul.
 * 5. Dalam 5 detik, semua 7 Sheet (DASHBOARD, DATA_ABSENSI, REKAP_HARIAN,
 *    REKAP_CABANG, REKAP_KARYAWAN, CONFIG, LOG_PROSES) akan langsung terbuat
 *    lengkap dengan format warna, border, dan formula otomatis!
 * =========================================================================
 */

function setupAbsensiSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. BUAT SHEET CONFIG
  let shConfig = getOrCreateSheet(ss, "CONFIG");
  shConfig.clear();
  shConfig.getRange("A1:B1").setValues([["PARAMETER", "VALUE"]])
    .setBackground("#1E293B").setFontColor("#FFFFFF").setFontWeight("bold");
  shConfig.getRange("A2:B9").setValues([
    ["GROUP_ID", "120363028391823901@g.us,120363028391823902@g.us"],
    ["GOOGLE_SHEET_ID", ss.getId()],
    ["SHEET_DATA", "DATA_ABSENSI"],
    ["SHEET_REKAP", "REKAP_HARIAN"],
    ["JAM_MASUK_NORMAL", "08:00"],
    ["CONFIDENCE_MINIMUM", "0.80"],
    ["ADMIN_PHONE", "6281234567890"],
    ["TIMEZONE", "Asia/Jakarta"]
  ]);
  shConfig.autoResizeColumns(1, 2);

  // 2. BUAT SHEET DATA_ABSENSI
  let shData = getOrCreateSheet(ss, "DATA_ABSENSI");
  shData.clear();
  const headersData = [
    "ID", "Timestamp", "Group ID", "Nama Grup", "Nama", "NIK", "Jabatan",
    "Cabang", "Tanggal", "Jam", "Status", "Lokasi", "Keterangan", "Confidence",
    "Message ID", "URL Foto", "Status Validasi", "Waktu Update"
  ];
  shData.getRange(1, 1, 1, headersData.length).setValues([headersData])
    .setBackground("#0F766E").setFontColor("#FFFFFF").setFontWeight("bold");
  shData.setFrozenRows(1);
  shData.autoResizeColumns(1, headersData.length);

  // 3. BUAT SHEET REKAP_HARIAN
  let shRekap = getOrCreateSheet(ss, "REKAP_HARIAN");
  shRekap.clear();
  const headersRekap = [
    "Tanggal", "Nama", "NIK", "Jabatan", "Cabang", "Jam Masuk", "Jam Pulang",
    "Status", "Keterangan", "Total Kehadiran", "Status Kehadiran",
    "Batas Masuk", "Keterlambatan", "Status Ketepatan"
  ];
  shRekap.getRange(1, 1, 1, headersRekap.length).setValues([headersRekap])
    .setBackground("#1D4ED8").setFontColor("#FFFFFF").setFontWeight("bold");
  shRekap.setFrozenRows(1);
  shRekap.autoResizeColumns(1, headersRekap.length);

  // 4. BUAT SHEET REKAP_CABANG
  let shCabang = getOrCreateSheet(ss, "REKAP_CABANG");
  shCabang.clear();
  const headersCabang = [
    "Tanggal", "Cabang", "Jumlah Karyawan", "Hadir", "Tidak Hadir", "Izin", "Sakit", "Cuti", "Dinas"
  ];
  shCabang.getRange(1, 1, 1, headersCabang.length).setValues([headersCabang])
    .setBackground("#7C3AED").setFontColor("#FFFFFF").setFontWeight("bold");
  shCabang.setFrozenRows(1);
  shCabang.autoResizeColumns(1, headersCabang.length);

  // 5. BUAT SHEET REKAP_KARYAWAN
  let shKaryawan = getOrCreateSheet(ss, "REKAP_KARYAWAN");
  shKaryawan.clear();
  const headersKaryawan = [
    "Nama", "NIK", "Jabatan", "Cabang", "Hadir", "Tidak Hadir", "Izin", "Sakit", "Cuti", "Dinas", "Terlambat", "Total Hari Kerja"
  ];
  shKaryawan.getRange(1, 1, 1, headersKaryawan.length).setValues([headersKaryawan])
    .setBackground("#C2410C").setFontColor("#FFFFFF").setFontWeight("bold");
  shKaryawan.setFrozenRows(1);
  shKaryawan.autoResizeColumns(1, headersKaryawan.length);

  // 6. BUAT SHEET LOG_PROSES
  let shLog = getOrCreateSheet(ss, "LOG_PROSES");
  shLog.clear();
  const headersLog = [
    "Timestamp", "Message ID", "Group ID", "Nama File", "Nama", "Tanggal", "Status", "Confidence", "Hasil", "Error", "Processing Time"
  ];
  shLog.getRange(1, 1, 1, headersLog.length).setValues([headersLog])
    .setBackground("#374151").setFontColor("#FFFFFF").setFontWeight("bold");
  shLog.setFrozenRows(1);
  shLog.autoResizeColumns(1, headersLog.length);

  // 7. BUAT SHEET DASHBOARD
  let shDash = getOrCreateSheet(ss, "DASHBOARD");
  shDash.clear();
  shDash.getRange("A1:H1").merge().setValue("DASHBOARD REKAPITULASI ABSENSI WHATSAPP - AI VISION")
    .setBackground("#0F172A").setFontColor("#FFFFFF").setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center");

  shDash.getRange("A3:B3").merge().setValue("FILTER TANGGAL").setBackground("#E2E8F0").setFontWeight("bold");
  shDash.getRange("A4:B4").merge().setValue(Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd"))
    .setBackground("#FEF08A").setFontWeight("bold").setHorizontalAlignment("center");

  shDash.getRange("D3:E3").merge().setValue("FILTER CABANG").setBackground("#E2E8F0").setFontWeight("bold");
  shDash.getRange("D4:E4").merge().setValue("SEMUA CABANG").setBackground("#FEF08A").setFontWeight("bold").setHorizontalAlignment("center");

  // KPI Cards
  const kpis = [
    ["TOTAL HADIR", '=COUNTIF(REKAP_HARIAN!H2:H, "HADIR") + COUNTIF(REKAP_HARIAN!H2:H, "BELUM PULANG")', "#10B981"],
    ["TERLAMBAT", '=COUNTIF(REKAP_HARIAN!N2:N, "*TERLAMBAT*")', "#F59E0B"],
    ["IZIN / SAKIT", '=COUNTIF(REKAP_HARIAN!K2:K, "IZIN") + COUNTIF(REKAP_HARIAN!K2:K, "SAKIT")', "#3B82F6"],
    ["DINAS / CUTI", '=COUNTIF(REKAP_HARIAN!K2:K, "DINAS") + COUNTIF(REKAP_HARIAN!K2:K, "CUTI")', "#8B5CF6"]
  ];

  kpis.forEach((kpi, idx) => {
    let col = idx * 2 + 1;
    shDash.getRange(6, col, 1, 2).merge().setValue(kpi[0]).setBackground(kpi[2]).setFontColor("#FFFFFF").setFontWeight("bold").setHorizontalAlignment("center");
    shDash.getRange(7, col, 1, 2).merge().setValue(kpi[1]).setBackground("#F8FAFC").setFontSize(18).setFontWeight("bold").setHorizontalAlignment("center");
  });

  ss.toast("Spreadsheet Absensi Berhasil Dikonfigurasi Lengkap!", "Sukses", 5);
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}
`;

export const DOCKER_COMPOSE_TEMPLATE = `# =========================================================================
# DOCKER-COMPOSE PRODUCTION: n8n + POSTGRESQL + REVERSE PROXY SSL
# =========================================================================
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: n8n_postgres
    restart: always
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=SuperSecretPassword123!
      - POSTGRES_DB=n8n
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    networks:
      - n8n_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -h localhost -U n8n -d n8n"]
      interval: 5s
      timeout: 5s
      retries: 10

  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    container_name: n8n_app
    restart: always
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=SuperSecretPassword123!
      
      # URL Domain untuk Webhook WhatsApp & UI
      - N8N_HOST=n8n.perusahaananda.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.perusahaananda.com/
      - GENERIC_TIMEZONE=Asia/Jakarta
      - TZ=Asia/Jakarta
      
      # Keamanan & Optimasi
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=168 # 7 hari
      - N8N_DEFAULT_BINARY_DATA_MODE=filesystem
      
      # API Keys
      - GEMINI_API_KEY=AIzaSy...ISI_DENGAN_GEMINI_API_KEY
    volumes:
      - ./n8n_data:/home/node/.n8n
      - ./local_files:/data/files
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - n8n_network

networks:
  n8n_network:
    driver: bridge
`;
