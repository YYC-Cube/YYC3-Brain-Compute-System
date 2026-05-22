/**
 * file vite.config.ts
 * description Vite 配置文件 · 包含构建、插件、别名等配置
 * author YanYuCloudCube Team
 * version v3.2.0
 * created 2026-02-26
 * updated 2026-05-23
 * status: active
 * tags: [config],[build],[vite],[bundle-analysis]
 */

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type Plugin } from 'vite';

const LOGO_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#06b6d4"/><text x="16" y="22" text-anchor="middle" font-size="16" font-weight="bold" fill="white">Y</text></svg>')}`;

function figmaAssetPlugin(): Plugin {
  const virtualPrefix = '\0figma-asset:';
  return {
    name: 'figma-asset-resolve',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('figma:asset/')) {
        return virtualPrefix + source;
      }
    },
    load(id) {
      if (id.startsWith(virtualPrefix)) {
        return `export default "${LOGO_PLACEHOLDER}"`;
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    figmaAssetPlugin(),
    visualizer({
      filename: 'stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3155,
    host: true,
  },
  preview: {
    port: 3155,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          charts: ['recharts'],
          motion: ['motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
