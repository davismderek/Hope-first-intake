import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patient Intake | Hope First Wellness",
  description: "Complete your new patient intake form for Hope First Wellness.",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
