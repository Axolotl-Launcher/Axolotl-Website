<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { groups, docs } = useDocsNav()

useSeoMeta({
  title: `${t('nav.docs')} — Axolotl Launcher`,
  description: t('docs.lead'),
})
</script>

<template>
  <DocsShell>
    <header class="max-w-2xl">
      <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">KNOWLEDGE BASE</p>
      <h1 class="mt-4 text-section">{{ t('docs.title') }}</h1>
      <p class="mt-4 text-lead text-fg-muted">{{ t('docs.lead') }}</p>
    </header>

    <div v-if="docs.length" class="mt-12 space-y-10">
      <section v-for="group in groups" :key="group.name">
        <h2 class="text-caption font-semibold text-fg-subtle">{{ group.name }}</h2>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <NuxtLink
            v-for="doc in group.items"
            :key="doc.slug"
            :to="localePath({ path: docsPath(locale, doc.slug) })"
            class="group rounded-card border border-border bg-surface-1 p-5 transition-colors hover:border-accent/40 hover:bg-surface-2"
          >
            <div class="flex items-start justify-between gap-4">
              <h3 class="text-card font-semibold">{{ doc.title }}</h3>
              <Icon
                name="lucide:arrow-up-right"
                class="mt-1 size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
              />
            </div>
            <p v-if="doc.description" class="mt-2 text-body leading-relaxed text-fg-muted">{{ doc.description }}</p>
          </NuxtLink>
        </div>
      </section>
    </div>

    <div v-else class="mt-12 max-w-xl rounded-panel border border-dashed border-border-strong bg-surface-1 p-8">
      <Icon name="lucide:cloud-download" class="size-6 text-accent" />
      <h2 class="mt-4 text-card font-semibold">{{ t('docs.emptyTitle') }}</h2>
      <p class="mt-2 text-body leading-relaxed text-fg-muted">{{ t('docs.emptyBody') }}</p>
      <p class="mt-4 font-mono text-caption text-fg-subtle">{{ t('docs.emptyHint') }}</p>
    </div>
  </DocsShell>
</template>
