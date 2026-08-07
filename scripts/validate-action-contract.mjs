#!/usr/bin/env node

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const workflows = [
  ".github/workflows/action-e2e.yml",
  "examples/github-actions/cli-notify.yml",
];

for (const workflow of workflows) {
  const source = await readFile(workflow, "utf8");
  const generateCount = source.match(/\ballure generate\b/g)?.length ?? 0;
  assert.equal(
    generateCount,
    1,
    `${workflow} must contain exactly one allure generate`,
  );
  assert.doesNotMatch(source, /render-notifications-config|allure-report\.sh/);
  assert.doesNotMatch(source, /\bnode\s+<<|\bnode\s+-\s*<</);
}

const e2e = await readFile(workflows[0], "utf8");
assert.match(e2e, /^\s*uses:\s*\.\/\s*$/m);
assert.match(e2e, /\btest -s build\/action-e2e-collage\.png\b/);

await access("action.yml");
await assert.rejects(access("action.yaml"));

console.log("Action contract ok: one root metadata file, one generate per workflow");
