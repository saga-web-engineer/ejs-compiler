# Examples

This directory contains usage examples for ejs-compiler.

## Directory Structure

```
examples/
├── compile-to-file.js     # Compile and write to files
├── compile-to-memory.js   # Compile in memory only
├── data.json              # Sample data for templates
├── templates/             # Sample EJS templates
│   ├── components/        # Reusable components
│   └── pages/             # Page templates
└── dist/                  # Compiled output (generated)
```

## Running Examples

### Compile to File

Compiles templates and writes HTML files to disk:

```bash
npm run example:file
```

This example shows:
- Importing and using the `compile` function
- Loading data from JSON files with `loadOptionsData`
- Specifying `outDir` to write compiled files to disk
- Compiling templates with glob patterns
- Excluding specific files

**Use case**: Static site generation, build tools

See `compile-to-file.js` for the complete code.

### Compile to Memory

Compiles templates in memory without writing files to disk:

```bash
npm run example:memory
```

This example shows:
- Compiling without specifying `outDir`
- Accessing the compiled content directly from `result.content`
- No files are created on disk

**Use case**: Server-side rendering, dynamic content generation, API responses

See `compile-to-memory.js` for the complete code.

### As a CLI Tool

Demonstrates command-line usage:

```bash
npm run example:cli
```

This runs the CLI with various options including base directory, file patterns, output directory, data file, and exclusions.

## Sample Templates

The templates demonstrate:
- **Partials**: `_head.ejs`, `_heading.ejs` (prefixed with `_`)
- **Pages**: `index.ejs`, `about.ejs`
- **Data injection**: Using variables from `data.json`

Partial files (starting with `_`) are excluded from compilation by the glob pattern `**/[!_]*.ejs`.
