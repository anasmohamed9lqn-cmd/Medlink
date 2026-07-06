/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  ClipboardList,
  Calendar,
  Pill,
  FlaskConical,
  Image as ImageIcon,
  AlertTriangle,
  Plus,
  X,
  Clock,
  ShieldCheck,
  Check,
  FileText
} from 'lucide-react';
import { User, EmergencyInfo, MedicalRecord, Prescription, LabResult, RadiologyReport } from '../types';

interface PatientChartProps {
  activePatientObj: User;
  emergencyInfo?: EmergencyInfo;
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  labResults: LabResult[];
  radiologyReports: RadiologyReport[];
  onAddMedicalRecord: (rec: MedicalRecord) => void;
  onAddPrescription: (rx: Prescription) => void;
  onAddLabResult: (lab: LabResult) => void;
  onAddRadiology: (rad: RadiologyReport) => void;
  onClose: () => void;
  doctorUser: User;
}

export default function PatientChart({
  activePatientObj,
  emergencyInfo,
  medicalRecords,
  prescriptions,
  labResults,
  radiologyReports,
  onAddMedicalRecord,
  onAddPrescription,
  onAddLabResult,
  onAddRadiology,
  onClose,
  doctorUser
}: PatientChartProps) {
  const [activeChartTab, setActiveChartTab] = useState<'overview' | 'history' | 'visits' | 'prescriptions' | 'labs' | 'radiology' | 'emergency' | 'add_record'>('overview');
  const [showAddRxForm, setShowAddRxForm] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Form states for Add Prescription tab
  const [rxDate, setRxDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicationName, setMedicationName] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxInstructions, setRxInstructions] = useState('');
  const [rxDuration, setRxDuration] = useState('7 Days');
  const [rxNotes, setRxNotes] = useState('');

  // Form states for Add Medical Record tab
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [notes, setNotes] = useState('');

  const [optIncludeRx, setOptIncludeRx] = useState(false);
  const [optRxMed, setOptRxMed] = useState('');
  const [optRxDosage, setOptRxDosage] = useState('');
  const [optRxInstructions, setOptRxInstructions] = useState('');
  const [optRxDuration, setOptRxDuration] = useState('7 Days');

  const [optIncludeLab, setOptIncludeLab] = useState(false);
  const [optLabTest, setOptLabTest] = useState('');

  const [optIncludeRad, setOptIncludeRad] = useState(false);
  const [optRadScan, setOptRadScan] = useState('');

  // Expanded views inside detail cards
  const [expandedLabId, setExpandedLabId] = useState<string | null>(null);
  const [expandedRadId, setExpandedRadId] = useState<string | null>(null);

  // New comprehensive prescription state fields:
  const [rxFrequency, setRxFrequency] = useState('Once daily');
  const [rxDiagnosis, setRxDiagnosis] = useState('');

  // New comprehensive lab results state fields:
  const [showAddLabResultForm, setShowAddLabResultForm] = useState(false);
  const [labTestName, setLabTestName] = useState('');
  const [labResultDate, setLabResultDate] = useState(new Date().toISOString().split('T')[0]);
  const [labResultValue, setLabResultValue] = useState('');
  const [labRefRange, setLabRefRange] = useState('');
  const [labStatusValue, setLabStatusValue] = useState<'NORMAL' | 'ABNORMAL' | 'CRITICAL' | 'PENDING'>('NORMAL');
  const [labNotesValue, setLabNotesValue] = useState('');
  const [labCbc, setLabCbc] = useState('');
  const [labHemoglobin, setLabHemoglobin] = useState('');
  const [labWbc, setLabWbc] = useState('');
  const [labRbc, setLabRbc] = useState('');
  const [labPlatelets, setLabPlatelets] = useState('');
  const [labGlucose, setLabGlucose] = useState('');
  const [labCholesterol, setLabCholesterol] = useState('');
  const [labInterpretation, setLabInterpretation] = useState('');

  // New comprehensive radiology report state fields:
  const [showAddRadiologyForm, setShowAddRadiologyForm] = useState(false);
  const [radScanType, setRadScanType] = useState('');
  const [radStudyType, setRadStudyType] = useState('CT Scan');
  const [radBodyPart, setRadBodyPart] = useState('');
  const [radDateValue, setRadDateValue] = useState(new Date().toISOString().split('T')[0]);
  const [radFindings, setRadFindings] = useState('');
  const [radNotesValue, setRadNotesValue] = useState('');
  const [radImageUrl, setRadImageUrl] = useState('');
  const [radStatusValue, setRadStatusValue] = useState<'PENDING' | 'COMPLETED' | 'REQUIRES_FOLLOWUP' | 'NORMAL' | 'ABNORMAL' | 'CRITICAL'>('NORMAL');
  const [radClinicalImpression, setRadClinicalImpression] = useState('');
  const [radRecommendations, setRadRecommendations] = useState('');

  // Derive chronological timeline items
  const buildTimeline = () => {
    const vList = medicalRecords.filter(r => r.patientId === activePatientObj.id).map(v => ({
      type: 'visit' as const,
      date: v.date,
      title: 'Clinical Patient Encounter',
      subtitle: `Assigned Dr. ${v.doctorName}`,
      detail1: `Chief Complaint: ${v.chiefComplaint}`,
      detail2: `Diagnosis: ${v.diagnosis}`,
      detail3: `Plan: ${v.treatmentPlan}`
    }));

    const rxList = prescriptions.filter(r => r.patientId === activePatientObj.id).map(rx => ({
      type: 'prescription' as const,
      date: rx.date,
      title: `Medication Prescribed: ${rx.medicationName}`,
      subtitle: `Dosage: ${rx.dosage} (${rx.duration})`,
      detail1: `Instructions: ${rx.instructions}`,
      detail2: `Status: ${rx.status}`,
      detail3: ''
    }));

    const labList = labResults.filter(r => r.patientId === activePatientObj.id).map(lab => ({
      type: 'lab' as const,
      date: lab.date,
      title: `Lab Panels: ${lab.testName}`,
      subtitle: `Result Value: ${lab.result}`,
      detail1: `Ref range: ${lab.referenceRange}`,
      detail2: `Classification: ${lab.status}`,
      detail3: ''
    }));

    const radList = radiologyReports.filter(r => r.patientId === activePatientObj.id).map(rad => ({
      type: 'radiology' as const,
      date: rad.date,
      title: `Radiology Study: ${rad.scanType}`,
      subtitle: `Findings: ${rad.findings}`,
      detail1: `Clinical Impression: ${rad.clinicalImpression || 'Unremarkable study'}`,
      detail2: `Study Notes: ${rad.notes}`,
      detail3: ''
    }));

    return [...vList, ...rxList, ...labList, ...radList].sort((a, b) => b.date.localeCompare(a.date));
  };

  const timeline = buildTimeline();

  const calculateAge = (dobString?: string) => {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const triggerSuccessAlert = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner('');
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left font-sans">
      
      {/* 1. PATIENT CHART HEADER */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block font-mono">Patient Medical Record</span>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {activePatientObj.fullName}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Print Medical Summary
            </button>
          </div>
        </div>

        {/* Horizontal information rail details */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
            <span className="text-[10px] text-slate-400 block font-mono">Medical ID</span>
            <strong className="text-sky-700 font-mono font-bold block mt-0.5">{activePatientObj.medicalId || 'MID-789410'}</strong>
          </div>
          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
            <span className="text-[10px] text-slate-400 block font-mono">Gender</span>
            <strong className="text-slate-900 block mt-0.5">{activePatientObj.gender}</strong>
          </div>
          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
            <span className="text-[10px] text-slate-400 block font-mono">Date of Birth</span>
            <strong className="text-slate-900 font-mono block mt-0.5">{activePatientObj.dateOfBirth}</strong>
          </div>
          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
            <span className="text-[10px] text-slate-400 block font-mono">Age Profile</span>
            <strong className="text-slate-900 block mt-0.5">{calculateAge(activePatientObj.dateOfBirth)} Years</strong>
          </div>
          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50 col-span-2 md:col-span-1">
            <span className="text-[10px] text-slate-400 block font-mono">Clinical Status</span>
            <strong className="text-emerald-700 block mt-0.5 font-bold">🟢 Active Patient</strong>
          </div>
        </div>
      </div>

      {/* Notifications Alert Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex gap-2 items-center text-xs font-bold animate-in fade-in">
          <Check className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* 2. PATIENT RECORD TABS */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: ClipboardList },
          { id: 'history', label: 'Medical History', icon: FileText },
          { id: 'visits', label: 'Visits & EMR', icon: Calendar },
          { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
          { id: 'labs', label: 'Lab Results', icon: FlaskConical },
          { id: 'radiology', label: 'Radiology', icon: ImageIcon },
          { id: 'emergency', label: 'Emergency Info', icon: AlertTriangle },
          { id: 'add_record', label: 'Add Medical Record', icon: Plus }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeChartTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveChartTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                isActive
                  ? 'bg-white border border-slate-200 text-sky-700 shadow-3xs'
                  : 'text-slate-655 text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB RENDERING PORTAL */}

      {/* OVERVIEW TAB */}
      {activeChartTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:col-span-2 space-y-6">
            <div className="space-y-1.5 border-b pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase">Patient Health Brief Summary</h3>
              <p className="text-xs text-slate-500">Concise medical synopsis of chronic diagnostic files, current active prescriptions, and critical warnings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-black block font-mono">Blood Classification</span>
                <p className="text-rose-600 font-extrabold text-sm">{emergencyInfo?.bloodType || 'A+ Positive'}</p>
              </div>

              <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-black block font-mono">Severe Histamine Allergies</span>
                <p className="text-slate-900 font-bold text-xs">{emergencyInfo?.allergies || 'Penicillin, Peanuts, Bee Venom'}</p>
              </div>

              <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-black block font-mono">Chronic Conditions</span>
                <p className="text-slate-900 font-bold text-xs">{emergencyInfo?.chronicDiseases || 'Mild Asthma, Hypertension'}</p>
              </div>

              <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-black block font-mono">Critical Active Medications</span>
                <p className="text-slate-900 font-bold text-xs">{emergencyInfo?.criticalMedications || 'Albuterol inhaler emergency, Metformin hydrochloride'}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Associated Insurance Coverage Policy</h4>
              <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">Gold Shield Premium Health Net Plan</p>
                  <p className="text-[10px] font-mono text-slate-500">ID Key: MED-6691-SHD | Co-Pay Rate: 5.0%</p>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100/75 text-emerald-800 rounded text-[9px] font-black uppercase font-mono border border-emerald-200">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="space-y-1 border-b pb-2">
              <h4 className="text-xs font-black text-slate-900 uppercase">Emergency Contact Info</h4>
              <p className="text-[11px] text-slate-400 leading-tight">Next of kin direct work/home communication details verified internally.</p>
            </div>

            <div className="p-4 bg-rose-50/10 border border-rose-100 rounded-xl space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black block font-mono">Legal Relationship Link</span>
                <p className="text-slate-900 font-bold text-xs">{emergencyInfo?.emergencyContactName || 'Fatma Salah (Sister)'}</p>
              </div>
              <div className="pt-1 select-all cursor-pointer">
                <span className="text-[10px] text-slate-400 uppercase font-black block font-mono">Direct Communication Line</span>
                <a href={`tel:${emergencyInfo?.emergencyContactPhone || '+20 (102) 449-1122'}`} className="text-sky-600 font-mono font-bold text-xs hover:underline block mt-0.5">
                  {emergencyInfo?.emergencyContactPhone || '+20 (102) 449-1122'}
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-[11px] text-slate-500 leading-relaxed font-semibold">
              ⚠️ Please review this panel carefully before administering intravenous injections, diagnostic nuclear exams, or prescribing strong antihistamines.
            </div>
          </div>
        </div>
      )}

      {/* MEDICAL HISTORY TAB */}
      {activeChartTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1 pb-4 border-b">
            <h3 className="text-sm font-black text-slate-900 uppercase">Chronological Visit & Consultation Registry</h3>
            <p className="text-xs text-slate-500">Browse full clinical medical entries registered within the Cairo Nile Hospital database infrastructure.</p>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {medicalRecords.filter(r => r.patientId === activePatientObj.id).map((v) => (
              <div key={v.id} className="p-5 border border-slate-200 hover:border-slate-300 rounded-xl bg-slate-50/30 transition-all space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">{v.date}</span>
                    <h4 className="font-bold text-xs text-slate-950 tracking-tight mt-0.5">Outpatient Medical Visit Encounter</h4>
                  </div>
                  <span className="px-2.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded text-[9px] font-black uppercase font-mono tracking-wider">
                    Dr. {v.doctorName || 'Attending Physician'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="p-3 bg-white border border-slate-150 rounded-lg">
                    <span className="text-[9px] text-slate-400 uppercase block font-mono">Chief Complaint</span>
                    <p className="text-slate-800 leading-relaxed mt-0.5">{v.chiefComplaint}</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-150 rounded-lg">
                    <span className="text-[9px] text-slate-400 uppercase block font-mono">Primary Diagnosis</span>
                    <p className="text-slate-900 font-bold leading-relaxed mt-0.5">{v.diagnosis}</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-150 rounded-lg md:col-span-2">
                    <span className="text-[9px] text-slate-400 uppercase block font-mono">Prescribed Treatment Plan</span>
                    <p className="text-indigo-700 font-bold leading-relaxed mt-0.5">{v.treatmentPlan}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg md:col-span-2">
                    <span className="text-[9px] text-slate-400 uppercase block font-mono">Clinician Intramural Notes & Audit Logs</span>
                    <p className="text-slate-600 italic mt-0.5 leading-relaxed">"{v.notes || 'No intramural physician comments logged.'}"</p>
                  </div>
                </div>
              </div>
            ))}

            {medicalRecords.filter(r => r.patientId === activePatientObj.id).length === 0 && (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="font-semibold">No medical history entries registered for this patient.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISITS & EMR TAB */}
      {activeChartTab === 'visits' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1 border-b pb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase">Consultations, Schedules & Chronological EMR Log</h3>
            <p className="text-xs text-slate-500">Track active routine hospital checkups, booking queues, and system events audit logs.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            <div className="lg:col-span-1 space-y-4">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Admitted Hospital visits Timeline</h4>
              <div className="space-y-2.5">
                {medicalRecords.filter(r => r.patientId === activePatientObj.id).slice(0, 4).map(v => (
                  <div key={v.id} className="p-3.5 border border-slate-250 bg-slate-50/50 rounded-xl space-y-1">
                    <span className="font-mono text-slate-450 font-bold text-[10px] text-slate-400">{v.date}</span>
                    <p className="font-bold text-slate-800 leading-tight">Encounter: {v.diagnosis.slice(0, 40)}...</p>
                    <p className="text-[10px] text-slate-400">Diag Plan: {v.treatmentPlan.slice(0, 45)}...</p>
                  </div>
                ))}

                {medicalRecords.filter(r => r.patientId === activePatientObj.id).length === 0 && (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
                    No routine checkups registered.
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Patient Case Clinical Timeline Flow ({timeline.length} items)</h4>
              
              <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative pl-5 border-l-2 border-slate-150 pb-2.5 last:pb-0 space-y-1">
                    {/* Timeline dot */}
                    <div className={`absolute -left-1.5 top-0.5 w-3 h-3 rounded-full border-2 border-white flex items-center justify-center ${
                      item.type === 'visit' ? 'bg-sky-500' :
                      item.type === 'prescription' ? 'bg-pink-500' :
                      item.type === 'lab' ? 'bg-amber-500' : 'bg-purple-500'
                    }`} />

                    <div className="flex items-center justify-between text-[10px] font-mono leading-none text-slate-400">
                      <span>{item.date}</span>
                      <span className={`px-2 py-0.2 rounded font-black text-[8px] uppercase tracking-wider ${
                        item.type === 'visit' ? 'bg-sky-50 text-sky-700' :
                        item.type === 'prescription' ? 'bg-pink-50 text-pink-700' :
                        item.type === 'lab' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
                      }`}>{item.type}</span>
                    </div>

                    <h5 className="font-bold text-xs text-slate-900 leading-tight mt-0.5">{item.title}</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-sans leading-relaxed">{item.subtitle}</p>
                    {item.detail1 && <p className="text-[10px] text-slate-450 italic mt-0.5 leading-snug">Detail: {item.detail1}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRESCRIPTIONS TAB */}
      {activeChartTab === 'prescriptions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-slate-900 uppercase">Pharmaceutical Prescription Deck</h3>
              <p className="text-xs text-slate-500">Log and transmit pharmaceutical instructions securely to connected pharmacies.</p>
            </div>

            {!showAddRxForm && (
              <button
                onClick={() => setShowAddRxForm(true)}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <Plus className="h-4 w-4" /> Add Prescription
              </button>
            )}
          </div>

          {/* ADD PRESCRIPTION FORM WORKFLOW */}
          {showAddRxForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const rx: Prescription = {
                  id: 'rx-' + Math.floor(1000 + Math.random() * 9000),
                  patientId: activePatientObj.id,
                  doctorId: doctorUser.id,
                  doctorName: doctorUser.fullName,
                  date: rxDate,
                  medicationName: medicationName.trim(),
                  dosage: rxDosage.trim(),
                  instructions: rxInstructions.trim() + (rxNotes.trim() ? ` (Note: ${rxNotes.trim()})` : ''),
                  duration: rxDuration,
                  status: 'ACTIVE',
                  frequency: rxFrequency.trim(),
                  diagnosis: rxDiagnosis.trim()
                };
                onAddPrescription(rx);
                setMedicationName('');
                setRxDosage('');
                setRxInstructions('');
                setRxDuration('7 Days');
                setRxNotes('');
                setRxFrequency('Once daily');
                setRxDiagnosis('');
                setShowAddRxForm(false);
                triggerSuccessAlert(`Prescription for ${rx.medicationName} saved successfully!`);
              }}
              className="p-5 border-2 border-pink-100 rounded-xl bg-pink-50/10 space-y-4 animate-in slide-in-from-top-3"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-xs text-pink-700 uppercase">Transmit Pharmaceutical Prescription</h4>
                <button
                  type="button"
                  onClick={() => setShowAddRxForm(false)}
                  className="text-slate-400 hover:text-slate-700 animate-pulse"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Patient Name</label>
                  <input
                    type="text"
                    disabled
                    value={`${activePatientObj.fullName} (MID: ${activePatientObj.medicalId || 'MID-789410'})`}
                    className="w-full bg-slate-100 border border-slate-200 p-2.5 rounded-lg text-slate-500 font-extrabold cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Effective Rx Date</label>
                  <input
                    type="date"
                    required
                    value={rxDate}
                    onChange={(e) => setRxDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-650 uppercase text-[10px] font-mono tracking-wider mb-1">Medication Name *</label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      value={medicationName}
                      onChange={(e) => setMedicationName(e.target.value)}
                      placeholder="Search or type medication name, e.g. Lisinopril 10mg"
                      className="w-full bg-white border border-slate-250 p-2.5 rounded-lg outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {['Lisinopril 10mg', 'Metformin 500mg', 'Amoxicillin 500mg', 'Atorvastatin 20mg', 'Omeprazole 20mg'].map(med => (
                        <button
                          key={med}
                          type="button"
                          onClick={() => setMedicationName(med)}
                          className="px-2 py-1 bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 rounded text-[9px] text-slate-700 hover:text-pink-700 transition-colors cursor-pointer"
                        >
                          + {med}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-650 uppercase text-[10px] font-mono tracking-wider mb-1">Dosage Unit *</label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      value={rxDosage}
                      onChange={(e) => setRxDosage(e.target.value)}
                      placeholder="e.g. 1 tablet"
                      className="w-full bg-white border border-slate-250 p-2.5 rounded-lg outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {['1 tablet', '2 tablets', '5ml liquid', '1 puff', 'Apply thin layer'].map(dose => (
                        <button
                          key={dose}
                          type="button"
                          onClick={() => setRxDosage(dose)}
                          className="px-2 py-1 bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 rounded text-[9px] text-slate-700 hover:text-pink-700 transition-colors cursor-pointer"
                        >
                          + {dose}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-650 uppercase text-[10px] font-mono tracking-wider mb-1">Interval Frequency *</label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      value={rxFrequency}
                      onChange={(e) => setRxFrequency(e.target.value)}
                      placeholder="e.g. Twice daily (q12h)"
                      className="w-full bg-white border border-slate-250 p-2.5 rounded-lg outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {['Once daily', 'Twice daily (q12h)', 'Three times daily', 'At bedtime'].map(freq => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setRxFrequency(freq)}
                          className="px-2 py-1 bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 rounded text-[9px] text-slate-700 hover:text-pink-700 transition-colors cursor-pointer"
                        >
                          + {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-650 uppercase text-[10px] font-mono tracking-wider mb-1">Linked Diagnostic Claim Indication *</label>
                  <input
                    type="text"
                    required
                    value={rxDiagnosis}
                    onChange={(e) => setRxDiagnosis(e.target.value)}
                    placeholder="e.g. Essential Hypertension (I10)"
                    className="w-full bg-white border border-slate-250 p-2.5 rounded-lg outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-650 uppercase text-[10px] font-mono tracking-wider mb-1">Specific Instructions / Cautions *</label>
                  <textarea
                    required
                    value={rxInstructions}
                    onChange={(e) => setRxInstructions(e.target.value)}
                    placeholder="e.g. Take after breakfast with water. Do not consume alcohol."
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg h-18 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-650 uppercase text-[10px] font-mono tracking-wider mb-1">Duration Interval *</label>
                  <select
                    value={rxDuration}
                    onChange={(e) => setRxDuration(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="5 Days">5 Days</option>
                    <option value="7 Days">7 Days</option>
                    <option value="14 Days">14 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="As Needed">As Needed (PRN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-650 uppercase text-[10px] font-mono tracking-wider mb-1">Specialist Pharmacy Notes (Optional)</label>
                  <input
                    type="text"
                    value={rxNotes}
                    onChange={(e) => setRxNotes(e.target.value)}
                    placeholder="e.g. Brand substitution allowed"
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddRxForm(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg cursor-pointer animate-pulse"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg uppercase font-black cursor-pointer shadow-3xs"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          )}

          {/* PRESCRIPTION HISTORY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
            {prescriptions.filter(p => p.patientId === activePatientObj.id).map((rx) => (
              <div key={rx.id} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/20 text-xs text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-950 font-sans">{rx.medicationName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Date Transmitted: {rx.date}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    rx.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-150'
                      : 'bg-slate-100 text-slate-600'
                  }`}>{rx.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-606 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-mono">Dosage Unit:</span>
                    <strong className="text-slate-900">{rx.dosage}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-mono">Duration:</span>
                    <strong className="text-pink-600 font-bold">{rx.duration}</strong>
                  </div>
                  {rx.frequency && (
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-400 block font-mono">Administration Frequency:</span>
                      <strong className="text-slate-800 font-bold">{rx.frequency}</strong>
                    </div>
                  )}
                  {rx.diagnosis && (
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-400 block font-mono">Diagnostic Association:</span>
                      <strong className="text-indigo-600 font-bold">{rx.diagnosis}</strong>
                    </div>
                  )}
                  <div className="col-span-2 pt-1 border-t border-slate-50 mt-1">
                    <span className="text-[9px] text-slate-400 block font-mono">Administration Instructions:</span>
                    <p className="text-slate-800 leading-relaxed mt-0.5 font-medium">{rx.instructions}</p>
                  </div>
                </div>
              </div>
            ))}

            {prescriptions.filter(p => p.patientId === activePatientObj.id).length === 0 && (
              <div className="py-8 text-center text-slate-400 md:col-span-2 space-y-2">
                <Pill className="h-8 w-8 text-slate-350 mx-auto" />
                <p className="font-semibold">No active or historical medications recorded.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LAB RESULTS TAB */}
      {activeChartTab === 'labs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-slate-900 uppercase text-left">Laboratory Diagnostic Assays Summary</h3>
              <p className="text-xs text-slate-500 text-left">Hematological panels, blood chemistries, and automated biological assay files.</p>
            </div>
            {!showAddLabResultForm && (
              <button
                onClick={() => setShowAddLabResultForm(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <Plus className="h-4 w-4" /> Certify Lab Result
              </button>
            )}
          </div>

          {/* ADD LAB RESULT FORM */}
          {showAddLabResultForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const lab: LabResult = {
                  id: 'lab-' + Math.floor(1000 + Math.random() * 9000),
                  patientId: activePatientObj.id,
                  doctorId: doctorUser.id,
                  doctorName: doctorUser.fullName,
                  testName: labTestName.trim(),
                  date: labResultDate,
                  result: labResultValue.trim(),
                  referenceRange: labRefRange.trim(),
                  status: labStatusValue,
                  notes: labNotesValue.trim(),
                  cbc: labCbc.trim(),
                  hemoglobin: labHemoglobin.trim(),
                  wbc: labWbc.trim(),
                  rbc: labRbc.trim(),
                  platelets: labPlatelets.trim(),
                  glucose: labGlucose.trim(),
                  cholesterol: labCholesterol.trim(),
                  interpretation: labInterpretation.trim()
                };
                onAddLabResult(lab);
                setLabTestName('');
                setLabResultValue('');
                setLabRefRange('');
                setLabStatusValue('NORMAL');
                setLabNotesValue('');
                setLabCbc('');
                setLabHemoglobin('');
                setLabWbc('');
                setLabRbc('');
                setLabPlatelets('');
                setLabGlucose('');
                setLabCholesterol('');
                setLabInterpretation('');
                setShowAddLabResultForm(false);
                triggerSuccessAlert(`Laboratory assay recorded for ${lab.testName} successfully!`);
              }}
              className="p-5 border-2 border-amber-100 rounded-xl bg-amber-50/10 space-y-4 animate-in slide-in-from-top-2 text-xs font-semibold text-left"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-xs text-amber-700 uppercase">Certify New Laboratory Assay</h4>
                <button
                  type="button"
                  onClick={() => setShowAddLabResultForm(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Assay Profile (Test Name) *</label>
                  <input
                    type="text"
                    required
                    value={labTestName}
                    onChange={(e) => setLabTestName(e.target.value)}
                    placeholder="e.g. Complete Blood Count (CBC) or Lipid Panel"
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Certification Date</label>
                  <input
                    type="date"
                    required
                    value={labResultDate}
                    onChange={(e) => setLabResultDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Clinical Range Status *</label>
                  <select
                    value={labStatusValue}
                    onChange={(e) => setLabStatusValue(e.target.value as any)}
                    className="w-full bg-white border border-slate-205 p-2.5 rounded-lg cursor-pointer outline-none"
                  >
                    <option value="NORMAL">NORMAL INDEX</option>
                    <option value="ABNORMAL">ABNORMAL DEVIATION</option>
                    <option value="CRITICAL">CRITICAL LEVEL ALERT</option>
                    <option value="PENDING">PENDING ASSAY RUN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Result Summary Metric *</label>
                  <input
                    type="text"
                    required
                    value={labResultValue}
                    onChange={(e) => setLabResultValue(e.target.value)}
                    placeholder="e.g. Hemoglobin 14.2 g/dL (Borderline) or 5.2 Million/uL"
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Referential Limits Range *</label>
                  <input
                    type="text"
                    required
                    value={labRefRange}
                    onChange={(e) => setLabRefRange(e.target.value)}
                    placeholder="e.g. 13.5 - 17.5 g/dL (Male Reference)"
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2 font-black">Hematology / Blood Chemistry Specific Sub-Metrics (Optional)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 text-[9px] mb-1">Hemoglobin (g/dL)</label>
                    <input
                      type="text"
                      value={labHemoglobin}
                      onChange={(e) => setLabHemoglobin(e.target.value)}
                      placeholder="e.g. 14.2"
                      className="w-full bg-white border border-slate-250 p-2 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] mb-1">White Blood Cells (WBC count)</label>
                    <input
                      type="text"
                      value={labWbc}
                      onChange={(e) => setLabWbc(e.target.value)}
                      placeholder="e.g. 6.5 K/uL"
                      className="w-full bg-white border border-slate-250 p-2 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] mb-1">Red Blood Cells (RBC count)</label>
                    <input
                      type="text"
                      value={labRbc}
                      onChange={(e) => setLabRbc(e.target.value)}
                      placeholder="e.g. 4.7 M/uL"
                      className="w-full bg-white border border-slate-250 p-2 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] mb-1">Platelets count (K/uL)</label>
                    <input
                      type="text"
                      value={labPlatelets}
                      onChange={(e) => setLabPlatelets(e.target.value)}
                      placeholder="e.g. 250"
                      className="w-full bg-white border border-slate-250 p-2 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] mb-1">Fasting Glucose (mg/dL)</label>
                    <input
                      type="text"
                      value={labGlucose}
                      onChange={(e) => setLabGlucose(e.target.value)}
                      placeholder="e.g. 95"
                      className="w-full bg-white border border-slate-250 p-2 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] mb-1">Total Cholesterol (mg/dL)</label>
                    <input
                      type="text"
                      value={labCholesterol}
                      onChange={(e) => setLabCholesterol(e.target.value)}
                      placeholder="e.g. 185"
                      className="w-full bg-white border border-slate-250 p-2 rounded-lg outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-500 text-[9px] mb-1">CBC Co-Factors / Differentials</label>
                    <input
                      type="text"
                      value={labCbc}
                      onChange={(e) => setLabCbc(e.target.value)}
                      placeholder="e.g. Neutrophils 62%, Lymphocytes 28%"
                      className="w-full bg-white border border-slate-250 p-2 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Diagnostic Interpretation Summary</label>
                <input
                  type="text"
                  value={labInterpretation}
                  onChange={(e) => setLabInterpretation(e.target.value)}
                  placeholder="e.g. Iron profile indicates mild physiological anemia. Recommend iron dietary balance."
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Specialist Remarks Observations Notes (Optional)</label>
                <textarea
                  value={labNotesValue}
                  onChange={(e) => setLabNotesValue(e.target.value)}
                  placeholder="e.g. Sample verified at second centrifuge run. Correct clinical identification signatures attached."
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg h-14 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddLabResultForm(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg uppercase font-black cursor-pointer shadow-3xs"
                >
                  Publish Lab Assay
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[440px] overflow-y-auto pr-1">
            {labResults.filter(l => l.patientId === activePatientObj.id).map((lab) => {
              const isExpanded = expandedLabId === lab.id;
              return (
                <div key={lab.id} className="p-4 border border-slate-200 hover:border-slate-305 rounded-xl space-y-3 bg-slate-50/20 text-xs text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-950 font-sans text-xs">{lab.testName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Date Auth: {lab.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      lab.status === 'NORMAL' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                      lab.status === 'ABNORMAL' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      lab.status === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse' :
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>{lab.status}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-605 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-mono">Result Metric Value:</span>
                      <strong className="text-amber-800 text-sm font-mono block mt-0.5">{lab.result}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-mono">Reference range limits:</span>
                      <strong className="text-slate-800 font-mono block mt-0.5">{lab.referenceRange}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedLabId(isExpanded ? null : lab.id)}
                    className="text-sky-650 hover:text-sky-800 text-[10px] uppercase font-black tracking-wider block pt-1.5 cursor-pointer hover:underline text-left col-span-2"
                  >
                    {isExpanded ? 'Hide Assay Details' : 'View Details & Signatures'}
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white border border-slate-205 rounded-lg space-y-3 animate-in slide-in-from-top-1 text-slate-700">
                      <p className="text-[11px] font-medium"><strong className="text-slate-800">Attending Doctor/Specialist:</strong> {lab.doctorName || 'Dr. Nasser Eldin (Laboratory Pathology Chief)'}</p>
                      
                      {(lab.cbc || lab.hemoglobin || lab.wbc || lab.rbc || lab.platelets || lab.glucose || lab.cholesterol) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-100 uppercase font-black text-[9px] tracking-wide">
                          {lab.hemoglobin && (
                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="text-slate-450 block text-[8px] font-mono">Hemoglobin</span>
                              <span className="text-slate-800 mt-0.5 block">{lab.hemoglobin}</span>
                            </div>
                          )}
                          {lab.wbc && (
                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="text-slate-450 block text-[8px] font-mono">WBC count</span>
                              <span className="text-slate-800 mt-0.5 block">{lab.wbc}</span>
                            </div>
                          )}
                          {lab.rbc && (
                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="text-slate-450 block text-[8px] font-mono">RBC count</span>
                              <span className="text-slate-800 mt-0.5 block">{lab.rbc}</span>
                            </div>
                          )}
                          {lab.platelets && (
                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="text-slate-450 block text-[8px] font-mono">Platelets</span>
                              <span className="text-slate-800 mt-0.5 block">{lab.platelets}</span>
                            </div>
                          )}
                          {lab.glucose && (
                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="text-slate-450 block text-[8px] font-mono">Glucose (Fasting)</span>
                              <span className="text-rose-600 mt-0.5 block">{lab.glucose}</span>
                            </div>
                          )}
                          {lab.cholesterol && (
                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="text-slate-450 block text-[8px] font-mono">Total Cholesterol</span>
                              <span className="text-slate-800 mt-0.5 block">{lab.cholesterol}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {lab.cbc && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[10px]">
                          <strong className="text-slate-500 font-mono text-[8px] block uppercase">CBC Differentials / Factors</strong>
                          <span className="text-slate-800 font-semibold">{lab.cbc}</span>
                        </div>
                      )}

                      {lab.interpretation && (
                        <div className="bg-amber-50/20 p-2.5 border-l-2 border-amber-400 rounded text-[11px] leading-relaxed">
                          <strong className="text-amber-800 font-mono text-[8px] block uppercase tracking-wider">Clinical Interpretation Summary</strong>
                          <span className="text-slate-800 font-semibold italic">"{lab.interpretation}"</span>
                        </div>
                      )}

                      {lab.notes && (
                        <p className="border-t pt-2 border-dashed border-slate-100 text-[10px]">
                          <strong className="text-slate-700 block text-[8px] font-mono uppercase">Observations notes:</strong>
                          <span className="italic text-slate-500">"{lab.notes}"</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {labResults.filter(l => l.patientId === activePatientObj.id).length === 0 && (
              <div className="py-8 text-center text-slate-400 md:col-span-2 space-y-2">
                <FlaskConical className="h-8 w-8 text-slate-350 mx-auto animate-pulse" />
                <p className="font-semibold text-xs">No pathology laboratory assays are currently linked.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RADIOLOGY REPORTS TAB */}
      {activeChartTab === 'radiology' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-slate-900 uppercase text-left">Radiological Imaging Archives</h3>
              <p className="text-xs text-slate-500 text-left">View tomographical scans, sonic studies, and high-resolution radiograph dossiers.</p>
            </div>
            {!showAddRadiologyForm && (
              <button
                onClick={() => setShowAddRadiologyForm(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <Plus className="h-4 w-4" /> Log Radiology Study
              </button>
            )}
          </div>

          {/* ADD RADIOLOGY FORM */}
          {showAddRadiologyForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const rad: RadiologyReport = {
                  id: 'rad-' + Math.floor(1000 + Math.random() * 9000),
                  patientId: activePatientObj.id,
                  doctorId: doctorUser.id,
                  doctorName: doctorUser.fullName,
                  scanType: radScanType.trim(),
                  studyType: radStudyType,
                  bodyPart: radBodyPart.trim(),
                  date: radDateValue,
                  findings: radFindings.trim(),
                  notes: radNotesValue.trim(),
                  imageUrl: radImageUrl.trim() || 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=400&q=80',
                  status: radStatusValue,
                  clinicalImpression: radClinicalImpression.trim(),
                  recommendations: radRecommendations.trim(),
                  impression: radClinicalImpression.trim()
                };
                onAddRadiology(rad);
                setRadScanType('');
                setRadBodyPart('');
                setRadFindings('');
                setRadNotesValue('');
                setRadImageUrl('');
                setRadStatusValue('NORMAL');
                setRadClinicalImpression('');
                setRadRecommendations('');
                setShowAddRadiologyForm(false);
                triggerSuccessAlert(`Radiology scan recorded for ${rad.scanType} successfully!`);
              }}
              className="p-5 border-2 border-indigo-100 rounded-xl bg-indigo-50/10 space-y-4 animate-in slide-in-from-top-2 text-xs font-semibold text-left"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-xs text-indigo-700 uppercase">Publish New Radiology Study</h4>
                <button
                  type="button"
                  onClick={() => setShowAddRadiologyForm(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Scan Modality Type *</label>
                  <input
                    type="text"
                    required
                    value={radScanType}
                    onChange={(e) => setRadScanType(e.target.value)}
                    placeholder="e.g. Chest X-Ray or Anterior Chest"
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Study Classification *</label>
                  <select
                    value={radStudyType}
                    onChange={(e) => setRadStudyType(e.target.value as any)}
                    className="w-full bg-white border border-slate-205 p-2.5 rounded-lg cursor-pointer outline-none"
                  >
                    <option value="X-Ray">X-Ray (Radiography)</option>
                    <option value="CT Scan">CT Scan (Tomography)</option>
                    <option value="MRI">MRI Scan (Magnetic Resonance)</option>
                    <option value="Ultrasound">Ultrasound Study</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Target Anatomy Body Part *</label>
                  <input
                    type="text"
                    required
                    value={radBodyPart}
                    onChange={(e) => setRadBodyPart(e.target.value)}
                    placeholder="e.g. Thorax, Left Ankle, Head"
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Study Acquisition Date</label>
                  <input
                    type="date"
                    required
                    value={radDateValue}
                    onChange={(e) => setRadDateValue(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Diagnostic Severity *</label>
                  <select
                    value={radStatusValue}
                    onChange={(e) => setRadStatusValue(e.target.value as any)}
                    className="w-full bg-white border border-slate-205 p-2.5 rounded-lg cursor-pointer outline-none"
                  >
                    <option value="NORMAL">NORMAL EXAMINATION</option>
                    <option value="ABNORMAL">ABNORMAL DEVIATION</option>
                    <option value="CRITICAL">CRITICAL CLINICAL FINDING</option>
                    <option value="REQUIRES_FOLLOWUP">RECOMMEND CLINICAL FOLLOW-UP</option>
                    <option value="PENDING">ACQUISITION PENDING</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-650 uppercase text-[10px] font-mono tracking-wider mb-1">Radiology Study Findings Summary *</label>
                <textarea
                  required
                  value={radFindings}
                  onChange={(e) => setRadFindings(e.target.value)}
                  placeholder="e.g. Lungs are clear. Heart size is normal. No pleural effusion or pneumothorax."
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg h-16 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Clinical Impression Conclusion *</label>
                  <input
                    type="text"
                    required
                    value={radClinicalImpression}
                    onChange={(e) => setRadClinicalImpression(e.target.value)}
                    placeholder="e.g. Unremarkable chest radiographic examination"
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Imaging Reference Asset URL / Plate Base64 (Optional)</label>
                  <input
                    type="text"
                    value={radImageUrl}
                    onChange={(e) => setRadImageUrl(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com or paste DICOM link"
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Clinical Specialist Recommendations / Path Action</label>
                <input
                  type="text"
                  value={radRecommendations}
                  onChange={(e) => setRadRecommendations(e.target.value)}
                  placeholder="e.g. Routine screening interval in 12 months. No immediate therapy needed."
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[10px] font-mono tracking-wider mb-1">Modality Acquisition Special Notes</label>
                <textarea
                  value={radNotesValue}
                  onChange={(e) => setRadNotesValue(e.target.value)}
                  placeholder="e.g. Patient positioned safely. Inspiration volume was adequate."
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg h-14 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddRadiologyForm(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg uppercase font-black cursor-pointer shadow-3xs"
                >
                  Publish Study File
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[500px] overflow-y-auto pr-1 animate-in fade-in">
            {radiologyReports.filter(r => r.patientId === activePatientObj.id).map((rad) => {
              const isExpanded = expandedRadId === rad.id;
              return (
                <div key={rad.id} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/20 text-xs text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-950 font-sans text-xs">{rad.scanType}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Study date: {rad.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      rad.status === 'NORMAL' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      rad.status === 'ABNORMAL' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      rad.status === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse' :
                      'bg-indigo-50 text-indigo-750 border border-indigo-100'
                    }`}>{rad.status || 'REPORTED'}</span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-700 font-semibold bg-white p-3 border border-slate-150 rounded-lg whitespace-pre-line">
                    <strong className="text-[9px] uppercase font-mono text-indigo-650 block mb-1">Diagnostic Findings Summary</strong>
                    "{rad.findings}"
                  </p>

                  <button
                    type="button"
                    onClick={() => setExpandedRadId(isExpanded ? null : rad.id)}
                    className="text-indigo-600 hover:text-indigo-850 text-[10px] uppercase font-black tracking-wider block pt-1.5 cursor-pointer hover:underline text-left"
                  >
                    {isExpanded ? 'Collapse Report Folder' : 'Open Full Report'}
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3.5 animate-in slide-in-from-top-1">
                      {rad.imageUrl && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                          <span className="block text-[8px] font-mono font-black uppercase text-slate-400 tracking-wider">Radiograph Image Link:</span>
                          <a 
                            href={rad.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-sky-600 hover:text-sky-800 font-semibold break-all underline flex items-center gap-1.5"
                          >
                            <span className="truncate">{rad.imageUrl}</span>
                          </a>
                        </div>
                      )}
                      
                      <div className="text-[11.5px] font-semibold text-slate-650 space-y-2 font-sans border-t pt-2 border-slate-100">
                        {rad.studyType && (
                          <p className="flex justify-between border-b pb-1 border-slate-50">
                            <span className="text-slate-400 text-[10px] font-mono">Modality / Study Class:</span>
                            <span className="text-slate-800">{rad.studyType}</span>
                          </p>
                        )}
                        {rad.bodyPart && (
                          <p className="flex justify-between border-b pb-1 border-slate-50">
                            <span className="text-slate-400 text-[10px] font-mono">Target Anatomy Part:</span>
                            <span className="text-slate-800 uppercase">{rad.bodyPart}</span>
                          </p>
                        )}
                        {(rad.clinicalImpression || rad.impression) && (
                          <div className="bg-indigo-50/15 p-2 rounded border-l-2 border-indigo-500 font-medium">
                            <span className="text-indigo-700 text-[8px] font-mono block uppercase">Diagnostic Conclusions</span>
                            <span className="text-slate-900">{rad.clinicalImpression || rad.impression}</span>
                          </div>
                        )}
                        {rad.recommendations && (
                          <div className="bg-emerald-50/15 p-2 rounded border-l-2 border-emerald-500 font-medium">
                            <span className="text-emerald-700 text-[8px] font-mono block uppercase">Proactive Recommendations</span>
                            <span className="text-slate-800 italic">"{rad.recommendations}"</span>
                          </div>
                        )}
                        {rad.notes && <p className="text-[10px] text-slate-400 font-mono italic">Specialist Observations: {rad.notes}</p>}
                        <p className="text-[10px] text-slate-450 border-t pt-1.5 border-dashed border-slate-100 font-mono">Credential signature: Dr. Sarah Jenkins (Cairo Med Radiology Lab Chief)</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {radiologyReports.filter(r => r.patientId === activePatientObj.id).length === 0 && (
              <div className="py-8 text-center text-slate-400 md:col-span-2 space-y-2">
                <ImageIcon className="h-8 w-8 text-slate-350 mx-auto animate-pulse" />
                <p className="font-semibold text-xs text-slate-450 font-sans">No radiological scan records are currently registered.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EMERGENCY INFORMATION TAB */}
      {activeChartTab === 'emergency' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1 border-b pb-4">
            <h3 className="text-sm font-black text-rose-800 uppercase flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600 animate-bounce" /> VITAL CLINICAL EMERGENCY RECORD
            </h3>
            <p className="text-xs text-rose-900 font-medium">Critical patient allergies, physiological groups (blood type) and family contact lines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold leading-normal">
            <div className="p-4 bg-rose-50/20 border border-rose-100 rounded-xl space-y-3.5">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Physiological Blood Group</span>
                <strong className="text-rose-600 font-bold block text-lg font-sans leading-none">{emergencyInfo?.bloodType || 'A+ Positive'}</strong>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-550 uppercase font-mono block">Severe Histamine / Drug Allergies</span>
                <strong className="text-slate-900 block text-xs leading-none">{emergencyInfo?.allergies || 'Penicillin, Ceclor, Bee Venom'}</strong>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-550 uppercase font-mono block">Chronic Diagnosed Conditions</span>
                <strong className="text-slate-900 block text-xs leading-none">{emergencyInfo?.chronicDiseases || 'Type 2 Diabetes, Severe Hypertension'}</strong>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 text-left">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Critical Active Medications</span>
                <strong className="text-slate-900 block text-xs leading-none">{emergencyInfo?.criticalMedications || 'Metformin hydrochloride'}</strong>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-550 uppercase font-mono block">Primary Emergency Contact Family Member</span>
                <strong className="text-slate-950 block text-xs leading-none">{emergencyInfo?.emergencyContactName || 'Fatma Jenkins (Relative)'}</strong>
              </div>
              <div className="space-y-1 select-all cursor-pointer">
                <span className="text-[10px] text-slate-550 uppercase font-mono block">Direct Dial Phone Link Contact</span>
                <strong className="text-sky-750 text-indigo-700 font-mono font-extrabold block text-xs leading-none">{emergencyInfo?.emergencyContactPhone || '+20 (102) 448-9901'}</strong>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/15 border border-amber-200 text-[11px] text-slate-700 p-4 rounded-xl leading-relaxed italic font-semibold">
            📝 Information listed on this panel is verified using formal Civil documentation and clinician assessments. Any modifications must be recorded under Egyptian clinical registry regulations with professional audit signatures.
          </div>
        </div>
      )}

      {/* ADD MEDICAL RECORD TAB */}
      {activeChartTab === 'add_record' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1 border-b pb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase">Add Medical Record Documentation</h3>
            <p className="text-xs text-slate-500">File a legal diagnostic encounter report. Nile Health system audit logs will capture clinical metadata automatically.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const recordId = 'rec-' + Math.floor(1000 + Math.random() * 9000);
              
              const record: MedicalRecord = {
                id: recordId,
                patientId: activePatientObj.id,
                doctorId: doctorUser.id,
                doctorName: doctorUser.fullName,
                date: visitDate,
                chiefComplaint: chiefComplaint.trim(),
                diagnosis: diagnosis.trim(),
                treatmentPlan: treatmentPlan.trim(),
                notes: notes.trim()
              };

              // Save encounter
              onAddMedicalRecord(record);

              // If nested prescription is checklist checked:
              if (optIncludeRx && optRxMed.trim()) {
                const rx: Prescription = {
                  id: 'rx-' + Math.floor(1000 + Math.random() * 9000),
                  patientId: activePatientObj.id,
                  doctorId: doctorUser.id,
                  doctorName: doctorUser.fullName,
                  date: visitDate,
                  medicationName: optRxMed.trim(),
                  dosage: optRxDosage.trim(),
                  instructions: optRxInstructions.trim() + ` (Encounter Ref: ${recordId})`,
                  duration: optRxDuration,
                  status: 'ACTIVE'
                };
                onAddPrescription(rx);
              }

              // If nested laboratory order is checked:
              if (optIncludeLab && optLabTest.trim()) {
                const lab: LabResult = {
                  id: 'lab-' + Math.floor(1000 + Math.random() * 9000),
                  patientId: activePatientObj.id,
                  doctorId: doctorUser.id,
                  date: visitDate,
                  testName: optLabTest.trim(),
                  result: 'PENDING RESULTS',
                  referenceRange: 'Normal biological range parameters',
                  status: 'PENDING',
                  notes: `Ordered during clinical visit: ${recordId}.`
                };
                onAddLabResult(lab);
              }

              // If nested radiology imaging report is checked:
              if (optIncludeRad && optRadScan.trim()) {
                const rad: RadiologyReport = {
                  id: 'rad-' + Math.floor(1000 + Math.random() * 9000),
                  patientId: activePatientObj.id,
                  doctorId: doctorUser.id,
                  date: visitDate,
                  scanType: optRadScan.trim(),
                  findings: 'PENDING SCAN DIAGNOSTICS',
                  clinicalImpression: 'Waiting for radiology technician acquisition study',
                  imageUrl: '',
                  status: 'PENDING',
                  notes: `Acquisition study order submitted during visit: ${recordId}.`
                };
                onAddRadiology(rad);
              }

              // Reset form fields
              setChiefComplaint('');
              setDiagnosis('');
              setTreatmentPlan('');
              setNotes('');
              setOptIncludeRx(false); setOptRxMed(''); setOptRxDosage(''); setOptRxInstructions('');
              setOptIncludeLab(false); setOptLabTest('');
              setOptIncludeRad(false); setOptRadScan('');

              triggerSuccessAlert('Medical EMR encounter logged and diagnostic updates saved successfully!');
              setActiveChartTab('history');
            }}
            className="space-y-4 font-sans text-xs font-semibold"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">Encounter Date</label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="Primary clinical symptoms indicating active visit, e.g. acute dry cough"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">Clinician Diagnosis *</label>
                <textarea
                  required
                  placeholder="Document active clinical diagnosis or suspected medical conditions..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg h-24 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">Treatment Plan & Guidelines *</label>
                <textarea
                  required
                  placeholder="Describe pharmacological treatments, lifestyle guidelines, or rehabilitation schedules..."
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg h-24 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">Clinician Intramural Notes & Audit details</label>
              <textarea
                placeholder="Log secondary comments, physical inspection parameters, or administrative annotations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-slate-200 p-2.5 rounded-lg h-16 outline-none"
              />
            </div>

            {/* NESTED SUB-WORKFLOW ORDERS */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Linked Pharmaceutical & Diagnostic Orders (Optional)</h4>

              {/* Toggle Rx */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setOptIncludeRx(!optIncludeRx)}
                  className={`flex items-center gap-2.5 p-3 w-full rounded-xl border text-left cursor-pointer transition-all ${
                    optIncludeRx
                      ? 'border-pink-300 bg-pink-50/15'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={optIncludeRx}
                    onChange={() => {}} // Controlled by wrapper button click
                    className="h-4.5 w-4.5 rounded text-pink-550 accent-pink-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900 leading-none">Prescribe Active Medication Medication</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 leading-none">Generate a linked pharmaceutical prescription automatically</span>
                  </div>
                </button>

                {optIncludeRx && (
                  <div className="p-4 border border-pink-100 bg-pink-50/10 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-pink-700 uppercase text-[9px] font-mono mb-1">Medication Name</label>
                      <input
                        type="text"
                        placeholder="Type name, e.g. Lisinopril 10mg"
                        value={optRxMed}
                        onChange={(e) => setOptRxMed(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-pink-700 uppercase text-[9px] font-mono mb-1">Dosage instructs</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 tablet daily after lunch"
                        value={optRxDosage}
                        onChange={(e) => setOptRxDosage(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-pink-700 uppercase text-[9px] font-mono mb-1">Administration instructions</label>
                      <input
                        type="text"
                        placeholder="e.g. Take with water, swallow whole"
                        value={optRxInstructions}
                        onChange={(e) => setOptRxInstructions(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-pink-700 uppercase text-[9px] font-mono mb-1">Duration limits</label>
                      <select
                        value={optRxDuration}
                        onChange={(e) => setOptRxDuration(e.target.value)}
                        className="w-full bg-white border border-slate-250 p-2.5 rounded-lg outline-none cursor-pointer"
                      >
                        <option value="5 Days">5 Days</option>
                        <option value="7 Days">7 Days</option>
                        <option value="14 Days">14 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="90 Days">90 Days</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle Lab Specimen */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setOptIncludeLab(!optIncludeLab)}
                  className={`flex items-center gap-2.5 p-3 w-full rounded-xl border text-left cursor-pointer transition-all ${
                    optIncludeLab
                      ? 'border-amber-300 bg-amber-50/15'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={optIncludeLab}
                    onChange={() => {}} // Controlled by button
                    className="h-4.5 w-4.5 rounded text-amber-500 accent-amber-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900 leading-none">Order Specimen Laboratory Assay Order</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 leading-none">Generate a pending clinical pathology order panel</span>
                  </div>
                </button>

                {optIncludeLab && (
                  <div className="p-4 border border-amber-100 bg-amber-50/10 rounded-xl text-xs font-semibold animate-in slide-in-from-top-2">
                    <label className="block text-amber-700 uppercase text-[9px] font-mono mb-1">Laboratory Test / Panel name</label>
                    <input
                      type="text"
                      placeholder="e.g. Complete Blood Count (CBC) or Liver Function Panel"
                      value={optLabTest}
                      onChange={(e) => setOptLabTest(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Toggle Radiology study */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setOptIncludeRad(!optIncludeRad)}
                  className={`flex items-center gap-2.5 p-3 w-full rounded-xl border text-left cursor-pointer transition-all ${
                    optIncludeRad
                      ? 'border-purple-300 bg-purple-50/15'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={optIncludeRad}
                    onChange={() => {}} // Controlled by button
                    className="h-4.5 w-4.5 rounded text-purple-500 accent-purple-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900 leading-none">Submit Radiology Imaging scan study</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 leading-none">Generate a tomographical CT / MRI / X-Ray study order</span>
                  </div>
                </button>

                {optIncludeRad && (
                  <div className="p-4 border border-purple-100 bg-purple-50/10 rounded-xl text-xs font-semibold animate-in slide-in-from-top-2">
                    <label className="block text-purple-700 uppercase text-[9px] font-mono mb-1">Imaging study / Scan Type name</label>
                    <input
                      type="text"
                      placeholder="e.g. High-Resolution Chest CT Scan"
                      value={optRadScan}
                      onChange={(e) => setOptRadScan(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl uppercase font-black tracking-wider transition-colors shadow-3xs cursor-pointer"
              >
                Save Medical Record
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
