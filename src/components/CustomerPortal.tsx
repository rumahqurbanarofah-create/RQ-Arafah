/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Tv, 
  Award, 
  MapPin, 
  Calendar, 
  Scale, 
  CheckCircle, 
  Loader2, 
  Clock, 
  FileText,
  User,
  ExternalLink,
  Phone,
  Video,
  Download,
  AlertCircle
} from 'lucide-react';
import { useQurban } from '../context/QurbanContext';
import { Pekurban, StatusPenyembelihan } from '../types';

interface CustomerPortalProps {
  darkMode: boolean;
}

const STEPS: { status: StatusPenyembelihan; label: string; desc: string }[] = [
  { status: 'menunggu', label: 'Menunggu', desc: 'Registrasi & hewan belum tiba di lokasi RQA' },
  { status: 'siap_sembelih', label: 'Siap Sembelih', desc: 'Hewan digiring ke ring bilik penyembelihan RQA' },
  { status: 'sedang_sembelih', label: 'Penyembelihan', desc: 'Pemotongan syar’i diiringi lafadz takbir' },
  { status: 'sedang_kulit_potong', label: 'Kulit & Potong', desc: 'Proses pengulitan karkas, pemisahan daging & tulang' },
  { status: 'sedang_kemas', label: 'Penimbangan & Kemas', desc: 'Penimbangan presisi, pengemasan boks beralas daun' },
  { status: 'siap_distribusi', label: 'Siap Distribusi', desc: 'Pengisian logistik cold storage / siap diambil konsumen' },
  { status: 'selesai', label: 'Selesai', desc: 'Qurban telah diserahkan sepenuhnya ke pekurban / panti' },
];

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ darkMode }) => {
  const { getSinglePekurban, pekurbans } = useQurban();
  
  const [searchId, setSearchId] = useState('');
  const [searchedRecord, setSearchedRecord] = useState<Pekurban | null>(null);
  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [liveLogCount, setLiveLogCount] = useState(0);

  // Suggested quick demo keys
  const demoIds = ['AQ-26-0001', 'AQ-26-0002', 'AQ-26-0003', 'AQ-26-0005'];

  // Handle Search
  const handleSearch = async (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const queryId = (customId || searchId).trim();
    if (!queryId) return;

    setSearching(true);
    setErrorMessage('');
    setSearchedRecord(null);
    setShowCertificate(false);

    try {
      const result = await getSinglePekurban(queryId);
      if (result) {
        setSearchedRecord(result);
      } else {
        setErrorMessage('Konsumen / ID Qurban "'+ queryId +'" tidak ditemukan. Pastikan ketik ID yang benar (Contoh: AQ-26-0001) atau gunakan pencarian nama.');
      }
    } catch (err) {
      setErrorMessage('Terjadi kendala pencarian data.');
    } finally {
      setSearching(false);
    }
  };

  // Helper to determine step classes
  const getStepStatusClass = (stepStatus: StatusPenyembelihan, record: Pekurban) => {
    const currentIndex = STEPS.findIndex(s => s.status === record.status);
    const stepIndex = STEPS.findIndex(s => s.status === stepStatus);

    if (stepIndex < currentIndex) {
      return {
        badge: 'bg-emerald-500 text-white',
        border: 'border-emerald-500',
        text: 'text-emerald-500 font-semibold',
        bg: 'bg-emerald-500/10 border-emerald-500/30'
      };
    } else if (stepIndex === currentIndex) {
      return {
        badge: 'bg-blue-600 text-white animate-pulse shadow-md shadow-blue-500/50',
        border: 'border-blue-600 border-2 scale-105',
        text: 'text-blue-600 dark:text-blue-400 font-bold',
        bg: 'bg-blue-600/10 border-blue-600 dark:bg-blue-600/20'
      };
    } else {
      return {
        badge: darkMode ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-slate-100 text-slate-400 border border-slate-200',
        border: darkMode ? 'border-slate-800' : 'border-slate-200',
        text: 'text-slate-400',
        bg: 'opacity-50'
      };
    }
  };

  // Live Cam / Video simulated timecode
  const [liveTimecode, setLiveTimecode] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveTimecode(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="customer-portal-view" className="space-y-6 max-w-5xl mx-auto pb-12 select-none">
      
      {/* Search Header Hero Container */}
      <div className={`p-6 md:p-8 rounded-2xl text-center relative overflow-hidden flex flex-col items-center justify-center border
        ${darkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border-slate-800' 
          : 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 border-blue-600 text-white shadow-xl shadow-blue-500/10'}`}>
        
        {/* Dynamic graphics backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 border
          ${darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-white/10 text-blue-200 border-white/20'}`}>
          Sistem Notifikasi Realtime RQA 2026
        </span>
        <h2 className={`text-xl md:text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-white'}`}>
          Pantau Penyembelihan Qurban Anda
        </h2>
        <p className={`text-xs md:text-sm mt-2 max-w-lg mx-auto ${darkMode ? 'text-slate-400' : 'text-blue-100'}`}>
          Rumah Qurban Arafah memberikan transparansi syariat penuh. Cari qurban Anda menggunakan Nama Pekurban atau Kode Unik (ID) yang kami kirimkan ke WhatsApp Anda.
        </p>

        {/* Input Form Search Wrapper */}
        <form onSubmit={(e) => handleSearch(e)} className="w-full max-w-xl mt-6 relative z-10">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ketik ID Qurban (A-Z, contoh: AQ-26-0001) atau Nama Pekurban..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-xs md:text-sm outline-none transition-all shadow-inner font-semibold text-left
                  ${darkMode 
                    ? 'bg-slate-950 text-slate-100 border border-slate-800 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                    : 'bg-white text-slate-950 border border-blue-400 placeholder-slate-400 focus:border-blue-700'}`}
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer grow-0 shrink-0"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              <span>Cari QR</span>
            </button>
          </div>
        </form>

        {/* Suggested Quick Search For Review */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 relative z-10">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-blue-200'}`}>
            Kode Demo Uji:
          </span>
          {demoIds.map(id => (
            <button
              key={id}
              onClick={() => {
                setSearchId(id);
                handleSearch(undefined, id);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer
                ${darkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-blue-900/40 hover:text-white' 
                  : 'bg-white/10 border-white/20 text-blue-100 hover:bg-white hover:text-blue-700'}`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Error / Alert Block */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs flex items-center gap-2.5 max-w-xl mx-auto text-left">
          <AlertCircle size={18} className="shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* SEARCHED QURBAN RESULT DISPLAY BLOCK */}
      {searchedRecord && (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* Section 1: Core Animal Details & Fast summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Consumer Card Info */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden
              ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
                    Info Pekurban
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 font-mono">
                    {searchedRecord.id}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400">Nama Pekurban</h4>
                  <p className="text-lg font-bold truncate tracking-tight">{searchedRecord.namaPekurban}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] font-semibold text-slate-400">Jenis Hewan</h4>
                    <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{searchedRecord.jenisHewan}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-semibold text-slate-400">Spesifikasi</h4>
                    <p className="text-xs font-bold truncate">{searchedRecord.tipeHewan}</p>
                  </div>
                </div>
              </div>

              <div className={`mt-5 pt-3 border-t text-[11px] flex items-center gap-2 ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                <Phone size={12} className="text-emerald-500" />
                <span>Kontak: {searchedRecord.nomorTelepon}</span>
              </div>
            </div>

            {/* Slaughter Schedule Card */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden
              ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
                    Penjadwalan RQA
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Calendar size={15} className="mt-0.5 text-blue-500" />
                    <div>
                      <h4 className="text-[10px] font-semibold text-slate-400">Tanggal Sembelih</h4>
                      <p className="text-xs font-bold">{searchedRecord.tanggalPenyembelihan}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock size={15} className="mt-0.5 text-blue-500" />
                    <div>
                      <h4 className="text-[10px] font-semibold text-slate-400">Waktu Estimasi</h4>
                      <p className="text-xs font-bold">{searchedRecord.waktuPenyembelihan} WIB</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="mt-0.5 text-blue-500" />
                    <div>
                      <h4 className="text-[10px] font-semibold text-slate-400">Lokasi Sembelih</h4>
                      <p className="text-xs font-bold truncate">{searchedRecord.lokasiSembelih}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`mt-4 pt-3 border-t text-[11px] flex items-center gap-2 ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                <Scale size={12} className="text-amber-500" />
                <span>Bobot Timbang: <strong>{searchedRecord.beratHewan} kg</strong></span>
              </div>
            </div>

            {/* Live Progress Status Badge Card */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden
              ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">
                  Status Saat Ini
                </span>
                <div className="mt-2.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Kondisi Hewan:</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 capitalize">
                      {searchedRecord.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Data status di atas dikontrol secara realtime oleh operator kami di lokasi pemotongan.
                </p>
              </div>

              {/* Certificate & Print check */}
              {searchedRecord.status === 'selesai' && (
                <button
                  onClick={() => setShowCertificate(!showCertificate)}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold py-2.5 rounded-xl text-[11px] tracking-wider uppercase shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  <Award size={14} />
                  <span>{showCertificate ? 'Tutup Sertifikat' : 'Unduh Sertifikat Qurban'}</span>
                </button>
              )}
            </div>

          </div>

          {/* DYNAMIC DIGITAL CERTIFICATE BOX */}
          {showCertificate && searchedRecord.status === 'selesai' && (
            <div className="my-6 p-4 md:p-8 rounded-2xl border relative text-center bg-amber-50/10 dark:bg-amber-950/10 border-amber-500/30 shadow-lg shadow-amber-500/5 animate-scale-up">
              
              {/* Actual physical certificate model */}
              <div className={`max-w-xl mx-auto p-6 md:p-10 rounded-xl relative border shadow-2xl overflow-hidden
                ${darkMode 
                  ? 'bg-slate-950 border-amber-900 text-slate-100' 
                  : 'bg-amber-50/20 border-amber-800 text-slate-800'}`}>
                
                {/* Gold corner ornaments */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-600 rounded-tl-lg" />
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-600 rounded-tr-lg" />
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-600 rounded-bl-lg" />
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-600 rounded-br-lg" />

                <div className="flex flex-col items-center">
                  <Award size={48} className="text-amber-500 mb-3" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-amber-600 leading-none">
                    SERTIFIKAT DIGITAL
                  </span>
                  <span className="text-[14px] font-extrabold tracking-widest text-blue-600 dark:text-blue-400 mt-1">
                    RUMAH QURBAN ARAFAH 2026
                  </span>
                  
                  <div className="w-24 h-[1px] bg-amber-600 my-4" />

                  <p className="text-xs italic text-slate-400">Diberikan sebagai rasa hormat serta bukti syar’i penyembelihan:</p>
                  
                  <h4 className="text-lg md:text-2xl font-black tracking-tight text-amber-600 dark:text-amber-500 mt-2">
                    {searchedRecord.namaPekurban}
                  </h4>

                  <p className="text-xs max-w-sm mt-3 leading-relaxed">
                    Telah terlaksana ibadah penyembelihan hewan qurban berupa <strong className="font-bold">{searchedRecord.tipeHewan}</strong> seberat <strong className="font-extrabold text-blue-500">{searchedRecord.beratHewan} kg</strong> di Rumah Qurban Arafah pada tanggal {searchedRecord.tanggalPenyembelihan} secara syar'i sesuai dengan tuntunan sunnah Rasulullah SAW.
                  </p>

                  <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-5 border-t border-dashed border-amber-600/30 text-left">
                    <div className="text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-semibold">Ustadz Penyembelih</p>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">Ustadz Syaiful</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-semibold">Metode Penyembelihan</p>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">Syar'i Manual</p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono">
                    <span>Sertifikat ID: RQA-2026-CERT-{searchedRecord.id}</span>
                    <button 
                      onClick={() => window.print()}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Cetak / Print File</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Section 2: Active Timeline Steps View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box: Active Workflow Tracker list */}
            <div className={`p-5 rounded-2xl border lg:col-span-8 space-y-5
              ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black tracking-tight uppercase text-blue-600 dark:text-blue-400">
                  Alur Proses Penyembelihan
                </h3>
                <span className={`text-[11px] font-semibold text-slate-400`}>
                  7 Tahap Transparansi Syariat
                </span>
              </div>

              {/* Progress Bar / Steps Block */}
              <div className="space-y-4">
                {STEPS.map((step, idx) => {
                  const style = getStepStatusClass(step.status, searchedRecord);
                  const logMatch = searchedRecord.logs.find(l => l.status === step.status);
                  
                  return (
                    <div 
                      key={step.status} 
                      className={`p-3.5 rounded-xl border flex gap-4 items-start transition-all duration-200 ${style.bg}`}
                    >
                      {/* Circle count badge */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold leading-none shrink-0 ${style.badge}`}>
                        {idx + 1}
                      </div>

                      {/* Info & Log content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <h4 className={`text-xs ${style.text}`}>{step.label}</h4>
                          {logMatch && (
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                              <Clock size={10} />
                              {new Date(logMatch.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] mt-0.5 leading-normal ${style.text === 'text-slate-400' ? 'text-slate-500' : 'text-slate-400 dark:text-slate-300'}`}>
                          {step.desc}
                        </p>

                        {/* If operator recorded, show sub-info */}
                        {logMatch && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-400 italic">
                            <span>Saksi/Op: <strong>{logMatch.operator}</strong></span>
                            <span>•</span>
                            <span className="not-italic font-medium text-slate-600 dark:text-slate-300">"{logMatch.keterangan}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Right Box: GOOGLE DRIVE VIDEO DOCUMENTATION */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* video box display wrapper */}
              <div className={`p-4 rounded-2xl border overflow-hidden relative space-y-3
                ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black tracking-tight text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1.5">
                    <Video size={14} className="animate-pulse text-blue-500" />
                    <span>Video Dokumentasi Qurban</span>
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Google Drive
                  </span>
                </div>

                {searchedRecord.linkVideo ? (() => {
                  // Helper function to convert sharing URL to Google Drive embed preview url
                  const getGoogleDriveEmbedUrl = (url: string) => {
                    if (!url) return '';
                    if (url.includes('drive.google.com')) {
                      const matchD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                      if (matchD && matchD[1]) {
                        return `https://drive.google.com/file/d/${matchD[1]}/preview`;
                      }
                      const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                      if (matchId && matchId[1]) {
                        return `https://drive.google.com/file/d/${matchId[1]}/preview`;
                      }
                    }
                    return url;
                  };

                  const embedSrc = getGoogleDriveEmbedUrl(searchedRecord.linkVideo);

                  return (
                    <div className="space-y-3">
                      {/* Video Player Frame */}
                      <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-800 dark:border-slate-700 shadow-inner">
                        {embedSrc ? (
                          <iframe
                            src={embedSrc}
                            className="w-full h-full border-0 absolute inset-0"
                            allow="autoplay"
                            allowFullScreen
                            title="Google Drive Video Player"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                            <Video size={32} className="text-slate-600 animate-pulse mb-2" />
                            <span className="text-[11px] font-bold text-slate-400">Video Sedang Diproses</span>
                          </div>
                        )}
                      </div>

                      {/* Launch External Link Button */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 leading-normal text-left">
                          Tekan tombol di bawah untuk membuka video resolusi penuh serta mengunduh rekaman dari Google Drive.
                        </p>
                        <a
                          href={searchedRecord.linkVideo}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                        >
                          <span>Buka Video Google Drive</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="space-y-3">
                    {/* Placeholder Frame */}
                    <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                      <Video size={36} className="text-slate-700 animate-pulse mb-2" />
                      <span className="text-[11px] font-extrabold text-slate-500">Video Belum Diupload</span>
                      <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-1">
                        Status: {searchedRecord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <p className="text-[10.5px] text-slate-400 leading-normal text-left">
                      Dokumentasi rekaman video Google Drive penyembelihan otomatis diunggah oleh panitia setelah hewan qurban Anda tuntas melewati proses penyembelihan dan penimbangan.
                    </p>
                  </div>
                )}

              </div>

              {/* Helpful tracking notice */}
              <div className={`p-4 rounded-2xl border text-left space-y-4
                ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  Informasi Penting Konsumen
                </h3>
                
                <div className="space-y-3 text-[11px] leading-relaxed text-slate-400">
                  <p>
                    <strong>1. Waktu Estimasi:</strong> Kami berusaha maksimal menyelesaikan penyembelihan tepat waktu. Keterlambatan dapat dipicu oleh penyesuaian stabilitas gerak hewan.
                  </p>
                  <p>
                    <strong>2. Higienitas Terjamin:</strong> Seluruh area dipotongi di bawah bimbingan Ustadz internal dan dokter RQA terakreditasi MUI.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* FOOTER PUBLIC DISPLAY */}
      {!searchedRecord && (
        <div className={`p-10 rounded-2xl border text-center space-y-3 max-w-xl mx-auto
          ${darkMode ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' : 'bg-slate-50/50 border-slate-100 text-slate-500'}`}>
          <Tv size={28} className="mx-auto text-blue-500 opacity-60 animate-bounce" />
          <p className="text-xs font-semibold">TIPS PENCARIAN PENYEMBELIHAN:</p>
          <p className="text-[11px] max-w-sm mx-auto leading-relaxed">
            Ketik ID Qurban perorangan Anda (contoh: <strong className="font-mono">AQ-26-0001</strong> atau nama ringkas <strong className="font-sans">Bambang</strong>) pada kotak pencarian di atas untuk memantau logs, estimasi jam jagal, dan mengunduh sertifikat halal qurban secara instan.
          </p>
        </div>
      )}

    </div>
  );
};
