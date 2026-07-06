/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Heart, Shield, QrCode, ClipboardList, Pill, FlaskConical, Image as ImageIcon, 
  Printer, ArrowDownToLine, Phone, User, AlertTriangle, Activity, 
  ShieldCheck, Mail, Calendar, Settings, HelpCircle, LogOut,
  Building, FileText, ChevronRight, Eye, AlertCircle, 
  MapPin, Clock, Edit3, X, Menu, Info, ArrowRight, CheckCircle2
} from 'lucide-react';
import { User as UserType, EmergencyInfo, MedicalRecord, Prescription, LabResult, RadiologyReport } from '../types';
import { QRCodeSVG } from 'qrcode.react';

interface PatientDashboardProps {
  patientUser: UserType;
  emergencyInfo: EmergencyInfo;
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  labResults: LabResult[];
  radiologyReports: RadiologyReport[];
  onUpdatePatientProfile: (updatedProfile: UserType) => void;
  onUpdateEmergencyInfo: (updatedEmergency: EmergencyInfo) => void;
  onLogout?: () => void;
  activeSection?: 'dashboard' | 'profile' | 'records' | 'prescriptions' | 'labs' | 'radiology' | 'emergency' | 'qr_identity' | 'settings' | 'help';
  onSectionChange?: (section: 'dashboard' | 'profile' | 'records' | 'prescriptions' | 'labs' | 'radiology' | 'emergency' | 'qr_identity' | 'settings' | 'help') => void;
  onUpdateUserProfile?: (userId: string, updatedFields: Partial<UserType>) => void;
  cardRequests?: any[];
  onAddCardRequest?: (patientId: string, req: any) => Promise<void>;
}

