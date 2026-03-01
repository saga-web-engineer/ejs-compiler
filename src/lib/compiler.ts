import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, relative, dirname } from "pathe";
import ejs from "ejs";
import fg from "fast-glob";
import type { CompilerOptions, CompileResult } from "./types.js";

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
	const {
		baseDir = process.cwd(),
		outDir,
		data = {},
		exclude = [],
	} = options;

	// ファイル検索
	const files = await fg(filePattern, {
		cwd: baseDir,
		ignore: exclude,
		absolute: false,
		onlyFiles: true,
	});

	if (files.length === 0) {
		throw new Error(`マッチするファイルが見つかりません: ${filePattern}`);
	}

	// 各ファイルをコンパイル
	const results: CompileResult[] = [];

	for (const file of files) {
		const sourcePath = join(baseDir, file);

		// EJSテンプレートをレンダリング
		const content = await ejs.renderFile(sourcePath, data);

		// 出力先パスを決定
		let outputPath: string | undefined;
		if (outDir) {
			// .ejsの拡張子を削除（存在する場合）
			let outputFile = file.endsWith(".ejs")
				? file.slice(0, -4)
				: file;

			// 拡張子がない場合は.htmlを追加
			const hasExtension = /\.[^/\\]+$/.test(outputFile);
			if (!hasExtension) {
				outputFile += ".html";
			}

			outputPath = join(outDir, outputFile);

			// 出力先ディレクトリを作成
			const outputDirPath = dirname(outputPath);
			await mkdir(outputDirPath, { recursive: true });

			// ファイルを書き込み
			await writeFile(outputPath, content, "utf-8");
		}

		results.push({
			source: sourcePath,
			output: outputPath,
			content,
		});
	}

	return results;
}

/**
 * JSONファイルまたはJSON文字列からデータを読み込む
 * @param input ファイルパスまたはJSON文字列
 * @returns パースされたデータ
 */
export async function loadOptionsData(
	input: string,
): Promise<Record<string, unknown>> {
	// JSON文字列として解釈を試みる
	try {
		return JSON.parse(input);
	} catch {
		// JSON文字列でない場合はファイルパスとして扱う
		const fileContent = await readFile(input, "utf-8");
		return JSON.parse(fileContent);
	}
}
