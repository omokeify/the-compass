import { copyFile, cp, mkdir, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const staticExtensions = new Set(['.jsx']);
const staticFiles = ['The Compass v1 dark.html'];
const staticDirs = ['uploads'];

await mkdir(dist, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && staticExtensions.has(extname(entry.name))) {
    await copyFile(join(root, entry.name), join(dist, entry.name));
  }
}

for (const file of staticFiles) {
  await copyFile(join(root, file), join(dist, file)).catch(() => {});
}

for (const dir of staticDirs) {
  await cp(join(root, dir), join(dist, dir), { recursive: true, force: true }).catch(() => {});
}

console.log('Copied Compass static runtime files into dist.');