export default function PatientDashboard({
  patientUser,
  emergencyInfo,
  medicalRecords,
  prescriptions,
  labResults,
  radiologyReports,
  onUpdatePatientProfile,
  onUpdateEmergencyInfo,
  onLogout,
  activeSection,
  onSectionChange,
  onUpdateUserProfile,
  cardRequests: propsCardRequests,
  onAddCardRequest,
}: PatientDashboardProps) {

  // Navigation tab switcher state delegated to parent container router if available
  const [internalTab, setInternalTab] = useState<
    'dashboard' | 'profile' | 'records' | 'prescriptions' | 'labs' | 'radiology' | 'emergency' | 'qr_card' | 'settings' | 'help'
  >('dashboard');

  const activeTab = useMemo(() => {
    if (activeSection) {
      if (activeSection === 'qr_identity') return 'qr_card';
      return activeSection;
    }
    return internalTab;
  }, [activeSection, internalTab]);

  const setActiveTab = (tab: any) => {
    if (onSectionChange) {
      if (tab === 'qr_card') {
        onSectionChange('qr_identity');
      } else {
        onSectionChange(tab);
      }
    } else {
      setInternalTab(tab);
    }
  };

  // Mobile sidebar open state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(patientUser.fullName);
  const [profilePhone, setProfilePhone] = useState(patientUser.phoneNumber);
  const [profileGender, setProfileGender] = useState(patientUser.gender || 'Male');
  const [profileDob, setProfileDob] = useState(patientUser.dateOfBirth || '1988-04-12');
  const [profileNationalId, setProfileNationalId] = useState(patientUser.nationalId || '28804120102941');
  const [profileEmail, setProfileEmail] = useState(patientUser.email || 'ahmed.salah@gmail.com');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(patientUser.photoUrl || '');

  useEffect(() => {
    setProfileName(patientUser.fullName);
    setProfilePhone(patientUser.phoneNumber);
    setProfileGender(patientUser.gender || 'Male');
    setProfileDob(patientUser.dateOfBirth || '1988-04-12');
    setProfileNationalId(patientUser.nationalId || '28804120102941');
    setProfileEmail(patientUser.email || 'ahmed.salah@gmail.com');
    setProfilePhotoUrl(patientUser.photoUrl || '');
  }, [patientUser.id]);

  // Emergency Edit states
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);
  const [emergencyBlood, setEmergencyBlood] = useState(emergencyInfo.bloodType || 'O+ Positive');
  const [emergencyAllergies, setEmergencyAllergies] = useState(emergencyInfo.allergies || 'Penicillin, Peanuts, Bee Venom');
  const [emergencyChronic, setEmergencyChronic] = useState(emergencyInfo.chronicDiseases || 'Mild Asthma, Hypertension');
  const [emergencyContact, setEmergencyContact] = useState(emergencyInfo.emergencyContactName || 'Fatma Salah (Sister)');
  const [emergencyPhone, setEmergencyPhone] = useState(emergencyInfo.emergencyContactPhone || '+20 (102) 449-1122');
  const [emergencySuccessMsg, setEmergencySuccessMsg] = useState('');

  // Physical Card Request States
  const [cardAddress, setCardAddress] = useState('');
  const [cardNotes, setCardNotes] = useState('');
  const [cardSuccess, setCardSuccess] = useState(false);
  const [cardRequests, setCardRequests] = useState<{ id?: string; date: string; address: string; notes: string; status: string }[]>(() => {
    if (propsCardRequests && propsCardRequests.length > 0) return propsCardRequests;
    return [
      {
        id: 'card-init-01',
        date: 'June 14, 2026',
        address: '12 Health Science Boulevard, Medical District, Cairo',
        notes: 'Frequent hospital follow-ups',
        status: 'Pending Review'
      }
    ];
  });

  // Full Screen QR Code Modal toggle
  const [isQrFullscreen, setIsQrFullscreen] = useState(false);

  // Synchronize internal state with parent-propagated Props (strictly Firestore-only)
  useEffect(() => {
    if (propsCardRequests) {
      setCardRequests(propsCardRequests);
    }
  }, [propsCardRequests]);

  // Generate permanent read-only Medical ID if not present
  const medicalId = useMemo(() => {
    if (patientUser.medicalId) return patientUser.medicalId;
    // Fallback deterministic medical ID based on user name & ID
    const prime = Math.abs((patientUser?.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    const randomSuffix = ((prime * 9301 + 49297) % 233280) % 900000 + 100000;
    return `MID-${randomSuffix}`;
  }, [patientUser]);

  // Active items calculations mapped from general medical states
  const activeRxList = useMemo(() => {
    return prescriptions.filter(p => p.patientId === patientUser.id && p.status === 'ACTIVE');
  }, [prescriptions, patientUser]);

  const recentVisitsList = useMemo(() => {
    return medicalRecords.filter(m => m.patientId === patientUser.id);
  }, [medicalRecords, patientUser]);

  const patientLabList = useMemo(() => {
    return labResults.filter(l => l.patientId === patientUser.id);
  }, [labResults, patientUser]);

  const patientRadList = useMemo(() => {
    return radiologyReports.filter(r => r.patientId === patientUser.id);
  }, [radiologyReports, patientUser]);

  // Custom profile update trigger
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePatientProfile({
      ...patientUser,
      fullName: profileName,
      phoneNumber: profilePhone,
      gender: profileGender,
      dateOfBirth: profileDob,
      nationalId: profileNationalId,
      email: profileEmail,
      photoUrl: profilePhotoUrl
    });
    setProfileSuccessMsg('Health profile details updated successfully.');
    setIsEditingProfile(false);
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  // Custom emergency info update trigger
  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmergencyInfo({
      bloodType: emergencyBlood,
      allergies: emergencyAllergies,
      chronicDiseases: emergencyChronic,
      criticalMedications: emergencyInfo.criticalMedications || 'NoneSpecified',
      emergencyContactName: emergencyContact,
      emergencyContactPhone: emergencyPhone
    });
    setEmergencySuccessMsg('Emergency contacts card details optimized.');
    setIsEditingEmergency(false);
    setTimeout(() => setEmergencySuccessMsg(''), 4000);
  };

  // Submission handler for physical identity card request
  const handleCardRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest = {
      id: 'card-' + Math.floor(100 + Math.random() * 900),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      address: cardAddress,
      notes: cardNotes || 'Direct pickup requested',
      status: 'Pending Review'
    };
    try {
      if (onAddCardRequest) {
        await onAddCardRequest(patientUser.id, newRequest);
      } else {
        setCardRequests(prev => [newRequest, ...prev]);
      }
      setCardAddress('');
      setCardNotes('');
      setCardSuccess(true);
      setTimeout(() => setCardSuccess(false), 5000);
    } catch (err: any) {
      alert("Failed to submit card request to database: " + (err?.message || err));
    }
  };

  // Simple clean trigger mock downloads to respect iframe boundaries
  const triggerDownloadQR = () => {
    const svgElement = document.getElementById('actual-patient-qr-code');
    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const SVGurl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = SVGurl;
      downloadLink.download = `MedLink_Medical_QR_${medicalId}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      alert(`Exporting high-quality medical security pass for ${patientUser.fullName}. file: MedLink_QR_${medicalId}.png`);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ClipboardList },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'labs', label: 'Lab Results', icon: FlaskConical },
    { id: 'radiology', label: 'Radiology Reports', icon: ImageIcon },
    { id: 'emergency', label: 'Emergency Information', icon: AlertTriangle },
    { id: 'qr_card', label: 'My Medical QR Card', icon: QrCode },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  return (
    <div id="patient-platform-container" className="w-full space-y-6 text-slate-700 font-sans tracking-normal select-none animate-in fade-in duration-200">
      
      {/* TOP WELCOME HEADER SECTION (Only visible on home 'dashboard' tab to keep other pages focused and spacious) */}
      {activeTab === 'dashboard' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-400 to-sky-650 shadow-sm border border-sky-205/30 flex-shrink-0 flex items-center justify-center font-bold text-lg text-white">
              {(patientUser.fullName || '').split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Welcome back, {(patientUser.fullName || '').split(' ')[0] || 'Patient'} 👋</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Verified Patient
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">Here is an overview of your healthcare information and recent activity.</p>
            </div>
          </div>

          {/* Patient Header Indicators - Clean & healthcare-focused, no complex systems jargon */}
          <div className="text-left md:text-right border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 w-full md:w-auto flex flex-row md:flex-col justify-between items-center sm:items-start md:items-end gap-2 text-xs font-sans text-slate-400">
            <div>
              <span className="text-[9px] uppercase font-mono text-slate-400 tracking-wide block font-bold leading-none">Medical ID</span>
              <p className="font-mono text-slate-800 font-bold tracking-tight text-[11px] mt-1 pr-1">{medicalId}</p>
            </div>
            <div className="hidden sm:block">
              <span className="text-[9px] uppercase font-mono text-slate-400 tracking-wide block font-bold leading-none">Last Login</span>
              <p className="text-slate-800 font-mono font-medium text-[11px] mt-1 pl-1">Today, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE SCREEN CONTENT ACCORDING TO ROUTING */}
          
          {/* TABS 1: MAIN DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Health Overview Metric Cards */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-50" /> Health Overview
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1: Appointments */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/85 hover:border-sky-200 transition-all flex items-center gap-4 shadow-3xs">
                    <div className="bg-sky-50 p-3 rounded-xl text-sky-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 leading-none">Upcoming Visits</p>
                      <p className="text-slate-800 font-extrabold text-sm mt-1.5">0 Upcoming Visits</p>
                      <p className="text-[10px] text-slate-400 mt-1">No pending checkups</p>
                    </div>
                  </div>

                  {/* Card 2: Active Prescriptions */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/85 hover:border-sky-200 transition-all flex items-center gap-4 shadow-3xs">
                    <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 leading-none">Active Prescriptions</p>
                      <p className="text-slate-800 font-extrabold text-sm mt-1.5">
                        {activeRxList.length} Active Medication{activeRxList.length === 1 ? '' : 's'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {activeRxList.length > 0 ? 'Daily treatment plan available' : 'No treatment plan logged'}
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Recent Consults */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/85 hover:border-sky-200 transition-all flex items-center gap-4 shadow-3xs">
                    <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 leading-none">Recent Consultations</p>
                      <p className="text-slate-800 font-extrabold text-sm mt-1.5">
                        {recentVisitsList.length} Recent Consultation{recentVisitsList.length === 1 ? '' : 's'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {recentVisitsList.length > 0 ? 'Latest reports available' : 'No consult files recorded'}
                      </p>
                    </div>
                  </div>


                </div>
              </div>

              {/* Central Grid: Main Left (Medical history, emergency box) + Main Right (QR overview) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LHS Content */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Recent Medical Records section */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-250/70 shadow-3xs space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2">
                        <FileText className="h-4.5 w-4.5 text-sky-500" /> Recent Medical Records
                      </h3>
                      <button 
                        onClick={() => setActiveTab('records')}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        View Full Medical History <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {recentVisitsList.length > 0 ? (
                        recentVisitsList.slice(0, 2).map((record) => (
                          <div key={record.id} className="p-4 bg-slate-50/55 rounded-xl border border-slate-100 space-y-3 hover:bg-slate-50/90 transition-colors">
                            <div className="flex justify-between items-start text-xs border-b border-slate-100/50 pb-2">
                              <div>
                                <p className="font-extrabold text-slate-800 text-[13px]">{record.doctorName}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{record.notes || 'Hospital Clinic Block'}</p>
                              </div>
                              <span className="font-mono font-medium text-slate-500 bg-white/80 border px-2 py-0.5 rounded-md text-[10px]">{record.date}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-mono text-slate-400 block">Complaint</span>
                                <p className="text-slate-700 italic mt-0.5">{record.chiefComplaint || 'Consultation visit review.'}</p>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-mono text-slate-400 block">Diagnosis</span>
                                <p className="text-sky-700 font-bold mt-0.5">{record.diagnosis}</p>
                              </div>
                              <div className="sm:col-span-2 pt-1">
                                <span className="text-[10px] uppercase font-mono text-slate-400 block">Treatment Summary</span>
                                <p className="text-slate-700 text-[11px] leading-relaxed mt-0.5">{record.treatmentPlan}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        /* Realistic pre-compiled Cardiology medical consultation template */
                        <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/50 space-y-3">
                          <div className="flex justify-between items-start text-xs pb-1 border-b border-slate-100">
                            <div>
                              <span className="font-bold text-slate-800 text-[13px]">Cardiology Department</span>
                              <p className="text-[10px] text-slate-400 mt-0.5">Primary Care Clinic - Room 304</p>
                            </div>
                            <span className="font-mono font-semibold text-slate-500 bg-white border px-2 py-0.5 rounded text-[10px]">May 18, 2026</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Treating Doctor</span>
                              <p className="text-slate-700 font-medium mt-0.5">Dr. Anas Mohamed</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Diagnosis</span>
                              <p className="text-slate-800 font-extrabold mt-0.5 text-sky-850">Stage-1 Hypertension</p>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Treatment Plan Brief</span>
                              <p className="text-slate-600 mt-0.5">Blood pressure monitoring, daily physical conditioning, and prescribed pharmaceutical support.</p>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Prescription Issued</span>
                              <p className="text-emerald-705 font-bold mt-0.5 flex items-center gap-1">
                                <Pill className="h-3 w-3 inline" /> Lisinopril 10mg <span className="text-[10px] font-normal text-slate-400">(Take 1 tablet daily in the morning)</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* EMERGENCY MEDICAL INFORMATION */}
                  <div className="bg-rose-50/10 p-5 sm:p-6 rounded-2xl border border-rose-200/60 space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-rose-100/60">
                      <div>
                        <h3 className="font-sans font-bold text-red-700 text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4.5 w-4.5 text-red-500" /> Emergency Medical Information
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-sans leading-none">This information may be used during emergency medical situations.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('emergency')}
                        className="text-xs font-bold text-red-700 hover:text-red-900 bg-white border border-rose-150 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-rose-50"
                      >
                        Update Emergency Information
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Blood Type Group */}
                      <div className="bg-white p-3.5 rounded-xl border border-rose-100/50">
                        <span className="text-[10px] font-bold text-rose-800 uppercase block tracking-wider leading-none">Blood Type</span>
                        <p className="text-sm font-extrabold text-slate-900 mt-2 block">{emergencyBlood || 'O+ Positive'}</p>
                      </div>

                      {/* Allergies Group */}
                      <div className="bg-white p-3.5 rounded-xl border border-rose-100/50">
                        <span className="text-[10px] font-bold text-rose-800 uppercase block tracking-wider leading-none">Allergies</span>
                        <p className="text-xs font-bold text-slate-900 mt-2 block leading-snug truncate" title={emergencyAllergies}>
                          {emergencyAllergies || 'Penicillin, Peanuts, Bee Venom'}
                        </p>
                      </div>

                      {/* Chronic Diagnoses Group */}
                      <div className="bg-white p-3.5 rounded-xl border border-rose-100/50">
                        <span className="text-[10px] font-bold text-rose-800 uppercase block tracking-wider leading-none">Chronic Conditions</span>
                        <p className="text-xs font-bold text-slate-900 mt-2 block leading-snug truncate" title={emergencyChronic}>
                          {emergencyChronic || 'Mild Asthma, Hypertension'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 px-4 rounded-xl border border-rose-100/50 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="h-3.5 w-3.5 text-rose-400" />
                        <span>Emergency Contact: <strong className="text-slate-800">{emergencyContact || 'Fatma Salah (Sister)'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-rose-400" />
                        <span>Contact Number: <strong className="text-slate-800 font-mono">{emergencyPhone || '+20 (102) 449-1122'}</strong></span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* RHS Smart Card Container */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Smart QR Card Card Preview */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-3xs text-center space-y-4">
                    <div className="flex items-center justify-center bg-sky-50 text-sky-600 w-12 h-12 rounded-xl mx-auto shadow-4xs">
                      <QrCode className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">My Medical QR Code</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">Use this QR code for faster patient identification during healthcare visits.</p>
                    </div>

                    {/* Mini SVG QR Container */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block">
                      <QRCodeSVG 
                        id="actual-patient-qr-code-mini"
                        value={medicalId}
                        size={110}
                        level="Q"
                        includeMargin={true}
                        className="mx-auto"
                      />
                      <span className="text-[9px] font-mono tracking-wider font-extrabold text-slate-400 uppercase mt-2 block">
                        {medicalId}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed text-left bg-slate-50 p-3 rounded-lg border border-slate-150/40">
                      ℹ Healthcare providers scan this QR code to securely look up your medical records, accelerating registration waiting times.
                    </p>

                    <button
                      onClick={() => setActiveTab('qr_card')}
                      className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-bold rounded-xl transition-colors cursor-pointer uppercase border border-sky-200/30 font-sans"
                    >
                      Access Digital QR Card
                    </button>
                  </div>

                  {/* Healthcare Rights Explanation */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase cursor-pointer tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" /> Your Healthcare Access
                    </h4>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed font-sans">
                      You can view your medical information, prescriptions, reports, and emergency details securely.
                    </p>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed font-sans mt-1">
                      Patients have full authority to update emergency information, contact details, and basic profile indicators. Medical diagnoses, lab certifications, and clinical records can only be entered and signed by accredited healthcare professionals to preserve clinical validity.
                    </p>
                  </div>

                </div>

              </div>
              
            </div>
          )}

          {/* TAB 2: MY HEALTH PROFILE PAGE */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-3xs space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-sans font-extrabold text-slate-900">My Health Profile</h3>
                  <p className="text-slate-500 text-xs">Manage your personal demographics and contact details registered within MedLink.</p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200 hover:border-sky-200/40 text-xs font-bold duration-150 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" /> Edit Profile
                  </button>
                )}
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100/60 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {profileSuccessMsg}
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-5 text-xs text-left">
                  
                  {/* AVATAR PICTURE WORKFLOW CONTAINER */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Profile Image Management
                    </span>
                    
                    <div className="flex flex-col sm:flex-row gap-5 items-center">
                      <div className="relative group w-20 h-20 rounded-full bg-sky-200 font-extrabold text-slate-800 flex items-center justify-center text-xl shadow-inner border border-slate-300 overflow-hidden shrink-0">
                        {profilePhotoUrl ? (
                          <img src={profilePhotoUrl} alt="Temp Avatar" className="w-full h-full object-cover" />
                        ) : (
                          (patientUser.fullName || '').split(' ').map(n=>n[0] || '').join('').slice(0, 2).toUpperCase()
                        )}
                        {profilePhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setProfilePhotoUrl('')}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center duration-150 text-white font-bold text-[10px] cursor-pointer animate-in fade-in"
                            title="Delete profile picture"
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="flex-1 w-full space-y-3 text-left">
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                          Drag & drop card portrait, choose a local file, or capture a photo using a mobile camera layout. Removes custom presets and insecure inputs.
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {/* File browser */}
                          <label className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer shadow-3xs flex items-center gap-1.5 duration-100">
                            📁 Browse Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onload = (ev) => {
                                    if (ev.target?.result) setProfilePhotoUrl(ev.target.result as string);
                                  };
                                  r.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {/* Capture */}
                          <label className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-lg text-[11px] font-extrabold cursor-pointer shadow-3xs flex items-center gap-1.5 duration-100">
                            📸 Mobile Camera
                            <input
                              type="file"
                              accept="image/*"
                              capture="user"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onload = (ev) => {
                                    if (ev.target?.result) setProfilePhotoUrl(ev.target.result as string);
                                  };
                                  r.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {profilePhotoUrl && (
                            <button
                              type="button"
                              onClick={() => setProfilePhotoUrl('')}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer duration-100 animate-in fade-in"
                            >
                              ✕ Remove Photo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = (ev) => {
                            if (ev.target?.result) setProfilePhotoUrl(ev.target.result as string);
                          };
                          r.readAsDataURL(file);
                        }
                      }}
                      className="mt-3 border border-dashed border-slate-300 rounded-xl p-3 text-center bg-white hover:bg-slate-50/50 cursor-pointer text-slate-400 hover:text-slate-500 duration-100 font-bold text-[10px]"
                    >
                      Or Drag & Drop photo directly here to load preview
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pat-legal-name" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Full Legal Name</label>
                      <input
                        id="pat-legal-name"
                        name="pat_legal_name"
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-800 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="pat-email-addr" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Email Address</label>
                      <input
                        id="pat-email-addr"
                        name="pat_email_addr"
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="pat-phone-num" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Phone Number</label>
                      <input
                        id="pat-phone-num"
                        name="pat_phone_num"
                        type="tel"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-800 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="pat-gender" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Gender</label>
                      <select
                        id="pat-gender"
                        name="pat_gender"
                        value={profileGender}
                        onChange={(e) => setProfileGender(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-800 cursor-pointer outline-none transition-all"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="pat-dob" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Date of Birth</label>
                      <input
                        id="pat-dob"
                        name="pat_dob"
                        type="date"
                        required
                        value={profileDob}
                        onChange={(e) => setProfileDob(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-850 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                    <div>
                      <label htmlFor="pat-national-id" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">National Civil ID</label>
                      <input
                        id="pat-national-id"
                        name="pat_national_id"
                        type="text"
                        required
                        value={profileNationalId}
                        onChange={(e) => setProfileNationalId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-[11px] font-mono text-slate-800 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="pat-medical-id" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Medical ID (Permanent)</label>
                      <input
                        id="pat-medical-id"
                        name="pat_medical_id"
                        type="text"
                        disabled
                        value={medicalId}
                        className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold font-mono text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  
                  {/* Profile Cards layout details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/55 p-5 sm:p-6 rounded-2xl border border-slate-150">
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Full Identification Name</span>
                        <p className="text-slate-800 font-extrabold text-sm mt-1">{patientUser.fullName}</p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Universal Medical ID</span>
                        <p className="font-mono text-sky-600 font-bold text-xs mt-1 bg-white border border-sky-100 px-2.5 py-1 rounded-md inline-block">
                          {medicalId}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Email Address Link</span>
                        <p className="text-slate-700 font-medium text-xs mt-1">{patientUser.email || 'ahmed.salah@gmail.com'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Gender</span>
                          <p className="text-slate-700 font-medium text-xs mt-1">{patientUser.gender || 'Male'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Date of birth</span>
                          <p className="text-slate-700 font-medium text-xs mt-1 font-mono">{patientUser.dateOfBirth || '1988-04-12'}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Telephone Number</span>
                        <p className="text-slate-700 font-mono font-medium text-xs mt-1">{patientUser.phoneNumber}</p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">National Identity Code</span>
                        <p className="text-slate-700 font-mono text-xs mt-1">{patientUser.nationalId || '28804120102941'}</p>
                      </div>
                    </div>

                  </div>

                  <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed font-sans shadow-4xs">
                    <Info className="h-4.5 w-4.5 text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sky-800">Need to modify registration core data?</p>
                      <p className="text-[11px] mt-0.5">
                        Civil ID registry inputs, original gender records, and legal system hashes are anchored during your registration. Kindly reach out to patient clinic support desk for official database corrections.
                      </p>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEDICAL RECORDS INDEX */}
          {activeTab === 'records' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-3xs space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-sans font-extrabold text-slate-900">Your Clinical Medical Records</h3>
                <p className="text-slate-500 text-xs">Official hospital records chronological summary authorized by licensed practitioners.</p>
              </div>

              <div className="space-y-4">
                {recentVisitsList.length > 0 ? (
                  recentVisitsList.map((record) => (
                    <div key={record.id} className="p-5 bg-slate-50 border border-slate-150/40 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{record.doctorName}</p>
                          <p className="text-[10px] text-slate-400">{record.notes || 'Internal Medicine consult'}</p>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 bg-white border border-slate-150 p-1 px-2.5 rounded-lg font-bold">{record.date}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-600">
                        <div>
                          <strong className="text-slate-500 uppercase text-[9px] block">Chief Complaint</strong>
                          <p className="text-slate-705 italic font-medium mt-0.5">{record.chiefComplaint || 'Consultation visit.'}</p>
                        </div>
                        <div>
                          <strong className="text-slate-500 uppercase text-[9px] block">Confirmed Diagnosis</strong>
                          <p className="text-sky-800 font-extrabold mt-0.5">{record.diagnosis}</p>
                        </div>
                        <div className="md:col-span-2">
                          <strong className="text-slate-500 uppercase text-[9px] block">Directives & Treatment Plan</strong>
                          <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200/40 mt-1">{record.treatmentPlan}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 bg-slate-50 border border-dashed rounded-3xl text-center text-xs font-semibold text-slate-400">
                    No clinical history records found in registry database.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PRESCRIPTIONS PAGE */}
          {activeTab === 'prescriptions' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-3xs space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-sans font-extrabold text-slate-900">Your Prescribed Medications</h3>
                <p className="text-slate-500 text-xs">Official pharmacological treatment logs issued by MedLink clinics. Show this to any clearing pharmacist.</p>
              </div>

              <div className="space-y-4">
                {prescriptions.filter(p => p.patientId === patientUser.id).length > 0 ? (
                  prescriptions.filter(p => p.patientId === patientUser.id).map((rx) => (
                    <div key={rx.id} className="p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm">{rx.medicationName}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider font-mono ${
                            rx.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100/80 text-slate-400'
                          }`}>{rx.status}</span>
                        </div>
                        <p className="text-slate-400 text-[10px]">Issued on {rx.date} by {rx.doctorName}</p>
                        <p className="pt-1.5"><strong>Dosage schedule:</strong> {rx.dosage}</p>
                        <p><strong>Duration of treatment:</strong> {rx.duration}</p>
                        <p className="text-slate-500 italic">Instructions: {rx.instructions}</p>
                      </div>

                      <div className="self-end sm:self-center shrink-0">
                        <button
                          onClick={() => alert(`Printing pharmaceutical prescription code for ${rx.medicationName}.`)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-755 font-bold font-sans text-[11px] rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Printer className="h-3 w-3" /> Print Rx Code
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 bg-slate-50 border border-dashed rounded-3xl text-center text-xs font-semibold text-slate-400">
                    No active or historical prescriptions registered in your medical chart.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LAB RESULTS PAGE */}
          {activeTab === 'labs' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-3xs space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-sans font-extrabold text-slate-900">Pathological Laboratory Analyses</h3>
                <p className="text-slate-500 text-xs">Official chemical pathology, blood analyses, and medical test result indices.</p>
              </div>

              <div className="space-y-4">
                {patientLabList.length > 0 ? (
                  patientLabList.map((lab) => (
                    <div key={lab.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs text-slate-650">
                      <div className="flex justify-between items-center border-b border-slate-200/40 pb-2">
                        <div>
                          <h5 className="font-extrabold text-slate-900 text-sm">{lab.testName}</h5>
                          <p className="text-[10px] text-slate-400 font-sans mt-0.5">Released on {lab.date}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider ${
                          lab.status === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          lab.status === 'ABNORMAL' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>{lab.status}</span>
                      </div>
                      
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/40 font-mono text-slate-700 text-xs">
                        {lab.result}
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans">Reference Range Biological Threshold: {lab.referenceRange}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 bg-slate-50 border border-dashed rounded-3xl text-center text-xs font-semibold text-slate-400">
                    No pathological laboratory results logged in your chart.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: RADIOLOGY REPORTS PAGE */}
          {activeTab === 'radiology' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-3xs space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-sans font-extrabold text-slate-900">Radiographical Scans & Imagery</h3>
                <p className="text-slate-500 text-xs">Diagnostic chest, bone, MRI, or abdominal scans signed off by imaging consultants.</p>
              </div>

              <div className="space-y-4">
                {patientRadList.length > 0 ? (
                  patientRadList.map((rad) => (
                    <div key={rad.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 text-xs text-slate-650">
                      <div className="flex justify-between text-xs border-b border-slate-200/45 pb-2">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">{rad.scanType}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">Signed off by Medical Imaging Department</p>
                        </div>
                        <span className="text-slate-400 font-mono font-bold">{rad.date}</span>
                      </div>

                      {/* Imaging vector render container */}
                      <div className="h-44 bg-slate-950 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-4">
                        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-30"></div>
                        <Activity className="h-12 w-12 text-cyan-500/20 mx-auto animate-pulse" />
                        <p className="text-xs font-bold text-zinc-300 font-mono mt-1">HIGH-RESOLUTION CLINICAL RADIOGRAPH</p>
                        <p className="text-[9px] text-zinc-500 font-mono">Reference ID: {rad.id}</p>
                      </div>

                      <p className="text-slate-600 font-sans leading-relaxed bg-white p-3 p-4 rounded-xl border border-slate-200/40">{rad.findings}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 bg-slate-50 border border-dashed rounded-3xl text-center text-xs font-semibold text-slate-400">
                    No radiographical scans or imaging reports found in your records.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: EMERGENCY DATA UPDATE FORM */}
          {activeTab === 'emergency' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-3xs space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-sans font-extrabold text-slate-900">Emergency Medical Profile Setup</h3>
                <p className="text-slate-500 text-xs">Maintain reliable safety indices. Clinicians scan your Smart QR Card to retrieve this critical dataset instantly during emergencies.</p>
              </div>

              {emergencySuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-semibold flex items-center gap-1.5/40">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {emergencySuccessMsg}
                </div>
              )}

              <form onSubmit={handleEmergencySubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Blood Type Grouping</label>
                    <select
                      value={emergencyBlood}
                      onChange={(e) => setEmergencyBlood(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-800 cursor-pointer outline-none transition-all"
                    >
                      <option value="O+ Positive">O+ Positive</option>
                      <option value="O- Negative">O- Negative</option>
                      <option value="A+ Positive">A+ Positive</option>
                      <option value="A- Negative">A- Negative</option>
                      <option value="B+ Positive">B+ Positive</option>
                      <option value="B- Negative">B- Negative</option>
                      <option value="AB+ Positive">AB+ Positive</option>
                      <option value="AB- Negative">AB- Negative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Allergies & Sensitivities</label>
                    <input
                      type="text"
                      required
                      value={emergencyAllergies}
                      onChange={(e) => setEmergencyAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, Peanuts, Bee Venom, Latex"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Chronic Diagnoses</label>
                    <input
                      type="text"
                      required
                      value={emergencyChronic}
                      onChange={(e) => setEmergencyChronic(e.target.value)}
                      placeholder="e.g. Mild Asthma, Hypertension, Type 1 Diabetes"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Emergency Contact Name</label>
                    <input
                      type="text"
                      required
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="e.g. Fatma Salah (Sister)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Emergency Contact Telephone</label>
                    <input
                      type="tel"
                      required
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="e.g. +20 (102) 449-1122"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Verify & Update Emergency Info
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 8: SMART MEDICAL QR ID CARD SECTION */}
          {activeTab === 'qr_card' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Card download control banner */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-none">My Medical QR Identity</h3>
                  <p className="text-slate-500 text-xs mt-1.5">Print or view your healthcare QR identifier for secure validation.</p>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto font-sans">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold duration-150 rounded-xl border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" /> Print QR Card
                  </button>
                  
                  <button
                    onClick={triggerDownloadQR}
                    className="flex-1 sm:flex-none px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold duration-150 rounded-xl shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowDownToLine className="h-4 w-4" /> Download QR
                  </button>

                  <button
                    onClick={() => setIsQrFullscreen(true)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold duration-150 rounded-xl border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" /> Full Screen QR
                  </button>
                </div>
              </div>

              {/* Central QR Code Wallet Graphic block */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col items-center justify-center">
                
                {/* Minimal, Modern QR Card design */}
                <div className="w-full max-w-xs bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-center">
                  
                  {/* Top segment */}
                  <div className="space-y-1">
                    <h4 className="font-sans font-extrabold text-sm tracking-tight text-slate-900">MedLink Healthcare</h4>
                    <p className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">Medical QR Identity</p>
                    <p className="text-xs text-slate-550 font-medium mt-1">{patientUser.fullName}</p>
                  </div>

                  {/* Center segment: Prominent Large QR code */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 mx-auto w-fit">
                    <QRCodeSVG 
                      id="actual-patient-qr-code"
                      value={medicalId}
                      size={180}
                      level="Q"
                      includeMargin={false}
                      className="mx-auto"
                    />
                  </div>

                  {/* Bottom segment */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded bg-sky-50 border border-sky-100 text-xs font-mono font-bold text-sky-700">
                      {medicalId}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal px-2">
                      Authorized healthcare providers can scan this QR code to identify your medical profile securely.
                    </p>
                  </div>

                </div>

              </div>

              {/* REQUEST PHYSICAL INDENTY CARD SECTION */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-3xs space-y-6">
                <div>
                  <h3 className="font-sans font-extrabold text-slate-900 text-base">Physical QR Card Request</h3>
                  <p className="text-slate-500 text-xs mt-1">Request a printed card containing your healthcare QR code.</p>
                </div>

                {cardSuccess && (
                  <div className="p-4 bg-emerald-50 text-emerald-805 border border-emerald-150/40 rounded-xl text-xs font-sans leading-relaxed animate-in fade-in duration-200">
                    <p className="font-extrabold text-emerald-900 flex items-center gap-1">✓ Request Submitted Successfully</p>
                    <p className="text-emerald-700 text-[11px] mt-0.5">Your medical identity card request has been sent for review.</p>
                  </div>
                )}

                <form onSubmit={handleCardRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Full Name</label>
                      <input
                        type="text"
                        disabled
                        value={patientUser.fullName}
                        className="w-full px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 text-slate-500 cursor-not-allowed rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Phone Number</label>
                      <input
                        type="text"
                        disabled
                        value={patientUser.phoneNumber}
                        className="w-full px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 text-slate-500 cursor-not-allowed rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Mailing Address <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={2}
                      value={cardAddress}
                      onChange={(e) => setCardAddress(e.target.value)}
                      placeholder="Please enter your full delivery address where you want the physical card shipped..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-800 outline-none transition-all placeholder-slate-400"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Optional Notes</label>
                    <input
                      type="text"
                      value={cardNotes}
                      onChange={(e) => setCardNotes(e.target.value)}
                      placeholder="e.g. Frequent hospital visits, require braille embossing, etc."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-850 outline-none transition-all placeholder-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Submit Request
                  </button>
                </form>

                {/* MY CARD REQUESTS HISTORY */}
                <div className="pt-6 border-t border-slate-150">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">My Card Requests</h4>
                  
                  {cardRequests.length > 0 ? (
                    <div className="divide-y divide-slate-100 overflow-hidden border rounded-xl border-slate-200 bg-slate-50/30">
                      {cardRequests.map((req, idx) => (
                        <div key={idx} className="p-3.5 px-4 flex justify-between items-center text-xs leading-relaxed">
                          <div>
                            <p className="font-bold text-slate-800">{req.address}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Requested: {req.date} | Notes: {req.notes}</span>
                          </div>
                          
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">You have not submitted a medical card request yet.</p>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 10: SETTINGS PAGE */}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-3xs space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-sans font-extrabold text-slate-900">Portal Security Settings</h3>
                <p className="text-slate-500 text-xs">Configure your user dashboard preferences and password credentials.</p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800">Email Notification Settings</h4>
                  <p className="text-slate-500">Receive dispatch emails when doctors publish signed lab sheets or medical prescriptions.</p>
                  <label className="flex items-center gap-2 cursor-pointer mt-2 text-slate-700">
                    <input type="checkbox" defaultChecked className="rounded text-sky-500 border-slate-300 pointer-events-auto h-4 w-4" />
                    <span className="font-semibold">Enable immediate email notifications</span>
                  </label>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800">Portal Authentication Code</h4>
                  <p className="text-slate-500">To secure HIPAA standard data, sessions lock after 30 minutes of diagnostic idling.</p>
                  <button 
                    onClick={() => alert('Diagnostic password update tunnel is temporarily offline. Contact support.')}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Change Password Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: HELP & SUPPORT PAGE */}
          {activeTab === 'help' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-3xs space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-sans font-extrabold text-slate-900">Help & Portal Support</h3>
                <p className="text-slate-500 text-xs">Solutions to common medical identity queries and technical assistance contacts.</p>
              </div>

              <div className="space-y-4 max-w-2xl text-xs leading-relaxed text-slate-650">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-[13px]">How does the Medical QR Code work?</h4>
                  <p className="font-sans">
                    Your QR code holds your personal permanent Medical ID (MID-789410). Presenting this QR code during hospital visits enables authorized medical clinicians to securely extract your medical record block from Giza clinics instantly, avoiding manual registration error.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <h4 className="font-bold text-slate-800 text-[13px]">Who registers my diagnostic records?</h4>
                  <p className="font-sans">
                    Accredited physicians and pathologists have strict write authorities on clinical diagnoses, pharmacy dosages, pathology labs, and radiology findings. Patients hold full write authority over their own Emergency Contacts and basic telephone profile parameters.
                  </p>
                </div>

                <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl mt-6 text-slate-600">
                  <p className="font-bold text-sky-850">MedLink Administrative Relations Desk</p>
                  <p className="mt-1">For help with card delivery, pending review verification, or to update diagnostic entries:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2 text-[11px]">
                    <li>Email Helpline: <strong>relations@medlink-health.com</strong></li>
                    <li>Hotline: <strong>+20 (102) 449-0011</strong></li>
                    <li>Clinical Desk: Giza District Hospital Office, Level 2</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <footer className="pt-8 border-t border-slate-200/50 text-slate-400 text-[11px] text-center space-y-1 pb-4 no-print">
            <p className="font-bold">© 2026 MedLink Healthcare System</p>
            <p>Secure Patient Healthcare Portal</p>
          </footer>

      {/* DETACHED ENLARGED QR FULL SCREEN MODAL */}
      {isQrFullscreen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-100 text-center space-y-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsQrFullscreen(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-102 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div>
              <span className="text-[10px] bg-sky-50 text-sky-600 font-bold uppercase tracking-wider px-3 py-1 rounded-full">Healthcare Pass</span>
              <h3 className="font-sans font-extrabold text-slate-900 text-lg mt-2">{patientUser.fullName}</h3>
              <p className="text-slate-400 text-xs mt-1">Present this QR code inside medical centers for secure profile extraction.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 inline-block">
              <QRCodeSVG 
                value={medicalId}
                size={220}
                level="H"
                includeMargin={true}
                className="mx-auto"
              />
              <span className="text-[11px] font-mono tracking-widest font-extrabold text-slate-400 uppercase mt-3 block">
                {medicalId}
              </span>
            </div>

            <div className="text-slate-400 text-[10px]">
              Compliance HL7 Protocols Only • Authorized Provider Scan Allowed
            </div>

            <button
              onClick={() => setIsQrFullscreen(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Close Full Screen Mode
            </button>
          </div>
        </div>
      )}




    </div>
  );
}
