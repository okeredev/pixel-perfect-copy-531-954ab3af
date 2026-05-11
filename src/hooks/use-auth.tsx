import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "editor" | "reviewer" | "author";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  roles: AppRole[];
  isStaff: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    // Subscribe FIRST, then read existing session.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) setRoles([]);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Load roles whenever the user changes — defer to avoid blocking the auth callback.
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) return;
    let cancelled = false;

    async function fetchRoles() {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid!);
      if (cancelled) return;
      if (error) {
        console.error("[useAuth] Failed to load roles:", error.message);
        // Retry once after a short delay (RLS policies may take a moment after login)
        setTimeout(async () => {
          const retry = await supabase.from("user_roles").select("role").eq("user_id", uid!);
          if (!cancelled && retry.data) {
            setRoles(retry.data.map((r) => r.role as AppRole));
          }
        }, 1500);
        return;
      }
      setRoles((data ?? []).map((r) => r.role as AppRole));
    }

    // Small delay to let auth session propagate
    setTimeout(fetchRoles, 100);
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    loading,
    roles,
    isStaff: roles.includes("admin") || roles.includes("editor"),
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
