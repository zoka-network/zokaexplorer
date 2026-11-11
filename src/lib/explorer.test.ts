import { describe, expect, it, vi } from "vitest";
import { ApiError, isBlockHash, recall, remember, request } from "./api";
import { formatBytes, formatDuration, formatHashrate, formatZka, shortHash, timeAgo } from "./format";
import { handOver, looksLikeViewKey, takeHandedOver } from "./viewkey";

const reply = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

describe("format", () => {
  it("writes ZKA with up to six decimals and no trailing zeros", () => {
    expect(formatZka(5_000_000_000_000)).toBe("5,000,000");
    expect(formatZka(12_000_000)).toBe("12");
    expect(formatZka(200)).toBe("0.0002");
    expect(formatZka(1_500_000)).toBe("1.5");
  });

  it("shortens hashes, sizes, hashrates and ages", () => {
    expect(shortHash("69249437d8c35b7e4bf28ec524491fe18384b9869670fadff546fef29148fdb2")).toBe("69249437…9148fdb2");
    expect(formatBytes(2830)).toBe("2.8 KB");
    expect(formatBytes(1_933_755)).toBe("1.84 MB");
    expect(formatHashrate(136)).toBe("136 H/s");
    expect(formatHashrate(1_250)).toBe("1.3 kH/s");
    expect(timeAgo(1000, 1045)).toBe("45s ago");
    expect(timeAgo(1000, 1000 + 3 * 3600 + 120)).toBe("3h 2m ago");
    expect(formatDuration(120)).toBe("2m");
    expect(formatDuration(605)).toBe("10m 5s");
  });

  it("tells a block hash apart", () => {
    expect(isBlockHash("0".repeat(64))).toBe(true);
    expect(isBlockHash("0".repeat(63))).toBe(false);
    expect(isBlockHash("zqtest2abc")).toBe(false);
  });
});

describe("request", () => {
  it("waits and asks again when the node is busy", async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(reply(429, { error: "too many requests" }, { "retry-after": "1" }))
      .mockResolvedValueOnce(reply(200, { height: 7 }));
    const pending = request<{ height: number }>("/status", fetcher as unknown as typeof fetch);
    await vi.advanceTimersByTimeAsync(1_000);
    await expect(pending).resolves.toEqual({ height: 7 });
    expect(fetcher).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("keeps every digit of a u64 nonce", async () => {
    const body =
      '{"height":4003,"nonce":17480248669717492693,"previous_hash":"308d87b0","transactions":[{"kind":"coinbase"}]}';
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(body, { status: 200, headers: { "content-type": "application/json" } }));
    const block = await request<{ height: number; nonce: string }>("/blocks/4003/summary", fetcher as unknown as typeof fetch);
    expect(block.nonce).toBe("17480248669717492693");
    expect(block.height).toBe(4003);
  });

  it("does not retry an answer such as 404", async () => {
    const fetcher = vi.fn().mockResolvedValue(reply(404, { error: "unknown block height" }));
    const failure = request("/blocks/9/summary", fetcher as unknown as typeof fetch);
    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({ status: 404, message: "unknown block height" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe("remember", () => {
  it("keeps the last good answer with its time", () => {
    remember("status", { height: 3 });
    const saved = recall<{ height: number }>("status");
    expect(saved?.value).toEqual({ height: 3 });
    expect(saved?.savedAt).toBeGreaterThan(0);
    expect(recall("nothing")).toBeNull();
  });
});

describe("view keys", () => {
  it("are told apart from addresses and handed over once, in memory", () => {
    expect(looksLikeViewKey(" zqtestview2abc")).toBe(true);
    expect(looksLikeViewKey(" zqtestviewin2abc")).toBe(true);
    expect(looksLikeViewKey("zqviewin2abc")).toBe(false);
    expect(looksLikeViewKey("zqtest2abc")).toBe(false);
    handOver("zqtestview2abc");
    expect(takeHandedOver()).toBe("zqtestview2abc");
    expect(takeHandedOver()).toBeNull();
  });
});
