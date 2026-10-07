import { type CommandContext, parseArgs } from 'citty';
import { consola } from 'consola';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compile, loadOptionsData } from '../lib/index';
import { cliOptions as args } from './config';
import { compileHandler } from './handler';
import { startWatcher } from './watcher';

vi.mock('./watcher', function () {
  return { startWatcher: vi.fn() };
});

vi.mock('../lib/index', function () {
  return { compile: vi.fn(), loadOptionsData: vi.fn() };
});
vi.mock('consola', function () {
  return { consola: { log: vi.fn(), success: vi.fn(), error: vi.fn() } };
});

const exitError = new Error('Process exited');

beforeEach(function () {
  vi.mocked(compile).mockResolvedValue([{ source: 'index.ejs', content: '<h1>Hello</h1>' }]);
  vi.spyOn(process, 'exit').mockImplementation(function (): never {
    throw exitError;
  });
});

describe('compileHandler', function () {
  it('passes defaults to the compiler and prints HTML to stdout', async function () {
    await compileHandler(createContext());

    expect(compile).toHaveBeenCalledExactlyOnceWith('*.ejs', {
      baseDir: './',
      outDir: undefined,
      data: {},
      exclude: [],
      minify: false,
    });
    expect(startWatcher).not.toHaveBeenCalled();
    expect(loadOptionsData).not.toHaveBeenCalled();
    expect(consola.log).toHaveBeenCalledExactlyOnceWith('<h1>Hello</h1>');
    expect(consola.success).not.toHaveBeenCalled();
    expect(consola.error).not.toHaveBeenCalled();
    expect(process.exit).not.toHaveBeenCalled();
  });

  it.each([
    'data.json',
    '{"title":"Hello"}',
  ])('loads options from %s and forwards the data', async function (input) {
    const data = { title: 'Hello' };
    vi.mocked(loadOptionsData).mockResolvedValue(data);

    await compileHandler(createContext(['-O', input]));

    expect(loadOptionsData).toHaveBeenCalledExactlyOnceWith(input);
    expect(compile).toHaveBeenCalledWith('*.ejs', expect.objectContaining({ data }));
  });

  it('forwards paths and trims comma-separated exclusions', async function () {
    await compileHandler(
      createContext([
        '-f',
        '**/*.ejs',
        '-b',
        'templates',
        '-o',
        'output',
        '-e',
        '**/_*.ejs, skip.ejs ',
      ]),
    );

    expect(compile).toHaveBeenCalledExactlyOnceWith('**/*.ejs', {
      baseDir: 'templates',
      outDir: 'output',
      data: {},
      exclude: ['**/_*.ejs', 'skip.ejs'],
      minify: false,
    });
  });

  it.each(['-m', '--minify'])('forwards %s to the compiler', async function (flag) {
    await compileHandler(createContext([flag]));

    expect(compile).toHaveBeenCalledWith('*.ejs', expect.objectContaining({ minify: true }));
  });

  it.each([
    '-w',
    '--watch',
  ])('forwards compilation options to watch mode with %s', async function (flag) {
    const data = { title: 'Hello' };
    vi.mocked(loadOptionsData).mockResolvedValue(data);
    await compileHandler(
      createContext([
        flag,
        '-o',
        'output',
        '-b',
        'templates',
        '-O',
        'data.json',
        '-e',
        '_*.ejs',
        '-m',
      ]),
    );
    expect(startWatcher).toHaveBeenCalledExactlyOnceWith({
      filePattern: '*.ejs',
      baseDir: 'templates',
      outDir: 'output',
      data,
      exclude: ['_*.ejs'],
      minify: true,
    });
  });

  it('prints each result in order when writing to stdout', async function () {
    vi.mocked(compile).mockResolvedValue([
      { source: 'index.ejs', content: '<h1>Home</h1>' },
      { source: 'about.ejs', content: '<h1>About</h1>' },
    ]);

    await compileHandler(createContext());

    expect(consola.log).toHaveBeenCalledTimes(2);
    expect(consola.log).toHaveBeenNthCalledWith(1, '<h1>Home</h1>');
    expect(consola.log).toHaveBeenNthCalledWith(2, '<h1>About</h1>');
    expect(consola.success).not.toHaveBeenCalled();
  });

  it('reports the count and output paths when writing to a directory', async function () {
    vi.mocked(compile).mockResolvedValue([
      { source: 'index.ejs', output: 'output/index.html', content: '<h1>Home</h1>' },
      { source: 'about.ejs', output: 'output/about.html', content: '<h1>About</h1>' },
    ]);

    await compileHandler(createContext(['-o', 'output']));

    expect(consola.success).toHaveBeenCalledExactlyOnceWith('Compiled 2 file(s)');
    expect(consola.log).toHaveBeenCalledTimes(2);
    expect(consola.log).toHaveBeenNthCalledWith(1, 'index.ejs → output/index.html');
    expect(consola.log).toHaveBeenNthCalledWith(2, 'about.ejs → output/about.html');
  });

  it('reports options errors and exits without compiling', async function () {
    const error = new Error('Invalid options');
    vi.mocked(loadOptionsData).mockRejectedValue(error);

    await expect(compileHandler(createContext(['-O', 'data.json']))).rejects.toBe(exitError);

    expect(consola.error).toHaveBeenCalledExactlyOnceWith(error);
    expect(process.exit).toHaveBeenCalledExactlyOnceWith(1);
    expect(compile).not.toHaveBeenCalled();
    expect(consola.log).not.toHaveBeenCalled();
    expect(consola.success).not.toHaveBeenCalled();
  });

  it('reports compiler errors and exits without printing results', async function () {
    const error = new Error('Compilation failed');
    vi.mocked(compile).mockRejectedValue(error);

    await expect(compileHandler(createContext())).rejects.toBe(exitError);

    expect(consola.error).toHaveBeenCalledExactlyOnceWith(error);
    expect(process.exit).toHaveBeenCalledExactlyOnceWith(1);
    expect(consola.log).not.toHaveBeenCalled();
    expect(consola.success).not.toHaveBeenCalled();
  });
});

function createContext(rawArgs: string[] = []): CommandContext<typeof args> {
  const input = ['-f', '*.ejs', ...rawArgs];
  return { rawArgs: input, args: parseArgs<typeof args>(input, args), cmd: { args } };
}
