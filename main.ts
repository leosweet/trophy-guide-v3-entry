// Leonida Legend — the hand-in program (Node 22, standard library only).
//
// The guide itself is plain static files in app/ (index.html, style.css, ES modules,
// data/trophies.json) with no build step: any static server can serve it, and it works
// with the network off. This program hands it in: it copies app/ and screenshots/
// from beside this file into the output directory and writes /output/dossier.json,
// the summary the judge reads (screenshots, first-load files and bytes, source),
// using the vendored make.fun library. Leave vendor/makefun-frontend.ts untouched —
// the scorer rebuilds the dossier with its own copy and compares the two byte for byte.
//
// Run it locally with MAKEFUN_OUTPUT_DIR set:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program runs twice in the grader and both runs must write the same bytes:
// it copies only the committed files, so keep generated output out of the repo
// (see .gitignore) and never write timestamps into app/ or screenshots/.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse — more than 4 screenshots or one
// over 256 KiB, more than 993 files and directories in app/ or 48 MiB of app files.
// app/ counts beside /output's own 1000-entry cap, with screenshots/ and dossier.json.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
