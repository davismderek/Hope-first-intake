import type { DrChronoPatient, DrChronoAppointment } from "./types";
import type { IntakeSubmission } from "@/types";

// ============================================================================
// Field mapping: Wizard data → DrChrono payloads
//
// Edit these functions when DrChrono field names change or
// when you add custom demographics fields.
// ============================================================================

export function mapPatientData(
  submission: IntakeSubmission,
  doctorId: number
): Omit<DrChronoPatient, "id"> {
  const { patient, emergencyContact } = submission;

  return {
    first_name: patient.firstName,
    last_name: patient.lastName,
    date_of_birth: patient.dateOfBirth,
    email: patient.email,
    cell_phone: patient.cellPhone,
    address: patient.address.street,
    city: patient.address.city,
    state: patient.address.state,
    zip_code: patient.address.zipCode,
    gender: patient.sex === "male" ? "Male" : "Female",
    doctor: doctorId,
    emergency_contact_name: emergencyContact.name,
    emergency_contact_phone: emergencyContact.phone,
    emergency_contact_relation: emergencyContact.relationship,
    custom_demographics: [
      {
        field_type: "referral_source",
        field_value: submission.referral.source,
      },
      ...(submission.referral.referrerName
        ? [
            {
              field_type: "referrer_name",
              field_value: submission.referral.referrerName,
            },
          ]
        : []),
      {
        field_type: "stripe_customer_id",
        field_value: submission.stripe.customerId,
      },
    ],
  };
}

export function mapAppointmentData(
  submission: IntakeSubmission,
  patientId: number,
  doctorId: number,
  officeId: number,
  examRoom: number
): Omit<DrChronoAppointment, "id"> {
  const { appointment } = submission;

  return {
    doctor: doctorId,
    patient: patientId,
    office: officeId,
    exam_room: examRoom,
    scheduled_time: `${appointment.date}T${appointment.time}:00`,
    duration: 60,
    reason: "Initial Evaluation",
    notes: submission.responses["treatment-reason"]?.treatmentReason as string ?? "",
  };
}
