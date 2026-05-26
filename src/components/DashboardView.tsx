/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts';
import { 
  CheckCircle2, 
  Loader2, 
  Clock, 
  Activity, 
  Beef, 
  TrendingUp, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { useQurban } from '../context/QurbanContext';
import { Pekurban } from '../types';

interface DashboardViewProps {
  darkMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ darkMode }) => {
  const { pekurbans } = useQurban();

  // 1. KPI Calculations
  const totalCount = pekurbans.length;
  const completedCount = pekurbans.filter(p => p.status === 'selesai').length;
  const inProgressCount = pekurbans.filter(p => p.status !== 'selesai' && p.status !== 'menunggu').length;
  const waitingCount = pekurbans.filter(p => p.status === 'menunggu').length;
  const totalWeight = pekurbans.reduce((sum, p) => sum + p.beratHewan, 0);
  
  // Weights by type
  const sapiWeight = pekurbans.filter(p => p.jenisHewan === 'Sapi').reduce((sum, p) => sum + p.beratHewan, 0);
  const kambingDombaWeight = pekurbans.filter(p => p.jenisHewan === 'Kambing' || p.jenisHewan === 'Domba').reduce((sum, p) => sum + p.beratHewan, 0);

  // 2. Chart 1: Donut Chart of Animal Types
  const typeCounts = pekurbans.reduce((acc: Record<string, number>, p) => {
    acc[p.jenisHewan] = (acc[p.jenisHewan] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.keys(typeCounts).map(key => ({
    name: key,
    value: typeCounts[key]
  }));

  const COLORS_DONUT = ['#2563EB', '#6366F1', '#F59E0B', '#10B981'];

  // 3. Chart 2: Bar Chart of Progression Stages
  const stagesList = [
    { label: 'Menunggu', key: 'menunggu' },
    { label: 'Diterima', key: 'diterima' },
    { label: 'Antemortem', key: 'antemortem_aman' },
    { label: 'Siap Sembelih', key: 'siap_sembelih' },
    { label: 'Sedang Sembelih', key: 'sedang_sembelih' },
    { label: 'Kulit & Potong', key: 'sedang_kulit_potong' },
    { label: 'Sedang Kemas', key: 'sedang_kemas' },
    { label: 'Siap Distribusi', key: 'siap_distribusi' },
    { label: 'Selesai', key: 'selesai' },
  ];

  const stageChartData = stagesList.map(item => {
    return {
      name: item.label,
      'Jumlah Hewan': pekurbans.filter(p => p.status === item.key).length
    };
  });

  // 4. Chart 3: Line Chart (Progressive cumulative weight or hourly weight estimation)
  // Let's group average weight by animal type
  const avgWeightData = Object.keys(typeCounts).map(key => {
    const list = pekurbans.filter(p => p.jenisHewan === key);
    const sum = list.reduce((s, p) => s + p.beratHewan, 0);
    return {
      name: key,
      'Rerata Bobot (Kg)': Number((list.length ? sum / list.length : 0).toFixed(1))
    };
  });

  // Extract recent 4 events log to show in Dashboard Feed
  const recentLogs: { id: string; name: string; status: string; timestamp: string; operator: string; desc: string }[] = [];
  
  // Flatten logs with owners
  pekurbans.forEach(p => {
    p.logs.forEach(l => {
      recentLogs.push({
        id: l.id,
        name: p.namaPekurban,
        status: l.status,
        timestamp: l.timestamp,
        operator: l.operator,
        desc: l.keterangan
      });
    });
  });

  // Sort logs by newest
  recentLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const displayLogs = recentLogs.slice(0, 5);

  return (
    <div id="dashboard-view" className="space-y-6 text-left select-none pb-12">
      
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Total Animals */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between relative overflow-hidden
          ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Hewan</span>
            <p className="text-3xl font-black tracking-tight">{totalCount}</p>
            <span className="text-[10px] text-blue-500 font-bold block mt-1">Ekor Qurban Terdaftar</span>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 z-10 shrink-0">
            <Beef size={22} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full pointer-events-none" />
        </div>

        {/* KPI 2: Completed */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between relative overflow-hidden
          ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Selesai Jagal</span>
            <p className="text-3xl font-black tracking-tight text-emerald-500">{completedCount}</p>
            <span className="text-[10px] text-emerald-500 font-bold block mt-1">
              {totalCount ? Math.round((completedCount/totalCount)*100) : 0}% Sukses Terkirim
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500 z-10 shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full pointer-events-none" />
        </div>

        {/* KPI 3: In Progress */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between relative overflow-hidden
          ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Aktif Sedang Diolah</span>
            <p className="text-3xl font-black tracking-tight text-amber-500">{inProgressCount}</p>
            <span className="text-[10px] text-amber-500 font-bold block mt-1">
              Bilik Sembelih & Kemas
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 z-10 shrink-0">
            <Loader2 size={22} className="animate-spin" />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full pointer-events-none" />
        </div>

        {/* KPI 4: Total Weight */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between relative overflow-hidden
          ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Bobot Kelola</span>
            <p className="text-3xl font-black tracking-tight text-indigo-500">{totalWeight} <span className="text-xs font-bold">Kg</span></p>
            <span className="text-[10px] text-indigo-500 font-bold block mt-1">
              Sapi: {sapiWeight} Kg | Kmb/Dmb: {kambingDombaWeight} Kg
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-500 z-10 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/5 rounded-full pointer-events-none" />
        </div>

      </div>

      {/* CHARTS GRID SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Bar Chart - Stage Distribution of Animals */}
        <div className={`p-5 rounded-2xl border lg:col-span-8 flex flex-col space-y-4
          ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div>
            <h3 className="text-sm font-black tracking-tight uppercase text-blue-600 dark:text-blue-400">
              Distribusi Hewan per Tahapan Alur Sembelih
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Memantau penumpukan antrean hewan di setiap pos Rumah Qurban Arafah 2026.</p>
          </div>

          <div className="h-72 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#E2E8F0'} />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 9 }} stroke={darkMode ? '#334155' : '#CBD5E1'} />
                <YAxis allowDecimals={false} tick={{ fill: '#94A3B8', fontSize: 10 }} stroke={darkMode ? '#334155' : '#CBD5E1'} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                    borderColor: darkMode ? '#1e293b' : '#f1f5f9',
                    borderRadius: '8px',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="Jumlah Hewan" fill="#2563EB" radius={[4, 4, 0, 0]}>
                  {stageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 || index === 8 ? '#10B981' : '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart - Animal Types Spec */}
        <div className={`p-5 rounded-2xl border lg:col-span-4 flex flex-col space-y-4
          ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div>
            <h3 className="text-sm font-black tracking-tight uppercase text-blue-600 dark:text-blue-400">
              Proporsi Jenis Hewan
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Persentase pendaftaran jenis hewan qurban.</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center relative mt-3">
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_DONUT[index % COLORS_DONUT.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">Tidak ada data hewan</span>
            )}
            
            {/* Center Total overlay label */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black">{totalCount}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Hewan</span>
            </div>
          </div>

          {/* Donut Custom Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {typeChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS_DONUT[idx % COLORS_DONUT.length] }} />
                <span className="truncate">{item.name}</span>
                <span className="text-slate-400 font-mono ml-auto">({item.value} ekor)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Line Chart - Weight Stats */}
        <div className={`p-5 rounded-2xl border lg:col-span-5 flex flex-col space-y-4
          ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div>
            <h3 className="text-sm font-black tracking-tight uppercase text-blue-600 dark:text-blue-400">
              Rerata Bobot Jenis Hewan (Kg)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Statistik karkas hidup berdasarkan klasifikasi raw data.</p>
          </div>

          <div className="h-60 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={avgWeightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#E2E8F0'} />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} stroke={darkMode ? '#334155' : '#CBD5E1'} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} stroke={darkMode ? '#334155' : '#CBD5E1'} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                    borderColor: darkMode ? '#1e293b' : '#f1f5f9',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="Rerata Bobot (Kg)" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Realtime Action Logs Feed */}
        <div className={`p-5 rounded-2xl border lg:col-span-7 flex flex-col justify-between space-y-4
          ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="space-y-1">
            <h3 className="text-sm font-black tracking-tight uppercase text-blue-600 dark:text-blue-400">
              Garis Waktu Log Lapangan Terkini
            </h3>
            <p className="text-[11px] text-slate-400">Laporan realtime status penyembelihan langsung dari operator penyembelihan.</p>
          </div>

          {/* Event items list */}
          <div className="flex-1 mt-3 space-y-2.5 overflow-y-auto max-h-60 pr-1.5">
            {displayLogs.length > 0 ? (
              displayLogs.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-3 rounded-xl border text-[11px] flex items-start gap-3 transition-colors
                    ${darkMode ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-850' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 cursor-pointer" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold whitespace-nowrap">{log.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase
                        ${log.status === 'selesai' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                    <p className={`mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'} text-left truncate`}>
                      "{log.desc}"
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400">
                      <span>Operator: <strong>{log.operator}</strong></span>
                      <span className="font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID')} WIB
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-xs text-slate-500">
                Belum ada modifikasi log terekam.
              </div>
            )}
          </div>

          <div className={`pt-3 border-t flex justify-between items-center text-[10px] ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
            <span>Sinkronisasi Aktif</span>
            <Activity size={12} className="text-emerald-500 animate-pulse" />
          </div>

        </div>

      </div>

    </div>
  );
};
