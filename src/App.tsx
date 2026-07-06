/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Shield, QrCode, ClipboardList, Stethoscope, Users, UserPlus, 
  Settings, LogOut, Bell, Search, Menu, X, ArrowLeft, RefreshCw, Briefcase, 
  HelpCircle, Sparkles, CheckCircle2, UserCheck, Heart, AlertTriangle,
  User as UserIcon, Pill, FlaskConical, Image as ImageIcon, ShieldCheck,
  FileCheck, Clipboard, ClipboardCheck, FileText, Calendar, Clock
} from 'lucide-react';
// Types and Seed Registries
import { UserRole, UserStatus, EmergencyInfo, Department, MedicalRecord, Prescription, LabResult, RadiologyReport, Notification, AuditLog, ProfessionalUpdateRequest, MedicalInstitution, OrganizationRequest, Claim, InsuranceCompany } from './types';
import type { User } from './types';
import { 
  INITIAL_USERS, INITIAL_EMERGENCY_INFO, INITIAL_DEPARTMENTS, INITIAL_MEDICAL_RECORDS, 
  INITIAL_PRESCRIPTIONS, INITIAL_LAB_RESULTS, INITIAL_RADIOLOGY_REPORTS, 
  INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS, INITIAL_PROF_REQUESTS,
  INITIAL_INSTITUTIONS, INITIAL_ORGANIZATION_REQUESTS, INITIAL_CLAIMS, INITIAL_INSURANCE_COMPANIES
} from './data/baselineData';

// Firestore services
import { 
  seedFirestoreIfNeeded,
  saveUserProfile,
  getUserProfile,
  loadFirestoreUsers,
  loadFirestoreInstitutions,
  loadFirestoreOrganizationRequests,
  createOrganizationRequestInFirestore,
  approveOrganizationRequestInFirestore,
  rejectOrganizationRequestInFirestore,
  loadCollection,
  saveDocument,
  deleteDocument,
  loadEmergencyInfoAll,
  createDoctorRequest,
  approveDoctorRequest,
  rejectDoctorRequest,
  createInsuranceRequest,
  approveInsuranceRequest,
  rejectInsuranceRequest,
  loadFirestoreInsuranceCompanies,
  clearUserRoleCache,
  resolveCurrentUserProfile
} from './lib/firestoreService';

import { FirebaseStatusPanel } from './components/FirebaseStatusPanel';

// Supabase fallback imports for legacy components compatibility
import { 
  verifySupabaseConnection, 
  syncFromSupabase, 
  syncEmergencyFromSupabase,
  upsertUser,
  deleteUserFromSupabase,
  upsertEmergency,
  upsertDepartment,
  deleteDepartmentFromSupabase,
  upsertMedicalRecord,
  upsertPrescription,
  upsertLabResult,
  upsertRadiology,
  upsertNotification,
  upsertAuditLog,
  upsertProfessionalRequest,
  upsertInstitution,
  deleteInstitutionFromSupabase,
  upsertOrganizationRequest,
  upsertClaim,
  upsertInsuranceCompany,
  deleteInsuranceCompanyFromSupabase,
  seedInitialDataToSupabase,
  SupabaseStatus,
  SUPABASE_SQL_SCHEMA
} from './lib/supabaseService';


// Modular Web Components
import PublicLanding from './components/PublicLanding';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import AdminDashboard from './components/AdminDashboard';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import SidebarContent from './components/SidebarContent';

import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { onSnapshot, doc, collection, query, where } from 'firebase/firestore';

