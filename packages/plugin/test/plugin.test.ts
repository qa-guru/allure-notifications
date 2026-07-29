import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { declareSuite } from "@allure-notifications/test-meta";

declareSuite({
  feature: "plugin-hook",
  story: "Plugin done hook",
  layer: "unit",
  component: "@allure-notifications/plugin",
  severity: "normal",
});

import type { AllureStore, PluginContext } from "@allurereport/plugin-api";

import NotificationsPlugin, {
  PACKAGE,
  PHASE,
  runNotificationsPlugin,
} from "../src/index.js";

const ADR008_CHAT_ID = "-1004381150566";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Compiled at packages/plugin/dist/test → fixtures at packages/plugin/test/fixtures */
const FIXTURE_CONFIG = join(
  __dirname,
  "../../test/fixtures/config.dry-run.json",
);

function isPng(buf: Buffer): boolean {
  return (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  );
}

function mockContext(overrides: Partial<PluginContext> = {}): {
  context: PluginContext;
  files: Map<string, Buffer>;
} {
  const files = new Map<string, Buffer>();
  const context: PluginContext = {
    id: "notifications",
    publish: false,
    state: {
      set: async () => undefined,
      get: async <T>(_key: string): Promise<T> => undefined as T,
      unset: async () => undefined,
    },
    allureVersion: "3.14.3",
    reportUuid: "test-uuid",
    reportName: "plugin-dry-run",
    reportFiles: {
      addFile: async (path, data) => {
        files.set(path, data);
        return path;
      },
    },
    output: join(tmpdir(), "an-plugin-unused-output"),
    ...overrides,
  };
  return { context, files };
}

const emptyStore = {} as AllureStore;

describe("@allure-notifications/plugin package", () => {
  it("exports Phase 5 identity", () => {
    assert.equal(PACKAGE, "@allure-notifications/plugin");
    assert.equal(PHASE, 5);
  });

  it("default export is NotificationsPlugin class", () => {
    const plugin = new NotificationsPlugin({ config: FIXTURE_CONFIG });
    assert.equal(typeof plugin.done, "function");
  });
});

