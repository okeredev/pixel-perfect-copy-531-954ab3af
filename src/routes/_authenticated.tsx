import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, FilePlus2, User as UserIcon, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading, isStaff } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
    return null;
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:gap-8 lg:py-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-card/60 p-2 lg:flex-col lg:p-3">
          <SideLink to="/dashboard" icon={<LayoutDashboard size={15} />}>Dashboard</SideLink>
          <SideLink to="/submissions/new" icon={<FilePlus2 size={15} />}>New Submission</SideLink>
          <SideLink to="/profile" icon={<UserIcon size={15} />}>Profile</SideLink>
          {isStaff && (
            <SideLink to="/admin" icon={<ShieldCheck size={15} />}>Admin</SideLink>
          )}
        </nav>
        <p className="mt-4 hidden px-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground lg:block">
          Signed in as
        </p>
        <p className="hidden px-2 text-sm text-foreground lg:block">{user.email}</p>
      </aside>

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}

function SideLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-primary"
      activeProps={{ className: "bg-accent text-primary font-medium" }}
    >
      {icon}
      {children}
    </Link>
  );
}
