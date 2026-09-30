/**
 * Font registration — missing paths are skipped, register failures are ignored.
 */

import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

declareSuite({
  feature: "core-collage",
  story: "Canvas font registration",
  layer: "unit",
  component: "@qa-guru/allure-notifications-core",
  severity: "normal",
});

import { MONO, SANS_SERIF, registerFonts } from "../src/collage/fonts.js";

describe("registerFonts", () => {
  it("skips missing paths and ignores register failures", () => {
    const seen: string[] = [];
    registerFonts(["/definitely/not/a/font.ttf"], (path) => {
      seen.push(path);
    });
    assert.deepEqual(seen, []);

    const file = join(mkdtempSync(join(tmpdir(), "anb-fonts-")), "f.ttf");
    writeFileSync(file, "not a font");
    registerFonts(
      [file],
      () => {
        throw new Error("register failed");
      },
    );

    const ok: string[] = [];
    registerFonts([file], (path) => {
      ok.push(path);
    });
    assert.deepEqual(ok, [file]);
  });

  it("exposes fallback stacks ending in generic families", () => {
    assert.match(SANS_SERIF, /sans-serif$/);
    assert.match(MONO, /monospace$/);
  });
});
