import { db, auth } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  addDoc, 
  deleteDoc
} from "firebase/firestore";
import { 
  User, 
  UserRole, 
  UserStatus, 
  MedicalInstitution, 
  OrganizationRequest,
  MedicalRecord,
  Prescription,
  LabResult,
  RadiologyReport,
  Notification,
  AuditLog,
  EmergencyInfo
} from "../types";
import { 
  INITIAL_INSTITUTIONS, 
  INITIAL_USERS
} from "../data/baselineData";

/**
 * -------------------------------------------------------------
 * FIREBASE FIRESTORE SERVICE - ARCHITECTURE & ROLE RULES
 * -------------------------------------------------------------
 */

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('[Firestore Custom Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export let lastFirebaseError: string | null = null;

export function clearLastFirebaseError() {
  lastFirebaseError = null;
}

// Internal cache for user profile roles
let cachedUserRole: UserRole | null = null;
let cachedUid: string | null = null;

export function clearUserRoleCache() {
  cachedUserRole = null;
  cachedUid = null;
}

export async function resolveCurrentUserProfile(): Promise<{ role: UserRole | null; uid: string | null; email: string | null }> {
  const user = auth.currentUser;
  if (!user) {
    console.log("[Firestore Role Resolver] No current auth user detected.");
    return { role: null, uid: null, email: null };
  }
  if (cachedUid === user.uid && cachedUserRole !== null) {
    console.log(`[Firestore Role Resolver] Cache hit: uid=${user.uid}, role=${cachedUserRole}`);
    return { role: cachedUserRole, uid: user.uid, email: user.email };
  }
  try {
    console.log(`[Firestore Role Resolver] DB lookup for users/${user.uid}...`);
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data() as User;
      console.log(`[Firestore Role Resolver] Succesfully resolved role from DB: users/${user.uid} -> role=${data.role}`);
      cachedUserRole = data.role;
      cachedUid = user.uid;
      return { role: data.role, uid: user.uid, email: user.email };
    } else {
      console.warn(`[Firestore Role Resolver] Document users/${user.uid} does NOT exist in Firestore.`);
    }
  } catch (e) {
    console.warn("[Firestore Role Resolver Warning] Access restricted reading own profile users/" + user.uid + ":", e);
  }
  return { role: null, uid: user.uid, email: user.email };
}

// 1. Initial baseline seeding to ensure the database is populated on clean runs
export async function seedFirestoreIfNeeded(): Promise<void> {
  try {
    // Check and seed institutions
    try {
      const instSnap = await getDocs(collection(db, "institutions"));
      if (instSnap.empty) {
        console.log("[Firestore] Seeding baseline institutions...");
        for (const inst of INITIAL_INSTITUTIONS) {
          await setDoc(doc(db, "institutions", inst.id), inst);
        }
      }
    } catch (e: any) {
      console.log("[Firestore Seeding] Skipping institutions seeding or checking due to permissions/status:", e?.message || e);
    }

    // Check and seed users
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      if (usersSnap.empty) {
        console.log("[Firestore] Seeding baseline users...");
        for (const user of INITIAL_USERS) {
          await setDoc(doc(db, "users", user.id), {
            ...user,
            uid: user.id
          });
        }
      }
    } catch (e: any) {
      console.log("[Firestore Seeding] Skipping users seeding or checking due to permissions/status:", e?.message || e);
    }

    lastFirebaseError = null; // Reset error on successful initial check sequence
  } catch (err: any) {
    console.warn("[Firestore] Database seeding sequence bypassed:", err?.message || err);
  }
}


