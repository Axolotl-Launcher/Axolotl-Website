<script setup lang="ts">
import { BLOG_MAIN_AUTHOR, blogCoauthor } from '~~/shared/blog'

const props = defineProps<{ authors: string[] }>()

const { t } = useI18n()
const main = BLOG_MAIN_AUTHOR
const coAuthors = computed(() => props.authors.filter((name) => name !== main.name).map((name) => blogCoauthor(name)))
const genderIcons: Record<string, string> = {
  female: 'lucide:venus',
  male: 'lucide:mars',
  team: 'lucide:users',
}
const genderIcon = genderIcons[main.gender] ?? 'lucide:users'
</script>

<template>
  <section class="rounded-card border border-border bg-surface-1 p-4">
    <p class="font-mono text-micro font-semibold tracking-[0.16em] text-fg-subtle uppercase">
      {{ t('blog.mainAuthor') }}
    </p>
    <div class="mt-3 flex items-start gap-3">
      <span class="relative shrink-0">
        <img
          :src="main.avatar"
          :alt="main.name"
          width="48"
          height="48"
          class="size-12 rounded-full border border-border bg-surface-2 object-cover"
        />
        <span
          role="img"
          :aria-label="t('blog.official')"
          class="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-surface-1"
        >
          <Icon name="lucide:circle-letter-v" class="size-4 text-accent" aria-hidden="true" />
        </span>
      </span>
      <div class="min-w-0">
        <p class="flex items-center gap-1.5 text-caption font-semibold text-fg">
          {{ main.name }}
          <Icon :name="genderIcon" class="size-3.5 text-fg-subtle" aria-hidden="true" />
        </p>
        <p class="text-micro text-fg-subtle">{{ main.title }}</p>
        <p class="mt-1 text-micro leading-relaxed text-fg-muted">{{ main.signature }}</p>
      </div>
    </div>
    <div v-if="coAuthors.length" class="mt-4 border-t border-divider pt-3">
      <p class="font-mono text-micro font-semibold tracking-[0.16em] text-fg-subtle uppercase">
        {{ t('blog.coAuthors') }}
      </p>
      <ul class="mt-2 flex flex-wrap gap-2">
        <li
          v-for="co in coAuthors"
          :key="co.name"
          class="flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-2 py-1"
        >
          <img :src="co.avatar" alt="" width="20" height="20" class="size-5 rounded-full object-cover" />
          <span class="text-micro font-semibold text-fg">{{ co.name }}</span>
          <span class="rounded-pill bg-accent/10 px-1.5 py-0.5 text-[0.625rem] font-semibold text-accent">
            {{ t(co.roleKey) }}
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>
