"use client";

import { useState } from "react";
import { HEAD_COACH_SCOPE } from "@/lib/auth";

export function TeamLoginForm({
  scope,
  label,
}: {
  scope: string;
  label: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_slug: scope, password }),
    });
    if (res.ok) {
      // Head coach → home (all teams). Team scope → straight to their team page.
      const dest = scope === HEAD_COACH_SCOPE ? "/home" : `/teams/${scope}`;
      window.location.href = dest;
      return;
    }
    setError("Wrong password");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">
          {label} password
        </span>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          required
        />
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