// 2. Profile Creation & Retrieval
export async function saveUserProfile(uid: string, profile: Partial<User>): Promise<void> {
  try {
    console.log(`[Firestore] Creating/updating user profile for UID: ${uid}`, profile);
    const userRef = doc(db, "users", uid);
    
    // Core user required fields
    const payload = {
      ...profile,
      uid,
      id: uid, // Align Firestore doc ID with internal field references
      createdAt: (profile as any).createdAt || profile.joinedDate || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ensure we do not store undefined fields
    Object.keys(payload).forEach(key => {
      if ((payload as any)[key] === undefined) {
        delete (payload as any)[key];
      }
    });

    await setDoc(userRef, payload, { merge: true });
    console.log(`[Firestore] Registration success: Profile created successfully for UID: ${uid}`);
    if (uid === auth.currentUser?.uid) {
      clearUserRoleCache();
    }
    lastFirebaseError = null;
  } catch (err: any) {
    console.error(`[Firestore] Error creating user profile document users/${uid}:`, err);
    lastFirebaseError = err?.message || String(err);
    throw err;
  }
}

export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    console.log(`[Firestore] Login profile loading: Fetching users/${uid}`);
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      console.warn(`[Firestore] Firestore user document users/${uid} does not exist.`);
      return null;
    }
    const data = snap.data() as User;
    console.log(`[Firestore] Role detection: User role is '${data.role}', Status is '${data.status}'`);
    if (uid === auth.currentUser?.uid) {
      cachedUserRole = data.role;
      cachedUid = uid;
    }
    lastFirebaseError = null;
    return data;
  } catch (err: any) {
    console.error(`[Firestore] Display Firestore error reading users/${uid}:`, err);
    lastFirebaseError = err?.message || String(err);
    throw err;
  }
}

// Load all users
export async function loadFirestoreUsers(): Promise<User[]> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.log("[Firestore] No authenticated user present on loadFirestoreUsers.");
      return [];
    }

    const { role } = await resolveCurrentUserProfile();
    if (role === UserRole.PATIENT) {
      console.log("[Firestore] Patient role detected. Direct-loading active user profile users/" + uid);
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        lastFirebaseError = null;
        return [userDoc.data() as User];
      }
      return [];
    }

    try {
      const snap = await getDocs(collection(db, "users"));
      const list: User[] = [];
      snap.forEach(d => list.push(d.data() as User));
      lastFirebaseError = null;
      return list;
    } catch (innerErr: any) {
      console.log("[Firestore] Listing all users is restricted. Direct-loading active authenticated user profile.");
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        lastFirebaseError = null;
        return [userDoc.data() as User];
      }
      return [];
    }
  } catch (err: any) {
    console.error("[Firestore] Display Firestore error loading users:", err);
    lastFirebaseError = err?.message || String(err);
    return [];
  }
}


// 3. Onboarding Requests Creation
export async function createDoctorRequest(request: {
  doctorUid: string;
  doctorName: string;
  institutionId: string;
  institutionName: string;
  specialty: string;
  status: string;
  createdAt: string;
}): Promise<void> {
  try {
    console.log("[Firestore] Creating doctorRequest document...", request);
    // Use doctorUid as document ID to ensure a single, clean pending request per doctor
    await setDoc(doc(db, "doctorRequests", request.doctorUid), request);
    console.log(`[Firestore] Doctor request creation success for UID: ${request.doctorUid}`);
  } catch (err: any) {
    console.error("[Firestore] Display Firestore error during doctor request creation:", err);
    throw err;
  }
}

// 4. Pending Requests Loading
export async function loadPendingDoctorRequests(): Promise<any[]> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    
    const { role } = await resolveCurrentUserProfile();
    if (role === UserRole.ADMIN) {
      console.log("[Firestore] Loading doctorRequests where status == 'pending' (Admin Mode)...");
      const q = query(collection(db, "doctorRequests"), where("status", "==", "pending"));
      const snap = await getDocs(q);
      const results: any[] = [];
      snap.forEach(d => results.push(d.data()));
      return results;
    } else {
      console.log("[Firestore] Direct-loading active doctor request document.");
      const directDoc = await getDoc(doc(db, "doctorRequests", uid));
      if (directDoc.exists() && directDoc.data().status === 'pending') {
        return [directDoc.data()];
      }
      return [];
    }
  } catch (err: any) {
    console.error("[Firestore] Display Firestore error reading pending doctorRequests:", err);
    return [];
  }
}

// 5. Approving / Rejecting Onboarding Request
export async function approveDoctorRequest(doctorUid: string): Promise<void> {
  try {
    console.log(`[Firestore] Approval actions: Approving doctor UID: ${doctorUid}`);
    // 1. Update user profile
    await updateDoc(doc(db, "users", doctorUid), {
      status: UserStatus.ACTIVE
    });
    // 2. Update request
    await updateDoc(doc(db, "doctorRequests", doctorUid), {
      status: "approved"
    });
    console.log(`[Firestore] Approval success for Doctor UID: ${doctorUid}`);
  } catch (err: any) {
    console.error(`[Firestore] Display Firestore error in approveDoctorRequest for ${doctorUid}:`, err);
    throw err;
  }
}

