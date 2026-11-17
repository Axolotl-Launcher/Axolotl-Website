---
locale: en-US
title: 'After a crash: read the log before you repair'
description: Use the crash report to find mod conflicts, Java mismatches and memory pressure.
publishedAt: '2026-11-01'
updatedAt: '2026-11-01'
authors:
  - Axolotl Team
tags:
  - Troubleshooting
  - Logs
cover: /showcase/recent-backups-1280.webp
draft: false
---

When the game crashes, the launcher keeps the log and the crash report. The repair action fixes some installation problems, but reading the end of the log is usually faster.

## Start with the last 50 lines

Open the instance log and jump to the end. The useful exception is usually:

- the first line after `Caused by:`;
- a `java.lang.` exception;
- a `Missing`, `Incompatible` or `Duplicate` entry from the mod loader.

If the log ends with `OutOfMemoryError`, adjust memory before removing mods.

## Three common causes

**Mod conflict.** Two mods implement the same feature, or a dependency version does not match. The log names the mod ID; disable one and retry.

**Java mismatch.** The game exits immediately with `UnsupportedClassVersionError`. Switch the instance to the Java version the game expects.

**Incomplete installation.** An interrupted download leaves a library missing. Run repair from the instance menu to verify files again.

## A safe repair order

1. Copy the instance and preserve the current state.
2. Disable the most recently added mod and try to launch.
3. If it starts, restore mods one at a time until the culprit appears.
4. Delete the temporary copy only after the instance is stable.

Do not disable a dozen mods at once. Even if the game starts, you will not know which one was responsible.

## What to include in a bug report

Attach the full log, the game version, the loader version and the Java version. A screenshot of the error alone rarely contains enough context.
