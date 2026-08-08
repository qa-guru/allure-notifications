#!/usr/bin/env node

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const workflows = [
  ".github/workflows/action-e2e.yml",
  ".github/workflows/example-native-cli.yml",
  ".github/workflows/example-allure-plugin.yml",
  ".github/workflows/example-marketplace.yml",
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
  if (workflow.startsWith(".github/workflows/example-")) {
    assert.match(source, /^\s*workflow_dispatch:\s*$/m);
  }
}

const [e2e, native, plugin, marketplace] = await Promise.all(
  workflows.slice(0, 4).map((workflow) => readFile(workflow, "utf8")),
);
assert.match(e2e, /^\s*uses:\s*\.\/\s*$/m);
assert.match(e2e, /uses:\s*\.\/\.github\/actions\/assert-collage/);
assert.match(native, /\ballure-notifications send\b/);
assert.match(plugin, /@qa-guru\/allure-notifications-plugin@6\.0\.14/);
assert.match(marketplace, /uses:\s*qa-guru\/allure-notifications@v6/);

const config = JSON.parse(
  await readFile("examples/github-actions/notifications/config.json", "utf8"),
);
assert.deepEqual(
  {
    token: config.telegram?.token,
    chat: config.telegram?.chat,
    topic: config.telegram?.topic,
  },
  { token: "", chat: "", topic: "" },
);

await access("action.yml");
await assert.rejects(access("action.yaml"));
await access(".github/actions/assert-collage/action.yml");

console.log(
  "Action examples ok: local, Marketplace, native CLI, and plugin workflows",
);
