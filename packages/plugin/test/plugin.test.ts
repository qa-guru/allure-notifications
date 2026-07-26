import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import type { AllureStore, PluginContext } from "@allurereport/plugin-api";

import NotificationsPlugin, {
  PACKAGE,
  PHASE,
  runNotificationsPlugin,
} from "../src/index.js";

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
});
