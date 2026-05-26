/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  History, 
  LayoutDashboard, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  LogOut,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';
import { useQurban } from '../context/QurbanContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  darkMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  collapsed, 
  setCollapsed,
  darkMode
}) => {
  const { localAdminUser, currentUser, logout, isFirebaseActive } = useQurban();
  const isAdminLoggedIn = !!localAdminUser || !!currentUser;

  const menuItems = [
    { id: 'public-portal', label: 'Portal Konsumen', icon: Search, desc: 'Lacak proses qurban' },
    ...(isAdminLoggedIn ? [
      { id: 'dashboard', label: 'Statistik & Analisis', icon: LayoutDashboard, desc: 'KPI & Grafik RQA' },
      { id: 'manajemen', label: 'Manajemen Pekurban', icon: Users, desc: 'CRUD Data Hewan & Status' }
    ] : []),
  ];

  return (
    <aside 
      id="main-sidebar"
      className={`relative h-screen select-none border-r transition-all duration-300 ease-in-out flex flex-col
        ${darkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-800'}
        ${collapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Brand Header */}
      <div className={`p-5 flex items-center gap-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
          <BookOpen size={22} className="animate-pulse" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm tracking-tight leading-none text-blue-600 dark:text-blue-400">
              RUMAH QURBAN
            </span>
            <span className={`font-semibold text-xs tracking-wider opacity-90 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              ARAFAH 2026
            </span>
          </div>
        )}
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </p>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full group px-3 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 cursor-pointer text-left
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10 font-medium' 
                  : darkMode 
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon size={20} className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-blue-500'}`} />
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium leading-none">{item.label}</span>
                  <span className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </span>
                </div>
              )}
            </button>
          );
        })}

        {!isAdminLoggedIn && !collapsed && (
          <div className={`mt-8 p-4 rounded-xl border border-dashed ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-blue-50/50 border-blue-200'} text-xs`}>
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold mb-1">
              <ShieldAlert size={14} />
              <span>Akses Manajemen</span>
            </div>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
              Log masuk sebagai panitia penyembelihan untuk memperbarui status dan mengelola rekap data hewan di atas HP.
            </p>
          </div>
        )}
      </nav>

      {/* Connection Indicator & User Details */}
      <div className={`p-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'} space-y-3`}>
        {!collapsed && (
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className={`${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Database:</span>
            {isFirebaseActive ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Firestore Live
              </span>
            ) : (
              <span className="text-amber-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Lokal Offline
              </span>
            )}
          </div>
        )}

        {isAdminLoggedIn && (
          <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100/60'} flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            {!collapsed && (
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-bold truncate">
                  {localAdminUser?.displayName || currentUser?.displayName || 'Admin RQA'}
                </span>
                <span className={`text-[10px] truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {localAdminUser?.email || currentUser?.email || 'admin@qurbanarafah.com'}
                </span>
              </div>
            )}
            <button 
              onClick={logout} 
              title="Keluar" 
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Toggle Button for Desktop */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer shadow-sm
          ${darkMode 
            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' 
            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}
          hidden md:flex`}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};
