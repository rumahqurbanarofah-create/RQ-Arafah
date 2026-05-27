/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Menu, 
  LogIn, 
  Clock, 
  BadgeHelp,
  CheckCircle2,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';
import { useQurban } from '../context/QurbanContext';

interface TopbarProps {
  currentTab: string;
  setMobileSidebarOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenLoginModal: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  setMobileSidebarOpen,
  mobileSidebarOpen,
  darkMode,
  setDarkMode,
  onOpenLoginModal
}) => {
  const { localAdminUser, currentUser, isFirebaseActive, firebaseError } = useQurban();
  const isAdminLoggedIn = !!localAdminUser || !!currentUser;

  const [showCloudErrorDetail, setShowCloudErrorDetail] = useState(false);

  // Real-time Clock in West Indonesian Time (WIB)
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Format Jam WIB
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds} WIB`);

      // Format Tanggal Indonesia
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setDateStr(now.toLocaleDateString('id-ID', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (currentTab) {
      case 'public-portal':
        return 'Alur Pemantauan Qurban Publik';
      case 'dashboard':
        return 'Analisis Ringkasan Operasional';
      case 'manajemen':
        return 'Manajemen & Pembaruan Status Realtime';
      default:
        return 'Rumah Qurban Arafah 2026';
    }
  };

  return (
    <header 
      id="main-topbar"
      className={`h-20 border-b flex items-center justify-between px-6 transition-all duration-200 shrink-0 select-none
        ${darkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-800'}`}
    >
      <div className="flex items-center gap-4">
        {/* Hamburger Menu for Mobile */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className={`p-2 rounded-lg md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer`}
          title="Buka Menu"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            {getPageTitle()}
          </h1>
          {/* Subtitle / Date */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-400 mt-0.5">
            <Calendar size={12} />
            <span>{dateStr}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Clock size={12} />
            <span className="font-mono">{timeStr}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Indicator Widget */}
        {isFirebaseActive ? (
          firebaseError ? (
            <button 
              onClick={() => setShowCloudErrorDetail(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-sm font-semibold bg-red-500/10 text-red-600 border border-red-500/20 max-w-[120px] md:max-w-none truncate hover:bg-red-500/20 transition-all cursor-pointer animate-pulse" 
              title="Klik untuk melihat detail error koneksi cloud"
            >
              <AlertCircle size={13} className="shrink-0 text-red-500" />
              <span className="truncate">Error Cloud</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Cloud Aktif</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Mode Lokal</span>
          </div>
        )}

        {/* Theme Switcher Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2.5 rounded-xl cursor-pointer transition-all duration-200 border
            ${darkMode 
              ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-yellow-500' 
              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'}`}
          title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Auth Trigger Button */}
        {!isAdminLoggedIn ? (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <LogIn size={15} />
            <span>Login Panitia</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 select-none">
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Panitia
            </span>
          </div>
        )}
      </div>

      {/* Cloud Error Detail Modal */}
      {showCloudErrorDetail && (
        <div id="cloud-error-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl border transition-all duration-200 text-left
            ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold tracking-tight text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={18} />
                Detail Error Firebase Cloud
              </h3>
              <button 
                onClick={() => setShowCloudErrorDetail(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className={`p-4 rounded-xl font-mono text-xs overflow-auto max-h-48 mb-4 border select-all
              ${darkMode ? 'bg-slate-950 border-slate-800 text-red-400' : 'bg-red-50/50 border-red-100 text-red-700'}`}>
              {firebaseError}
            </div>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mb-4">
              Aplikasi telah dialihkan secara otomatis ke <strong>Mode Lokal (Offline)</strong> menggunakan <em>LocalStorage</em> agar fungsionalitas CRUD tetap berjalan lancar tanpa terganggu.
            </p>

            <div className="text-xs space-y-2 text-slate-400 dark:text-slate-500 border-t border-slate-105 dark:border-slate-800 pt-3">
              <p className="font-semibold text-slate-600 dark:text-slate-300">💡 Langkah Mengatasi:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Pastikan <strong>Cloud Firestore</strong> telah diaktifkan di panel Firebase Console pada project <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded">rumah-qurban-arafah-f60d7</code>.</li>
                <li>Jika baru membuat database, pastikan memilih opsi <strong>"Start in Test Mode"</strong> agar hak akses baca dan tulis dapat diakses publik, atau deploy Security Rules dari AI Studio.</li>
                <li>Periksa koneksi internet ponsel Anda.</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setShowCloudErrorDetail(false);
                window.location.reload();
              }}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Coba Hubungkan Ulang (Muat Ulang)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
