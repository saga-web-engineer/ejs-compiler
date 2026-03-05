import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    // Library entry
    { input: './src/lib/index', name: 'index' },
    // CLI entry
    { input: './src/cli/index', name: 'cli' },
  ],
  declaration: true,
  clean: true,
  rollup: {
    inlineDependencies: false,
    emitCJS: false,
  },
});
