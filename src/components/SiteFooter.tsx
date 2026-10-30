import { DISCORD, EXPLORER_REPO, ZOKA_SITE, ZSILENT_RELEASES } from "@/lib/config";

const SiteFooter = () => (
  <footer className="scan-footer">
    <div className="scan-footer-inner">
      <span>ZokaScan reads a Zoka node's public, read-only API. Test coins, no value.</span>
      <div className="flex flex-wrap gap-5">
        <a href={ZOKA_SITE} target="_blank" rel="noopener noreferrer">
          zoka.network
        </a>
        <a href={ZSILENT_RELEASES} target="_blank" rel="noopener noreferrer">
          ZSilent
        </a>
        <a href={EXPLORER_REPO} target="_blank" rel="noopener noreferrer">
          Source
        </a>
        <a href={DISCORD} target="_blank" rel="noopener noreferrer">
          Discord
        </a>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
