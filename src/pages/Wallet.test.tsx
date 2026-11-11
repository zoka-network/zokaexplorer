import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Wallet from "./Wallet";
import { scanWallet, type WalletView } from "@/lib/viewkey";

vi.mock("@/components/Layout", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/lib/viewkey", async (original) => ({ ...await original<typeof import("@/lib/viewkey")>(), scanWallet: vi.fn() }));

const incoming: WalletView = {
  address: "zqtest2synthetic", balance: {
    kind: "incoming", height: 5, received_atoms: 175, immature_atoms: 12, change_atoms: 69,
    received: [
      { txid: "01".repeat(32), height: 1, coinbase: false, value: 100, memo: "invoice", change: false },
      { txid: "02".repeat(32), height: 2, coinbase: false, value: 69, memo: "", change: true },
    ],
  },
};

function start() {
  render(<MemoryRouter><Wallet /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText("View key"), { target: { value: "zqtestviewin2synthetic" } });
  fireEvent.click(screen.getByRole("button", { name: "Scan" }));
}

afterEach(() => vi.clearAllMocks());

describe("wallet view scopes", () => {
  it("shows receipts and the old-change limitation without a balance or sent payments", async () => {
    vi.mocked(scanWallet).mockResolvedValue(incoming);
    start();
    expect(await screen.findByText("Total received")).toBeInTheDocument();
    expect(screen.getByText(/Change from older wallets is unmarked/)).toBeInTheDocument();
    expect(screen.queryByText("Balance", { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByText("Spendable", { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByText("Sent", { exact: true })).not.toBeInTheDocument();
    expect(screen.getByText("invoice")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "#2" })).not.toBeInTheDocument();
  });

  it("retains balance and spending for full keys", async () => {
    vi.mocked(scanWallet).mockResolvedValue({ address: incoming.address, balance: {
      kind: "full", height: 5, balance_atoms: 75, spendable_atoms: 63, immature_atoms: 12,
      received_atoms: 244, sent_atoms: 169, received: [],
      sent: [{ txid: "03".repeat(32), height: 3, spent: 69, paid: 10, change: 58, fee: 1 }],
    } });
    start();
    expect(await screen.findByText("Balance", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("Spendable", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("Sent", { exact: true })).toBeInTheDocument();
  });

  it("does not restore results if a pending scan finishes after forgetting the key", async () => {
    let finish!: (view: WalletView) => void;
    vi.mocked(scanWallet).mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    start();
    await waitFor(() => expect(scanWallet).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Forget the key" }));
    await act(async () => { finish(incoming); });
    expect(screen.getByLabelText("View key")).toHaveValue("");
    expect(screen.queryByText("Total received")).not.toBeInTheDocument();
  });
});
