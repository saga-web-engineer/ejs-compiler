import chokidar, { FSWatcher } from 'chokidar';
import { consola } from 'consola';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { compile } from '../lib/index';
import { startWatcher } from './watcher';

vi.mock('../lib/index', function () {
  return { compile: vi.fn() };
});
vi.mock('consola', function () {
  return {
    consola: { info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() },
  };
});

describe('startWatcher', function () {
  it('watches the resolved base directory and reports startup', function () {
    makeWatcher();
    startWatcher({ filePattern: '**/*.ejs', baseDir: '/base' });
    expect(chokidar.watch).toHaveBeenCalledWith(
      '/base',
      expect.objectContaining({ ignoreInitial: true }),
    );
    expect(consola.info).toHaveBeenCalledExactlyOnceWith('Watching for changes...');
  });

  it.each([
    'change',
    'add',
  ] as const)('compiles the file on %s and preserves options', async function (event) {
    const watcher = makeWatcher();
    vi.mocked(compile).mockResolvedValue([
      { source: '/base/index.ejs', output: '/out/index.html', content: '' },
    ]);
    startWatcher({
      filePattern: '*.ejs',
      baseDir: '/base',
      outDir: '/out',
      data: { title: 'Hello' },
      exclude: ['_*'],
      minify: true,
    });
    watcher.emit(event, '/base/index.ejs');
    await vi.waitFor(function () {
      expect(consola.success).toHaveBeenCalledExactlyOnceWith('/base/index.ejs → /out/index.html');
    });
    expect(compile).toHaveBeenCalledExactlyOnceWith('index.ejs', {
      baseDir: '/base',
      outDir: '/out',
      data: { title: 'Hello' },
      exclude: ['_*'],
      minify: true,
    });
  });

  it('prints compiled content when there is no output path', async function () {
    const watcher = makeWatcher();
    vi.mocked(compile).mockResolvedValue([
      { source: '/base/index.ejs', content: '<h1>Hello</h1>' },
    ]);
    startWatcher({ filePattern: '*.ejs', baseDir: '/base' });
    watcher.emit('change', '/base/index.ejs');
    await vi.waitFor(function () {
      expect(consola.log).toHaveBeenCalledExactlyOnceWith('<h1>Hello</h1>');
    });
  });

  it('reports removal without compiling', function () {
    const watcher = makeWatcher();
    startWatcher({ filePattern: '*.ejs', baseDir: '/base' });
    watcher.emit('unlink', '/base/old.ejs');
    expect(compile).not.toHaveBeenCalled();
    expect(consola.warn).toHaveBeenCalledExactlyOnceWith('Removed: old.ejs');
  });

  it('reports compilation errors and continues processing changes', async function () {
    const watcher = makeWatcher();
    const error = new Error('Invalid template');
    vi.mocked(compile)
      .mockRejectedValueOnce(error)
      .mockResolvedValue([{ source: '/base/index.ejs', content: 'Fixed' }]);
    startWatcher({ filePattern: '*.ejs', baseDir: '/base' });
    watcher.emit('change', '/base/index.ejs');
    await vi.waitFor(function () {
      expect(consola.error).toHaveBeenCalledExactlyOnceWith(error);
    });
    watcher.emit('change', '/base/index.ejs');
    await vi.waitFor(function () {
      expect(consola.log).toHaveBeenCalledExactlyOnceWith('Fixed');
    });
  });

  it('ignores unmatched files without logging errors', async function () {
    const watcher = makeWatcher();
    vi.mocked(compile)
      .mockRejectedValueOnce(new Error('No matching files found: _partial.ejs'))
      .mockResolvedValue([{ source: '/base/index.ejs', content: 'Hello' }]);
    startWatcher({ filePattern: '*.ejs', baseDir: '/base' });
    watcher.emit('change', '/base/_partial.ejs');
    watcher.emit('change', '/base/index.ejs');
    await vi.waitFor(function () {
      expect(consola.log).toHaveBeenCalledWith('Hello');
    });
    expect(consola.error).not.toHaveBeenCalled();
  });

  it('reports watcher errors', function () {
    const watcher = makeWatcher();
    const error = new Error('Watch failed');
    startWatcher({ filePattern: '*.ejs', baseDir: '/base' });
    watcher.emit('error', error);
    expect(consola.error).toHaveBeenCalledExactlyOnceWith(error);
  });
});

function makeWatcher(): FSWatcher {
  // Construct an event source without adding paths or starting filesystem watching.
  const watcher = new FSWatcher();
  vi.spyOn(chokidar, 'watch').mockReturnValue(watcher);
  onTestFinished(async function () {
    await watcher.close();
  });
  return watcher;
}
