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
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-stone-50 px-6 text-center dark:bg-stone-950">
      <div className="text-5xl">🏆</div>
      <div>
        <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-100">
          Rank Your Niche
        </h1>
        <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">
          Sign in to create and access your own private ranking lists.
        </p>
      </div>
      <button
        type="button"
        onClick={handleSignIn}
        className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
      >
        Sign in with Google
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
