import { NextResponse } from "next/server";
import type { IntakeSubmission } from "@/types";
import {
  createPatient,
  createAppointment,
  uploadConsentDocument,
  syncPaymentMetadata,
} from "@/lib/integrations/drchrono/client";
import { mapPatientData, mapAppointmentData } from "@/lib/integrations/drchrono/field-mapping";

export async function POST(request: Request) {
  try {
    const submission: IntakeSubmission = await request.json();

    const doctorId = parseInt(process.env.DRCHRONO_DOCTOR_ID ?? "1", 10);
    const officeId = parseInt(process.env.DRCHRONO_OFFICE_ID ?? "1", 10);
    const examRoom = parseInt(process.env.DRCHRONO_EXAM_ROOM ?? "1", 10);

    const patientPayload = mapPatientData(submission, doctorId);
    const patient = await createPatient(patientPayload);

    const appointmentPayload = mapAppointmentData(
      submission,
      patient.id,
      doctorId,
      officeId,
      examRoom
    );
    const appointment = await createAppointment(appointmentPayload);

    for (const consent of submission.consents) {
      if (consent.acknowledged) {
        await uploadConsentDocument(
          patient.id,
          consent.formTitle,
          consent.acknowledgedAt ?? new Date().toISOString()
        );
      }
    }

    if (submission.stripe.customerId) {
      await syncPaymentMetadata(
        patient.id,
        submission.stripe.customerId,
        submission.stripe.paymentMethodId
      );
    }

    return NextResponse.json({
      success: true,
      drchrono: {
        patientId: patient.id,
        appointmentId: appointment.id,
      },
    });
  } catch (error) {
    console.error("Submission failed:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
