<script setup lang="ts">
import { BLOG_LICENSE } from '~~/shared/blog'

const { t } = useI18n()
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
    <blockquote class="mt-3 border-l-2 border-accent/40 pl-3 text-micro leading-relaxed text-fg-muted">
      {{ t('blog.licenseCitation') }}
    </blockquote>
    <a
      :href="BLOG_LICENSE.url"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-2 inline-flex text-micro font-semibold text-accent-strong"
    >
      {{ t('blog.licenseDetails') }} →
    </a>
  </section>
</template>
