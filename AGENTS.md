# Repository Guidelines

## Project Structure & Module Organization

`configer` automates and validates DD game design configuration tables. The MVP centers on equipment (`equip`) while keeping boundaries clear for future domains such as `item`, `role`, skills, drops, and activities.

- `docs/README.md` is the document entry point; follow it before writing product, architecture, or module docs.
- `docs/equip/doc/` contains equip analysis, schema notes, ER diagrams, workflow, implementation guidance, and the UI demo.
- `docs/equip/doc/demo/装备配置工具.html` is an interaction and visual reference only; do not copy its mock logic as production rules.
- `source/table/default_ios/` stores real Excel tables grouped by domain: `equip/`, `item/`, and `language/`.
- Add future code by module, for example `src/modules/equip/`, `src/modules/item/`, with shared logic under `src/core/` or `src/shared/`.

## Build, Test, and Development Commands

No package manager or build scaffold is committed yet. Document any new command in `README.md` and keep it runnable from the repository root.

- `rg --files` lists project files quickly.
- `python -m http.server 8000` can serve static demos or future browser tooling when needed.
- `git status` checks local changes before editing docs or table assets.

When adding the web tool, prefer explicit scripts such as `npm run dev`, `npm run build`, and `npm test`.

## Coding Style & Naming Conventions

Keep modules isolated by business domain. Changes to `equip` should not require edits to `item` or future modules. Use stable logical field keys in code and schemas; keep original Excel column names as source metadata.

Prefer ASCII for code and config files. Preserve Chinese text in docs, UI labels, and Excel-facing terminology. Use names like `equipSchema`, `itemRepository`, or `languageMap`.

Follow `docs/30_development/documentation_standard.md` for new documentation and `docs/20_architecture/project_directory_design.md` for future source layout.

## Testing Guidelines

Add tests alongside implementation. For JavaScript, use `*.test.js` or `*.spec.ts`; for Python, use `test_*.py`. Prioritize Excel parsing, ID encoding, foreign-key validation, changelog generation, and write-back safety.

For Excel write-back, verify that formulas, comments, formatting, and non-target sheets are preserved. Only write manual fields and create backups.

## Commit & Pull Request Guidelines

Git history currently has only `first commit`, so no strict convention exists. Use concise imperative messages, such as `Add equip schema loader`.

Pull requests should include purpose, affected modules, validation performed, and screenshots for UI changes. For table-processing changes, mention tested files under `source/table/default_ios/` and any backups or changelogs.

## Security & Configuration Tips

Treat Excel files in `source/` as source data. Do not overwrite them casually, commit temporary exports, or introduce external API calls without explicit approval. The MVP is a local web tool using browser-side file access and SheetJS-style Excel handling.
