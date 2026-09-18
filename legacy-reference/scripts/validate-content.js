#!/usr/bin/env node
// Validate content JSON. Run: node scripts/validate-content.js
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.resolve(fileURLToPath(import.meta.url), "../../content");
const files = ["scenarios.json","stakeholders.json","cards.json","black_swan.json"];
let ok = true;
for (const f of files) {
  const p = path.join(dir, f);
  if (!existsSync(p)) { console.error("MISSING", p); ok=false; continue; }
  try {
    JSON.parse(readFileSync(p, "utf-8"));
    console.log("✓", f);
  } catch (e) { console.error("✗", f, e.message); ok=false; }
}
process.exit(ok ? 0 : 1);
