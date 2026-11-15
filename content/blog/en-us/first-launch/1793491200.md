---
locale: en-US
title: 'First launch: accounts, Java and memory'
description: The four things worth getting right before you start the game.
publishedAt: '2026-11-08'
updatedAt: '2026-11-08'
authors:
  - Axolotl Team
tags:
  - Getting started
  - Java
cover: /showcase/recent-lab-1600.webp
draft: false
---

The first time you open Axolotl, three things matter most: which account you use, which Java runtime the game gets, and how much memory it may allocate. Everything else can wait.

## 1. Sign in

Choose Microsoft sign-in on the Accounts page and finish the authorization in your browser. The launcher stores the session, never your password. Offline accounts and custom authentication services are available on the same page.

After signing in, check that the avatar, username and skin look right. If the skin has not refreshed, reopen the Accounts page.

## 2. Pick a Java runtime

The Java version must match the Minecraft version. The launcher prefers the runtime you choose and prompts you to install or locate another one when no suitable version exists.

- Recent game versions usually need Java 21 or newer.
- Older modpacks may require Java 8 or Java 17.
- Do not point several Java entries at the same directory.

If you are unsure, leave the automatic choice in place and let the launcher decide per version.

## 3. Allocate memory

More memory is not automatically better. Oversized heaps make garbage-collection pauses worse and starve the rest of the system.

| Workload                  | Suggested memory |
| ------------------------- | ---------------- |
| Vanilla or light modpacks | 2–4 GB           |
| Medium modpacks           | 4–6 GB           |
| Large modpacks            | 6–8 GB           |

Leave at least 4 GB for the operating system. On an 8 GB machine, avoid giving the game more than 6 GB.

## 4. Choose a game directory

The default lives under your user directory. Keep it on a local disk with enough free space, and avoid network-synced folders: they cause file locks and read/write conflicts.

With those four steps done, pick a version on the home page and launch. The first start downloads assets, so it takes longer than later launches.
