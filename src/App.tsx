import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddressDetail from "./pages/AddressDetail.tsx";
import ApiDocs from "./pages/ApiDocs.tsx";
import BlockDetail from "./pages/BlockDetail.tsx";
import Index from "./pages/Index.tsx";
import Network from "./pages/Network.tsx";
import NotFound from "./pages/NotFound.tsx";
import Search from "./pages/Search.tsx";
import TxDetail from "./pages/TxDetail.tsx";
import Wallet from "./pages/Wallet.tsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/network" element={<Network />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/api" element={<ApiDocs />} />
        <Route path="/block/:id" element={<BlockDetail />} />
        <Route path="/tx/:txid" element={<TxDetail />} />
        <Route path="/address/:address" element={<AddressDetail />} />
        <Route path="/search/:query" element={<Search />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
