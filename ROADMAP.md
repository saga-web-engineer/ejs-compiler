# ROADMAP

**Future plans and upcoming features** - [日本語版はこちら](#日本語版)

This roadmap outlines the planned features and improvements for ejs-compiler. Items are subject to change based on community feedback and priorities.

## Current Version

**v0.1.0** - Initial release with core functionality
- ✅ CLI tool for batch compilation
- ✅ Library API for programmatic usage
- ✅ Glob pattern support
- ✅ File exclusion patterns
- ✅ JSON data injection
- ✅ TypeScript support

## Planned Features

### v0.2.0 - Developer Experience

**Watch Mode**
- Monitor template files for changes
- Automatically recompile on file changes
- Support for incremental compilation
- CLI flag: `--watch` or `-w`

**Minification**
- Compress compiled HTML output
- Remove unnecessary whitespace
- Single-line HTML output option
- CLI flag: `--minify` or `-m`

### v0.3.0 - Quality & Reliability

**Testing**
- Unit tests for core compilation logic
- Integration tests for CLI functionality
- End-to-end tests for real-world scenarios
- Test coverage reporting

### v1.0.0 - Stable Release

- Performance optimizations
- Comprehensive documentation
- Migration guide from original ejs-cli
- Stable API guarantees

## Future Considerations

These features are under consideration but not yet scheduled:

- Advanced error messages with source maps
- Template validation before compilation
- Plugin system for custom transformations
- Configuration file support (e.g., `ejs-compiler.config.js`)

---

# 日本語版

このロードマップはejs-compilerの今後の機能と改善計画を示しています。コミュニティからのフィードバックや優先度に応じて変更される可能性があります。

## 現在のバージョン

**v0.1.0** - コア機能を備えた初期リリース
- ✅ 一括コンパイル用CLIツール
- ✅ プログラム利用可能なライブラリAPI
- ✅ Globパターンサポート
- ✅ ファイル除外パターン
- ✅ JSONデータ注入
- ✅ TypeScriptサポート

## 実装予定の機能

### v0.2.0 - 開発者体験の向上

**ウォッチモード**
- テンプレートファイルの変更を監視
- ファイル変更時に自動再コンパイル
- インクリメンタルコンパイル対応
- CLIフラグ: `--watch` または `-w`

**ミニファイ（HTML圧縮）**
- コンパイル済みHTMLの圧縮
- 不要な空白文字の削除
- 1行HTMLの出力オプション
- CLIフラグ: `--minify` または `-m`

### v0.3.0 - 品質と信頼性

**テストコード**
- コアコンパイルロジックのユニットテスト
- CLI機能の統合テスト
- 実際のユースケースのE2Eテスト
- テストカバレッジレポート

### v1.0.0 - 安定版リリース

- パフォーマンス最適化
- 包括的なドキュメント
- 元のejs-cliからの移行ガイド
- 安定したAPIの保証

## 将来的な検討事項

以下の機能は検討中ですが、まだスケジュールされていません：

- ソースマップ付きの高度なエラーメッセージ
- コンパイル前のテンプレート検証
- カスタム変換用のプラグインシステム
- 設定ファイルサポート（例: `ejs-compiler.config.js`）
