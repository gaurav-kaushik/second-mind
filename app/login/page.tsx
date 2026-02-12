"use client";

import { useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) return;

      setIsLoading(true);
      setError("");

      try {
        const supabase = createBrowserClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        router.push("/");
        router.refresh();
      } catch {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, router]
  );

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm mx-4">
        <h1 className="text-2xl font-light tracking-tight text-foreground text-center mb-8">
          Second Mind
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-transparent text-foreground text-[16px] leading-6 outline-none placeholder:text-muted/60 border-b border-border/40 pb-3 font-sans"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-foreground text-[16px] leading-6 outline-none placeholder:text-muted/60 border-b border-border/40 pb-3 font-sans"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-muted italic">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-sm text-foreground border border-border/60 rounded-lg hover:bg-accent/30 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
