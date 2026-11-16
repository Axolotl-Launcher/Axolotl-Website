<script setup lang="ts">
import { BLOG_LICENSE } from '~~/shared/blog'

const { t } = useI18n()

// Grouped the way the Creative Commons deed presents CC BY-SA 4.0:
// what the license grants, the conditions attached to it, and what it forbids.
const groups = [
  {
    label: 'blog.licenseAllow',
    icon: 'lucide:unlock',
    tone: 'text-emerald-700 dark:text-emerald-400',
    items: [
      { icon: 'lucide:copy', text: 'blog.licenseAllowShare' },
      { icon: 'lucide:shuffle', text: 'blog.licenseAllowAdapt' },
    ],
  },
  {
    label: 'blog.licenseRequire',
    icon: 'lucide:scale',
    tone: 'text-sky-700 dark:text-sky-400',
    items: [
      { icon: 'lucide:user-round-check', text: 'blog.licenseRequireAttribution' },
      { icon: 'lucide:refresh-cw', text: 'blog.licenseRequireShareAlike' },
    ],
  },
  {
    label: 'blog.licenseDeny',
    icon: 'lucide:ban',
    tone: 'text-rose-700 dark:text-rose-400',
    items: [{ icon: 'lucide:shield-off', text: 'blog.licenseDenyExtraRestrictions' }],
  },
] as const
</script>

<template>
  <section class="rounded-card border border-border bg-surface-1 p-4">
    <p class="font-mono text-micro font-semibold tracking-[0.16em] text-fg-subtle uppercase">
      {{ t('blog.license') }}
    </p>
    <a :href="BLOG_LICENSE.url" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex items-center gap-2">
      <img :src="BLOG_LICENSE.image" :alt="BLOG_LICENSE.name" width="88" height="31" loading="lazy" />
      <span class="text-caption font-semibold text-fg">{{ BLOG_LICENSE.name }}</span>
    </a>
    <dl class="mt-4 space-y-3.5">
      <div v-for="group in groups" :key="group.label">
        <dt class="flex items-center gap-1.5 text-micro font-semibold tracking-[0.1em] uppercase" :class="group.tone">
          <Icon :name="group.icon" class="size-3.5 shrink-0" aria-hidden="true" />
          {{ t(group.label) }}
        </dt>
        <dd class="mt-1.5">
          <ul class="space-y-1.5">
            <li
              v-for="item in group.items"
              :key="item.text"
              class="flex items-start gap-1.5 text-[0.6875rem] leading-snug text-fg-muted"
            >
              <Icon :name="item.icon" class="mt-px size-3.5 shrink-0" :class="group.tone" aria-hidden="true" />
              <span>{{ t(item.text) }}</span>
            </li>
          </ul>
        </dd>
      </div>
    </dl>
    <a
      :href="BLOG_LICENSE.url"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-3 inline-flex text-micro font-semibold text-accent-strong"
    >
      {{ t('blog.licenseDetails') }} →
    </a>
  </section>
</template>
