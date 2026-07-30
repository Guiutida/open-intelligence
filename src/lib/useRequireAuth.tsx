import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export function useRequireAuth(redirectTo = "/login") {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // If Supabase isn't configured, treat as unauthenticated (redirect)
      window.location.href = redirectTo;
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        if (!data?.session) {
          window.location.href = redirectTo;
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) window.location.href = redirectTo;
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.href = redirectTo;
    });

    return () => {
      mounted = false;
      try {
        sub.subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, [redirectTo]);

  return loading;
}
