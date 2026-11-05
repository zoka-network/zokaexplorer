import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SiteFooter from "./SiteFooter";

describe("the footer", () => {
  it("links the same networks as zoka.network", () => {
    render(<SiteFooter />);
    const expected: Record<string, string> = {
      GitHub: "https://github.com/zoka-network",
      "X / Twitter": "https://x.com/zokanetwork",
      Discord: "https://discord.gg/uZRPcNb3m7",
    };
    for (const [name, href] of Object.entries(expected)) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });
});
