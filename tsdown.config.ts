import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: './src/lib/index.ts',
    cli: './src/cli/index.ts',
  },
  format: 'esm',
  platform: 'node',
  target: 'node24',
  dts: true,
  clean: true,
  outExtensions: outputExtensions,
});

function outputExtensions() {
  return { js: '.mjs', dts: '.d.ts' };
}
