# ejs-compiler

Simple EJS compiler written in TypeScript, usable as both CLI and library.

## Features

- **CLI Tool**: Batch compile EJS templates from the command line
- **Library API**: Programmatic compilation for build scripts and automation
- **Glob Patterns**: Compile multiple files with powerful pattern matching
- **TypeScript Support**: Full TypeScript type definitions included
- **ESM Only**: Modern ES module design for Node.js 24+

## Installation

```bash
npm install @s.a.g.a/ejs-compiler
```

### Windows PowerShell:

```bash
npm install "@s.a.g.a/ejs-compiler"
```

## Usage

### As a CLI Tool

Compile EJS templates from the command line:

```bash
ejs-compiler -f "**/*.ejs" -b ./templates -o ./dist -O data.json
```

#### CLI Options

- `-f, --file` : Template file path (supports glob patterns) **[required]**
- `-b, --base-dir` : Base directory for relative paths (default: "./")
- `-o, --out` : Output directory (if omitted, outputs to stdout)
- `-O, --options` : Options data (JSON file path or JSON string)
- `-e, --exclude` : File patterns to exclude (comma-separated)
- `-w, --watch` : Watch for file changes and recompile
- `-m, --minify` : Reduce template whitespace using EJS `rmWhitespace` (default: false)

#### Examples

```bash
# Compile all EJS files in templates/ to dist/
ejs-compiler -f "**/*.ejs" -b ./templates -o ./dist

# Compile with data from JSON file
ejs-compiler -f "**/*.ejs" -b ./templates -o ./dist -O ./data.json

# Exclude files starting with underscore (partials) at any depth
ejs-compiler -f "**/*.ejs" -b ./templates -o ./dist -e "_*"

# Compile specific files only
ejs-compiler -f "pages/**/*.ejs" -b ./templates -o ./dist

# Watch for changes and recompile automatically
ejs-compiler -f "**/[!_]*.ejs" -b ./templates -o ./dist -w
# Reduce whitespace in the generated HTML
ejs-compiler -f "**/*.ejs" -b ./templates -o ./dist -m
```

`--minify` removes leading/trailing whitespace on template lines and collapses blank
lines, including in partials. It does not minify inline JavaScript or CSS, remove
HTML comments, or guarantee single-line output. EJS does not parse HTML, so use this
option only when template indentation and blank lines are not significant (for
example, whitespace inside `<pre>` or `<textarea>` can change). Whitespace in data
inserted at render time is not compressed.

### As a Library

Use ejs-compiler programmatically in your Node.js projects:

```javascript
import { compile, loadOptionsData } from 'ejs-compiler';

// Compile templates with options
const results = await compile('**/*.ejs', {
  baseDir: './templates',
  outDir: './dist',
  data: {
    title: 'My Website',
    description: 'Welcome to my site',
  },
  exclude: ['_*.ejs'],
});

// Load data from JSON file
const data = await loadOptionsData('./data.json');

// Compile to memory (without writing files)
const results = await compile('index.ejs', {
  baseDir: './templates',
  data: { title: 'Hello' },
  // no outDir = memory only
});

console.log(results[0].content); // Access compiled HTML
```

#### API

##### `compile(filePattern, options)`

Compiles EJS template files.

**Parameters:**
- `filePattern` (string | string[]): File pattern(s) supporting glob syntax
- `options` (CompilerOptions):
  - `baseDir` (string): Base directory for resolving paths
  - `outDir` (string): Output directory (optional - omit for memory-only compilation)
  - `data` (Record<string, unknown>): Data to pass to templates
  - `exclude` (string[]): File patterns to exclude
  - `minify` (boolean): Enable EJS `rmWhitespace` (default: false)

```javascript
const results = await compile('index.ejs', {
  baseDir: './templates',
  data: { title: 'Hello' },
  minify: true,
});
```

**Returns:** `Promise<CompileResult[]>`
- `source` (string): Source file path
- `output` (string | undefined): Output file path (undefined if no outDir)
- `content` (string): Compiled HTML content

##### `loadOptionsData(input)`

Loads data from JSON file or JSON string.

**Parameters:**
- `input` (string): File path or JSON string

**Returns:** `Promise<Record<string, unknown>>`

## Development

Building from source requires Node.js 24.11+ (24.x) or 26+ for tsdown.
The bundled output targets Node.js 24.

```bash
# Build
npm run build

# Development mode (watch and rebuild; keep running while editing)
npm run dev

# Run all unit tests (no build required)
npm test

# Alias for running all unit tests
npm run test:unit

# Run CLI unit tests
npm run test:cli

# Watch all unit tests
npm run test:watch

# Type-check with TypeScript
npm run typecheck

# Format code
npm run format

# Lint
npm run lint
```

Tests use Vitest in the Node.js environment and live alongside the source files as
`src/**/*.test.ts`. Library unit tests mock file access, file discovery, and EJS
rendering to check compiler behavior and error handling. CLI unit tests mock the
library, logging, and process exit to check argument forwarding, output, and errors.
Tests do not spawn processes or create template files.

`npm run typecheck` checks both source code and test/configuration files. All test
commands run directly against the TypeScript source without a build step.

## Requirements

- Node.js 24 or higher
- ESM-compatible environment

## License

MIT

## Related

- [AGENTS.md](./AGENTS.md) - Guidelines for AI agents working on this project
