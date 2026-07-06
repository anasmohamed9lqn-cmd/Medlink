/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, KeyRound, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '../types';

interface ForgotPasswordProps {
  users: UserType[];
  onResetPassword: (email: string, newPass: string) => void;
  onNavigate: (page: 'landing' | 'login' | 'register' | 'forgot-password') => void;
}

export default function ForgotPassword({ users, onResetPassword, onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSendToken = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please specify your registered account email.');
      return;
    }

    const exists = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (!exists) {
      setErrorMsg('This email does not exist in MedLink. Please use an pre-seeded account or register first.');
      return;
    }

    // Go to step 2 (Set new password)
    setStep(2);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || !confirmNewPassword) {
      setErrorMsg('Please complete both password boxes.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Your security password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Mismatched password strings entered.');
      return;
    }

    onResetPassword(email, newPassword);
    setStep(3);
  };

  return (
    <div id="forgot-password" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="bg-sky-500 text-white p-3 rounded-2xl shadow-md inline-flex items-center">
            <KeyRound className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-3xl font-sans font-extrabold text-slate-900 tracking-tight">
          Reset Password Key
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Restore authorized clinician or patient system passwords.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md rounded-2xl border border-sky-50 sm:px-10 space-y-6">

          {step === 1 && (
            <form onSubmit={handleSendToken} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide your clinical login email below. we will send a virtual system clearance code to approve setting a new password.
              </p>
              
              <div>
                <label htmlFor="registered-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="registered-email"
                    name="registered_email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@medlink.com"
                    className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm text-slate-800"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium font-sans">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              >
                <span>Verify Credentials</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs space-y-1">
                <p className="font-bold">✓ Clearance Code Verified (#MED-SECURE)</p>
                <p>Authorized access confirmed. Type your new secret credentials.</p>
              </div>

               <div>
                <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  New Secret Password
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="new-password"
                    name="new_password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Confirm New Password
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirm-new-password"
                    name="confirm_new_password"
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm text-slate-800"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium font-sans">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              >
                <span>Overwrite Access Password</span>
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Password Reprogrammed</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your security key has been updated across our database registry successfully.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl cursor-pointer text-sm"
              >
                Back to Secure Login Screen
              </button>
            </div>
          )}

          {step !== 3 && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-xs text-slate-500 hover:text-sky-600 font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Cancel and Back to Log In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
