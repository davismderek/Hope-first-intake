import type { DrChronoAvailabilityResponse, DrChronoTimeSlot } from "./types";

// ============================================================================
// Mock DrChrono data for local development
// ============================================================================

export const MOCK_PATIENT_ID = 99001;
export const MOCK_APPOINTMENT_ID = 88001;
export const MOCK_DOCTOR_ID = 1;
export const MOCK_OFFICE_ID = 1;

const SLOT_TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];

/**
 * Generates mock availability for a given date.
 * Weekends have no slots. Weekdays get a pseudorandom subset of time slots.
 */
export function getMockAvailability(date: string): DrChronoAvailabilityResponse {
  const d = new Date(date + "T00:00:00");
  const dayOfWeek = d.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { date, slots: [] };
  }

  // Use date as a simple seed for deterministic "random" availability
  const seed = d.getDate() + d.getMonth() * 31;
  const availableSlots: DrChronoTimeSlot[] = SLOT_TIMES
    .filter((_, i) => (seed + i * 7) % 3 !== 0)
    .map((time) => ({
      date,
      time,
      duration: 60,
      doctor: MOCK_DOCTOR_ID,
      office: MOCK_OFFICE_ID,
    }));

  return { date, slots: availableSlots };
}
