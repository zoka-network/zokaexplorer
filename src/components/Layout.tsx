import { useEffect, type ReactNode } from "react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

const Layout = ({ title, children }: { title?: string; children: ReactNode }) => {
  useEffect(() => {
    document.title = title ? `${title} · ZokaScan` : "ZokaScan — Zoka Quantic Testnet explorer";
  }, [title]);
  return (
    <div className="scan-page">
      <SiteHeader />
      <main className="scan-main">{children}</main>
      <SiteFooter />
    </div>
  );
};

export default Layout;
