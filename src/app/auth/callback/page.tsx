"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check for session via subscription to handle async auth state changes
    // This catches both 'INITIAL_SESSION' (if already valid) and 'SIGNED_IN' (after exchange)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === "SIGNED_OUT") {
        // handle sign out if necessary, or do nothing and let the user stay here/redirect to login
        router.push("/login");
      } else if (session) {
        router.push("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Authenticating...</h2>
        <p className="text-gray-500">Please wait while we log you in.</p>
        {/* Simple loading spinner */}
        <div className="mt-4 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
