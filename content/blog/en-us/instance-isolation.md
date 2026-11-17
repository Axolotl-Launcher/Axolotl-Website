---
locale: en-US
title: Why every modpack deserves its own instance
description: How isolation prevents mod conflicts, version bleed and lost worlds.
publishedAt: '2026-11-05'
updatedAt: '2026-11-05'
authors:
  - Axolotl Team
tags:
  - Instances
  - Modpacks
cover: /showcase/launcher-home.webp
draft: false
---

Installing several modpacks into one `.minecraft` folder looks convenient until mod versions, configs, resource packs and worlds start overwriting each other. At that point it is hard to tell which change caused the crash.

## An instance is a complete environment

An Axolotl instance keeps its own:

- game version and loader;
- mods, resource packs and shaders;
- configuration files and key bindings;
- worlds, logs and crash reports;
- Java and memory settings.

The launcher mounts only the current instance at launch, so two modpacks can use different versions of the same mod without interfering.

## Three practical benefits

**Faster diagnosis.** A crash only involves the current instance's log, not a pile of unrelated mods.

**Safer rollback.** Copy an instance before updating a modpack; if the update breaks, switch back to the copy.

**Simpler migration.** The whole instance folder can be packed up and imported on another machine.

## What can be shared

Vanilla instances can usually share resource packs. Modpacks, shaders and custom configs should stay separate. If a world must be used by several instances, copy it instead of symlinking it, so two instances never write at once.

## One habit worth keeping

Name a new instance something you will still understand in a week, such as "1.20.1 Create survival". That beats any filing system.
