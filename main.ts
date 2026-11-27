// Black Friday Deal Finder — entrypoint (Node 22, standard library only).
//
// The site is the static files in app/ beside this file, and the screenshots
// in screenshots/. This program hands them in: it copies both folders into the
// output directory and writes output/dossier.json with the kit's vendored
// make.fun library, so the judge reads exactly the site as shipped.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The output folder itself is never removed (the grader mounts it); only its
// previous contents are cleared, one entry at a time. vendor/makefun-frontend.ts
// is the kit's copy, unchanged: the scorer rebuilds the dossier with its own
// copy and the two must match byte for byte.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

function fail(message: string): never {
  throw new Error(`black-friday-deal-finder-01: ${message}`);
}

// Clear a directory's contents without removing the directory itself.
function clearContents(dir: string): void {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

// Copy a directory tree file by file, so no symlink or special file slips in.
function copyTree(from: string, to: string): number {
  let files = 0;
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    const src = join(from, name);
    const dst = join(to, name);
    const info = statSync(src);
    if (info.isDirectory()) {
      files += copyTree(src, dst);
    } else if (info.isFile()) {
      writeFileSync(dst, readFileSync(src));
      files += 1;
    } else {
      fail(`refusing non-regular file in ${src}`);
    }
  }
  return files;
}

if (!existsSync(join(appDir, 'index.html'))) fail('app/index.html is missing');
if (!existsSync(shotsDir)) fail('screenshots/ is missing');
const shotNames = readdirSync(shotsDir)
  .filter((name) => !name.startsWith('.'))
  .sort();
if (shotNames.length < 3 || shotNames.length > 4) {
  fail(`expected 3 or 4 screenshots, found ${shotNames.length}`);
}
for (const name of shotNames) {
  const size = statSync(join(shotsDir, name)).size;
  if (size > 262144) fail(`screenshot ${name} is ${size} bytes, over the 256 KiB cap`);
}

mkdirSync(out, { recursive: true });
clearContents(out);
const appFiles = copyTree(appDir, join(out, 'app'));
mkdirSync(join(out, 'screenshots'), { recursive: true });
const shotFiles = copyTree(shotsDir, join(out, 'screenshots'));

// The scorer's own caps: only text_max_bytes shapes the bytes; the rest refuse
// an entry the scorer would refuse (more than 4 screenshots or one over
// 256 KiB; more than 993 files and directories in app/ or 16 MiB of app files).
const dossierPath = join(out, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

// Read the dossier back and prove it is a whole, usable document before
// reporting success: a truncated or unparseable write must fail loudly here,
// not silently in the grader.
const dossier = JSON.parse(readFileSync(dossierPath, 'utf8')) as Record<string, unknown>;
for (const key of ['cover', 'images', 'schema', 'text']) {
  if (!(key in dossier)) fail(`dossier.json is missing its ${key} section`);
}
if (typeof dossier.text !== 'string' || dossier.text.length === 0) {
  fail('dossier.json has no text');
}

console.log(
  `handed in ${appFiles} app files and ${shotFiles} screenshots ` +
    `(${shotNames.map((n) => basename(n)).join(', ')}) to ${out} ` +
    `(dossier.json ${statSync(dossierPath).size} bytes)`,
);
