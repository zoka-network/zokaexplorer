// Copy a locally built scanner, recording its Rust source and file hashes.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = process.argv[2];
if (!repo) throw new Error("usage: npm run update-wasm -- <ZOKA node repository>");
const pkg = join(repo, "crates", "zoka-pq-scan-wasm", "pkg");
const target = fileURLToPath(new URL("../src/lib/scan-wasm/", import.meta.url));
const names = ["zoka_pq_scan_wasm.js", "zoka_pq_scan_wasm.d.ts", "zoka_pq_scan_wasm_bg.wasm", "zoka_pq_scan_wasm_bg.wasm.d.ts"];
for (const name of names) copyFileSync(join(pkg, name), join(target, name));
const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();
const dirty = git("status", "--porcelain", "--", "crates/zoka-pq-scan-wasm", "crates/zoka-pq-pool", "crates/zoka-pq");
const lines = [
  `commit ${git("rev-parse", "HEAD")}${dirty ? " (with uncommitted changes)" : ""}`,
  `branch ${git("rev-parse", "--abbrev-ref", "HEAD")}`,
  ...names.map((name) => `${createHash("sha256").update(readFileSync(join(target, name))).digest("hex")}  ${name}`),
];
writeFileSync(join(target, "SOURCE.txt"), `${lines.join("\n")}\n`);
console.log(lines.join("\n"));
