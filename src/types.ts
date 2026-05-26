/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type JenisHewan = 'Sapi' | 'Kambing' | 'Domba' | 'Kerbau';

export type StatusPenyembelihan =
  | 'menunggu'          // Menunggu Hewan Tiba
  | 'diterima'          // Hewan Telah Diterima RQA
  | 'antemortem_aman'   // Pemeriksaan Antemortem & Sehat
  | 'siap_sembelih'     // Masuk Area Pemotongan
  | 'sedang_sembelih'   // Proses Penyembelihan (Sesuai Syariat)
  | 'sedang_kulit_potong' // Proses Pengulitan & Pemotongan Daging
  | 'sedang_kemas'      // Proses Penimbangan & Pengemasan (Higenis)
  | 'siap_distribusi'   // Siap Diserahkan / Didistribusikan
  | 'selesai';          // Proses Qurban Selesai Sempurna

export interface HistoryLog {
  id: string;
  status: StatusPenyembelihan;
  keterangan: string;
  timestamp: string;
  operator: string;
}

export interface Pekurban {
  id: string; // Kode unik qurban, misal: AQ-26-0001
  namaPekurban: string;
  jenisHewan: JenisHewan;
  tipeHewan: string; // Detail hewan, misal: "Sapi Limousin Jumbo", "Kambing Jawa Super"
  beratHewan: number; // Dalam kg
  status: StatusPenyembelihan;
  nomorTelepon: string;
  email: string;
  tanggalPenyembelihan: string; // YYYY-MM-DD
  waktuPenyembelihan: string; // HH:MM WIB
  lokasiSembelih: string; // Misal: "Zonasi Utama RQA", "Zonasi Timur RQA"
  linkVideo: string; // URL YouTube Live atau dokumentasi recording
  catatan: string; // Catatan khusus (misal: "Kemasan @ 1kg, kepala dipisah")
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  logs: HistoryLog[];
}

export interface DashboardStats {
  totalHewan: number;
  totalSapi: number;
  totalKambingDomba: number;
  selesaiSembelih: number;
  sedangProses: number;
  totalBeratKg: number;
}
