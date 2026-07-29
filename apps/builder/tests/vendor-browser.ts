import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

/** Load stand vendor copy; paths resolve from dist/test emit → apps/builder/vendor. */
function loadVendor<T extends object>(rel: string): T {
  const vendorPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../vendor",
    rel,
  );
  return require(vendorPath) as T;
}

export function loadConfigVendorBrowser(): typeof import("@allure-notifications/config/browser") {
  return loadVendor("allure-notifications-config/browser.js");
}

export function loadPyramidVendorBrowser(): typeof import("@allure-notifications/pyramid/browser") {
  return loadVendor("allure-notifications-pyramid/browser.js");
}
