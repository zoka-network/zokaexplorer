import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Signatures } from "./Network";

const base = { chain_id: "zoka-quantic-testnet-v3", height: 180, block_hash: "ab".repeat(32) };

describe("the checkpoint's signatures", () => {
  it("show one hybrid signature of a version 2 checkpoint", () => {
    render(<Signatures cp={{ ...base, version: 2, signature: "00".repeat(64), mldsa_signature: "00".repeat(3309) }} />);
    expect(screen.getByText(/64 and 3309 bytes, both required/)).toBeInTheDocument();
  });

  it("show which authority keys signed a version 3 checkpoint, which has no single signature", () => {
    const cosignature = (signer: number) => ({ signer, ed25519: "00".repeat(64), mldsa: "00".repeat(3309) });
    render(<Signatures cp={{ ...base, version: 3, cosignatures: [cosignature(0), cosignature(2)] }} />);
    expect(screen.getByText(/2 of the authority's keys/)).toBeInTheDocument();
    expect(screen.getByText(/keys 1, 3, each Ed25519 and ML-DSA-65/)).toBeInTheDocument();
  });
});
