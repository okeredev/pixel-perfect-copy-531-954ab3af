import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import coouLogo from "@/assets/coou-logo.png";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-100px)] flex items-center justify-center py-20 px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full max-h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md reveal-anim">
        <Link to="/" className="mb-12 flex items-center gap-4 group justify-center">
          <div className="relative">
            <img src={coouLogo} alt="COOU" className="h-12 w-12 object-contain group-hover:rotate-12 transition-transform duration-500" />
            <div className="absolute -inset-1 rounded-full bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-black text-primary tracking-tight">COOU <span className="text-foreground">Graduate Journal</span></div>
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Interdisciplinary Research
            </div>
          </div>
        </Link>

        <div className="glass-card p-10 rounded-[2.5rem] premium-shadow border-white/20 bg-white/70 backdrop-blur-2xl">
          <h1 className="text-4xl font-black text-primary tracking-tighter text-center leading-none">{title}</h1>
          {subtitle && <p className="mt-4 text-sm font-medium text-muted-foreground/70 text-center leading-relaxed px-4">{subtitle}</p>}
          <div className="mt-10">{children}</div>
          {footer && <div className="mt-8 text-center text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 border-t border-border/40 pt-8">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export const inputClass =
  "block w-full rounded-2xl border-none bg-primary/5 px-5 py-4 text-sm font-bold text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40";
export const labelClass = "mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-primary/60";
export const primaryButtonClass =
  "inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-60";
export const ghostButtonClass =
  "inline-flex w-full items-center justify-center gap-3 rounded-full border border-border/60 bg-white/50 px-6 py-4 text-xs font-black uppercase tracking-widest text-foreground transition-all hover:border-primary hover:text-primary hover:bg-white active:scale-95 disabled:opacity-60";
