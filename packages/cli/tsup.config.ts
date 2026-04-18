import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  {
    entry: ['src/bin.ts'],
    format: ['esm'],
    dts: false,
    clean: false,
    sourcemap: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
])
