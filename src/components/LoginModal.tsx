/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, ShieldCheck } from 'lucide-react';
import { useQurban } from '../context/QurbanContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, darkMode }) => {
  const { loginLocalDemo } = useQurban();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmitPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginLocalDemo(pin);
    if (success) {
      onClose();
    } else {
      setErrorMsg('PIN yang Anda masukkan salah.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div 
        className={`relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transition-all border transform scale-100
          ${darkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-800'}`}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={22} className="text-emerald-300" />
            <span className="text-[10px] tracking-widest font-bold uppercase opacity-80">Sistem Autentikasi RQA</span>
          </div>
          <h3 className="text-lg font-bold">Gerbang Manajemen Panitia</h3>
          <p className="text-xs text-blue-100 mt-1">Gunakan PIN atau Google SSO untuk mengakses fitur pelaporan & CRUD.</p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex gap-2">
              <span className="font-bold">Error:</span>
              <p className="flex-1 text-left">{errorMsg}</p>
            </div>
          )}

          {/* PIN Input Form */}
          <form onSubmit={handleSubmitPin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                PIN Akses Cepat / Demo
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-500" />
                <input
                  type="password"
                  placeholder="Masukkan PIN Akses..."
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-semibold transition-colors outline-none border focus:border-blue-500
                    ${darkMode 
                      ? 'bg-slate-950 border-slate-800 text-slate-100' 
                      : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Uji Coba PIN Sistem
            </button>
          </form>


        </div>
      </div>
    </div>
  );
};
