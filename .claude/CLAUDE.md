# ejs-cli プロジェクト

## プロジェクト概要

**目的**: https://github.com/fnobi/ejs-cli をTypeScriptで書き直し、機能追加を行う

**元のプロジェクト**: fnobi/ejs-cli
- JavaScriptで書かれたEJSテンプレートコンパイラ
- CLIツールとして動作
- TypeScript非対応、メンテナンスが古い

**新プロジェクト名**: ejs-cli（同じ名前だが別実装）

---

## 技術スタック

### ビルドツール
- **unbuild** - UnJSエコシステムのビルドツール
- **TypeScript** - 型安全な開発

### ランタイム依存
- **citty** - モダンなCLIフレームワーク（UnJS）
- **consola** - ログ出力（UnJS）
- **ejs** - テンプレートエンジン本体
- **fast-glob** - 高速なファイル検索
- **pathe** - クロスプラットフォームパスユーティリティ（UnJS）

### 出力形式
- **ESM only** - CommonJS対応なし
- Node.js 18以上をターゲット

---

## 元のejs-cliの機能（再実装対象）

### コマンドラインオプション
- `-f, --file` : テンプレートファイルパス指定
- `-b, --base-dir` : 相対パスの基準ディレクトリ（デフォルト: "./"）
- `-o, --out` : 出力先ディレクトリ指定
- `-O, --options` : オプション変数（JSONファイルまたはJSON文字列）
- `-e, --exclude` : 除外対象ファイル/ディレクトリ

### 主要機能
1. EJSテンプレートのコンパイル（ejs.renderFile）
2. Globパターンマッチング（複数ファイル処理）
3. 除外パターン（--exclude）
4. オプション変数の読み込み（JSON/JSONファイル）
5. ディレクトリ出力 or stdout出力
6. カラー出力（進捗表示）

### 元の実装で使われていたライブラリ
- yargs → **citty**に置き換え
- chalk → **consola**に置き換え
- glob → **fast-glob**に置き換え
- mkdirp → **fs.promises.mkdir(recursive: true)**に置き換え（Node.js標準）
- async → **ネイティブasync/await**に置き換え

---

## 設計方針

### モダンなベストプラクティス
1. **TypeScript完全対応** - 型安全な実装
2. **ESM only** - モダンなモジュールシステム
3. **UnJSエコシステム** - 統一感のあるツールセット
4. **シンプルな実装** - 不要な抽象化を避ける
5. **ネイティブAPI優先** - 外部依存を最小限に

### ディレクトリ構造
```
ejs-compiler/
├── .claude/              # プロジェクトコンテキスト
├── src/
│   ├── types.ts         # 型定義
│   ├── compiler.ts      # コア機能（EJSコンパイル）
│   ├── cli.ts           # CLIエントリポイント
│   └── index.ts         # ライブラリエクスポート
├── dist/                # ビルド出力（gitignore）
├── package.json
├── tsconfig.json
└── build.config.ts
```

### コードの責務分離
- **types.ts**: 型定義のみ
- **compiler.ts**: ビジネスロジック（ファイル処理、EJSコンパイル）
- **cli.ts**: CLI固有の処理（引数解析、出力）
- **index.ts**: ライブラリAPIとしてのエクスポート

---

## 将来の機能追加（予定）

- [ ] watch モード（ファイル変更を監視して自動再コンパイル）
- [ ] より詳細なエラーメッセージ
- [ ] テンプレートのバリデーション
- [ ] プラグインシステム
- [ ] 設定ファイル対応（ejs-cli.config.ts）

---

## 依存関係の最適化（開発完了後に検討）

現在の依存関係を見直し、ネイティブAPIで代替することで、`ejs` のみに削減できる可能性があります。

### 削減可能な依存関係

1. **citty (^0.2.1)** - CLIフレームワーク
   - **代替**: `process.argv` を直接パース
   - **理由**: 単一コマンドで、オプションも少ない。複雑なサブコマンドがない

2. **consola (^3.4.2)** - ログ出力
   - **代替**: `console.log`/`console.error` + 簡易ANSIエスケープシーケンス
   - **理由**: 高度なログ機能は不要。カラー出力は数行で実装可能

3. **fast-glob (^3.3.3)** - ファイル検索
   - **代替**: Node.js 18以降のネイティブ `glob` 関数
   - **実装**: `import { glob } from 'node:fs'` または `import { globSync } from 'node:fs'`
   - **理由**: package.jsonでNode 24.13.0をターゲットにしているので問題なし

