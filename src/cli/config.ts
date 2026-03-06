export const meta = {
  name: 'ejs-cli',
  version: '1.0.0',
  description: 'Modern EJS template compiler with TypeScript support',
};

export const args = {
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
