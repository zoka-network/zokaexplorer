import { Link, NavLink } from "react-router-dom";
import { NETWORK_LABEL, ZOKA_SITE } from "@/lib/config";

const SiteHeader = () => (
  <header className="scan-header">
    <nav className="scan-nav" aria-label="ZokaScan">
      <Link to="/" className="scan-brand" aria-label="ZokaScan home">
        <span className="scan-brand-name">ZOKASCAN</span>
        <span className="scan-brand-net">{NETWORK_LABEL}</span>
      </Link>
      <div className="scan-links">
        <NavLink to="/" end>
          Blocks
        </NavLink>
        <NavLink to="/network">Network</NavLink>
        <NavLink to="/wallet">My wallet</NavLink>
        <NavLink to="/api">API</NavLink>
        <a className="scan-links-external" href={ZOKA_SITE} target="_blank" rel="noopener noreferrer">
          zoka.network ↗
        </a>
      </div>
    </nav>
  </header>
);

export default SiteHeader;
