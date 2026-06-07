---
title: Getting started
sidebar:
  order: 10
---

# Getting started

NameGuard keeps note names unique across your whole vault. When you create, move, or rename a note in
a way that would collide with a name that already exists somewhere else, NameGuard stops the operation
before it happens.

This matters most when **New link format** is set to **Shortest path when possible**, because that is
when Obsidian silently rewrites your existing `[[wikilinks]]` to keep them unambiguous. See
[How it works](how-it-works.md) for the details.

## Install

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release.
2. Copy them into `<your-vault>/.obsidian/plugins/name-guard/`.
3. Reload Obsidian.
4. Open **Settings → Community plugins** and enable **NameGuard**.

To build from source instead:

```bash
bun install
bun run build
```

## The mental model

Think of a note's name (its file name without the folder and extension) as a unique key. With
NameGuard enabled and your vault in shortest-link mode:

- Creating `projects/Foobar.md` when `notes/Foobar.md` already exists → **blocked**.
- Renaming or moving any note **into** the name `Foobar` while `Foobar` exists → **blocked**.
- Creating `notes/Foobar.md` when no other `Foobar` exists → **allowed**.
- Moving `notes/Foobar.md` to `archive/Foobar.md` (same name) → **allowed**, because no new name is
  introduced.

Two notes that were already named the same before you installed NameGuard are left alone. NameGuard
only guards **new** collisions.

## First run

NameGuard works immediately with its defaults — there is nothing to configure. When it blocks an
operation, you'll see a short notice telling you which existing note caused the conflict. Rename your
new note to something unique, or adjust the guards in **Settings → NameGuard**.

## Quick try-out

1. Confirm **Settings → Files and links → New link format** is **Shortest path when possible**.
2. Create a note called `Foobar` in any folder.
3. Try to create another note called `Foobar` in a different folder.

The second creation is blocked, and the first note's links stay exactly as you wrote them.
