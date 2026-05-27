/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Pekurban, HistoryLog, StatusPenyembelihan, JenisHewan } from '../types';
import { db, auth, isFirebaseEnabled, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  User
} from 'firebase/auth';

interface QurbanContextProps {
  pekurbans: Pekurban[];
  loading: boolean;
  currentUser: User | null;
  localAdminUser: { email: string; displayName: string } | null;
  isFirebaseActive: boolean;
  firebaseError: string | null;
  
  // Actions
  createPekurban: (data: Omit<Pekurban, 'logs' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePekurban: (id: string, updates: Partial<Pekurban>, logKeterangan?: string) => Promise<void>;
  deletePekurban: (id: string) => Promise<void>;
  clearAllPekurbans: () => Promise<void>;
  getSinglePekurban: (id: string) => Promise<Pekurban | null>;
  loginGoogle: () => Promise<void>;
  loginLocalDemo: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const QurbanContext = createContext<QurbanContextProps | undefined>(undefined);

// Dummy Initial Data
const INITIAL_DUMMY_DATA: Pekurban[] = [
  {
    id: 'AQ-26-0001',
    namaPekurban: 'H. Bambang Hermanto',
    jenisHewan: 'Sapi',
    tipeHewan: 'Sapi Limousin Premium (Z-1)',
    beratHewan: 465,
    status: 'selesai',
    nomorTelepon: '081234567801',
    email: 'bambang.h@gmail.com',
    tanggalPenyembelihan: '2026-05-27',
    waktuPenyembelihan: '07:30',
    lokasiSembelih: 'Zona Utama RQA',
    linkVideo: 'https://drive.google.com/file/d/1_9v02d_Zf8EwzXg6v_1Qn8_xP7gO7eE2/view?usp=sharing',
    catatan: 'Daging dibagi rata menjadi 150 paket. Minta kepala dipisah untuk keluarga.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
    logs: [
      { id: '1', status: 'menunggu', keterangan: 'Hewan terdaftar di sistem', timestamp: '2026-05-26T07:00:00Z', operator: 'Fathur' },
      { id: '4', status: 'siap_sembelih', keterangan: 'Hewan digiring ke ruang steril penyembelihan', timestamp: '2026-05-27T07:15:00Z', operator: 'Gunawan' },
      { id: '5', status: 'sedang_sembelih', keterangan: 'Penyembelihan dipimpin oleh Ustadz Syaiful dengan lafadz takbir syari', timestamp: '2026-05-27T07:32:00Z', operator: 'Ustadz Syaiful' },
      { id: '6', status: 'sedang_kulit_potong', keterangan: 'Pengulitan dan pemisahan karkas menjadi bagian kecil', timestamp: '2026-05-27T07:45:00Z', operator: 'Tim Jagal B' },
      { id: '7', status: 'sedang_kemas', keterangan: 'Selesai ditimbang higenis, pengemasan menggunakan box ramah lingkungan', timestamp: '2026-05-27T08:10:00Z', operator: 'Tim Kemas' },
      { id: '8', status: 'siap_distribusi', keterangan: 'Daging qurban dalam cold storage siap diambil atau didistribusi', timestamp: '2026-05-27T08:30:00Z', operator: 'Logistik RQA' },
      { id: '9', status: 'selesai', keterangan: 'Seluruh paket qurban telah diserahkan sepenuhnya. Semoga berkah.', timestamp: '2026-05-27T09:00:00Z', operator: 'Logistik RQA' },
    ]
  },
  {
    id: 'AQ-26-0002',
    namaPekurban: 'Hj. Siti Aminah',
    jenisHewan: 'Kambing',
    tipeHewan: 'Kambing Etawa Super (Grade A)',
    beratHewan: 58,
    status: 'siap_sembelih',
    nomorTelepon: '085789123450',
    email: 'siti.aminah@yahoo.com',
    tanggalPenyembelihan: '2026-05-27',
    waktuPenyembelihan: '08:45',
    lokasiSembelih: 'Zona Kambing & Domba',
    linkVideo: '',
    catatan: 'Kaki & jeroan minta dibersihkan ekstra besih. Pekurban berencana menjemput langsung.',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    logs: [
      { id: '1', status: 'menunggu', keterangan: 'Kambing terdaftar dalam program mandiri', timestamp: '2026-05-26T10:00:00Z', operator: 'Fathur' },
      { id: '4', status: 'siap_sembelih', keterangan: 'Hewan dipindahkan ke ring bilik penyembelihan', timestamp: '2026-05-27T08:35:00Z', operator: 'Gunawan' }
    ]
  },
  {
    id: 'AQ-26-0003',
    namaPekurban: 'Dr. Aditya Wijaya',
    jenisHewan: 'Sapi',
    tipeHewan: 'Sapi Simmental Nusantara',
    beratHewan: 410,
    status: 'sedang_sembelih',
    nomorTelepon: '081398765432',
    email: 'aditya.wijaya@clinic.id',
    tanggalPenyembelihan: '2026-05-27',
    waktuPenyembelihan: '09:00',
    lokasiSembelih: 'Zona Utama RQA',
    linkVideo: '',
    catatan: 'Semua daging mohon dikoordinasikan untuk dikirim langsung ke Yayasan Panti Asuhan Al-Khoir.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    logs: [
      { id: '1', status: 'menunggu', keterangan: 'Sapi diproses administrasi', timestamp: '2026-05-26T11:00:00Z', operator: 'Fathur' },
      { id: '4', status: 'siap_sembelih', keterangan: 'Sapi diposisikan di Restraining Box anti-stres', timestamp: '2026-05-27T08:50:00Z', operator: 'Gunawan' },
      { id: '5', status: 'sedang_sembelih', keterangan: 'Proses pemotongan urat nadi utama sedang berjalan didampingi saksi', timestamp: '2026-05-27T09:02:00Z', operator: 'Ustadz Junaidi' }
    ]
  },
  {
    id: 'AQ-26-0004',
    namaPekurban: 'Ibu Ratna Kartika',
    jenisHewan: 'Domba',
    tipeHewan: 'Domba Garut Sungu Super',
    beratHewan: 46,
    status: 'sedang_kulit_potong',
    nomorTelepon: '082211993355',
    email: 'ratna_kartika@gmail.com',
    tanggalPenyembelihan: '2026-05-27',
    waktuPenyembelihan: '09:15',
    lokasiSembelih: 'Zona Kambing & Domba',
    linkVideo: '',
    catatan: 'Kulit domba disumbangkan ke pesantren kriya binaan RQA. Daging diantar ke rumah siang ini.',
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    logs: [
      { id: '1', status: 'menunggu', keterangan: 'Domba Garut didaftarkan via online', timestamp: '2026-05-26T12:00:00Z', operator: 'Online Admin' },
      { id: '4', status: 'siap_sembelih', keterangan: 'Domba dipindahkan ke zona sembelih kayu jati', timestamp: '2026-05-27T09:10:00Z', operator: 'Gunawan' },
      { id: '5', status: 'sedang_sembelih', keterangan: 'Penyembelihan syar’i selesai dikerjakan', timestamp: '2026-05-27T09:18:00Z', operator: 'Ustadz Syaiful' },
      { id: '6', status: 'sedang_kulit_potong', keterangan: 'Pemisahan bagian karkas utama dan pemisahan jeroan', timestamp: '2026-05-27T09:30:00Z', operator: 'Tim Jagal B' }
    ]
  },
  {
    id: 'AQ-26-0005',
    namaPekurban: 'Grup 7 Orang Al-Amanah',
    jenisHewan: 'Sapi',
    tipeHewan: 'Sapi Bali Super',
    beratHewan: 335,
    status: 'sedang_kemas',
    nomorTelepon: '08985554321',
    email: 'kelompok_amanah@gmail.com',
    tanggalPenyembelihan: '2026-05-27',
    waktuPenyembelihan: '09:30',
    lokasiSembelih: 'Zona Utama RQA',
    linkVideo: '',
    catatan: 'Daging dibagi menjadi 7 kantong utama terpisah untuk perwakilan pekurban.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
    logs: [
      { id: '1', status: 'menunggu', keterangan: 'Sapi Bali 7 Jiwa didaftarkan', timestamp: '2026-05-26T14:00:00Z', operator: 'Fathur' },
      { id: '4', status: 'siap_sembelih', keterangan: 'Dipindahkan ke area gantry utama', timestamp: '2026-05-27T09:20:00Z', operator: 'Gunawan' },
      { id: '5', status: 'sedang_sembelih', keterangan: 'Sudah disembelih dengan pemotongan esofagus-trakea-karotis sempurna', timestamp: '2026-05-27T09:31:00Z', operator: 'Ustadz Junaidi' },
      { id: '6', status: 'sedang_kulit_potong', keterangan: 'Proses pembersihan karkas dan pencucian jeroan hijau', timestamp: '2026-05-27T09:50:00Z', operator: 'Tim Jagal A' },
      { id: '7', status: 'sedang_kemas', keterangan: 'Pemasukan daging & tulang ke kemasan boks kedap udara RQA', timestamp: '2026-05-27T10:15:00Z', operator: 'Tim Packing' }
    ]
  },
  {
    id: 'AQ-26-0006',
    namaPekurban: 'Muhammad Reza P.',
    jenisHewan: 'Kambing',
    tipeHewan: 'Kambing Jawa Kacang',
    beratHewan: 33,
    status: 'menunggu',
    nomorTelepon: '081299887766',
    email: 'rezap@gmail.com',
    tanggalPenyembelihan: '2026-05-28',
    waktuPenyembelihan: '08:00',
    lokasiSembelih: 'Zona Kambing & Domba',
    linkVideo: '',
    catatan: 'Disembelih hari kedua tasyrik karena pekurban ingin hadir fisik menyembelih sendiri.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    logs: [
      { id: '1', status: 'menunggu', keterangan: 'Kambing Jawa didaftarkan online', timestamp: '2026-05-26T18:00:00Z', operator: 'Online Admin' },
    ]
  },
  {
    id: 'AQ-26-0007',
    namaPekurban: 'Drs. H. Ahmad Gozali',
    jenisHewan: 'Kerbau',
    tipeHewan: 'Kerbau Toraja Gemuk',
    beratHewan: 520,
    status: 'siap_sembelih',
    nomorTelepon: '085244556677',
    email: 'gozali.ahmad@gmail.com',
    tanggalPenyembelihan: '2026-05-27',
    waktuPenyembelihan: '10:30',
    lokasiSembelih: 'Zona Utama RQA',
    linkVideo: '',
    catatan: 'Mohon sisa potongan berupa hati disimpan untuk diserahkan ke Panitia Masjid Jami.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    logs: [
      { id: '1', status: 'menunggu', keterangan: 'Kerbau terdaftar di pos administrasi', timestamp: '2026-05-26T06:30:00Z', operator: 'Fathur' },
      { id: '4', status: 'siap_sembelih', keterangan: 'Kerbau tiba di Rumah Qurban Arafah dan diposisikan siap sembelih', timestamp: '2026-05-26T10:00:00Z', operator: 'Syarif' },
    ]
  },
  {
    id: 'AQ-26-0008',
    namaPekurban: 'Ibu Hajjah Maryam',
    jenisHewan: 'Sapi',
    tipeHewan: 'Sapi Bali Nusantara',
    beratHewan: 310,
    status: 'menunggu',
    nomorTelepon: '081377884411',
    email: 'maryam_h@islamic.id',
    tanggalPenyembelihan: '2026-05-28',
    waktuPenyembelihan: '09:45',
    lokasiSembelih: 'Zona Utama RQA',
    linkVideo: '',
    catatan: 'Minta hati sapi dipisahkan terpisah dari boks karkas daging.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    logs: [
      { id: '1', status: 'menunggu', keterangan: 'Sapi terdaftar secara aman di portal', timestamp: '2026-05-26T22:00:00Z', operator: 'Fathur' }
    ]
  }
];

