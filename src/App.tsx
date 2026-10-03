import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sheet,
  Workflow,
  Settings,
  BookOpen,
  FlaskConical,
  FileSpreadsheet,
  CheckCircle2,
  QrCode,
  Users,
} from 'lucide-react';
import { Header } from './components/Header';
import { SimulatorLab } from './components/SimulatorLab';
import { GoogleSheetsViewer } from './components/GoogleSheetsViewer';
import { WorkflowVisualizer } from './components/WorkflowVisualizer';
import { Configurator } from './components/Configurator';
import { DeploymentGuide } from './components/DeploymentGuide';
import { AppsScriptModal } from './components/AppsScriptModal';
import { CsvExportModal } from './components/CsvExportModal';
import { WhatsAppQrScanner } from './components/WhatsAppQrScanner';
import { EmployeeDatabaseManager } from './components/EmployeeDatabaseManager';
import {
  auth,
  db,
  loginWithGoogle,
  logoutFirebase,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
} from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';

import {
  DEFAULT_CONFIG,
  INITIAL_ATTENDANCE_DATA,
  INITIAL_DAILY_RECAP,
  INITIAL_BRANCH_RECAP,
  INITIAL_EMPLOYEE_RECAP,
  INITIAL_LOG_DATA,
  INITIAL_EMPLOYEE_MASTER,
} from './data/initialData';
import {
  AttendanceRecord,
  DailyRecapItem,
  BranchRecapItem,
  ProcessLogItem,
  SystemConfig,
  EmployeeMaster,
} from './types/attendance';
import { generateN8nWorkflow } from './data/n8nWorkflowTemplate';

