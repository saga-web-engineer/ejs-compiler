import type { CommandContext } from 'citty';
import { consola } from 'consola';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compile, loadOptionsData } from '../lib/index';
import type { cliOptions } from './config';
import { compileHandler } from './handler';

vi.mock('consola', () => ({
  consola: {
    log: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../lib/index', () => ({
  compile: vi.fn(),
  loadOptionsData: vi.fn(),
}));

type HandlerContext = CommandContext<typeof cliOptions>;

function makeContext(params: {
  file: string;
  baseDir?: string;
  out?: string;
  options?: string;
  exclude?: string;
}): HandlerContext {
  const { file, baseDir = '/base', out, options, exclude } = params;
  return {
    rawArgs: [],
    cmd: {},
    args: {
      _: [],
      file,
      'base-dir': baseDir,
      out,
      options,
      exclude,
      f: file,
      b: baseDir,
      o: out,
      O: options,
      e: exclude,
    } as HandlerContext['args'],
  };
}

describe('compileHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  it('logs each result content when outDir is not specified', async () => {
    vi.mocked(compile).mockResolvedValue([
      { source: '/base/index.ejs', content: '<h1>Hello</h1>' },
      { source: '/base/about.ejs', content: '<h1>About</h1>' },
    ]);

    await compileHandler(makeContext({ file: '**/*.ejs' }));

    expect(consola.log).toHaveBeenCalledWith('<h1>Hello</h1>');
    expect(consola.log).toHaveBeenCalledWith('<h1>About</h1>');
    expect(consola.success).not.toHaveBeenCalled();
  });

  it('logs a success message and file paths when outDir is specified', async () => {
    vi.mocked(compile).mockResolvedValue([
      { source: '/base/index.ejs', output: '/out/index.html', content: '<h1>Hello</h1>' },
    ]);

    await compileHandler(makeContext({ file: '**/*.ejs', out: '/out' }));

    expect(consola.success).toHaveBeenCalledWith('Compiled 1 file(s)');
    expect(consola.log).toHaveBeenCalledWith('/base/index.ejs → /out/index.html');
  });

  it('calls loadOptionsData and passes the result as data when options is provided', async () => {
    vi.mocked(loadOptionsData).mockResolvedValue({ title: 'My Site' });
    vi.mocked(compile).mockResolvedValue([{ source: '/base/index.ejs', content: '' }]);

    await compileHandler(makeContext({ file: '**/*.ejs', options: '{"title":"My Site"}' }));

    expect(loadOptionsData).toHaveBeenCalledWith('{"title":"My Site"}');
    expect(compile).toHaveBeenCalledWith(
      '**/*.ejs',
      expect.objectContaining({ data: { title: 'My Site' } }),
    );
  });

  it('uses an empty object for data when options is not provided', async () => {
    vi.mocked(compile).mockResolvedValue([{ source: '/base/index.ejs', content: '' }]);

    await compileHandler(makeContext({ file: '**/*.ejs' }));

    expect(loadOptionsData).not.toHaveBeenCalled();
    expect(compile).toHaveBeenCalledWith('**/*.ejs', expect.objectContaining({ data: {} }));
  });

  it('splits and trims comma-separated exclude patterns', async () => {
    vi.mocked(compile).mockResolvedValue([{ source: '/base/index.ejs', content: '' }]);

    await compileHandler(makeContext({ file: '**/*.ejs', exclude: '_*.ejs , about.ejs' }));

    expect(compile).toHaveBeenCalledWith(
      '**/*.ejs',
      expect.objectContaining({ exclude: ['_*.ejs', 'about.ejs'] }),
    );
  });

  it('uses an empty array for exclude when exclude is not provided', async () => {
    vi.mocked(compile).mockResolvedValue([{ source: '/base/index.ejs', content: '' }]);

    await compileHandler(makeContext({ file: '**/*.ejs' }));

    expect(compile).toHaveBeenCalledWith('**/*.ejs', expect.objectContaining({ exclude: [] }));
  });

  it('calls consola.error and exits with code 1 on error', async () => {
    const error = new Error('Template not found');
    vi.mocked(compile).mockRejectedValue(error);

    await compileHandler(makeContext({ file: '**/*.ejs' }));

    expect(consola.error).toHaveBeenCalledWith(error);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
