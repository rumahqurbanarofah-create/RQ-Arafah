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
  const { localAdminUser, currentUser, isFirebaseActive } = useQurban();
  const isAdminLoggedIn = !!localAdminUser || !!currentUser;

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
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium
          ${darkMode ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>Sistem Pemantauan Aktif</span>
        </div>

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
    </header>
  );
};
