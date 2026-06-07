---
title: Settings reference
sidebar:
  order: 30
---

# Settings reference

All settings live under **Settings → NameGuard**. Each is a toggle and takes effect immediately — no
reload required.

| Setting                                  | Default | What it does                                                                                                                                |
| ---------------------------------------- | :-----: | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Enable NameGuard**                     |   On    | Master switch. When off, every file operation is allowed through and no guards run.                                                         |
| **Only in shortest link mode**           |   On    | Only enforce uniqueness while the vault's **New link format** is **Shortest path when possible**. Turn off to enforce in every link format. |
| **Guard move and rename**                |   On    | Also block moving or renaming a note **into** a name that already exists elsewhere. A pure move that keeps the same name is always allowed. |
| **Guard copy**                           |   Off   | Also block copying a note into a name that already exists elsewhere.                                                                        |
| **Markdown notes only**                  |   On    | Only guard `.md` notes. Turn off to enforce unique names across every file type (attachments, canvases, etc.).                              |
| **Show a notice when blocking**          |   On    | Show a short notification whenever an operation is blocked, naming the conflicting note. Turn off for silent blocking.                      |
| **Show release notes after each update** |   On    | Open a window with the latest changelog entries after upgrading the plugin.                                                                 |

## When to change them

- **Working in relative or absolute link mode but still want strict unique names?** Turn off
  _Only in shortest link mode_ to enforce uniqueness regardless of link format.
- **Want uniqueness for attachments and other files too?** Turn off _Markdown notes only_.
- **Reorganizing folders and don't want rename protection right now?** Temporarily turn off
  _Guard move and rename_ (or the master switch).
- **Scripting bulk imports?** Turn off _Enable NameGuard_ during the import, then turn it back on.

## How the gates combine

An operation is only blocked when **all** of the active gates agree it should be:

1. _Enable NameGuard_ is on, and
2. the link-format gate passes (either _Only in shortest link mode_ is off, or the vault is in
   shortest mode), and
3. the file-type gate passes (either _Markdown notes only_ is off, or the file is a `.md` note), and
4. the target name already belongs to another note.

For moves and renames, a fifth condition applies: the name must actually change. Moving a note between
folders without renaming it is never blocked.
