export interface CompilerOptions {
  /** Base directory for resolving relative paths */
  baseDir?: string;
  /** Output directory */
  outDir?: string;
  /** Data/variables to pass to templates */
  data?: Record<string, unknown>;
  /** File patterns to exclude */
  exclude?: string[];
}

export interface CompileResult {
  /** Source file path */
  source: string;
  /** Output file path (when outDir is specified) */
  output?: string;
  /** Compiled content */
  content: string;
}
