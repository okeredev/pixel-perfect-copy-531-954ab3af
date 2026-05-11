import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "./journal";
import { ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "Archive — COOU Graduate Journal" },
      { name: "description", content: "Browse published volumes and issues of the COOU Graduate Journal." },
      { property: "og:title", content: "Archive — COOU Graduate Journal" },
      { property: "og:description", content: "Volumes and issues of the COOU Graduate Journal of Interdisciplinary Research and Development." },
    ],
  }),
  component: ArchivePage,
});

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PublishedArticle = {
  id: string;
  title: string;
  abstract: string;
  type: string;
  published_at: string;
  authors?: { full_name: string }[];
  pdf_url?: string;
};

function ArchivePage() {
  const [articles, setArticles] = useState<PublishedArticle[] | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data, error } = await supabase
      .from("submissions")
      .select("id, title, abstract, type, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Archive fetch error:", error);
      toast.error(`Failed to load archive: ${error.message}`);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      console.log("No published articles found in database.");
      setArticles([]);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as PublishedArticle[];
    if (rows.length > 0) {
      const ids = rows.map(r => r.id);
      
      // Load authors
      const { data: authors } = await supabase
        .from("submission_authors")
        .select("submission_id, full_name")
        .in("submission_id", ids)
        .order("position");
      
      // Load PDF files
      const { data: files } = await supabase
        .from("submission_files")
        .select("submission_id, storage_path")
        .in("submission_id", ids)
        .eq("kind", "manuscript");

      const authorMap = new Map();
      (authors ?? []).forEach(a => {
        if (!authorMap.has(a.submission_id)) authorMap.set(a.submission_id, []);
        authorMap.get(a.submission_id).push(a);
      });

      const fileMap = new Map((files ?? []).map(f => [f.submission_id, f.storage_path]));

      rows.forEach(r => {
        r.authors = authorMap.get(r.id) || [];
        r.pdf_url = fileMap.get(r.id);
      });
    }

    setArticles(rows);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function viewPdf(path: string) {
    const [b, ...rest] = path.split("/");
    const { data, error } = await supabase.storage.from(b).createSignedUrl(rest.join("/"), 3600);
    if (error || !data) return toast.error("Could not load PDF.");
    window.open(data.signedUrl, "_blank");
  }

  return (
    <>
      <PageHero
        kicker="The Archive"
        title="Scholarly works & published research."
        body="Explore the full collection of peer-reviewed articles and conference papers published by the COOU Graduate Journal."
      />

      <Section eyebrow="Collection" title="Published Articles">
        {loading ? (
          <div className="py-20 text-center reveal-anim">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="mt-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Retrieving Archive…</p>
          </div>
        ) : articles === null || articles.length === 0 ? (
          <div className="rounded-[3rem] glass-card p-16 text-center reveal-anim premium-shadow">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 text-primary shadow-2xl animate-float">
              <BookOpen size={32} />
            </div>
            <h3 className="mt-10 font-display text-4xl font-black text-primary tracking-tighter">Archive is empty</h3>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-muted-foreground/70 leading-relaxed">
              No articles have been published to the archive yet. The inaugural issue is currently being prepared.
            </p>
            <div className="mt-10 flex flex-col items-center">
              <Link to="/author-guidelines" className="inline-flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 shadow-2xl transition-all hover:scale-[1.05] active:scale-95">
                Submit your research <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 reveal-anim">
            {articles.map((art) => (
              <div key={art.id} className="group relative rounded-[2.5rem] glass-card p-8 md:p-12 transition-all duration-500 hover:border-primary/40 premium-shadow">
                <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="rounded-full bg-primary/5 border border-primary/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        {art.type}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        Published {new Date(art.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-display text-3xl font-black text-primary tracking-tight leading-tight group-hover:text-primary/80 transition-colors">
                      {art.title}
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                      {art.authors?.map((a, i) => (
                        <span key={i} className="text-sm font-bold text-foreground/70">
                          {a.full_name}{i < (art.authors?.length || 0) - 1 ? "," : ""}
                        </span>
                      ))}
                    </div>
                    <p className="mt-6 text-foreground/60 font-medium leading-relaxed line-clamp-3">
                      {art.abstract}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col gap-3">
                    {art.pdf_url && (
                      <button 
                        onClick={() => viewPdf(art.pdf_url!)}
                        className="inline-flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-primary/90 transition-all hover:scale-[1.05] active:scale-95 shadow-xl shadow-primary/20"
                      >
                        <BookOpen size={16} /> Read Full Article
                      </button>
                    )}
                    <Link 
                      to={`/archive`} 
                      className="inline-flex items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
