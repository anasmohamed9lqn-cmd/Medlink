using Google.Cloud.Firestore;

namespace NileHealth.Api.Models
{
    [FirestoreData]
    public class User
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("email")]
        public string Email { get; set; } = string.Empty;

        [FirestoreProperty("fullName")]
        public string FullName { get; set; } = string.Empty;

        [FirestoreProperty("role")]
        public string Role { get; set; } = string.Empty; // admin, doctor, patient, insurance

        [FirestoreProperty("status")]
        public string Status { get; set; } = string.Empty; // Pending, Active, Suspended, Declined

        [FirestoreProperty("nationalId")]
        public string? NationalId { get; set; }

        [FirestoreProperty("medicalLicenseNumber")]
        public string? MedicalLicenseNumber { get; set; }

        [FirestoreProperty("specialty")]
        public string? Specialty { get; set; }

        [FirestoreProperty("institutionId")]
        public string? InstitutionId { get; set; }

        [FirestoreProperty("institutionName")]
        public string? InstitutionName { get; set; }

        [FirestoreProperty("phone")]
        public string? Phone { get; set; }

        [FirestoreProperty("dateOfBirth")]
        public string? DateOfBirth { get; set; }

        [FirestoreProperty("gender")]
        public string? Gender { get; set; }

        [FirestoreProperty("bloodType")]
        public string? BloodType { get; set; }

        [FirestoreProperty("insuranceCompany")]
        public string? InsuranceCompany { get; set; }

        [FirestoreProperty("insuranceCompanyId")]
        public string? InsuranceCompanyId { get; set; }

        [FirestoreProperty("employeeId")]
        public string? EmployeeId { get; set; }

        [FirestoreProperty("insuranceDepartment")]
        public string? InsuranceDepartment { get; set; }
    }

    [FirestoreData]
    public class MedicalRecord
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [FirestoreProperty("doctorName")]
        public string DoctorName { get; set; } = string.Empty;

        [FirestoreProperty("doctorLicense")]
        public string DoctorLicense { get; set; } = string.Empty;

        [FirestoreProperty("diagnosis")]
        public string Diagnosis { get; set; } = string.Empty;

        [FirestoreProperty("symptoms")]
        public string Symptoms { get; set; } = string.Empty;

        [FirestoreProperty("treatmentPlan")]
        public string TreatmentPlan { get; set; } = string.Empty;

        [FirestoreProperty("date")]
        public string Date { get; set; } = string.Empty;
    }

    [FirestoreData]
    public class Prescription
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [FirestoreProperty("doctorName")]
        public string DoctorName { get; set; } = string.Empty;

        [FirestoreProperty("medicationName")]
        public string MedicationName { get; set; } = string.Empty;

        [FirestoreProperty("dosage")]
        public string Dosage { get; set; } = string.Empty;

        [FirestoreProperty("frequency")]
        public string Frequency { get; set; } = string.Empty;

        [FirestoreProperty("duration")]
        public string Duration { get; set; } = string.Empty;

        [FirestoreProperty("date")]
        public string Date { get; set; } = string.Empty;
    }

    [FirestoreData]
    public class LabResult
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [FirestoreProperty("testName")]
        public string TestName { get; set; } = string.Empty;

        [FirestoreProperty("parameters")]
        public string Parameters { get; set; } = string.Empty;

        [FirestoreProperty("normalRange")]
        public string NormalRange { get; set; } = string.Empty;

        [FirestoreProperty("outcome")]
        public string Outcome { get; set; } = string.Empty;

        [FirestoreProperty("findings")]
        public string Findings { get; set; } = string.Empty;

        [FirestoreProperty("date")]
        public string Date { get; set; } = string.Empty;
    }

    [FirestoreData]
    public class RadiologyReport
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [FirestoreProperty("scanType")]
        public string ScanType { get; set; } = string.Empty;

        [FirestoreProperty("findings")]
        public string Findings { get; set; } = string.Empty;

        [FirestoreProperty("imageUrl")]
        public string ImageUrl { get; set; } = string.Empty; // Now stores the Direct Link instead of image thumbnail preview

        [FirestoreProperty("date")]
        public string Date { get; set; } = string.Empty;
    }

    [FirestoreData]
    public class MedicalInstitution
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("name")]
        public string Name { get; set; } = string.Empty;

        [FirestoreProperty("type")]
        public string Type { get; set; } = string.Empty; // Public Hospital, Private Hospital, University Clinic, Medical Syndicate

        [FirestoreProperty("code")]
        public string Code { get; set; } = string.Empty;

        [FirestoreProperty("location")]
        public string Location { get; set; } = string.Empty;

        [FirestoreProperty("status")]
        public string Status { get; set; } = "Active";
    }

    [FirestoreData]
    public class OrganizationRequest
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("name")]
        public string Name { get; set; } = string.Empty;

        [FirestoreProperty("type")]
        public string Type { get; set; } = string.Empty;

        [FirestoreProperty("code")]
        public string Code { get; set; } = string.Empty;

        [FirestoreProperty("location")]
        public string Location { get; set; } = string.Empty;

        [FirestoreProperty("status")]
        public string Status { get; set; } = "pending";

        [FirestoreProperty("createdAt")]
        public string CreatedAt { get; set; } = string.Empty;
    }

    [FirestoreData]
    public class Claim
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [FirestoreProperty("patientName")]
        public string PatientName { get; set; } = string.Empty;

        [FirestoreProperty("patientMedicalId")]
        public string PatientMedicalId { get; set; } = string.Empty;

        [FirestoreProperty("policyNumber")]
        public string PolicyNumber { get; set; } = string.Empty;

        [FirestoreProperty("coverageType")]
        public string CoverageType { get; set; } = string.Empty;

        [FirestoreProperty("doctorName")]
        public string DoctorName { get; set; } = string.Empty;

        [FirestoreProperty("diagnosis")]
        public string Diagnosis { get; set; } = string.Empty;

        [FirestoreProperty("cost")]
        public double Cost { get; set; }

        [FirestoreProperty("status")]
        public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED, DISPUTED

        [FirestoreProperty("date")]
        public string Date { get; set; } = string.Empty;

        [FirestoreProperty("rejectionReason")]
        public string? RejectionReason { get; set; }

        [FirestoreProperty("settledDate")]
        public string? SettledDate { get; set; }
    }
}
