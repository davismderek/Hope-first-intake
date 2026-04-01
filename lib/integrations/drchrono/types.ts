// ============================================================================
// DrChrono API types
// ============================================================================

export interface DrChronoPatient {
  id?: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  cell_phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  gender: "Male" | "Female" | "Other" | "UNK" | "ASKU";
  doctor: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  custom_demographics?: DrChronoCustomField[];
}

export interface DrChronoCustomField {
  field_type: string;
  field_value: string;
}

export interface DrChronoAppointment {
  id?: number;
  doctor: number;
  patient: number;
  office: number;
  exam_room: number;
  scheduled_time: string;
  duration: number;
  status?: string;
  reason?: string;
  notes?: string;
}

export interface DrChronoTimeSlot {
  date: string;
  time: string;
  duration: number;
  doctor: number;
  office: number;
  exam_room?: number;
}

export interface DrChronoAvailabilityResponse {
  date: string;
  slots: DrChronoTimeSlot[];
}

