/* @ts-self-types="./zentinel_playground_wasm.d.ts" */

/**
 * Create a sample request for testing
 *
 * Returns a JSON object that can be passed to `simulate()`.
 * @param {string} method
 * @param {string} host
 * @param {string} path
 * @returns {any}
 */
export function create_sample_request(method, host, path) {
    const ptr0 = passStringToWasm0(method, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(host, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.create_sample_request(ptr0, len0, ptr1, len1, ptr2, len2);
    return ret;
}

/**
 * Validate and return the effective (normalized) configuration
 *
 * This is useful for showing the config with all defaults applied.
 * @param {string} config_kdl
 * @returns {any}
 */
export function get_normalized_config(config_kdl) {
    const ptr0 = passStringToWasm0(config_kdl, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.get_normalized_config(ptr0, len0);
    return ret;
}

/**
 * Get the version of the playground WASM module
 * @returns {string}
 */
export function get_version() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.get_version();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Initialize panic hook for better error messages in the console
 */
export function init_panic_hook() {
    wasm.init_panic_hook();
}

/**
 * Inspect a configuration and return its topology graph with heuristic warnings
 *
 * Returns a JSON object with the full topology:
 * ```json
 * {
 *     "listeners": [...],
 *     "routes": [...],
 *     "filters": [...],
 *     "agents": [...],
 *     "upstreams": [...],
 *     "edges": [...],
 *     "warnings": [...]
 * }
 * ```
 * @param {string} config_kdl
 * @returns {any}
 */
export function inspect_topology(config_kdl) {
    const ptr0 = passStringToWasm0(config_kdl, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.inspect_topology(ptr0, len0);
    return ret;
}

/**
 * Lint a configuration and return only warnings
 *
 * Returns an object with:
 * ```json
 * {
 *     "warnings": [...],
 *     "has_errors": false
 * }
 * ```
 * @param {string} config_kdl
 * @returns {any}
 */
export function lint_config(config_kdl) {
    const ptr0 = passStringToWasm0(config_kdl, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.lint_config(ptr0, len0);
    return ret;
}

/**
 * Render the topology in a specific format
 *
 * Supported formats: "text", "mermaid", "json", "dot"
 *
 * Returns an object with:
 * ```json
 * {
 *     "format": "mermaid",
 *     "output": "flowchart LR\n..."
 * }
 * ```
 * @param {string} config_kdl
 * @param {string} format
 * @returns {any}
 */
export function render_topology(config_kdl, format) {
    const ptr0 = passStringToWasm0(config_kdl, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.render_topology(ptr0, len0, ptr1, len1);
    return ret;
}

/**
 * Simulate routing a request through the configuration
 *
 * Takes:
 * - `config_kdl`: KDL configuration string
 * - `request_json`: JSON string representing the request
 *
 * Request JSON format:
 * ```json
 * {
 *     "method": "GET",
 *     "host": "example.com",
 *     "path": "/api/users",
 *     "headers": { "authorization": "Bearer token" },
 *     "query_params": { "page": "1" }
 * }
 * ```
 *
 * Returns a JSON object with the routing decision (see RouteDecision).
 * @param {string} config_kdl
 * @param {string} request_json
 * @returns {any}
 */
export function simulate(config_kdl, request_json) {
    const ptr0 = passStringToWasm0(config_kdl, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(request_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.simulate(ptr0, len0, ptr1, len1);
    return ret;
}

/**
 * Simulate a sequence of requests with stateful policy tracking
 *
 * This enables simulation of multiple requests with state tracking for:
 * - Rate limiting (token bucket per route)
 * - Caching (entries with TTL)
 * - Circuit breakers (per upstream)
 * - Load balancer position (round-robin)
 *
 * Takes:
 * - `config_kdl`: KDL configuration string
 * - `requests_json`: JSON array of timestamped requests
 *
 * Request JSON format:
 * ```json
 * [
 *     {
 *         "method": "GET",
 *         "host": "example.com",
 *         "path": "/api/users",
 *         "timestamp": 0.0
 *     },
 *     {
 *         "method": "GET",
 *         "host": "example.com",
 *         "path": "/api/users",
 *         "timestamp": 0.1
 *     }
 * ]
 * ```
 *
 * Returns a JSON object with:
 * - `results`: Array of per-request results
 * - `state_transitions`: Array of state changes that occurred
 * - `final_state`: Final state of all policy components
 * - `summary`: Summary statistics (hit rates, rate limited count, etc.)
 * @param {string} config_kdl
 * @param {string} requests_json
 * @returns {any}
 */
export function simulate_stateful(config_kdl, requests_json) {
    const ptr0 = passStringToWasm0(config_kdl, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(requests_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.simulate_stateful(ptr0, len0, ptr1, len1);
    return ret;
}

/**
 * Simulate a request with mock agent responses
 *
 * This enables simulation of agent decisions (WAF, auth, custom agents)
 * and shows how they affect the request pipeline.
 *
 * Takes:
 * - `config_kdl`: KDL configuration string
 * - `request_json`: JSON string representing the request
 * - `agent_responses_json`: JSON array of mock agent responses
 *
 * Mock agent response format:
 * ```json
 * [
 *     {
 *         "agent_id": "waf",
 *         "decision": { "type": "block", "status": 403, "body": "Blocked" },
 *         "request_headers": [{ "op": "set", "name": "X-WAF", "value": "checked" }],
 *         "response_headers": [],
 *         "audit": { "rule_ids": ["942100"], "tags": ["sql-injection"] }
 *     }
 * ]
 * ```
 *
 * Decision types:
 * - `{ "type": "allow" }` - Allow the request
 * - `{ "type": "block", "status": 403, "body": "..." }` - Block with response
 * - `{ "type": "redirect", "url": "...", "status": 302 }` - Redirect
 * - `{ "type": "challenge", "challenge_type": "captcha", "params": {} }` - Challenge
 *
 * Returns a JSON object with:
 * - `matched_route`: The matched route
 * - `agent_chain`: Step-by-step trace of agent execution
 * - `final_decision`: Combined decision ("allow", "block", "redirect", "challenge")
 * - `final_request`: Request after all header mutations
 * - `block_response`: Block details (if blocked)
 * - `redirect_url`: Redirect URL (if redirecting)
 * - `audit_trail`: Combined audit info from all agents
 * @param {string} config_kdl
 * @param {string} request_json
 * @param {string} agent_responses_json
 * @returns {any}
 */
export function simulate_with_agents(config_kdl, request_json, agent_responses_json) {
    const ptr0 = passStringToWasm0(config_kdl, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(request_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(agent_responses_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.simulate_with_agents(ptr0, len0, ptr1, len1, ptr2, len2);
    return ret;
}

/**
 * Validate a KDL configuration string
 *
 * Returns a JSON object with the following structure:
 * ```json
 * {
 *     "valid": true/false,
 *     "errors": [...],
 *     "warnings": [...],
 *     "effective_config": {...}  // Only present if valid
 * }
 * ```
 * @param {string} config_kdl
 * @returns {any}
 */
export function validate(config_kdl) {
    const ptr0 = passStringToWasm0(config_kdl, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.validate(ptr0, len0);
    return ret;
}

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_8c4e43fe74559d73: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg___wbindgen_is_string_cd444516edc5b180: function(arg0) {
            const ret = typeof(arg0) === 'string';
            return ret;
        },
        __wbg___wbindgen_throw_be289d5034ed271b: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_error_7534b8e9a36f1ab4: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_new_361308b2356cecd0: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_new_3eb36ae241fe6f44: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_8a6f238a6ece86ea: function() {
            const ret = new Error();
            return ret;
        },
        __wbg_new_dca287b076112a51: function() {
            const ret = new Map();
            return ret;
        },
        __wbg_set_1eb0999cf5d27fc8: function(arg0, arg1, arg2) {
            const ret = arg0.set(arg1, arg2);
            return ret;
        },
        __wbg_set_3f1d0b984ed272ed: function(arg0, arg1, arg2) {
            arg0[arg1] = arg2;
        },
        __wbg_set_f43e577aea94465b: function(arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        },
        __wbg_stack_0ed75d68575b0f3c: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbindgen_cast_0000000000000001: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0) {
            // Cast intrinsic for `I64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000003: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_cast_0000000000000004: function(arg0) {
            // Cast intrinsic for `U64 -> Externref`.
            const ret = BigInt.asUintN(64, arg0);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./zentinel_playground_wasm_bg.js": import0,
    };
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('zentinel_playground_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
