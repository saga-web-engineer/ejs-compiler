import { mkdir, readFile, writeFile } from 'node:fs/promises';
import ejs from 'ejs';
import fg from 'fast-glob';
import { dirname, join } from 'pathe';
import type { CompileResult, CompilerOptions } from './types';

/**
 * EJSテンプレートファイルをコンパイルする
 * @param filePattern ファイルパターン（globパターン対応）
 * @param options コンパイルオプション
 * @returns コンパイル結果の配列
 */
export async function compile(
  filePattern: string | string[],
  options: CompilerOptions = {},
): Promise<CompileResult[]> {
  const { baseDir = process.cwd(), outDir, data = {}, exclude = [] } = options;

  const files = await fg(filePattern, {
    cwd: baseDir,
    ignore: exclude,
    absolute: false,
    onlyFiles: true,
  });

  if (files.length === 0) throw new Error(`マッチするファイルが見つかりません: ${filePattern}`);

  return Promise.all(
    files.map(async (file) => {
      const sourcePath = join(baseDir, file);
      const content = await ejs.renderFile(sourcePath, data);

      if (!outDir) {
        return {
          source: sourcePath,
          output: undefined,
          content,
        };
      }

      const output = await writeOutputFile(outDir, file, content);

      return {
        source: sourcePath,
        output,
        content,
      };
    }),
  );
}

/**
 * JSONファイルまたはJSON文字列からデータを読み込む
 * @param input ファイルパスまたはJSON文字列
 * @returns パースされたデータ
 */
export async function loadOptionsData(input: string): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(input);
  } catch {
    const fileContent = await readFile(input, 'utf-8');
    return JSON.parse(fileContent);
  }
}

function getOutputFileName(file: string): string {
  const withoutEjs = file.endsWith('.ejs') ? file.slice(0, -4) : file;
  const hasExtension = /\.[^/\\]+$/.test(withoutEjs);

  return hasExtension ? withoutEjs : `${withoutEjs}.html`;
}

async function writeOutputFile(outDir: string, file: string, content: string): Promise<string> {
  const outputFile = getOutputFileName(file);
  const outputPath = join(outDir, outputFile);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content, 'utf-8');

  return outputPath;
}
