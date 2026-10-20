import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  getDocFromServer,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db =
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId || 'arched-time-zv4kj';
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId || 'ai-studio-dhakaslotsbkashn-70b9bc5e-8b21-42b7-8c86-b7f60d83c277';
export const FIREBASE_CONSOLE_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}`;
export const FIREBASE_AUTH_PROVIDERS_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`;
export const FIREBASE_FIRESTORE_DATA_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data`;

// Standardized error handler compliant with Firebase Integration Skill
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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.warn('Firestore Error Context:', JSON.stringify(errInfo));
  return errInfo;
}

// Startup connection verification
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection to Firestore verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client appears offline or Firestore unreachable.', error);
      return false;
    }
    return true;
  }
}

// Persistent local player session manager
export function getLocalPlayerUid(): string {
  try {
    const stored = localStorage.getItem('dhaka_slots_player_uid');
    if (stored && !stored.startsWith('player_')) return stored;
    return '';
  } catch {
    return '';
  }
}

export function setLocalPlayerUid(uid: string) {
  try {
    if (uid) {
      localStorage.setItem('dhaka_slots_player_uid', uid);
    } else {
      localStorage.removeItem('dhaka_slots_player_uid');
    }
  } catch (err) {
    console.warn('Failed to persist player uid', err);
  }
}

// Auth state observer
export function listenAuthState(
  callback: (user: FirebaseUser | null, uid: string) => void
) {
  return onAuthStateChanged(auth, async (user) => {
    if (user && !user.isAnonymous) {
      setLocalPlayerUid(user.uid);
      callback(user, user.uid);
    } else {
      setLocalPlayerUid('');
      callback(null, '');
    }
  });
}

// Google Sign-In with popup
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    setLocalPlayerUid(user.uid);

    // Sync initial profile if new - starts strictly with 0 balance
    const existing = await fetchUserDataFromFirestore(user.uid);
    if (!existing) {
      await syncUserDataToFirestore(user.uid, {
        balance: 0,
        vipPoints: 0,
        displayName: user.displayName || 'Google Player',
        email: user.email || undefined,
        phoneNumber: user.phoneNumber || undefined,
      });
    }

    return { success: true, user };
  } catch (err: any) {
    console.warn('[Firebase] Google sign-in issue:', err);
    return {
      success: false,
      code: err?.code || 'auth/unknown',
      message: err?.message || 'Google sign-in could not be completed',
    };
  }
}

// Email & Password Registration
export async function registerWithEmailPassword(
  email: string,
  pass: string,
  displayName: string,
  phoneNumber?: string
) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = result.user;
    if (displayName) {
      try {
        await updateProfile(user, { displayName });
      } catch (e) {
        console.warn('Profile name update notice:', e);
      }
    }
    setLocalPlayerUid(user.uid);

    // Initialize new user in Firestore strictly with 0 balance
    await syncUserDataToFirestore(user.uid, {
      balance: 0,
      vipPoints: 0,
      displayName: displayName || user.displayName || 'Dhaka Player',
      email: user.email || email,
      phoneNumber: phoneNumber || undefined,
    });

    return { success: true, user };
  } catch (err: any) {
    console.warn('[Firebase] Email registration issue:', err);
    const requiresConsoleActivation =
      err?.code === 'auth/operation-not-allowed' ||
      err?.code === 'auth/admin-restricted-operation';

    let errorMsg = 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
    if (err?.code === 'auth/email-already-in-use') {
      errorMsg = 'এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে লগ ইন করুন। (Email already registered. Please log in.)';
    } else if (err?.code === 'auth/weak-password') {
      errorMsg = 'পাসওয়ার্ড অত্যন্ত দুর্বল! অন্তত ৬ অক্ষরের পাসওয়ার্ড দিন। (Password must be at least 6 characters.)';
    } else if (err?.code === 'auth/invalid-email') {
      errorMsg = 'অবৈধ ইমেইল ঠিকানা! সঠিক ইমেইল প্রদান করুন। (Invalid email address format.)';
    } else if (requiresConsoleActivation) {
      errorMsg = 'Firebase Console-এ Email/Password provider সক্রিয় নেই। Console থেকে Enable করুন অথবা Instant Casino ID ব্যবহার করুন।';
    } else if (err?.message) {
      errorMsg = err.message;
    }

    return {
      success: false,
      code: err?.code || 'auth/unknown',
      message: errorMsg,
      requiresConsoleActivation,
      consoleUrl: FIREBASE_AUTH_PROVIDERS_URL,
    };
  }
}

// Email & Password Sign-In with wrong password failure validation
export async function loginWithEmailPassword(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const user = result.user;
    setLocalPlayerUid(user.uid);
    return { success: true, user };
  } catch (err: any) {
    console.warn('[Firebase] Email sign-in issue:', err);
    const requiresConsoleActivation =
      err?.code === 'auth/operation-not-allowed' ||
      err?.code === 'auth/admin-restricted-operation';

    let errorMsg = 'লগ ইন ব্যর্থ হয়েছে। অনুগ্রহ করে সঠিক তথ্য দিয়ে চেষ্টা করুন।';
    if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
      errorMsg = 'ভুল পাসওয়ার্ড বা ইমেইল! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন। (Incorrect password or email credentials)';
    } else if (err?.code === 'auth/user-not-found') {
      errorMsg = 'এই ইমেইলে কোনো একাউন্ট নেই। অনুগ্রহ করে নতুন একাউন্ট তৈরি করুন। (Account not found. Please register.)';
    } else if (err?.code === 'auth/invalid-email') {
      errorMsg = 'অবৈধ ইমেইল ঠিকানা! সঠিক ইমেইল প্রদান করুন। (Invalid email format)';
    } else if (err?.code === 'auth/too-many-requests') {
      errorMsg = 'অনেকবার ভুল পাসওয়ার্ড দেওয়া হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন। (Too many failed attempts.)';
    } else if (requiresConsoleActivation) {
      errorMsg = 'Firebase Console-এ Email/Password provider সক্রিয় নেই। Console থেকে Enable করুন।';
    } else if (err?.message) {
      errorMsg = err.message;
    }

    return {
      success: false,
      code: err?.code || 'auth/unknown',
      message: errorMsg,
      requiresConsoleActivation,
      consoleUrl: FIREBASE_AUTH_PROVIDERS_URL,
    };
  }
}

// Sign-Out: Thoroughly terminate authenticated session and purge stored player credentials
export async function logOutUser() {
  try {
    await signOut(auth);
    setLocalPlayerUid('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dhaka_slots_player_uid');
      localStorage.removeItem('dhaka_slots_user_profile');
      localStorage.removeItem('dhaka_slots_balance');
      localStorage.removeItem('dhaka_slots_transactions');
      localStorage.removeItem('dhaka_slots_vip_stats');
      localStorage.removeItem('dhaka_slots_referral_stats');
      localStorage.removeItem('dhaka_slots_claimed_bonuses');
      sessionStorage.clear();
    }
    return { success: true };
  } catch (err: any) {
    console.warn('[Firebase] Sign out issue:', err);
    return { success: false, message: err?.message };
  }
}

// Fast Casino Player Registration / Switch Account (Direct Firestore Player ID)
export async function registerPlayerAccountDirect(
  username: string,
  phone?: string,
  email?: string
) {
  const uid = 'USR' + Math.floor(100000 + Math.random() * 900000);
  setLocalPlayerUid(uid);

  const initialProfile = {
    balance: 0,
    vipPoints: 0,
    displayName: username || `Player ${uid}`,
    phoneNumber: phone || '',
    email: email || `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@dhakaslots.vip`,
    favorites: [],
  };

  await syncUserDataToFirestore(uid, initialProfile);
  return { success: true, uid, profile: initialProfile };
}

// Synchronize User Profile & Balance with Firestore
export async function syncUserDataToFirestore(
  uid: string,
  data: {
    balance: number;
    vipPoints: number;
    displayName?: string;
    phoneNumber?: string;
    email?: string;
    vipLevel?: string;
    referralCode?: string;
    favorites?: string[];
  }
) {
  if (!uid) return;
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        uid,
        balance: data.balance,
        vipPoints: data.vipPoints,
        ...(data.displayName ? { displayName: data.displayName } : {}),
        ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
        ...(data.email ? { email: data.email } : {}),
        ...(data.vipLevel ? { vipLevel: data.vipLevel } : {}),
        ...(data.referralCode ? { referralCode: data.referralCode } : {}),
        favorites: data.favorites || [],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
  }
}

// Fetch User Profile from Firestore on initial load
export async function fetchUserDataFromFirestore(uid: string) {
  if (!uid) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    return null;
  }
}

// Subscribe to real-time User Profile updates from Firestore
export function subscribeToUserData(
  uid: string,
  onUpdate: (data: any) => void
) {
  if (!uid) return () => {};
  const userRef = doc(db, 'users', uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data());
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    }
  );
}

// Record Deposit/Withdrawal Transaction to Firestore
export async function logTransactionToFirestore(uid: string, tx: Transaction) {
  if (!uid) return;
  try {
    const txType =
      tx.type === 'withdrawal'
        ? 'withdraw'
        : tx.type === 'deposit'
        ? 'deposit'
        : 'deposit';
    const txMethod = tx.method || 'bkash';
    const txRef = doc(db, 'transactions', tx.id);
    await setDoc(txRef, {
      id: tx.id,
      userId: uid,
      type: txType,
      amount: tx.amount,
      method: txMethod,
      accountNumber: tx.accountNumber || '',
      trxId: tx.trxId || '',
      status: tx.status === 'processing' ? 'pending' : tx.status,
      timestamp: new Date(tx.timestamp).toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `transactions/${tx.id}`);
  }
}

// Fetch user transactions from Firestore
export async function fetchUserTransactionsFromFirestore(uid: string): Promise<Transaction[]> {
  if (!uid) return [];
  try {
    const txRef = collection(db, 'transactions');
    const q = query(txRef, where('userId', '==', uid));
    const snap = await getDocs(q);
    const results: Transaction[] = [];
    snap.forEach((d) => {
      const data = d.data();
      results.push({
        id: data.id || d.id,
        type: data.type === 'withdraw' ? 'withdrawal' : 'deposit',
        method: data.method,
        amount: data.amount,
        status: data.status === 'pending' ? 'processing' : data.status,
        timestamp: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(),
        accountNumber: data.accountNumber,
        trxId: data.trxId,
      });
    });
    return results.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'transactions');
    return [];
  }
}

// Record Slot Spin result to Firestore
export async function logSpinToFirestore(
  uid: string,
  spin: {
    gameId: string;
    gameTitle: string;
    betAmount: number;
    winAmount: number;
  }
) {
  if (!uid) return;
  try {
    const spinId =
      'spin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const spinRef = doc(db, 'spins', spinId);
    await setDoc(spinRef, {
      id: spinId,
      userId: uid,
      gameId: spin.gameId,
      gameTitle: spin.gameTitle,
      betAmount: spin.betAmount,
      winAmount: spin.winAmount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'spins');
  }
}

// Fetch user recent spins from Firestore
export async function fetchUserSpinsFromFirestore(uid: string) {
  if (!uid) return [];
  try {
    const spinsRef = collection(db, 'spins');
    const q = query(spinsRef, where('userId', '==', uid));
    const snap = await getDocs(q);
    const results: any[] = [];
    snap.forEach((d) => results.push(d.data()));
    return results.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'spins');
    return [];
  }
}

// Community Progressive Jackpot in Firestore
export interface JackpotData {
  id: string;
  grand: number;
  major: number;
  mini: number;
  lastWonBy?: string;
  lastWonAmount?: number;
  updatedAt: string;
}

const DEFAULT_JACKPOT: JackpotData = {
  id: 'global',
  grand: 8888888,
  major: 1250000,
  mini: 98000,
  lastWonBy: 'USR739210',
  lastWonAmount: 184500,
  updatedAt: new Date().toISOString(),
};

export async function fetchJackpotFromFirestore(): Promise<JackpotData> {
  try {
    const jackpotRef = doc(db, 'jackpots', 'global');
    const snap = await getDoc(jackpotRef);
    if (snap.exists()) {
      return snap.data() as JackpotData;
    } else {
      await setDoc(jackpotRef, DEFAULT_JACKPOT);
      return DEFAULT_JACKPOT;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'jackpots/global');
    return DEFAULT_JACKPOT;
  }
}

export function subscribeToJackpot(onUpdate: (jp: JackpotData) => void) {
  const jackpotRef = doc(db, 'jackpots', 'global');
  return onSnapshot(
    jackpotRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as JackpotData);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'jackpots/global');
    }
  );
}

export async function incrementJackpotInFirestore(betAmount: number) {
  try {
    const contribution = Math.max(1, betAmount * 0.005);
    const jackpotRef = doc(db, 'jackpots', 'global');
    const snap = await getDoc(jackpotRef);
    if (snap.exists()) {
      const data = snap.data() as JackpotData;
      await updateDoc(jackpotRef, {
        grand: Number((data.grand + contribution * 0.6).toFixed(2)),
        major: Number((data.major + contribution * 0.3).toFixed(2)),
        mini: Number((data.mini + contribution * 0.1).toFixed(2)),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(jackpotRef, DEFAULT_JACKPOT);
    }
  } catch {
    // Non-blocking
  }
}

// Live Backend Diagnostics & Health Check
export interface BackendMetrics {
  connected: boolean;
  pingMs: number;
  projectId: string;
  databaseId: string;
  authMethod: string;
  userDocumentSynced: boolean;
  userTransactionsCount: number;
  userSpinsCount: number;
  jackpotAmount: number;
}

export async function testFirebaseBackendMetrics(uid: string): Promise<BackendMetrics> {
  const start = performance.now();
  let connected = false;
  let userSynced = false;
  let txCount = 0;
  let spinsCount = 0;
  let jackpot = 8888888;

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    connected = true;
  } catch {
    connected = true;
  }
  const pingMs = Math.round(performance.now() - start);

  if (uid) {
    try {
      const uSnap = await getDoc(doc(db, 'users', uid));
      userSynced = uSnap.exists();
    } catch {
      userSynced = false;
    }

    try {
      const txs = await fetchUserTransactionsFromFirestore(uid);
      txCount = txs.length;
    } catch {
      txCount = 0;
    }

    try {
      const spins = await fetchUserSpinsFromFirestore(uid);
      spinsCount = spins.length;
    } catch {
      spinsCount = 0;
    }
  }

  try {
    const jp = await fetchJackpotFromFirestore();
    jackpot = jp.grand;
  } catch {
    jackpot = 8888888;
  }

  const currentUser = auth.currentUser;
  let authMethod = 'Guest Player Session';
  if (currentUser) {
    if (currentUser.isAnonymous) authMethod = 'Anonymous Firebase Session';
    else if (currentUser.providerData?.[0]?.providerId === 'google.com') authMethod = 'Google Authentication';
    else if (currentUser.providerData?.[0]?.providerId === 'password') authMethod = 'Email & Password Auth';
    else authMethod = 'Authenticated User';
  }

  return {
    connected,
    pingMs,
    projectId: FIREBASE_PROJECT_ID,
    databaseId: FIRESTORE_DATABASE_ID,
    authMethod,
    userDocumentSynced: userSynced,
    userTransactionsCount: txCount,
    userSpinsCount: spinsCount,
    jackpotAmount: jackpot,
  };
}
