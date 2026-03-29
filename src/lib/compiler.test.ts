import { mkdir, readFile, writeFile } from 'node:fs/promises';
import ejs from 'ejs';
import fg from 'fast-glob';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compile, loadOptionsData } from './compiler';

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('ejs', () => ({
  default: { renderFile: vi.fn() },
}));

vi.mock('fast-glob', () => ({
  default: vi.fn(),
}));

describe('compile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws when no files match the pattern', async () => {
    vi.mocked(fg).mockResolvedValue([]);
    await expect(compile('**/*.ejs')).rejects.toThrow('No matching files found: **/*.ejs');
  });

  it('returns compiled content without outDir', async () => {
    vi.mocked(fg).mockResolvedValue(['index.ejs']);
    vi.mocked(ejs.renderFile).mockResolvedValue('<h1>Hello</h1>');

    const results = await compile('**/*.ejs', { baseDir: '/base' });

    expect(results).toMatchObject([{ content: '<h1>Hello</h1>', output: undefined }]);
  });

  it('includes the source file path in the result', async () => {
    vi.mocked(fg).mockResolvedValue(['pages/index.ejs']);
    vi.mocked(ejs.renderFile).mockResolvedValue('');

    const results = await compile('**/*.ejs', { baseDir: '/base' });

    expect(results).toMatchObject([{ source: expect.stringContaining('index.ejs') }]);
  });

  it('writes the output file and returns its path when outDir is specified', async () => {
    vi.mocked(fg).mockResolvedValue(['index.ejs']);
    vi.mocked(ejs.renderFile).mockResolvedValue('<h1>Hello</h1>');
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const results = await compile('**/*.ejs', { baseDir: '/base', outDir: '/out' });

    expect(mkdir).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('index.html'),
      '<h1>Hello</h1>',
      'utf-8',
    );
    expect(results).toMatchObject([{ output: expect.any(String) }]);
  });

  it('passes data to ejs.renderFile', async () => {
    vi.mocked(fg).mockResolvedValue(['index.ejs']);
    vi.mocked(ejs.renderFile).mockResolvedValue('');

    await compile('**/*.ejs', { baseDir: '/base', data: { title: 'My Page' } });

    expect(ejs.renderFile).toHaveBeenCalledWith(expect.any(String), { title: 'My Page' });
  });

  it('passes exclude patterns to fast-glob', async () => {
    vi.mocked(fg).mockResolvedValue(['index.ejs']);
    vi.mocked(ejs.renderFile).mockResolvedValue('');

    await compile('**/*.ejs', { baseDir: '/base', exclude: ['_*.ejs'] });

    expect(fg).toHaveBeenCalledWith('**/*.ejs', expect.objectContaining({ ignore: ['_*.ejs'] }));
  });

  it('accepts an array of file patterns', async () => {
    vi.mocked(fg).mockResolvedValue(['a.ejs']);
    vi.mocked(ejs.renderFile).mockResolvedValue('');

    await compile(['pages/*.ejs', 'layouts/*.ejs'], { baseDir: '/base' });

    expect(fg).toHaveBeenCalledWith(['pages/*.ejs', 'layouts/*.ejs'], expect.any(Object));
  });

  it('compiles multiple files', async () => {
    vi.mocked(fg).mockResolvedValue(['a.ejs', 'b.ejs']);
    vi.mocked(ejs.renderFile).mockResolvedValueOnce('content-a').mockResolvedValueOnce('content-b');

    const results = await compile('**/*.ejs', { baseDir: '/base' });

    expect(results).toMatchObject([{ content: 'content-a' }, { content: 'content-b' }]);
  });

  describe('output file naming', () => {
    beforeEach(() => {
      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(writeFile).mockResolvedValue(undefined);
    });

    it('renames .ejs to .html when there is no other extension', async () => {
      vi.mocked(fg).mockResolvedValue(['index.ejs']);
      vi.mocked(ejs.renderFile).mockResolvedValue('');

      await compile('**/*.ejs', { baseDir: '/base', outDir: '/out' });

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('index.html'),
        expect.any(String),
        'utf-8',
      );
    });

    it('preserves the existing extension when the file has one before .ejs', async () => {
      vi.mocked(fg).mockResolvedValue(['style.css.ejs']);
      vi.mocked(ejs.renderFile).mockResolvedValue('');

      await compile('**/*.ejs', { baseDir: '/base', outDir: '/out' });

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('style.css'),
        expect.any(String),
        'utf-8',
      );
    });
  });
});

describe('loadOptionsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses a JSON string directly', async () => {
    const result = await loadOptionsData('{"key": "value", "num": 42}');
    expect(result).toEqual({ key: 'value', num: 42 });
  });

  it('accepts an empty JSON object string', async () => {
    const result = await loadOptionsData('{}');
    expect(result).toEqual({});
  });

  it('reads and parses a JSON file when the input is not valid JSON', async () => {
    vi.mocked(readFile).mockResolvedValue('{"from": "file"}');

    const result = await loadOptionsData('/path/to/data.json');

    expect(readFile).toHaveBeenCalledWith('/path/to/data.json', 'utf-8');
    expect(result).toEqual({ from: 'file' });
  });

  it('throws when the file cannot be read', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT: no such file'));

    await expect(loadOptionsData('/nonexistent.json')).rejects.toThrow('ENOENT');
  });
});
