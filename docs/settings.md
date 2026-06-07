---
title: Settings reference
sidebar:
  order: 30
---

# Settings reference

User-facing settings live under **Settings → NameGuard**. Each is a toggle and takes effect
immediately — no reload required.

| Setting                                  | Default | What it does                                                                                                   |
| ---------------------------------------- | :-----: | -------------------------------------------------------------------------------------------------------------- |
| **Markdown notes only**                  |   On    | Only guard `.md` notes. Turn off to enforce unique names across every file type (attachments, canvases, etc.). |
| **Show release notes after each update** |   On    | Open a window with the latest changelog entries after upgrading the plugin.                                    |

## When to change them

- **Want uniqueness for attachments and other files too?** Turn off _Markdown notes only_.
- **Prefer not to see update summaries?** Turn off _Show release notes after each update_.

## Fixed behavior

NameGuard is active while the community plugin is enabled, checks shortest-link mode, guards creates,
moves, and renames, and shows a notice when it blocks an operation. Disable the plugin under
**Settings → Community plugins** when you need to pause it entirely.

## How blocking is decided

An operation is blocked when the vault is in shortest-link mode, the file-type gate passes, and the
target name already belongs to another note. For moves and renames, the name must actually change.
Moving a note between folders without renaming it is never blocked.
