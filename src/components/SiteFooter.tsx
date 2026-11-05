import { Github, MessageCircle } from "lucide-react";
import { DISCORD, EXPLORER_REPO, GITHUB_ORG, X_URL, ZOKA_SITE, ZSILENT_RELEASES } from "@/lib/config";

// The same networks and marks as the footer of zoka.network.
const SiteFooter = () => (
  <footer className="scan-footer">
    <div className="scan-footer-inner">
      <span>ZokaScan reads a Zoka node's public, read-only API. Test coins, no value.</span>
      <div className="flex flex-wrap items-center gap-5">
        <a href={ZOKA_SITE} target="_blank" rel="noopener noreferrer">
          zoka.network
        </a>
        <a href={ZSILENT_RELEASES} target="_blank" rel="noopener noreferrer">
          ZSilent
        </a>
        <a href={EXPLORER_REPO} target="_blank" rel="noopener noreferrer">
          Source
        </a>
      </div>
      <div className="scan-socials">
        <a href={GITHUB_ORG} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="scan-social">
          <Github size={18} strokeWidth={1.5} />
        </a>
        <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="scan-social">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 3h4.5L20 21h-4.5L4 3Z" stroke="currentColor" strokeWidth="1.4" />
            <path d="m20 3-7 8M4 21l7-8" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </a>
        <a href={DISCORD} target="_blank" rel="noopener noreferrer" aria-label="Discord" className="scan-social">
          <MessageCircle size={18} strokeWidth={1.5} />
        </a>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
