import { User, EmergencyInfo, Department, MedicalRecord, ProfessionalUpdateRequest, MedicalInstitution, OrganizationRequest } from '../types';

export interface SupabaseStatus {
  connected: boolean;
  tablesVerified: boolean;
  checking: boolean;
  errorMsg?: string;
}

export const SUPABASE_SQL_SCHEMA = `-- MedLink PostgreSQL Database Schema
-- Auto-generated for offline-resilient local sync.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'pending_approval',
  full_name TEXT,
  phone_number TEXT,
  specialty TEXT,
  institution_id TEXT,
  license_number TEXT,
  bio TEXT,
  consultation_hours TEXT,
  profile_picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_info (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  blood_type TEXT,
  allergies TEXT,
  chronic_diseases TEXT,
  critical_medications TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  head_doctor_id TEXT REFERENCES users(id),
  bed_capacity INTEGER DEFAULT 10,
  occupied_beds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  doctor_id TEXT REFERENCES users(id),
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export async function verifySupabaseConnection(): Promise<SupabaseStatus> {
  return { connected: false, tablesVerified: false, checking: false };
}

export async function syncFromSupabase<T>(tableName: string, defaultData: T[]): Promise<T[]> {
  console.log(`[Supabase Mock Engine] Syncing \${tableName} requested. Returned empty array.`);
  return [];
}

export async function syncEmergencyFromSupabase(defaultData: Record<string, EmergencyInfo>): Promise<Record<string, EmergencyInfo>> {
  console.log('[Supabase Mock Engine] Syncing emergencyInfo requested. Returned empty record.');
  return {};
}

export async function upsertUser(user: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertUser:', user?.id);
}

export async function deleteUserFromSupabase(userId: string): Promise<void> {
  console.log('[Supabase Mock Engine] deleteUserFromSupabase:', userId);
}

export async function upsertEmergency(userId: string, data: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertEmergency:', userId);
}

export async function upsertDepartment(dept: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertDepartment:', dept?.id);
}

export async function deleteDepartmentFromSupabase(deptId: string): Promise<void> {
  console.log('[Supabase Mock Engine] deleteDepartmentFromSupabase:', deptId);
}

export async function upsertMedicalRecord(record: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertMedicalRecord:', record?.id);
}

export async function upsertPrescription(rx: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertPrescription:', rx?.id);
}

export async function upsertLabResult(lab: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertLabResult:', lab?.id);
}

export async function upsertRadiology(rad: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertRadiology:', rad?.id);
}

export async function upsertNotification(notification: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertNotification:', notification?.id);
}

export async function upsertAuditLog(log: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertAuditLog:', log?.id);
}

export async function upsertProfessionalRequest(req: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertProfessionalRequest:', req?.id || req?.doctorUid);
}

export async function upsertInstitution(inst: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertInstitution:', inst?.id);
}

export async function deleteInstitutionFromSupabase(instId: string): Promise<void> {
  console.log('[Supabase Mock Engine] deleteInstitutionFromSupabase:', instId);
}

export async function upsertOrganizationRequest(req: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertOrganizationRequest:', req?.id);
}

export async function upsertClaim(claim: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertClaim:', claim?.id);
}

export async function upsertInsuranceCompany(company: any): Promise<void> {
  console.log('[Supabase Mock Engine] upsertInsuranceCompany:', company?.id);
}

export async function deleteInsuranceCompanyFromSupabase(companyId: string): Promise<void> {
  console.log('[Supabase Mock Engine] deleteInsuranceCompanyFromSupabase:', companyId);
}

export async function seedInitialDataToSupabase(...args: any[]): Promise<{ success: boolean; msg: string }> {
  console.log('[Supabase Mock Engine] seedInitialDataToSupabase stub');
  return { success: true, msg: 'Supabase offline or mocked' };
}
