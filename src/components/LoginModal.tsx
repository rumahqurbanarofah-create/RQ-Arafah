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
  const { loginLocalDemo, loginGoogle } = useQurban();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const success = await loginLocalDemo(pin);
      if (success) {
        onClose();
      } else {
        setErrorMsg('PIN yang Anda masukkan salah.');
      }
    } catch (err: any) {
      setErrorMsg('Gagal Login: ' + err.message);
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

          <div className="relative my-4 flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-405 dark:text-slate-505 uppercase font-bold tracking-wider opacity-60">Atau</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setErrorMsg('');
              try {
                await loginGoogle();
                onClose();
              } catch (err: any) {
                setErrorMsg('Gagal Login Google: ' + err.message);
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-100 font-bold py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4c0,-0.37 -0.03,-0.72 -0.1,-1H21.35z" fill="#4285F4" />
                <path d="M12,20.5c2.3,0 4.23,-0.75 5.64,-2.1l-3.3,-2.6c-0.9,0.6 -2.07,0.98 -3.34,0.98 -2.57,0 -4.75,-1.74 -5.53,-4.07H2.05v2.7C3.5,18.3 7.47,20.5 12,20.5z" fill="#34A853" />
                <path d="M6.47,12.7c-0.2,-0.6 -0.31,-1.25 -0.31,-1.9c0,-0.65 0.11,-1.3 0.31,-1.9V6.2H2.05c-0.67,1.34 -1.05,2.83 -1.05,4.4s0.38,3.06 1.05,4.4L6.47,12.7z" fill="#FBBC05" />
                <path d="M12,6.5c1.25,0 2.37,0.43 3.25,1.27l2.43,-2.43C16.22,4.04 14.3,3.3 12,3.3 7.47,3.3 3.5,5.5 2.05,8.4l4.42,3.4C7.25,9.47 9.43,7.7 12,7.7z" fill="#EA4335" />
              </g>
            </svg>
            Masuk dengan Google Admin
          </button>


        </div>
      </div>
    </div>
  );
};
