const path = require('path');

const config = {
  root: 'src/',
  base: '/systems/svnsea2e/',
  publicDir:  path.resolve(__dirname, 'public'),
  server: {
    port: 30001,
    open: true,
    proxy: {
      '^(?!/systems/svnsea2e)': 'http://localhost:30000/',
      '/socket.io': {
        target: 'ws://localhost:30000',
        ws: true,
      },
    }
  },
  // optimizeDeps: {
  //   exclude: ['machine-mind'], // machine-mind triggers https://github.com/evanw/esbuild/issues/1433
  //   include: ['lancer-data', 'jszip', 'axios'], // machine-mind's cjs dependencies
  // },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      name: 'svnsea2e',
      entry: path.resolve(__dirname, 'src/svnsea2e.mjs'),
      formats: ['es'],
      fileName: 'svnsea2e'
    },
    rollupOptions: {
      output: {
        assetFileNames: "svnsea2e.[ext]",
      },
    },
  },
}

export default config;