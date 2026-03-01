export const meta = {
  name: 'ejs-cli',
  version: '1.0.0',
  description: 'Modern EJS template compiler with TypeScript support',
};

export const args = {
  file: {
    type: 'string',
    description: 'テンプレートファイルパス（globパターン対応）',
    alias: 'f',
    required: true,
  },
  'base-dir': {
    type: 'string',
    description: '相対パスの基準ディレクトリ',
    alias: 'b',
    default: './',
  },
  out: {
    type: 'string',
    description: '出力先ディレクトリ',
    alias: 'o',
  },
  options: {
    type: 'string',
    description: 'オプション変数（JSONファイルまたはJSON文字列）',
    alias: 'O',
  },
  exclude: {
    type: 'string',
    description: '除外するファイルパターン（カンマ区切り）',
    alias: 'e',
  },
} as const;
