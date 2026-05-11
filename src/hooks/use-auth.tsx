import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "editor" | "reviewer" | "author";

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  roles: AppRole[];
  isStaff: boolean;
  isProfileComplete: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  async function fetchProfile(uid: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) setProfile(data);
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setRoles([]);
        setProfile(null);
      } else {
        fetchProfile(s.user.id);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchProfile(data.session.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

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

    setTimeout(fetchRoles, 100);
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  const isProfileComplete = !!(
    profile?.full_name &&
    profile?.affiliation &&
    profile?.country &&
    profile?.phone
  );

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    roles,
    isStaff: roles.includes("admin") || roles.includes("editor"),
    isProfileComplete,
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refreshProfile: async () => {
      if (session?.user?.id) await fetchProfile(session.user.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
