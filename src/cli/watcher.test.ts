import { EventEmitter } from 'node:events';
import chokidar from 'chokidar';
import { consola } from 'consola';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { compile } from '../lib/index';
import { startWatcher } from './watcher';

vi.mock('chokidar', () => ({
  default: { watch: vi.fn() },
}));

vi.mock('../lib/index', () => ({
  compile: vi.fn(),
}));

vi.mock('consola', () => ({
  consola: { info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() },
}));

function makeWatcher() {
  const emitter = new EventEmitter();
  vi.mocked(chokidar.watch).mockReturnValue(emitter as ReturnType<typeof chokidar.watch>);
  return emitter;
}

describe('startWatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('watches the resolved absolute baseDir', () => {
    makeWatcher();
    startWatcher({ filePattern: '**/*.ejs', baseDir: '/base' });
    expect(chokidar.watch).toHaveBeenCalledWith('/base', expect.any(Object));
  });

  it('compiles the changed file on change event', async () => {
    const emitter = makeWatcher();
    vi.mocked(compile).mockResolvedValue([
      { source: '/base/index.ejs', output: '/out/index.html', content: '' },
    ]);

    startWatcher({ filePattern: '**/*.ejs', baseDir: '/base', outDir: '/out' });
    emitter.emit('change', '/base/index.ejs');

    await vi.waitFor(() =>
      expect(compile).toHaveBeenCalledWith(
        'index.ejs',
        expect.objectContaining({ baseDir: '/base', outDir: '/out' }),
      ),
    );
  });

  it('compiles the added file on add event', async () => {
    const emitter = makeWatcher();
    vi.mocked(compile).mockResolvedValue([
      { source: '/base/new.ejs', output: '/out/new.html', content: '' },
    ]);

    startWatcher({ filePattern: '**/*.ejs', baseDir: '/base', outDir: '/out' });
    emitter.emit('add', '/base/new.ejs');

    await vi.waitFor(() =>
      expect(compile).toHaveBeenCalledWith(
        'new.ejs',
        expect.objectContaining({ baseDir: '/base' }),
      ),
    );
  });

  it('logs a warning on unlink and does not compile', () => {
    const emitter = makeWatcher();

    startWatcher({ filePattern: '**/*.ejs', baseDir: '/base' });
    emitter.emit('unlink', '/base/old.ejs');

    expect(compile).not.toHaveBeenCalled();
    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('old.ejs'));
  });

  it('logs errors during compilation without crashing', async () => {
    const emitter = makeWatcher();
    vi.mocked(compile).mockRejectedValue(new Error('syntax error'));

    startWatcher({ filePattern: '**/*.ejs', baseDir: '/base' });
    emitter.emit('change', '/base/broken.ejs');

    await vi.waitFor(() => expect(consola.error).toHaveBeenCalled());
  });

  it('silently ignores "No matching files found" errors', async () => {
    const emitter = makeWatcher();
    vi.mocked(compile).mockRejectedValue(new Error('No matching files found: _partial.ejs'));

    startWatcher({ filePattern: '**/*.ejs', baseDir: '/base' });
    emitter.emit('change', '/base/_partial.ejs');

    await new Promise((r) => setTimeout(r, 50));
    expect(consola.error).not.toHaveBeenCalled();
  });

  it('logs a startup message', () => {
    makeWatcher();
    startWatcher({ filePattern: '**/*.ejs', baseDir: '/base' });
    expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('Watching'));
  });
});
