<script setup lang="ts">
import { algoliasearch } from 'algoliasearch'

const { t } = useI18n()
const config = useRuntimeConfig()
const algolia = config.public.algolia

const configured = Boolean(algolia.appId && algolia.searchApiKey && algolia.indexName)
const searchClient = configured ? algoliasearch(algolia.appId, algolia.searchApiKey) : null
const configuration = searchClient ? { indexName: algolia.indexName, searchClient } : null

function hitRecord(item: unknown): Record<string, unknown> {
  return item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
}

function hitTitle(item: unknown) {
  const record = hitRecord(item)
  return String(record.title ?? record.name ?? record.objectID ?? '')
}

function hitDescription(item: unknown) {
  const record = hitRecord(item)
  const value = record.description ?? record.excerpt ?? ''
  return typeof value === 'string' ? value : ''
}

function hitLink(item: unknown) {
  const record = hitRecord(item)
  const value = record.url ?? record.path
  return typeof value === 'string' && value ? value : null
}

useSeoMeta({
  title: `${t('search.title')} — Axolotl Launcher`,
  description: t('search.lead'),
})
</script>

<template>
  <div class="site-container py-10 sm:py-14">
    <header class="mx-auto max-w-2xl text-center">
      <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
        {{ t('search.eyebrow') }}
      </p>
      <h1 class="mt-3 text-section text-balance">{{ t('search.title') }}</h1>
      <p class="mt-4 text-lead text-fg-muted">{{ t('search.lead') }}</p>
    </header>

    <div class="mx-auto mt-10 max-w-3xl">
      <AisInstantSearch v-if="configuration" :configuration="configuration">
        <AisSearchBox :placeholder="t('search.placeholder')" />
        <AisStats class="mt-4 text-caption text-fg-subtle">
          <template #default="{ nbHits, processingTimeMS }">
            {{ t('search.stats', { count: nbHits, ms: processingTimeMS }) }}
          </template>
        </AisStats>
        <AisHits class="mt-6">
          <template #item="{ item }">
            <NuxtLink
              v-if="hitLink(item)"
              :to="hitLink(item) || '/'"
              class="block rounded-card border border-border bg-surface-1 p-4 transition-colors hover:border-border-strong"
            >
              <h2 class="text-card font-semibold">{{ hitTitle(item) }}</h2>
              <p v-if="hitDescription(item)" class="mt-1 text-caption leading-relaxed text-fg-muted">
                {{ hitDescription(item) }}
              </p>
            </NuxtLink>
            <div v-else class="rounded-card border border-border bg-surface-1 p-4">
              <h2 class="text-card font-semibold">{{ hitTitle(item) }}</h2>
              <p v-if="hitDescription(item)" class="mt-1 text-caption leading-relaxed text-fg-muted">
                {{ hitDescription(item) }}
              </p>
            </div>
          </template>
        </AisHits>
        <AisPagination class="mt-8" />
      </AisInstantSearch>

      <div v-else class="rounded-panel border border-border bg-surface-1 p-6 text-center text-caption text-fg-muted">
        {{ t('search.unconfigured') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.ais-SearchBox-form) {
  position: relative;
}

:deep(.ais-SearchBox-input) {
  width: 100%;
  height: 3rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-btn);
  background: var(--surface-1);
  padding: 0 3.25rem 0 1rem;
  color: var(--fg);
  font: inherit;
}

:deep(.ais-SearchBox-input::placeholder) {
  color: var(--fg-subtle);
}

:deep(.ais-SearchBox-input:focus-visible) {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

:deep(.ais-SearchBox-submit),
:deep(.ais-SearchBox-reset) {
  position: absolute;
  top: 50%;
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  color: var(--fg-subtle);
  transform: translateY(-50%);
}

:deep(.ais-SearchBox-submit) {
  left: 0.5rem;
}

:deep(.ais-SearchBox-reset) {
  right: 0.5rem;
}

:deep(.ais-Hits-list) {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

:deep(.ais-Pagination-list) {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

:deep(.ais-Pagination-link) {
  display: grid;
  min-width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-btn);
  color: var(--fg-muted);
}

:deep(.ais-Pagination-item--selected .ais-Pagination-link) {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}
</style>
