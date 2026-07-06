/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Activity, Shield, ShieldCheck, LogOut, HelpCircle, Settings, ClipboardList, 
  User as UserIcon, Pill, FlaskConical, Image as ImageIcon, Search, Calendar, 
  ClipboardCheck, FileCheck, FileText, Clipboard, QrCode, Building, AlertTriangle, 
  Users, Sliders, Database, Heart, Briefcase
} from 'lucide-react';
import { User, UserRole } from '../types';

export interface SidebarContentProps {
  activeUser: User | null;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  isMobile?: boolean;
}

export default function SidebarContent({
  activeUser,
  activeSection,
  onSectionChange,
  onLogout,
  isMobile = false
}: SidebarContentProps) {

  // Loading indicator / session hydration fallback skeleton
  if (!activeUser || !activeUser.role) {
    return (
      <div className="flex flex-col h-full animate-pulse p-6 space-y-6 bg-slate-900 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-xl"></div>
          <div className="h-4 w-28 bg-slate-800 rounded"></div>
        </div>
        <div className="py-4 border-y border-slate-800 space-y-2">
          <div className="h-4 w-32 bg-slate-800 rounded"></div>
          <div className="h-3 w-20 bg-slate-800 rounded"></div>
        </div>
        <div className="space-y-3 pt-4 flex-1">
          <div className="h-9 bg-slate-800 rounded-xl"></div>
          <div className="h-9 bg-slate-800 rounded-xl"></div>
          <div className="h-9 bg-slate-800 rounded-xl"></div>
          <div className="h-9 bg-slate-100 rounded-xl"></div>
          <div className="h-9 bg-slate-805 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const isDark = isMobile || activeUser.role === UserRole.ADMIN;

  const getNavItemClass = (tab: string) => {
    const isActive = activeSection === tab;
    if (isDark) {
      if (activeUser.role === UserRole.ADMIN) {
        const activeBg = tab === 'database' ? 'bg-emerald-600 text-white shadow-md' : 'bg-sky-505 bg-sky-500 text-white shadow-md';
        return `w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all text-xs font-bold ${
          isActive ? activeBg : 'hover:bg-slate-800 hover:text-white text-slate-400'
        }`;
      } else {
        return `w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all text-xs font-bold ${
          isActive ? 'bg-slate-800 text-white font-bold border border-slate-700' : 'hover:bg-slate-800/50 text-slate-400'
        }`;
      }
    } else {
      return `w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all text-xs font-bold ${
        isActive ? 'bg-sky-50 text-sky-600 font-bold border border-sky-100/30' : 'hover:bg-slate-50 text-slate-600'
      }`;
    }
  };

  const renderHeader = () => {
    if (activeUser.role === UserRole.ADMIN) {
      return (
        <div className="p-5 border-b border-slate-800 bg-[#1E293B]/40 flex flex-col items-center text-center space-y-3 shrink-0">
          <div className="relative group w-16 h-16 rounded-full bg-sky-200 border-2 border-sky-400 overflow-hidden flex items-center justify-center font-extrabold text-slate-800 shadow-md">
            {activeUser.photoUrl ? (
              <img src={activeUser.photoUrl} alt="Admin Pic" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              (activeUser.fullName || '').split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase()
            )}
          </div>

          <div className="space-y-1 w-full overflow-hidden">
            <h4 className="text-white font-bold text-sm tracking-tight truncate">
              {activeUser.fullName}
            </h4>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 shrink-0 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                {activeUser.adminRole === 'SUPER' ? 'Super Administrator' : activeUser.adminRole === 'OPERATIONS' ? 'Operations Administrator' : 'Support Administrator'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight pt-1 truncate">
              {activeUser.email}
            </p>
          </div>
        </div>
      );
    }

    const isPatient = activeUser.role === UserRole.PATIENT;
    const isDoctor = activeUser.role === UserRole.DOCTOR;

    return (
      <div className="shrink-0">
        <div className={`p-6 flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <div className="bg-sky-500 text-white p-2 rounded-xl">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <span className={`font-sans font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Med<span className={isDark ? 'text-sky-400' : 'text-sky-500'}>Link</span>
            </span>
          </div>
        </div>

        {isPatient ? (
          <div className={`px-6 py-4 border-b text-xs ${isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 block uppercase font-bold">Verified Patient File</span>
            <p className={`font-bold mt-1 truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeUser.fullName}</p>
            <div className="flex items-center justify-between mt-1.5 text-[9px]">
              <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 font-bold uppercase rounded text-[9px]">Verified Patient</span>
              <span className="text-slate-400 font-mono">MID: {activeUser.medicalId}</span>
            </div>
          </div>
        ) : isDoctor ? (
          <div className={`px-6 py-4 border-b text-xs text-left space-y-2 ${isDark ? 'border-slate-800 bg-[#1E293B]/40 text-slate-400' : 'border-slate-200 bg-[#F8FAFC] text-slate-500'}`}>
            <div>
              <h3 className={`font-black text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeUser.fullName}</h3>
              <span className="inline-block mt-1 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-1.5 py-0.5 rounded uppercase font-sans">
                🟢 Verified Doctor
              </span>
            </div>
            <div className="text-[11px] space-y-0.5 font-sans pt-1 leading-normal">
              <p>Department: <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{activeUser.specialty || 'Internal Medicine'}</span></p>
              <p>Hospital: <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{activeUser.institution || 'Cairo Medical Center'}</span></p>
            </div>
          </div>
        ) : (
          <div className={`px-6 py-4 border-b text-xs ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase font-bold">MedLink Portal</span>
            <p className={`font-bold mt-1 truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeUser.fullName}</p>
            <div className="flex items-center justify-between mt-1.5 text-[9px]">
              <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 font-bold uppercase rounded text-[9px]">{activeUser.role}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNavigationItems = () => {
    if (activeUser.role === UserRole.ADMIN) {
      const adminRole = activeUser.adminRole || 'SUPER';
      return (
        <div className="space-y-1.5 font-semibold">
          <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500 px-3 py-1">System Audit Console</p>
          
          <button onClick={() => onSectionChange('dashboard')} className={getNavItemClass('dashboard')}>
            <Sliders className="h-4 w-4 shrink-0 text-sky-400" />
            <span>Dashboard</span>
          </button>

          <button onClick={() => onSectionChange('users')} className={getNavItemClass('users')}>
            <Users className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>User Accounts</span>
          </button>

          {adminRole === 'SUPER' && (
            <button onClick={() => onSectionChange('admin_management')} className={getNavItemClass('admin_management')}>
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Admin Management</span>
            </button>
          )}

          <button onClick={() => onSectionChange('doctors')} className={getNavItemClass('doctors')}>
            <FileText className="h-4 w-4 shrink-0 text-blue-400" />
            <span>Verified Doctors</span>
          </button>

          <button onClick={() => onSectionChange('institutions')} className={getNavItemClass('institutions')}>
            <Building className="h-4 w-4 shrink-0 text-rose-400 font-bold" />
            <span>Medical Institutions</span>
          </button>

          <button onClick={() => onSectionChange('organization_requests')} className={getNavItemClass('organization_requests')}>
            <ClipboardList className="h-4 w-4 shrink-0 text-violet-400" />
            <span>Organization Requests</span>
          </button>

          <button onClick={() => onSectionChange('specialties')} className={getNavItemClass('specialties')}>
            <Briefcase className="h-4 w-4 shrink-0 text-pink-400" />
            <span>Department Specialties</span>
          </button>

          <button onClick={() => onSectionChange('qr')} className={getNavItemClass('qr')}>
            <QrCode className="h-4 w-4 shrink-0 text-orange-400" />
            <span>Medical QR Keys</span>
          </button>

          <button onClick={() => onSectionChange('audit')} className={getNavItemClass('audit')}>
            <FileText className="h-4 w-4 shrink-0 text-yellow-400" />
            <span>Security Audit Logs</span>
          </button>

          <button onClick={() => onSectionChange('reports')} className={getNavItemClass('reports')}>
            <Activity className="h-4 w-4 shrink-0 text-sky-400" />
            <span>Audit Reports</span>
          </button>

          <button onClick={() => onSectionChange('settings')} className={getNavItemClass('settings')}>
            <Settings className="h-4 w-4 shrink-0 text-slate-400" />
            <span>System Settings</span>
          </button>

          <button onClick={() => onSectionChange('profile')} className={getNavItemClass('profile')}>
            <UserIcon className="h-4 w-4 shrink-0 text-purple-400" />
            <span>Superadmin Profile</span>
          </button>
        </div>
      );
    }



    if (activeUser.role === UserRole.PATIENT) {
      return (
        <div className="space-y-1 text-xs font-semibold">
          <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 px-3 py-1">Patient Portal</p>
          
          <button onClick={() => onSectionChange('dashboard')} className={getNavItemClass('dashboard')}>
            <Activity className="h-4 w-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button onClick={() => onSectionChange('profile')} className={getNavItemClass('profile')}>
            <UserIcon className="h-4 w-4 shrink-0" />
            <span>My Profile</span>
          </button>

          <button onClick={() => onSectionChange('records')} className={getNavItemClass('records')}>
            <ClipboardList className="h-4 w-4 shrink-0" />
            <span>Medical Records</span>
          </button>

          <button onClick={() => onSectionChange('prescriptions')} className={getNavItemClass('prescriptions')}>
            <Pill className="h-4 w-4 shrink-0" />
            <span>Prescriptions</span>
          </button>

          <button onClick={() => onSectionChange('labs')} className={getNavItemClass('labs')}>
            <FlaskConical className="h-4 w-4 shrink-0" />
            <span>Lab Results</span>
          </button>

          <button onClick={() => onSectionChange('radiology')} className={getNavItemClass('radiology')}>
            <ImageIcon className="h-4 w-4 shrink-0" />
            <span>Radiology Reports</span>
          </button>

          <button onClick={() => onSectionChange('emergency')} className={getNavItemClass('emergency')}>
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>Emergency Information</span>
          </button>

          <button onClick={() => onSectionChange('qr_identity')} className={getNavItemClass('qr_identity')}>
            <QrCode className="h-4 w-4 shrink-0" />
            <span>My Medical QR Card</span>
          </button>

          <button onClick={() => onSectionChange('settings')} className={getNavItemClass('settings')}>
            <Settings className="h-4 w-4 shrink-0" />
            <span>Settings</span>
          </button>

          <button onClick={() => onSectionChange('help')} className={getNavItemClass('help')}>
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Help & Support</span>
          </button>
        </div>
      );
    }

    if (activeUser.role === UserRole.DOCTOR) {
      const spec = activeUser.specialty || 'Internal Medicine';
      return (
        <div className="space-y-1 text-xs font-semibold text-left">
          <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 px-3 py-1">
            {spec} Portal
          </p>

          <button onClick={() => onSectionChange('dashboard')} className={getNavItemClass('dashboard')}>
            <Activity className="h-4 w-4 shrink-0 font-bold" />
            <span>Dashboard</span>
          </button>

          <button onClick={() => onSectionChange('profile')} className={getNavItemClass('profile')}>
            <UserIcon className="h-4 w-4 shrink-0 font-bold" />
            <span>My Profile</span>
          </button>

          <div className="pt-2">
            <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 px-3 py-1">Clinical Work</p>
            <button onClick={() => onSectionChange('search')} className={getNavItemClass('search')}>
              <Search className="h-4 w-4 shrink-0 text-blue-500" />
              <span>Search Patient</span>
            </button>
            <button onClick={() => onSectionChange('records')} className={getNavItemClass('records')}>
              <ClipboardList className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>Medical Records</span>
            </button>
            <button onClick={() => onSectionChange('visits')} className={getNavItemClass('visits')}>
              <ClipboardCheck className="h-4 w-4 shrink-0 text-indigo-500" />
              <span>Visits</span>
            </button>
            <button onClick={() => onSectionChange('prescriptions')} className={getNavItemClass('prescriptions')}>
              <Pill className="h-4 w-4 shrink-0 text-pink-500" />
              <span>Prescriptions</span>
            </button>
          </div>

          <div className="pt-2">
            <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 px-3 py-1">Diagnostics</p>
            <button onClick={() => onSectionChange('labs')} className={getNavItemClass('labs')}>
              <FlaskConical className="h-4 w-4 shrink-0 text-amber-500" />
              <span>Lab Results</span>
            </button>
            <button onClick={() => onSectionChange('radiology')} className={getNavItemClass('radiology')}>
              <ImageIcon className="h-4 w-4 shrink-0 text-purple-500" />
              <span>Radiology Reports</span>
            </button>
          </div>

          <div className="pt-2">
            <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 px-3 py-1">System</p>
            <button onClick={() => onSectionChange('qr_scan')} className={getNavItemClass('qr_scan')}>
              <QrCode className="h-4 w-4 shrink-0 text-sky-500" />
              <span>Patient QR Scan</span>
            </button>
            <button onClick={() => onSectionChange('settings')} className={getNavItemClass('settings')}>
              <Settings className="h-4 w-4 shrink-0 font-bold" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`flex-1 flex flex-col h-full min-h-0 ${isDark ? 'bg-slate-900 text-slate-350' : 'bg-white text-slate-500'}`}>
      {renderHeader()}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 min-h-0">
        {renderNavigationItems()}
      </div>

      <div className={`p-4 mt-auto border-t shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="bg-slate-900 rounded-xl p-4 text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-400 flex-shrink-0 flex items-center justify-center font-bold text-slate-900 overflow-hidden">
            {activeUser.photoUrl ? (
              <img src={activeUser.photoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              (activeUser.fullName || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">{activeUser.fullName}</p>
            <p className="text-xs text-slate-400 truncate uppercase mt-0.5 tracking-wider font-semibold font-mono">{activeUser.role}</p>
          </div>
        </div>
      </div>

      <div className={`p-4 pt-0 shrink-0 ${isDark ? '' : 'border-slate-200'}`}>
        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className={`w-full py-2.5 px-3 rounded-lg border transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer font-bold uppercase ${
            isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border-slate-200'
          }`}
        >
          <LogOut className="h-4 w-4" /> 
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
