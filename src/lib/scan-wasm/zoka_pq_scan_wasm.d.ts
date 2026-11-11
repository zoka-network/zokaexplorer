/* tslint:disable */
/* eslint-disable */

export class Scanner {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Read one page (it has to start at [`Scanner::next`]); returns the tip
     * the node had when it served it.
     */
    add_page(bytes: Uint8Array): number;
    /**
     * The short address whose payments this key sees.
     */
    address(): string;
    /**
     * JSON (atoms) at the last block read. Full keys retain the balance
     * fields; incoming keys return receipts only, never a fabricated balance
     * or a sent list. `kind` tells the page which fields it may display.
     */
    balance(): string;
    /**
     * `network`: 1 mainnet, 2 testnet, 3 regtest.
     */
    constructor(view_key: string, network: number);
    /**
     * The height of the next block it needs: ask for `/scan?from=<next>`.
     */
    next(): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_scanner_free: (a: number, b: number) => void;
    readonly scanner_add_page: (a: number, b: number, c: number) => [number, number, number];
    readonly scanner_address: (a: number) => [number, number, number, number];
    readonly scanner_balance: (a: number) => [number, number];
    readonly scanner_new: (a: number, b: number, c: number) => [number, number, number];
    readonly scanner_next: (a: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
