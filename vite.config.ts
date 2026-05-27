import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator';

export default defineConfig({
  publicDir: 'Public',

  plugins: [
    react(),

    vitePluginBundleObfuscator({
      enable: process.env.NODE_ENV === 'production',

      threadPool: true,
      autoExcludeNodeModules: true,

      excludes: [
        /react-vendor/,
        /ui-vendor/,
      ],

      options: {
        compact: true,

        // Đừng flatten mạnh quá 💀
        controlFlowFlattening: false,

        deadCodeInjection: false,

        debugProtection: false,
        selfDefending: false,

        identifierNamesGenerator: 'hexadecimal',

        renameGlobals: false,

        simplify: true,

        stringArray: true,
        stringArrayThreshold: 0.6,

        stringArrayRotate: true,
        stringArrayShuffle: true,

        splitStrings: false,

        unicodeEscapeSequence: false,

        ignoreImports: true,
      },
    }),
  ],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],

          'ui-vendor': [
            'lucide-react',
            'react-icons',
          ],
        },
      },
    },

    chunkSizeWarningLimit: 1000,

    cssCodeSplit: true,

    minify: 'terser',

    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
  },
});