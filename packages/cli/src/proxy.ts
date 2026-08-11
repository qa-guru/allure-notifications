/**
 * Outbound `config.proxy` → undici dispatcher for live Telegram (parity with jar HttpClientFactory).
 */

import {
  fetch as undiciFetch,
  ProxyAgent,
  Socks5ProxyAgent,
  type Dispatcher,
} from "undici";

export type OutboundProxyType = "http" | "socks5";

export type OutboundProxy = {
  type: OutboundProxyType;
  host: string;
  port: number;
  username?: string;
  password?: string;
};

function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const t = value.trim();
  return t ? t : undefined;
}

function parsePort(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.trim());
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/**
 * Parse top-level `config.proxy`. Returns undefined when host/port missing or invalid.
 * Default type: `http` (jar parity). `socks` / `socks5` → socks5.
 */
export function resolveOutboundProxy(raw: unknown): OutboundProxy | undefined {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return undefined;
  }
  const o = raw as Record<string, unknown>;
  const host = nonEmptyString(o.host);
  const port = parsePort(o.port);
  if (!host || port == null || port <= 0 || port > 65535) {
    return undefined;
  }

  const typeRaw = (nonEmptyString(o.type) ?? "http").toLowerCase();
  const type: OutboundProxyType =
    typeRaw === "socks5" || typeRaw === "socks" ? "socks5" : "http";

  return {
    type,
    host,
    port,
    username: nonEmptyString(o.username),
    password: nonEmptyString(o.password),
  };
}

/** Proxy URI for undici agents — never log when credentials present. */
export function buildProxyUri(proxy: OutboundProxy): string {
  const scheme = proxy.type === "socks5" ? "socks5" : "http";
  const auth =
    proxy.username != null
      ? `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password ?? "")}@`
      : "";
  return `${scheme}://${auth}${proxy.host}:${proxy.port}`;
}

export function createProxyDispatcher(proxy: OutboundProxy): Dispatcher {
  const uri = buildProxyUri(proxy);
  if (proxy.type === "socks5") {
    return new Socks5ProxyAgent(uri);
  }
  return new ProxyAgent(uri);
}

/**
 * `fetch` bound to the proxy dispatcher. Injectable tests should pass their own `fetchImpl`
 * and skip this (explicit fetch wins over config.proxy).
 */
export function createProxiedFetch(proxy: OutboundProxy): typeof fetch {
  const dispatcher = createProxyDispatcher(proxy);
  const proxied = (
    input: Parameters<typeof fetch>[0],
    init?: Parameters<typeof fetch>[1],
  ): ReturnType<typeof fetch> =>
    undiciFetch(input as string | URL, {
      ...(init as object | undefined),
      dispatcher,
    }) as ReturnType<typeof fetch>;
  return proxied as typeof fetch;
}

/**
 * Resolve fetch for live send: explicit `fetchImpl` wins; else proxy from config; else default.
 */
export function resolveLiveFetch(opts: {
  configProxy: unknown;
  fetchImpl?: typeof fetch;
}): typeof fetch | undefined {
  if (opts.fetchImpl) {
    return opts.fetchImpl;
  }
  const proxy = resolveOutboundProxy(opts.configProxy);
  if (!proxy) {
    return undefined;
  }
  return createProxiedFetch(proxy);
}
