import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";

const NotFound = () => (
  <Layout title="Not found">
    <section className="scan-hero">
      <div className="scan-eyebrow">404</div>
      <h1 className="scan-title">Nothing here.</h1>
      <p className="scan-lede">Search a block height, a block hash or a short address.</p>
      <SearchBar autoFocus />
    </section>
  </Layout>
);

export default NotFound;
