import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import coouLogo from "@/assets/coou-logo.png";
import { AuthButtons } from "@/components/AuthButtons";

const nav = [
  { to: "/", label: "Home" },
  { to: "/journal", label: "Journal" },
  { to: "/conference", label: "Conference" },
  { to: "/editorial-board", label: "Editorial Board" },
  { to: "/author-guidelines", label: "Author Guidelines" },
  { to: "/archive", label: "Archive" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="group flex items-center gap-4 transition-transform hover:scale-[1.01]">
          <div className="relative">
            <img
              src={coouLogo}
              alt="COOU crest"
              width={48}
              height={48}
              className="h-12 w-12 object-contain filter drop-shadow-sm group-hover:rotate-12 transition-transform duration-500"
            />
            <div className="absolute -inset-1 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-black tracking-tight text-primary">COOU <span className="text-foreground">Graduate Journal</span></div>
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Interdisciplinary Research and Development
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex bg-muted/30 p-1 rounded-full border border-border/40">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground/60 transition-all hover:text-primary hover:bg-white/50"
              activeProps={{ className: "bg-white text-primary shadow-sm !text-primary shadow-black/5" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AuthButtons />
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary lg:hidden hover:bg-primary/10 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 border-b border-border/60 bg-card/90 backdrop-blur-2xl lg:hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <nav className="flex flex-col p-4 gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-foreground/70 hover:bg-primary/5 hover:text-primary transition-all"
                activeProps={{ className: "bg-primary/10 text-primary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
