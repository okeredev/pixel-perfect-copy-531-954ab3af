import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileStack, UserCog, Settings, History, LayoutDashboard, Menu, X, ChevronRight, CreditCard, ClipboardCheck, BookOpen, Megaphone, BarChart3, ShieldCheck } from "lucide-react";

export type Tab = "overview" | "submissions" | "users" | "payments" | "reviews" | "content" | "announcements" | "analytics" | "settings" | "audit";

interface AdminSidebarProps {
  activeTab: Tab;
  setTab: (tab: Tab) => void;
  isAdmin: boolean;
}

type SidebarSection = {
  title: string;
  items: { id: Tab; label: string; icon: React.ReactNode; adminOnly?: boolean; badge?: number }[];
};

export function AdminSidebar({ activeTab, setTab, isAdmin }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badges, setBadges] = useState<{ pendingPayments: number; pendingReviews: number; pendingSubmissions: number }>({ pendingPayments: 0, pendingReviews: 0, pendingSubmissions: 0 });

  useEffect(() => {
    async function loadBadges() {
      const [pay, rev, sub] = await Promise.all([
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("payment_status", "pending").neq("status", "draft"),
        supabase.from("submission_reviewers").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "submitted"),
      ]);
      setBadges({ pendingPayments: pay.count ?? 0, pendingReviews: rev.count ?? 0, pendingSubmissions: sub.count ?? 0 });
    }
    loadBadges();
    const interval = setInterval(loadBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  const sections: SidebarSection[] = [
    {
      title: "Dashboard",
      items: [
        { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
        { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} />, adminOnly: true },
      ],
    },
    {
      title: "Editorial",
      items: [
        { id: "submissions", label: "Submissions", icon: <FileStack size={16} />, badge: badges.pendingSubmissions },
        { id: "reviews", label: "Reviews", icon: <ClipboardCheck size={16} />, badge: badges.pendingReviews },
        { id: "content", label: "Published", icon: <BookOpen size={16} /> },
      ],
    },
    {
      title: "Financial",
      items: [
        { id: "payments", label: "Payments", icon: <CreditCard size={16} />, badge: badges.pendingPayments },
      ],
    },
    {
      title: "System",
      items: [
        { id: "users", label: "Users", icon: <UserCog size={16} /> },
        { id: "announcements", label: "Announcements", icon: <Megaphone size={16} />, adminOnly: true },
        { id: "settings", label: "Settings", icon: <Settings size={16} />, adminOnly: true },
        { id: "audit", label: "Audit Logs", icon: <History size={16} />, adminOnly: true },
      ],
    },
  ];

  const visibleSections = sections.map((s) => ({
    ...s,
    items: s.items.filter((t) => !t.adminOnly || isAdmin),
  })).filter((s) => s.items.length > 0);

  const allTabs = visibleSections.flatMap((s) => s.items);
  const activeItem = allTabs.find((t) => t.id === activeTab);

  const handleTabClick = (tabId: Tab) => {
    setTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md px-5 py-4 text-sm font-bold text-primary shadow-lg ring-1 ring-primary/10 transition-all active:scale-[0.98]"
        >
          <span className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              {activeItem?.icon}
            </span>
            {activeItem?.label ?? "Menu"}
          </span>
          <div className={`transition-transform duration-300 ${mobileOpen ? "rotate-90" : "rotate-0"}`}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </div>
        </button>

        {mobileOpen && (
          <nav className="mt-3 flex flex-col gap-1 rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl p-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-50">
            {visibleSections.map((section) => (
              <div key={section.title} className="mb-2 last:mb-0">
                <p className="px-4 pt-3 pb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-primary/40">{section.title}</p>
                <div className="grid grid-cols-2 gap-2">
                  {section.items.map((tab) => (
                    <button key={tab.id} onClick={() => handleTabClick(tab.id)}
                      className={`flex flex-col items-start gap-2 rounded-xl p-3 text-xs font-bold transition-all duration-300 ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" : "bg-muted/30 text-foreground/70 hover:bg-muted/60 hover:text-foreground"}`}>
                      <span className="flex items-center gap-2">
                        {tab.icon}
                        {!!tab.badge && tab.badge > 0 && <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />}
                      </span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 md:block">
        <div className="sticky top-6 rounded-3xl glass-card p-5 premium-shadow ring-1 ring-white/20">
          <div className="mb-8 px-2 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <UserCog size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">Console</p>
              <h2 className="font-display text-base font-black text-foreground tracking-tight">Editorial</h2>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {visibleSections.map((section) => (
              <div key={section.title} className="mb-4 last:mb-0">
                <p className="mb-2 px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">{section.title}</p>
                <div className="space-y-1">
                  {section.items.map((tab) => (
                    <button key={tab.id} onClick={() => handleTabClick(tab.id)}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-xl shadow-primary/25 translate-x-1" : "text-foreground/60 hover:bg-primary/5 hover:text-primary hover:translate-x-1"}`}>
                      <span className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === tab.id ? "text-primary-foreground" : "text-primary/70"}`}>
                        {tab.icon}
                      </span>
                      <span className="flex-1 text-left">{tab.label}</span>
                      {!!tab.badge && tab.badge > 0 && (
                        <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-2 text-[10px] font-black tracking-tighter ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20"}`}>
                          {tab.badge}
                        </span>
                      )}
                      {activeTab === tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/10 shadow-inner">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={12} className="text-primary" />
              <p className="text-[10px] font-black uppercase tracking-wider text-primary/80">Active Role</p>
            </div>
            <p className="text-xs font-bold text-foreground/80">{isAdmin ? "Administrator" : "Editor"}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
