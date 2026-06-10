<div align="center">

# 🛡️ NameGuard

### Keep every note name unique — and stop Obsidian from silently rewriting your links.

[![Main](https://github.com/toadfans/NameGuard/actions/workflows/main.yml/badge.svg)](https://github.com/toadfans/NameGuard/actions/workflows/main.yml) [![Obsidian plugin](./assets/plugin.svg)](https://community.obsidian.md/plugins/name-guard) [![Obsidian minimal version](./assets/min-version.svg)](https://community.obsidian.md/plugins/name-guard) ![License](./assets/license.svg)

</div>

---

## The problem

With **Settings → Files and links → New link format** set to **Shortest path when possible**,
Obsidian keeps your `[[wikilinks]]` short _only while a note name is unique_. The moment a second note
with the same name appears **anywhere** in the vault, Obsidian rewrites your existing links to keep
them pointing at the original file:

```diff
- [[Foobar]]
+ [[notes/Foobar]]
```

You never touched those notes — yet your links changed, your git diff is noisy, and a careless undo
can leave links resolving to the wrong file.

## The fix

**NameGuard** treats a note name as a vault-wide unique key. When an operation would introduce a
duplicate name, NameGuard blocks it **before the file is created** — so the rewrite never happens.

> 🔑 Pre-existing duplicates are left untouched. NameGuard only guards **new** collisions.

|     | Feature                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------ |
| 🚫  | **Blocks duplicate creation** — new notes, "create from link", and templates all run through one guard |
| 🔀  | **Guards moves & renames** — renaming a note into a name that's already taken is blocked too           |
| 🎯  | **Shortest-mode aware** — only acts when it actually matters (configurable)                            |
| 📝  | **Markdown-first** — guards `.md` by default; opt in to every file type                                |
| 🧩  | **Zero config** — sensible defaults, with a settings tab when you want control                         |
| 🔒  | **100% local** — no network, no telemetry                                                              |

## How it works (in one breath)

Obsidian's `MetadataCache.fileToLinktext` falls back to a full path once a name stops being unique,
and `FileManager` rewrites the affected links right after a create/rename. NameGuard wraps the vault's
`create` / `createBinary` / `rename` and rejects the operation when the new name already resolves to
an existing note — so the trigger never fires.

📖 Full write-up in **[docs/how-it-works.md](docs/how-it-works.md)**.

## Install

**Manually**

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release.
2. Copy them into `<your-vault>/.obsidian/plugins/name-guard/`.
3. Reload Obsidian, then enable **NameGuard** under **Settings → Community plugins**.

**From source**

```bash
bun install
bun run build      # bundles main.js
```

## Settings

NameGuard works with its defaults. **Settings → NameGuard** exposes only file-type scope and release
note preferences; see the **[settings reference](docs/settings.md)** for details.

## Documentation

- 📘 [Getting started](docs/getting-started.md)
- 🔬 [How it works](docs/how-it-works.md)
- ⚙️ [Settings reference](docs/settings.md)
- ❓ [FAQ](docs/faq.md)
