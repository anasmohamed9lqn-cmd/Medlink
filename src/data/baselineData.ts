import { User, UserRole, UserStatus, EmergencyInfo, Department, MedicalRecord, Prescription, LabResult, RadiologyReport, Notification, AuditLog, ProfessionalUpdateRequest, MedicalInstitution, OrganizationRequest, Claim, InsuranceCompany } from '../types';

export const INITIAL_USERS: User[] = [
  {
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
    password: '1234567890anas'
  }
];

export const INITIAL_EMERGENCY_INFO: Record<string, EmergencyInfo> = {};

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-01',
    name: 'Cardiological Sciences',
    description: 'Specialized clinic focusing on myocardial therapies, acute cardiovascular interventions, and systemic hypertension diagnostics.',
    location: 'West Wing - 3rd Floor, Suite 340',
    headDoctor: 'Dr. Sarah Jenkins'
  }
];

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [];
export const INITIAL_PRESCRIPTIONS: Prescription[] = [];
export const INITIAL_LAB_RESULTS: LabResult[] = [];
export const INITIAL_RADIOLOGY_REPORTS: RadiologyReport[] = [];
export const INITIAL_NOTIFICATIONS: Notification[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_PROF_REQUESTS: ProfessionalUpdateRequest[] = [];

export const INITIAL_INSTITUTIONS: MedicalInstitution[] = [
  {
    id: 'inst-01',
    name: 'Cairo Medical Center',
    type: 'Clinic',
    address: '22 El-Galaa St',
    city: 'Cairo',
    country: 'Egypt',
    contactEmail: 'contact@cairomedical.com',
    contactPhone: '+20 (2) 2345-6789',
    status: 'Active',
    specialties: ['Internal Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics']
  }
];

export const INITIAL_ORGANIZATION_REQUESTS: OrganizationRequest[] = [];

export const INITIAL_CLAIMS: Claim[] = [];
export const INITIAL_INSURANCE_COMPANIES: InsuranceCompany[] = [
  {
    id: 'ins-01',
    name: 'Nile Health Insurance',
    code: 'NHI-99',
    email: 'contact@nilehealth.com',
    phone: '+20 (2) 111-2222',
    address: '10 Nile St, Cairo',
    status: 'Active'
  }
];