type MainTab = 'simulator' | 'whatsapp_qr' | 'employees' | 'sheets' | 'visualizer' | 'config' | 'guide';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('simulator');
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Live state for attendance data
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_DATA);
  const [dailyRecap, setDailyRecap] = useState<DailyRecapItem[]>(INITIAL_DAILY_RECAP);
  const [branchRecap, setBranchRecap] = useState<BranchRecapItem[]>(INITIAL_BRANCH_RECAP);
  const [employeeRecap, setEmployeeRecap] = useState(INITIAL_EMPLOYEE_RECAP);
  const [logData, setLogData] = useState<ProcessLogItem[]>(INITIAL_LOG_DATA);

  // Live state for employee master database
  const [employees, setEmployees] = useState<EmployeeMaster[]>(INITIAL_EMPLOYEE_MASTER);

  // Modal and toast states
  const [isAppsScriptOpen, setIsAppsScriptOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Test connection on boot and listen to Auth
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        showToast(`Selamat datang, ${user.displayName || user.email}!`);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore attendance and employees collection if authenticated
  useEffect(() => {
    if (!currentUser) return;

    const path = 'attendance';
    const unsubAttendance = onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const records: AttendanceRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as AttendanceRecord;
            records.push(data);
          });
          setAttendanceData((prev) => {
            const existingIds = new Set(records.map((r) => r.id));
            const remaining = prev.filter((p) => !existingIds.has(p.id));
            return [...records, ...remaining];
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    // Listen to employees collection
    const unsubEmployees = onSnapshot(
      collection(db, 'employees'),
      (snapshot) => {
        if (!snapshot.empty) {
          const empList: EmployeeMaster[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as EmployeeMaster;
            empList.push(data);
          });
          setEmployees((prev) => {
            const map = new Map(prev.map((e) => [e.nip, e]));
            empList.forEach((e) => map.set(e.nip, e));
            return Array.from(map.values());
          });
        }
      },
      (error) => {
        console.warn('Employees listener:', error);
      }
    );

    return () => {
      unsubAttendance();
      unsubEmployees();
    };
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      showToast('Berhasil masuk dengan akun Google!');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal login: ' + (err.message || 'Error otentikasi'));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
      showToast('Berhasil keluar / sign out.');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Employee Master Handlers
  const handleSaveEmployee = (emp: EmployeeMaster) => {
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === emp.id || e.nip === emp.nip);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = emp;
        return copy;
      }
      return [emp, ...prev];
    });
    if (currentUser) {
      setDoc(doc(db, 'employees', emp.id), emp).catch(console.error);
    }
    showToast(`Data karyawan ${emp.nama} (${emp.kantorCabang}) berhasil disimpan!`);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast('Data karyawan berhasil dihapus.');
  };

  const handleBatchUploadEmployees = (newBatch: EmployeeMaster[]) => {
    setEmployees((prev) => {
      const map = new Map(prev.map((e) => [e.nip, e]));
      newBatch.forEach((item) => map.set(item.nip, item));
      return Array.from(map.values());
    });
    if (currentUser) {
      newBatch.forEach((emp) => {
        setDoc(doc(db, 'employees', emp.id), emp).catch(console.error);
      });
    }
    showToast(`Berhasil upload ${newBatch.length} database karyawan!`);
  };

  // Add attendance record from Simulator to live state
  const handleAddAttendanceRecord = (newRecord: AttendanceRecord) => {
    // 1. Insert into DATA_ABSENSI
    setAttendanceData((prev) => [newRecord, ...prev]);

    // 2. Update REKAP_HARIAN
    setDailyRecap((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.nama.toLowerCase() === newRecord.nama.toLowerCase() && r.tanggal === newRecord.tanggal
      );

      let jamMasuk = newRecord.status === 'MASUK' ? newRecord.jam.substring(0, 5) : '-';
      let jamPulang = newRecord.status === 'PULANG' ? newRecord.jam.substring(0, 5) : '-';
      let statusKehadiran = newRecord.status === 'PULANG' ? 'HADIR' : 'BELUM PULANG';

      if (['DINAS', 'IZIN', 'SAKIT', 'CUTI'].includes(newRecord.status)) {
        statusKehadiran = newRecord.status;
      }

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        if (newRecord.status === 'MASUK') {
          jamMasuk = existing.jamMasuk !== '-' ? existing.jamMasuk : jamMasuk;
        } else if (newRecord.status === 'PULANG') {
          jamPulang = newRecord.jam.substring(0, 5);
          statusKehadiran = 'HADIR';
        }

        const updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          jamMasuk: existing.jamMasuk !== '-' ? existing.jamMasuk : jamMasuk,
          jamPulang,
          status: statusKehadiran,
          statusKehadiran,
          keterangan: newRecord.keterangan || existing.keterangan,
          statusKetepatan: existing.statusKetepatan || newRecord.statusKetepatan || 'TEPAT WAKTU',
        };
        return updated;
      } else {
        const newItem: DailyRecapItem = {
          tanggal: newRecord.tanggal,
          nama: newRecord.nama,
          nik: newRecord.nik,
          jabatan: newRecord.jabatan,
          cabang: newRecord.cabang,
          jamMasuk,
          jamPulang,
          status: statusKehadiran,
          keterangan: newRecord.keterangan,
          totalKehadiran: newRecord.status === 'PULANG' || newRecord.status === 'DINAS' ? '1' : '0.5',
          statusKehadiran,
          batasMasuk: config.jamMasuk,
          keterlambatan: newRecord.lateMinutes ? `${newRecord.lateMinutes} Menit` : '0 Menit',
          statusKetepatan: newRecord.statusKetepatan || 'TEPAT WAKTU',
        };
        return [newItem, ...prev];
      }
    });

    // 3. Update REKAP_CABANG
    setBranchRecap((prev) =>
      prev.map((b) => {
        if (b.cabang.toLowerCase() === newRecord.cabang.toLowerCase()) {
          const isHadir = newRecord.status === 'MASUK' || newRecord.status === 'PULANG';
          const isSakit = newRecord.status === 'SAKIT';
          const isIzin = newRecord.status === 'IZIN';
          const isCuti = newRecord.status === 'CUTI';
          const isDinas = newRecord.status === 'DINAS';

          return {
            ...b,
            hadir: isHadir ? b.hadir + 1 : b.hadir,
            sakit: isSakit ? b.sakit + 1 : b.sakit,
            izin: isIzin ? b.izin + 1 : b.izin,
            cuti: isCuti ? b.cuti + 1 : b.cuti,
            dinas: isDinas ? b.dinas + 1 : b.dinas,
          };
        }
        return b;
      })
    );

    // 4. Append to LOG_PROSES
    const newLog: ProcessLogItem = {
      timestamp: newRecord.timestamp,
      messageId: newRecord.messageId,
      groupId: newRecord.groupId,
      namaFile: `IMG_${Date.now()}.jpg`,
      nama: newRecord.nama,
      tanggal: newRecord.tanggal,
      status: newRecord.status,
      confidence: newRecord.confidence,
      hasil: newRecord.statusValidasi === 'VALID' ? 'SUCCESS' : 'WARNING',
      error: newRecord.statusValidasi === 'VALID' ? '-' : 'Perlu verifikasi manual',
      processingTime: '820ms',
    };
    setLogData((prev) => [newLog, ...prev]);

    // 5. Persist to Firestore if online/authenticated
    if (currentUser) {
      const recordPath = `attendance/${newRecord.id}`;
      setDoc(doc(db, 'attendance', newRecord.id), {
        ...newRecord,
        userId: currentUser.uid,
      }).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, recordPath);
      });
    }

    showToast(`Data absensi ${newRecord.nama} berhasil direkap ke Google Sheets & Firestore!`);
  };

  // Download Workflow JSON file
  const handleDownloadWorkflow = () => {
    const workflowObj = generateN8nWorkflow(config);
    const jsonStr = JSON.stringify(workflowObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'whatsapp-absensi-ai-workflow.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Workflow JSON berhasil diunduh! Siap di-import ke n8n.');
  };

  // Copy Workflow JSON to Clipboard
  const handleCopyWorkflow = () => {
    const workflowObj = generateN8nWorkflow(config);
    navigator.clipboard.writeText(JSON.stringify(workflowObj, null, 2));
    setCopiedWorkflow(true);
    showToast('Workflow JSON tersalin ke clipboard! Buka n8n dan tekan Ctrl+V.');
    setTimeout(() => setCopiedWorkflow(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Main Navigation Header */}
      <Header
        onDownloadWorkflow={handleDownloadWorkflow}
        onCopyWorkflow={handleCopyWorkflow}
        onOpenAppsScript={() => setIsAppsScriptOpen(true)}
        onOpenCsvExport={() => setIsCsvModalOpen(true)}
        copied={copiedWorkflow}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Main Navigation Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
            {[
              { id: 'simulator', label: '🧪 Simulator & OCR Lab', icon: FlaskConical },
              { id: 'whatsapp_qr', label: '📱 Scan Barcode WhatsApp & Auto-Tag', icon: QrCode },
              { id: 'employees', label: '👥 Database Karyawan', icon: Users },
              { id: 'sheets', label: '📊 Google Sheets Hub (7 Sheet)', icon: FileSpreadsheet },
              { id: 'visualizer', label: '🔄 Workflow n8n (16 Node)', icon: Workflow },
              { id: 'config', label: '⚙️ Configurator & JSON', icon: Settings },
              { id: 'guide', label: '📖 Panduan Deployment & VPS', icon: BookOpen },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as MainTab)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-500'
                    }`}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-medium animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'simulator' && (
          <SimulatorLab
            config={config}
            attendanceData={attendanceData}
            employees={employees}
            onAddAttendanceRecord={handleAddAttendanceRecord}
            onViewSheetsTab={() => setActiveTab('sheets')}
          />
        )}

        {activeTab === 'whatsapp_qr' && (
          <WhatsAppQrScanner
            config={config}
            onAddAttendanceRecord={handleAddAttendanceRecord}
            onViewSheetsTab={() => setActiveTab('sheets')}
            onViewSimulatorTab={() => setActiveTab('simulator')}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeDatabaseManager
            employees={employees}
            onSaveEmployee={handleSaveEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onBatchUpload={handleBatchUploadEmployees}
            branchList={config.groupIds.map((g) => g.name.replace('Grup Absensi ', ''))}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsViewer
            config={config}
            attendanceData={attendanceData}
            dailyRecap={dailyRecap}
            branchRecap={branchRecap}
            employeeRecap={employeeRecap}
            logData={logData}
            onOpenAppsScript={() => setIsAppsScriptOpen(true)}
          />
        )}

        {activeTab === 'visualizer' && (
          <WorkflowVisualizer
            config={config}
            onOpenAppsScript={() => setIsAppsScriptOpen(true)}
            onDownloadWorkflow={handleDownloadWorkflow}
          />
        )}

        {activeTab === 'config' && (
          <Configurator
            config={config}
            onUpdateConfig={setConfig}
            onDownloadWorkflow={handleDownloadWorkflow}
            onCopyWorkflow={handleCopyWorkflow}
            copied={copiedWorkflow}
          />
        )}

        {activeTab === 'guide' && <DeploymentGuide />}
      </main>

      {/* Apps Script 1-Click Generator Modal */}
      <AppsScriptModal
        isOpen={isAppsScriptOpen}
        onClose={() => setIsAppsScriptOpen(false)}
      />

      {/* CSV Multi-Sheet Export Modal */}
      <CsvExportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        activeSheet="DATA_ABSENSI"
        config={config}
        attendanceData={attendanceData}
        dailyRecap={dailyRecap}
        branchRecap={branchRecap}
        employeeRecap={employeeRecap}
        logData={logData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Sistem Rekap Absensi Otomatis WhatsApp Group → AI Vision OCR → Google Sheets (n8n v1.x+)
          </div>
          <div className="flex items-center gap-3">
            <span>Zona Waktu: Asia/Jakarta (WIB)</span>
            <span>•</span>
            <span>Batas Masuk: {config.jamMasuk} WIB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
