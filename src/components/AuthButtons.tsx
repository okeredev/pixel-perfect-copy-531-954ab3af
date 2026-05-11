import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User as UserIcon, ShieldCheck } from "lucide-react";

export function AuthButtons() {
  const { user, signOut, loading, isStaff } = useAuth();
  if (loading) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors"
        >
          Sign in
        </Link>
        <Link
          to="/signup"
          className="rounded-full bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95"
        >
          Submit
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isStaff && (
        <Link
          to="/admin"
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all"
        >
          <ShieldCheck size={14} className="animate-pulse" /> Admin
        </Link>
      )}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-xs font-black uppercase tracking-widest text-foreground/70 hover:border-primary hover:text-primary hover:shadow-sm transition-all"
      >
        <UserIcon size={14} />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
      <button
        onClick={signOut}
        title="Sign out"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-foreground/40 hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-all"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
