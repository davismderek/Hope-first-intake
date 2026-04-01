// ============================================================================
// Core application data types
// ============================================================================

export interface PatientInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  cellPhone: string;
  address: AddressInfo;
  sex: "male" | "female";
}

export interface AddressInfo {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface AppointmentSelection {
  date: string;
  time: string;
  slotId?: string;
  doctorId?: string;
  officeId?: string;
}

export interface ConsentAcknowledgment {
  formId: string;
  formTitle: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface ReferralInfo {
  source: string;
  referrerName?: string;
}

export interface StripeReferences {
  customerId: string;
  paymentMethodId: string;
  setupIntentId: string;
}

export interface DrChronoReferences {
  patientId?: string;
  appointmentId?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  disqualifiedAt?: string;
  reason?: string;
  message?: string;
}

/** Complete intake submission payload sent to the backend */
export interface IntakeSubmission {
  patient: PatientInfo;
  emergencyContact: EmergencyContact;
  appointment: AppointmentSelection;
  consents: ConsentAcknowledgment[];
  referral: ReferralInfo;
  stripe: StripeReferences;
  drchrono: DrChronoReferences;
  eligibility: EligibilityResult;
  responses: Record<string, Record<string, unknown>>;
  submittedAt: string;
}
