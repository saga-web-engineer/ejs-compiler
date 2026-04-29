# AGENTS.md

**Guidelines for AI agents working on this repository** - [日本語版はこちら](#日本語版)

This file provides guidelines for AI agents like Claude Code when working on this repository.

## Project Overview

**ejs-compiler** is a modern EJS template compilation tool with a dual-package design that works both as a CLI tool and as a library.

- **CLI**: Batch compile template files with the `ejs-compiler` command
- **Library**: Programmatic usage via `import { compile } from 'ejs-compiler'`
- **Tech Stack**: TypeScript, unbuild, ESM only (Node.js 24+)

## Directory Structure

```
src/
├── cli/    # CLI-specific code
└── lib/    # Core library (reusable)
```

**Dependency**: CLI → LIB (one-way only)

## CLI Options

- `-f, --file` : Template file path (supports glob patterns) **[required]**
- `-b, --base-dir` : Base directory for relative paths (default: "./")
- `-o, --out` : Output directory (if omitted, outputs to stdout)
- `-O, --options` : Options data (JSON file path or JSON string)
- `-e, --exclude` : File patterns to exclude (comma-separated)
- `-w, --watch` : Watch for file changes and recompile

## Development Commands

```bash
# Build
npm run build

# Development mode (stub mode)
npm run dev

# Code quality
npm run format        # Apply Biome formatting

# Testing
npm test              # Run unit tests
```

## Coding Standards

### Variables & Control Flow
- Avoid `let` - Use `const` and prefer immutable operations
- Avoid destructive methods - Use `map`, `filter`, spread operators instead of `push`, `splice`
- Minimize nested ifs - Use early returns and guard clauses
- Ternary operators - Single level only (no nesting)

### Functions & Module Structure
- **Use function declarations** - Declare functions with the `function` keyword, not arrow functions
  - Benefit 1: Function names appear in stack traces for easier debugging
  - Benefit 2: Hoisting provides flexibility in definition order within files
  - Benefit 3: Clear function independence improves readability
- Place exported public functions at the top (top-down approach)
- Place non-exported private functions at the bottom
- Arrange helper functions to make dependencies clear

### Comments
- **Code comments in English** - For OSS publication
- JSDoc comments must be in English
- Error messages in English

### Type Safety
- **Avoid type assertions** - Don't force type conversions like `as string` to pass tests
  - `as const` is acceptable (needed for literal type inference)
  - If type errors occur, fix the implementation rather than using assertions
- **Leverage library types** - Import types from libraries instead of defining your own
  - Examples: `CommandContext` from citty, type definitions from ejs
  - Using library-provided types ensures compatibility with API changes

### Commit Messages
- Follow Conventional Commits format (in English)
- Prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`
- Example: `refactor: improve error handling in compiler`

## Workflow

### When Changing Code
1. Implement changes
2. Run `npm run format`
3. Run `npm test`
4. Commit

### When Committing
- **Always format before committing**
- Clearly describe changes
- No emojis (unless explicitly requested by user)

## Core Design Principles

### ESM Only
- No CommonJS support
- Use `import`/`export` syntax only
- Never use `require()`

### Separation of Concerns
- CLI layer handles user interface only
- Library layer handles business logic
- Maintain one-way dependency relationship

---

# 日本語版

このファイルはClaude CodeなどのAIエージェントがこのリポジトリで作業する際のガイドラインです。

## プロジェクト概要

**ejs-compiler**はEJSテンプレートをコンパイルするモダンなツールです。CLIツールとしても、ライブラリとしても使用できるデュアルパッケージ設計です。

- **CLI**: `ejs-compiler` コマンドでテンプレートファイルを一括コンパイル
- **ライブラリ**: `import { compile } from 'ejs-compiler'` でプログラムから利用可能
- **技術スタック**: TypeScript, unbuild, ESM only (Node.js 24+)

## ディレクトリ構造

```
src/
├── cli/    # CLI固有のコード
└── lib/    # コアライブラリ（再利用可能）
```

**依存関係**: CLI → LIB（一方向のみ）

## コマンドラインオプション

- `-f, --file` : テンプレートファイルパス指定（globパターン対応）**[必須]**
- `-b, --base-dir` : 相対パスの基準ディレクトリ（デフォルト: "./"）
- `-o, --out` : 出力先ディレクトリ指定（省略時は標準出力）
- `-O, --options` : オプション変数（JSONファイルまたはJSON文字列）
- `-e, --exclude` : 除外対象ファイル/ディレクトリ（カンマ区切り）
- `-w, --watch` : ファイル変更を監視して自動再コンパイル

## 開発コマンド

```bash
# ビルド
npm run build

# 開発モード（stub mode）
npm run dev

# コード品質
npm run format        # Biomeフォーマット適用

# テスト
npm test              # ユニットテスト実行
```

## コーディング規約

### 変数・制御構文
- `let`を極力使わない - `const`で宣言し、イミュータブルな処理を心がける
- 破壊的メソッドを避ける - `push`, `splice`等の代わりに`map`, `filter`, spread演算子を使用
- ifのネストを極力控える - 早期リターン、ガード節を活用
- 三項演算子は1段のみ（ネストさせない）

### 関数・モジュール構成
- **function宣言を使用** - アロー関数ではなく`function`キーワードで関数を宣言する
  - メリット1: 関数名がスタックトレースに表示され、デバッグが容易
  - メリット2: 巻き上げ（hoisting）により、ファイル内での定義順序の自由度が高い
  - メリット3: 関数の独立性が明確になり、可読性が向上
- exportされる公開関数を上部に配置（トップダウン方式）
- exportされないプライベート関数は下部に配置
- ヘルパー関数は依存関係が明確になるよう配置

### コメント
- **コードのコメントは英語** - OSSとして公開するため
- JSDocコメントは必ず英語で記述
- エラーメッセージも英語

### 型安全性
- **型アサーションを避ける** - テストを通すために`as string`などで無理やり型を変えない
  - `as const`は許容される（リテラル型の推論に必要）
  - 型エラーが出た場合は、型アサーションではなく実装を修正する
- **ライブラリの型を活用** - 型を自前で定義せず、ライブラリから正しくインポートする
  - 例: cittyの`CommandContext`型、ejsの型定義など
  - ライブラリが提供する型を使うことで、APIの変更に追従できる

### コミットメッセージ
- Conventional Commits形式（英語）
- プレフィックス: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`
- 例: `refactor: improve error handling in compiler`

## ワークフロー

### コード変更時
1. 変更を実装
2. `npm run format` でフォーマット
3. `npm test` でテスト
4. コミット

### コミット時
- **必ずフォーマット実行後にコミット**
- 変更内容を明確に説明する
- 絵文字は使用しない（ユーザーが明示的に要求した場合を除く）

## 重要な設計原則

### ESM Only
- CommonJS非対応
- `import`/`export`構文のみ使用
- `require()`は使用しない

### 責務の分離
- CLI層はユーザーインターフェースのみ担当
- ライブラリ層はビジネスロジックを担当
- 一方向の依存関係を維持
