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
const route = useRoute()

const index = shallowRef<MiniSearch<SearchDocument> | null>(null)
const dialog = ref<HTMLDialogElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const failed = ref(false)
const query = ref('')
const results = ref<SearchHit[]>([])
let loadPromise: Promise<void> | null = null
let searchTimer: ReturnType<typeof setTimeout> | undefined

function runSearch() {
  const value = query.value.trim()
  if (!index.value || !value) {
    results.value = []
    return
  }
  const hits = index.value.search(value, {
    boost: { title: 2 },
    fuzzy: 0.2,
    prefix: true,
  }) as unknown as SearchHit[]
  results.value = hits.filter((hit) => hit.type === 'doc' && hit.locale === locale.value).slice(0, 8)
}

function ensureIndex() {
  if (index.value || loadPromise) return
  loading.value = true
  loadPromise = (async () => {
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
  })()
}

function openDialog() {
  ensureIndex()
  dialog.value?.showModal()
  nextTick(() => searchInput.value?.focus())
}

function closeDialog() {
  dialog.value?.close()
}

function onDialogClosed() {
  query.value = ''
  results.value = []
}

function onDialogClick(event: MouseEvent) {
  if (event.target === dialog.value) closeDialog()
}

watch(query, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(runSearch, 120)
})

watch(
  () => route.fullPath,
  () => {
    if (dialog.value?.open) dialog.value.close()
    query.value = ''
    results.value = []
  },
)

onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <div class="docs-search">
    <button
      type="button"
      class="flex h-9 w-full items-center gap-2 rounded-btn border border-border bg-surface-2 px-2.5 text-left text-caption text-fg-subtle transition-colors hover:border-border-strong hover:text-fg"
      :aria-label="t('docs.searchPlaceholder')"
      aria-haspopup="dialog"
      @click="openDialog"
    >
      <Icon name="lucide:search" class="size-3.5 shrink-0" aria-hidden="true" />
      <span class="truncate">{{ t('docs.searchPlaceholder') }}</span>
    </button>

    <dialog
      ref="dialog"
      class="m-auto max-h-[80dvh] w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-panel border border-border bg-surface-0 p-0 text-fg shadow-floating backdrop:bg-black/50"
      :aria-label="t('docs.searchPlaceholder')"
      @close="onDialogClosed"
      @click="onDialogClick"
    >
      <div class="flex flex-col" @click.stop>
        <div class="flex items-center gap-2 border-b border-divider px-3 py-2.5">
          <Icon name="lucide:search" class="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            :aria-label="t('docs.searchPlaceholder')"
            :placeholder="t('docs.searchPlaceholder')"
            autocomplete="off"
            spellcheck="false"
            class="h-9 min-w-0 flex-1 bg-transparent text-body text-fg placeholder:text-fg-subtle focus:outline-none"
          />
          <button
            type="button"
            class="grid size-8 shrink-0 place-items-center rounded-btn text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
            :aria-label="t('docs.closeSearch')"
            @click="closeDialog"
          >
            <Icon name="lucide:x" class="size-4" aria-hidden="true" />
          </button>
        </div>

        <div class="max-h-[60vh] overflow-y-auto p-2" data-lenis-prevent>
          <p v-if="loading" class="px-2 py-2 text-caption text-fg-subtle">{{ t('docs.searchLoading') }}</p>
          <p v-else-if="failed" class="px-2 py-2 text-caption text-fg-subtle">{{ t('docs.searchError') }}</p>
          <template v-else>
            <p v-if="query.trim()" class="px-2 py-1 text-micro text-fg-subtle">
              {{ t('docs.searchResults', { count: results.length }) }}
            </p>
            <ul v-if="results.length" class="space-y-0.5">
              <li v-for="hit in results" :key="hit.id">
                <NuxtLink
                  :to="localePath({ path: hit.url })"
                  class="block rounded-btn px-2 py-2 text-caption text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                  @click="closeDialog"
                >
                  <span class="block font-semibold text-fg">{{ hit.title }}</span>
                  <span v-if="hit.description" class="mt-0.5 block truncate text-micro text-fg-subtle">
                    {{ hit.description }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
            <p v-else-if="query.trim()" class="px-2 py-2 text-caption text-fg-muted">
              {{ t('docs.searchEmpty') }}
            </p>
            <p v-else class="px-2 py-2 text-caption text-fg-subtle">{{ t('docs.searchHint') }}</p>
          </template>
        </div>
      </div>
    </dialog>
  </div>
</template>
