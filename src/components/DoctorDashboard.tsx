import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  User as UserIcon,
  Search,
  Settings,
  Calendar,
  Plus,
  Save,
  Clock,
  Check,
  AlertCircle,
  RefreshCw,
  X,
  Camera,
  Heart,
  UserCheck,
  ShieldCheck,
  Building,
  Phone,
  Award,
  ClipboardList,
  Sparkles,
  FileText,
  CheckCircle2,
  QrCode,
  Pill,
  FlaskConical,
  Image as ImageIcon,
  AlertTriangle,
  Upload,
  ArrowLeft,
  Stethoscope,
  ChevronRight,
  Printer
} from 'lucide-react';
import { User, EmergencyInfo, MedicalRecord, Prescription, LabResult, RadiologyReport, MedicationItem, LabParameter, RadiologySection, LabField, LabReportTemplate } from '../types';
import jsQR from 'jsqr';
import { saveDocument } from '../lib/firestoreService';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';

interface DoctorDashboardProps {
  doctorUser: User;
  patients: User[];
  emergencyRecords: Record<string, EmergencyInfo>;
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  labResults: LabResult[];
  radiologyReports: RadiologyReport[];
  onAddMedicalRecord: (rec: MedicalRecord) => void;
  onAddPrescription: (rx: Prescription) => void;
  onAddLabResult: (lab: LabResult) => void;
  onAddRadiology: (rad: RadiologyReport) => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  onUpdateUserProfile: (userId: string, updatedFields: Partial<User>) => void;
  professionalRequests?: any;
  institutions?: any;
  onRequestProfessionalUpdate?: any;
}

