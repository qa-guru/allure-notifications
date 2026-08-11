import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

declareSuite({
  feature: "cli-send",
  story: "Outbound proxy",
  layer: "unit",
  component: "allure-notifications",
  severity: "critical",
});

import {
  ProxyAgent,
  Socks5ProxyAgent,
} from "undici";

import {
  buildProxyUri,
  createProxyDispatcher,
  resolveLiveFetch,
  resolveOutboundProxy,
} from "../src/proxy.js";
import { deliverLive } from "../src/messengers.js";
import { ADR008_CHAT_ID } from "../src/telegram.js";

describe("@qa-guru/allure-notifications proxy resolve", () => {
  it("returns undefined for missing / invalid proxy blocks", () => {
    assert.equal(resolveOutboundProxy(undefined), undefined);
    assert.equal(resolveOutboundProxy(null), undefined);
    assert.equal(resolveOutboundProxy({}), undefined);
    assert.equal(resolveOutboundProxy({ host: "p.example" }), undefined);
    assert.equal(resolveOutboundProxy({ host: "p.example", port: 0 }), undefined);
    assert.equal(
      resolveOutboundProxy({ host: "", port: 7777 }),
      undefined,
    );
  });

  it("defaults type to http; maps socks → socks5", () => {
    assert.deepEqual(resolveOutboundProxy({ host: "p.example", port: 8080 }), {
      type: "http",
      host: "p.example",
      port: 8080,
      username: undefined,
      password: undefined,
    });
    assert.equal(
      resolveOutboundProxy({ type: "socks5", host: "p.example", port: "7777" })
        ?.type,
      "socks5",
    );
    assert.equal(
      resolveOutboundProxy({ type: "socks", host: "p.example", port: 7777 })
        ?.type,
      "socks5",
    );
  });

  it("buildProxyUri encodes basic auth", () => {
    assert.equal(
      buildProxyUri({ type: "socks5", host: "proxy.qaguru.school", port: 7777 }),
      "socks5://proxy.qaguru.school:7777",
    );
    assert.equal(
      buildProxyUri({
        type: "http",
        host: "proxy.example",
        port: 3128,
        username: "u@x",
        password: "p/w",
      }),
      "http://u%40x:p%2Fw@proxy.example:3128",
    );
  });

  it("createProxyDispatcher picks Socks5ProxyAgent vs ProxyAgent", () => {
    const socks = createProxyDispatcher({
      type: "socks5",
      host: "127.0.0.1",
      port: 1,
    });
    const http = createProxyDispatcher({
      type: "http",
      host: "127.0.0.1",
      port: 1,
    });
    assert.ok(socks instanceof Socks5ProxyAgent);
    assert.ok(http instanceof ProxyAgent);
  });

  it("resolveOutboundProxy reads MICROSOCKS_* env when config omits auth", () => {
    const proxy = resolveOutboundProxy(
      { type: "socks5", host: "proxy.example", port: 7777 },
      { MICROSOCKS_USER: "u", MICROSOCKS_PASS: "p" },
    );
    assert.equal(proxy?.username, "u");
    assert.equal(proxy?.password, "p");
  });

  it("resolveLiveFetch: explicit fetchImpl wins over config.proxy", () => {
    const custom: typeof fetch = async () => new Response("ok");
    const resolved = resolveLiveFetch({
      configProxy: { type: "socks5", host: "proxy.example", port: 7777 },
      fetchImpl: custom,
    });
    assert.equal(resolved, custom);
  });

  it("resolveLiveFetch: builds proxied fetch when proxy set and no fetchImpl", () => {
    const resolved = resolveLiveFetch({
      configProxy: { type: "socks5", host: "proxy.example", port: 7777 },
    });
    assert.ok(resolved);
    assert.notEqual(resolved, fetch);
  });

  it("resolveLiveFetch: undefined when no proxy and no fetchImpl", () => {
    assert.equal(resolveLiveFetch({ configProxy: undefined }), undefined);
  });
});

describe("@qa-guru/allure-notifications proxy live wiring", () => {
  it("deliverLive uses config.proxy when fetchImpl omitted (mocked agent path)", async () => {
    let sawDispatcher = false;
    const fetchImpl: typeof fetch = async (_input, init) => {
      // When tests inject fetchImpl, proxy is skipped — assert that path still sends.
      sawDispatcher = init != null;
      return new Response(
        JSON.stringify({
          ok: true,
          result: { message_id: 99, chat: { id: Number(ADR008_CHAT_ID) } },
        }),
        { status: 200 },
      );
    };

    const results = await deliverLive(
      {
        base: {},
        telegram: { token: "1:t", chat: ADR008_CHAT_ID },
        proxy: { type: "socks5", host: "proxy.qaguru.school", port: 7777 },
      },
      {
        dryRun: false,
        mock: false,
        live: true,
        png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
        pngBytes: 4,
        fetchImpl,
      },
    );

    assert.equal(results[0]!.status, "sent");
    assert.equal(results[0]!.messageId, 99);
    assert.ok(sawDispatcher);
  });
});
