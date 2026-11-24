import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Budowanie:
 *  - `npm run build`        → dist/        (index.html + assets/: wersja do hostingu, np. GitHub Pages)
 *  - `npm run build:single` → dist-single/ (cała gra w jednym pliku HTML – offline, z pendrive'a)
 *  - `npm run deploy`       → oba powyższe + kopiowanie gotowej gry do katalogu głównego repozytorium
 *
 * Pliki wynikowe mają stałe nazwy (assets/bone-zone.js, assets/bone-zone.css),
 * żeby zmiany w repozytorium były czytelne, a ścieżki względne (base: './'),
 * żeby gra działała także w podkatalogu, np. https://uzytkownik.github.io/bone-zone/.
 */
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    emptyOutDir: true,
    rollupOptions: mode === 'single' ? {} : {
      output: {
        entryFileNames: 'assets/bone-zone.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/bone-zone.[ext]',
      },
    },
  },
}));
