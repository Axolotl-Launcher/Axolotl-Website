<script setup lang="ts">
interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

defineProps<{ links: TocLink[] }>()

const { t } = useI18n()
</script>

<template>
  <nav class="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto pl-2" :aria-label="t('docs.onThisPage')">
    <p class="font-mono text-micro font-semibold tracking-[0.18em] text-fg-subtle uppercase">
      {{ t('docs.onThisPage') }}
    </p>
    <ul class="mt-4 space-y-2 border-l border-divider">
      <li v-for="link in links" :key="link.id">
        <a
          :href="`#${link.id}`"
          class="-ml-px block border-l border-transparent py-0.5 pl-3 text-caption text-fg-muted transition-colors hover:border-accent hover:text-fg"
        >
          {{ link.text }}
        </a>
        <ul v-if="link.children?.length" class="space-y-2">
          <li v-for="child in link.children" :key="child.id">
            <a
              :href="`#${child.id}`"
              class="-ml-px block border-l border-transparent py-0.5 pl-6 text-caption text-fg-subtle transition-colors hover:border-accent hover:text-fg"
            >
              {{ child.text }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