export default function DoctorDashboard({
  doctorUser,
  patients,
  emergencyRecords,
  medicalRecords,
  prescriptions,
  labResults,
  radiologyReports,
  onAddMedicalRecord,
  onAddPrescription,
  onAddLabResult,
  onAddRadiology,
  activeSection,
  onSectionChange,
  onLogout,
  onUpdateUserProfile,
  professionalRequests,
  institutions,
  onRequestProfessionalUpdate
}: DoctorDashboardProps) {
  // Common state
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Profile Edit fields
  const [profilePhone, setProfilePhone] = useState(doctorUser.phoneNumber || '');
  const [profileHours, setProfileHours] = useState(doctorUser.consultationHours || '09:00 - 17:00');
  const [bioText, setBioText] = useState(doctorUser.bio || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Expanded Doctor Profile fields
  const [profileFullName, setProfileFullName] = useState(doctorUser.fullName || '');
  const [profileSpecialty, setProfileSpecialty] = useState(doctorUser.specialty || 'General Internist');
  const [profileLicenseNumber, setProfileLicenseNumber] = useState(doctorUser.licenseNumber || 'DOC-48909');
  const [profileInstitution, setProfileInstitution] = useState(doctorUser.institution || 'Moustafa Kamel Military Hospital');

  // Specialty Change Request Form State
  const [reqSpecialty, setReqSpecialty] = useState('');
  const [specialtyReason, setSpecialtyReason] = useState('');
  const [specialtySuccessMsg, setSpecialtySuccessMsg] = useState('');

  // Institution Transfer Request Form State
  const [reqInstitution, setReqInstitution] = useState('');
  const [institutionReason, setInstitutionReason] = useState('');
  const [institutionSuccessMsg, setInstitutionSuccessMsg] = useState('');

  // 1. Visit Form State
  const [vPatientId, setVPatientId] = useState('');
  const [vType, setVType] = useState('Outpatient');
  const [vComplaint, setVComplaint] = useState('');
  const [vDiagnosis, setVDiagnosis] = useState('');
  const [vIcd10, setVIcd10] = useState('');
  const [vBP, setVBP] = useState('');
  const [vHR, setVHR] = useState('');
  const [vTemp, setVTemp] = useState('');
  const [vRR, setVRR] = useState('');
  const [vO2, setVO2] = useState('');
  const [vSubjective, setVSubjective] = useState('');
  const [vObjective, setVObjective] = useState('');
  const [vAssessment, setVAssessment] = useState('');
  const [vPlan, setVPlan] = useState('');
  const [vFollowUp, setVFollowUp] = useState('');
  const [vSuccess, setVSuccess] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<MedicalRecord | null>(null);

  // 2. Prescription Form State
  const [pPatientId, setPPatientId] = useState('');
  const [pDiagnosis, setPDiagnosis] = useState('');
  const [pMedName, setPMedName] = useState('');
  const [pStrength, setPStrength] = useState('');
  const [pFrequency, setPFrequency] = useState('Once daily');
  const [pRoute, setPRoute] = useState('Oral');
  const [pDuration, setPDuration] = useState('7 Days');
  const [pInstructions, setPInstructions] = useState('');
  const [pSuccess, setPSuccess] = useState(false);

  // 3. Lab Results Form State
  const [lPatientId, setLPatientId] = useState('');
  const [lSuccess, setLSuccess] = useState(false);

  // Dynamic Lab Report Fields and Values
  const [lFields, setLFields] = useState<LabField[]>([]);
  const [labValues, setLabValues] = useState<Record<string, any>>({});

  // Field Management & Template UI State
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'textarea' | 'date' | 'select' | 'checkbox'>('text');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);

  // 4. Radiology Form State
  const [rPatientId, setRPatientId] = useState('');
  const [rStudyType, setRStudyType] = useState('Chest X-Ray');
  const [rBodyPart, setRBodyPart] = useState('Chest');
  const [rFindings, setRFindings] = useState('');
  const [rImpression, setRImpression] = useState('');
  const [rRecommendations, setRRecommendations] = useState('');
  const [rImageUrl, setRImageUrl] = useState('https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=400');
  const [rSuccess, setRSuccess] = useState(false);

  // Age helper
  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A';
    try {
      const birthYear = parseInt(dob.split('-')[0]);
      return `${new Date().getFullYear() - birthYear} Yrs`;
    } catch {
      return 'N/A';
    }
  };

  // Default fallback template fields
  const DEFAULT_INITIAL_LAB_FIELDS: LabField[] = [
    { id: 'test_name', label: 'Test Name', placeholder: 'Complete Blood Count, Lipid Panel', fieldType: 'text', required: true, order: 1 },
    { id: 'hemoglobin', label: 'Hemoglobin (g/dL)', placeholder: '14.2', fieldType: 'number', required: false, order: 2 },
    { id: 'wbc', label: 'WBC (x10^3/uL)', placeholder: '6.5', fieldType: 'number', required: false, order: 3 },
    { id: 'rbc', label: 'RBC (x10^6/uL)', placeholder: '4.8', fieldType: 'number', required: false, order: 4 },
    { id: 'platelets', label: 'Platelets (x10^3/uL)', placeholder: '250', fieldType: 'number', required: false, order: 5 },
    { id: 'glucose', label: 'Glucose (mg/dL)', placeholder: '95', fieldType: 'number', required: false, order: 6 },
    { id: 'cholesterol', label: 'Cholesterol (mg/dL)', placeholder: '185', fieldType: 'number', required: false, order: 7 },
    { id: 'reference_range', label: 'Reference Range', placeholder: 'Hgb: 13.8-17.2, WBC: 4.5-11.0', fieldType: 'text', required: false, order: 8 },
    { id: 'interpretation', label: 'Interpretation', placeholder: 'e.g. Hematology bounds within healthy limits.', fieldType: 'textarea', required: false, order: 9 },
    { id: 'notes', label: 'Clinical Notes', placeholder: 'Any other outpatient notes...', fieldType: 'textarea', required: false, order: 10 }
  ];

  // Load Template scoped by doctorId
  useEffect(() => {
    if (activeSection === 'labs' && doctorUser?.id) {
      const fetchTemplate = async () => {
        setIsLoadingTemplate(true);
        try {
          const q = query(
            collection(db, 'labReportTemplates'),
            where('doctorId', '==', doctorUser.id)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const docData = snap.docs[0].data() as LabReportTemplate;
            const sortedFields = [...docData.fields].sort((a, b) => a.order - b.order);
            setLFields(sortedFields);
          } else {
            const sortedFields = [...DEFAULT_INITIAL_LAB_FIELDS].sort((a, b) => a.order - b.order);
            setLFields(sortedFields);
          }
        } catch (err) {
          console.warn('Failed to load lab template from firestore:', err);
          setLFields([...DEFAULT_INITIAL_LAB_FIELDS].sort((a, b) => a.order - b.order));
        } finally {
          setIsLoadingTemplate(false);
        }
      };
      fetchTemplate();
    }
  }, [activeSection, doctorUser?.id]);

  // Persist template structure
  const saveTemplateToFirestore = async (updatedFields: LabField[]) => {
    if (!doctorUser?.id) return;
    const templateId = `tpl-${doctorUser.id}`;
    const templateObj: LabReportTemplate = {
      id: templateId,
      doctorId: doctorUser.id,
      fields: updatedFields,
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'labReportTemplates', templateId), templateObj);
      console.log('Template saved successfully!');
    } catch (err) {
      console.error('Failed to save lab report template:', err);
    }
  };

  const handleAddField = () => {
    if (!newFieldLabel.trim()) return alert('Please enter a field label.');
    const fieldId = 'fld_' + Date.now();
    const nextOrder = lFields.length > 0 ? Math.max(...lFields.map(f => f.order)) + 1 : 1;
    const newField: LabField = {
      id: fieldId,
      label: newFieldLabel.trim(),
      placeholder: newFieldPlaceholder.trim(),
      fieldType: newFieldType,
      required: newFieldRequired,
      order: nextOrder
    };
    const updated = [...lFields, newField];
    setLFields(updated);
    saveTemplateToFirestore(updated);
    
    setNewFieldLabel('');
    setNewFieldPlaceholder('');
    setNewFieldType('text');
    setNewFieldRequired(false);
  };

  const handleDeleteField = (fieldId: string) => {
    const updated = lFields.filter(f => f.id !== fieldId);
    setLFields(updated);
    saveTemplateToFirestore(updated);
    setLabValues(prev => {
      const copy = { ...prev };
      delete copy[fieldId];
      return copy;
    });
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === lFields.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...lFields];
    
    const tempOrder = updated[index].order;
    updated[index].order = updated[targetIndex].order;
    updated[targetIndex].order = tempOrder;

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setLFields(sorted(updated));
  };

  const sorted = (fields: LabField[]) => {
    return [...fields].sort((a, b) => a.order - b.order);
  };

  // Sync active patient to patient selectors
  useEffect(() => {
    const target = selectedPatientId || (patients.length > 0 ? patients[0].id : '');
    setVPatientId(target);
    setPPatientId(target);
    setLPatientId(target);
    setRPatientId(target);
  }, [selectedPatientId, patients]);

  // Manage camera scanning on section change
  useEffect(() => {
    if (activeSection === 'qr_scan') {
      startCameraScan();
    } else {
      stopCameraScan();
    }
    return () => {
      stopCameraScan();
    };
  }, [activeSection]);

  // Sync active doctorUser back to state on update
  useEffect(() => {
    setProfilePhone(doctorUser.phoneNumber || '');
    setProfileHours(doctorUser.consultationHours || '09:00 - 17:00');
    setBioText(doctorUser.bio || '');
    setProfileFullName(doctorUser.fullName || '');
    setProfileSpecialty(doctorUser.specialty || 'General Internist');
    setProfileLicenseNumber(doctorUser.licenseNumber || 'DOC-48909');
    setProfileInstitution(doctorUser.institution || 'Moustafa Kamel Military Hospital');
  }, [doctorUser]);

  // Multiple Medications State
  const [pMedicationsList, setPMedicationsList] = useState<MedicationItem[]>([]);
  const [currMedId, setCurrMedId] = useState<string | null>(null);
  const [currMedName, setCurrMedName] = useState('');
  const [currMedStrength, setCurrMedStrength] = useState('');
  const [currMedFrequency, setCurrMedFrequency] = useState('Once daily');
  const [currMedRoute, setCurrMedRoute] = useState('Oral');
  const [currMedDuration, setCurrMedDuration] = useState('7 Days');
  const [currMedInstructions, setCurrMedInstructions] = useState('');

  // Dynamic Lab Parameters State
  const [lParametersList, setLParametersList] = useState<LabParameter[]>([]);
  const [currParamId, setCurrParamId] = useState<string | null>(null);
  const [currParamName, setCurrParamName] = useState('');
  const [currParamResult, setCurrParamResult] = useState('');
  const [currParamRef, setCurrParamRef] = useState('');

  // Dynamic Radiology Sections State
  const [rSectionsList, setRSectionsList] = useState<RadiologySection[]>([]);
  const [currSectId, setCurrSectId] = useState<string | null>(null);
  const [currSectLabel, setCurrSectLabel] = useState('');
  const [currSectContent, setCurrSectContent] = useState('');

  // Medications sub-form handlers
  const handleAddMedicationToList = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!currMedName.trim() || !currMedStrength.trim()) {
      return alert('Medication Name and Strength are required.');
    }
    if (currMedId) {
      setPMedicationsList(prev =>
        prev.map(m =>
          m.id === currMedId
            ? {
                id: currMedId,
                name: currMedName.trim(),
                dosage: currMedStrength.trim(),
                frequency: currMedFrequency,
                route: currMedRoute,
                duration: currMedDuration,
                instructions: currMedInstructions.trim(),
              }
            : m
        )
      );
      setCurrMedId(null);
    } else {
      const newItem: MedicationItem = {
        id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: currMedName.trim(),
        dosage: currMedStrength.trim(),
        frequency: currMedFrequency,
        route: currMedRoute,
        duration: currMedDuration,
        instructions: currMedInstructions.trim(),
      };
      setPMedicationsList(prev => [...prev, newItem]);
    }
    setCurrMedName('');
    setCurrMedStrength('');
    setCurrMedFrequency('Once daily');
    setCurrMedRoute('Oral');
    setCurrMedDuration('7 Days');
    setCurrMedInstructions('');
  };

  const handleEditMedicationInList = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const item = pMedicationsList.find(m => m.id === id);
    if (item) {
      setCurrMedId(item.id);
      setCurrMedName(item.name);
      setCurrMedStrength(item.dosage);
      setCurrMedFrequency(item.frequency);
      setCurrMedRoute(item.route);
      setCurrMedDuration(item.duration);
      setCurrMedInstructions(item.instructions);
    }
  };

  const handleRemoveMedicationFromList = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setPMedicationsList(prev => prev.filter(m => m.id !== id));
    if (currMedId === id) {
      setCurrMedId(null);
      setCurrMedName('');
      setCurrMedStrength('');
      setCurrMedFrequency('Once daily');
      setCurrMedRoute('Oral');
      setCurrMedDuration('7 Days');
      setCurrMedInstructions('');
    }
  };

  // Lab parameters sub-form handlers
  const handleAddParameterToList = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!currParamName.trim() || !currParamResult.trim()) {
      return alert('Parameter Name and Result are required.');
    }
    if (currParamId) {
      setLParametersList(prev =>
        prev.map(p =>
          p.id === currParamId
            ? {
                id: currParamId,
                name: currParamName.trim(),
                result: currParamResult.trim(),
                referenceRange: currParamRef.trim(),
              }
            : p
        )
      );
      setCurrParamId(null);
    } else {
      const newItem: LabParameter = {
        id: `param-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: currParamName.trim(),
        result: currParamResult.trim(),
        referenceRange: currParamRef.trim(),
      };
      setLParametersList(prev => [...prev, newItem]);
    }
    setCurrParamName('');
    setCurrParamResult('');
    setCurrParamRef('');
  };

  const handleEditParameterInList = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const item = lParametersList.find(p => p.id === id);
    if (item) {
      setCurrParamId(item.id);
      setCurrParamName(item.name);
      setCurrParamResult(item.result);
      setCurrParamRef(item.referenceRange);
    }
  };

  const handleRemoveParameterFromList = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setLParametersList(prev => prev.filter(p => p.id !== id));
    if (currParamId === id) {
      setCurrParamId(null);
      setCurrParamName('');
      setCurrParamResult('');
      setCurrParamRef('');
    }
  };

  // Radiology sections sub-form handlers
  const handleAddSectionToList = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!currSectLabel.trim() || !currSectContent.trim()) {
      return alert('Section Label and Content are required.');
    }
    if (currSectId) {
      setRSectionsList(prev =>
        prev.map(s =>
          s.id === currSectId
            ? {
                id: currSectId,
                label: currSectLabel.trim(),
                content: currSectContent.trim(),
              }
            : s
        )
      );
      setCurrSectId(null);
    } else {
      const newItem: RadiologySection = {
        id: `sect-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        label: currSectLabel.trim(),
        content: currSectContent.trim(),
      };
      setRSectionsList(prev => [...prev, newItem]);
    }
    setCurrSectLabel('');
    setCurrSectContent('');
  };

  const handleEditSectionInList = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const item = rSectionsList.find(s => s.id === id);
    if (item) {
      setCurrSectId(item.id);
      setCurrSectLabel(item.label);
      setCurrSectContent(item.content);
    }
  };

  const handleRemoveSectionFromList = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setRSectionsList(prev => prev.filter(s => s.id !== id));
    if (currSectId === id) {
      setCurrSectId(null);
      setCurrSectLabel('');
      setCurrSectContent('');
    }
  };

  // Profile update handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFields = {
      fullName: profileFullName,
      specialty: profileSpecialty,
      licenseNumber: profileLicenseNumber,
      institution: profileInstitution,
      phoneNumber: profilePhone,
      consultationHours: profileHours,
      bio: bioText,
    };

    onUpdateUserProfile(doctorUser.id, updatedFields);

    try {
      await saveDocument("users", doctorUser.id, updatedFields);
      setProfileSuccessMsg('Professional profile successfully updated!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save profile changes to Firestore:', err);
    }
  };

  // Submit Specialty Change Request
  const handleSpecialtyRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSpecialty.trim()) return;

    const newReq = {
      id: `req_spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: doctorUser.id,
      userEmail: doctorUser.email,
      userName: doctorUser.fullName,
      currentSpecialty: doctorUser.specialty || 'General Internist',
      requestedSpecialty: reqSpecialty.trim(),
      currentLicenseNumber: doctorUser.licenseNumber || 'DOC-48909',
      requestedLicenseNumber: doctorUser.licenseNumber || 'DOC-48909',
      status: 'PENDING' as const,
      date: new Date().toISOString().split('T')[0],
      reason: specialtyReason.trim(),
    };

    try {
      if (onRequestProfessionalUpdate) {
        onRequestProfessionalUpdate(newReq);
      }
      await saveDocument('professionalRequests', newReq.id, newReq);
      setSpecialtySuccessMsg('Specialty change request submitted successfully!');
      setReqSpecialty('');
      setSpecialtyReason('');
      setTimeout(() => setSpecialtySuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to submit specialty request to Firestore:', err);
    }
  };

  // Submit Institution Transfer Request
  const handleInstitutionRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqInstitution.trim()) return;

    const newReq = {
      id: `req_inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: doctorUser.id,
      userEmail: doctorUser.email,
      userName: doctorUser.fullName,
      currentSpecialty: doctorUser.specialty || 'General Internist',
      requestedSpecialty: doctorUser.specialty || 'General Internist',
      currentLicenseNumber: doctorUser.licenseNumber || 'DOC-48909',
      requestedLicenseNumber: doctorUser.licenseNumber || 'DOC-48909',
      requestedHospital: reqInstitution.trim(),
      status: 'PENDING' as const,
      date: new Date().toISOString().split('T')[0],
      reason: institutionReason.trim(),
    };

    try {
      if (onRequestProfessionalUpdate) {
        onRequestProfessionalUpdate(newReq);
      }
      await saveDocument('professionalRequests', newReq.id, newReq);
      setInstitutionSuccessMsg('Institution transfer request submitted successfully!');
      setReqInstitution('');
      setInstitutionReason('');
      setTimeout(() => setInstitutionSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to submit institution relocation request to Firestore:', err);
    }
  };

  // 1. Visit Form Submit
  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vPatientId) return alert('Select patient');
    const pat = patients.find(p => p.id === vPatientId);
    const dateStr = new Date().toISOString().split('T')[0];
    const newVisit: MedicalRecord = {
      id: `visit-man-${Date.now()}`,
      patientId: vPatientId,
      doctorId: doctorUser.id,
      doctorName: doctorUser.fullName,
      date: dateStr,
      type: 'visit',
      patientName: pat?.fullName || 'Unknown Patient',
      medicalId: pat?.medicalId || 'MID',
      age: pat?.dateOfBirth ? calculateAge(pat.dateOfBirth) : 'N/A',
      gender: pat?.gender || 'N/A',
      visitType: vType,
      chiefComplaint: vComplaint || 'Clinical evaluation visit',
      diagnosis: vDiagnosis,
      treatmentPlan: vPlan || 'Check prescription records.',
      notes: vSubjective || `Manual visit notes on ${dateStr}.`,
      icd10: vIcd10,
      bloodPressure: vBP,
      heartRate: vHR,
      temperature: vTemp,
      respiratoryRate: vRR,
      oxygenSaturation: vO2,
      subjective: vSubjective,
      objective: vObjective,
      assessment: vAssessment,
      plan: vPlan,
      followUpDate: vFollowUp,
      signature: doctorUser.fullName
    };
    onAddMedicalRecord(newVisit);
    setVSuccess(true);
    setVComplaint('');
    setVDiagnosis('');
    setVIcd10('');
    setVBP('');
    setVHR('');
    setVTemp('');
    setVRR('');
    setVO2('');
    setVSubjective('');
    setVObjective('');
    setVAssessment('');
    setVPlan('');
    setTimeout(() => setVSuccess(false), 3000);
  };

  // 2. Prescription Form Submit
  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pPatientId) return alert('Select patient');
    
    let medsToSend = [...pMedicationsList];
    if (medsToSend.length === 0 && currMedName.trim() && currMedStrength.trim()) {
      medsToSend.push({
        id: `med-${Date.now()}`,
        name: currMedName.trim(),
        dosage: currMedStrength.trim(),
        frequency: currMedFrequency,
        route: currMedRoute,
        duration: currMedDuration,
        instructions: currMedInstructions.trim()
      });
    }
    if (medsToSend.length === 0) {
      return alert('Required: Add at least one medication to write recipe.');
    }
    
    const dateStr = new Date().toISOString().split('T')[0];
    const medicationName = medsToSend.map(m => m.name).join(', ');
    const dosage = medsToSend.map(m => m.dosage).join(', ');
    const instructions = medsToSend.map(m => `${m.name}: ${m.instructions}`).join(' | ');

    const rx: Prescription = {
      id: `rx-${Date.now()}`,
      patientId: pPatientId,
      doctorId: doctorUser.id,
      doctorName: doctorUser.fullName,
      date: dateStr,
      medicationName,
      dosage,
      instructions,
      duration: medsToSend[0].duration,
      status: 'ACTIVE',
      diagnosis: pDiagnosis || 'General therapeutic intervention plan',
      frequency: medsToSend[0].frequency,
      route: medsToSend[0].route,
      medications: medsToSend
    };

    onAddPrescription(rx);
    setPSuccess(true);
    setPMedName('');
    setPStrength('');
    setPInstructions('');
    setPDiagnosis('');
    setPMedicationsList([]);
    setCurrMedId(null);
    setTimeout(() => setPSuccess(false), 3000);
  };

  // 3. Lab Submit
  const handleLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lPatientId) return alert('Please select a patient.');

    // Find if there's a field with label containing 'test name' or ID 'test_name'
    const testNameField = lFields.find(f => f.id === 'test_name' || f.label.toLowerCase().includes('test name'));
    const testNameVal = testNameField ? labValues[testNameField.id] : '';
    const finalTestName = testNameVal || 'General Pathology Assay';

    // We can also extract notes, interpretation, and ranges for visit compatibility
    const notesField = lFields.find(f => f.id === 'notes' || f.label.toLowerCase().includes('notes') || f.label.toLowerCase().replace(/[^a-z]/g, '').includes('clinicalnotes'));
    const notesVal = notesField ? labValues[notesField.id] : '';

    const interpretationField = lFields.find(f => f.id === 'interpretation' || f.label.toLowerCase().includes('interpretation'));
    const interpretationVal = interpretationField ? labValues[interpretationField.id] : '';

    const refRangeField = lFields.find(f => f.id === 'reference_range' || f.label.toLowerCase().includes('reference range') || f.label.toLowerCase().replace(/[^a-z]/g, '').includes('referencerange'));
    const refRangeVal = refRangeField ? labValues[refRangeField.id] : '';

    const dateStr = new Date().toISOString().split('T')[0];

    // Detect status from options filled
    let finalStatus: 'NORMAL' | 'ABNORMAL' | 'CRITICAL' | 'PENDING' = 'NORMAL';
    const checkString = JSON.stringify(labValues).toLowerCase();
    if (checkString.includes('critical')) {
      finalStatus = 'CRITICAL';
    } else if (checkString.includes('abnormal')) {
      finalStatus = 'ABNORMAL';
    }

    // Keep optional legacy values populated to ensure backward compatibility as needed
    const getVal = (idOrLabel: string) => {
      const field = lFields.find(f => f.id === idOrLabel || f.label.toLowerCase().replace(/[^a-z]/g, '').includes(idOrLabel));
      return field ? String(labValues[field.id] || '') : '';
    };

    const lab: LabResult = {
      id: `lab-${Date.now()}`,
      patientId: lPatientId,
      doctorId: doctorUser.id,
      doctorName: doctorUser.fullName,
      testName: finalTestName,
      date: dateStr,
      result: `Dynamic Lab Report Builder Result with ${lFields.length} active parameters.`,
      referenceRange: refRangeVal || 'See individual parameters',
      status: finalStatus,
      notes: notesVal || 'Laboratory records saved successfully.',
      interpretation: interpretationVal || 'Assay study within dynamic boundaries.',
      labValues: labValues,
      labFieldsSnapshot: lFields.map(({ id, label, fieldType, required, order }) => ({ id, label, fieldType, required, order })),
      createdAt: new Date().toISOString(),
      hemoglobin: getVal('hemoglobin'),
      wbc: getVal('wbc'),
      rbc: getVal('rbc'),
      platelets: getVal('platelets'),
      glucose: getVal('glucose'),
      cholesterol: getVal('cholesterol')
    };

    onAddLabResult(lab);
    setLSuccess(true);
    setLabValues({});
    setTimeout(() => setLSuccess(false), 3000);
  };

  // 4. Radiology Submit
  const handleRadiologySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rPatientId || !rStudyType || !rFindings) return alert('Fill fields');
    const dateStr = new Date().toISOString().split('T')[0];
    const rad: RadiologyReport = {
      id: `rad-${Date.now()}`,
      patientId: rPatientId,
      doctorId: doctorUser.id,
      doctorName: doctorUser.fullName,
      date: dateStr,
      scanType: rStudyType,
      studyType: rStudyType,
      bodyPart: rBodyPart,
      findings: rFindings,
      clinicalImpression: rImpression,
      impression: rImpression,
      recommendations: rRecommendations,
      imageUrl: rImageUrl,
      status: 'NORMAL',
      notes: rFindings,
      sections: rSectionsList
    };
    onAddRadiology(rad);
    setRSuccess(true);
    setRFindings('');
    setRImpression('');
    setRRecommendations('');
    setRSectionsList([]);
    setCurrSectId(null);
    setTimeout(() => setRSuccess(false), 3000);
  };

  const tickScanner = () => {
    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });
        if (code && code.data) {
          const cleanId = code.data.trim();
          const match = patients.find(p => p.medicalId === cleanId || p.id === cleanId);
          
          // Turn off camera scanner immediately, whether the patient matches/exists or not
          stopCameraScan();
          
          if (match) {
            setSelectedPatientId(match.id);
            onSectionChange('search');
            alert(`✓ EMR Badge Scanned: Certified context parsed for ${match.fullName}`);
          } else {
            alert(`Scanned Medical Code: "${cleanId}" did not match any active patient record.`);
          }
          return;
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickScanner);
  };

  // Camera QR Code scanner triggers
  const startCameraScan = async () => {
    setScanError(null);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        animationFrameRef.current = requestAnimationFrame(tickScanner);
      }
    } catch (err) {
      setScanError('Unable to access camera stream. Please guarantee camera permissions.');
      setIsScanning(false);
    }
  };

  const stopCameraScan = () => {
    setIsScanning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="font-sans text-slate-700 min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* 1. DASHBOARD PAGE */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/85 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold shrink-0">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-950">{doctorUser.fullName}</h1>
                <p className="text-xs text-slate-550">{doctorUser.specialty} • Nile Health Network EHR</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onSectionChange('search')} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
                Search Patients
              </button>
              <button onClick={() => { onSectionChange('qr_scan'); startCameraScan(); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold rounded-xl cursor-pointer">
                Scan QR Badge
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Patients</span>
              <p className="text-3xl font-black text-indigo-600 mt-1">{patients.length}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Visits</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">
                {medicalRecords.filter(r => r.type === 'visit').length}
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Prescriptions</span>
              <p className="text-3xl font-black text-pink-600 mt-1">{prescriptions.length}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pending Labs</span>
              <p className="text-3xl font-black text-amber-600 mt-1">
                {labResults.filter(l => l.status === 'PENDING').length}
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pending Radiology</span>
              <p className="text-3xl font-black text-purple-600 mt-1">
                {radiologyReports.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-4">Recent Clinical Activity (Chronological)</h3>
            <div className="divide-y divide-slate-100 font-medium text-xs space-y-3.5">
              {[
                ...medicalRecords.filter(m => m.type === 'visit').map(v => ({ type: 'Visit', date: v.date, patient: v.patientName || 'Patient', detail: v.diagnosis, doctor: v.doctorName, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' })),
                ...prescriptions.map(p => ({ type: 'Prescription', date: p.date, patient: patients.find(pat => pat.id === p.patientId)?.fullName || 'Patient', detail: `${p.medicationName} ${p.dosage}`, doctor: p.doctorName || 'Dr.', color: 'text-pink-600 bg-pink-50 border-pink-100' })),
                ...labResults.map(l => ({ type: 'Lab Assay', date: l.date, patient: patients.find(pat => pat.id === l.patientId)?.fullName || 'Patient', detail: l.testName, doctor: l.doctorName || 'Dr.', color: 'text-amber-600 bg-amber-50 border-amber-100' })),
                ...radiologyReports.map(r => ({ type: 'Radiology Scan', date: r.date, patient: patients.find(pat => pat.id === r.patientId)?.fullName || 'Patient', detail: r.scanType, doctor: r.doctorName || 'Dr.', color: 'text-purple-600 bg-purple-50 border-purple-100' }))
              ]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 7)
                .map((act, i) => (
                  <div key={act.date + i} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 uppercase rounded-md text-[9px] font-black border ${act.color}`}>{act.type}</span>
                      <div>
                        <p className="font-bold text-slate-900">{act.patient}</p>
                        <p className="text-[11px] text-slate-450">{act.detail} • Signed by Dr. {act.doctor}</p>
                      </div>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px] font-bold shrink-0">{act.date}</span>
                  </div>
                ))}
              {patients.length === 0 && (
                <p className="text-center text-slate-400 py-6">No clinical actions registered yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Patient Page */}
      {activeSection === 'search' && (
        <div className="space-y-6 text-left animate-in fade-in duration-200">
          <div className="bg-white border rounded-2xl p-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">EHR Patient Registry Search</h2>
              <p className="text-xs text-slate-500 font-sans">Look up patient profiles by entering their Clinical Medical ID, Government National ID, or Full Name.</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-700">{patients.length} Registered Patients</span>
          </div>

          <div className="bg-white border border-slate-205 rounded-2xl p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Patient Name, Medical ID, or National ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="overflow-x-auto text-xs font-semibold">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b font-mono text-[9px] uppercase text-slate-400 font-bold">
                    <th className="p-3">Patient Name</th>
                    <th className="p-3">Medical ID</th>
                    <th className="p-3">National ID</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Age</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-655 font-bold">
                  {patients
                    .filter(p => {
                      const query = searchQuery.toLowerCase().trim();
                      if (!query) return true;
                      return (
                        (p.fullName || '').toLowerCase().includes(query) ||
                        (p.medicalId || '').toLowerCase().includes(query) ||
                        (p.nationalId || '').toLowerCase().includes(query) ||
                        (p.id || '').toLowerCase().includes(query)
                      );
                    })
                    .map((pat) => (
                      <tr
                        key={pat.id}
                        onClick={() => {
                          setSelectedPatientId(pat.id);
                          onSectionChange('records');
                        }}
                        className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                      >
                        <td className="p-3 font-extrabold text-slate-900">{pat.fullName}</td>
                        <td className="p-3 font-mono text-indigo-700">{pat.medicalId || 'N/A'}</td>
                        <td className="p-3 font-mono text-slate-500">{pat.nationalId || 'N/A'}</td>
                        <td className="p-3 uppercase text-slate-450">{pat.gender || 'Unknown'}</td>
                        <td className="p-3 font-mono">{pat.dateOfBirth ? calculateAge(pat.dateOfBirth) : 'N/A'}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatientId(pat.id);
                              onSectionChange('records');
                            }}
                            className="px-3 py-1 border hover:bg-slate-50 text-[10px] text-slate-650 uppercase rounded-lg"
                          >
                            Open Chart &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  {patients.filter(p => {
                    const query = searchQuery.toLowerCase().trim();
                    if (!query) return true;
                    return (
                      (p.fullName || '').toLowerCase().includes(query) ||
                      (p.medicalId || '').toLowerCase().includes(query) ||
                      (p.nationalId || '').toLowerCase().includes(query) ||
                      (p.id || '').toLowerCase().includes(query)
                    );
                  }).length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. VISITS PAGE */}
      {activeSection === 'visits' && (
        <div className="space-y-6 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">EHR Clinical Encounters</h2>
              <p className="text-xs text-slate-500">Log new outpatient triages and SOAP medical consults chronologically.</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-150 rounded-xl text-xs font-black text-indigo-700">{medicalRecords.filter(r => r.type === 'visit').length} Visits</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />
              <form onSubmit={handleVisitSubmit} className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-slate-400 pb-2 border-b">Encounter Creation Form</h3>
                {vSuccess && <p className="p-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border">✓ Signed clinical encounter registered!</p>}
                
                <div className="space-y-3.5 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] uppercase text-slate-450 mb-1">Select Patient Subject *</label>
                    <select value={vPatientId} onChange={(e) => setVPatientId(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold" required>
                      <option value="">-- Patient --</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.medicalId || p.id.slice(0, 5)})</option>)}
                    </select>
                  </div>

                  {vPatientId && (() => {
                    const activeP = patients.find(p => p.id === vPatientId);
                    return (
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500">
                        <p>ID: <span className="text-slate-800">{activeP?.medicalId || 'EHR-MID'}</span></p>
                        <p>Age/Sex: <span className="text-slate-800">{activeP?.dateOfBirth ? calculateAge(activeP.dateOfBirth) : 'N/A'} / {activeP?.gender || 'N/A'}</span></p>
                      </div>
                    );
                  })()}

                  <div>
                    <label className="block text-[10px] uppercase text-slate-455 mb-1">Visit Date</label>
                    <input type="text" value={new Date().toISOString().split('T')[0]} disabled className="w-full p-2 bg-slate-100 border rounded-lg font-bold font-mono text-slate-500" />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-slate-450 mb-1">Diagnosis *</label>
                    <input type="text" value={vDiagnosis} onChange={(e) => setVDiagnosis(e.target.value)} placeholder="Diagnosis (e.g., Acute Pharyngitis)" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-slate-450 mb-1">Treatment Plan *</label>
                    <textarea value={vPlan} onChange={(e) => setVPlan(e.target.value)} placeholder="State the recommended treatment plan, prescriptions, or dynamic procedures..." rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-slate-450 mb-1">Supplementary Notes *</label>
                    <textarea value={vSubjective} onChange={(e) => setVSubjective(e.target.value)} placeholder="Enter clinical consult notes, chief complaint details, history..." rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase text-slate-455 mb-1">Visit Type</label>
                      <select value={vType} onChange={(e) => setVType(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <option value="Outpatient">Outpatient</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Telemedicine">Telemedicine</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-slate-450 mb-1">Doctor Signature</label>
                      <input type="text" value={doctorUser.fullName} disabled className="w-full p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-bold font-mono" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer">
                  Publish Direct Visit
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs font-mono font-black uppercase text-slate-500">
                <span>EHR Visits Register Ledger</span>
                <span>Sorted count</span>
              </div>
              <div className="overflow-x-auto text-[11px] sm:text-xs flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b font-mono text-[9px] uppercase text-slate-400 font-bold">
                      <th className="p-3">Visit Date</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Visit Type</th>
                      <th className="p-3">Evaluation Diagnosis</th>
                      <th className="p-3">Attending Physician</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-650 font-bold">
                    {medicalRecords.filter(r => r.type === 'visit').map((m) => (
                      <tr key={m.id} onClick={() => setSelectedVisit(m)} className="hover:bg-indigo-50/40 cursor-pointer transition-colors">
                        <td className="p-3 font-mono text-slate-800">{m.date}</td>
                        <td className="p-3 text-indigo-700 font-extrabold">{m.patientName || 'Clinical Patient'}</td>
                        <td className="p-3 font-mono text-slate-400 uppercase">{m.visitType || 'Consultation'}</td>
                        <td className="p-3"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">{m.diagnosis}</span></td>
                        <td className="p-3 text-[10px] text-slate-500 whitespace-nowrap">Dr. {m.doctorName || doctorUser.fullName}</td>
                      </tr>
                    ))}
                    {medicalRecords.filter(r => r.type === 'visit').length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No registered EHR visits matched clinical cycles.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Visit Encounter Detail Overlay Modal */}
          {selectedVisit && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 text-left border relative">
                <button onClick={() => setSelectedVisit(null)} className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
                <div className="border-b pb-4 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-black tracking-widest text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded border">EHR Encounter Summary</span>
                  <h3 className="text-lg font-black text-slate-950 mt-1">{selectedVisit.patientName}</h3>
                  <p className="text-xs text-slate-450">MID: {selectedVisit.medicalId || 'MID-78940'} • Biological Age: {selectedVisit.age} • Age/Gender: {selectedVisit.gender}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 font-mono">Visit Information</span>
                    <p className="mt-1 font-bold text-slate-900">Type: {selectedVisit.visitType || 'Outpatient'}</p>
                    <p className="font-semibold text-slate-700">ICD-10 Code: {selectedVisit.icd10 || 'N/A'}</p>
                    <p className="font-semibold text-slate-700">Chief Complaint: "{selectedVisit.chiefComplaint}"</p>
                    <p className="font-black text-indigo-700 mt-1">Diagnosis Assessment: {selectedVisit.diagnosis}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border grid grid-cols-2 gap-1.5">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 font-mono col-span-2">Logged Vitals Triages</span>
                    <div>BP: <strong className="text-slate-900">{selectedVisit.bloodPressure || 'N/A'}</strong></div>
                    <div>Pulse: <strong className="text-slate-900">{selectedVisit.heartRate || 'N/A'} bpm</strong></div>
                    <div>Temp: <strong className="text-slate-900">{selectedVisit.temperature || 'N/A'} °C</strong></div>
                    <div>Resp Rate: <strong className="text-slate-900">{selectedVisit.respiratoryRate || 'N/A'}/min</strong></div>
                    <div className="col-span-2">O2 Saturation: <strong className="text-emerald-700">{selectedVisit.oxygenSaturation || 'N/A'}%</strong></div>
                  </div>
                </div>

                {/* SOAP Document */}
                <div className="space-y-3">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono">S.O.A.P. EHR Chart Notes</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                    <div className="p-3 bg-slate-50/50 rounded-lg border"><strong>S - Subjective:</strong> <span className="text-slate-600 italic">"{selectedVisit.subjective || 'No notes compiled'}"</span></div>
                    <div className="p-3 bg-slate-50/50 rounded-lg border"><strong>O - Objective:</strong> <span className="text-slate-600 italic">"{selectedVisit.objective || 'No notes compiled'}"</span></div>
                    <div className="p-3 bg-slate-50/50 rounded-lg border"><strong>A - Assessment:</strong> <span className="text-slate-600 italic">"{selectedVisit.assessment || 'No notes compiled'}"</span></div>
                    <div className="p-3 bg-slate-50/50 rounded-lg border"><strong>P - Plan:</strong> <span className="text-slate-600 italic">"{selectedVisit.plan || 'No notes compiled'}"</span></div>
                  </div>
                </div>

                {/* Related elements */}
                <div className="border-t pt-4 space-y-3.5 text-xs">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono">Related Diagnostics Linkage on same date ({selectedVisit.date})</span>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-xl flex justify-between items-center bg-pink-50/40">
                      <div>
                        <strong className="block font-black text-pink-700">Prescribed Pharmacotherapy</strong>
                        <p className="text-slate-500 font-medium">
                          {prescriptions.filter(p => p.patientId === selectedVisit.patientId && p.date === selectedVisit.date).map(p => `${p.medicationName} ${p.dosage} (${p.duration})`).join(', ') || 'No prescriptions mapped on this visit date.'}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 border rounded-xl flex justify-between items-center bg-amber-50/45">
                      <div>
                        <strong className="block font-black text-amber-700">Pathology Assays Results</strong>
                        <p className="text-slate-500 font-medium">
                          {labResults.filter(l => l.patientId === selectedVisit.patientId && l.date === selectedVisit.date).map(l => `${l.testName}: ${l.result}`).join(' | ') || 'No pathology records mapped on this visit date.'}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 border rounded-xl flex justify-between items-center bg-purple-50/40">
                      <div>
                        <strong className="block font-black text-purple-700">Radiology Imaging Reports</strong>
                        <div className="text-slate-500 font-medium">
                          {radiologyReports.filter(r => r.patientId === selectedVisit.patientId && r.date === selectedVisit.date).map(r => (
                            <div key={r.id}>
                              <p className="font-bold">{r.scanType} finding: {r.findings}</p>
                              {r.imageUrl && (
                                <div className="mt-1">
                                  <a 
                                    href={r.imageUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-sky-600 hover:text-sky-800 font-semibold break-all underline"
                                  >
                                    View Radiograph Link
                                  </a>
                                </div>
                              )}
                            </div>
                          )) || 'No radiology scans mapped on this visit date.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs pt-2">
                  <button onClick={() => window.print()} className="px-4 py-2 border border-slate-200 text-slate-705 font-bold uppercase rounded-xl flex items-center gap-1 cursor-pointer">
                    <Printer className="h-3.5 w-3.5" /> Printable Document Format
                  </button>
                  <button onClick={() => setSelectedVisit(null)} className="px-5 py-2 bg-slate-905 hover:bg-slate-850 bg-slate-900 border text-white font-bold uppercase rounded-xl cursor-pointer">
                    Dismiss EHR Summary
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. PRESCRIPTIONS PAGE */}
      {activeSection === 'prescriptions' && (
        <div className="space-y-6 text-left">
          <div className="bg-white border border-slate-205 rounded-2xl p-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">EHR Pharmacotherapy Formulation</h2>
              <p className="text-xs text-slate-500 font-sans">Author and sign virtual patient recipes. Writes a detailed medication record dynamically into EMR visits.</p>
            </div>
            <span className="px-3 py-1 bg-pink-50 border border-pink-100 rounded-xl text-xs font-black text-pink-700">{prescriptions.length} Signed Recipes</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-pink-500" />
              <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-slate-400 pb-2 border-b">EHR Clinical Rx Slip Pad</h3>
                {pSuccess && <p className="p-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border">✓ Recipe published and visit-record indexed!</p>}
                
                <div className="space-y-3.5 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] uppercase text-slate-450 mb-1">Select Patient subject *</label>
                    <select value={pPatientId} onChange={(e) => setPPatientId(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold cursor-pointer" required>
                      <option value="">-- Patient --</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.medicalId || p.id.slice(0, 5)})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-455 mb-1">Diagnosis context Link *</label>
                    <input type="text" value={pDiagnosis} onChange={(e) => setPDiagnosis(e.target.value)} placeholder="e.g. Chronic Hypertension" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>

                  {/* Medications sub-form panel */}
                  <div className="border border-pink-100 p-3 rounded-xl bg-pink-50/15 space-y-3">
                    <span className="block text-[10px] text-pink-700 uppercase font-bold tracking-wider">
                      {currMedId ? 'Edit Medication In Recipe' : 'Add Medication to Recipe'}
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase text-slate-400">Drug name</label>
                        <input type="text" value={currMedName} onChange={(e) => setCurrMedName(e.target.value)} placeholder="Amoxicillin" className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs" />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-slate-400">Strength/Dosage</label>
                        <input type="text" value={currMedStrength} onChange={(e) => setCurrMedStrength(e.target.value)} placeholder="500 mg" className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="block text-[9px] uppercase text-slate-400">Frequency</label>
                        <input type="text" value={currMedFrequency} onChange={(e) => setCurrMedFrequency(e.target.value)} className="w-full p-1 bg-white border border-slate-200 rounded text-xs" />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-slate-400">Route</label>
                        <select value={currMedRoute} onChange={(e) => setCurrMedRoute(e.target.value)} className="w-full p-1 bg-white border border-slate-200 rounded text-xs">
                          <option value="Oral">Oral</option>
                          <option value="Intravenous (IV)">Intravenous (IV)</option>
                          <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                          <option value="Topical">Topical</option>
                          <option value="Ophthalmic">Ophthalmic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-slate-400">Duration</label>
                        <input type="text" value={currMedDuration} onChange={(e) => setCurrMedDuration(e.target.value)} className="w-full p-1 bg-white border border-slate-200 rounded text-xs" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase text-slate-400">Instructions</label>
                      <input type="text" value={currMedInstructions} onChange={(e) => setCurrMedInstructions(e.target.value)} placeholder="Take after breakfast" className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs" />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMedicationToList}
                      className="w-full py-1 bg-pink-100 hover:bg-pink-200 border border-pink-200 text-pink-800 text-[10px] font-black uppercase rounded"
                    >
                      {currMedId ? '✓ Save Changes' : '+ Add Medication To List'}
                    </button>
                  </div>

                  {/* Added Medications List display inside form */}
                  {pMedicationsList.length > 0 && (
                    <div className="space-y-1.5 border-t pt-2">
                      <span className="block text-[10px] uppercase text-slate-400">Medications Added ({pMedicationsList.length})</span>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {pMedicationsList.map((m) => (
                          <div key={m.id} className="p-2 border rounded bg-slate-50 flex justify-between items-center text-[10px]">
                            <div>
                              <p className="font-extrabold text-slate-900">{m.name} {m.dosage}</p>
                              <p className="text-slate-500 font-mono text-[9px]">{m.route} • {m.frequency} ({m.duration})</p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleEditMedicationInList(m.id, e)}
                                className="px-1 text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleRemoveMedicationFromList(m.id, e)}
                                className="px-1 text-red-650 text-red-600 hover:underline font-black"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[10px] border-t pt-2">
                    <div>
                      <label className="text-slate-455">Authorized Date</label>
                      <input type="text" value={new Date().toISOString().split('T')[0]} disabled className="w-full p-2 bg-slate-100 border rounded-lg font-bold font-mono text-slate-500" />
                    </div>
                    <div>
                      <label className="text-slate-455">Doctor Signature</label>
                      <input type="text" value={`Dr. ${doctorUser.fullName}`} disabled className="w-full p-2 bg-slate-100 border rounded-lg font-bold font-mono text-slate-500" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer">
                  Authorize Medical Recipe
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <span className="block text-xs font-mono font-black uppercase text-slate-450">Active Clinical Recipes Ledger</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((rx, idx) => (
                  <div key={rx.id || idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs relative overflow-hidden text-xs font-semibold flex flex-col justify-between">
                    <div className="absolute top-0 right-0 h-4 w-4 bg-pink-500 rounded-bl-xl" />
                    <div className="border-b pb-3 space-y-1">
                      <div className="flex justify-between font-mono text-[9px] text-slate-400">
                        <span>DATE: {rx.date}</span>
                        <span>Rx ID: {rx.id.slice(0, 8)}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900">Patient: {patients.find(pat => pat.id === rx.patientId)?.fullName || 'Outpatient'}</h4>
                      <p className="text-[10px] text-slate-450 font-mono">Linked Dx: "{rx.diagnosis || 'General Clinical Review'}"</p>
                    </div>
                    <div className="py-4 space-y-3 max-h-48 overflow-y-auto">
                      {rx.medications && rx.medications.length > 0 ? (
                        rx.medications.map((m, i) => (
                          <div key={m.id || i} className="p-2 bg-slate-50 border rounded-lg space-y-1">
                            <p className="text-sm font-black text-pink-700 flex items-center gap-1.5"><Pill className="h-4 w-4 shrink-0" /> {m.name} {m.dosage}</p>
                            <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-500 font-bold">
                              <p>Route: <span className="text-slate-800">{m.route || 'Oral'}</span></p>
                              <p>Freq: <span className="text-slate-800">{m.frequency || 'Once daily'}</span></p>
                              <p>Course: <span className="text-slate-800 font-mono">{m.duration || '7 Days'}</span></p>
                            </div>
                            {m.instructions && <p className="text-[10px] text-slate-500 italic">"Dir: {m.instructions}"</p>}
                          </div>
                        ))
                      ) : (
                        <div className="bg-slate-50 p-2 border rounded-lg font-bold text-[10px] space-y-1">
                          <p className="text-sm font-black text-pink-700 flex items-center gap-1.5"><Pill className="h-4 w-4 shrink-0" /> {rx.medicationName} {rx.dosage}</p>
                          <div className="grid grid-cols-2 gap-1 text-slate-500">
                            <p>Route: <span className="text-slate-800">{rx.route || 'Oral'}</span></p>
                            <p>Freq: <span className="text-slate-800">{rx.frequency || 'Once daily'}</span></p>
                            <p className="col-span-2">Course: <span className="text-slate-850 font-mono">{rx.duration || '7 Days'}</span></p>
                          </div>
                          {rx.instructions && <p className="text-[11px] text-slate-500 italic mt-1 leading-normal">"Dir: {rx.instructions}"</p>}
                        </div>
                      )}
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center text-[10px] font-mono font-black">
                      <span className="text-emerald-700 uppercase">✓ AUTHENTIC EHR</span>
                      <span>Dr. {rx.doctorName || doctorUser.fullName}</span>
                    </div>
                  </div>
                ))}
                {prescriptions.length === 0 && (
                  <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-455 font-bold">No pharmaceutical formulations filed under this clinical workstation cycle.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 4. LAB RESULTS PAGE */}
      {activeSection === 'labs' && (
        <div className="space-y-6 text-left">
          {/* Main Headers */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Laboratory Results</h2>
              <p className="text-xs text-slate-500">Create, sign, and review patient laboratory reports.</p>
            </div>
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-amber-700">
              {Array.from(new Map(labResults.map(item => [item.id, item])).values()).length} Certified Reports
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* L-Grid Left: Form & Template Manager (columns: 5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* SECTION 1: Manage Lab Report Template */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden space-y-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#D97706]" />
                <div className="border-b pb-3.5">
                  <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-[#D97706]" />
                    Manage Lab Report Template
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Define custom parameter structure for pathology sheets.</p>
                </div>

                {isLoadingTemplate ? (
                  <div className="py-8 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
                    Synchronizing template structure...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* List of current fields in template */}
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      <span className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Active Report Parameters ({lFields.length})</span>
                      {lFields.map((field, index) => (
                        <div key={field.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-xl text-[11px] font-semibold">
                          <div className="min-w-0">
                            <span className="text-slate-800 block truncate">{field.label}</span>
                            <span className="text-[9px] text-slate-400 block truncate font-mono uppercase bg-slate-100/50 px-1 py-0.5 rounded-sm w-fit mt-0.5">
                              {field.fieldType} {field.required ? '• REQUIRED' : '• OPTIONAL'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveField(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveField(index, 'down')}
                              disabled={index === lFields.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteField(field.id)}
                              className="p-1 text-[#E11D48] hover:bg-rose-50 rounded cursor-pointer"
                              title="Delete Parameter"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Form to add a new field to template */}
                    <div className="bg-slate-50/55 p-3 rounded-xl border border-slate-150 space-y-2 text-xs font-semibold">
                      <span className="block text-[9px] uppercase font-bold text-[#D97706] mb-1">Add Parameter to Template</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] uppercase text-slate-400">Field Label</label>
                          <input
                            type="text"
                            placeholder="e.g., Calcium"
                            value={newFieldLabel}
                            onChange={(e) => setNewFieldLabel(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase text-slate-400">Input Placeholder</label>
                          <input
                            type="text"
                            placeholder="e.g., 9.5 mg/dL"
                            value={newFieldPlaceholder}
                            onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] uppercase text-slate-400">Parameter Type</label>
                          <select
                            value={newFieldType}
                            onChange={(e) => setNewFieldType(e.target.value as any)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold font-sans"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="textarea">Long Text / Notes</option>
                            <option value="date">Date</option>
                            <option value="select">Select Menu</option>
                            <option value="checkbox">Checkbox Toggle</option>
                          </select>
                        </div>
                        <div className="flex items-center pt-3.5">
                          <label className="flex items-center gap-1.5 cursor-pointer selection-none">
                            <input
                              type="checkbox"
                              checked={newFieldRequired}
                              onChange={(e) => setNewFieldRequired(e.target.checked)}
                              className="h-3.5 w-3.5 text-sky-650 rounded border-slate-300"
                            />
                            <span className="text-[10px] text-slate-600">Mark as Required</span>
                          </label>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddField}
                        className="w-full py-1.5 bg-[#D97706]/10 hover:bg-[#D97706]/20 text-[#D97706] font-bold text-[10px] uppercase tracking-wider rounded-lg border border-[#D97706]/15 cursor-pointer flex items-center justify-center gap-1 mt-2 font-sans"
                      >
                        <Plus className="h-3 w-3" />
                        Append Template Field
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: New Laboratory Report Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                <form onSubmit={handleLabSubmit} className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-amber-500" />
                      New Laboratory Report
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Complete dynamic diagnostic variables for live patient reports.</p>
                  </div>

                  {lSuccess && (
                     <p className="p-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-150 flex items-center gap-1">
                       <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                       Report successfully certified! Diagnostic visits compiled.
                     </p>
                  )}

                  <div className="space-y-3.5 text-xs font-semibold">
                    <div>
                      <label className="block text-[10px] uppercase text-slate-455 mb-1">Patient Linkage *</label>
                      <select
                        value={lPatientId}
                        onChange={(e) => setLPatientId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer"
                        required
                      >
                        <option value="">-- Choose Patient --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.fullName} ({p.medicalId || 'MID-' + p.id.slice(0, 5)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      <span className="block text-[9px] uppercase font-bold text-slate-400 border-b pb-1 mb-2">Report Content Fields</span>
                      
                      {lFields.length === 0 ? (
                        <div className="py-4 text-center text-[11px] text-slate-400 italic">
                          No fields defined in template yet. Add parameters above to populate report values.
                        </div>
                      ) : (
                        lFields.map((field) => (
                          <div key={field.id} className="space-y-1 text-xs">
                            <label className="block text-[10px] uppercase text-slate-455">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            
                            {field.fieldType === 'textarea' ? (
                              <textarea
                                placeholder={field.placeholder}
                                required={field.required}
                                value={labValues[field.id] || ''}
                                onChange={(e) => setLabValues({ ...labValues, [field.id]: e.target.value })}
                                rows={2.5}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                              />
                            ) : field.fieldType === 'select' ? (
                              <select
                                required={field.required}
                                value={labValues[field.id] || ''}
                                onChange={(e) => setLabValues({ ...labValues, [field.id]: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                              >
                                <option value="">-- Choose Option --</option>
                                <option value="Normal">Normal</option>
                                <option value="Abnormal / Borderline">Abnormal / Borderline</option>
                                <option value="Critical Deviation">Critical Deviation</option>
                              </select>
                            ) : field.fieldType === 'checkbox' ? (
                              <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-slate-50 border border-slate-200 rounded-xl select-none">
                                <input
                                  type="checkbox"
                                  checked={!!labValues[field.id]}
                                  onChange={(e) => setLabValues({ ...labValues, [field.id]: e.target.checked })}
                                  className="h-4 w-4 bg-slate-100 border-slate-200 text-sky-650 rounded"
                                />
                                <span className="text-xs text-slate-600 font-semibold">{field.placeholder || 'Confirmed Normal / Verified'}</span>
                              </label>
                            ) : (
                              <input
                                type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                                placeholder={field.placeholder}
                                required={field.required}
                                value={labValues[field.id] || ''}
                                onChange={(e) => setLabValues({ ...labValues, [field.id]: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={lFields.length === 0}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1 px-4 mt-2.5 text-center shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    Sign and Authorize Report
                  </button>
                </form>
              </div>

            </div>

            {/* L-Grid Right: Certified Laboratory Slips Archive (columns: 7) */}
            <div className="lg:col-span-7 space-y-4">
              <span className="block text-xs font-mono font-black uppercase text-slate-450 tracking-wider">
                Saved Laboratory Reports
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(new Map(labResults.map(item => [item.id, item])).values())
                  .sort((a, b) => b.id.localeCompare(a.id))
                  .map((l) => {
                    const patObj = patients.find(pat => pat.id === l.patientId);
                    const patientFullName = patObj?.fullName || l.patientName || 'Clinical Subject';
                    const patientMedicalID = patObj?.medicalId || l.medicalId || 'MID-789410';

                    return (
                      <div
                        key={l.id}
                        className="bg-white border rounded-2xl p-5 text-xs font-semibold flex flex-col justify-between relative overflow-hidden shadow-2xs border-slate-200"
                      >
                        <div className="absolute top-0 right-0 h-4 w-4 bg-amber-500 rounded-bl-xl" />
                        <div>
                          <div className="border-b pb-3 space-y-1">
                            <div className="flex justify-between font-mono text-[9px] text-slate-400">
                              <span>SPECIMEN DATE: {l.date}</span>
                              <span className={`px-1 rounded-xs uppercase text-[8px] font-black tracking-widest ${l.status === 'NORMAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                {l.status || 'NORMAL'}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-[#D97706] uppercase tracking-wide text-[11px]">
                              {l.testName}
                            </h4>
                            <p className="font-bold text-slate-900 mt-1">
                              Patient: <span className="text-slate-800">{patientFullName}</span>
                            </p>
                            <p className="text-[9px] text-slate-400 font-mono">
                              Medical ID: {patientMedicalID}
                            </p>
                          </div>

                          {/* Dynamic and Legacy fields display */}
                          {l.labFieldsSnapshot && l.labValues ? (
                            <div className="py-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono border-b border-dashed border-slate-200">
                              {l.labFieldsSnapshot.map((field) => {
                                const val = l.labValues ? l.labValues[field.id] : undefined;
                                if (val === undefined || val === '') return null;
                                return (
                                  <div key={field.id} className="bg-slate-50 p-1.5 rounded border border-slate-100">
                                    <span className="text-slate-400 block text-[8px] uppercase truncate">{field.label}</span>
                                    <span className="text-slate-800 block truncate font-sans font-bold text-[10px] mt-0.5">
                                      {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="py-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono border-b border-dashed border-slate-200">
                              {l.hemoglobin && <p className="text-slate-500 font-mono">Hemoglobin: <span className="text-slate-900 font-bold font-sans">{l.hemoglobin} g/dL</span></p>}
                              {l.wbc && <p className="text-slate-500 font-mono">WBC: <span className="text-slate-900 font-bold font-sans">{l.wbc} 10^3</span></p>}
                              {l.rbc && <p className="text-slate-500 font-mono">RBC: <span className="text-slate-900 font-bold font-sans">{l.rbc} 10^6</span></p>}
                              {l.platelets && <p className="text-slate-500 font-mono">Platelets: <span className="text-slate-900 font-bold font-sans">{l.platelets} x10^3</span></p>}
                              {l.glucose && <p className="text-slate-500 font-mono">Glucose: <span className="text-slate-900 font-bold font-sans">{l.glucose} mg/dL</span></p>}
                              {l.cholesterol && <p className="text-slate-500 font-mono">Cholesterol: <span className="text-slate-900 font-bold font-sans">{l.cholesterol} mg/dL</span></p>}
                            </div>
                          )}

                          <div className="py-2.5 space-y-1 bg-slate-50 rounded-lg p-2.5 mt-2.5 border border-slate-100 leading-relaxed text-[11px] text-slate-650">
                            <span className="text-slate-400 font-bold text-[8px] uppercase tracking-wider block">Clinical Impression</span>
                            <span className="italic text-slate-800 font-bold">"{l.interpretation || 'No interpretation summary entered.'}"</span>
                            <span className="text-[8px] text-slate-400 block font-mono mt-1">Reference: {l.referenceRange}</span>
                          </div>
                        </div>

                        <div className="border-t pt-3 flex justify-between items-center text-[10px] font-mono font-black mt-3">
                          <span className="text-indigo-700 uppercase flex items-center gap-1 shrink-0">
                            <ShieldCheck className="h-3.5 w-3.5 text-indigo-650" />
                            SIGNED LAB ASSAY
                          </span>
                          <span className="truncate max-w-[120px]">Dr. {l.doctorName || doctorUser.fullName}</span>
                        </div>
                      </div>
                    );
                  })}

                {Array.from(new Map(labResults.map(item => [item.id, item])).values()).length === 0 && (
                  <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                    <FlaskConical className="h-8 w-8 text-slate-300 mx-auto animate-pulse" />
                    <p className="font-semibold text-xs">No lab results found.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. RADIOLOGY PAGE */}
      {activeSection === 'radiology' && (
        <div className="space-y-6 text-left">
          <div className="bg-white border border-slate-250 rounded-2xl p-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Radiology Imaging Suite</h2>
              <p className="text-xs text-slate-500">Publish, sign-off, and index radiography scans, CTs, MRIs, and ultrasounds. Writes detailed clinic visit history record.</p>
            </div>
            <span className="px-3 py-1 bg-purple-50 border border-purple-150 rounded-xl text-xs font-black text-purple-700">{radiologyReports.length} Imaging Scans</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-600" />
              <form onSubmit={handleRadiologySubmit} className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-slate-400 pb-2 border-b">New High Resolution Diagnostics Study</h3>
                {rSuccess && <p className="p-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border">✓ Scans, diagnostics imagery, and clinic-visit indexed successfully!</p>}
                
                <div className="space-y-3.5 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] uppercase text-slate-455 mb-1">Select Patient Subject</label>
                    <select value={rPatientId} onChange={(e) => setRPatientId(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer" required>
                      <option value="">-- Patient --</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.medicalId || p.id.slice(0, 5)})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase text-slate-455 mb-1">Scan Modality Type</label>
                      <select value={rStudyType} onChange={(e) => setRStudyType(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <option value="Chest X-Ray">Chest X-Ray</option>
                        <option value="Brain MRI">Brain MRI</option>
                        <option value="Abdominal CT">Abdominal CT</option>
                        <option value="Pelvic Ultrasound">Pelvic Ultrasound</option>
                        <option value="Spine Radiograph">Spine Radiograph</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-slate-455 mb-1">Anatomical Body Part</label>
                      <input type="text" value={rBodyPart} onChange={(e) => setRBodyPart(e.target.value)} placeholder="e.g. Cranium, Thorax" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-455 mb-1">Observations & Clinical Findings *</label>
                    <textarea value={rFindings} onChange={(e) => setRFindings(e.target.value)} placeholder="Describe structural findings and tissue densities..." rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-455 mb-1">Primary Study Impression (Conclusion)</label>
                    <textarea value={rImpression} onChange={(e) => setRImpression(e.target.value)} placeholder="State primary clinical conclusion / diagnosis..." rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-455 mb-1">Clinical Recommendations</label>
                    <input type="text" value={rRecommendations} onChange={(e) => setRRecommendations(e.target.value)} placeholder="Follow-up CT scans correlation, consultation" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs" required />
                  </div>

                  {/* Dynamic Radiology Custom Sections */}
                  <div className="border border-purple-100 p-3 rounded-xl bg-purple-50/10 space-y-3">
                    <span className="block text-[10px] text-purple-700 uppercase font-bold tracking-wider">
                      {currSectId ? 'Edit Study Custom Section' : 'Add Custom Study Section'}
                    </span>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[8px] uppercase text-slate-400">Section Title (e.g. Technique, Comparison)</label>
                        <input type="text" value={currSectLabel} onChange={(e) => setCurrSectLabel(e.target.value)} placeholder="Technique" className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs" />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase text-slate-400">Section Findings/Content</label>
                        <textarea value={currSectContent} onChange={(e) => setCurrSectContent(e.target.value)} placeholder="Acquired 1.5T MRI standard sequences..." rows={2} className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSectionToList}
                      className="w-full py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[10px] font-black uppercase rounded"
                    >
                      {currSectId ? '✓ Save Section' : '+ Add Custom Section'}
                    </button>
                  </div>

                  {/* Added Sections List */}
                  {rSectionsList.length > 0 && (
                    <div className="space-y-1 bg-slate-50 border p-2 rounded-xl text-[10px]">
                      <span className="block text-[9px] uppercase font-bold text-slate-450">Active Custom Sections ({rSectionsList.length})</span>
                      <div className="space-y-1">
                        {rSectionsList.map((sect) => (
                          <div key={sect.id} className="p-1.5 border-b border-slate-105 bg-white rounded flex justify-between items-start gap-2">
                            <div className="text-left">
                              <strong className="text-slate-900 block font-black uppercase text-[8px]">{sect.label}</strong>
                              <p className="text-slate-600 line-clamp-1">{sect.content}</p>
                            </div>
                            <div className="flex gap-1.5 shrink-0 text-[9px]">
                              <button type="button" onClick={(e) => handleEditSectionInList(sect.id, e)} className="text-blue-600 hover:underline">Edit</button>
                              <button type="button" onClick={(e) => handleRemoveSectionFromList(sect.id, e)} className="text-red-600 hover:underline font-black">Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 mb-1">Select Scanning Asset Image Mock</label>
                    <select onChange={(e) => setRImageUrl(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                      <option value="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=400">Chest X-Ray PA View</option>
                      <option value="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400">Encephalic Cranial MRI Slot</option>
                      <option value="https://images.unsplash.com/photo-1559757031-64d1f2e1df23?auto=format&fit=crop&w=400">Abdominal Cavity CT Scan</option>
                    </select>
                    <input type="text" value={rImageUrl} onChange={(e) => setRImageUrl(e.target.value)} className="w-full p-1 bg-slate-100 border text-[9px] font-mono rounded mt-1 text-slate-400" required />
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-750 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer mt-2">
                  Authorize Radiologic Study
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <span className="block text-xs font-mono font-black uppercase text-slate-450">Active Radiographs Folders</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {radiologyReports.map((r, idx) => (
                  <div key={r.id || idx} className="bg-white border rounded-2xl p-5 shadow-3xs text-xs font-semibold flex flex-col justify-between relative overflow-hidden border-purple-250">
                    <div className="absolute top-0 right-0 h-4 w-4 bg-purple-500 rounded-bl-xl" />
                    <div className="space-y-2">
                      <div className="border-b pb-3 space-y-1">
                        <div className="flex justify-between font-mono text-[9px] text-slate-400">
                          <span>SCAN DATE: {r.date}</span>
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100 uppercase text-[8px] font-black">STUDY RELEASE : {r.status || 'RELEASED'}</span>
                        </div>
                        <h4 className="font-extrabold text-purple-750 uppercase tracking-wide text-[11px] text-purple-700">{r.scanType}</h4>
                        <p className="font-bold text-slate-900 leading-none">Patient: {patients.find(pat => pat.id === r.patientId)?.fullName || 'Clinical Subject'}</p>
                        <p className="text-[10px] text-slate-455 font-mono">Body region targeted: {r.bodyPart}</p>
                      </div>

                      <div className="space-y-1 text-[11px] leading-relaxed text-slate-700 bg-slate-50/50 p-2.5 rounded-lg border">
                        <p><strong>Findings:</strong> <span className="italic block text-slate-600">"{r.findings}"</span></p>
                        <p className="mt-1"><strong>Conclusion:</strong> <span className="block text-indigo-700 font-extrabold text-[10px]">"{r.impression || r.clinicalImpression || 'Within limits.'}"</span></p>
                        <p className="text-[10px] text-slate-500"><strong>Recommendations:</strong> {r.recommendations}</p>
                      </div>

                      {r.sections && r.sections.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-dashed">
                          <span className="block text-[8px] tracking-wider uppercase font-black text-slate-400 font-mono">Custom Study Chapters</span>
                          {r.sections.map((sect, sIdx) => (
                            <div key={sect.id || sIdx} className="bg-slate-50 p-2 rounded-lg border text-[10px] leading-relaxed text-slate-700">
                              <span className="block font-black text-purple-700 uppercase text-[8px] tracking-wide font-mono">{sect.label}</span>
                              <p className="italic text-slate-800 font-medium">"{sect.content}"</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {r.imageUrl && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="block text-[8px] font-mono font-black uppercase text-slate-400 tracking-wider">Radiograph Image Link:</span>
                          <a 
                            href={r.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-sky-600 hover:text-sky-800 font-semibold break-all underline flex items-center gap-1.5"
                          >
                            <span className="truncate">{r.imageUrl}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-3 flex justify-between items-center text-[10px] font-mono font-black mt-2.5">
                      <span className="text-purple-700 uppercase">✓ SIGNED IN RADIOLOGY</span>
                      <span>Dr. {r.doctorName || doctorUser.fullName}</span>
                    </div>
                  </div>
                ))}
                {radiologyReports.length === 0 && (
                  <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-455 font-bold">No diagnostic imagery reports logged. Use creation pad panel.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. QR SCANNER PAGE */}
      {activeSection === 'qr_scan' && (
        <div className="max-w-md mx-auto bg-white border border-slate-250 rounded-2xl p-6 space-y-6 text-left animate-in duration-300">
          <div className="text-center space-y-1">
            <QrCode className="h-12 w-12 text-indigo-650 text-indigo-600 mx-auto" />
            <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">Camera & EHR QR Scan Port</h2>
            <p className="text-xs text-slate-500 font-sans leading-normal">Instantly process patients check-in or access diagnostics records.</p>
          </div>

          {scanError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-xl p-4 space-y-1 text-xs leading-relaxed">
              <p className="font-extrabold uppercase text-[10px] tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" /> Camera Error
              </p>
              <p className="mt-0.5">{scanError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative aspect-video rounded-xl bg-slate-950 border overflow-hidden flex flex-col items-center justify-center text-xs text-slate-400">
              {isScanning ? (
                <video ref={videoRef} className="w-full h-full object-cover grayscale" />
              ) : (
                <div className="text-center space-y-3 p-4">
                  <p className="text-slate-400">Camera is inactive or turned off.</p>
                  <button onClick={startCameraScan} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-extrabold cursor-pointer text-xs">
                    Re-trigger Camera
                  </button>
                </div>
              )}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                  <div className="w-32 h-32 border-2 border-dashed border-sky-400 rounded-lg animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. MEDICAL RECORDS (CHART SCREEN OVERVIEW) */}
      {activeSection === 'records' && (
        <div className="space-y-6 text-left">
          <div className="bg-white border rounded-2xl p-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">EHR Complete Medical Records</h2>
              <p className="text-xs text-slate-500">Search and lookup patients chronological charts, history logs, and triages safely.</p>
            </div>
            <select value={selectedPatientId || ''} onChange={(e) => setSelectedPatientId(e.target.value || null)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer">
              <option value="">-- Select Patient Context --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.medicalId || p.id.slice(0, 5)})</option>)}
            </select>
          </div>

          {!selectedPatientId ? (
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3.5">
              <UserCheck className="h-10 w-10 text-slate-300 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="font-extrabold uppercase text-xs text-slate-800">EHR Patient Context Unselected</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Choose a patient from the dropdown above to filter their entire chronological chart timeline including laboratory assets and radiology scans.</p>
              </div>
            </div>
          ) : (() => {
            const currentP = patients.find(p => p.id === selectedPatientId);
            const pVisits = medicalRecords.filter(m => m.patientId === selectedPatientId);
            const pRx = prescriptions.filter(p => p.patientId === selectedPatientId);
            const pLabs = labResults.filter(l => l.patientId === selectedPatientId);
            const pRad = radiologyReports.filter(r => r.patientId === selectedPatientId);

            return (
              <div className="space-y-6">
                {currentP && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-650 bg-indigo-600" />
                    <div>
                      <h3 className="text-base font-black text-slate-950">{currentP.fullName}</h3>
                      <p className="text-xs text-slate-450 font-mono mt-0.5">Medical ID: {currentP.medicalId || 'MID-EMR'}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500">
                      <p>Age: <span className="text-slate-800">{currentP.dateOfBirth ? calculateAge(currentP.dateOfBirth) : 'N/A'}</span></p>
                      <p>Gender: <span className="text-slate-800">{currentP.gender || 'N/A'}</span></p>
                      <p>Joined: <span className="text-slate-800">{currentP.joinedDate || 'N/A'}</span></p>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h4 className="font-extrabold uppercase text-xs text-slate-400 tracking-wider">Chronological Chart History</h4>
                  <div className="space-y-4 font-medium text-xs font-semibold">
                    {pVisits.map((v, i) => (
                      <div key={v.id || i} className="p-4 bg-indigo-50/15 border border-indigo-100/40 rounded-xl space-y-2 text-left">
                        <div className="flex justify-between items-center border-b border-indigo-50 pb-2">
                          <span className="font-black text-indigo-700 uppercase tracking-wide text-[10pt]">Medical Visit Encounter</span>
                          <span className="font-mono text-slate-450 font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded">{v.date}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          <p><strong className="text-slate-400 font-mono uppercase text-[9px] block">Attending Physician</strong> <span className="text-slate-800 font-bold">Dr. {v.doctorName}</span></p>
                          <p><strong className="text-slate-400 font-mono uppercase text-[9px] block">Diagnosis Type</strong> <span className="text-indigo-800 font-black">{v.diagnosis}</span></p>
                        </div>
                        <div className="pt-1.5 space-y-2 text-slate-650">
                          <p className="bg-white/80 p-2.5 rounded border border-slate-100"><strong className="text-slate-455 block text-[9px] uppercase font-mono">Therapeutic / Treatment Plan</strong> {v.treatmentPlan}</p>
                          <p className="bg-white/80 p-2.5 rounded border border-slate-100"><strong className="text-slate-455 block text-[9px] uppercase font-mono">Encounter Notes & Remarks</strong> {v.notes || 'No notes specified.'}</p>
                        </div>
                      </div>
                    ))}
                    {pVisits.length === 0 && (
                      <p className="text-center text-slate-400 py-12 font-bold font-sans">No registered clinical visits matched with EMR cycles.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 6. ADMINISTRATIVE PROFILE SETTINGS */}
      {activeSection === 'profile' && (
        <div className="max-w-6xl mx-auto space-y-8 px-4 py-2 text-left">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5 space-y-1">
            <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-indigo-700" />
              <span>Physician Professional Portfolio</span>
            </h2>
            <p className="text-xs text-slate-500">
              Manage your clinician profile, submit official specialty credentials, or apply for hospital/clinical transfers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: DOCTOR INFORMATION EDITOR (6/12) */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Doctor Information
                </h3>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4 font-sans text-xs font-semibold">
                {profileSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-100 flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-slate-450 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={profileFullName}
                    onChange={(e) => setProfileFullName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>

                {/* Specialty */}
                <div>
                  <label className="block text-slate-450 mb-1">Professional Specialty *</label>
                  <input
                    type="text"
                    value={profileSpecialty}
                    onChange={(e) => setProfileSpecialty(e.target.value)}
                    required
                    list="specialties-list"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-bold"
                  />
                  <datalist id="specialties-list">
                    <option value="General Internist" />
                    <option value="Cardiologist" />
                    <option value="Pediatrician" />
                    <option value="General Surgeon" />
                    <option value="Orthopedic Surgeon" />
                    <option value="Ophthalmologist" />
                    <option value="Dermatologist" />
                    <option value="Neurologist" />
                    <option value="Radiologist" />
                    <option value="Pathologist" />
                  </datalist>
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-slate-450 mb-1">License Identification No. *</label>
                  <input
                    type="text"
                    value={profileLicenseNumber}
                    onChange={(e) => setProfileLicenseNumber(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-mono"
                  />
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-slate-450 mb-1">Affiliated Medical Institution *</label>
                  <input
                    type="text"
                    value={profileInstitution}
                    onChange={(e) => setProfileInstitution(e.target.value)}
                    required
                    list="institutions-list-dl"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                  />
                  <datalist id="institutions-list-dl">
                    {institutions && institutions.map((inst: any) => (
                      <option key={inst.id} value={inst.name} />
                    ))}
                    <option value="Moustafa Kamel Military Hospital" />
                    <option value="Cairo University Hospitals" />
                    <option value="Ain Shams University Hospital" />
                    <option value="Cleopatra Hospital" />
                    <option value="Dar Al Fouad Hospital" />
                  </datalist>
                </div>

                {/* Contact information inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-450 mb-1">Work Phone Line *</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-455 mb-1">Clinic Consultation Intervals *</label>
                    <input
                      type="text"
                      value={profileHours}
                      onChange={(e) => setProfileHours(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                {/* Biography */}
                <div>
                  <label className="block text-slate-450 mb-1">Physician Biography & Remarks *</label>
                  <textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    required
                    rows={4}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-normal leading-relaxed"
                    placeholder="Provide a comprehensive clinician biography, fellowships, and medical accomplishments..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold uppercase cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </button>
              </form>
            </div>

            {/* COLUMN 2: PROFESSIONAL REQUESTS SUBMISSION (6/12) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* SECTION A: SPECIALTY CHANGE REQUEST */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-left">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Award className="h-5 w-5 text-sky-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Specialty Change Request
                  </h3>
                </div>

                <form onSubmit={handleSpecialtyRequestSubmit} className="space-y-4 font-sans text-xs font-semibold">
                  {specialtySuccessMsg && (
                    <div className="p-3 bg-sky-50 text-sky-850 font-bold rounded-xl border border-sky-100 flex items-center gap-2 animate-in fade-in duration-305">
                      <CheckCircle2 className="h-4 w-4 text-sky-600" />
                      <span>{specialtySuccessMsg}</span>
                    </div>
                  )}

                  {/* Read-only Current Specialty */}
                  <div>
                    <label className="block text-slate-400 mb-1">Current Specialty</label>
                    <div className="w-full p-2.5 bg-slate-100 border border-slate-150 rounded-xl text-slate-500 font-bold cursor-not-allowed flex items-center justify-between">
                      <span>{doctorUser.specialty || 'General Internist'}</span>
                      <span className="text-[9px] uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono font-black">System Locked</span>
                    </div>
                  </div>

                  {/* Requested Specialty */}
                  <div>
                    <label className="block text-slate-500 mb-1">Requested Specialty *</label>
                    <input
                      type="text"
                      value={reqSpecialty}
                      onChange={(e) => setReqSpecialty(e.target.value)}
                      required
                      placeholder="e.g., Cardiologist, Pediatric Cardiologist"
                      list="specialties-list-req"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-850 font-bold"
                    />
                    <datalist id="specialties-list-req">
                      <option value="Cardiologist" />
                      <option value="Pediatrician" />
                      <option value="General Surgeon" />
                      <option value="Orthopedic Surgeon" />
                      <option value="Ophthalmologist" />
                      <option value="Dermatologist" />
                      <option value="Neurologist" />
                      <option value="Radiologist" />
                      <option value="Pathologist" />
                      <option value="Oncologist" />
                      <option value="Anesthesiologist" />
                    </datalist>
                  </div>

                  {/* Reason for Change */}
                  <div>
                    <label className="block text-slate-500 mb-1">Reason & Fellowship Proof *</label>
                    <textarea
                      value={specialtyReason}
                      onChange={(e) => setSpecialtyReason(e.target.value)}
                      required
                      rows={3}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-800 font-normal leading-relaxed"
                      placeholder="Please specify your Board certifications, fellowships, or medical syndication reasons..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold uppercase cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Submit Specialty Request</span>
                  </button>
                </form>
              </div>

              {/* SECTION B: INSTITUTION TRANSFER REQUEST */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-left">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Building className="h-5 w-5 text-violet-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Institution Transfer Request
                  </h3>
                </div>

                <form onSubmit={handleInstitutionRequestSubmit} className="space-y-4 font-sans text-xs font-semibold">
                  {institutionSuccessMsg && (
                    <div className="p-3 bg-violet-50 text-violet-850 font-bold rounded-xl border border-violet-100 flex items-center gap-2 animate-in fade-in duration-305">
                      <CheckCircle2 className="h-4 w-4 text-violet-600" />
                      <span>{institutionSuccessMsg}</span>
                    </div>
                  )}

                  {/* Read-only Current Institution */}
                  <div>
                    <label className="block text-slate-400 mb-1">Current Institution</label>
                    <div className="w-full p-2.5 bg-slate-100 border border-slate-150 rounded-xl text-slate-500 font-bold cursor-not-allowed flex items-center justify-between">
                      <span>{doctorUser.institution || 'Moustafa Kamel Military Hospital'}</span>
                      <span className="text-[9px] uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono font-black">System Locked</span>
                    </div>
                  </div>

                  {/* Requested Institution */}
                  <div>
                    <label className="block text-slate-500 mb-1">Requested Relocation Institution *</label>
                    {institutions && institutions.length > 0 ? (
                      <select
                        value={reqInstitution}
                        onChange={(e) => setReqInstitution(e.target.value)}
                        required
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 font-semibold"
                      >
                        <option value="">-- Select Destination Institution --</option>
                        {institutions.map((inst: any) => (
                          <option key={inst.id} value={inst.name}>
                            🏢 {inst.name} ({inst.type})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={reqInstitution}
                        onChange={(e) => setReqInstitution(e.target.value)}
                        required
                        placeholder="Type Relocation Destination Hospital Name..."
                        list="institutions-list-req"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800"
                      />
                    )}
                    <datalist id="institutions-list-req">
                      <option value="Cairo University Hospitals" />
                      <option value="Ain Shams University Hospital" />
                      <option value="Moustafa Kamel Military Hospital" />
                      <option value="Cleopatra Hospital" />
                      <option value="Dar Al Fouad Hospital" />
                      <option value="Al-Galaa Military Medical Complex" />
                    </datalist>
                  </div>

                  {/* Reason for Relocation */}
                  <div>
                    <label className="block text-slate-500 mb-1">Reason for Institutional Relocation *</label>
                    <textarea
                      value={institutionReason}
                      onChange={(e) => setInstitutionReason(e.target.value)}
                      required
                      rows={3}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-slate-800 font-normal leading-relaxed"
                      placeholder="Specify your operational, geographical, or fellowship transfer requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold uppercase cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Submit Transfer Request</span>
                  </button>
                </form>
              </div>

            </div>

            {/* FULL-WIDTH HISTORY LOGS (12/12) */}
            <div className="lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-left">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ClipboardList className="h-5 w-5 text-indigo-700" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Request History
                </h3>
              </div>

              {(() => {
                const docRequests = (professionalRequests || []).filter(
                  (req: any) => req.userId === doctorUser.id
                );

                if (docRequests.length === 0) {
                  return (
                    <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 bg-slate-50/50">
                      <Clock className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                      <p className="font-bold text-xs">No previous requests found.</p>
                      <p className="text-[10px] text-slate-400">All submitted specialty change or transfer requests will log here.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {docRequests.map((req: any) => {
                      const isSpecialtyChange = req.requestedSpecialty !== req.currentSpecialty;
                      const isTransfer = !!req.requestedHospital;
                      
                      let typeLabel = "Professional Update";
                      let themeColor = "indigo";
                      if (isSpecialtyChange && isTransfer) {
                        typeLabel = "Specialty Change & Relocation";
                        themeColor = "purple";
                      } else if (isSpecialtyChange) {
                        typeLabel = "Specialty Change";
                        themeColor = "sky";
                      } else if (isTransfer) {
                        typeLabel = "Institution Transfer";
                        themeColor = "violet";
                      }

                      return (
                        <div
                          key={req.id}
                          className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl space-y-3 hover:bg-slate-50 transition-all font-sans text-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2 font-black text-slate-850 uppercase text-[10px] tracking-wider">
                              <span
                                className={`px-2 py-0.5 rounded-md border text-[9px] uppercase tracking-wider font-extrabold ${
                                  themeColor === 'sky'
                                    ? 'bg-sky-50 text-sky-700 border-sky-100'
                                    : themeColor === 'violet'
                                    ? 'bg-violet-50 text-violet-700 border-violet-100'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                }`}
                              >
                                {typeLabel}
                              </span>
                              <span className="text-slate-400 font-mono font-medium">{req.date}</span>
                            </div>
                            <div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                                  req.status === 'APPROVED'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : req.status === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {req.status}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-semibold text-slate-650 text-[11px] leading-relaxed">
                            <div className="space-y-1">
                              {isSpecialtyChange && (
                                <p>
                                  Requested Specialty:{" "}
                                  <strong className="text-slate-900">{req.requestedSpecialty}</strong> (was{" "}
                                  <span className="italic text-slate-450">{req.currentSpecialty}</span>)
                                </p>
                              )}
                              {isTransfer && (
                                <p>
                                  Requested Institution:{" "}
                                  <strong className="text-slate-900">🏢 {req.requestedHospital}</strong> (was{" "}
                                  <span className="italic text-slate-450">{req.currentSpecialty || doctorUser.institution || 'N/A'}</span>)
                                </p>
                              )}
                              {req.reason && (
                                <p className="text-slate-500 italic font-medium pt-1">
                                  "Reason: {req.reason}"
                                </p>
                              )}
                            </div>

                            {/* Admin notes if present */}
                            <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-100 flex flex-col justify-center">
                              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold">
                                Board Decision Remarks
                              </span>
                              <p className="text-slate-700 font-bold">
                                {req.status === 'PENDING' ? (
                                  <span className="text-amber-600 font-medium italic">Pending Administrative Board clinical audit...</span>
                                ) : (
                                  <span>{req.adminNotes || 'Processed without additional remarks.'}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* 7. SECURE SETTINGS PAGE */}
      {activeSection === 'settings' && (
        <div className="max-w-md mx-auto bg-white border border-slate-205 rounded-2xl p-6 text-left space-y-5">
          <div className="border-b pb-3.5 space-y-1">
            <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">Clinical Security Configuration</h2>
            <p className="text-xs text-slate-550 text-slate-500">Configure login parameters and HIPAA regulatory guidelines.</p>
          </div>

          <div className="bg-amber-50/50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs space-y-1.5 font-semibold">
            <p>👁 Health Insurance Portability and Accountability (HIPAA)</p>
            <p className="text-[11px] leading-relaxed font-normal text-amber-700">Ensure audit screens or patient identifiers remain secure. Do not leave the browser unattended while signed on under verified Egypt Syndicate doctor credentials.</p>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <button onClick={onLogout} className="w-full py-2.5 bg-rose-600 hover:bg-rose-750 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer">
              Revoke Session Authorization (Sign out)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
