/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowLeft, 
  User, 
  Stethoscope, 
  Briefcase, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Building, 
  Award, 
  ShieldCheck, 
  UserCheck, 
  Timer, 
  FileCheck,
  Heart,
  UploadCloud,
  FileText,
  Sparkles,
  X
} from 'lucide-react';
import { User as UserType, UserRole, UserStatus, MedicalInstitution, OrganizationRequest } from '../types';

interface RegisterProps {
  onRegisterSubmit: (newUser: UserType) => void;
  onNavigate: (page: 'landing' | 'login' | 'register' | 'forgot-password' | 'dashboard') => void;
  institutions: MedicalInstitution[];
  onAddOrganizationRequest: (newReq: OrganizationRequest) => void;
}

export default function Register({ 
  onRegisterSubmit, 
  onNavigate,
  institutions,
  onAddOrganizationRequest
}: RegisterProps) {
  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PATIENT);

  // Dynamic pending custom requests added during this session
  const [requestedInstitutions, setRequestedInstitutions] = useState<{ id: string; name: string; type: 'Hospital' | 'Clinic' | 'Medical Center' | 'Specialized Center'; specialties: string[]; status: string }[]>([]);

  // Filter out active options
  const activeInstitutions = institutions.filter(i => i.status === 'Active');

  // Doctor Specific Professional Fields
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(activeInstitutions[0]?.id || '');
  const [specialty, setSpecialty] = useState('');
  const [position, setPosition] = useState('Consultant'); // Consultant, Specialist, Resident, General Practitioner
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('1–3 Years');
  const [verificationFile, setVerificationFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Dynamically update specialty list when selected institution changes
  useEffect(() => {
    const inst = [...institutions, ...requestedInstitutions].find(i => i.id === selectedInstitutionId);
    if (inst && inst.specialties.length > 0) {
      setSpecialty(inst.specialties[0]);
    } else {
      setSpecialty('');
    }
  }, [selectedInstitutionId, institutions, requestedInstitutions]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File is too large. Max size is 5MB.');
        return;
      }
      setVerificationFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
      setUploadError('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File is too large. Max size is 5MB.');
        return;
      }
      setVerificationFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
      setUploadError('');
    }
  };

  const removeFile = () => {
    setVerificationFile(null);
    setUploadError('');
  };

  // "Request New Organization" Form States
  const [showOrgRequestModal, setShowOrgRequestModal] = useState(false);
  const [orgRequestType, setOrgRequestType] = useState<'INSTITUTION'>('INSTITUTION');
  const [orgRequestName, setOrgRequestName] = useState('');
  const [orgRequestDetails, setOrgRequestDetails] = useState('');
  const [orgRequestFeedback, setOrgRequestFeedback] = useState('');

  // Password Visibility Toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ email: string; name: string; role: UserRole } | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Handle Automatic Redirection for registered patients
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (successInfo && successInfo.role === UserRole.PATIENT) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onNavigate('dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [successInfo, onNavigate]);

  // Handler for Request New Organization Submissions
  const handleOrgRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgRequestName.trim()) {
      setOrgRequestFeedback('Please specify the organization name.');
      return;
    }

    // Check for duplicates
    if (orgRequestType === 'INSTITUTION') {
      const exists = [...institutions, ...requestedInstitutions].some(i => i.name.toLowerCase().trim() === orgRequestName.toLowerCase().trim());
      if (exists) {
        setOrgRequestFeedback('This institution already exists on our platform.');
        return;
      }

      const newInstId = 'reqinst-' + Math.floor(1000 + Math.random() * 9000);
      const newInstObj = {
        id: newInstId,
        name: orgRequestName.trim(),
        type: 'Hospital' as const,
        specialties: ['General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Dermatology'],
        status: 'Active'
      };
      setRequestedInstitutions(prev => [...prev, newInstObj]);
      setSelectedInstitutionId(newInstId);
    }

    const newRequest: OrganizationRequest = {
      id: 'req-' + Math.floor(1000 + Math.random() * 9000),
      type: orgRequestType,
      name: orgRequestName.trim(),
      details: orgRequestDetails.trim() || 'No special details specified.',
      requesterName: fullName || 'Pending User',
      requesterEmail: email || 'pending@medlink.com',
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0]
    };

    onAddOrganizationRequest(newRequest);
    setOrgRequestFeedback('success');
    setOrgRequestName('');
    setOrgRequestDetails('');
    setTimeout(() => {
      setShowOrgRequestModal(false);
      setOrgRequestFeedback('');
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!fullName || !email || !phone || !nationalId || !password || !confirmPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Invalid email address');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must contain at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    // Role Specific Variables
    let doctorMappedInstitution = '';
    let doctorMappedInstitutionType = '';

    // Role Specific Validations
    if (selectedRole === UserRole.DOCTOR) {
      const activeInst = [...institutions, ...requestedInstitutions].find(i => i.id === selectedInstitutionId);
      if (!activeInst) {
        setErrorMsg('Please select an approved medical institution.');
        return;
      }
      doctorMappedInstitution = activeInst.name;
      doctorMappedInstitutionType = activeInst.type;

      if (!specialty) {
        setErrorMsg('Please select a valid specialty available at your selected institution.');
        return;
      }

      if (!licenseNumber) {
        setErrorMsg('Please enter your Medical License Number.');
        return;
      }

      if (!verificationFile) {
        setErrorMsg('Please upload a professional verification document.');
        return;
      }
    }

    // Determine Status
    const instant = selectedRole === UserRole.PATIENT;
    const initialStatus = instant ? UserStatus.ACTIVE : UserStatus.PENDING;

    // Create unique IDs
    const uId = 'u-' + Math.random().toString(36).substr(2, 9);
    const mId = instant ? 'MID-' + Math.floor(100000 + Math.random() * 900000) : undefined;

    const registeredUser: UserType = {
      id: uId,
      email: email.trim(),
      role: selectedRole,
      status: initialStatus,
      fullName: fullName.trim(),
      phoneNumber: phone.trim(),
      nationalId: nationalId.trim(),
      gender,
      dateOfBirth,
      medicalId: mId,
      departmentId: selectedRole === UserRole.DOCTOR ? 'dept-01' : undefined,
      joinedDate: new Date().toISOString().split('T')[0],
      
      // Extended professional details
      institution: selectedRole === UserRole.DOCTOR ? doctorMappedInstitution : undefined,
      institutionId: selectedRole === UserRole.DOCTOR ? selectedInstitutionId : undefined,
      institutionType: selectedRole === UserRole.DOCTOR ? doctorMappedInstitutionType : undefined,
      specialty: selectedRole === UserRole.DOCTOR ? specialty : undefined,
      licenseNumber: selectedRole === UserRole.DOCTOR ? licenseNumber : undefined,
      experience: selectedRole === UserRole.DOCTOR ? experience : undefined,
      position: selectedRole === UserRole.DOCTOR ? position : undefined,
    };

    onRegisterSubmit({ ...registeredUser, password: password });
    
    setSuccessInfo({
      email: registeredUser.email,
      name: registeredUser.fullName,
      role: selectedRole
    });
  };

  return (
    <div id="register-split-workspace" className="min-h-screen bg-slate-50 grid grid-cols-1 lg:grid-cols-12 font-sans overflow-x-hidden">
      
      {/* LEFT SIDE: WELCOME PANEL / HEALTHCARE VISUALS */}
      <div className="lg:col-span-5 bg-gradient-to-br from-sky-500 to-sky-600 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle decorative background bubble pattern */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        {/* Top Logo and Identity */}
        <div className="flex items-center gap-2.5 relative z-10 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="bg-white/20 backdrop-blur-xs p-2 rounded-xl">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="font-sans font-bold text-lg tracking-tight">
            MedLink <span className="font-normal opacity-90">Identity</span>
          </span>
        </div>

        {/* Welcome Text Section */}
        <div className="my-12 lg:my-0 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold leading-tight">
            Welcome to MedLink Healthcare
          </h2>
          <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed max-w-md">
            Create your healthcare account to securely access medical services, records, and healthcare support.
          </p>

          {/* Benefits Bullet Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            
            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-xs">
              <div className="p-1 bg-white/15 rounded-md text-white mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Secure Medical Access</h4>
                <p className="text-[10px] text-sky-100">Patient-controlled EMR records.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-xs">
              <div className="p-1 bg-white/15 rounded-md text-white mt-0.5">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white font-sans">Organized Records</h4>
                <p className="text-[10px] text-sky-100">diagnoses and prescriptions unified.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-xs">
              <div className="p-1 bg-white/15 rounded-md text-white mt-0.5">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">QR Medical Identity</h4>
                <p className="text-[10px] text-sky-100">Check-in at outpatient clinics.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-xs">
              <div className="p-1 bg-white/15 rounded-md text-white mt-0.5">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white font-sans">Faster Experience</h4>
                <p className="text-[10px] text-sky-100">Zero duplicate intake paperwork.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Support Statement */}
        <div className="text-[11px] text-sky-100/70 border-t border-sky-400/30 pt-4 relative z-10">
          Authorized and trusted by regional medical networks, hospitals, and primary physicians.
        </div>

      </div>

      {/* RIGHT SIDE: REGISTRATION FORM */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-xl bg-white shadow-xs rounded-2xl border border-slate-200/80 p-6 sm:p-10 space-y-6">
          
          {successInfo ? (
            /* ================================================= */
            /* SUCCESS STATES PER ROLE                          */
            /* ================================================= */
            <div className="space-y-6 text-center py-6 animate-in fade-in duration-300">
              
              {successInfo.role === UserRole.PATIENT ? (
                <>
                  <div className="mx-auto h-16 w-16 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center border border-sky-100">
                    <UserCheck className="h-10 w-10 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="bg-sky-50 text-sky-600 px-3 py-1 text-[10px] uppercase font-mono font-bold tracking-wider rounded-full border border-sky-100">
                      Immediate Setup Authorized
                    </span>
                    <h3 className="text-2xl font-sans font-extrabold text-slate-900 mt-2">Registration Successful</h3>
                    <p className="text-slate-500 text-xs">
                      Welcome to MedLink Healthcare.
                    </p>
                  </div>

                  <div className="p-5 bg-sky-50/55 text-sky-700 rounded-xl text-xs border border-sky-100/60 text-center space-y-2 max-w-md mx-auto">
                    <p className="font-bold text-sm">You can now access your medical profile.</p>
                    <p className="text-slate-500">No organizational approval is needed for patient portfolios.</p>
                    <div className="flex items-center justify-center gap-1.5 font-mono text-sky-600 font-bold mt-2">
                      <Timer className="h-4 w-4 animate-spin" />
                      Redirecting to your patient dashboard in {countdown}s...
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('dashboard')}
                      className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      Access Dashboard Now &rarr;
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center border border-amber-100">
                    <Stethoscope className="h-10 w-10" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="bg-amber-50 text-amber-600 px-3 py-1 text-[10px] uppercase font-mono font-bold tracking-wider rounded-full border border-amber-100 animate-pulse">
                      Pending Administrator Review
                    </span>
                    <h3 className="text-2xl font-sans font-extrabold text-slate-900 mt-2">Registration Submitted</h3>
                    <p className="text-slate-505 text-xs">
                      Your doctor profile has been successfully submitted for review.
                    </p>
                  </div>

                  <div className="p-5 bg-amber-50/20 text-slate-700 rounded-xl text-left text-xs border border-amber-100 space-y-2.5 max-w-md mx-auto">
                    <p className="font-bold text-amber-850">Verification Status: <span className="font-mono text-amber-650 uppercase">Pending Approval</span></p>
                    <p className="text-slate-500 leading-relaxed">
                      Our administration team will verify your professional information and healthcare institution before activation.
                    </p>
                    <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-200/60 font-medium">
                      Institution: <span className="text-slate-800 font-bold">{institutions.find(i => i.id === selectedInstitutionId)?.name || 'Specified Institution'}</span><br />
                      License Code: <span className="text-slate-800 font-mono font-bold">{licenseNumber}</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('login')}
                      className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                </>
              )}

            </div>
          ) : (
            /* ================================================= */
            /* REGISTRATION FORM                                 */
            /* ================================================= */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* PAGE HEADER */}
              <div className="space-y-1">
                <h2 className="text-2xl font-sans font-extrabold text-slate-900">
                  Create Your Account
                </h2>
                <p className="text-slate-505 text-xs leading-relaxed">
                  Join MedLink Healthcare and securely access your healthcare services.
                </p>
              </div>

              {/* ROLE SELECTION SECTION */}
              <div className="space-y-2.5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Choose Your Role</h4>
                  <p className="text-[11px] text-slate-400">Select the account type that best describes you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Patient Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole(UserRole.PATIENT)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between h-32 transition-all cursor-pointer relative ${
                      selectedRole === UserRole.PATIENT
                        ? 'border-sky-500 bg-sky-50/50 text-sky-600 shadow-3xs ring-1 ring-sky-500'
                        : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className={`p-1.5 rounded-lg ${selectedRole === UserRole.PATIENT ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-100">
                        Immediate Access
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Patient</span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Access your medical profile instantly.</span>
                    </div>
                  </button>

                  {/* Doctor Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole(UserRole.DOCTOR)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between h-32 transition-all cursor-pointer relative ${
                      selectedRole === UserRole.DOCTOR
                        ? 'border-sky-500 bg-sky-50/50 text-sky-600 shadow-3xs ring-1 ring-sky-500'
                        : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className={`p-1.5 rounded-lg ${selectedRole === UserRole.DOCTOR ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Stethoscope className="h-4 w-4" />
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full border border-amber-100">
                        Approval Required
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Doctor</span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Manage patient care and EMR sheets.</span>
                    </div>
                  </button>

                </div>

                {/* Info tags for Doctor role */}
                {selectedRole === UserRole.DOCTOR && (
                  <p className="text-[10px] text-amber-600 font-medium">
                    📌 Doctor accounts are reviewed before activation.
                  </p>
                )}
              </div>

              {/* COMMON FORM FIELDS SEGMENT */}
              <div className="space-y-4">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Personal Information
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-fullname" className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      id="reg-fullname"
                      name="fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-phone" className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-nationalid" className="block text-xs font-bold text-slate-700 mb-1">National ID</label>
                    <input
                      id="reg-nationalid"
                      name="national_id"
                      type="text"
                      required
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="Enter your national ID"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-gender" className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      id="reg-gender"
                      name="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 rounded-lg text-xs text-slate-900 cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="reg-dob" className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      id="reg-dob"
                      name="date_of_birth"
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
              {selectedRole === UserRole.DOCTOR && (
                <div className="p-4 sm:p-5 bg-amber-50/20 rounded-xl border border-amber-200/60 space-y-4 animate-in slide-in-from-top-1">
                  
                  <div className="border-b border-amber-200/40 pb-2">
                    <span className="text-amber-800 font-extrabold text-sm uppercase tracking-tight flex items-center gap-1.5 font-sans">
                      <Building className="h-4 w-4 text-amber-600" /> Professional Information
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Please provide your professional healthcare details.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Workplace / Healthcare Institution <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOrgRequestType('INSTITUTION');
                          setShowOrgRequestModal(true);
                        }}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-850 underline transition-colors cursor-pointer"
                      >
                        Request New Institution
                      </button>
                    </div>
                    
                    <select
                      value={selectedInstitutionId}
                      onChange={(e) => setSelectedInstitutionId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-250 focus:outline-none focus:border-amber-500 rounded-lg text-xs text-slate-900 shadow-3xs"
                    >
                      <option value="">-- Choose Institution --</option>
                      {activeInstitutions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.type})
                        </option>
                      ))}
                      {requestedInstitutions.map((item) => (
                        <option key={item.id} value={item.id} className="text-amber-600 font-medium">
                          {item.name} (Pending Custom Request)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Medical Specialty <span className="text-red-500">*</span></label>
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-255 focus:outline-none focus:border-amber-500 rounded-lg text-xs text-slate-900 cursor-pointer"
                        disabled={!selectedInstitutionId}
                      >
                        {!selectedInstitutionId ? (
                          <option value="">Select an institution first</option>
                        ) : (
                          [...institutions, ...requestedInstitutions].find(i => i.id === selectedInstitutionId)?.specialties.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Professional Position <span className="text-red-500">*</span></label>
                      <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-255 focus:outline-none focus:border-amber-500 rounded-lg text-xs text-slate-900 cursor-pointer"
                      >
                        <option value="Consultant">Consultant</option>
                        <option value="Specialist">Specialist</option>
                        <option value="Resident">Resident</option>
                        <option value="General Practitioner">General Practitioner</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Medical License Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g. LIC-991204"
                        className="w-full px-3 py-2 bg-white border border-slate-250 focus:outline-none focus:border-amber-500 rounded-lg text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">Years of Experience</label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-255 focus:outline-none focus:border-amber-500 rounded-lg text-xs text-slate-900 cursor-pointer"
                      >
                        <option value="1–3 Years font-sans">1–3 Years</option>
                        <option value="4–7 Years font-sans">4–7 Years</option>
                        <option value="8–12 Years font-sans">8–12 Years</option>
                        <option value="12+ Years font-sans">12+ Years</option>
                      </select>
                    </div>
                  </div>



                </div>
              )}



              {/* SECURITY / PASSWORD SETTINGS */}
              <div className="space-y-4">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Security Parameters
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="relative">
                    <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 mb-1 font-sans">Password</label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        name="reg_password"
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                        className={`w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-xs text-slate-900 ${!showPassword ? 'secure-mask-input' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-slate-700 mb-1 font-sans">Confirm Password</label>
                    <div className="relative">
                      <input
                        id="reg-confirm-password"
                        name="reg_confirm_password"
                        type="text"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className={`w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-xs text-slate-900 ${!showConfirmPassword ? 'secure-mask-input' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Box */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold animate-pulse text-left">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="space-y-3 pt-3">
                <button
                  type="submit"
                  id="btn-register-submit"
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <FileCheck className="h-4 w-4" /> Create Account
                </button>

                <div className="text-center">
                  <span className="text-xs text-slate-400 font-sans">Already have an account? </span>
                  <button
                    type="button"
                    id="btn-register-back-alt"
                    onClick={() => onNavigate('login')}
                    className="text-xs text-sky-600 hover:text-sky-700 font-bold transition-all cursor-pointer underline hover:no-underline"
                  >
                    Login
                  </button>
                </div>

                <div className="text-center pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onNavigate('landing')}
                    className="text-[11px] text-slate-400 hover:text-sky-600 font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" /> Back to Login
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>
      </div>

      {/* Organization Request submission Modal Overlay */}
      {showOrgRequestModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-extrabold text-sm text-slate-800 uppercase tracking-tight flex items-center gap-1.5 font-sans">
                <Sparkles className="h-4 w-4 text-sky-500" /> Request New Organization
              </span>
              <button 
                type="button" 
                onClick={() => setShowOrgRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleOrgRequestSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-750 mb-1 font-sans">Organization Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={orgRequestName}
                  onChange={(e) => setOrgRequestName(e.target.value)}
                  placeholder="e.g. Cairo Specialty Clinic"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-lg text-xs text-slate-850 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-750 mb-1 font-sans">Location Details or Address</label>
                <textarea
                  value={orgRequestDetails}
                  onChange={(e) => setOrgRequestDetails(e.target.value)}
                  placeholder="e.g. 12 Zamalek Rd, Cairo. Clinic specializing in Dermatology."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-lg text-xs text-slate-850 resize-none focus:outline-none"
                />
              </div>

              {orgRequestFeedback && (
                <div className={`p-2.5 rounded-lg text-xs font-semibold text-center font-sans ${
                  orgRequestFeedback === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-red-50 text-red-600 border border-red-105'
                }`}>
                  {orgRequestFeedback === 'success' 
                    ? '✓ Request submitted! Admin will review shortly.' 
                    : orgRequestFeedback}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
