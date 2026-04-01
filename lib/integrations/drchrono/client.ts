import type {
  DrChronoPatient,
  DrChronoAppointment,
  DrChronoAvailabilityResponse,
} from "./types";
import { getMockAvailability, MOCK_PATIENT_ID, MOCK_APPOINTMENT_ID } from "./mock";
import { getValidAccessToken } from "./oauth";

const BASE_URL = "https://app.drchrono.com/api";
const isMockMode = () => process.env.DRCHRONO_MOCK_MODE === "true";

async function drchronoFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getValidAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // On 401, force-refresh the token and retry once
  if (res.status === 401) {
    const freshToken = await getValidAccessToken(true);
    return fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${freshToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  return res;
}

export async function createPatient(
  patient: Omit<DrChronoPatient, "id">
): Promise<{ id: number }> {
  if (isMockMode()) {
    console.log("[DrChrono Mock] Creating patient:", patient.first_name, patient.last_name);
    return { id: MOCK_PATIENT_ID };
  }

  const res = await drchronoFetch("/patients", {
    method: "POST",
    body: JSON.stringify(patient),
  });

  if (!res.ok) {
    throw new Error(`DrChrono createPatient failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export async function updatePatient(
  patientId: number,
  data: Partial<DrChronoPatient>
): Promise<void> {
  if (isMockMode()) {
    console.log("[DrChrono Mock] Updating patient:", patientId);
    return;
  }

  const res = await drchronoFetch(`/patients/${patientId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`DrChrono updatePatient failed: ${res.status} ${await res.text()}`);
  }
}

export async function getAvailability(
  date: string,
  doctorId?: number
): Promise<DrChronoAvailabilityResponse> {
  if (isMockMode()) {
    return getMockAvailability(date);
  }

  const params = new URLSearchParams({
    date,
    doctor: (doctorId ?? process.env.DRCHRONO_DOCTOR_ID ?? "").toString(),
    office: process.env.DRCHRONO_OFFICE_ID ?? "",
  });

  const res = await drchronoFetch(`/appointments?${params}`);

  if (!res.ok) {
    throw new Error(`DrChrono getAvailability failed: ${res.status}`);
  }

  return res.json();
}

export async function createAppointment(
  appointment: Omit<DrChronoAppointment, "id">
): Promise<{ id: number }> {
  if (isMockMode()) {
    console.log("[DrChrono Mock] Creating appointment:", appointment.scheduled_time);
    return { id: MOCK_APPOINTMENT_ID };
  }

  const res = await drchronoFetch("/appointments", {
    method: "POST",
    body: JSON.stringify(appointment),
  });

  if (!res.ok) {
    throw new Error(`DrChrono createAppointment failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export async function uploadConsentDocument(
  _patientId: number,
  _documentName: string,
  _acknowledgedAt: string
): Promise<void> {
  if (isMockMode()) {
    console.log("[DrChrono Mock] Uploading consent document:", _documentName);
    return;
  }

  // TODO: Implement DrChrono document upload
  // POST /api/documents with patient, document type, and file/metadata
}

export async function syncPaymentMetadata(
  _patientId: number,
  _stripeCustomerId: string,
  _stripePaymentMethodId: string
): Promise<void> {
  if (isMockMode()) {
    console.log("[DrChrono Mock] Syncing payment metadata for patient:", _patientId);
    return;
  }

  // TODO: Use updatePatient() to store Stripe IDs in custom demographics
}
