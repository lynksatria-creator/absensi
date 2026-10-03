import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Phone,
  Building,
  Briefcase,
  FileSpreadsheet,
  X,
  Check,
  Save,
  AlertCircle,
  FileUp,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { EmployeeMaster } from '../types/attendance';

interface EmployeeDatabaseManagerProps {
  employees: EmployeeMaster[];
  onSaveEmployee: (employee: EmployeeMaster) => void;
  onDeleteEmployee: (id: string) => void;
  onBatchUpload: (newEmployees: EmployeeMaster[]) => void;
  branchList: string[];
}

export const EmployeeDatabaseManager: React.FC<EmployeeDatabaseManagerProps> = ({
  employees,
  onSaveEmployee,
  onDeleteEmployee,
  onBatchUpload,
  branchList,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCabang, setFilterCabang] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeMaster | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<EmployeeMaster>>({
    nip: '',
    nama: '',
    noHp: '',
    jabatan: 'Sales Promotor',
    kantorCabang: 'Bogor',
    statusAktif: 'Aktif',
    email: '',
  });

  // Batch CSV Parse State
  const [parsedBatch, setParsedBatch] = useState<EmployeeMaster[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nip.includes(searchQuery) ||
      emp.noHp.includes(searchQuery) ||
      emp.jabatan.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCabang = filterCabang === 'ALL' || emp.kantorCabang === filterCabang;
    const matchesStatus = filterStatus === 'ALL' || emp.statusAktif === filterStatus;

    return matchesSearch && matchesCabang && matchesStatus;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setCurrentEmployee(null);
    setFormData({
      id: `EMP-${Date.now().toString().slice(-4)}`,
      nip: '',
      nama: '',
      noHp: '628',
      jabatan: 'Sales Promotor',
      kantorCabang: branchList[0] || 'Bogor',
      statusAktif: 'Aktif',
      email: '',
    });
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (emp: EmployeeMaster) => {
    setCurrentEmployee(emp);
    setFormData({ ...emp });
    setIsEditModalOpen(true);
  };

  // Save Employee Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nip || !formData.noHp || !formData.jabatan || !formData.kantorCabang) {
      alert('Mohon lengkapi Nama, NIP, No HP, Jabatan, dan Kantor Cabang.');
      return;
    }

    const employeeToSave: EmployeeMaster = {
      id: currentEmployee ? currentEmployee.id : `EMP-${Date.now().toString().slice(-4)}`,
      nip: formData.nip.trim(),
      nama: formData.nama.trim(),
      noHp: formData.noHp.trim().replace(/^0/, '62'),
      jabatan: formData.jabatan.trim(),
      kantorCabang: formData.kantorCabang.trim(),
      statusAktif: formData.statusAktif || 'Aktif',
      email: formData.email?.trim() || '',
      updatedAt: new Date().toLocaleString('id-ID'),
    };

    onSaveEmployee(employeeToSave);
    setIsEditModalOpen(false);
  };

  // Download Sample or Blank CSV Template
  const handleDownloadTemplate = (mode: 'blank' | 'sample' = 'sample') => {
    let csvContent = '\uFEFFNIP,Nama,No_HP,Jabatan,Kantor_Cabang,Status_Aktif,Email\r\n';

    if (mode === 'blank') {
      csvContent += '123456,Contoh Nama Karyawan,628129101011,Sales Promotor,Bogor,Aktif,karyawan@perusahaan.com\r\n';
    } else {
      csvContent +=
        '123456,Budi Santoso,628129101011,Sales Promotor,Bogor,Aktif,budi.santoso@perusahaan.com\r\n' +
        '123457,Siti Rahma,628129101012,Promotor Handphone,Sukabumi,Aktif,siti.rahma@perusahaan.com\r\n' +
        '123458,Ahmad Dani,628129101013,Field Coordinator,Cianjur,Aktif,ahmad.dani@perusahaan.com\r\n' +
        '123459,Dewi Lestari,628129101014,Promotor Handphone,Jasinga,Aktif,dewi.lestari@perusahaan.com\r\n' +
        '123460,Rian Pratama,628129101015,Sales Promotor,Bogor,Aktif,rian.pratama@perusahaan.com\r\n' +
        '123461,Maya Putri,628129101016,Kasir & Admin Toko,Sukabumi,Aktif,maya.putri@perusahaan.com\r\n' +
        '123462,Hendra Setiawan,628129101017,Store Supervisor,Cianjur,Aktif,hendra.setiawan@perusahaan.com\r\n' +
        '123463,Nina Safitri,628129101018,Sales Promotor,Jasinga,Aktif,nina.safitri@perusahaan.com\r\n' +
        '123464,Fajar Nugraha,628129101019,Promotor Elektronik,Bogor,Aktif,fajar.nugraha@perusahaan.com\r\n' +
        '123465,Anisa Wijaya,628129101020,Customer Care,Sukabumi,Aktif,anisa.wijaya@perusahaan.com\r\n' +
        '123466,Rizky Ramadhan,628129101021,Logistik Cabang,Cianjur,Aktif,rizky.ramadhan@perusahaan.com\r\n' +
        '123467,Yuliana Salim,628129101022,Sales Promotor,Jasinga,Aktif,yuliana.salim@perusahaan.com\r\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download =
      mode === 'blank' ? 'template_kosong_database_karyawan.csv' : 'template_contoh_database_karyawan.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Instant Load Sample Template Data (1-Click Demo)
  const handleLoadDemoTemplate = () => {
    const demoEmployees: EmployeeMaster[] = [
      {
        id: `EMP-${Date.now().toString().slice(-4)}-1`,
        nip: '123456',
        nama: 'Budi Santoso',
        noHp: '628129101011',
        jabatan: 'Sales Promotor',
        kantorCabang: 'Bogor',
        statusAktif: 'Aktif',
        email: 'budi.santoso@perusahaan.com',
        updatedAt: new Date().toLocaleString('id-ID'),
      },
      {
        id: `EMP-${Date.now().toString().slice(-4)}-2`,
        nip: '123457',
        nama: 'Siti Rahma',
        noHp: '628129101012',
        jabatan: 'Promotor Handphone',
        kantorCabang: 'Sukabumi',
        statusAktif: 'Aktif',
        email: 'siti.rahma@perusahaan.com',
        updatedAt: new Date().toLocaleString('id-ID'),
      },
      {
        id: `EMP-${Date.now().toString().slice(-4)}-3`,
        nip: '123458',
        nama: 'Ahmad Dani',
        noHp: '628129101013',
        jabatan: 'Field Coordinator',
        kantorCabang: 'Cianjur',
        statusAktif: 'Aktif',
        email: 'ahmad.dani@perusahaan.com',
        updatedAt: new Date().toLocaleString('id-ID'),
      },
      {
        id: `EMP-${Date.now().toString().slice(-4)}-4`,
        nip: '123459',
        nama: 'Dewi Lestari',
        noHp: '628129101014',
        jabatan: 'Promotor Handphone',
        kantorCabang: 'Jasinga',
        statusAktif: 'Aktif',
        email: 'dewi.lestari@perusahaan.com',
        updatedAt: new Date().toLocaleString('id-ID'),
      },
      {
        id: `EMP-${Date.now().toString().slice(-4)}-5`,
        nip: '123460',
        nama: 'Rian Pratama',
        noHp: '628129101015',
        jabatan: 'Sales Promotor',
        kantorCabang: 'Bogor',
        statusAktif: 'Aktif',
        email: 'rian.pratama@perusahaan.com',
        updatedAt: new Date().toLocaleString('id-ID'),
      },
      {
        id: `EMP-${Date.now().toString().slice(-4)}-6`,
        nip: '123461',
        nama: 'Maya Putri',
        noHp: '628129101016',
        jabatan: 'Kasir & Admin Toko',
        kantorCabang: 'Sukabumi',
        statusAktif: 'Aktif',
        email: 'maya.putri@perusahaan.com',
        updatedAt: new Date().toLocaleString('id-ID'),
      },
      {
        id: `EMP-${Date.now().toString().slice(-4)}-7`,
        nip: '123462',
        nama: 'Hendra Setiawan',
        noHp: '628129101017',
        jabatan: 'Store Supervisor',
        kantorCabang: 'Cianjur',
        statusAktif: 'Aktif',
        email: 'hendra.setiawan@perusahaan.com',
        updatedAt: new Date().toLocaleString('id-ID'),
      },
      {
        id: `EMP-${Date.now().toString().slice(-4)}-8`,
        nip: '123463',
        nama: 'Nina Safitri',
        noHp: '628129101018',
        jabatan: 'Sales Promotor',
        kantorCabang: 'Jasinga',
        statusAktif: 'Aktif',
        email: 'nina.safitri@perusahaan.com',
        updatedAt: new Date().toLocaleString('id-ID'),
      },
    ];

    setParsedBatch(demoEmployees);
    setUploadError(null);
  };

  // Handle CSV File Upload Parse
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setUploadError('File CSV kosong atau hanya memiliki baris header.');
          return;
        }

        const delimiter = lines[0].includes(';') ? ';' : ',';
        const parsed: EmployeeMaster[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(delimiter).map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 5) {
            parsed.push({
              id: `EMP-${Date.now().toString().slice(-4)}-${i}`,
              nip: cols[0] || `1000${i}`,
              nama: cols[1] || `Karyawan ${i}`,
              noHp: (cols[2] || '').replace(/^0/, '62'),
              jabatan: cols[3] || 'Staff Toko',
              kantorCabang: cols[4] || 'Bogor',
              statusAktif: cols[5]?.toLowerCase() === 'nonaktif' ? 'Nonaktif' : 'Aktif',
              email: cols[6] || '',
              updatedAt: new Date().toLocaleString('id-ID'),
            });
          }
        }

        if (parsed.length === 0) {
          setUploadError('Tidak ada baris data yang valid ditemukan.');
        } else {
          setParsedBatch(parsed);
          setUploadError(null);
        }
      } catch (err: any) {
        setUploadError('Gagal membaca file CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Confirm Batch Upload
  const handleConfirmBatchUpload = () => {
    if (parsedBatch.length > 0) {
      onBatchUpload(parsedBatch);
      setParsedBatch([]);
      setIsUploadModalOpen(false);
    }
  };

  // Export current list to CSV
  const handleExportEmployeesCsv = () => {
    const headers = ['NIP', 'Nama', 'No_HP', 'Jabatan', 'Kantor_Cabang', 'Status_Aktif', 'Email', 'Terakhir_Diubah'];
    const rows = filteredEmployees.map((e) => [
      e.nip,
      `"${e.nama.replace(/"/g, '""')}"`,
      e.noHp,
      `"${e.jabatan.replace(/"/g, '""')}"`,
      e.kantorCabang,
      e.statusAktif,
      e.email || '',
      e.updatedAt || '',
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `database_karyawan_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold">
                Master Database Karyawan &amp; Kantor Cabang
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Kelola data karyawan (Nama, NIP/NIK, No HP WhatsApp, Jabatan, dan Kantor Cabang).
              Data ini dapat diedit kapan saja atau di-upload massal via CSV untuk pencocokan otomatis
              saat karyawan mengirim foto absensi ke grup WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download Template Buttons */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/20">
              <button
                onClick={() => handleDownloadTemplate('sample')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Unduh file template CSV dengan 12 baris contoh data karyawan 4 cabang"
              >
                <Download className="w-3.5 h-3.5 text-teal-300" />
                <span>Download Template (.CSV)</span>
              </button>
              <button
                onClick={() => handleDownloadTemplate('blank')}
                className="px-2 py-1.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/20 rounded-lg border-l border-white/10 transition-colors"
                title="Unduh template CSV kosong hanya dengan 1 baris panduan"
              >
                Kosong
              </button>
            </div>

            {/* Upload Template Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors shadow-md shadow-indigo-600/30"
              title="Upload file template CSV karyawan ke database"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Template (.CSV)</span>
            </button>

            {/* Tambah Karyawan Manual */}
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors shadow-md shadow-emerald-600/25"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Karyawan</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Total Karyawan</span>
            <span className="text-xl font-bold text-white">{employees.length} Orang</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Karyawan Aktif</span>
            <span className="text-xl font-bold text-emerald-400">
              {employees.filter((e) => e.statusAktif === 'Aktif').length} Orang
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Kantor Cabang / Store</span>
            <span className="text-xl font-bold text-teal-400">{branchList.length} Cabang</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">WhatsApp Match Rate</span>
            <span className="text-xl font-bold text-indigo-400">100% Terhubung</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari Nama, NIP, No HP, atau Jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Cabang */}
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCabang}
              onChange={(e) => setFilterCabang(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="ALL">Semua Cabang ({employees.length})</option>
              {branchList.map((branch) => (
                <option key={branch} value={branch}>
                  Cabang {branch}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="Aktif">Status: Aktif</option>
              <option value="Nonaktif">Status: Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportEmployeesCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Download database karyawan ke format CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">NIP / NIK</th>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">No. WhatsApp / HP</th>
                <th className="p-3">Jabatan</th>
                <th className="p-3">Kantor Cabang</th>
                <th className="p-3">Status</th>
                <th className="p-3">Terakhir Diubah</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada data karyawan yang cocok dengan pencarian atau filter Anda.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{emp.nip}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{emp.nama}</div>
                      {emp.email && <div className="text-[10px] text-slate-400">{emp.email}</div>}
                    </td>
                    <td className="p-3 font-mono">
                      <a
                        href={`https://wa.me/${emp.noHp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold"
                        title="Klik untuk membuka WhatsApp Web chat"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>+{emp.noHp}</span>
                      </a>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium">
                        <Briefcase className="w-3 h-3 text-slate-500" />
                        <span>{emp.jabatan}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold border border-blue-200">
                        <Building className="w-3 h-3 text-blue-600" />
                        <span>{emp.kantorCabang}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.statusAktif === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {emp.statusAktif}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px] font-mono">
                      {emp.updatedAt || '2026-10-03'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Ubah data karyawan ini"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Yakin ingin menghapus data karyawan ${emp.nama}?`)) {
                              onDeleteEmployee(emp.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus data karyawan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: EDIT / TAMBAH KARYAWAN */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">
                  {currentEmployee ? 'Ubah Data Karyawan' : 'Tambah Karyawan Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nama Lengkap Karyawan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    NIP / NIK Karyawan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="Contoh: 123456"
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    No. WhatsApp / HP *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    placeholder="Contoh: 628129101011"
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Gunakan format 628...
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Jabatan / Posisi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Contoh: Sales Promotor"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kantor Cabang / Store *
                  </label>
                  <select
                    value={formData.kantorCabang}
                    onChange={(e) => setFormData({ ...formData, kantorCabang: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-medium"
                  >
                    {branchList.map((branch) => (
                      <option key={branch} value={branch}>
                        Cabang {branch}
                      </option>
                    ))}
                    <option value="Lainnya">Lainnya / Store Baru</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Status Karyawan
                  </label>
                  <select
                    value={formData.statusAktif}
                    onChange={(e) =>
                      setFormData({ ...formData, statusAktif: e.target.value as 'Aktif' | 'Nonaktif' })
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="karyawan@perusahaan.com"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH UPLOAD CSV DATABASE KARYAWAN */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Upload Database Karyawan via CSV</h3>
                  <p className="text-[11px] text-slate-300">
                    Import data banyak karyawan sekaligus ke dalam sistem.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setParsedBatch([]);
                  setUploadError(null);
                }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Instructions and Download Template Box */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3 text-indigo-950">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-200/60">
                  <div>
                    <span className="font-bold block text-sm">Unduh File Template Karyawan:</span>
                    <span className="text-[11px] text-indigo-800">
                      Gunakan format template ini untuk mengisi data NIP, Nama, No HP, Jabatan, dan Cabang.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDownloadTemplate('sample')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                      title="Unduh template terisi 12 baris contoh karyawan"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Template Contoh (.CSV)</span>
                    </button>
                    <button
                      onClick={() => handleDownloadTemplate('blank')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-800 bg-white border border-indigo-300 hover:bg-indigo-100 rounded-lg transition-colors"
                      title="Unduh template kosong 1 baris"
                    >
                      <span>Template Kosong</span>
                    </button>
                  </div>
                </div>

                {/* 1-Click Demo Loader */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-indigo-900 font-medium">
                    ⚡ Ingin coba upload tanpa download &amp; isi file manual?
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadDemoTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Muat 8 Data Contoh Otomatis</span>
                  </button>
                </div>
              </div>

              {/* Upload Input Box */}
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center bg-slate-50 hover:bg-indigo-50/30 transition-colors">
                <FileUp className="w-9 h-9 text-indigo-500 mx-auto mb-2" />
                <label className="cursor-pointer block">
                  <span className="text-indigo-600 font-bold hover:underline text-sm">
                    Pilih File Template CSV dari Komputer / HP
                  </span>
                  <p className="text-slate-500 mt-1">atau seret file CSV ke area kotak ini</p>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                  <span>Format: NIP</span>
                  <span>•</span>
                  <span>Nama</span>
                  <span>•</span>
                  <span>No_HP</span>
                  <span>•</span>
                  <span>Jabatan</span>
                  <span>•</span>
                  <span>Kantor_Cabang</span>
                </div>
              </div>

              {/* Error Banner */}
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Preview Table of Parsed Employees */}
              {parsedBatch.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">
                      Pratinjau Data Siap Di-Upload ({parsedBatch.length} Karyawan):
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Format Valid
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-100 text-slate-700 font-semibold">
                        <tr>
                          <th className="p-2">NIP</th>
                          <th className="p-2">Nama</th>
                          <th className="p-2">No HP</th>
                          <th className="p-2">Jabatan</th>
                          <th className="p-2">Cabang</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedBatch.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{p.nip}</td>
                            <td className="p-2 font-bold">{p.nama}</td>
                            <td className="p-2 font-mono">+{p.noHp}</td>
                            <td className="p-2">{p.jabatan}</td>
                            <td className="p-2 font-bold text-blue-700">{p.kantorCabang}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {parsedBatch.length > 0 ? `${parsedBatch.length} baris siap disimpan` : 'Pilih file terlebih dahulu'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setParsedBatch([]);
                    setUploadError(null);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmBatchUpload}
                  disabled={parsedBatch.length === 0}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan ke Database ({parsedBatch.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
