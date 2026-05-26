/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { QurbanProvider, useQurban } from './context/QurbanContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { CustomerPortal } from './components/CustomerPortal';
import { DashboardView } from './components/DashboardView';
import { ManajemenView } from './components/ManajemenView';
import { LoginModal } from './components/LoginModal';
import { ShieldAlert, BookOpen, Clock, Heart, ArrowUpRight, HelpCircle } from 'lucide-react';

function AppContent() {
  const { localAdminUser, currentUser } = useQurban();
  const isAdminLoggedIn = !!localAdminUser || !!currentUser;

  const [currentTab, setCurrentTab] = useState<string>('public-portal');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);

  // Sync Dark Mode state to root HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Close mobile sidebar on tab change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [currentTab]);

  return (
    <div className={`min-h-screen w-full flex overflow-hidden transition-colors duration-200
      ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
    >
      {/* 1. Sidebar Panel (Desktop: Fixed/Resizable, Mobile: Slide-over Drawer) */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          darkMode={darkMode}
        />
      </div>

      {/* Mobile Drawer Overlay Background */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer Content Container */}
      <div className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ease-in-out shrink-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          collapsed={false}
          setCollapsed={() => {}}
          darkMode={darkMode}
        />
      </div>

      {/* 2. Primary Page Workspace (Topbar + Main Content Grid) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Top Header Controls Bar */}
        <Topbar
          currentTab={currentTab}
          setMobileSidebarOpen={setMobileSidebarOpen}
          mobileSidebarOpen={mobileSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenLoginModal={() => setIsLoginOpen(true)}
        />

        {/* Outer scrollable viewport dashboard area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          
          {/* Quick Informative Banner for new admins */}
          {isAdminLoggedIn && currentTab === 'manajemen' && (
            <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left animate-slide-in
              ${darkMode 
                ? 'bg-blue-950/40 border-blue-900 text-blue-300' 
                : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <ShieldAlert size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-extrabold">Mode Manajemen Panitia Berhasil Aktif</p>
                  <p className="text-[11px] opacity-80 mt-0.5">Status hewan saat diubah akan langsung dikirimkan langsung ke nomor ponsel masing-masing pekurban.</p>
                </div>
              </div>
              <button 
                onClick={() => setCurrentTab('public-portal')}
                className="text-[10px] uppercase font-mono font-bold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Lihat Uji Publik</span>
                <ArrowUpRight size={12} />
              </button>
            </div>
          )}

          {/* DYNAMIC SCREEN TAB MATCHING */}
          {currentTab === 'public-portal' && (
            <CustomerPortal darkMode={darkMode} />
          )}

          {currentTab === 'dashboard' && isAdminLoggedIn && (
            <DashboardView darkMode={darkMode} />
          )}

          {currentTab === 'manajemen' && isAdminLoggedIn && (
            <ManajemenView darkMode={darkMode} />
          )}

        </main>

        {/* Footer Credit Tag inside workspace */}
        <footer className={`h-12 border-t flex items-center justify-between px-6 text-[10px] font-medium tracking-wide shrink-0
          ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-100 text-slate-400'}`}>
          <div className="flex items-center gap-1">
            <span>Sistem Transparansi Qurban Shari'ah © 2026</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Dikembangkan Khusus Rumah Qurban Arafah</span>
            <Heart size={8} className="text-red-500 animate-pulse fill-red-500" />
          </div>
        </footer>

      </div>

      {/* 3. Panel Login Modal Controller */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <QurbanProvider>
      <AppContent />
    </QurbanProvider>
  );
}
