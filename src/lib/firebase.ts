/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Periksa apakah konfigurasi Firebase valid dan bukan placeholder
export const isFirebaseEnabled =
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'placeholder-api-key' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'placeholder-project-id';

let db: any = null;
let auth: any = null;

if (isFirebaseEnabled) {
  try {
    const app = initializeApp(firebaseConfig);
    const config = firebaseConfig as any;
    const dbId = config.firestoreDatabaseId;
    if (dbId && dbId !== '(default)') {
      db = getFirestore(app, dbId);
    } else {
      db = getFirestore(app);
    }
    auth = getAuth(app);
    console.log("Firebase Firestore & Auth diaktifkan secara sukses.");
  } catch (error) {
    console.error("Gagal menginisialisasi Firebase SDK:", error);
  }
} else {
  console.log("Aplikasi berjalan dalam mode LOKAL OFFLINE. Semua data tersimpan di LocalStorage.");
}

export { db, auth };

// Firestore Error Diagnostic System (Mandated by skill rules)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
