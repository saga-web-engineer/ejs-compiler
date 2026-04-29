import type { Stats } from 'node:fs';
import chokidar from 'chokidar';
import { consola } from 'consola';
import { relative, resolve } from 'pathe';

import { compile } from '../lib/index';
import type { CompilerOptions } from '../lib/types';

export interface WatcherOptions extends CompilerOptions {
  filePattern: string | string[];
}

export function startWatcher(options: WatcherOptions): void {
  const { baseDir = process.cwd() } = options;
  const absoluteBaseDir = resolve(baseDir);

  const watcher = chokidar.watch(absoluteBaseDir, {
    ignoreInitial: true,
    ignored: (filePath: string, stats?: Stats) =>
      stats?.isFile() === true && !filePath.endsWith('.ejs'),
  });

  consola.info('Watching for changes...');

  watcher.on('change', (absolutePath) =>
    handleFile(relative(absoluteBaseDir, absolutePath), options),
  );
  watcher.on('add', (absolutePath) => handleFile(relative(absoluteBaseDir, absolutePath), options));
  watcher.on('unlink', (absolutePath) =>
    consola.warn(`Removed: ${relative(absoluteBaseDir, absolutePath)}`),
  );
  watcher.on('error', (error) => consola.error(error));
}

async function handleFile(file: string, options: WatcherOptions): Promise<void> {
  const { baseDir, outDir, data, exclude } = options;
  try {
    const results = await compile(file, { baseDir, outDir, data, exclude });
    for (const result of results)
      result.output
        ? consola.success(`${result.source} → ${result.output}`)
        : consola.log(result.content);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('No matching files found')) return;
    consola.error(error);
  }
}
