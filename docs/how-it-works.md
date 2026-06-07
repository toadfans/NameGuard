---
title: How it works
sidebar:
  order: 20
---

# How it works

## The behavior NameGuard prevents

Obsidian's **New link format** setting has three values: **Shortest path when possible**, **Relative
path to file**, and **Absolute path in vault**.

In **shortest** mode, a link like `[[Foobar]]` is stored with just the note name _as long as that name
is unique_. Internally, when Obsidian renders a link target it asks whether the short name still
resolves to exactly one file. If it does, the short form is kept. If it does not, Obsidian falls back
to a longer, disambiguated path.

So the instant a second `Foobar` appears anywhere in the vault, every existing `[[Foobar]]` becomes
ambiguous. To keep those links pointing at the **original** file, Obsidian rewrites them:

```diff
- [[Foobar]]
+ [[notes/Foobar]]
```

This rewrite is driven by Obsidian's link-update engine, which runs after a create or rename:

1. It snapshots where every link currently resolves.
2. It performs the file operation (the new/renamed file appears).
3. It compares the new resolution against the snapshot and rewrites any link whose target would have
   changed, using the disambiguated path.

In **relative** and **absolute** mode this rewrite does not happen, because links are already stored
with a path and adding another same-named note does not change how they resolve. That is why the
problem — and NameGuard — only matters in shortest mode by default.

## What NameGuard does

The cleanest way to prevent the rewrite is to prevent the duplicate from ever existing. NameGuard
wraps the vault methods that all file creation and movement funnel through:

- `Vault.create` and `Vault.createBinary` — used by new notes, "create note from link", templates,
  and most programmatic creation.
- `Vault.rename` — used by moving and renaming, including `FileManager.renameFile`, which calls
  `Vault.rename` internally.
- `Vault.copy` — optional, off by default.

Before delegating to the original method, each wrapper asks a small, pure decision function whether
the operation would introduce a duplicate name. If it would, the wrapper returns a rejected promise
(and shows a notice), so the underlying create/rename never runs and the link-update engine has
nothing to rewrite.

The decision logic lives in `src/uniqueness.ts` and is fully unit-tested in isolation. The wiring that
connects it to Obsidian lives in `src/name-guard.ts`.

## How a collision is detected

To check whether a name already exists, NameGuard reuses Obsidian's own resolver,
`MetadataCache.getFirstLinkpathDest(name, "")`. At the moment a guard runs, the new file is not yet
indexed, so a non-null result always means a **pre-existing** file with that name. When "Markdown
notes only" is turned off, NameGuard additionally scans loaded files by base name to cover non-markdown
types.

## Why pre-existing duplicates are left alone

NameGuard never inspects or "fixes" duplicates that already exist; it only evaluates the **new** name
being introduced by the current operation. If two notes were already named the same before you
installed NameGuard, they keep working exactly as before. This is deliberate: NameGuard is a guard on
new operations, not a vault linter.

## Scope and limitations

- **Vault API only.** Files that appear through external means — a sync client writing to disk, an
  external editor, or the OS file system — are discovered by Obsidian's file watcher rather than
  created through `Vault.create`, so NameGuard cannot intercept them.
- **Name, not full path.** Uniqueness is enforced on the note name (no folder, no extension), which is
  exactly the unit that shortest-format links care about.
