import { Suspense } from "react";
import { DrChronoAdminClient } from "./drchrono-admin-client";

export default function DrChronoAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      }
    >
      <DrChronoAdminClient />
    </Suspense>
  );
}