export async function rejectDoctorRequest(doctorUid: string): Promise<void> {
  try {
    console.log(`[Firestore] Approval actions: Rejecting doctor UID: ${doctorUid}`);
    // 1. Update user profile
    await updateDoc(doc(db, "users", doctorUid), {
      status: UserStatus.DECLINED
    });
    // 2. Update request
    await updateDoc(doc(db, "doctorRequests", doctorUid), {
      status: "rejected"
    });
    console.log(`[Firestore] Rejection logged successfully for Doctor UID: ${doctorUid}`);
  } catch (err: any) {
    console.error(`[Firestore] Display Firestore error in rejectDoctorRequest for ${doctorUid}:`, err);
    throw err;
  }
}

// 5.5 Insurance Onboarding & Requests
export async function createInsuranceRequest(request: {
  insuranceUid: string;
  insuranceName: string;
  companyId: string;
  companyName: string;
  status: string;
  createdAt: string;
}): Promise<void> {
  try {
    console.log("[Firestore] Creating insuranceRequest document...", request);
    await setDoc(doc(db, "insuranceRequests", request.insuranceUid), request);
  } catch (err: any) {
    console.error("[Firestore] Error during insurance request creation:", err);
    throw err;
  }
}

export async function approveInsuranceRequest(insuranceUid: string): Promise<void> {
  try {
    console.log(`[Firestore] Approving insurance UID: ${insuranceUid}`);
    await updateDoc(doc(db, "users", insuranceUid), {
      status: UserStatus.ACTIVE
    });
    await updateDoc(doc(db, "insuranceRequests", insuranceUid), {
      status: "approved"
    });
  } catch (err: any) {
    console.error(`[Firestore] Error in approveInsuranceRequest:`, err);
    throw err;
  }
}

export async function rejectInsuranceRequest(insuranceUid: string): Promise<void> {
  try {
    console.log(`[Firestore] Rejecting insurance UID: ${insuranceUid}`);
    await updateDoc(doc(db, "users", insuranceUid), {
      status: UserStatus.DECLINED
    });
    await updateDoc(doc(db, "insuranceRequests", insuranceUid), {
      status: "rejected"
    });
  } catch (err: any) {
    console.error(`[Firestore] Error in rejectInsuranceRequest:`, err);
    throw err;
  }
}

export async function loadFirestoreInsuranceCompanies(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, "insuranceCompanies"));
    const list: any[] = [];
    snap.forEach(d => list.push(d.data()));
    return list;
  } catch (err: any) {
    console.error("[Firestore] Error loading insuranceCompanies:", err);
    return [];
  }
}

// 6. Organization Lists Loading
export async function loadFirestoreInstitutions(): Promise<MedicalInstitution[]> {
  try {
    const snap = await getDocs(collection(db, "institutions"));
    const list: MedicalInstitution[] = [];
    snap.forEach(d => list.push(d.data() as MedicalInstitution));
    return list.slice(0);
  } catch (err: any) {
    console.warn("[Firestore] Skipping loading institutions database due to restricted access or guest status:", err?.message || err);
    return [];
  }
}

// 7. Organization Requests
export async function createOrganizationRequestInFirestore(request: OrganizationRequest): Promise<void> {
  try {
    console.log("[Firestore] Creating organizationRequest inside Firestore...", request);
    await setDoc(doc(db, "organizationRequests", request.id), request);
  } catch (err: any) {
    console.error("[Firestore] Display Firestore error creating organizationRequest:", err);
    throw err;
  }
}

export async function loadFirestoreOrganizationRequests(): Promise<OrganizationRequest[]> {
  try {
    const email = auth.currentUser?.email;
    if (!email) return [];

    const { role } = await resolveCurrentUserProfile();
    if (role === UserRole.ADMIN) {
      console.log("[Firestore] Loading organizationRequests (Admin Mode)...");
      const snap = await getDocs(collection(db, "organizationRequests"));
      const list: OrganizationRequest[] = [];
      snap.forEach(d => list.push(d.data() as OrganizationRequest));
      return list;
    } else {
      console.log("[Firestore] Loading organizationRequests matching requesterEmail: " + email);
      const q = query(collection(db, "organizationRequests"), where("requesterEmail", "==", email));
      const qSnap = await getDocs(q);
      const list: OrganizationRequest[] = [];
      qSnap.forEach(d => list.push(d.data() as OrganizationRequest));
      return list;
    }
  } catch (err: any) {
    console.warn("[Firestore] Skipping loading organization requests database due to permissions:", err?.message || err);
    return [];
  }
}

