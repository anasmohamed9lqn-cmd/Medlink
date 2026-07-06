/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  INSURANCE = 'insurance'
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  DECLINED = 'rejected',
  SUSPENDED = 'suspended'
}

export interface EmergencyInfo {
  bloodType: string;
  allergies: string;
  chronicDiseases: string;
  criticalMedications: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface User {
  id: string;
  uid?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  phoneNumber: string;
  nationalId: string;
  gender: string;
  dateOfBirth: string;
  password?: string;
  medicalId?: string; // Only for patients
  photoUrl?: string;
  departmentId?: string; // Only for doctors
  joinedDate: string;
  institution?: string;
  institutionId?: string;
  institutionType?: string;
  specialty?: string;
  licenseNumber?: string;
  experience?: string;
  workEmail?: string;
  consultationHours?: string;
  bio?: string;
  organizationName?: string;
  branchOffice?: string;
  workingRegion?: string;
  position?: string;
  insuranceCompany?: string;
  insuranceCompanyId?: string;
  employeeId?: string;
  insuranceDepartment?: string;
  adminRole?: 'SUPER' | 'OPERATIONS' | 'SUPPORT'; // Only for administrators
}

export interface Department {
  id: string;
  name: string;
  description: string;
  location: string;
  headDoctor: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentPlan: string;
  notes: string;
  type?: 'visit' | 'record' | string;
  patientName?: string;
  medicalId?: string;
  age?: string | number;
  gender?: string;
  visitType?: 'Outpatient' | 'Follow-up' | 'Emergency' | 'Consultation' | 'Telemedicine' | string;
  icd10?: string;
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  followUpDate?: string;
  signature?: string;
  sourceType?: string;
  sourceId?: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medicationName: string;
  dosage: string;
  instructions: string;
  duration: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';
  visitId?: string; // Links back to the medical visit record
  diagnosis?: string;
  frequency?: string;
  route?: string;
  medications?: MedicationItem[];
}

export interface LabField {
  id: string;
  label: string;
  placeholder: string;
  fieldType: 'text' | 'number' | 'textarea' | 'date' | 'select' | 'checkbox';
  required: boolean;
  order: number;
}

export interface LabReportTemplate {
  id: string;
  doctorId: string;
  specialty?: string;
  fields: LabField[];
  updatedAt: string;
}

export interface LabParameter {
  id: string;
  name: string;
  result: string;
  referenceRange: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  patientName?: string;
  medicalId?: string;
  doctorId: string;
  doctorName?: string;
  testName: string;
  date: string;
  result: string;
  referenceRange: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL' | 'PENDING';
  notes: string;
  visitId?: string; // Links back to the medical visit record
  cbc?: string;
  hemoglobin?: string;
  wbc?: string;
  rbc?: string;
  platelets?: string;
  glucose?: string;
  cholesterol?: string;
  interpretation?: string;
  parameters?: LabParameter[];
  labValues?: Record<string, any>;
  labFieldsSnapshot?: LabField[];
  createdAt?: string;
}

export interface RadiologySection {
  id: string;
  label: string;
  content: string;
}

export interface RadiologyReport {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  scanType: string;
  studyType?: string;
  bodyPart?: string;
  date: string;
  findings: string;
  notes: string;
  imageUrl: string; // seed index, visual description, or uploaded base64 data url
  status?: 'PENDING' | 'COMPLETED' | 'REQUIRES_FOLLOWUP' | 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  requestedBy?: string;         // Doctor who ordered the scan
  clinicalImpression?: string;  // Radiologist's diagnostic conclusion
  radiologistNotes?: string;    // Clinical notes from radiology specialist
  impression?: string;
  recommendations?: string;
  visitId?: string;             // Links back to the medical visit record
  sections?: RadiologySection[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'APPOINTMENT' | 'RESOURCE' | 'LAB' | 'PRESCRIPTION' | 'ALERT';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  email: string;
  action: string;
  details: string;
}

export interface ProfessionalUpdateRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  currentSpecialty: string;
  requestedSpecialty: string;
  currentLicenseNumber: string;
  requestedLicenseNumber: string;
  requestedHospital?: string;
  requestedConsultationHours?: string;
  requestedBio?: string;
  reason?: string;
  adminNotes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

export interface MedicalInstitution {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Medical Center' | 'Specialized Center';
  address: string;
  city: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  status: 'Active' | 'Inactive';
  specialties: string[];
}

export interface OrganizationRequest {
  id: string;
  type: 'INSTITUTION';
  name: string;
  details: string;
  requesterName: string;
  requesterEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

export interface Claim {
  id: string;
  patientId: string;
  patientName: string;
  patientMedicalId: string;
  policyNumber: string;
  coverageType: string;
  doctorName: string;
  diagnosis: string;
  cost: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED' | string;
  date: string;
  rejectionReason?: string;
  settledDate?: string;
}

export interface InsuranceCompany {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  premiumRate?: number;
}

export interface InsuranceBranch {
  id: string;
  companyId: string;
  name: string;
  location: string;
}

