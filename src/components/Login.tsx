/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Activity, ArrowRight, User as UserIcon, Stethoscope, Shield, ShieldAlert, Sparkles } from 'lucide-react';
import { User as UserType, UserRole, UserStatus } from '../types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile, saveUserProfile } from '../lib/firestoreService';

interface LoginProps {
  users: UserType[];
  onLoginSuccess: (user: UserType) => void;
  onNavigate: (page: 'landing' | 'login' | 'register' | 'forgot-password') => void;
}

export default function Login({ users, onLoginSuccess, onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoginFeedback('');

    if (!email || !password) {
      setErrorMsg('Please specify both clinical email and password credentials.');
      return;
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please specify a valid medical or patient email address.');
      return;
    }

    setIsSubmitting(true);
    setLoginFeedback('Connecting to secure Firebase Auth gateway...');

    try {
      const loginEmail = email.toLowerCase().trim();
      const loginPassword = password;

      // Handle Firebase sign-in first
      let firebaseUserCred;
      try {
        firebaseUserCred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        setLoginFeedback('Firebase Authentication verified...');
      } catch (authErr: any) {
        // Safe check: if this user exists locally with correct password, auto-migrate to Firebase
        const preloadedUser = users.find(u => u.email.toLowerCase() === loginEmail);
        if (preloadedUser && preloadedUser.password === loginPassword) {
          try {
            setLoginFeedback('Migrating preloaded account to Firebase ...');
            firebaseUserCred = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
            const newUid = firebaseUserCred.user.uid;
            
            // Generate the migrated profile and save directly to Firestore
            const migratedProfile: UserType = {
              ...preloadedUser,
              id: newUid,
              uid: newUid
            };
            await saveUserProfile(newUid, migratedProfile);
            console.log(`[Migration] Legacy profile migrated successfully for UID: ${newUid}`);
          } catch (migrateErr: any) {
            console.error("Migration to Firebase failed:", migrateErr);
            throw authErr;
          }
        } else {
          let errorFriendly = authErr?.message || 'Access Denied.';
          if (authErr?.code === 'auth/wrong-password' || authErr?.code === 'auth/invalid-credential') {
            errorFriendly = 'Invalid credentials. Password verification failed.';
          } else if (authErr?.code === 'auth/user-not-found') {
            errorFriendly = 'Associated user profile not found. Please register or contact system administrator.';
          } else if (authErr?.code === 'auth/invalid-email') {
            errorFriendly = 'Please specify a valid medical or patient email address.';
          }
          setErrorMsg(errorFriendly);
          setIsSubmitting(false);
          return;
        }
      }

      const uid = firebaseUserCred.user.uid;
      // Fetch Firestore user profile - source of truth
      console.log(`[Login] Loading user profile from Firestore users/${uid}`);
      let foundUser = await getUserProfile(uid);

      // Self-healing or administrative provision bypass
      if (!foundUser && loginEmail === 'anasmohamed9lqn@gmail.com') {
        setLoginFeedback('Self-healing Super Admin configuration in Firestore...');
        foundUser = {
          id: uid,
          uid: uid,
          email: 'anasmohamed9lqn@gmail.com',
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          fullName: 'Super Admin Anas',
          phoneNumber: '+20 (100) 123-4567',
          nationalId: 'NID-999999',
          gender: 'Male',
          dateOfBirth: '1995-05-18',
          joinedDate: new Date().toISOString().split('T')[0],
          adminRole: 'SUPER' as const,
          password: loginPassword,
        };
        await saveUserProfile(uid, foundUser);
      }

      if (!foundUser) {
        console.warn(`[Login] Match failed: Auth exists but profile record users/${uid} is missing.`);
        setErrorMsg('Profile record missing. Please contact administrator.');
        setIsSubmitting(false);
        return;
      }

      console.log(`[Login] Role detection: role=${foundUser.role}, status=${foundUser.status}`);

      // Apply strict status verification
      if (foundUser.status === UserStatus.PENDING) {
        console.warn(`[Login] Login blocked for ${foundUser.fullName}: status is ${foundUser.status}`);
        setErrorMsg('Waiting for administrator approval');
        setIsSubmitting(false);
        return;
      }

      if (foundUser.status === UserStatus.DECLINED) {
        console.warn(`[Login] Login blocked for ${foundUser.fullName}: status is rejected`);
        setErrorMsg('Associated user profile was rejected. Please contact support.');
        setIsSubmitting(false);
        return;
      }

      if (foundUser.status === UserStatus.SUSPENDED) {
        setErrorMsg('Access Denied. Your credential access has been suspended by the administration.');
        setIsSubmitting(false);
        return;
      }

      setLoginFeedback(`Securing session... Authenticating as ${foundUser.fullName} (${foundUser.role})`);
      
      const sessionUser = foundUser;
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(sessionUser);
      }, 1000);

    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected authentication error occurred.');
      setIsSubmitting(false);
    }
  };

  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionStatus, setProvisionStatus] = useState('');

  const provisionSuperAdmin = async () => {
    setIsProvisioning(true);
    setProvisionStatus('Provisioning locally & online in Firebase...');
    try {
      const targetEmail = 'anasmohamed9lqn@gmail.com';
      const targetPassword = '1234567890anas';

      let authUser;
      // Provision inside Firebase Auth as well
      try {
        const userCred = await createUserWithEmailAndPassword(auth, targetEmail, targetPassword);
        authUser = userCred.user;
      } catch (fbErr: any) {
        console.warn("Firebase provisioning skipped: user might already exist.", fbErr);
        // Attempt signin to get UID if user already exists
        try {
          const userCred = await signInWithEmailAndPassword(auth, targetEmail, targetPassword);
          authUser = userCred.user;
        } catch (authErr) {
          console.error("Firebase auth check unsuccessful:", authErr);
        }
      }

      if (authUser) {
        const adminProfile = {
          id: authUser.uid,
          uid: authUser.uid,
          email: targetEmail,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          fullName: 'Super Admin Anas',
          phoneNumber: '+20 (100) 123-4567',
          nationalId: 'NID-999999',
          gender: 'Male',
          dateOfBirth: '1995-05-18',
          joinedDate: new Date().toISOString().split('T')[0],
          adminRole: 'SUPER' as const,
          password: targetPassword
        };
        await saveUserProfile(authUser.uid, adminProfile);
        setProvisionStatus('Success! Super Admin account provisioned inside Firebase & locally!');
        setEmail(targetEmail);
        setPassword(targetPassword);
        
        // Push to local list if initialized
        const existingLocal = users.find(u => u.id === authUser.uid);
        if (!existingLocal) {
          users.push(adminProfile);
        }
      } else {
        setProvisionStatus('Exception inside registration setup: Firebase Auth UID not resolved.');
      }
    } catch (e: any) {
      setProvisionStatus(`Exception during registration setup: ${e?.message || e}`);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleSimulatedLogin = (role: UserRole) => {
    setErrorMsg('');
    setLoginFeedback('');
    setIsSubmitting(true);

    // 1. Try to find an existing user of that role in our loaded users prop
    const matchingUser = users.find(u => u.role === role && u.status === UserStatus.ACTIVE);
    
    if (matchingUser) {
      setLoginFeedback(`Fast-tracking authentication for live active account: ${matchingUser.fullName}...`);
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(matchingUser);
      }, 700);
      return;
    }

    // 2. If none exists, log in under a fully built template account
    let templateUser: UserType;
    if (role === UserRole.ADMIN) {
      templateUser = {
        id: 'u-admin-01',
        email: 'elkinganas495@gmai.com',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        fullName: 'Super Admin',
        phoneNumber: '+20 (100) 000-0000',
        nationalId: 'NID-999999',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        joinedDate: '2023-01-10',
        adminRole: 'SUPER',
      };
    } else if (role === UserRole.DOCTOR) {
      templateUser = {
        id: 'sim-doctor-01',
        email: 'doctor@medlink.com',
        role: UserRole.DOCTOR,
        status: UserStatus.ACTIVE,
        fullName: 'Dr. Sarah Jenkins',
        phoneNumber: '+1 (555) 123-4567',
        nationalId: 'NID-DOC-0283',
        gender: 'Female',
        dateOfBirth: '1982-08-24',
        joinedDate: '2023-01-10',
        specialty: 'Cardiology',
        institution: 'Cairo Medical Center',
        institutionType: 'Clinic',
        licenseNumber: 'LIC-DOC-7890',
        experience: '12 Years',
        bio: 'Board-certified cardiologist specializing in coronary artery disease and clinical cardiac electrophysiology.',
        consultationHours: 'Mon-Fri: 09:00 - 16:00',
      };
    } else {
      templateUser = {
        id: 'sim-patient-01',
        email: 'patient@medlink.com',
        role: UserRole.PATIENT,
        status: UserStatus.ACTIVE,
        fullName: 'Anas Mohamed',
        phoneNumber: '+20 (100) 123-4567',
        nationalId: 'NID-PAT-9038',
        gender: 'Male',
        dateOfBirth: '1995-05-18',
        joinedDate: '2024-02-11',
        medicalId: 'MID-789410',
      };
    }

    setLoginFeedback(`Fast-tracking remote session for simulated ${role.toLowerCase()}: ${templateUser.fullName}...`);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(templateUser);
    }, 700);
  };



  return (
    <div id="login-container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="bg-sky-500 text-white p-3 rounded-2xl shadow-md inline-flex items-center">
            <Activity className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-3xl font-sans font-extrabold text-slate-900 tracking-tight">
          MedLink Clinical Secure Access
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your clinician, patient, or administrator credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-md rounded-2xl border border-sky-50 sm:px-10 space-y-5">
          
          <form className="space-y-4" onSubmit={handleManualLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Credential Email
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@medlink.com"
                  className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm text-slate-800 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Secure Password
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm text-slate-800 transition-colors ${!showPassword ? 'secure-mask-input' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-sky-500 focus:ring-sky-400 border-slate-300 rounded-sm cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-500 font-medium cursor-pointer">
                  Remember my medical key
                </label>
              </div>

              <div className="text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="font-semibold text-sky-600 hover:text-sky-500 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-100/80 rounded-xl text-xs text-red-600 font-medium alert-shadow">
                ⚠️ {errorMsg}
              </div>
            )}

            {loginFeedback && (
              <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-700 font-medium animate-pulse flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-500 animate-spin" />
                {loginFeedback}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-semibold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Authenticate Profile'}</span>
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </form>



          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">
              No account yet?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="font-bold text-sky-600 hover:text-sky-500 cursor-pointer"
              >
                Register Here
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