export const QurbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pekurbans, setPekurbans] = useState<Pekurban[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [localAdminUser, setLocalAdminUser] = useState<{ email: string; displayName: string } | null>(null);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Load Initial Data
  useEffect(() => {
    if (isFirebaseEnabled && db) {
      // 1. Firebase Listeners
      setLoading(true);
      const qRef = collection(db, 'pekurban');
      const unsubscribe = onSnapshot(qRef, (snapshot) => {
        const items: Pekurban[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as Pekurban);
        });
        
        // Urutkan berdasarkan ID
        items.sort((a, b) => b.id.localeCompare(a.id));

        setPekurbans(items);
        setLoading(false);
      }, (error) => {
        setFirebaseError(error.message);
        handleFirestoreError(error, OperationType.LIST, 'pekurban');
        loadLocalStorageData();
      });

      // Listen Auth
      const unsubAuth = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
      });

      return () => {
        unsubscribe();
        unsubAuth();
      };
    } else {
      // 2. Local Storage Fallback Mode
      loadLocalStorageData();
    }
  }, []);

  const loadLocalStorageData = () => {
    setLoading(true);
    const stored = localStorage.getItem('arafah_pekurbans_2026');
    if (stored) {
      try {
        setPekurbans(JSON.parse(stored));
      } catch (err) {
        console.error("Gagal parsing LocalStorage:", err);
        setPekurbans(INITIAL_DUMMY_DATA);
      }
    } else {
      localStorage.setItem('arafah_pekurbans_2026', JSON.stringify(INITIAL_DUMMY_DATA));
      setPekurbans(INITIAL_DUMMY_DATA);
    }

    // Load Local User Session
    const storedUser = localStorage.getItem('arafah_admin_user');
    if (storedUser) {
      try {
        setLocalAdminUser(JSON.parse(storedUser));
      } catch (_) {}
    }
    setLoading(false);
  };

  // Sync to local storage if running in local mode
  const syncLocalStorage = (updatedList: Pekurban[]) => {
    localStorage.setItem('arafah_pekurbans_2026', JSON.stringify(updatedList));
    setPekurbans(updatedList);
  };

  // -------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------

  // 1. Create Data
  const createPekurban = async (data: Omit<Pekurban, 'logs' | 'createdAt' | 'updatedAt'>) => {
    const defaultLog: HistoryLog = {
      id: 'log-' + Date.now(),
      status: data.status,
      keterangan: 'Pendaftaran Qurban dan pendaftaran data hewan di database',
      timestamp: new Date().toISOString(),
      operator: currentUser?.displayName || localAdminUser?.displayName || 'Admin'
    };

    const newRecord: Pekurban = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [defaultLog]
    };

    if (isFirebaseEnabled && db) {
      try {
        await setDoc(doc(db, 'pekurban', newRecord.id), newRecord);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `pekurban/${newRecord.id}`);
      }
    } else {
      const newList = [newRecord, ...pekurbans];
      syncLocalStorage(newList);
    }
  };

  // 2. Update Data & Add Status Log
  const updatePekurban = async (id: string, updates: Partial<Pekurban>, logKeterangan?: string) => {
    const existingPekurban = pekurbans.find(p => p.id === id);
    if (!existingPekurban) throw new Error('Data Pekurban tidak ditemukan');

    const updatedLogs = [...existingPekurban.logs];
    
    // Jika ada perubahan status atau keterangan log diberikan, buat log sejarah baru
    if (updates.status && updates.status !== existingPekurban.status) {
      const getAlurKeterangan = (status: StatusPenyembelihan) => {
        switch (status) {
          case 'menunggu': return 'Menunggu hewan dikirim oleh penyedia ke kandang transit.';
          case 'siap_sembelih': return 'Hewan qurban dipindahkan ke bilik persiapan sembelih utama.';
          case 'sedang_sembelih': return 'Proses penyembelihan syariat oleh Tim Juru Sembelih RQA.';
          case 'sedang_kulit_potong': return 'Pengulitan tuntas, karkas diturunkan dan dibagi menjadi log-log daging & tulang.';
          case 'sedang_kemas': return 'Penimbangan daging higenis selesai, penyegelan boks qurban beralas organik.';
          case 'siap_distribusi': return 'Daging qurban dalam sirkulasi logistik RQA, siap diclaim atau siap antar.';
          case 'selesai': return 'Paket qurban resmi diterima seutuhnya. Jazakumullah khair.';
          default: return 'Perubahan status log.';
        }
      };

      updatedLogs.push({
        id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
        status: updates.status,
        keterangan: logKeterangan || getAlurKeterangan(updates.status),
        timestamp: new Date().toISOString(),
        operator: currentUser?.displayName || localAdminUser?.displayName || 'Admin RQA'
      });
    } else if (logKeterangan) {
      // Hanya menambah keterangan log tanpa merubah status utama
      updatedLogs.push({
        id: 'log-' + Date.now(),
        status: existingPekurban.status,
        keterangan: logKeterangan,
        timestamp: new Date().toISOString(),
        operator: currentUser?.displayName || localAdminUser?.displayName || 'Admin RQA'
      });
    }

    const mergedUpdates = {
      ...updates,
      logs: updatedLogs,
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseEnabled && db) {
      try {
        await updateDoc(doc(db, 'pekurban', id), mergedUpdates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `pekurban/${id}`);
      }
    } else {
      const newList = pekurbans.map(p => {
        if (p.id === id) {
          return { ...p, ...mergedUpdates };
        }
        return p;
      });
      syncLocalStorage(newList);
    }
  };

  // 3. Delete Data
  const deletePekurban = async (id: string) => {
    if (isFirebaseEnabled && db) {
      try {
        await deleteDoc(doc(db, 'pekurban', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `pekurban/${id}`);
      }
    } else {
      const newList = pekurbans.filter(p => p.id !== id);
      syncLocalStorage(newList);
    }
  };

  const clearAllPekurbans = async () => {
    if (isFirebaseEnabled && db) {
      try {
        const qRef = collection(db, 'pekurban');
        const snapshot = await getDocs(qRef);
        const promises: Promise<void>[] = [];
        snapshot.forEach((docSnap) => {
          promises.push(deleteDoc(docSnap.ref));
        });
        await Promise.all(promises);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `pekurban_all`);
      }
    } else {
      syncLocalStorage([]);
    }
  };

  // 4. Get Single Qurban (for konsumen tracking)
  const getSinglePekurban = async (id: string): Promise<Pekurban | null> => {
    if (isFirebaseEnabled && db) {
      try {
        const docRef = doc(db, 'pekurban', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as Pekurban;
        }
        return null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `pekurban/${id}`);
        // fallback to local list search
        return pekurbans.find(p => p.id === id || p.namaPekurban.toLowerCase().includes(id.toLowerCase())) || null;
      }
    } else {
      const match = pekurbans.find(p => p.id.toLowerCase() === id.toLowerCase() || p.namaPekurban.toLowerCase().includes(id.toLowerCase()));
      return match || null;
    }
  };

  // 5. Google Authentication
  const loginGoogle = async () => {
    if (isFirebaseEnabled && auth) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (err) {
        console.error("Gagal Google Login:", err);
      }
    } else {
      // Di luar Firebase, kita simulasikan login Admin Arafah 
      const mockUserDetails = {
        email: 'rumahqurbanarofah@gmail.com',
        displayName: 'Hj. Syaiful (Management)'
      };
      setLocalAdminUser(mockUserDetails);
      localStorage.setItem('arafah_admin_user', JSON.stringify(mockUserDetails));
    }
  };

  // 6. Local Demo / PIN Authentication (MANDATORY fallback)
  const loginLocalDemo = async (pin: string): Promise<boolean> => {
    if (pin === '2026' || pin.toLowerCase() === 'arafah2026') {
      const mockUserDetails = {
        email: 'rumahqurbanarofah@gmail.com',
        displayName: 'Administrasi RQA 2026'
      };
      
      if (isFirebaseEnabled && auth) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Gagal signInAnonymously:", err);
        }
      }

      setLocalAdminUser(mockUserDetails);
      localStorage.setItem('arafah_admin_user', JSON.stringify(mockUserDetails));
      return true;
    }
    return false;
  };

  // 7. Logout Authentication
  const logout = async () => {
    if (isFirebaseEnabled && auth) {
      await signOut(auth);
    } else {
      setLocalAdminUser(null);
      localStorage.removeItem('arafah_admin_user');
    }
  };

  return (
    <QurbanContext.Provider
      value={{
        pekurbans,
        loading,
        currentUser,
        localAdminUser,
        isFirebaseActive: isFirebaseEnabled,
        firebaseError,
        createPekurban,
        updatePekurban,
        deletePekurban,
        clearAllPekurbans,
        getSinglePekurban,
        loginGoogle,
        loginLocalDemo,
        logout
      }}
    >
      {children}
    </QurbanContext.Provider>
  );
};

export const useQurban = () => {
  const context = useContext(QurbanContext);
  if (context === undefined) {
    throw new Error('useQurban must be used within a QurbanProvider');
  }
  return context;
};
