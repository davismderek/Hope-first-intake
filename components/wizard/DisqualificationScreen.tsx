"use client";

import { branding } from "@/config/branding";

interface Props {
  message: string;
}

export function DisqualificationScreen({ message }: Props) {
  return (
    <div className="text-center py-8 px-4">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-calm-800 mb-3">
        We&apos;re unable to proceed
      </h2>

      <p className="text-calm-600 leading-relaxed max-w-md mx-auto mb-8">
        {message}
      </p>

      <div className="space-y-3 text-sm text-calm-500">
        <p>If you have questions, please contact us:</p>
        <div className="space-y-1">
          {branding.supportEmail && (
            <p>
              <a href={`mailto:${branding.supportEmail}`} className="text-brand-600 hover:underline">
                {branding.supportEmail}
              </a>
            </p>
          )}
          {branding.supportPhone && (
            <p>
              <a href={`tel:${branding.supportPhone}`} className="text-brand-600 hover:underline">
                {branding.supportPhone}
              </a>
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <a
          href={branding.websiteUrl}
          className="inline-block rounded-lg border border-calm-200 px-6 py-2.5 text-sm font-medium
                     text-calm-700 hover:bg-calm-50 transition-colors"
        >
          Return to Website
        </a>
      </div>
    </div>
  );
}
