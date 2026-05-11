import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-xl">COOU Graduate Journal</div>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/75">
            A peer-reviewed interdisciplinary journal of the School of Postgraduate
            Studies, Chukwuemeka Odumegwu Ojukwu University, Anambra State, Nigeria.
          </p>
          <div className="mt-4 h-px w-12 bg-gold" />
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
            ISSN — pending
          </p>
        </div>

        <div>
          <div className="text-sm font-medium">Journal</div>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/75">
            <li><Link to="/journal" className="hover:text-gold">About</Link></li>
            <li><Link to="/author-guidelines" className="hover:text-gold">Author Guidelines</Link></li>
            <li><Link to="/editorial-policy" className="hover:text-gold">Editorial Policy</Link></li>
            <li><Link to="/archive" className="hover:text-gold">Archive</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-medium">More</div>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/75">
            <li><Link to="/conference" className="hover:text-gold">Conference</Link></li>
            <li><Link to="/editorial-board" className="hover:text-gold">Editorial Board</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-6 py-5 text-xs text-primary-foreground/60 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} School of Postgraduate Studies, COOU. All rights reserved.</p>
          <p>Anambra State, Nigeria</p>
        </div>
      </div>
    </footer>
  );
}
