export interface CompilerOptions {
  /** 相対パス解決の基準ディレクトリ */
  baseDir?: string
  /** 出力先ディレクトリ */
  outDir?: string
  /** テンプレートに渡すデータ/変数 */
  data?: Record<string, unknown>
  /** 除外するファイルパターン */
  exclude?: string[]
}

export interface CompileResult {
  /** ソースファイルパス */
  source: string
  /** 出力ファイルパス（outDir指定時） */
  output?: string
  /** コンパイル済みコンテンツ */
  content: string
}
