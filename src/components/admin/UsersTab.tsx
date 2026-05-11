import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Search, ShieldCheck } from "lucide-react";

type AppRole = "admin" | "editor" | "reviewer" | "author";
const ROLES: AppRole[] = ["admin", "editor", "reviewer", "author"];

type UserRow = {
  id: string; full_name: string; email: string | null; affiliation: string | null;
  created_at: string; roles: AppRole[];
};

export function UsersTab({ isAdmin, onDetail }: { isAdmin: boolean; onDetail: (u: UserRow) => void }) {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AppRole>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const { data: profiles, error } = await supabase.from("profiles").select("id, full_name, email, affiliation, created_at").order("created_at", { ascending: false }).limit(500);
    if (error) { toast.error(error.message); setUsers([]); return; }
    const ids = (profiles ?? []).map((p) => p.id);
    let rolesMap = new Map<string, AppRole[]>();
    if (ids.length) {
      const { data: rs, error: roleError } = await supabase.from("user_roles").select("user_id, role").in("user_id", ids);
      if (roleError) toast.error("Failed to load roles: " + roleError.message);
      (rs ?? []).forEach((r) => { const arr = rolesMap.get(r.user_id) ?? []; arr.push(r.role as AppRole); rolesMap.set(r.user_id, arr); });
    }
    setUsers((profiles ?? []).map((p) => ({ id: p.id, full_name: p.full_name ?? "", email: p.email, affiliation: p.affiliation, created_at: p.created_at, roles: rolesMap.get(p.id) ?? [] })));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!users) return null;
    const s = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && !u.roles.includes(roleFilter)) return false;
      if (!s) return true;
      return u.full_name.toLowerCase().includes(s) || (u.email ?? "").toLowerCase().includes(s) || (u.affiliation ?? "").toLowerCase().includes(s);
    });
  }, [users, search, roleFilter]);

  async function toggleRole(u: UserRow, role: AppRole, on: boolean) {
    setBusyId(u.id + role);
    if (on) {
      const { error } = await supabase.from("user_roles").insert({ user_id: u.id, role });
      if (error) toast.error(error.message); else toast.success(`Granted ${role}`);
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", role);
      if (error) toast.error(error.message); else toast.success(`Revoked ${role}`);
    }
    setBusyId(null); load();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl glass-card p-4 reveal-anim">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search name, email, affiliation or ID…" 
            className="w-full rounded-xl border-none bg-primary/5 py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all" 
          />
        </div>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} 
          className="rounded-xl border border-border/60 bg-background px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary/80 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
        >
          <option value="all">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r.toUpperCase()}</option>)}
        </select>
      </div>

      {filtered === null ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Loading Users…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border/60 bg-card/50 p-20 text-center reveal-anim">
          <ShieldCheck className="mx-auto mb-4 text-primary/20" size={48} />
          <p className="text-lg font-bold text-foreground">No users found</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <ul className="grid gap-4 reveal-anim" style={{ animationDelay: '0.1s' }}>
          {filtered.map((u) => (
            <li 
              key={u.id} 
              className="group relative rounded-3xl glass-card p-6 transition-all duration-300 hover:scale-[1.01] hover:border-primary/50 cursor-pointer premium-shadow overflow-hidden" 
              onClick={() => onDetail(u)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-display text-lg font-black group-hover:scale-110 transition-transform">
                      {u.full_name?.[0] || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight leading-tight truncate">
                        {u.full_name || "(No Name)"}</p>
                      <p className="text-xs font-bold text-muted-foreground/60 truncate">{u.email}</p>
                    </div>
                  </div>
                  {u.affiliation && (
                    <p className="text-xs font-medium text-foreground/70 mt-1 italic line-clamp-1">
                      {u.affiliation}
                    </p>
                  )}
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">
                    Joined {new Date(u.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap md:flex-col md:items-end gap-2 shrink-0">
                  {u.roles.length === 0 ? (
                    <span className="rounded-full bg-muted/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-foreground/40 ring-1 ring-border/20">
                      Standard Author
                    </span>
                  ) : u.roles.map((r) => (
                    <span key={r} className="rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm ring-1 ring-primary/20">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {isAdmin && (
                <div className="mt-6 pt-6 border-t border-border/40 relative z-10">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-primary/40">Manage Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((r) => {
                      const has = u.roles.includes(r);
                      return (
                        <button 
                          key={r} 
                          disabled={busyId === u.id + r} 
                          onClick={(e) => { e.stopPropagation(); toggleRole(u, r, !has); }} 
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            has 
                              ? "bg-primary text-white shadow-lg shadow-primary/20" 
                              : "bg-muted/40 text-foreground/60 hover:bg-primary/10 hover:text-primary"
                          } disabled:opacity-50`}
                        >
                          <ShieldCheck size={14} className={has ? "text-white" : "text-primary/40"} />
                          {has ? `Revoke ${r}` : `Grant ${r}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 blur-2xl group-hover:scale-150 transition-all duration-700`} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