describe("@allure-notifications/plugin done dry-run", () => {
  it("renders PNG from fixture config and dry-runs messengers (no network)", async () => {
    const { context, files } = mockContext();
    const result = await runNotificationsPlugin(context, {
      config: FIXTURE_CONFIG,
      mode: "dry-run",
    });

    assert.ok(isPng(result.png), "expected PNG magic bytes");
    assert.ok(result.png.byteLength > 1000);
    assert.equal(result.mode, "dry-run");
    assert.equal(result.deliveries[0]!.messenger, "telegram");
    assert.equal(result.deliveries[0]!.status, "dry-run");
    assert.match(result.deliveries[0]!.detail, /no network/);
    assert.equal(result.pngPath, undefined);

    assert.ok(files.has("allure-notifications-collage.png"));
    assert.ok(isPng(files.get("allure-notifications-collage.png")!));
  });

  it("defaults mode to dry-run when omitted", async () => {
    const { context } = mockContext();
    const result = await runNotificationsPlugin(context, {
      config: FIXTURE_CONFIG,
    });
    assert.equal(result.mode, "dry-run");
    assert.equal(result.deliveries[0]!.status, "dry-run");
  });

  it("writes PNG to out path in mock mode", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-plugin-"));
    const out = join(dir, "collage.png");
    try {
      const { context } = mockContext();
      const result = await runNotificationsPlugin(context, {
        config: FIXTURE_CONFIG,
        mode: "mock",
        out,
        reportFile: false,
      });
      assert.equal(result.mode, "mock");
      assert.equal(result.pngPath, out);
      assert.equal(result.deliveries[0]!.status, "mocked");
      const onDisk = await readFile(out);
      assert.ok(isPng(onDisk));
      assert.equal(onDisk.byteLength, result.png.byteLength);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("accepts inline config object", async () => {
    const raw = JSON.parse(await readFile(FIXTURE_CONFIG, "utf8")) as Record<
      string,
      unknown
    >;
    const { context } = mockContext();
    const result = await runNotificationsPlugin(context, {
      config: raw,
      cwd: dirname(FIXTURE_CONFIG),
      reportFile: false,
    });
    assert.ok(isPng(result.png));
    assert.equal(result.mode, "dry-run");
  });

  it("Plugin.done completes without throw (etalon hook)", async () => {
    const plugin = new NotificationsPlugin({
      config: FIXTURE_CONFIG,
      mode: "dry-run",
      reportFile: false,
    });
    const { context } = mockContext();
    await plugin.done!(context, emptyStore);
  });

  it("throws when options.config is missing", async () => {
    const { context } = mockContext();
    await assert.rejects(
      () =>
        runNotificationsPlugin(context, {
          config: undefined as unknown as string,
        }),
      /options\.config is required/,
    );
  });

  it("loads config from absolute path", async () => {
    const absConfig = resolve(FIXTURE_CONFIG);
    const { context } = mockContext();
    const result = await runNotificationsPlugin(context, {
      config: absConfig,
      reportFile: false,
    });
    assert.ok(isPng(result.png));
    assert.equal(result.mode, "dry-run");
  });

  it("rejects invalid JSON config file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-plugin-json-"));
    const cfg = join(dir, "bad.json");
    try {
      await writeFile(cfg, "{");
      const { context } = mockContext();
      await assert.rejects(
        () =>
          runNotificationsPlugin(context, {
            config: cfg,
            reportFile: false,
          }),
        /invalid JSON/,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("rejects zod-invalid config file with path-scoped errors", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-plugin-zod-"));
    const cfg = join(dir, "bad.json");
    try {
      await writeFile(
        cfg,
        JSON.stringify({
          base: {
            chart: {
              mode: "collage",
              layout: "free",
              width: 870,
              height: 1080,
              items: [{ type: "pie", x: 0, y: 0, w: 0, h: 0 }],
            },
          },
        }),
      );
      const { context } = mockContext();
      await assert.rejects(
        () =>
          runNotificationsPlugin(context, {
            config: cfg,
            reportFile: false,
          }),
        /invalid config.*base\.chart\.items\.0\.w/s,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("rejects zod-invalid inline config", async () => {
    const { context } = mockContext();
    await assert.rejects(
      () =>
        runNotificationsPlugin(context, {
          config: { base: { project: 123 } },
          reportFile: false,
        }),
      /invalid config \(inline options\.config\)/,
    );
  });

  it("applies relative and absolute folder overrides", async () => {
    const raw = JSON.parse(await readFile(FIXTURE_CONFIG, "utf8")) as Record<
      string,
      unknown
    >;
    const base = raw.base as Record<string, unknown>;
    delete base.allureFolder;
    delete base.allureResultsFolder;

    const cwd = dirname(FIXTURE_CONFIG);
    const relFolder = "../../../core/test/fixtures/dogfood-report";
    const absResults = join(cwd, "../../../core/test/fixtures/dogfood-results");

    const { context } = mockContext();
    const result = await runNotificationsPlugin(context, {
      config: { ...raw, base },
      cwd,
      allureFolder: relFolder,
      allureResultsFolder: absResults,
      reportFile: false,
    });

    assert.ok(isPng(result.png));
    assert.equal(result.config.base.allureFolder, resolve(cwd, relFolder));
    assert.equal(result.config.base.allureResultsFolder, absResults);
    assert.ok(isAbsolute(result.config.base.allureResultsFolder!));
  });

  it("writes PNG to absolute out path in live mode with mocked fetch", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-plugin-live-"));
    const out = join(dir, "collage.png");
    const fetchImpl: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          ok: true,
          result: {
            message_id: 11,
            chat: { id: Number(ADR008_CHAT_ID) },
          },
        }),
        { status: 200 },
      );
    try {
      const { context } = mockContext();
      const result = await runNotificationsPlugin(context, {
        config: FIXTURE_CONFIG,
        mode: "live",
        out,
        reportFile: false,
        env: {
          TELEGRAM_BOT_TOKEN: "1:test-token",
          TELEGRAM_CHAT_ID: ADR008_CHAT_ID,
        },
        fetchImpl,
      });
      assert.equal(result.mode, "live");
      assert.equal(result.pngPath, out);
      assert.equal(result.deliveries[0]!.status, "sent");
      const onDisk = await readFile(out);
      assert.equal(onDisk.byteLength, result.png.byteLength);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("attaches collage under custom reportFile name", async () => {
    const { context, files } = mockContext();
    await runNotificationsPlugin(context, {
      config: FIXTURE_CONFIG,
      reportFile: "custom-collage.png",
    });
    assert.ok(files.has("custom-collage.png"));
    assert.ok(isPng(files.get("custom-collage.png")!));
  });

  it("loads relative config path and relative out; falls back to context.output", async () => {
    const cwd = dirname(FIXTURE_CONFIG);
    const relConfig = "config.dry-run.json";
    const dogfoodReport = resolve(
      cwd,
      "../../../core/test/fixtures/dogfood-report",
    );
    const outDir = await mkdtemp(join(tmpdir(), "an-plugin-rel-"));
    try {
      const { context } = mockContext({ output: dogfoodReport });
      const raw = JSON.parse(await readFile(FIXTURE_CONFIG, "utf8")) as {
        base: Record<string, unknown>;
      };
      delete raw.base.allureFolder;
      delete raw.base.allureResultsFolder;

      const result = await runNotificationsPlugin(context, {
        config: raw,
        cwd: outDir,
        out: "relative-out.png",
        reportFile: false,
      });
      assert.equal(result.config.base.allureFolder, dogfoodReport);
      assert.equal(result.pngPath, join(outDir, "relative-out.png"));
      assert.ok(isPng(await readFile(result.pngPath!)));

      const viaRel = await runNotificationsPlugin(context, {
        config: relConfig,
        cwd,
        reportFile: false,
      });
      assert.ok(isPng(viaRel.png));
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("rejects non-Error JSON parse failures from config file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-plugin-parse-"));
    const cfg = join(dir, "x.json");
    await writeFile(cfg, "{}");
    const original = JSON.parse;
    JSON.parse = () => {
      throw "plugin-parse-failed";
    };
    try {
      const { context } = mockContext();
      await assert.rejects(
        () =>
          runNotificationsPlugin(context, {
            config: cfg,
            reportFile: false,
          }),
        /plugin-parse-failed/,
      );
    } finally {
      JSON.parse = original;
      await rm(dir, { recursive: true, force: true });
    }
  });
});
