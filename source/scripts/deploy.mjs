/**
 * Kopiuje zbudowaną grę z source/dist do katalogu głównego repozytorium (folder nadrzędny),
 * tak aby GitHub Pages mógł ją serwować z gałęzi main, folder „/ (root)”.
 *
 * Usuwa tylko pliki, którymi sam zarządza: index.html, assets/, offline/, .nojekyll.
 * Nie dotyka folderu source/, README.md ani innych plików repozytorium.
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '..');
const root = resolve(source, '..');
const dist = join(source, 'dist');
const single = join(source, 'dist-single', 'index.html');

if (!existsSync(join(dist, 'index.html'))) {
  console.error('Brak source/dist/index.html – najpierw uruchom „npm run build”.');
  process.exit(1);
}

rmSync(join(root, 'assets'), { recursive: true, force: true });
rmSync(join(root, 'index.html'), { force: true });
cpSync(join(dist, 'index.html'), join(root, 'index.html'));
cpSync(join(dist, 'assets'), join(root, 'assets'), { recursive: true });
// GitHub Pages: wyłącza przetwarzanie Jekyll (pliki są serwowane bez zmian)
writeFileSync(join(root, '.nojekyll'), '');

if (existsSync(single)) {
  rmSync(join(root, 'offline'), { recursive: true, force: true });
  mkdirSync(join(root, 'offline'), { recursive: true });
  cpSync(single, join(root, 'offline', 'bone-zone-offline.html'));
}

console.log('✓ Gra skopiowana do katalogu głównego: index.html, assets/' + (existsSync(single) ? ', offline/bone-zone-offline.html' : ''));
