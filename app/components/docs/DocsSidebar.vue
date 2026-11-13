<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { groups } = useDocsNav()

function href(slug: string) {
  return localePath({ path: docsPath(locale.value, slug) })
}

function isActive(slug: string) {
  return route.path === href(slug)
}
</script>

<template>
  <details class="group rounded-panel border border-border bg-surface-1 p-4 lg:hidden">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
      {{ t('docs.title') }}
      <Icon name="lucide:chevron-down" class="size-4 transition-transform group-open:rotate-180" />
    </summary>
    <nav class="mt-4 space-y-5" :aria-label="t('docs.title')">
      <div v-for="group in groups" :key="group.name">
        <p class="font-mono text-micro font-semibold tracking-[0.18em] text-fg-subtle uppercase">{{ group.name }}</p>
        <ul class="mt-2 space-y-1">
          <li v-for="doc in group.items" :key="doc.slug">
            <NuxtLink
              :to="href(doc.slug)"
              class="block rounded-btn px-3 py-2 text-sm transition-colors"
              :class="
                isActive(doc.slug)
                  ? 'bg-accent-soft font-semibold text-accent'
                  : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
              "
            >
              {{ doc.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>
  </details>

  <aside class="hidden lg:block">
    <div class="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2">
      <NuxtLink
        :to="localePath({ path: '/docs' })"
        class="font-mono text-micro font-semibold tracking-[0.18em] text-fg-subtle uppercase"
      >
        {{ t('docs.title') }}
      </NuxtLink>
      <nav class="mt-5 space-y-6" :aria-label="t('docs.title')">
        <div v-for="group in groups" :key="group.name">
          <p class="text-caption font-semibold text-fg-subtle">{{ group.name }}</p>
          <ul class="mt-2 space-y-0.5 border-l border-divider">
            <li v-for="doc in group.items" :key="doc.slug">
              <NuxtLink
                :to="href(doc.slug)"
                class="-ml-px block border-l px-3 py-1.5 text-sm transition-colors"
                :class="
                  isActive(doc.slug)
                    ? 'border-accent font-semibold text-accent'
                    : 'border-transparent text-fg-muted hover:border-border-strong hover:text-fg'
                "
              >
                {{ doc.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </aside>
</template>
