// Black Friday Radar — the hand-in program.
//
// Copies the site (app/) and its screenshots (screenshots/) from
// this repository into the output directory and writes
// dossier.json there with buildDossier from the kit's library.
//
// The output directory is /output on the grader; outside it,
// MAKEFUN_OUTPUT_DIR stands in for /output. Only directories are
// created and files written here — nothing is ever deleted, so the
// program also runs when the output directory is read-only except
// for the files it writes.

import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
  app_path_max_bytes: 1000,
};

mkdirSync(outputDir, { recursive: true });
mkdirSync(join(outputDir, "app"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });

cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), {
  recursive: true,
});

const dossier = buildDossier(outputDir, dossierCaps);
const dossierPath = join(outputDir, "dossier.json");
writeFileSync(dossierPath, dossier);

// Read the dossier back and check it before reporting success:
// it must be the makefun/dossier/v1 schema and fit the 1.5 MiB cap
// the gate enforces, or the hand-in is invalid on arrival.
const written = JSON.parse(readFileSync(dossierPath, "utf8")) as {
  schema?: unknown;
};
if (written.schema !== "makefun/dossier/v1") {
  throw new Error("dossier.json has the wrong schema: " + String(written.schema));
}
if (dossier.length > 1572864) {
  throw new Error("dossier.json is over the 1.5 MiB cap: " + dossier.length + " bytes");
}

console.log(
  "Wrote " + outputDir + "/dossier.json (" + dossier.length + " bytes).",
);
