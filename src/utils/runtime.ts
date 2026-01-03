// deno-lint-ignore no-explicit-any
const _global: any = globalThis;

export type Runtime =
  | "node"
  | "deno"
  | "deploy"
  | "bun"
  | "cfw"
  | "browser"
  | "unknown";

const cache = {
  node: null as boolean | null,
  deno: null as boolean | null,
  deploy: null as boolean | null,
  bun: null as boolean | null,
  cfw: null as boolean | null,
  browser: null as boolean | null,
  unknown: null as boolean | null,
} satisfies Record<Runtime, boolean | null>;

export function isBrowser(): boolean {
  // this is by far the most complex runtime detection function,
  // and therefore is also the most expensive to run. we only use this
  // when all other runtime checks have failed.
  return (
    // first, we ensure we're not in a Node-like environment
    // (Deno/Node/Bun/Cloudflare [with compatibility flags]/Netlify/etc)
    !isNodeLike() && !isDeno() && !isBun() && !isCloudflare() &&
    // now we proceed to check for browser-specific globals:
    // check for recursive window object
    "window" in _global && typeof _global.window !== "undefined" &&
    _global.window === _global && "window" in _global.window &&
    _global.window === _global.window.window &&
    // check for global document and navigator objects
    "navigator" in _global && typeof _global.navigator !== "undefined" &&
    "userAgent" in _global.navigator &&
    typeof _global.navigator.userAgent === "string" &&
    !/^(?:Node|Deno|Bun|Cloudflare|Workers|Netlify)\s*\//i.test(
      _global.navigator.userAgent,
    ) &&
    // check for global document object
    "document" in _global &&
    typeof _global.document !== "undefined" &&
    // check for the most basic DOM API
    "createElement" in _global.document &&
    typeof _global.document.createElement === "function"
  );
}

export function isNodeLike(): boolean {
  return cache.node ??= "process" in _global &&
    typeof _global.process !== "undefined" &&
    _global.process.versions != null &&
    _global.process.versions.node != null;
}

export function isDeno(): boolean {
  return cache.deno ??= "Deno" in _global &&
    typeof _global.Deno !== "undefined" &&
    typeof _global.Deno.version === "object" &&
    _global.Deno.version != null &&
    typeof _global.Deno.version.deno === "string";
}

export function isDenoDeploy(): boolean {
  return cache.deploy ??= isDeno() && _global.Deno.version.deno === "";
}

export function isBun(): boolean {
  return cache.bun ??= isNodeLike() && (
    "Bun" in _global &&
    typeof _global.Bun !== "undefined" &&
    typeof _global.Bun.version === "string" &&
    "stdout" in _global.Bun &&
    typeof _global.Bun.stdout === "object" &&
    _global.Bun.stdout != null &&
    typeof _global.Bun.stdout.write === "function"
  );
}

export function isCloudflare(): boolean {
  return cache.cfw ??= "WebSocketPair" in _global &&
    typeof _global.WebSocketPair !== "undefined" &&
    "Cloudflare" in _global &&
    typeof _global.Cloudflare !== "undefined" &&
    "compatibilityFlags" in _global.Cloudflare &&
    typeof _global.Cloudflare.compatibilityFlags === "object" &&
    _global.Cloudflare.compatibilityFlags != null;
}

export function getRuntime(): Runtime {
  switch (true) {
    case isNodeLike():
      return "node";
    case isBun():
      return "bun";
    case isDenoDeploy():
      return "deploy";
    case isDeno():
      return "deno";
    case isCloudflare():
      return "cfw";
    case isBrowser():
      return "browser";
    default:
      return "unknown";
  }
}
