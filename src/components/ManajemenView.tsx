/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Trash2, 
  Edit, 
  FileText, 
  ArrowUpDown, 
  X, 
  Clock, 
  Scale, 
  Phone, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  AlertOctagon,
  Video,
  ClipboardList
} from 'lucide-react';
import { useQurban } from '../context/QurbanContext';
import { Pekurban, JenisHewan, StatusPenyembelihan } from '../types';

interface ManajemenViewProps {
  darkMode: boolean;
}

export const ManajemenView: React.FC<ManajemenViewProps> = ({ darkMode }) => {
  const { 
    pekurbans, 
    createPekurban, 
    updatePekurban, 
    deletePekurban, 
    loading 
  } = useQurban();

  // -------------------------------------------------------------
  // STATE DEFINITIONS
  // -------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Pekurban | null>(null);

  // Form states for Create
  const [newId, setNewId] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newJenis, setNewJenis] = useState<JenisHewan>('Sapi');
  const [newTipe, setNewTipe] = useState('');
  const [newBerat, setNewBerat] = useState<number>(300);
  const [newTelepon, setNewTelepon] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTanggal, setNewTanggal] = useState('2026-05-27');
  const [newWaktu, setNewWaktu] = useState('08:00');
  const [newLokasi, setNewLokasi] = useState('Zona Utama RQA');
  const [newVideo, setNewVideo] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [newCatatan, setNewCatatan] = useState('');
  const [newStatus, setNewStatus] = useState<StatusPenyembelihan>('menunggu');

  // Form states for Edit / Status update
  const [editStatus, setEditStatus] = useState<StatusPenyembelihan>('menunggu');
  const [editLogKeterangan, setEditLogKeterangan] = useState('');
  const [editNama, setEditNama] = useState('');
  const [editTipe, setEditTipe] = useState('');
  const [editBerat, setEditBerat] = useState<number>(0);
  const [editTelepon, setEditTelepon] = useState('');
  const [editTanggal, setEditTanggal] = useState('');
  const [editWaktu, setEditWaktu] = useState('');
  const [editLokasi, setEditLokasi] = useState('');
  const [editVideo, setEditVideo] = useState('');
  const [editCatatan, setEditCatatan] = useState('');

  // -------------------------------------------------------------
  // FILTERING AND SORTING LOGIC
  // -------------------------------------------------------------
  const filteredList = pekurbans.filter(p => {
    const matchSearch = p.namaPekurban.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.nomorTelepon.includes(searchTerm);
    const matchJenis = filterJenis === 'all' ? true : p.jenisHewan === filterJenis;
    const matchStatus = filterStatus === 'all' ? true : p.status === filterStatus;
    return matchSearch && matchJenis && matchStatus;
  });

  // Sorting
  const sortedList = [...filteredList].sort((a, b) => {
    let multiplier = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'beratHewan') {
      return (a.beratHewan - b.beratHewan) * multiplier;
    }
    if (sortBy === 'namaPekurban') {
      return a.namaPekurban.localeCompare(b.namaPekurban) * multiplier;
    }
    return a.id.localeCompare(b.id) * multiplier;
  });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedList.length / itemsPerPage) || 1;

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // -------------------------------------------------------------
  // OPERATIONS ACTIONS
  // -------------------------------------------------------------
  
  // Open Create Form Helper
  const handleOpenCreate = () => {
    // Generate automatic unique incremented key for easier testing
    const nextNum = pekurbans.length + 1;
    setNewId('AQ-26-' + String(nextNum).padStart(4, '0'));
    setNewNama('');
    setNewTipe('Sapi Simmental Unggul');
    setNewBerat(350);
    setNewTelepon('08123456' + String(10 + nextNum));
    setNewEmail('pekurban' + nextNum + '@qurban.com');
    setNewTanggal('2026-05-27');
    setNewWaktu('08:00');
    setNewLokasi('Zona Utama RQA');
    setNewVideo('https://www.youtube.com/embed/dQw4w9WgXcQ');
    setNewCatatan('');
    setNewStatus('menunggu');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newId.trim()) {
      alert("Nama dan ID wajib diisi!");
      return;
    }

    try {
      await createPekurban({
        id: newId,
        namaPekurban: newNama,
        jenisHewan: newJenis,
        tipeHewan: newTipe,
        beratHewan: Number(newBerat) || 10,
        status: newStatus,
        nomorTelepon: newTelepon,
        email: newEmail,
        tanggalPenyembelihan: newTanggal,
        waktuPenyembelihan: newWaktu,
        lokasiSembelih: newLokasi,
        linkVideo: newVideo,
        catatan: newCatatan
      });
      setIsCreateOpen(false);
    } catch (err: any) {
      alert("Gagal menambahkan: " + err.message);
    }
  };

  // Open Edit Form Helper
  const handleOpenEdit = (record: Pekurban) => {
    setSelectedRecord(record);
    setEditStatus(record.status);
    setEditLogKeterangan('');
    setEditNama(record.namaPekurban);
    setEditTipe(record.tipeHewan);
    setEditBerat(record.beratHewan);
    setEditTelepon(record.nomorTelepon);
    setEditTanggal(record.tanggalPenyembelihan);
    setEditWaktu(record.waktuPenyembelihan);
    setEditLokasi(record.lokasiSembelih);
    setEditVideo(record.linkVideo);
    setEditCatatan(record.catatan);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      await updatePekurban(selectedRecord.id, {
        namaPekurban: editNama,
        tipeHewan: editTipe,
        beratHewan: Number(editBerat),
        status: editStatus,
        nomorTelepon: editTelepon,
        tanggalPenyembelihan: editTanggal,
        waktuPenyembelihan: editWaktu,
        lokasiSembelih: editLokasi,
        linkVideo: editVideo,
        catatan: editCatatan
      }, editLogKeterangan.trim() || undefined);
      
      setIsEditOpen(false);
    } catch (err: any) {
      alert("Gagal merubah: " + err.message);
    }
  };

  // Open Detail Helper
  const handleOpenDetail = (record: Pekurban) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  // Handle Delete CONFIRM
  const handleDeleteCheck = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data qurban atas nama "${name}" (${id})? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        await deletePekurban(id);
      } catch (err: any) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  // Status Badge Class Selector
  const getStatusBadge = (status: StatusPenyembelihan) => {
    switch (status) {
      case 'menunggu':
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'diterima':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800';
      case 'antemortem_aman':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800';
      case 'siap_sembelih':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800';
      case 'sedang_sembelih':
        return 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800';
      case 'sedang_kulit_potong':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-850';
      case 'sedang_kemas':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800';
      case 'siap_distribusi':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800';
      case 'selesai':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div id="manajemen-crud-panel" className="space-y-6 text-left pb-12 select-none">
      
      {/* Title & Stats Summary Panel */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4
        ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div>
          <h2 className="text-base font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase">
            <Users size={18} />
            <span>Manajemen Penerimaan & Jagal</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tambah pekurban baru, modifikasi profil hewan, atau koordinasikan status sembelih realtime ke portal publik.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer max-w-fit"
        >
          <Plus size={16} />
          <span>Tambah Pekurban</span>
        </button>
      </div>

      {/* FILTER, SEARCH & SORT BAR */}
      <div className={`p-4 rounded-xl border space-y-3.5
        ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        
        <div className="flex flex-col lg:flex-row gap-3">
          
          {/* Search bar input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID, nama pekurban, nomor ponsel..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none transition-all border
                ${darkMode 
                  ? 'bg-slate-950 border-slate-850 text-slate-100 placeholder-slate-500 focus:border-blue-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400'}`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            {/* Filter Jenis Hewan */}
            <div className="relative">
              <select
                value={filterJenis}
                onChange={(e) => { setFilterJenis(e.target.value); setCurrentPage(1); }}
                className={`w-full pl-3 pr-8 py-2.5 rounded-xl text-xs font-semibold select-none outline-none appearance-none border cursor-pointer
                  ${darkMode ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-750'}`}
              >
                <option value="all">Semua Hewan (Sapi/Kambing)</option>
                <option value="Sapi">Spesifik Sapi</option>
                <option value="Kambing">Spesifik Kambing</option>
                <option value="Domba">Spesifik Domba</option>
                <option value="Kerbau">Spesifik Kerbau</option>
              </select>
            </div>

            {/* Filter Status Sembelih */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className={`w-full pl-3 pr-8 py-2.5 rounded-xl text-xs font-semibold outline-none appearance-none border cursor-pointer
                  ${darkMode ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-750'}`}
              >
                <option value="all">Semua Status (Lengkap)</option>
                <option value="menunggu">Menunggu</option>
                <option value="diterima">Diterima</option>
                <option value="antemortem_aman">Antemortem</option>
                <option value="siap_sembelih">Siap Sembelih</option>
                <option value="sedang_sembelih">Sedang Sembelih</option>
                <option value="sedang_kulit_potong">Kulit & Potong</option>
                <option value="sedang_kemas">Sedang Kemas</option>
                <option value="siap_distribusi">Siap Distribusi</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>

            {/* Sort column field selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); }}
                className={`w-full pl-3 pr-8 py-2.5 rounded-xl text-xs font-semibold outline-none appearance-none border cursor-pointer
                  ${darkMode ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-750'}`}
              >
                <option value="id">Urut Berdasarkan ID</option>
                <option value="namaPekurban">Urut Nama Pekurban</option>
                <option value="beratHewan">Urut Berat (Kg)</option>
              </select>
            </div>

            {/* Sort order Toggle Direction Button */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer
                ${darkMode 
                  ? 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-800' 
                  : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'}`}
            >
              <ArrowUpDown size={14} />
              <span>{sortOrder === 'asc' ? 'A-Z (Asc)' : 'Z-A (Desc)'}</span>
            </button>

          </div>

        </div>

        {/* Counter Results badge info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Menampilkan <strong>{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, sortedList.length)}</strong> dari <strong>{sortedList.length}</strong> entri terfilter</span>
          <button 
            onClick={() => { setSearchTerm(''); setFilterJenis('all'); setFilterStatus('all'); setCurrentPage(1); }}
            className="text-xs text-blue-500 font-bold hover:underline cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* MODERN SCROLLABLE DATA TABLE CONTAINER */}
      <div className={`p-1.5 rounded-2xl border overflow-hidden
        ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className={`border-b text-[10px] font-bold tracking-wider uppercase opacity-75
                ${darkMode ? 'border-slate-800 bg-slate-950/20' : 'border-slate-100 bg-slate-50/50'}`}>
                <th className="p-4 rounded-tl-xl">ID Qurban</th>
                <th className="p-4">Pekurban</th>
                <th className="p-4">Detail Hewan</th>
                <th className="p-4">Bobot Timbang</th>
                <th className="p-4">Status Transparansi</th>
                <th className="p-4">Tanggal & Jam</th>
                <th className="p-4 text-center rounded-tr-xl">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[12px] font-medium">
              
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr 
                    key={item.id}
                    className={`hover:bg-blue-50/10 dark:hover:bg-slate-800/30 transition-colors`}
                  >
                    {/* ID */}
                    <td className="p-4 text-xs font-mono font-bold text-blue-500">
                      {item.id}
                    </td>

                    {/* Pekurban */}
                    <td className="p-4 max-w-[200px]">
                      <p className="font-extrabold text-sm truncate leading-none text-slate-800 dark:text-slate-100">{item.namaPekurban}</p>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">{item.nomorTelepon}</span>
                    </td>

                    {/* Detail Hewan */}
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all font-bold cursor-pointer">
                        {item.jenisHewan}
                      </span>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[150px]">{item.tipeHewan}</p>
                    </td>

                    {/* Bobot */}
                    <td className="p-4 font-mono font-bold">
                      {item.beratHewan} <span className="text-[9px] text-slate-400 font-bold">Kg</span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${getStatusBadge(item.status)}`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Tanggal & Waktu */}
                    <td className="p-4">
                      <p className="text-slate-800 dark:text-slate-300">{item.tanggalPenyembelihan}</p>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {item.waktuPenyembelihan} WIB
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          title="Lihat Log Riwayat"
                          className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileText size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Perbarui Status / Edit"
                          className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCheck(item.id, item.namaPekurban)}
                          title="Hapus Qurban"
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500 text-xs">
                    {loading ? "Menghubungi database..." : "Tidak ada data hewan pekurban terdaftar yang cocok dengan filter."}
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROL SYSTEM */}
        {totalPages > 1 && (
          <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer
                ${currentPage === 1 
                  ? 'opacity-40 pointer-events-none' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-300'}`}
            >
              <ChevronLeft size={14} />
              <span>Sebelumnya</span>
            </button>

            <span className="font-bold text-slate-500">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer
                ${currentPage === totalPages 
                  ? 'opacity-40 pointer-events-none' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-300'}`}
            >
              <span>Selanjutnya</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>

      {/* ============================================================= */}
      {/* MODAL 1: CREATE NEW RECORD FORM */}
      {/* ============================================================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          <div className={`relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border transition-all max-h-[90vh] flex flex-col
            ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserPlus size={18} />
                <h3 className="font-bold text-sm">Registrasi Hewan Qurban Baru</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-left">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* ID Qurban */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Qurban (Otomatis)</label>
                  <input
                    type="text"
                    required
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 font-mono font-bold
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                </div>

                {/* Nama Pekurban */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Pekurban</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: H. Ahmad Fauzi"
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 font-bold
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Jenis Hewan select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jenis Hewan</label>
                  <select
                    value={newJenis}
                    onChange={(e) => setNewJenis(e.target.value as JenisHewan)}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold outline-none border focus:border-blue-500 cursor-pointer
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="Sapi">Sapi</option>
                    <option value="Kambing">Kambing</option>
                    <option value="Domba">Domba</option>
                    <option value="Kerbau">Kerbau</option>
                  </select>
                </div>

                {/* Tipe Breed Spec */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spesifikasi Ras / Tipe</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sapi Limousin Jumbo / Kambing Gembel"
                    value={newTipe}
                    onChange={(e) => setNewTipe(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Bobot Berat */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bobot Berat Timbang (Kg)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    placeholder="Contoh: Sapi 350, Kambing 50"
                    value={newBerat}
                    onChange={(e) => setNewBerat(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 font-mono font-bold
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* HP Whatsapp */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor HP / WhatsApp Pekurban</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567800"
                    value={newTelepon}
                    onChange={(e) => setNewTelepon(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 font-bold
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Email (Opsional) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alamat Email (Opsional)</label>
                  <input
                    type="email"
                    placeholder="Contoh: ahmad@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Nilai Status Awal */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Awal Alur</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as StatusPenyembelihan)}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold outline-none border focus:border-blue-500 cursor-pointer
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="menunggu">Menunggu</option>
                    <option value="diterima">Diterima</option>
                    <option value="antemortem_aman">Antemortem</option>
                  </select>
                </div>

                {/* Tanggal Sembelih */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal Pelaksanaan Sembelih</label>
                  <input
                    type="date"
                    required
                    value={newTanggal}
                    onChange={(e) => setNewTanggal(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 cursor-pointer
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Estimasi Jam */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimasi Jam Mulai Sembelih</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 08:30"
                    value={newWaktu}
                    onChange={(e) => setNewWaktu(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 font-bold
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Lokasi Jagal */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lokasi Bilik Jagal</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Zona Utama RQA"
                    value={newLokasi}
                    onChange={(e) => setNewLokasi(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Video Embed url */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link Feed CCTV / Video Stream</label>
                  <input
                    type="text"
                    placeholder="Input URL Youtube atau stream..."
                    value={newVideo}
                    onChange={(e) => setNewVideo(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 font-mono text-[11px]
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

              </div>

              {/* Catatan Area */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catatan Khusus Panitia / Pekurban (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Minta jeroan dicuci berserih terpisah..."
                  value={newCatatan}
                  onChange={(e) => setNewCatatan(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 resize-none
                    ${darkMode ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer
                    ${darkMode ? 'bg-slate-950 border-slate-850 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-100'}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer"
                >
                  Registrasikan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: EDIT PROFILE AND INCREMENT STATUS */}
      {/* ============================================================= */}
      {isEditOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
          <div className={`relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border transition-all max-h-[90vh] flex flex-col
            ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Edit size={18} />
                <h3 className="font-bold text-sm">Ubah & Update Status: {selectedRecord.id}</h3>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-left">
              
              {/* STATUS STEPPING WIDGET */}
              <div className={`p-4 rounded-xl border flex flex-col gap-2
                ${darkMode ? 'bg-slate-950/80 border-slate-850' : 'bg-amber-50/35 border-amber-200/50'}`}>
                <label className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest block">
                  Pembaruan Status Sembelih (Live Pemasukan Lapangan)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                  {[
                    { val: 'menunggu', label: '1. Menunggu' },
                    { val: 'diterima', label: '2. Diterima RQA' },
                    { val: 'antemortem_aman', label: '3. Antemortem Sehat' },
                    { val: 'siap_sembelih', label: '4. Siap Sembelih' },
                    { val: 'sedang_sembelih', label: '5. Sembelih (Takbir)' },
                    { val: 'sedang_kulit_potong', label: '6. Sedang Kulit' },
                    { val: 'sedang_kemas', label: '7. Timbang/Packing' },
                    { val: 'siap_distribusi', label: '8. Siap Distribusi' },
                    { val: 'selesai', label: '9. Selesai Penyerahan' },
                  ].map(step => (
                    <button
                      key={step.val}
                      type="button"
                      onClick={() => setEditStatus(step.val as StatusPenyembelihan)}
                      className={`px-2.5 py-2 rounded-lg text-left text-[11px] font-semibold border transition-all cursor-pointer truncate
                        ${editStatus === step.val
                          ? 'bg-amber-500 border-amber-500 text-white font-extrabold shadow-md shadow-amber-500/15'
                          : darkMode 
                            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>

                {/* Log keterangan update input */}
                <div className="space-y-1 mt-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Keterangan Catatan Riwayat Baru</label>
                  <input
                    type="text"
                    placeholder="KOSONGKAN untuk autogenerate deskripsi standard system RQA..."
                    value={editLogKeterangan}
                    onChange={(e) => setEditLogKeterangan(e.target.value)}
                    className={`w-full p-2 rounded-xl text-xs outline-none border focus:border-amber-500
                      ${darkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'}`}
                  />
                </div>
              </div>

              {/* Editable profile specifications input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nama Pekurban */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Pekurban</label>
                  <input
                    type="text"
                    required
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 font-bold
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* HP Whatsapp */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor HP / WhatsApp Pekurban</label>
                  <input
                    type="text"
                    required
                    value={editTelepon}
                    onChange={(e) => setEditTelepon(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 font-bold
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Tipe Breed Spec */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spesifikasi Ras / Tipe</label>
                  <input
                    type="text"
                    required
                    value={editTipe}
                    onChange={(e) => setEditTipe(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Bobot Berat */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bobot Berat Timbang (Kg)</label>
                  <input
                    type="number"
                    required
                    value={editBerat}
                    onChange={(e) => setEditBerat(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 font-mono font-bold
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Tanggal Sembelih */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal Sembelih</label>
                  <input
                    type="date"
                    required
                    value={editTanggal}
                    onChange={(e) => setEditTanggal(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 cursor-pointer
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Estimasi Jam */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimasi Jam Sembelih</label>
                  <input
                    type="text"
                    required
                    value={editWaktu}
                    onChange={(e) => setEditWaktu(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 font-bold
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Lokasi Jagal */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lokasi Bilik Jagal</label>
                  <input
                    type="text"
                    required
                    value={editLokasi}
                    onChange={(e) => setEditLokasi(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                {/* Video Embed url */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link Feed CCTV / Video</label>
                  <input
                    type="text"
                    value={editVideo}
                    onChange={(e) => setEditVideo(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 font-mono text-[11px]
                      ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

              </div>

              {/* Catatan Area */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catatan Khusus</label>
                <textarea
                  rows={2}
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:border-blue-500 resize-none
                    ${darkMode ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer
                    ${darkMode ? 'bg-slate-950 border-slate-850 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-100'}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 3: VIEW HISTORY LOGS DETAIL */}
      {/* ============================================================= */}
      {isDetailOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)} />
          <div className={`relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border transition-all max-h-[85vh] flex flex-col
            ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} />
                <h3 className="font-bold text-sm">Riwayat Aktivitas: {selectedRecord.id}</h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
              
              <div className="space-y-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Pekurban</span>
                <p className="font-extrabold text-base">{selectedRecord.namaPekurban}</p>
                <p className="text-xs text-slate-500">
                  Hewan: <strong>{selectedRecord.jenisHewan} ({selectedRecord.tipeHewan})</strong> | Berat: <strong>{selectedRecord.beratHewan} Kg</strong>
                </p>
              </div>

              {/* Trace Timeline list logs */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Daftar Audit Trail Lapangan:</span>
                
                <div className="relative border-l border-blue-500/20 ml-2.5 space-y-4 pl-5">
                  {selectedRecord.logs.map((log) => (
                    <div key={log.id} className="relative text-xs">
                      
                      {/* Timeline dot */}
                      <span className="absolute -left-[26px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow shadow-blue-500/30" />
                      
                      <div>
                        <div className="flex items-center justify-between gap-1.5 font-bold">
                          <span className="uppercase text-blue-500">{log.status.replace(/_/g, ' ')}</span>
                          <span className="text-[9px] font-normal text-slate-400 font-mono">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <p className={`mt-1 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-650'}`}>
                          "{log.keterangan}"
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 italic">
                          Oleh Saksi/Sistem: <strong className="font-bold">{log.operator}</strong>
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-150 dark:border-slate-800">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
