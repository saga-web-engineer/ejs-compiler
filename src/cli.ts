#!/usr/bin/env node

import { defineCommand, runMain } from "citty";
import { consola } from "consola";
import { compile, loadOptionsData } from "./compiler";

const main = defineCommand({
	meta: {
		name: "ejs-cli",
		version: "1.0.0",
		description: "Modern EJS template compiler with TypeScript support",
	},
	args: {
		file: {
			type: "string",
			description: "テンプレートファイルパス（globパターン対応）",
			alias: "f",
			required: true,
		},
		"base-dir": {
			type: "string",
			description: "相対パスの基準ディレクトリ",
			alias: "b",
			default: "./",
		},
		out: {
			type: "string",
			description: "出力先ディレクトリ",
			alias: "o",
		},
		options: {
			type: "string",
			description: "オプション変数（JSONファイルまたはJSON文字列）",
			alias: "O",
		},
		exclude: {
			type: "string",
			description: "除外するファイルパターン（カンマ区切り）",
			alias: "e",
		},
	},
	async run({ args }) {
		try {
			// オプションデータの読み込み
			let data: Record<string, unknown> = {};
			if (args.options) {
				consola.info("オプションデータを読み込んでいます...");
				data = await loadOptionsData(args.options);
			}

			// 除外パターンの解析
			const exclude = args.exclude
				? args.exclude.split(",").map((s) => s.trim())
				: [];

			// コンパイル実行
			consola.start(`テンプレートをコンパイルしています: ${args.file}`);

			const results = await compile(args.file, {
				baseDir: args["base-dir"],
				outDir: args.out,
				data,
				exclude,
			});

			// 結果の表示
			if (args.out) {
				// ファイル出力モード
				consola.success(`${results.length}個のファイルをコンパイルしました`);
				for (const result of results) {
					consola.log(`  ${result.source} → ${result.output}`);
				}
			} else {
				// 標準出力モード
				for (const result of results) {
					console.log(result.content);
				}
			}
		} catch (error) {
			consola.error("コンパイルエラー:");
			consola.error(error);
			process.exit(1);
		}
	},
});

runMain(main);
