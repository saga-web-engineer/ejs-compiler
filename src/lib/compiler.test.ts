import { mkdir, readFile, writeFile } from 'node:fs/promises';
import ejs from 'ejs';
import fg from 'fast-glob';
import { dirname, join } from 'pathe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compile, loadOptionsData } from './index';

vi.mock('node:fs/promises', function () {
  return { mkdir: vi.fn(), readFile: vi.fn(), writeFile: vi.fn() };
});
vi.mock('fast-glob', function () {
  return { default: vi.fn() };
});
vi.mock('ejs', function () {
  return { default: { renderFile: vi.fn() } };
});

beforeEach(function () {
  vi.mocked(fg).mockResolvedValue(['index.ejs']);
  vi.mocked(ejs.renderFile).mockResolvedValue('<h1>Hello</h1>');
});

describe('compile', function () {
  it('uses the current directory and returns HTML without writing files by default', async function () {
    const results = await compile('*.ejs');
    expect(fg).toHaveBeenCalledWith('*.ejs', {
      cwd: process.cwd(),
      ignore: [],
      absolute: false,
      onlyFiles: true,
    });
    expect(ejs.renderFile).toHaveBeenCalledWith(join(process.cwd(), 'index.ejs'), {});
    expect(results).toEqual([
      { source: join(process.cwd(), 'index.ejs'), output: undefined, content: '<h1>Hello</h1>' },
    ]);
    expect(mkdir).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('passes multiple patterns, exclusions, base directory, and data to its dependencies', async function () {
    const data = { title: 'Hello' };
    const patterns = ['pages/*.ejs', 'posts/*.ejs'];
    vi.mocked(fg).mockResolvedValue(['pages/index.ejs', 'posts/hello.ejs']);
    const results = await compile(patterns, {
      baseDir: 'templates',
      exclude: ['**/_*.ejs'],
      data,
    });
    expect(fg).toHaveBeenCalledWith(patterns, {
      cwd: 'templates',
      ignore: ['**/_*.ejs'],
      absolute: false,
      onlyFiles: true,
    });
    expect(
      results.map(function (result) {
        return result.source;
      }),
    ).toEqual(['templates/pages/index.ejs', 'templates/posts/hello.ejs']);
    expect(ejs.renderFile).toHaveBeenCalledTimes(2);
    expect(ejs.renderFile).toHaveBeenCalledWith('templates/pages/index.ejs', data);
    expect(ejs.renderFile).toHaveBeenCalledWith('templates/posts/hello.ejs', data);
  });

  it.each([
    ['pages/index.ejs', 'pages/index.html'],
    ['pages/index.html.ejs', 'pages/index.html'],
    ['feed.xml.ejs', 'feed.xml'],
    ['plain', 'plain.html'],
  ])('writes %s to %s and creates parent directories', async function (source, output) {
    vi.mocked(fg).mockResolvedValue([source]);
    const results = await compile('**/*', { baseDir: 'templates', outDir: 'output' });
    const outputPath = join('output', output);
    expect(mkdir).toHaveBeenCalledWith(dirname(outputPath), { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(outputPath, '<h1>Hello</h1>', 'utf-8');
    expect(results).toEqual([
      { source: join('templates', source), output: outputPath, content: '<h1>Hello</h1>' },
    ]);
  });

  it('enables EJS whitespace removal when minify is true', async function () {
    const data = { title: 'Hello' };
    await compile('*.ejs', { baseDir: 'templates', data, minify: true });
    expect(ejs.renderFile).toHaveBeenCalledWith('templates/index.ejs', data, {
      rmWhitespace: true,
    });
  });

  it('preserves the existing EJS call when minify is false', async function () {
    await compile('*.ejs', { baseDir: 'templates', minify: false });
    expect(ejs.renderFile).toHaveBeenCalledWith('templates/index.ejs', {});
  });

  it('rejects when no files match without rendering or writing', async function () {
    vi.mocked(fg).mockResolvedValue([]);
    await expect(compile('missing/*.ejs')).rejects.toThrow(
      'No matching files found: missing/*.ejs',
    );
    expect(ejs.renderFile).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('propagates template errors without writing output', async function () {
    const error = new Error('Invalid template');
    vi.mocked(ejs.renderFile).mockRejectedValue(error);
    await expect(compile('*.ejs', { outDir: 'output' })).rejects.toBe(error);
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('propagates directory creation errors', async function () {
    const error = new Error('Cannot create output directory');
    vi.mocked(mkdir).mockRejectedValue(error);
    await expect(compile('*.ejs', { outDir: 'output' })).rejects.toBe(error);
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('propagates output write errors', async function () {
    const error = new Error('Cannot write output');
    vi.mocked(writeFile).mockRejectedValue(error);
    await expect(compile('*.ejs', { outDir: 'output' })).rejects.toBe(error);
  });
});

describe('loadOptionsData', function () {
  it('parses inline JSON without reading a file', async function () {
    await expect(loadOptionsData('{"title":"Hello","count":2}')).resolves.toEqual({
      title: 'Hello',
      count: 2,
    });
    expect(readFile).not.toHaveBeenCalled();
  });

  it('loads and parses a JSON file', async function () {
    vi.mocked(readFile).mockResolvedValue('{"title":"Hello"}');
    await expect(loadOptionsData('data.json')).resolves.toEqual({ title: 'Hello' });
    expect(readFile).toHaveBeenCalledWith('data.json', 'utf-8');
  });

  it('rejects malformed JSON files', async function () {
    vi.mocked(readFile).mockResolvedValue('{invalid}');
    await expect(loadOptionsData('data.json')).rejects.toBeInstanceOf(SyntaxError);
  });

  it('propagates file read errors', async function () {
    const error = new Error('Cannot read data file');
    vi.mocked(readFile).mockRejectedValue(error);
    await expect(loadOptionsData('missing.json')).rejects.toBe(error);
  });
});

describe('exclude pattern normalization', function () {
  it.each([
    ['_*', '**/_*'],
    ['partials/_*', 'partials/_*'],
  ])('normalizes %s to %s', async function (pattern, expected) {
    await compile('**/*.ejs', { exclude: [pattern] });
    expect(fg).toHaveBeenCalledWith('**/*.ejs', expect.objectContaining({ ignore: [expected] }));
  });
});

it('returns each template rendering in file order', async function () {
  vi.mocked(fg).mockResolvedValue(['a.ejs', 'b.ejs']);
  vi.mocked(ejs.renderFile).mockResolvedValueOnce('content-a').mockResolvedValueOnce('content-b');
  await expect(compile('*.ejs')).resolves.toMatchObject([
    { content: 'content-a' },
    { content: 'content-b' },
  ]);
});

it('accepts empty JSON data without reading a file', async function () {
  await expect(loadOptionsData('{}')).resolves.toEqual({});
  expect(readFile).not.toHaveBeenCalled();
});
