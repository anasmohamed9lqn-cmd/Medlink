# Firestore Security Specification

This document defines the security boundaries, data invariants, and verification scenarios for the MedLink Firestore security rules.

## Data Invariants

1. **User Identity Isolation**: A user's profile, emergency clinical details, onboarding requests, and notifications must only be accessible by that specific user.
2. **Access Control**: No user can read, list, or write another user's personal files, records, or clinical documents unless authorized (e.g., as the patient or the attending practitioner).
3. **Write/Update Control**: Users cannot impersonate others or update immutable fields (such as `createdAt`, `userId`, `patientId`) once written.

## The "Dirty Dozen" Malicious Payloads

The following is a suite of test payloads designed to attempt to bypass security bounds. The ruleset must strictly reject each of these with `PERMISSION_DENIED`.

### 1. User Profile Hijack
An authenticated user `attacker_uid` attempts to update the profile document of `victim_uid`.
```json
{
  "path": "users/victim_uid",
  "auth": { "uid": "attacker_uid" },
  "method": "update",
  "data": { "fullName": "Attacker Hack" }
}
```

### 2. Emergency Information Snooping
An authenticated user `attacker_uid` attempts to read the critical clinical details of `victim_uid`'s emergency card.
```json
{
  "path": "emergencyInfo/victim_uid",
  "auth": { "uid": "attacker_uid" },
  "method": "get",
  "data": null
}
```

### 3. Medical Record Scraping (Mass Read Request)
A patient `patient_uid` attempts to query or read all medical records globally without a filter.
```json
{
  "path": "medicalRecords",
  "auth": { "uid": "patient_uid" },
  "method": "list",
  "data": null
}
```

### 4. Direct Foreign Prescription Inject
An attacker attempts to insert a prescription document with another doctor's signature or for another patient.
```json
{
  "path": "prescriptions/rx-123",
  "auth": { "uid": "attacker_uid" },
  "method": "create",
  "data": {
    "patientId": "victim_uid",
    "doctorId": "attacker_uid",
    "medicationName": "Controlled Substance"
  }
}
```

### 5. Onboarding Verification Tampering
A pending doctor `doctor_uid` attempts to approve their own onboarding status request.
```json
{
  "path": "doctorRequests/doctor_uid",
  "auth": { "uid": "doctor_uid" },
  "method": "update",
  "data": { "status": "approved" }
}
```

### 6. Notification Spoofing
An attacker attempts to write an alert notification to another patient's feed.
```json
{
  "path": "notifications/notif-abc",
  "auth": { "uid": "attacker_uid" },
  "method": "create",
  "data": {
    "userId": "victim_uid",
    "title": "Compromised feed detail"
  }
}
```

### 7. Audit Log Forgery
An attacker attempts to modify a historical audit trail document to clear their actions.
```json
{
  "path": "auditLogs/log-999",
  "auth": { "uid": "attacker_uid" },
  "method": "update",
  "data": { "action": "authorized" }
}
```

### 8. Shadow Field Exposure
An attacker attempts to add an un-modeled administrative privilege field in their user document path.
```json
{
  "path": "users/attacker_uid",
  "auth": { "uid": "attacker_uid" },
  "method": "update",
  "data": { "adminRole": "SUPER" }
}
```

### 9. Claim Escalation
An insurer or patient attempts to update a payment or claim cost after submission or without proper credentials.
```json
{
  "path": "claims/claim-xyz",
  "auth": { "uid": "attacker_uid" },
  "method": "update",
  "data": { "cost": 99999 }
}
```

### 10. Radiology Report Overwrite
An attacker attempts to modify findings coordinates on radiology studies.
```json
{
  "path": "radiologyReports/rad-xyz",
  "auth": { "uid": "attacker_uid" },
  "method": "update",
  "data": { "findings": "All clear" }
}
```

### 11. Laboratory Order Spoofing
A patient attempts to inject an authorized clinical request directly into laboratory records.
```json
{
  "path": "labResults/lab-xyz",
  "auth": { "uid": "patient_uid" },
  "method": "create",
  "data": { "patientId": "patient_uid", "status": "NORMAL" }
}
```

### 12. Organization Request Sabotage
An attacker attempts to approve or delete a pending request submitted by another requester.
```json
{
  "path": "organizationRequests/req-xyz",
  "auth": { "uid": "attacker_uid" },
  "method": "update",
  "data": { "status": "APPROVED" }
}
```

## Security Test Cases Execution Blueprint

The conceptual Javascript test runner using `@firebase/rules-unit-testing` checks that each of these "Dirty Dozen" payloads yields a clear rejection.

```typescript
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

describe('Zero-Trust Firestore Security Rules Test Suite', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'ai-studio-medlink-secure',
    });
  });

  it('declares User Profile Hijack fails', async () => {
    const context = testEnv.authenticatedContext('attacker_uid');
    await assertFails(context.firestore().doc('users/victim_uid').set({ fullName: 'Attacker Hack' }));
  });

  it('declares Emergency Info Snooping fails', async () => {
    const context = testEnv.authenticatedContext('attacker_uid');
    await assertFails(context.firestore().doc('emergencyInfo/victim_uid').get());
  });
});
```
