# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-04-29

### Fixed

- Fix installation command in README to use scoped package name (`@s.a.g.a/ejs-compiler`)
- Add `publishConfig` to set public access by default

## [0.1.0] - 2026-04-29

### Added

- CLI tool for batch EJS template compilation (`ejs-compiler` command)
- Library API for programmatic usage (`import { compile } from 'ejs-compiler'`)
- Glob pattern support for specifying template files (`-f, --file`)
- Base directory option for relative path resolution (`-b, --base-dir`)
- Output directory option (`-o, --out`); defaults to stdout when omitted
- JSON data injection via file path or inline JSON string (`-O, --options`)
- File exclusion patterns (`-e, --exclude`)
- TypeScript type declarations included
- ESM-only package (Node.js 18+)