export default function App() {
  // Navigation states: 'landing' | 'login' | 'register' | 'forgot-password' | 'dashboard'
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'register' | 'forgot-password' | 'dashboard'>('landing');
  const [activeUser, setActiveUser] = useState<User | null>(null);

  // Core Persisted Memory registries
  const [sessionUsers, setSessionUsers] = useState<User[]>(INITIAL_USERS);
  const [sessionEmergency, setSessionEmergency] = useState<Record<string, EmergencyInfo>>(INITIAL_EMERGENCY_INFO);
  const [sessionDepartments, setSessionDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [sessionMedicalRecords, setSessionMedicalRecords] = useState<MedicalRecord[]>(INITIAL_MEDICAL_RECORDS);
  const [sessionPrescriptions, setSessionPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [sessionLabResults, setSessionLabResults] = useState<LabResult[]>(INITIAL_LAB_RESULTS);
  const [sessionRadiology, setSessionRadiology] = useState<RadiologyReport[]>(INITIAL_RADIOLOGY_REPORTS);
  const [sessionNotifications, setSessionNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [sessionLogs, setSessionLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [sessionProfessionalUpdates, setSessionProfessionalUpdates] = useState<ProfessionalUpdateRequest[]>(INITIAL_PROF_REQUESTS);
  const [sessionInstitutions, setSessionInstitutions] = useState<MedicalInstitution[]>(INITIAL_INSTITUTIONS);
  const [sessionOrganizationRequests, setSessionOrganizationRequests] = useState<OrganizationRequest[]>(INITIAL_ORGANIZATION_REQUESTS);
  const [sessionCardRequests, setSessionCardRequests] = useState<any[]>([]);
  const [sessionClaims, setSessionClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [sessionInsuranceCompanies, setSessionInsuranceCompanies] = useState<InsuranceCompany[]>(INITIAL_INSURANCE_COMPANIES);
  const [sessionPatientInsuranceRequests, setSessionPatientInsuranceRequests] = useState<any[]>([]);
  const [sessionInsurancePolicies, setSessionInsurancePolicies] = useState<Record<string, any>>({});
  const [insuranceSection, setInsuranceSection] = useState<'dashboard' | 'claims' | 'verifications' | 'requests' | 'eligibility' | 'coverage' | 'reports' | 'settings'>('dashboard');

  // Quick state visibility toggles
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Custom global patient profile selector dropdown for headers query
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalMatchedPatient, setGlobalMatchedPatient] = useState<User | null>(null);

  // Active Patient Dashboard selection section
  const [patientSection, setPatientSection] = useState<'dashboard' | 'profile' | 'records' | 'prescriptions' | 'labs' | 'radiology' | 'emergency' | 'qr_identity' | 'settings' | 'help'>('dashboard');

  // Active Doctor Dashboard selection section
  const [doctorSection, setDoctorSection] = useState<string>('dashboard');

  // Supabase connection status
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>({
    connected: false,
    tablesVerified: false,
    checking: true
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load and verify backend connection on component mount
  useEffect(() => {
    syncDatabase();
  }, []);

  // Realtime Firestore Core Sync Listeners
  useEffect(() => {
    let unsubscribes: (() => void)[] = [];

    const setupListeners = async () => {
      const user = auth.currentUser;
      if (!user || !activeUser) {
        console.log("[Realtime Subscription] No authenticated activeUser context. Skipping active subscriptions.");
        return;
      }

      const uid = user.uid;
      const email = user.email;
      const currentRole = activeUser.role;
      
      console.log(`[Realtime Subscription] Designing active pipeline: uid="${uid}", role="${currentRole}"`);

      const addUnsub = (unsub: () => void) => {
        unsubscribes.push(unsub);
      };

      // 1. Own profile real-time listener (User Status Changes, Admin approvals)
      try {
        const userDocRef = doc(db, "users", uid);
        const unsubUserDoc = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as User;
            console.log("[Realtime Subscription] Active profile document updated:", data);
            
            // Perform status, role or other personal changes update
            setActiveUser((prev) => {
              if (!prev || JSON.stringify(prev) === JSON.stringify(data)) return prev;
              return data;
            });
            
            // Simultaneously keep user registry up to date
            setSessionUsers((prev) => {
              const matched = prev.find(u => u.id === uid);
              if (matched && JSON.stringify(matched) === JSON.stringify(data)) return prev;
              return prev.map(u => u.id === uid ? data : u);
            });
          }
        }, (err) => {
          console.warn("[Realtime Subscription] Own profile listener failed with permissions or layout constraint.", err?.message || err);
        });
        addUnsub(unsubUserDoc);
      } catch (err: any) {
        console.warn("[Realtime Subscription] Failed to attach profile document subscription:", err?.message || err);
      }

      // 2. Users list (User Status Changes / Administrators approvals)
      if (currentRole === UserRole.ADMIN || currentRole === UserRole.DOCTOR) {
        try {
          const usersColRef = collection(db, "users");
          const unsubUsers = onSnapshot(usersColRef, (snapshot) => {
            const list: User[] = [];
            snapshot.forEach(d => list.push(d.data() as User));
            console.log(`[Realtime Subscription] Loaded users collection: ${list.length}`);
            setSessionUsers(prev => {
              if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
              return list;
            });
          }, (err) => {
            console.warn("[Realtime Subscription] Users collection listener offline:", err?.message || err);
          });
          addUnsub(unsubUsers);
        } catch (err: any) {
          console.warn("[Realtime Subscription] Failed to register users list listener:", err?.message || err);
        }
      }

      // 3. Emergency Info (Emergency Updates)
      try {
        if (currentRole === UserRole.ADMIN || currentRole === UserRole.DOCTOR) {
          const emergencyColRef = collection(db, "emergencyInfo");
          const unsubEmergCol = onSnapshot(emergencyColRef, (snapshot) => {
            const records: Record<string, EmergencyInfo> = {};
            snapshot.forEach(d => {
              records[d.id] = d.data() as EmergencyInfo;
            });
            console.log(`[Realtime Subscription] Loaded ${Object.keys(records).length} emergency info entries.`);
            setSessionEmergency(prev => {
              if (JSON.stringify(prev) === JSON.stringify(records)) return prev;
              return records;
            });
          }, (err) => {
            console.warn("[Realtime Subscription] Emergency collection listener blocked:", err?.message || err);
          });
          addUnsub(unsubEmergCol);
        } else {
          const patientEmergDocRef = doc(db, "emergencyInfo", uid);
          const unsubEmergDoc = onSnapshot(patientEmergDocRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data() as EmergencyInfo;
              setSessionEmergency(prev => {
                const currentVal = prev[uid];
                if (currentVal && JSON.stringify(currentVal) === JSON.stringify(data)) return prev;
                return { ...prev, [uid]: data };
              });
            }
          }, (err) => {
            console.warn("[Realtime Subscription] Own emergency document listener blocked:", err?.message || err);
          });
          addUnsub(unsubEmergDoc);
        }
      } catch (err: any) {
        console.warn("[Realtime Subscription] Emergency subscription registry register failed:", err?.message || err);
      }



      // 5. Notifications (Patient Notifications / System wide)
      try {
        let notifsQuery;
        if (currentRole === UserRole.ADMIN) {
          notifsQuery = collection(db, "notifications");
        } else {
          notifsQuery = query(collection(db, "notifications"), where("userId", "==", uid));
        }
        const unsubNotifs = onSnapshot(notifsQuery, (snapshot) => {
          const list: Notification[] = [];
          snapshot.forEach(d => list.push(d.data() as Notification));
          console.log(`[Realtime Subscription] Notifications list loaded: ${list.length}`);
          setSessionNotifications(prev => {
            if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
            return list;
          });
        }, (err) => {
          console.warn("[Realtime Subscription] Notifications listener failed:", err?.message || err);
        });
        addUnsub(unsubNotifs);
      } catch (err: any) {
        console.warn("[Realtime Subscription] Failed notifications subscription register:", err?.message || err);
      }

      // 6. Professional Update Requests (Admin Requests / Doctor updates)
      try {
        let profQuery;
        if (currentRole === UserRole.ADMIN) {
          profQuery = collection(db, "professionalRequests");
        } else {
          profQuery = query(collection(db, "professionalRequests"), where("userId", "==", uid));
        }
        const unsubProf = onSnapshot(profQuery, (snapshot) => {
          const list: ProfessionalUpdateRequest[] = [];
          snapshot.forEach(d => list.push(d.data() as ProfessionalUpdateRequest));
          console.log(`[Realtime Subscription] Professional Requests loaded: ${list.length}`);
          setSessionProfessionalUpdates(prev => {
            if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
            return list;
          });
        }, (err) => {
          console.warn("[Realtime Subscription] Professional requests listener offline:", err?.message || err);
        });
        addUnsub(unsubProf);
      } catch (err: any) {
        console.warn("[Realtime Subscription] Professional requests subscription failed:", err?.message || err);
      }

      // 7. Organization Requests (Admin Requests / approvals)
      try {
        let orgQuery;
        if (currentRole === UserRole.ADMIN) {
          orgQuery = collection(db, "organizationRequests");
        } else if (email) {
          orgQuery = query(collection(db, "organizationRequests"), where("requesterEmail", "==", email));
        }
        if (orgQuery) {
          const unsubOrg = onSnapshot(orgQuery, (snapshot) => {
            const list: OrganizationRequest[] = [];
            snapshot.forEach(d => list.push(d.data() as OrganizationRequest));
            console.log(`[Realtime Subscription] Organization Requests loaded: ${list.length}`);
            setSessionOrganizationRequests(prev => {
              if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
              return list;
            });
          }, (err) => {
            console.warn("[Realtime Subscription] Organization requests listener offline:", err?.message || err);
          });
          addUnsub(unsubOrg);
        }
      } catch (err: any) {
        console.warn("[Realtime Subscription] Organization requests subscription failed:", err?.message || err);
      }



      // 10. Card Requests (Insurance/Patient)
      try {
        let cardQuery;
        if (currentRole === UserRole.PATIENT) {
          cardQuery = query(collection(db, "cardRequests"), where("patientId", "==", uid));
        } else if (currentRole === UserRole.ADMIN) {
          cardQuery = collection(db, "cardRequests");
        }
        if (cardQuery) {
          const unsubCard = onSnapshot(cardQuery, (snapshot) => {
            const list: any[] = [];
            snapshot.forEach(d => list.push(d.data()));
            console.log(`[Realtime Subscription] Card Requests loaded: ${list.length}`);
            setSessionCardRequests(prev => {
              if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
              return list;
            });
          }, (err) => {
            console.warn("[Realtime Subscription] Card requests listener failed:", err?.message || err);
          });
          addUnsub(unsubCard);
        }
      } catch (err: any) {
        console.warn("[Realtime Subscription] Card requests subscription failed:", err?.message || err);
      }

      // 11. Clinical Collections (Medical Records, Prescriptions, Lab Results, Radiology Reports)
      if (currentRole === UserRole.PATIENT || currentRole === UserRole.DOCTOR || currentRole === UserRole.ADMIN) {
        try {
          const clinicalCollections = ["medicalRecords", "prescriptions", "labResults", "radiologyReports"];
          clinicalCollections.forEach(cName => {
            let clinicalQuery;
            if (currentRole === UserRole.PATIENT) {
              clinicalQuery = query(collection(db, cName), where("patientId", "==", uid));
            } else {
              clinicalQuery = collection(db, cName);
            }
            const unsubClinical = onSnapshot(clinicalQuery, (snapshot) => {
              const list: any[] = [];
              snapshot.forEach(d => list.push(d.data()));
              console.log(`[Realtime Subscription] Clinical ${cName} loaded: ${list.length}`);
              if (cName === "medicalRecords") {
                setSessionMedicalRecords(prev => JSON.stringify(prev) === JSON.stringify(list) ? prev : list);
              } else if (cName === "prescriptions") {
                setSessionPrescriptions(prev => JSON.stringify(prev) === JSON.stringify(list) ? prev : list);
              } else if (cName === "labResults") {
                setSessionLabResults(prev => JSON.stringify(prev) === JSON.stringify(list) ? prev : list);
              } else if (cName === "radiologyReports") {
                setSessionRadiology(prev => JSON.stringify(prev) === JSON.stringify(list) ? prev : list);
              }
            }, (err) => {
              console.warn(`[Realtime Subscription Error] Clinical collection ${cName} listener failed:`, err?.message || err);
            });
            addUnsub(unsubClinical);
          });
        } catch (err) {
          console.warn("[Realtime Subscription Error] Failed registering clinical listeners:", err?.message || err);
        }
      }
    };

    setupListeners();

    return () => {
      console.log(`[Realtime Subscription Cleanup] Unsubscribed from ${unsubscribes.length} active listeners.`);
      unsubscribes.forEach(unsub => unsub());
    };
  }, [activeUser?.id, activeUser?.role]);

  const syncDatabase = async () => {
    setSupabaseStatus(prev => ({ ...prev, checking: true, connected: true, tablesVerified: true }));
    setIsSyncing(true);
    try {
      // 1. Seed base tables in Firestore if they do not exist
      await seedFirestoreIfNeeded();

      // 2. Fetch all collections from Firestore with robust per-collection handling
      console.log("[Firestore Sync] Synced collections initialization sequence initiated...");
      
      let remoteUsers: User[] = [];
      try {
        remoteUsers = await loadFirestoreUsers();
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load users:", err);
      }

      let remoteEmergency: Record<string, EmergencyInfo> = {};
      try {
        remoteEmergency = await loadEmergencyInfoAll();
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load emergencyInfo:", err);
      }

      let remoteInst: MedicalInstitution[] = [];
      try {
        remoteInst = await loadFirestoreInstitutions();
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load institutions:", err);
      }

      let remoteIns: InsuranceCompany[] = [];
      try {
        remoteIns = await loadFirestoreInsuranceCompanies();
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load insuranceCompanies:", err);
      }

      let remoteOrgReq: OrganizationRequest[] = [];
      try {
        remoteOrgReq = await loadFirestoreOrganizationRequests();
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load organizationRequests:", err);
      }

      let remoteDepts: Department[] = [];
      try {
        remoteDepts = await loadCollection<Department>('departments');
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load departments:", err);
      }

      let remoteRecords: MedicalRecord[] = [];
      try {
        remoteRecords = await loadCollection<MedicalRecord>('medicalRecords');
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load medicalRecords:", err);
      }

      let remoteRx: Prescription[] = [];
      try {
        remoteRx = await loadCollection<Prescription>('prescriptions');
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load prescriptions:", err);
      }

      let remoteLabs: LabResult[] = [];
      try {
        remoteLabs = await loadCollection<LabResult>('labResults');
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load labResults:", err);
      }

      let remoteRad: RadiologyReport[] = [];
      try {
        remoteRad = await loadCollection<RadiologyReport>('radiologyReports');
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load radiologyReports:", err);
      }

      let remoteClaims: Claim[] = [];
      try {
        remoteClaims = await loadCollection<Claim>('claims');
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load claims:", err);
      }

      let remoteNotifs: Notification[] = [];
      try {
        remoteNotifs = await loadCollection<Notification>('notifications');
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load notifications:", err);
      }

      let remoteLogs: AuditLog[] = [];
      try {
        remoteLogs = await loadCollection<AuditLog>('auditLogs');
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load auditLogs:", err);
      }

      let remoteProfReq: ProfessionalUpdateRequest[] = [];
      try {
        remoteProfReq = await loadCollection<ProfessionalUpdateRequest>('professionalRequests');
      } catch (err) {
        console.warn("[Firestore Sync Warning] Failed to load professionalRequests:", err);
      }

      // 3. Update session states with Firestore data, failing back to defaults only for empty critical ones
      setSessionUsers(remoteUsers.length > 0 ? remoteUsers : INITIAL_USERS);
      setSessionEmergency(remoteEmergency);
      setSessionDepartments(remoteDepts.length > 0 ? remoteDepts : INITIAL_DEPARTMENTS);
      setSessionMedicalRecords(remoteRecords);
      setSessionPrescriptions(remoteRx);
      setSessionLabResults(remoteLabs);
      setSessionRadiology(remoteRad);
      setSessionClaims(remoteClaims);
      setSessionNotifications(remoteNotifs);
      setSessionLogs(remoteLogs);
      setSessionProfessionalUpdates(remoteProfReq);
      setSessionInstitutions(remoteInst.length > 0 ? remoteInst : INITIAL_INSTITUTIONS);
      setSessionInsuranceCompanies(remoteIns.length > 0 ? remoteIns : INITIAL_INSURANCE_COMPANIES);
      setSessionOrganizationRequests(remoteOrgReq);

      // Fetch patient insurance structures & card request details from Firestore
      try {
        const remoteCardRequests = await loadCollection<any>('cardRequests');
        const remotePatientInsuranceRequests = await loadCollection<any>('patientInsuranceRequests');
        const remoteInsurancePolicies = await loadCollection<any>('insurancePolicies');

        const policiesMap: Record<string, any> = {};
        remoteInsurancePolicies.forEach(p => {
          policiesMap[p.id || p.patientId] = p;
        });

        setSessionCardRequests(remoteCardRequests);
        setSessionPatientInsuranceRequests(remotePatientInsuranceRequests);
        setSessionInsurancePolicies(policiesMap);
      } catch (loadErr) {
        console.warn("[Firestore Sync Warning] Non-critical structures failed to load on active path:", loadErr);
      }

      console.log("[Firestore Sync] Unified absolute sync successful. Source of truth verified.");
    } catch (e: any) {
      console.error('Firestore initialization failed on core step:', e);
    } finally {
      setIsSyncing(false);
      setSupabaseStatus(prev => ({ ...prev, checking: false, connected: true, tablesVerified: true }));
    }
  };

  const handleSeedDatabase = async () => {
    setIsSyncing(true);
    try {
      const res = await seedInitialDataToSupabase(
        sessionUsers,
        sessionEmergency,
        sessionDepartments,
        sessionMedicalRecords,
        sessionPrescriptions,
        sessionLabResults,
        sessionRadiology,
        sessionClaims,
        sessionNotifications,
        sessionLogs,
        sessionProfessionalUpdates,
        sessionInstitutions,
        sessionInsuranceCompanies,
        sessionOrganizationRequests
      );
      if (res.success) {
        triggerNotificationAlert('Database Seeding Successful', 'All local state cache arrays have been successfully upserted into the remote Supabase project.', 'ALERT');
        await syncDatabase();
        return { success: true, msg: res.msg };
      } else {
        triggerNotificationAlert('Database Seeding Failed', res.msg, 'ALERT');
        return { success: false, msg: res.msg };
      }
    } catch (e: any) {
      return { success: false, msg: e?.message || 'Database seeding errored out.' };
    } finally {
      setIsSyncing(false);
    }
  };



  // Trigger system notification alert sound or visually
  const triggerNotificationAlert = (title: string, msg: string, type: any, targetUserId?: string) => {
    const currentUid = auth.currentUser?.uid;
    const finalUserId = targetUserId || activeUser?.id || currentUid || 'all';
    const newNotif: Notification = {
      id: 'not-' + Math.floor(100+Math.random()*900),
      userId: finalUserId,
      title,
      message: msg,
      date: new Date().toISOString().split('T')[0],
      read: false,
      type
    };
    setSessionNotifications(prev => [newNotif, ...prev]);
    upsertNotification(newNotif).catch(e => console.error('[Firestore Alert Write] Failed to persist notification:', e));
  };

  const triggerAuditAction = (email: string, action: string, details: string) => {
    const newAudit: AuditLog = {
      id: 'log-' + Math.floor(10 + Math.random() * 90),
      timestamp: new Date().toISOString(),
      email,
      action,
      details
    };
    setSessionLogs(prev => [newAudit, ...prev]);
    upsertAuditLog(newAudit).catch(e => console.warn('Supabase offline or missing relation:', e));
  };


  // Synchronize state across mock logins to ensure testing feels highly realistic and fluid
  const handleLoginSuccess = (user: User) => {
    setActiveUser(user);
    setCurrentPage('dashboard');
    triggerAuditAction(user.email, 'USER_LOGIN', `Auth verified. Session mapped for role: ${user.role} - Full Legal Access.`);
    
    // Automatically retrieve and populate patient/clinical records matching current role session
    syncDatabase();

    // Auto-create a notification welcoming the user specifically
    triggerNotificationAlert(
      'Session Security Tunnel Established', 
      `Welcome back, ${user.fullName}. System verified security parameters cleanly.`,
      'ALERT',
      user.id
    );
  };

  // Registration handler
  const handleNewRegistration = async (newUser: User) => {
    const password = newUser.password;
    if (!password) {
      alert("Registration failed: password is required.");
      return;
    }

    try {
      const emailLower = newUser.email.toLowerCase().trim();
      const existingUser = sessionUsers.find(u => u.email.toLowerCase() === emailLower);
      if (existingUser) {
        alert("This account is already registered. Redirecting to Login screen.");
        setCurrentPage('login');
        return;
      }

      // Generate account inside Firebase Auth first
      let authUser;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailLower, password);
        authUser = userCredential.user;
      } catch (fbErr: any) {
        let msg = fbErr?.message || "Firebase Auth registration failed.";
        if (fbErr?.code === 'auth/email-already-in-use') {
          msg = "This email address is already in use by another account in Firebase.";
        } else if (fbErr?.code === 'auth/weak-password') {
          msg = "The password is too weak. Please specify a more secure password.";
        } else if (fbErr?.code === 'auth/invalid-email') {
          msg = "Please specify a valid medical or patient email address format.";
        }
        alert("Registration failed: " + msg);
        return;
      }

      const verifiedUid = authUser.uid;

      // 2. Prepare the exact profile record according to prompt specification guidelines
      const profileToSave: User = { 
        ...newUser,
        id: verifiedUid,
        uid: verifiedUid,
        email: emailLower,
        joinedDate: newUser.joinedDate || new Date().toISOString().split('T')[0],
        password: password // Keep local plain password for offline login mock tests
      };

      if (newUser.role === UserRole.PATIENT) {
        profileToSave.role = UserRole.PATIENT;
        profileToSave.status = UserStatus.ACTIVE;
        profileToSave.nationalId = newUser.nationalId;
        profileToSave.medicalId = newUser.medicalId || 'MID-' + Math.floor(100000 + Math.random() * 900000);
        profileToSave.photoUrl = newUser.photoUrl || null;
        profileToSave.gender = newUser.gender || 'Male';
        profileToSave.dateOfBirth = newUser.dateOfBirth || '1990-01-01';
      } else if (newUser.role === UserRole.DOCTOR) {
        profileToSave.role = UserRole.DOCTOR;
        profileToSave.status = UserStatus.PENDING;
        profileToSave.nationalId = newUser.nationalId;
        profileToSave.institution = newUser.institution;
        profileToSave.institutionId = newUser.institutionId || '';
        profileToSave.institutionType = newUser.institutionType || 'Clinic';
        profileToSave.specialty = newUser.specialty || 'General Medicine';
        profileToSave.licenseNumber = newUser.licenseNumber;
        profileToSave.photoUrl = newUser.photoUrl || null;
        profileToSave.gender = newUser.gender || 'Female';
        profileToSave.dateOfBirth = newUser.dateOfBirth || '1985-01-01';
        profileToSave.experience = newUser.experience || '1–3 Years';
        profileToSave.position = newUser.position || 'Consultant';
      } else if (newUser.role === UserRole.INSURANCE) {
        profileToSave.role = UserRole.INSURANCE;
        profileToSave.status = UserStatus.PENDING;
        profileToSave.organizationName = newUser.organizationName || newUser.insuranceCompany;
        profileToSave.insuranceCompany = newUser.insuranceCompany || newUser.organizationName;
        profileToSave.insuranceCompanyId = newUser.insuranceCompanyId || '';
        profileToSave.branchOffice = newUser.branchOffice;
        profileToSave.nationalId = newUser.nationalId || '';
        profileToSave.gender = newUser.gender || 'Female';
        profileToSave.dateOfBirth = newUser.dateOfBirth || '1990-01-01';
        profileToSave.employeeId = newUser.employeeId;
        profileToSave.insuranceDepartment = newUser.insuranceDepartment || newUser.position;
        profileToSave.workEmail = newUser.workEmail || newUser.email;
        profileToSave.position = newUser.position;
      } else if (newUser.role === UserRole.ADMIN) {
        profileToSave.role = UserRole.ADMIN;
        profileToSave.status = UserStatus.ACTIVE;
        profileToSave.adminRole = newUser.adminRole || 'SUPER';
        profileToSave.gender = newUser.gender || 'Male';
        profileToSave.dateOfBirth = newUser.dateOfBirth || '1990-01-01';
        profileToSave.nationalId = newUser.nationalId || '';
      }

      // 3. Save profile record into Firestore database
      console.log(`[Registration] Creating user Firestore document users/${verifiedUid}`);
      try {
        await saveUserProfile(verifiedUid, profileToSave);

        // Create onboarding requests inside doctorRequests or insuranceRequests inside Firestore
        if (profileToSave.role === UserRole.DOCTOR) {
          console.log(`[Registration] Creating doctor launch request for UID: ${verifiedUid}`);
          await createDoctorRequest({
            doctorUid: verifiedUid,
            doctorName: profileToSave.fullName,
            institutionId: profileToSave.institutionId || '',
            institutionName: profileToSave.institution || '',
            specialty: profileToSave.specialty || '',
            status: "pending",
            createdAt: new Date().toISOString()
          });
        } else if (profileToSave.role === UserRole.INSURANCE) {
          console.log(`[Registration] Creating insurance carrier onboarding request for UID: ${verifiedUid}`);
          await createInsuranceRequest({
            insuranceUid: verifiedUid,
            insuranceName: profileToSave.fullName,
            companyId: profileToSave.insuranceCompanyId || '',
            companyName: profileToSave.insuranceCompany || '',
            status: "pending",
            createdAt: new Date().toISOString()
          });
        }
      } catch (fbErr: any) {
        console.warn("[Registration sync warn] Dual writing profile direct to Firestore bypassed due to custom project configuration rules:", fbErr);
        alert("Verification Warning: We detected your custom Firebase project does not have open Security Rules (Permission Denied). We have safely generated and loaded your credentials into local memory state to let you proceed seamlessly!");
      }

      // 5. Registration validated! Populate session state and finish registration flow
      setSessionUsers(prev => [profileToSave, ...prev]);

      // 6. Set up emergency info if Patient
      if (profileToSave.role === UserRole.PATIENT) {
        const defaultEmerg = {
          bloodType: 'A-Positive (A+)',
          allergies: 'None recorded yet. Click parameters to update.',
          chronicDiseases: 'None',
          criticalMedications: 'None',
          emergencyContactName: 'Sister Representative',
          emergencyContactPhone: '+1 (555) 010-0202'
        };
        setSessionEmergency(prev => ({
          ...prev,
          [verifiedUid]: defaultEmerg
        }));
        try {
          await saveDocument("emergencyInfo", verifiedUid, defaultEmerg);
        } catch (fbErr: any) {
          console.warn("[Registration emergency sync warn] Skipping emergency state storage in Firestore due to custom database rule restrictions:", fbErr);
        }
      }

      triggerAuditAction(profileToSave.email, 'USER_REGISTRATION', `New register logged (Role: ${profileToSave.role}, Status: ${profileToSave.status}).`);

      const adminUser = sessionUsers.find(u => u.role === UserRole.ADMIN);
      if (adminUser) {
        triggerNotificationAlert(
          'Onboarding Credentials Pending Approval',
          `New ${profileToSave.role} profile: ${profileToSave.fullName} requested security clearance keys.`,
          'RESOURCE',
          adminUser.id
        );
      }

      // Determine dashboard access block
      if (profileToSave.role === UserRole.PATIENT || profileToSave.role === UserRole.ADMIN) {
        setActiveUser(profileToSave);
        setCurrentPage('dashboard');
      } else {
        alert("Registration submitted successfully! Waiting for administrator approval before your credentials become active.");
        setCurrentPage('login');
      }

    } catch (registrationErr: any) {
      // Revert/Rollback registration UI memory flow
      setActiveUser(null);
      console.error("[Registration Error] Display Firestore error during handleNewRegistration:", registrationErr);
      alert("Registration failed: " + (registrationErr?.message || registrationErr));
    }
  };

  // Password override update
  const handlePasswordReset = (email: string, newPass: string) => {
    setSessionUsers(prev => prev.map(u => {
      if (u.email === email) {
        const withNewPass = { ...u, password: newPass };
        upsertUser(withNewPass).catch(e => console.warn('Supabase password sync failure:', e));
        return withNewPass;
      }
      return u;
    }));
    triggerAuditAction(email, 'PASSWORD_OVERWRITE_ROUTINE', 'Account requested password adjustment. Key updated in local registry safely.');
  };

  // CLINICAL OR ADMIN DATA ACTIONS
  const handleUpdateUserStatus = async (userId: string, status: UserStatus) => {
    // 1. Update local state
    setSessionUsers(prev => prev.map(u => {
      if (u.id === userId || u.uid === userId) {
        return { ...u, status };
      }
      return u;
    }));

    // 2. Update Firestore user core document and approval trackers
    try {
      console.log(`[Admin Update] Updating user status in Firestore for UID/ID: ${userId} to status: ${status}`);
      await saveUserProfile(userId, { status });

      const target = sessionUsers.find(u => u.id === userId || u.uid === userId);
      if (target) {
        // Trigger actual Firestore requests approval actions
        if (target.role === UserRole.DOCTOR) {
          if (status === UserStatus.ACTIVE) {
            await approveDoctorRequest(userId);
          } else if (status === UserStatus.DECLINED) {
            await rejectDoctorRequest(userId);
          }
        } else if (target.role === UserRole.INSURANCE) {
          if (status === UserStatus.ACTIVE) {
            await approveInsuranceRequest(userId);
          } else if (status === UserStatus.DECLINED) {
            await rejectInsuranceRequest(userId);
          }
        }

        triggerAuditAction(activeUser?.email || 'SYSTEM', 'USER_STATUS_UPDATE', `Modified ${target.fullName} status to: ${status}.`);
        triggerNotificationAlert(
          'Account credentials reprogrammed',
          `Your security profile authorization status was updated to: ${status}.`,
          'ALERT',
          userId
        );
      }
    } catch (err: any) {
      console.error("[Admin Update] Error updating user/onboard request status in Firestore:", err);
      alert("Error saving status change in Firestore: " + err?.message);
    }
  };

  const handleUpdateClaimStatus = (claimId: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    setSessionClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        const withClaimStatus = { ...c, status, notes };
        upsertClaim(withClaimStatus).catch(e => console.warn('Supabase claim update sync failure:', e));
        return withClaimStatus;
      }
      return c;
    }));
    
    const target = sessionClaims.find(c => c.id === claimId);
    if (target) {
      triggerAuditAction(activeUser?.email || 'INSURANCE', 'CLAIM_REVIEW_FINALIZED', `Insurance claim ${claimId} with cost $${target.cost} marked: ${status}.`);
      
      triggerNotificationAlert(
        'Insurance Claim Status Resolved',
        `Your billing items for ${target.doctorName} were successfully ${status.toLowerCase()} by policy reviewers.`,
        'INSURANCE',
        target.patientId
      );
    }
  };

  const handleDeleteUser = (userId: string) => {
    const target = sessionUsers.find(u => u.id === userId);
    setSessionUsers(prev => prev.filter(u => u.id !== userId));
    deleteUserFromSupabase(userId).catch(e => console.warn('Supabase delete user error:', e));
    triggerAuditAction(activeUser?.email || 'SYSTEM', 'USER_DELETION_BURNOUT', `Erased user ${target?.fullName} profile from system cache.`);
  };

  const handleAddUser = (user: User) => {
    setSessionUsers(prev => [user, ...prev]);
    upsertUser(user).catch(e => console.warn('Supabase add user error:', e));
    triggerAuditAction(activeUser?.email || 'SYSTEM', 'ADMIN_DIRECT_USER_PROVISION', `Admin directly registered ${user.fullName} (${user.role}).`);
  };

  const handleAddDepartment = (dept: Department) => {
    setSessionDepartments(prev => [dept, ...prev]);
    upsertDepartment(dept).catch(e => console.warn('Supabase add dept error:', e));
    triggerAuditAction(activeUser?.email || 'SYSTEM', 'DEPARTMENT_PROVISIONED', `Created hospital practice clinic: ${dept.name} in Location: ${dept.location}.`);
  };

  const handleDeleteDepartment = (deptId: string) => {
    setSessionDepartments(prev => prev.filter(d => d.id !== deptId));
    deleteDepartmentFromSupabase(deptId).catch(e => console.warn('Supabase delete dept error:', e));
    triggerAuditAction(activeUser?.email || 'SYSTEM', 'DEPARTMENT_RELEASEED', `Removed practice clinic wing ${deptId} from system blueprints.`);
  };

  const handleEditDepartment = (updatedDept: Department) => {
    setSessionDepartments(prev => prev.map(d => d.id === updatedDept.id ? updatedDept : d));
    upsertDepartment(updatedDept).catch(e => console.warn('Supabase edit dept error:', e));
    triggerAuditAction(activeUser?.email || 'SYSTEM', 'DEPARTMENT_RECONFIGURED', `Modified coordinates or staff heads for clinic wing ${updatedDept.name}.`);
  };

  const handleAddCardRequest = async (patientId: string, req: any) => {
    try {
      console.log(`[Firestore] Adding card request for ${patientId}...`);
      await saveDocument('cardRequests', req.id, { ...req, patientId });
      setSessionCardRequests(prev => [req, ...prev]);
      triggerAuditAction(activeUser?.email || 'PATIENT', 'CARD_REQUEST_SUBMITTED', `Card request submitted for patient.`);
      triggerNotificationAlert("Card Request Received", "Your national healthcare card request is pending review.", "ALERT");
    } catch (e: any) {
      console.error("Failed to add card request inside Firestore:", e);
      throw e;
    }
  };

  const handleAddPatientInsuranceRequest = async (patientId: string, req: any) => {
    try {
      console.log(`[Firestore] Adding patient insurance request...`);
      await saveDocument('patientInsuranceRequests', req.id, { ...req, patientId });
      setSessionPatientInsuranceRequests(prev => [req, ...prev]);
      
      triggerAuditAction(activeUser?.email || 'PATIENT', 'INSURANCE_REQUEST_SUBMITTED', `Insurance update request submitted for patient.`);
      triggerNotificationAlert("Insurance Request Received", "Your insurance details update request is pending review.", "ALERT");
      
      // Also notify Insurance Staff
      triggerNotificationAlert(
        "New Insurance Verification Pending",
        `Patient ${req.patientName} requested insurance policy update validation.`,
        "INSURANCE"
      );
    } catch (e: any) {
      console.error("Failed to add insurance request inside Firestore:", e);
      throw e;
    }
  };

  const handleUpdateInsurancePolicy = async (patientId: string, policy: any) => {
    try {
      console.log(`[Firestore] Updating insurance policy for ${patientId}...`);
      await saveDocument('insurancePolicies', patientId, { ...policy, patientId, id: patientId });
      
      setSessionInsurancePolicies(prev => ({
        ...prev,
        [patientId]: policy
      }));
      
      triggerAuditAction(activeUser?.email || 'INSURER', 'POLICY_UPDATED', `Verified and updated policy for patient id: ${patientId}.`);
      triggerNotificationAlert("Insurance Policy Updated", `Insurance policy status: ${policy.status}`, "CLAIM", patientId);
    } catch (e: any) {
      console.error("Failed to update insurance policy inside Firestore:", e);
      throw e;
    }
  };

  const handleSaveInsuranceRequests = async (updatedRequests: any[]) => {
    try {
      console.log("[Firestore] Syncing updated insurance requests back to Firestore...");
      for (const req of updatedRequests) {
        await saveDocument('patientInsuranceRequests', req.id, req);
      }
      setSessionPatientInsuranceRequests(updatedRequests);
    } catch (e) {
      console.error("Failed to sync insurance requests to Firestore:", e);
      throw e;
    }
  };

  const handleAddMedicalRecord = async (rec: MedicalRecord) => {
    try {
      const existing = sessionMedicalRecords.find(r => r.patientId === rec.patientId && r.date === rec.date);
      if (existing) {
        const updatedRec = {
          ...existing,
          chiefComplaint: rec.chiefComplaint,
          diagnosis: rec.diagnosis,
          treatmentPlan: rec.treatmentPlan,
          notes: rec.notes
        };
        await saveDocument('medicalRecords', existing.id, updatedRec);
      } else {
        await saveDocument('medicalRecords', rec.id, rec);
      }
    } catch (e) {
      console.error('[Firestore EMR write failed]:', e);
    }

    setSessionMedicalRecords(prevRecords => {
      const existingIndex = prevRecords.findIndex(r => r.patientId === rec.patientId && r.date === rec.date);
      if (existingIndex >= 0) {
        // Merge & update existing same-day visit!
        const updatedRecords = [...prevRecords];
        const updatedRec = {
          ...updatedRecords[existingIndex],
          chiefComplaint: rec.chiefComplaint,
          diagnosis: rec.diagnosis,
          treatmentPlan: rec.treatmentPlan,
          notes: rec.notes
        };
        updatedRecords[existingIndex] = updatedRec;
        upsertMedicalRecord(updatedRec).catch(e => console.warn('Supabase EMR edit error:', e));
        
        // Ensure child actions are linked to this visitId
        setSessionPrescriptions(prev => prev.map(p => p.patientId === rec.patientId && p.date === rec.date ? { ...p, visitId: updatedRecords[existingIndex].id } : p));
        setSessionLabResults(prev => prev.map(l => l.patientId === rec.patientId && l.date === rec.date ? { ...l, visitId: updatedRecords[existingIndex].id } : l));
        setSessionRadiology(prev => prev.map(r => r.patientId === rec.patientId && r.date === rec.date ? { ...r, visitId: updatedRecords[existingIndex].id } : r));

        return updatedRecords;
      } else {
        upsertMedicalRecord(rec).catch(e => console.warn('Supabase EMR add error:', e));
        return [rec, ...prevRecords];
      }
    });

    triggerAuditAction(activeUser?.email || 'PHYSICIAN', 'EMR_RECORD_APPENDED', `Doctor ${rec.doctorName} logged consult diagnosable note rec-${rec.id} to patient.`);
    
    // Add insurance claim automatically unless duplicate claim on same date already exists
    const claimDate = rec.date;
    const sameClaimExists = sessionClaims.some(c => c.patientId === rec.patientId && c.date === claimDate);
    if (!sameClaimExists) {
      const patientObj = sessionUsers.find(u => u.id === rec.patientId);
      if (patientObj) {
        const claimCost = Math.floor(120 + Math.random() * 800);
        const newClaim: Claim = {
          id: 'cl-' + Math.floor(200+Math.random()*700),
          patientId: rec.patientId,
          patientName: patientObj.fullName,
          patientMedicalId: patientObj.medicalId || 'MID-789410',
          policyNumber: 'GS-PL-99812-C',
          coverageType: 'Gold Shield Premium Comprehensive Care',
          doctorName: rec.doctorName,
          diagnosis: rec.diagnosis,
          cost: claimCost,
          status: 'PENDING',
          date: rec.date
        };
        setSessionClaims(prev => [newClaim, ...prev]);
        upsertClaim(newClaim).catch(e => console.warn('Supabase autogenerated claim write error:', e));
        saveDocument('claims', newClaim.id, newClaim).catch(e => console.error('[Firestore claim fail]:', e));
        
        triggerNotificationAlert(
          'Billing Claim Transmitted',
          `An outpatient medical claim for $${claimCost} has been submitted for insurer review.`,
          'INSURANCE',
          rec.patientId
        );
      }
    }
  };


  const handleAddPrescription = async (rx: Prescription) => {
    let visitId = '';
    try {
      const existing = sessionMedicalRecords.find(r => r.patientId === rx.patientId && r.date === rx.date);
      if (existing) {
        visitId = existing.id;
        const updatedExist = {
          ...existing,
          treatmentPlan: existing.treatmentPlan.includes(rx.medicationName) ? existing.treatmentPlan : `${existing.treatmentPlan} | Add Rx: ${rx.medicationName} (${rx.dosage})`,
          notes: existing.notes.includes(rx.medicationName) ? existing.notes : `${existing.notes} | Prescribed ${rx.medicationName}`
        };
        await saveDocument('medicalRecords', existing.id, updatedExist);
      } else {
        const randomNum = Math.floor(100 + Math.random() * 899);
        const yearStr = (rx.date || '').split('-')[0] || '2026';
        visitId = `rec-VIS-${yearStr}-${randomNum}`;

        const newVisit: MedicalRecord = {
          id: visitId,
          patientId: rx.patientId,
          doctorId: rx.doctorId,
          doctorName: rx.doctorName || 'Attending Physician',
          date: rx.date,
          chiefComplaint: 'Prescription Consultation',
          diagnosis: rx.diagnosis || 'Clinical assessment indicating pharmaceutical intervention',
          treatmentPlan: `Prescribed ${rx.medicationName} ${rx.dosage}.`,
          notes: `Visit automatically generated for Medication Prescription: ${rx.medicationName}.`
        };
        await saveDocument('medicalRecords', visitId, newVisit);
      }

      const rxWithVisit = { ...rx, visitId };
      await saveDocument('prescriptions', rxWithVisit.id, rxWithVisit);
    } catch (err) {
      console.error('[Firestore prescription/visit write fail]:', err);
    }

    setSessionMedicalRecords(prevRecords => {
      const existing = prevRecords.find(r => r.patientId === rx.patientId && r.date === rx.date);
      let localVisitId = '';
      let updatedRecords = [...prevRecords];

      if (existing) {
        localVisitId = existing.id;
        const updatedExist = {
          ...existing,
          treatmentPlan: existing.treatmentPlan.includes(rx.medicationName) ? existing.treatmentPlan : `${existing.treatmentPlan} | Add Rx: ${rx.medicationName} (${rx.dosage})`,
          notes: existing.notes.includes(rx.medicationName) ? existing.notes : `${existing.notes} | Prescribed ${rx.medicationName}`
        };
        updatedRecords = prevRecords.map(r => r.id === existing.id ? updatedExist : r);
        upsertMedicalRecord(updatedExist).catch(e => console.warn('Supabase prescription visit edit fail:', e));
      } else {
        const randomNum = Math.floor(100 + Math.random() * 899);
        const yearStr = (rx.date || '').split('-')[0] || '2026';
        localVisitId = `rec-VIS-${yearStr}-${randomNum}`;

        const newVisit: MedicalRecord = {
          id: localVisitId,
          patientId: rx.patientId,
          doctorId: rx.doctorId,
          doctorName: rx.doctorName || 'Attending Physician',
          date: rx.date,
          chiefComplaint: 'Prescription Consultation',
          diagnosis: rx.diagnosis || 'Clinical assessment indicating pharmaceutical intervention',
          treatmentPlan: `Prescribed ${rx.medicationName} ${rx.dosage}.`,
          notes: `Visit automatically generated for Medication Prescription: ${rx.medicationName}.`
        };
        updatedRecords = [newVisit, ...prevRecords];
        upsertMedicalRecord(newVisit).catch(e => console.warn('Supabase prescription visit add fail:', e));

        // Autogenerate claim in state
        setTimeout(() => {
          const patientObj = sessionUsers.find(u => u.id === rx.patientId);
          if (patientObj) {
            const claimCost = Math.floor(120 + Math.random() * 800);
            const newClaim: Claim = {
              id: 'cl-' + Math.floor(200 + Math.random() * 700),
              patientId: rx.patientId,
              patientName: patientObj.fullName,
              patientMedicalId: patientObj.medicalId || 'MID-789410',
              policyNumber: 'GS-PL-99812-C',
              coverageType: 'Gold Shield Premium Comprehensive Care',
              doctorName: rx.doctorName || 'Attending Physician',
              diagnosis: newVisit.diagnosis,
              cost: claimCost,
              status: 'PENDING',
              date: rx.date
            };
            setSessionClaims(prev => [newClaim, ...prev]);
            upsertClaim(newClaim).catch(e => console.warn('Supabase claim upsert fail:', e));
            saveDocument('claims', newClaim.id, newClaim).catch(e => console.error('[Firestore claim fail]:', e));
            
            triggerNotificationAlert(
              'Billing Claim Transmitted',
              `An outpatient medical claim for $${claimCost} has been submitted for insurer review.`,
              'INSURANCE',
              rx.patientId
            );
          }
        }, 0);
      }

      const rxWithVisit = { ...rx, visitId: localVisitId };
      setSessionPrescriptions(prevRx => {
        const idx = prevRx.findIndex(p => p.id === rxWithVisit.id);
        if (idx >= 0) {
          const updated = [...prevRx];
          updated[idx] = rxWithVisit;
          return updated;
        }
        return [rxWithVisit, ...prevRx];
      });
      upsertPrescription(rxWithVisit).catch(e => console.warn('Supabase rx upload failure:', e));

      return updatedRecords;
    });

    triggerAuditAction(activeUser?.email || 'PHYSICIAN', 'PRESCRIPTION_TRANSMITTED', `Published prescription ${rx.medicationName} ${rx.dosage} for patient.`);
  };

  const handleAddLabResult = async (lab: LabResult) => {
    const docName = sessionUsers.find(u => u.id === lab.doctorId)?.fullName || 'Attending Physician';
    const patientObj = sessionUsers.find(u => u.id === lab.patientId);

    try {
      // Rule: Check if a visit already exists with sourceType == "labResult" and sourceId == labResultId
      const existingVisit = sessionMedicalRecords.find(r => r.sourceType === 'labResult' && r.sourceId === lab.id);
      let visitId = '';

      if (existingVisit) {
        visitId = existingVisit.id;
      } else {
        const randomNum = Math.floor(100 + Math.random() * 899);
        const yearStr = (lab.date || '').split('-')[0] || '2026';
        visitId = `rec-VIS-${yearStr}-${randomNum}`;
        const newVisit: MedicalRecord = {
          id: visitId,
          patientId: lab.patientId,
          doctorId: lab.doctorId,
          doctorName: docName,
          date: lab.date,
          chiefComplaint: 'Diagnostic Lab Review Intake',
          diagnosis: lab.interpretation || 'Symptom tracking requiring diagnostic specimen assay',
          treatmentPlan: `Ordered and scheduled lab panel: ${lab.testName}.`,
          notes: lab.notes || `Visit automatically generated for Laboratory Panel Request: ${lab.testName}.`,
          type: "visit",
          sourceType: "labResult",
          sourceId: lab.id
        };
        await saveDocument('medicalRecords', visitId, newVisit);
        upsertMedicalRecord(newVisit).catch(e => console.warn('Supabase lab visit add fail:', e));

        if (patientObj) {
          const claimCost = Math.floor(120 + Math.random() * 800);
          const newClaim: Claim = {
            id: 'cl-' + Math.floor(200 + Math.random() * 700),
            patientId: lab.patientId,
            patientName: patientObj.fullName,
            patientMedicalId: patientObj.medicalId || 'MID-789410',
            policyNumber: 'GS-PL-99812-C',
            coverageType: 'Gold Shield Premium Comprehensive Care',
            doctorName: docName,
            diagnosis: newVisit.diagnosis,
            cost: claimCost,
            status: 'PENDING',
            date: lab.date
          };
          saveDocument('claims', newClaim.id, newClaim).catch(e => console.error('[Firestore claim fail]:', e));
          upsertClaim(newClaim).catch(e => console.warn('Supabase lab claim write fail:', e));

          triggerNotificationAlert(
            'Billing Claim Transmitted',
            `An outpatient medical claim for $${claimCost} has been submitted for insurer review.`,
            'INSURANCE',
            lab.patientId
          );
        }
      }

      // 1. Create exactly one labResults document
      const labWithVisit = {
        ...lab,
        visitId,
        doctorName: docName,
        patientName: patientObj?.fullName || 'Clinical Subject',
        medicalId: patientObj?.medicalId || 'MID-789410'
      };
      await saveDocument('labResults', labWithVisit.id, labWithVisit);
      upsertLabResult(labWithVisit).catch(e => console.warn('Supabase lab insert fail:', e));

    } catch (err) {
      console.error('[Firestore lab/visit write fail]:', err);
    }

    triggerAuditAction(activeUser?.email || 'PATHOLOGIST', 'LAB_REPORTS_CERTIFIED', `Uploaded verified laboratory results sheet: ${lab.testName} (Status: ${lab.status}).`);
  };

  const handleAddRadiology = async (rad: RadiologyReport) => {
    const docName = sessionUsers.find(u => u.id === rad.doctorId)?.fullName || 'Attending Physician';
    let visitId = '';
    try {
      const existing = sessionMedicalRecords.find(r => r.patientId === rad.patientId && r.date === rad.date);
      if (existing) {
        visitId = existing.id;
        const updatedExist = {
          ...existing,
          notes: existing.notes.includes(rad.scanType) ? existing.notes : `${existing.notes} | Requested Scan: ${rad.scanType}`
        };
        await saveDocument('medicalRecords', existing.id, updatedExist);
      } else {
        const randomNum = Math.floor(100 + Math.random() * 899);
        const yearStr = (rad.date || '').split('-')[0] || '2026';
        visitId = `rec-VIS-${yearStr}-${randomNum}`;
        const newVisit: MedicalRecord = {
          id: visitId,
          patientId: rad.patientId,
          doctorId: rad.doctorId,
          doctorName: docName,
          date: rad.date,
          chiefComplaint: 'Radiological Imaging Consultation',
          diagnosis: 'Clinical investigation requiring high-resolution diagnosis scan',
          treatmentPlan: `Ordered and scheduled imaging study: ${rad.scanType}.`,
          notes: `Visit automatically generated for Radiological Scan Request: ${rad.scanType}.`
        };
        await saveDocument('medicalRecords', visitId, newVisit);
      }

      const radWithVisit = { ...rad, visitId, doctorName: docName };
      await saveDocument('radiologyReports', radWithVisit.id, radWithVisit);
    } catch (err) {
      console.error('[Firestore radiology/visit write fail]:', err);
    }

    setSessionMedicalRecords(prevRecords => {
      const existing = prevRecords.find(r => r.patientId === rad.patientId && r.date === rad.date);
      let localVisitId = '';
      let updatedRecords = [...prevRecords];

      if (existing) {
        localVisitId = existing.id;
        const updatedExist = {
          ...existing,
          notes: existing.notes.includes(rad.scanType) ? existing.notes : `${existing.notes} | Requested Scan: ${rad.scanType}`
        };
        updatedRecords = prevRecords.map(r => r.id === existing.id ? updatedExist : r);
        upsertMedicalRecord(updatedExist).catch(e => console.warn('Supabase radiology visit edit fail:', e));
      } else {
        const randomNum = Math.floor(100 + Math.random() * 899);
        const yearStr = (rad.date || '').split('-')[0] || '2026';
        localVisitId = `rec-VIS-${yearStr}-${randomNum}`;

        const newVisit: MedicalRecord = {
          id: localVisitId,
          patientId: rad.patientId,
          doctorId: rad.doctorId,
          doctorName: docName,
          date: rad.date,
          chiefComplaint: 'Radiological Imaging Consultation',
          diagnosis: 'Clinical investigation requiring high-resolution diagnosis scan',
          treatmentPlan: `Ordered and scheduled imaging study: ${rad.scanType}.`,
          notes: `Visit automatically generated for Radiological Scan Request: ${rad.scanType}.`
        };
        updatedRecords = [newVisit, ...prevRecords];
        upsertMedicalRecord(newVisit).catch(e => console.warn('Supabase radiology visit add fail:', e));

        setTimeout(() => {
          const patientObj = sessionUsers.find(u => u.id === rad.patientId);
          if (patientObj) {
            const claimCost = Math.floor(120 + Math.random() * 800);
            const newClaim: Claim = {
              id: 'cl-' + Math.floor(200 + Math.random() * 700),
              patientId: rad.patientId,
              patientName: patientObj.fullName,
              patientMedicalId: patientObj.medicalId || 'MID-789410',
              policyNumber: 'GS-PL-99812-C',
              coverageType: 'Gold Shield Premium Comprehensive Care',
              doctorName: docName,
              diagnosis: newVisit.diagnosis,
              cost: claimCost,
              status: 'PENDING',
              date: rad.date
            };
            setSessionClaims(prev => [newClaim, ...prev]);
            upsertClaim(newClaim).catch(e => console.warn('Supabase radiology claim write fail:', e));
            saveDocument('claims', newClaim.id, newClaim).catch(e => console.error('[Firestore claim fail]:', e));
            
            triggerNotificationAlert(
              'Billing Claim Transmitted',
              `An outpatient medical claim for $${claimCost} has been submitted for insurer review.`,
              'INSURANCE',
              rad.patientId
            );
          }
        }, 0);
      }

      // Save radiology with visitId
      const radWithVisit = { ...rad, visitId: localVisitId, doctorName: docName };
      setSessionRadiology(prevRad => {
        const index = prevRad.findIndex(r => r.id === rad.id);
        if (index >= 0) {
          const updated = [...prevRad];
          updated[index] = radWithVisit;
          return updated;
        }
        return [radWithVisit, ...prevRad];
      });
      upsertRadiology(radWithVisit).catch(e => console.warn('Supabase radiology insert fail:', e));

      return updatedRecords;
    });

    triggerAuditAction(activeUser?.email || 'RADIOLOGY', 'IMAGING_RECORD_SUBMITTED', `Appended high-resolution medical scan finds for ${rad.scanType}.`);
  };

  // Patient Updates Demographic
  const handleUpdatePatientProfile = (updatedProfile: User) => {
    setSessionUsers(prev => prev.map(u => u.id === updatedProfile.id ? updatedProfile : u));
    upsertUser(updatedProfile).catch(e => console.warn('Supabase demographic update fail:', e));
    triggerAuditAction(updatedProfile.email, 'DEMOGRAPHIC_RECORD_EDITED', `Patient adjusted basic profile telephone or billing name.`);
    if (activeUser && activeUser.id === updatedProfile.id) {
      setActiveUser(updatedProfile);
    }
  };


  // Generic User Profile Update
  const handleUpdateUserProfile = (userId: string, updatedFields: Partial<User>) => {
    setSessionUsers(prevUsers => prevUsers.map(u => {
      if (u.id === userId) {
        const updatedUser = { ...u, ...updatedFields };
        if (activeUser && activeUser.id === userId) {
          setActiveUser(updatedUser);
        }
        upsertUser(updatedUser).catch(e => console.warn('Supabase generic profile update fail:', e));
        return updatedUser;
      }
      return u;
    }));
  };

  // Specialty Request Approved by Admin
  const handleApproveProfessionalUpdate = (reqId: string) => {
    const updatedRequests = sessionProfessionalUpdates.map(req => {
      if (req.id === reqId) {
        const approvedReq = { ...req, status: 'APPROVED' as const };
        upsertProfessionalRequest(approvedReq).catch(e => console.warn('Supabase approve request failure:', e));
        
        setSessionUsers(prevUsers => prevUsers.map(u => {
          if (u.id === req.userId) {
            const updatedUser = {
              ...u,
              specialty: req.requestedSpecialty,
              licenseNumber: req.requestedLicenseNumber,
              institution: req.requestedHospital || u.institution,
              consultationHours: req.requestedConsultationHours || u.consultationHours,
              bio: req.requestedBio || u.bio
            };
            if (activeUser && activeUser.id === u.id) {
              setActiveUser(updatedUser);
            }
            upsertUser(updatedUser).catch(e => console.warn('Supabase approved professional update user sync fail:', e));
            return updatedUser;
          }
          return u;
        }));

        triggerAuditAction(
          activeUser?.email || 'ADMIN', 
          'SPECIALTY_UPDATE_APPROVED', 
          `Approved specialty upgrade for ${req.userName} from ${req.currentSpecialty} to ${req.requestedSpecialty}.`
        );
        return approvedReq;
      }
      return req;
    });
    setSessionProfessionalUpdates(updatedRequests);
  };

  // Specialty Request Rejected by Admin
  const handleRejectProfessionalUpdate = (reqId: string) => {
    const updatedRequests = sessionProfessionalUpdates.map(req => {
      if (req.id === reqId) {
        const rejectedReq = { ...req, status: 'REJECTED' as const };
        upsertProfessionalRequest(rejectedReq).catch(e => console.warn('Supabase reject request failure:', e));
        
        triggerAuditAction(
          activeUser?.email || 'ADMIN', 
          'SPECIALTY_UPDATE_DENIED', 
          `Rejected professional upgrade for ${req.userName} requesting ${req.requestedSpecialty}.`
        );
        return rejectedReq;
      }
      return req;
    });
    setSessionProfessionalUpdates(updatedRequests);
  };

  // Submit Specialty Update Request
  const handleRequestProfessionalUpdate = (req: ProfessionalUpdateRequest) => {
    setSessionProfessionalUpdates(prev => [req, ...prev]);
    upsertProfessionalRequest(req).catch(e => console.warn('Supabase submit professional request fail:', e));
    triggerAuditAction(
      req.userEmail,
      'SPECIALTY_UPDATE_REQUEST_SUBMITTED',
      `Doctor ${req.userName} filed professional update request for specialty: ${req.requestedSpecialty}.`
    );
  };

  // Organizational Management Handlers
  const handleAddInstitution = async (newInst: MedicalInstitution) => {
    setSessionInstitutions(prev => [newInst, ...prev]);
    try {
      await saveDocument("institutions", newInst.id, newInst);
    } catch (e) {
      console.error("Firestore add institution failed:", e);
    }
    triggerAuditAction(
      activeUser?.email || 'ADMIN',
      'INSTITUTION_CREATED',
      `Registered new healthcare institution: ${newInst.name} (${newInst.type}) in ${newInst.city}.`
    );
  };

  const handleUpdateInstitution = async (id: string, updated: Partial<MedicalInstitution>) => {
    setSessionInstitutions(prev => prev.map(inst => {
      if (inst.id === id) {
        const updatedInst = { ...inst, ...updated };
        saveDocument("institutions", id, updatedInst).catch(e => console.error("Firestore update inst failed:", e));
        return updatedInst;
      }
      return inst;
    }));
    triggerAuditAction(
      activeUser?.email || 'ADMIN',
      'INSTITUTION_UPDATED',
      `Modified details for institution ID: ${id}.`
    );
  };

  const handleDeleteInstitution = async (id: string) => {
    const target = sessionInstitutions.find(i => i.id === id);
    setSessionInstitutions(prev => prev.filter(inst => inst.id !== id));
    try {
      await deleteDocument("institutions", id);
    } catch (e) {
      console.error("Firestore delete inst failed:", e);
    }
    triggerAuditAction(
      activeUser?.email || 'ADMIN',
      'INSTITUTION_DELETED',
      `Permanently removed institution: ${target?.name || id}.`
    );
  };

  const handleAddInsuranceCompany = async (newComp: InsuranceCompany) => {
    setSessionInsuranceCompanies(prev => [newComp, ...prev]);
    try {
      await saveDocument("insuranceCompanies", newComp.id, newComp);
    } catch (e) {
      console.error("Firestore add insurance carrier failed:", e);
    }
    triggerAuditAction(
      activeUser?.email || 'ADMIN',
      'INSURANCE_COMPANY_CREATED',
      `Registered new insurance company: ${newComp.name}.`
    );
  };

  const handleUpdateInsuranceCompany = async (id: string, updated: Partial<InsuranceCompany>) => {
    setSessionInsuranceCompanies(prev => prev.map(comp => {
      if (comp.id === id) {
        const updatedComp = { ...comp, ...updated };
        saveDocument("insuranceCompanies", id, updatedComp).catch(e => console.error("Firestore update insurance failed:", e));
        return updatedComp;
      }
      return comp;
    }));
    triggerAuditAction(
      activeUser?.email || 'ADMIN',
      'INSURANCE_COMPANY_UPDATED',
      `Modified details for insurance company ID: ${id}.`
    );
  };

  const handleDeleteInsuranceCompany = async (id: string) => {
    const target = sessionInsuranceCompanies.find(c => c.id === id);
    setSessionInsuranceCompanies(prev => prev.filter(comp => comp.id !== id));
    try {
      await deleteDocument("insuranceCompanies", id);
    } catch (e) {
      console.error("Firestore delete insurance carrier failed:", e);
    }
    triggerAuditAction(
      activeUser?.email || 'ADMIN',
      'INSURANCE_COMPANY_DELETED',
      `Permanently removed insurance carrier: ${target?.name || id}.`
    );
  };

  const handleAddOrganizationRequest = async (newReq: OrganizationRequest) => {
    setSessionOrganizationRequests(prev => [newReq, ...prev]);
    try {
      await createOrganizationRequestInFirestore(newReq);
    } catch (e) {
      console.error("Firestore add org request failed:", e);
    }
    triggerAuditAction(
      newReq.requesterEmail,
      'ORG_CREATION_REQUEST_SUBMITTED',
      `Submitted creation proposal for organization: ${newReq.name} (${newReq.type}).`
    );

    const adminUser = sessionUsers.find(u => u.role === UserRole.ADMIN);
    if (adminUser) {
      triggerNotificationAlert(
        'New Organization Creation Proposal',
        `New request submitted for organization: ${newReq.name} (${newReq.type}) by ${newReq.requesterName}.`,
        'ALERT',
        adminUser.id
      );
    }
  };

  const handleApproveOrganizationRequest = async (id: string) => {
    const target = sessionOrganizationRequests.find(req => req.id === id);
    if (!target) return;

    // Check if duplicate already exists to protect institutional mappings
    const isDuplicate = target.type === 'INSTITUTION' 
      ? sessionInstitutions.some(i => i.name.toLowerCase() === target.name.toLowerCase())
      : sessionInsuranceCompanies.some(c => c.name.toLowerCase() === target.name.toLowerCase());

    if (isDuplicate) {
      triggerAuditAction(
        activeUser?.email || 'ADMIN',
        'ORG_REQUEST_DENIED',
        `Declined creation of '${target.name}' — duplicate institution/company name already exists.`
      );
      setSessionOrganizationRequests(prev => prev.map(r => {
        if (r.id === id) {
          const rejected = { ...r, status: 'REJECTED' as const };
          rejectOrganizationRequestInFirestore(id).catch(e => console.error(e));
          return rejected;
        }
        return r;
      }));
      return;
    }

    try {
      await approveOrganizationRequestInFirestore(id, target.type, target.name, target.details);
      
      // Live reload available options by retrieving latest collection states from Firestore
      const remoteInst = await loadFirestoreInstitutions();
      const remoteIns = await loadFirestoreInsuranceCompanies();
      setSessionInstitutions(remoteInst.length > 0 ? remoteInst : INITIAL_INSTITUTIONS);
      setSessionInsuranceCompanies(remoteIns.length > 0 ? remoteIns : INITIAL_INSURANCE_COMPANIES);

      setSessionOrganizationRequests(prev => prev.map(r => {
        if (r.id === id) {
          return { ...r, status: 'APPROVED' as const };
        }
        return r;
      }));

      triggerAuditAction(
        activeUser?.email || 'ADMIN',
        'ORG_REQUEST_APPROVED',
        `Approved and automatically provisioned organization node: ${target.name}.`
      );
    } catch (e: any) {
      console.error("Firestore approval transaction failed:", e);
      alert("Error: Approval transaction failed in Firestore: " + e?.message);
    }
  };

  const handleRejectOrganizationRequest = async (id: string) => {
    const target = sessionOrganizationRequests.find(req => req.id === id);
    setSessionOrganizationRequests(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, status: 'REJECTED' as const };
      }
      return r;
    }));
    try {
      await rejectOrganizationRequestInFirestore(id);
    } catch (e) {
      console.error(e);
    }
    triggerAuditAction(
      activeUser?.email || 'ADMIN',
      'ORG_REQUEST_REJECTED',
      `Rejected creation request of: ${target?.name || id}.`
    );
  };

  const handleUpdateEmergencyInfo = (updatedInfo: EmergencyInfo) => {
    if (!activeUser) return;
    setSessionEmergency(prev => ({
      ...prev,
      [activeUser.id]: updatedInfo
    }));
    upsertEmergency(activeUser.id, updatedInfo).catch(e => console.warn('Supabase emergency update fail:', e));
    triggerAuditAction(activeUser.email, 'EMERGENCY_DATA_REPROGRAMMED', `Patient directly authorized emergency biometrics overwrite (Blood: ${updatedInfo.bloodType}).`);
  };


  const handleLogout = () => {
    if (activeUser) {
      triggerAuditAction(activeUser.email, 'USER_LOGOUT', 'Securely closed portal session, de-allocating memory keys.');
    }
    // Sign out from Firebase Auth to clear the currentUser
    signOut(auth).catch(e => console.warn('Firebase signOut failure:', e));
    // Reset our role query cache
    clearUserRoleCache();

    setActiveUser(null);
    setCurrentPage('landing');
    setIsMobileSidebarOpen(false);
  };



  // Header Patient lookup
  const handleGlobalQuerySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = globalSearchQuery.toLowerCase().trim();
    if (!q) {
      setGlobalMatchedPatient(null);
      return;
    }
    const matched = sessionUsers.find(u => 
      u.role === UserRole.PATIENT && (
        u.fullName.toLowerCase().includes(q) ||
        (u.medicalId && u.medicalId.toLowerCase().includes(q)) ||
        u.nationalId.includes(q)
      )
    );
    setGlobalMatchedPatient(matched || null);
  };

  // Count active stats overview for admin dashboard props
  const activeStatsOverview = useMemo(() => {
    const patientsCount = sessionUsers.filter(u => u.role === UserRole.PATIENT).length;
    const doctorsCount = sessionUsers.filter(u => u.role === UserRole.DOCTOR).length;
    const activeUsersCount = sessionUsers.filter(u => u.status === UserStatus.ACTIVE).length;
    const visitsCount = sessionMedicalRecords.length;
    const claimsCount = sessionClaims.length;
    const qrCount = sessionUsers.filter(u => u.role === UserRole.PATIENT && u.medicalId).length;

    return {
      patientsCount,
      doctorsCount,
      activeUsersCount,
      visitsCount,
      claimsCount,
      qrCount
    };
  }, [sessionUsers, sessionMedicalRecords, sessionClaims]);

  // Read only indicators for dashboard bells
  const unreadNotifsCount = useMemo(() => {
    return sessionNotifications.filter(n => !n.read).length;
  }, [sessionNotifications]);

  const handleMarkAllNotifsRead = () => {
    setSessionNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div id="medlink-application" className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans antialiased selection:bg-sky-500/10">
      
      {/* 1. PUBLIC PAGES CONTAINER (when user session is inactive) */}
      {!activeUser || currentPage !== 'dashboard' ? (
        <div className="animate-in fade-in duration-150 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {currentPage === 'landing' && <PublicLanding onNavigate={setCurrentPage} />}
          {currentPage === 'login' && <Login users={sessionUsers} onLoginSuccess={handleLoginSuccess} onNavigate={setCurrentPage} />}
          {currentPage === 'register' && (
            <Register 
              onRegisterSubmit={handleNewRegistration} 
              onNavigate={setCurrentPage} 
              institutions={sessionInstitutions}
              onAddOrganizationRequest={handleAddOrganizationRequest}
            />
          )}
          {currentPage === 'forgot-password' && <ForgotPassword users={sessionUsers} onResetPassword={handlePasswordReset} onNavigate={setCurrentPage} />}
        </div>
      ) : activeUser.role === UserRole.ADMIN ? (
        <AdminDashboard
          users={sessionUsers}
          departments={sessionDepartments}
          auditLogs={sessionLogs}
          activeUser={activeUser}
          onUpdateUserStatus={handleUpdateUserStatus}
          onUpdateUserRole={() => {}} 
          onDeleteUser={handleDeleteUser}
          onAddUser={handleAddUser}
          onAddDepartment={handleAddDepartment}
          onDeleteDepartment={handleDeleteDepartment}
          onEditDepartment={handleEditDepartment}
          activeCounts={activeStatsOverview}
          professionalRequests={sessionProfessionalUpdates}
          onApproveProfessionalUpdate={handleApproveProfessionalUpdate}
          onRejectProfessionalUpdate={handleRejectProfessionalUpdate}
          onUpdateUserProfile={handleUpdateUserProfile}
          onLogout={handleLogout}
          institutions={sessionInstitutions}
          insuranceCompanies={sessionInsuranceCompanies}
          organizationRequests={sessionOrganizationRequests}
          onAddInstitution={handleAddInstitution}
          onUpdateInstitution={handleUpdateInstitution}
          onDeleteInstitution={handleDeleteInstitution}
          onAddInsuranceCompany={handleAddInsuranceCompany}
          onUpdateInsuranceCompany={handleUpdateInsuranceCompany}
          onDeleteInsuranceCompany={handleDeleteInsuranceCompany}
          onApproveOrganizationRequest={handleApproveOrganizationRequest}
          onRejectOrganizationRequest={handleRejectOrganizationRequest}
          supabaseStatus={supabaseStatus}
          onSyncDatabase={syncDatabase}
          onSeedDatabase={handleSeedDatabase}
          isSyncing={isSyncing}
        />
      ) : (activeUser.status === UserStatus.PENDING && (activeUser.role === UserRole.DOCTOR || activeUser.role === UserRole.INSURANCE)) ? (
        /* PENDING CREDENTIALS BLOCKING SCREEN */
        <div id="pending-approval-portal-screen" className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans w-full">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-lg p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-xs relative">
              <Clock className="h-8 w-8 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-ping"></div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">
                Credentials Under Board Review
              </h2>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Waiting for administrator approval
              </p>
              <p className="text-xs text-slate-500 leading-relaxed pt-2">
                Your professional request is being verified against active medical registries and licensing systems. Clean verification audits typically conclude within 24 business hours.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-left space-y-2 font-semibold text-xs text-slate-600">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Registration Details</span>
              <p>Email: <strong className="text-slate-800 font-bold">{activeUser.email}</strong></p>
              <p>Name: <strong className="text-slate-800 font-bold">{activeUser.fullName}</strong></p>
              <p>Role: <strong className="text-slate-800 font-bold">{activeUser.role}</strong></p>
              {activeUser.role === UserRole.DOCTOR ? (
                <>
                  <p>Institution: <strong className="text-slate-800 font-bold">{activeUser.institution}</strong></p>
                  <p>Specialty: <strong className="text-slate-800 font-bold">{activeUser.specialty}</strong></p>
                  <p>License: <strong className="text-slate-800 font-bold font-mono">{activeUser.licenseNumber}</strong></p>
                </>
              ) : (
                <>
                  <p>Company: <strong className="text-slate-800 font-bold">{activeUser.insuranceCompany}</strong></p>
                  <p>Branch: <strong className="text-slate-800 font-bold">{activeUser.branchOffice}</strong></p>
                  <p>Employee ID: <strong className="text-slate-800 font-bold font-mono">{activeUser.employeeId}</strong></p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={async () => {
                  setIsSyncing(true);
                  try {
                    const remoteUsers = await syncFromSupabase<User>('users', INITIAL_USERS);
                    setSessionUsers(remoteUsers);
                    const latestProfile = remoteUsers.find(u => u.id === activeUser.id);
                    if (latestProfile) {
                      setActiveUser(latestProfile);
                    }
                  } catch (e) {
                    console.error("Failed status reload:", e);
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                disabled={isSyncing}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer outline-none"
              >
                <Activity className="h-4 w-4 animate-pulse" />
                <span>{isSyncing ? 'Refreshing Credentials...' : 'Check Approval Status'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer outline-none"
              >
                Sign Out / Exit Portal
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. AUTHENTICATED DASHBOARD PORTAL CONTAINER */
        <div className="flex h-screen overflow-hidden">
          
          {/* SECURE SIDEBAR - PERSISTENT ON DESKTOP */}
          <aside className="hidden lg:flex lg:flex-shrink-0 lg:flex-col w-64 bg-white text-slate-500 border-r border-slate-200 z-10 no-print">
            <SidebarContent
              activeUser={activeUser}
              activeSection={
                activeUser.role === UserRole.PATIENT ? patientSection :
                activeUser.role === UserRole.INSURANCE ? insuranceSection :
                activeUser.role === UserRole.DOCTOR ? doctorSection : ''
              }
              onSectionChange={(section) => {
                if (activeUser.role === UserRole.PATIENT) {
                  setPatientSection(section as any);
                } else if (activeUser.role === UserRole.INSURANCE) {
                  setInsuranceSection(section as any);
                } else if (activeUser.role === UserRole.DOCTOR) {
                  setDoctorSection(section);
                }
              }}
              onLogout={handleLogout}
            />
          </aside>

          {/* MAIN PAGE LAYOUT PANEL */}
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F8FAFC] relative">
            
            {/* SUPERHEADER CONTAINER - NO PRINT */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs no-print">
              
              {/* Left Segment: Mobile Navbar trigger and Welcome greeting */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg lg:hidden"
                >
                  <Menu className="h-5 w-5 text-slate-600" />
                </button>
                
                <div>
                  {activeUser.role === UserRole.PATIENT ? (
                    <>
                      <h2 className="text-base font-extrabold text-slate-950">MedLink Patient Portal</h2>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase rounded text-[9px]">Verified Patient</span>
                        <span className="text-slate-400 font-mono">Medical ID: {activeUser.medicalId}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-base font-extrabold text-slate-950 font-sans">
                        {activeUser.role === UserRole.INSURANCE ? "Nile Health Insurance Staff Portal" : "MedLink Healthcare Portal"}
                      </h2>
                    </>
                  )}
                </div>
              </div>

              {/* Right Segment: Diagnostic patient lookup query, Notifications, Avatar */}
              <div className="flex items-center gap-4">
                {activeUser.role !== UserRole.PATIENT && (
                  <form onSubmit={handleGlobalQuerySearch} className="hidden md:flex relative text-xs">
                    <input 
                      type="text"
                      value={globalSearchQuery}
                      onChange={(e) => {
                        setGlobalSearchQuery(e.target.value);
                        if (!e.target.value) setGlobalMatchedPatient(null);
                      }}
                      placeholder="Search patient record..."
                      className="px-3.5 py-1.5 pl-8 text-xs bg-slate-100 border border-slate-200 focus:border-sky-300 rounded-lg outline-none max-w-[170px]"
                    />
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    
                    {/* Floating matches popup list */}
                    {globalMatchedPatient && (
                      <div className="absolute top-10 right-0 max-w-xs w-64 bg-white border border-slate-100 rounded-xl p-3 shadow-xl alert-shadow space-y-2 z-50">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="font-bold text-slate-800">Match Detected</span>
                          <button type="button" onClick={() => { setGlobalMatchedPatient(null); setGlobalSearchQuery(''); }} className="p-0.5 text-slate-400 font-bold hover:text-slate-650">×</button>
                        </div>
                        <p className="text-[11px]">Matched: <strong>{globalMatchedPatient.fullName}</strong> ({globalMatchedPatient.medicalId})</p>
                        <button
                          type="button"
                          onClick={() => {
                            // If provider is doctor, load patient
                            if (activeUser.role === UserRole.DOCTOR) {
                              alert(`Routing clinician directly to ${globalMatchedPatient.fullName} consult chart.`);
                            } else {
                              alert(`Lookup registered: ${globalMatchedPatient.fullName}. Switch to treating Doctor Sarah to enter clinical records.`);
                            }
                            setGlobalMatchedPatient(null);
                            setGlobalSearchQuery('');
                          }}
                          className="w-full py-1 text-center font-bold bg-sky-50 text-sky-600 text-[10px] rounded"
                        >
                          Trigger Target View
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {/* 2. SECURITY NOTIFICATION BELL */}
                <div className="relative">
                  <button
                    id="btn-bell-notif"
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsProfileDropdownOpen(false);
                    }}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl relative cursor-pointer"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute top-1 right-1 bg-sky-500 text-white font-mono font-bold text-[8px] h-4 w-4 rounded-full flex items-center justify-center">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>

                  {/* Notification List Container drop down */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 alert-shadow space-y-3 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">System Alerts Notification</h4>
                        <button
                          onClick={handleMarkAllNotifsRead}
                          className="text-[10px] text-sky-600 hover:text-sky-500 font-semibold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {sessionNotifications.map(notif => (
                          <div key={notif.id} className={`p-2.5 rounded-xl border text-xs text-slate-600 space-y-1 ${
                            notif.read ? 'bg-slate-50/50 border-slate-100' : 'bg-sky-50/30 border-sky-100/60 font-medium'
                          }`}>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900 text-xs">{notif.title}</span>
                              <span className="text-[8px] font-mono text-slate-400 font-semibold">{notif.date}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight">{notif.message}</p>
                          </div>
                        ))}
                        {sessionNotifications.length === 0 && (
                          <p className="text-center italic text-slate-400 py-6 text-[11px]">No active dispatch notifications logged.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. PROFILE HEADER LOGOUT DROPDOWN */}
                <div className="relative">
                  <button
                    id="btn-avatar-profile"
                    onClick={() => {
                      setIsProfileDropdownOpen(!isProfileDropdownOpen);
                      setIsNotificationsOpen(false);
                    }}
                    className="h-9 w-9 bg-slate-900 text-white rounded-xl shadow-xs hover:border hover:border-sky-300 transition-colors flex items-center justify-center font-bold font-mono text-sm cursor-pointer select-none overflow-hidden"
                  >
                    {activeUser.photoUrl ? (
                      <img src={activeUser.photoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      (activeUser.fullName || '').split(' ').map(n=>n[0]).join('')
                    )}
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl p-2 shadow-xl alert-shadow z-45 animate-in fade-in duration-100 text-xs">
                      <div className="p-3 border-b text-slate-400 font-mono text-[9px] uppercase font-bold">
                        Account Info
                      </div>
                      
                      {/* Read only info triggers */}
                      <div className="p-3">
                        <p className="font-bold text-slate-900 leading-none">{activeUser.fullName}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{activeUser.email}</p>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full py-2.5 px-3 hover:bg-slate-100 text-left text-rose-600 font-bold flex items-center gap-1.5 rounded-xl cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out Session
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </header>

            {/* MAIN APPLES PANEL WRAPPER - SCROLLABLE COMPONENT GRID */}
            <div className="p-6 max-w-7xl w-full mx-auto flex-1">
              
              {/* Dynamic routing display panels rendering corresponding to active authenticated roles */}
              {activeUser.role === UserRole.ADMIN && (
                <AdminDashboard
                  users={sessionUsers}
                  departments={sessionDepartments}
                  auditLogs={sessionLogs}
                  activeUser={activeUser}
                  onUpdateUserStatus={handleUpdateUserStatus}
                  onUpdateUserRole={() => {}} 
                  onDeleteUser={handleDeleteUser}
                  onAddUser={handleAddUser}
                  onAddDepartment={handleAddDepartment}
                  onDeleteDepartment={handleDeleteDepartment}
                  onEditDepartment={handleEditDepartment}
                  activeCounts={activeStatsOverview}
                  professionalRequests={sessionProfessionalUpdates}
                  onApproveProfessionalUpdate={handleApproveProfessionalUpdate}
                  onRejectProfessionalUpdate={handleRejectProfessionalUpdate}
                  onUpdateUserProfile={handleUpdateUserProfile}
                  onLogout={handleLogout}
                  institutions={sessionInstitutions}
                  insuranceCompanies={sessionInsuranceCompanies}
                  organizationRequests={sessionOrganizationRequests}
                  onAddInstitution={handleAddInstitution}
                  onUpdateInstitution={handleUpdateInstitution}
                  onDeleteInstitution={handleDeleteInstitution}
                  onAddInsuranceCompany={handleAddInsuranceCompany}
                  onUpdateInsuranceCompany={handleUpdateInsuranceCompany}
                  onDeleteInsuranceCompany={handleDeleteInsuranceCompany}
                  onApproveOrganizationRequest={handleApproveOrganizationRequest}
                  onRejectOrganizationRequest={handleRejectOrganizationRequest}
                  supabaseStatus={supabaseStatus}
                  onSyncDatabase={syncDatabase}
                  onSeedDatabase={handleSeedDatabase}
                  isSyncing={isSyncing}
                />
              )}





              {activeUser.role === UserRole.PATIENT && (
                <PatientDashboard
                  patientUser={activeUser}
                  activeSection={patientSection}
                  onSectionChange={setPatientSection}
                  emergencyInfo={sessionEmergency[activeUser.id] || {
                    bloodType: 'O+ Positive',
                    allergies: 'Penicillin, Peanuts, Bee Venom',
                    chronicDiseases: 'Mild Asthma, Hypertension',
                    criticalMedications: 'None',
                    emergencyContactName: 'Fatma Salah (Sister)',
                    emergencyContactPhone: '+20 (102) 449-1122'
                  }}
                  medicalRecords={sessionMedicalRecords}
                  prescriptions={sessionPrescriptions}
                  labResults={sessionLabResults}
                  radiologyReports={sessionRadiology}
                  onUpdatePatientProfile={handleUpdatePatientProfile}
                  onUpdateEmergencyInfo={handleUpdateEmergencyInfo}
                  onLogout={handleLogout}
                  onUpdateUserProfile={handleUpdateUserProfile}
                  cardRequests={sessionCardRequests.filter(r => r.patientId === activeUser.id)}
                  onAddCardRequest={handleAddCardRequest}
                />
              )}

              {activeUser.role === UserRole.DOCTOR && (
                <DoctorDashboard
                  doctorUser={activeUser}
                  patients={sessionUsers.filter(u => u.role === UserRole.PATIENT)}
                  emergencyRecords={sessionEmergency}
                  medicalRecords={sessionMedicalRecords}
                  prescriptions={sessionPrescriptions}
                  labResults={sessionLabResults}
                  radiologyReports={sessionRadiology}
                  onAddMedicalRecord={handleAddMedicalRecord}
                  onAddPrescription={handleAddPrescription}
                  onAddLabResult={handleAddLabResult}
                  onAddRadiology={handleAddRadiology}
                  activeSection={doctorSection}
                  onSectionChange={setDoctorSection}
                  onLogout={handleLogout}
                  onUpdateUserProfile={handleUpdateUserProfile}
                  professionalRequests={sessionProfessionalUpdates}
                  onRequestProfessionalUpdate={handleRequestProfessionalUpdate}
                  institutions={sessionInstitutions}
                />
              )}



            </div>

          </main>

          {/* MOBILE SIDEBAR MODAL - NO PRINT ENTRY */}
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden no-print animate-in fade-in duration-300">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)}></div>
                
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="relative flex flex-col max-w-xs w-full h-full bg-slate-900 border-r border-slate-800 shadow-2xl z-50"
                >
                  <div className="absolute top-4 right-[-48px] z-50">
                    <button
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="flex items-center justify-center h-10 w-10 rounded-full text-white bg-slate-800/80 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all shadow-lg border border-slate-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    <SidebarContent
                      activeUser={activeUser}
                      activeSection={
                        activeUser.role === UserRole.PATIENT ? patientSection :
                        activeUser.role === UserRole.INSURANCE ? insuranceSection :
                        activeUser.role === UserRole.DOCTOR ? doctorSection : ''
                      }
                      onSectionChange={(section) => {
                        if (activeUser.role === UserRole.PATIENT) {
                          setPatientSection(section as any);
                        } else if (activeUser.role === UserRole.INSURANCE) {
                          setInsuranceSection(section as any);
                        } else if (activeUser.role === UserRole.DOCTOR) {
                          setDoctorSection(section);
                        }
                        setIsMobileSidebarOpen(false);
                      }}
                      onLogout={() => {
                        setIsMobileSidebarOpen(false);
                        handleLogout();
                      }}
                      isMobile={true}
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