4. **pathe (^2.0.3)** - パスユーティリティ
   - **代替**: `node:path` (Windows対応が必要なら `path.posix`)
   - **理由**: patheの特別な機能は不要

### 最終的な推奨構成

```json
"dependencies": {
  "ejs": "^4.0.1"
}
```

### メリット
- 依存関係の大幅な削減（5→1）
- インストールサイズの削減
- セキュリティリスクの低減
- メンテナンス負担の軽減

### 検討事項
- 現在の実装が完了し、安定稼働してから着手
- ネイティブAPI実装による機能損失がないか確認
- Node.jsバージョンのサポート範囲を再確認

---

## 実装済み機能

### 元のejs-cliとの機能比較

| 機能 | 元のejs-cli | 新実装 | 動作確認 |
|------|------------|--------|---------|
| `-f, --file` | ✓ | ✓ | ✅ |
| `-b, --base-dir` | ✓ | ✓ | ✅ |
| `-o, --out` | ✓ | ✓ | ✅ |
| `-O, --options` | ✓ | ✓ | ✅ |
| `-e, --exclude` | ✓ | ✓ | ✅ |
| `-h, --help` | ✓ | ✓ (citty自動) | ✅ |
| Globパターン | ✓ | ✓ | ✅ |
| stdout出力 | ✓ | ✓ | ✅ |
| ディレクトリ出力 | ✓ | ✓ | ✅ |
| カラー出力 | ✓ | ✓ (consola) | ✅ |
| EJSインクルード | ✓ | ✓ | ✅ |

### 実装詳細

**src/types.ts** - 型定義
- `CompilerOptions`: コンパイルオプションの型
- `CompileResult`: コンパイル結果の型
- 全てのコメントは日本語

**src/compiler.ts** - コア機能
- `compile()`: EJSテンプレートのコンパイル処理
  - fast-globによるファイル検索
  - 除外パターン対応
  - `.ejs` → `.html` 拡張子変換
  - ディレクトリ自動作成
- `loadOptionsData()`: JSONファイル/JSON文字列からデータ読み込み

**src/cli.ts** - CLIエントリポイント
- cittyによるCLI引数解析
- consolaによるカラーログ出力
- 全てのコマンドラインオプション対応
- エラーハンドリング

**src/index.ts** - ライブラリエクスポート
- TypeScript型定義付きでエクスポート
- ライブラリとしても使用可能

### テスト済みユースケース

```bash
# 基本的な使用例
ejs-cli -b test/templates/pages/ -f "*.ejs" -o dist/ -O test/data.json

# Globパターン（_で始まるファイルを除外）
ejs-cli -b test/templates/ -f "**/[!_]*.ejs" -o dist/ -O test/data.json

# 除外オプション
ejs-cli -b test/templates/pages/ -f "*.ejs" -o dist/ -O test/data.json -e "about.ejs"

# 標準出力
ejs-cli -b test/templates/pages/ -f "index.ejs" -O test/data.json
```

### 改善点（元のejs-cliから）

- ✨ TypeScript完全対応（型安全）
- ✨ モダンなツールチェーン（UnJSエコシステム）
- ✨ ESMネイティブ（CommonJS非対応）
- ✨ より良いエラーメッセージ（consola）
- ✨ 高速なファイル検索（fast-glob）

---

## 開発ステータス

### 完了
- [x] プロジェクトセットアップ（package.json）
- [x] 依存関係インストール
- [x] TypeScript設定
- [x] unbuild設定
- [x] ディレクトリ構造作成
- [x] 型定義実装（types.ts）
- [x] コア機能実装（compiler.ts）
- [x] CLIエントリポイント実装（cli.ts）
- [x] ライブラリエクスポート実装（index.ts）
- [x] 基本的な動作確認
- [x] 全機能の動作テスト
  - [x] Globパターンマッチング
  - [x] 除外パターン（--exclude）
  - [x] JSONオプション読み込み
  - [x] EJSインクルード機能
  - [x] 標準出力モード
  - [x] ファイル出力モード
- [x] npm linkによる実環境テスト

### 未着手
- [ ] 正式なテストスイート
- [ ] README作成
- [ ] 使用例ドキュメント
- [ ] 公開準備

---

## 参考リンク

- 元のプロジェクト: https://github.com/fnobi/ejs-cli
- UnJS公式: https://unjs.io/
- unbuild: https://github.com/unjs/unbuild
- citty: https://github.com/unjs/citty
- consola: https://github.com/unjs/consola
