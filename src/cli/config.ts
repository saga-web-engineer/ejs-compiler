export const meta = {
  name: 'ejs-compiler',
  version: '0.1.0',
  description: 'Simple EJS compiler written in TypeScript, usable as both CLI and library',
};

export const cliOptions = {
  file: {
    type: 'string',
    description: 'Template file path (supports glob patterns)',
    alias: 'f',
    required: true,
  },
  'base-dir': {
    type: 'string',
    description: 'Base directory for relative paths',
    alias: 'b',
    default: './',
  },
  out: {
    type: 'string',
    description: 'Output directory',
    alias: 'o',
  },
  options: {
    type: 'string',
    description: 'Options data (JSON file path or JSON string)',
    alias: 'O',
  },
  exclude: {
    type: 'string',
    description: 'File patterns to exclude (comma-separated)',
    alias: 'e',
  },
} as const;
