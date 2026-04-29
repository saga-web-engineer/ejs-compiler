import type { CommandContext } from 'citty';
import { consola } from 'consola';

import { compile, loadOptionsData } from '../lib/index';
import type { cliOptions } from './config';
import { startWatcher } from './watcher';

export async function compileHandler(context: CommandContext<typeof cliOptions>): Promise<void> {
  const { args } = context;
  try {
    const data = args.options ? await loadOptionsData(args.options) : {};
    const exclude = args.exclude ? args.exclude.split(',').map((s: string) => s.trim()) : [];

    const results = await compile(args.file, {
      baseDir: args['base-dir'],
      outDir: args.out,
      data,
      exclude,
    });

    if (!args.out) {
      for (const result of results) consola.log(result.content);
      return;
    }

    consola.success(`Compiled ${results.length} file(s)`);
    for (const result of results) consola.log(`${result.source} → ${result.output}`);

    if (args.watch) {
      startWatcher({
        filePattern: args.file,
        baseDir: args['base-dir'],
        outDir: args.out,
        data,
        exclude,
      });
    }
  } catch (error) {
    consola.error(error);
    process.exit(1);
  }
}
