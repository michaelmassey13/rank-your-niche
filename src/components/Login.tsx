import { useState } from "react";
import { useAuth } from "../auth";

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError("Sign-in failed. Please try again.");
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 bg-paper px-6 text-center font-body dark:bg-paper-dark">
      <div>
        <div className="font-display text-5xl font-black uppercase tracking-tight text-ink dark:text-ink-dark">
          Rank Your Niche
        </div>
        <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.35em] text-ink/50 dark:text-ink-dark/50">
          A Reader's Ranking Almanac
        </div>
      </div>

      <div className="w-full max-w-xs border-y-4 border-double border-ink py-6 dark:border-ink-dark">
        <p className="font-body italic text-sm text-ink/70 dark:text-ink-dark/70">
          Subscriber access only. Sign in to file and read your private standings.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSignIn}
        className="border border-ink px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-ink hover:bg-ink hover:text-paper dark:border-ink-dark dark:text-ink-dark dark:hover:bg-ink-dark dark:hover:text-paper-dark"
      >
        Sign in with Google
      </button>
      {error && <p className="font-mono text-xs text-rule dark:text-rule-dark">{error}</p>}
    </div>
  );
}
