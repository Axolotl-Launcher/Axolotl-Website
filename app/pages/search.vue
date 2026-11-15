<script setup lang="ts">
import MiniSearch from 'minisearch'

interface SearchDocument {
  id: string
  title: string
  description: string
  body: string
  url: string
  locale: string
  type: 'doc' | 'article'
}

type SearchHit = SearchDocument & { score: number }

const { t, locale } = useI18n()
const localePath = useLocalePath()

const index = shallowRef<MiniSearch<SearchDocument> | null>(null)
const query = ref('')
const results = ref<SearchHit[]>([])
const loading = ref(true)
const failed = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined

const searchOptions = {
  boost: { title: 2 },
  fuzzy: 0.2,
  prefix: true,
}

function runSearch() {
  const value = query.value.trim()
  if (!index.value || !value) {
    results.value = []
    return
  }
  const hits = index.value.search(value, searchOptions) as unknown as SearchHit[]
  results.value = hits.filter((hit) => hit.locale === locale.value).slice(0, 20)
}

watch([query, locale], () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(runSearch, 120)
})

onMounted(async () => {
  try {
    const raw = await $fetch<Record<string, unknown>>('/search-index.json')
    index.value = MiniSearch.loadJSON<SearchDocument>(JSON.stringify(raw), {
      fields: ['title', 'description', 'body'],
      storeFields: ['title', 'description', 'url', 'locale', 'type'],
      idField: 'id',
    })
    runSearch()
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => clearTimeout(searchTimer))

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
      <input
        v-model="query"
        type="search"
        :aria-label="t('search.placeholder')"
        :placeholder="t('search.placeholder')"
        autocomplete="off"
        spellcheck="false"
        class="h-12 w-full rounded-btn border border-border bg-surface-1 px-4 text-body text-fg placeholder:text-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />

      <p v-if="loading" class="mt-5 text-caption text-fg-subtle">{{ t('search.loading') }}</p>
      <p v-else-if="failed" class="mt-5 text-caption text-fg-subtle">{{ t('search.error') }}</p>

      <template v-else>
        <p v-if="query.trim()" class="mt-5 text-caption text-fg-subtle">
          {{ t('search.results', { count: results.length }) }}
        </p>

        <ul v-if="results.length" class="mt-4 grid gap-3">
          <li v-for="hit in results" :key="hit.id">
            <NuxtLink
              :to="localePath({ path: hit.url })"
              class="block rounded-card border border-border bg-surface-1 p-4 transition-colors hover:border-border-strong"
            >
              <span class="text-micro font-semibold tracking-[0.12em] text-fg-subtle uppercase">
                {{ hit.type === 'doc' ? t('search.doc') : t('search.article') }}
              </span>
              <h2 class="mt-1 text-card font-semibold">{{ hit.title }}</h2>
              <p v-if="hit.description" class="mt-1 text-caption leading-relaxed text-fg-muted">
                {{ hit.description }}
              </p>
            </NuxtLink>
          </li>
        </ul>

        <p v-else-if="query.trim()" class="mt-5 text-caption text-fg-muted">{{ t('search.empty') }}</p>
        <p v-else class="mt-5 text-caption text-fg-subtle">{{ t('search.hint') }}</p>
      </template>
    </div>
  </div>
</template>
