import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    // Library entry
    './src/index',
    // CLI entry
    './src/cli',
  ],
  declaration: true,
  clean: true,
  rollup: {
    inlineDependencies: false,
    emitCJS: false,
  },
})
