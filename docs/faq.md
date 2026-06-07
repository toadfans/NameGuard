---
title: FAQ
sidebar:
  order: 40
---

# FAQ

### Why does it only act in shortest link mode by default?

Because that is the only mode where the problem exists. In **Shortest path when possible** mode,
Obsidian rewrites your existing links the moment a duplicate name appears. In **relative** and
**absolute** modes, links already carry a path and adding another same-named note does not change how
they resolve, so there is nothing to protect against. If you still want strict unique names in those
modes, turn off **Only in shortest link mode** in settings.

### Does NameGuard change or delete my existing duplicates?

No. NameGuard never modifies files and never inspects duplicates that already exist. It only evaluates
the **new** name introduced by the operation you are performing right now. Notes that were already
named the same keep working exactly as before.

### It blocked my new "Untitled" note. Why?

If a note named `Untitled` already exists in another folder, creating a second `Untitled` is a
duplicate name, so it is blocked. This is the strict behavior working as intended. Options:

- Give the new note a unique name.
- Keep notes that share a working name (like `Untitled`) in the same folder, where Obsidian's own
  auto-numbering produces `Untitled 1`, `Untitled 2`, and so on.
- Temporarily turn off the master switch in **Settings → NameGuard**.

### What about files created by Sync, an external editor, or the file system?

NameGuard can only guard operations that go through Obsidian's vault API (`create`, `createBinary`,
`rename`, and optionally `copy`). Files that arrive from a sync client, an external editor, or directly
on disk are picked up by Obsidian's file watcher instead, so NameGuard does not intercept them.

### Does it guard attachments and other non-markdown files?

Not by default. NameGuard guards `.md` notes only, because shortest-format links are about notes. Turn
off **Markdown notes only** to enforce unique names across every file type.

### What happens when an operation is blocked?

The create, rename, or copy is aborted (it returns a rejected promise), and — unless you turned off
notices — a short notification names the existing note that caused the conflict. Nothing is written to
disk and no links are rewritten.

### Is there any performance cost?

Negligible. The check runs only when you create, move, rename, or copy a file, and it reuses
Obsidian's own link resolver for the markdown fast path. There is no background scanning and no work
during normal editing.

### Does NameGuard make any network requests or collect data?

No. It runs entirely locally, makes no network requests, and collects no telemetry.

### How do I turn it off temporarily?

Toggle **Enable NameGuard** off in **Settings → NameGuard**. It takes effect immediately, and you can
turn it back on the same way.
