"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Coach Dad</h1>
        <p className="text-muted-foreground">Sign in with magic link</p>
      </div>

      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center max-w-sm">
          <p className="text-green-800 font-medium">Check your email!</p>
          <p className="text-green-600 text-sm mt-1">
            We sent a magic link to {email}
          </p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ryan.mchaffie@gmail.com"
            className="w-full px-4 py-3 border rounded-lg text-base"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-medium py-3 rounded-lg active:bg-slate-800 min-h-[48px]"
          >
            Send Magic Link
          </button>
        </form>
      )}
    </div>
  );
}