export async function approveOrganizationRequestInFirestore(reqId: string, type: 'INSTITUTION', name: string, details: string): Promise<void> {
  try {
    console.log(`[Firestore] Approving organization request ID: ${reqId}, Name: ${name}, Type: ${type}`);
    // 1. Update request status
    await updateDoc(doc(db, "organizationRequests", reqId), {
      status: "APPROVED"
    });

    // 2. Add resource directly to available selection options
    if (type === 'INSTITUTION') {
      const newInst: MedicalInstitution = {
        id: `inst-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        type: 'Clinic',
        address: details || 'Awaiting registered address details',
        city: 'Cairo',
        country: 'Egypt',
        contactEmail: 'contact@medicalnode.com',
        contactPhone: '+20 (2) 111-2222',
        status: 'Active',
        specialties: ['General Medicine', 'Internal Medicine', 'Cardiological Sciences']
      };
      await setDoc(doc(db, "institutions", newInst.id), newInst);
      console.log(`[Firestore] New Medical Institution appended successfully in Firestore: ${name}`);
    }
  } catch (err: any) {
    console.error(`[Firestore] Display Firestore error in approveOrganizationRequest for ${reqId}:`, err);
    throw err;
  }
}

export async function rejectOrganizationRequestInFirestore(reqId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "organizationRequests", reqId), {
      status: "REJECTED"
    });
  } catch (err: any) {
    console.error(`[Firestore] Display Firestore error on rejectOrganizationRequest for ${reqId}:`, err);
    throw err;
  }
}

// 8. Shared Operational Collections Load/Save helpers
export async function loadCollection<T>(colName: string): Promise<T[]> {
  try {
    const uid = auth.currentUser?.uid;
    const email = auth.currentUser?.email;
    if (!uid) {
      console.log(`[Firestore] No authenticated user. Skipping remote fetch for: ${colName}`);
      return [];
    }

    const { role } = await resolveCurrentUserProfile();
    console.log(`[Firestore loadCollection] Fetching colName="${colName}" starting... uid="${uid}", role="${role}"`);

    let q: any = null;

    if (colName === "departments" || colName === "institutions") {
      // 1. Fully public lookup directories
      q = collection(db, colName);
    } 
    else if (colName === "medicalRecords" || colName === "prescriptions" || colName === "labResults" || colName === "radiologyReports") {
      // 2. Patient chart objects
      if (role === UserRole.PATIENT) {
        q = query(collection(db, colName), where("patientId", "==", uid));
      } else if (role === UserRole.DOCTOR || role === UserRole.ADMIN) {
        q = collection(db, colName);
      } else {
        return [];
      }
    } 
    else if (colName === "notifications") {
      // 3. Personal Notifications
      if (role === UserRole.ADMIN) {
        q = collection(db, colName);
      } else {
        q = query(collection(db, colName), where("userId", "==", uid));
      }
    } 
    else if (colName === "auditLogs") {
      // 4. Patient/Admins Audit details
      if (role === UserRole.ADMIN) {
        q = collection(db, colName);
      } else if (email) {
        q = query(collection(db, colName), where("email", "==", email));
      } else {
        return [];
      }
    } 
    else if (colName === "professionalRequests") {
      // 5. Professional Requests
      if (role === UserRole.ADMIN) {
        q = collection(db, colName);
      } else {
        q = query(collection(db, colName), where("userId", "==", uid));
      }
    } 
    else if (colName === "organizationRequests") {
      // 6. Organization Requests
      if (role === UserRole.ADMIN) {
        q = collection(db, colName);
      } else if (email) {
        q = query(collection(db, colName), where("requesterEmail", "==", email));
      } else {
        return [];
      }
    } 
    else if (colName === "cardRequests") {
      // 7. Card Requests
      if (role === UserRole.PATIENT) {
        q = query(collection(db, colName), where("patientId", "==", uid));
      } else if (role === UserRole.ADMIN) {
        q = collection(db, colName);
      } else {
        return [];
      }
    } 
    else if (colName === "claims" || colName === "patientInsuranceRequests" || colName === "insurancePolicies") {
      // 8. Insurance claims, requests, and policies
      if (role === UserRole.PATIENT) {
        q = query(collection(db, colName), where("patientId", "==", uid));
      } else if (role === UserRole.ADMIN || role === UserRole.INSURANCE) {
        q = collection(db, colName);
      } else {
        return [];
      }
    }
    else {
      // Generic fallback
      console.log(`[Firestore loadCollection] Fallback path for colName="${colName}". No specific role-matched filter applied.`);
      q = collection(db, colName);
    }

    try {
      console.log(`[Firestore loadCollection] Executing getDocs for colName="${colName}" ...`);
      const snap = await getDocs(q);
      const list: T[] = [];
      snap.forEach(d => list.push(d.data() as T));
      console.log(`[Firestore loadCollection] Successfully loaded ${list.length} documents for ${colName}`);
      return list;
    } catch (innerErr: any) {
      console.warn(`[Firestore LoadCollection Fallback] Target query for ${colName} failed or restricted. Error code: ${innerErr?.code}, Message: ${innerErr?.message}`);
      if (innerErr?.code === 'permission-denied' || (innerErr?.message && innerErr.message.toLowerCase().includes('permission'))) {
        handleFirestoreError(innerErr, OperationType.LIST, colName);
      }
      return [];
    }
  } catch (err: any) {
    console.error(`[Firestore] Error loading collection ${colName}:`, err);
    return [];
  }
}

export async function saveDocument(colName: string, docId: string, data: any): Promise<void> {
  try {
    const freshData = { ...data };
    Object.keys(freshData).forEach(k => {
      if (freshData[k] === undefined) delete freshData[k];
    });
    await setDoc(doc(db, colName, docId), freshData, { merge: true });
  } catch (err: any) {
    console.error(`[Firestore] Error saving document ${colName}/${docId}:`, err);
    if (err?.code === 'permission-denied' || (err?.message && err.message.toLowerCase().includes('permission'))) {
      handleFirestoreError(err, OperationType.WRITE, `${colName}/${docId}`);
    }
    throw err;
  }
}

export async function deleteDocument(colName: string, docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, colName, docId));
  } catch (err: any) {
    console.error(`[Firestore] Error deleting document ${colName}/${docId}:`, err);
    if (err?.code === 'permission-denied' || (err?.message && err.message.toLowerCase().includes('permission'))) {
      handleFirestoreError(err, OperationType.DELETE, `${colName}/${docId}`);
    }
    throw err;
  }
}

export async function loadEmergencyInfoAll(): Promise<Record<string, EmergencyInfo>> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return {};
    
    const { role } = await resolveCurrentUserProfile();
    console.log(`[Firestore loadEmergencyInfoAll] Fetching starting... uid=${uid}, role=${role}`);
    if (role === UserRole.ADMIN || role === UserRole.DOCTOR) {
      console.log("[Firestore] Loading all emergencyInfo (Doctor/Admin Mode)...");
      const snap = await getDocs(collection(db, "emergencyInfo"));
      const records: Record<string, EmergencyInfo> = {};
      snap.forEach(d => {
        records[d.id] = d.data() as EmergencyInfo;
      });
      console.log(`[Firestore loadEmergencyInfoAll] Loaded ${Object.keys(records).length} emergency records.`);
      return records;
    } else {
      console.log("[Firestore] Patient role: loading own emergencyInfo document for uid: " + uid);
      const records: Record<string, EmergencyInfo> = {};
      const directDoc = await getDoc(doc(db, "emergencyInfo", uid));
      if (directDoc.exists()) {
        records[uid] = directDoc.data() as EmergencyInfo;
      }
      console.log(`[Firestore loadEmergencyInfoAll] Checked own emergency document. Exists: ${directDoc.exists()}`);
      return records;
    }
  } catch (err: any) {
    console.error("[Firestore] Error loading emergencyInfo:", err);
    if (err?.code === 'permission-denied' || (err?.message && err.message.toLowerCase().includes('permission'))) {
      handleFirestoreError(err, OperationType.LIST, "emergencyInfo");
    }
    return {};
  }
}
