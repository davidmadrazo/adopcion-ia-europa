import { defineConfig } from 'vite'

// `base` se ajustara al publicar en GitHub Pages (p.ej. '/ia-europa-empresas/').
// './' permite servir el build desde cualquier carpeta de un servidor local.
export default defineConfig({
  base: './',
  // Config PostCSS vacia e inline: evita que Vite herede el postcss.config.js
  // del workspace raiz (template SaaS Factory, requiere tailwindcss). Usamos CSS plano.
  css: { postcss: { plugins: [] } },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
})
