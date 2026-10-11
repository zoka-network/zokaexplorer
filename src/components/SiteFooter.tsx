import { Github, Gitlab, Twitter, Globe, MessageCircle } from "lucide-react";

const SiteFooter = () => (
  <footer className="relative z-10 mx-auto max-w-5xl px-6 pb-10">
    <div className="flex flex-col items-center justify-between gap-3 text-[11px] text-muted-foreground sm:flex-row">
      <span>© {new Date().getFullYear()} zokaexplorer</span>
      <div className="flex items-center gap-3">
        <a
          href="https://zoka.network"
          target="_blank"
          rel="noreferrer"
          aria-label="zoka.network"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Globe className="h-3.5 w-3.5" />
        </a>
        <a
          href="https://discord.gg/uZRPcNb3m7"
          target="_blank"
          rel="noreferrer"
          aria-label="Discord"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <MessageCircle className="h-3.5 w-3.5" />
        </a>
        <a
          href="https://gitlab.com/zokanetwork"
          target="_blank"
          rel="noreferrer"
          aria-label="GitLab"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Gitlab className="h-3.5 w-3.5" />
        </a>
        <a
          href="https://github.com/zoka-network"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Github className="h-3.5 w-3.5" />
        </a>
        <a
          href="https://x.com/zokanetwork"
          target="_blank"
          rel="noreferrer"
          aria-label="Twitter"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Twitter className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
