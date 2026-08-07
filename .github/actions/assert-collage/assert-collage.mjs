import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";

const inputPath = process.env.COLLAGE_PATH;
assert.ok(inputPath, "COLLAGE_PATH is required");

const workspace = process.env.GITHUB_WORKSPACE ?? process.cwd();
const collagePath = isAbsolute(inputPath)
  ? inputPath
  : resolve(workspace, inputPath);
const png = await readFile(collagePath);
const expectedWidth = Number(process.env.EXPECTED_WIDTH);
const expectedHeight = Number(process.env.EXPECTED_HEIGHT);
const minBytes = Number(process.env.MIN_BYTES);

assert.ok(png.byteLength >= minBytes, `PNG is only ${png.byteLength} bytes`);
assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
assert.equal(png.readUInt32BE(16), expectedWidth);
assert.equal(png.readUInt32BE(20), expectedHeight);

console.log(
  `collage ok: ${collagePath} (${expectedWidth}×${expectedHeight}, ${png.byteLength} bytes)`,
);
