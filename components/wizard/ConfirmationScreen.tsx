"use client";

import { useWizard } from "@/lib/wizard/context";
import { branding } from "@/config/branding";

export function ConfirmationScreen() {
  const { state } = useWizard();

  const contactData = (state.formData["contact-details"] ?? {}) as Record<string, unknown>;
  const appointment = state.selectedAppointment;

  const appointmentLabel = appointment
    ? formatAppointmentDate(appointment.date, appointment.time)
    : "your upcoming appointment";

  return (
    <div className="text-center py-8 px-4">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold text-calm-800 mb-3">
        You&apos;re All Set!
      </h2>

      <p className="text-calm-600 leading-relaxed max-w-lg mx-auto mb-8">
        We look forward to seeing you at {appointmentLabel}.
      </p>

      {/* Summary card */}
      <div className="mx-auto max-w-sm rounded-lg border border-calm-200 bg-calm-50 p-5 text-left space-y-3">
        <h3 className="text-sm font-semibold text-calm-700 uppercase tracking-wide">
          Appointment Summary
        </h3>

        {typeof contactData.firstName === "string" && contactData.firstName && (
          <div className="text-sm">
            <span className="text-calm-500">Patient: </span>
            <span className="text-calm-800 font-medium">
              {String(contactData.firstName)} {String(contactData.lastName ?? "")}
            </span>
          </div>
        )}

        {appointment && (
          <div className="text-sm">
            <span className="text-calm-500">Date & Time: </span>
            <span className="text-calm-800 font-medium">
              {formatAppointmentDate(appointment.date, appointment.time)}
            </span>
          </div>
        )}

        <div className="text-sm">
          <span className="text-calm-500">Type: </span>
          <span className="text-calm-800 font-medium">Initial Evaluation (60–90 min)</span>
        </div>

        <div className="text-sm">
          <span className="text-calm-500">Format: </span>
          <span className="text-calm-800 font-medium">Virtual (Video)</span>
        </div>
      </div>

      <div className="mt-8">
        <a
          href={branding.websiteUrl}
          className="inline-block rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium
                     text-white hover:bg-brand-600 transition-colors"
        >
          Return to Website
        </a>
      </div>
    </div>
  );
}

function formatAppointmentDate(date: string, time: string): string {
  try {
    const d = new Date(`${date}T${time}:00`);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return `${date} at ${time}`;
  }
}
