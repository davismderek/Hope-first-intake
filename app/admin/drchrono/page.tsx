"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface ConnectionStatus {
  connected: boolean;
  expiresAt?: string;
  expiresInMinutes?: number;
  isExpired?: boolean;
  error?: string;
}

export default function DrChronoAdminPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const flashError = searchParams.get("error");
  const flashConnected = searchParams.get("connected");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/drchrono/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ connected: false, error: "Failed to check status" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function handleConnect() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/drchrono/auth-url");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Failed to generate authorization URL");
        setActionLoading(false);
      }
    } catch {
      alert("Failed to start OAuth flow");
      setActionLoading(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect DrChrono? You will need to re-authorize.")) return;
    setActionLoading(true);
    try {
      await fetch("/api/drchrono/disconnect", { method: "POST" });
      await fetchStatus();
    } catch {
      alert("Failed to disconnect");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md max-w-lg w-full p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">DrChrono Connection</h1>
        <p className="text-gray-500 text-sm mb-6">
          Manage the OAuth connection to DrChrono for patient and appointment data.
        </p>

        {flashError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {flashError}
          </div>
        )}

        {flashConnected && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
            DrChrono connected successfully.
          </div>
        )}

        {loading ? (
          <div className="text-gray-400 text-sm">Checking connection...</div>
        ) : status?.error && !status.connected ? (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            {status.error}
          </div>
        ) : status?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${status.isExpired ? "bg-red-500" : "bg-green-500"}`} />
              <span className="font-medium text-gray-900">
                {status.isExpired ? "Token Expired" : "Connected"}
              </span>
            </div>

            <dl className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <dt className="font-medium">Token expires</dt>
                <dd>{status.expiresAt ? new Date(status.expiresAt).toLocaleString() : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Time remaining</dt>
                <dd>
                  {status.isExpired
                    ? "Expired — will auto-refresh on next request"
                    : `${status.expiresInMinutes} minutes`}
                </dd>
              </div>
            </dl>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConnect}
                disabled={actionLoading}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                {actionLoading ? "..." : "Reconnect"}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 disabled:opacity-50"
              >
                {actionLoading ? "..." : "Disconnect"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />
              <span className="font-medium text-gray-900">Not Connected</span>
            </div>

            <p className="text-sm text-gray-500">
              Click below to authorize this application with DrChrono.
              You will be redirected to DrChrono to log in and grant access.
            </p>

            <button
              onClick={handleConnect}
              disabled={actionLoading}
              className="px-5 py-2.5 text-sm font-medium bg-[#3d8d6c] text-white rounded hover:bg-[#2d7156] disabled:opacity-50"
            >
              {actionLoading ? "Redirecting..." : "Connect DrChrono"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
