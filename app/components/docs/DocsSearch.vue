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
const contentLocale = computed(() => toContentLocale(locale.value))

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
  results.value = hits.filter((hit) => hit.type === 'doc' && hit.locale === contentLocale.value).slice(0, 8)
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
      class="docs-search-trigger group flex h-9 w-full items-center gap-2 rounded-btn border border-border bg-surface-2/80 px-2.5 text-left text-caption text-fg-subtle shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-fg"
      :aria-label="t('docs.searchPlaceholder')"
      aria-haspopup="dialog"
      @click="openDialog"
    >
      <Icon
        name="lucide:search"
        class="size-3.5 shrink-0 text-fg-subtle transition-colors group-hover:text-accent"
        aria-hidden="true"
      />
      <span class="truncate">{{ t('docs.searchPlaceholder') }}</span>
    </button>

    <dialog
      ref="dialog"
      class="m-auto max-h-[80dvh] w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-panel border border-border bg-surface-1/95 p-0 text-fg shadow-floating backdrop-blur-xl backdrop:bg-black/50"
      :aria-label="t('docs.searchPlaceholder')"
      @close="onDialogClosed"
      @click="onDialogClick"
    >
      <div class="flex max-h-[80dvh] flex-col" @click.stop>
        <div
          class="flex items-center gap-2.5 border-b border-divider px-4 py-3 transition-colors focus-within:bg-surface-2/40"
        >
          <span class="grid size-8 shrink-0 place-items-center rounded-btn bg-accent/10 text-accent">
            <Icon name="lucide:search" class="size-4" aria-hidden="true" />
          </span>
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            class="docs-search-input h-9 min-w-0 flex-1 bg-transparent text-body text-fg placeholder:text-fg-subtle"
            :aria-label="t('docs.searchPlaceholder')"
            :placeholder="t('docs.searchPlaceholder')"
            autocomplete="off"
            spellcheck="false"
          />
          <button
            type="button"
            class="grid size-8 shrink-0 place-items-center rounded-btn border border-transparent text-fg-subtle transition-colors hover:border-border hover:bg-surface-2 hover:text-fg"
            :aria-label="t('docs.closeSearch')"
            @click="closeDialog"
          >
            <Icon name="lucide:x" class="size-4" aria-hidden="true" />
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto p-2" data-lenis-prevent>
          <p v-if="loading" class="px-3 py-3 text-caption text-fg-subtle">{{ t('docs.searchLoading') }}</p>
          <p v-else-if="failed" class="px-3 py-3 text-caption text-fg-subtle">{{ t('docs.searchError') }}</p>
          <template v-else>
            <p
              v-if="query.trim()"
              class="px-3 py-1.5 text-micro font-semibold tracking-[0.12em] text-fg-subtle uppercase"
            >
              {{ t('docs.searchResults', { count: results.length }) }}
            </p>
            <ul v-if="results.length" class="space-y-1">
              <li v-for="hit in results" :key="hit.id">
                <NuxtLink
                  :to="localePath({ path: hit.url })"
                  class="group flex items-start gap-2.5 rounded-btn px-2.5 py-2 transition-colors hover:bg-surface-2"
                  @click="closeDialog"
                >
                  <span
                    class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-btn bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-on-accent"
                  >
                    <Icon name="lucide:file-text" class="size-3.5" aria-hidden="true" />
                  </span>
                  <span class="min-w-0">
                    <span class="block text-caption font-semibold text-fg">{{ hit.title }}</span>
                    <span v-if="hit.description" class="mt-0.5 line-clamp-2 block text-micro text-fg-subtle">
                      {{ hit.description }}
                    </span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
            <div v-else-if="query.trim()" class="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span class="grid size-10 place-items-center rounded-full bg-surface-2 text-fg-subtle">
                <Icon name="lucide:search-x" class="size-5" aria-hidden="true" />
              </span>
              <p class="text-caption text-fg-muted">{{ t('docs.searchEmpty') }}</p>
            </div>
            <div v-else class="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span class="grid size-10 place-items-center rounded-full bg-accent/10 text-accent">
                <Icon name="lucide:book-open" class="size-5" aria-hidden="true" />
              </span>
              <p class="text-caption text-fg-subtle">{{ t('docs.searchHint') }}</p>
            </div>
          </template>
        </div>

        <div class="flex items-center justify-between border-t border-divider px-3 py-2 text-micro text-fg-subtle">
          <span>{{ t('docs.title') }}</span>
          <span class="flex items-center gap-1.5">
            <kbd class="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.65rem]">Esc</kbd>
            {{ t('docs.closeSearch') }}
          </span>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.docs-search-trigger:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent) 45%, transparent);
}

.docs-search-input:focus-visible {
  outline: none;
}

.docs-search-input::-webkit-search-cancel-button,
.docs-search-input::-ms-clear {
  display: none;
}
</style>
