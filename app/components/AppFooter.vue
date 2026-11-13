<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()

const columns = computed(() => [
  {
    title: t('footer.product'),
    links: [
      { label: t('nav.download'), to: localePath({ path: '/download' }) },
      { label: t('nav.changelog'), to: localePath({ path: '/changelog' }) },
      { label: t('nav.demo'), to: localePath({ path: '/demo' }) },
    ],
  },
  {
    title: t('footer.resources'),
    links: [
      { label: t('nav.docs'), to: localePath({ path: '/docs' }) },
      { label: t('nav.articles'), to: localePath({ path: '/articles' }) },
      { label: t('nav.support'), to: localePath({ path: '/support' }) },
    ],
  },
  {
    title: t('footer.legal'),
    links: [
      { label: t('nav.terms'), to: localePath({ path: '/terms' }) },
      { label: t('nav.privacy'), to: localePath({ path: '/privacy' }) },
    ],
  },
])
</script>

<template>
  <footer class="mt-section border-t border-border">
    <div class="site-container grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)] md:py-16">
      <div>
        <AppLogo />
        <p class="mt-4 max-w-xs text-caption leading-relaxed text-fg-muted">{{ t('footer.tagline') }}</p>
        <a
          href="https://github.com/Axolotl-Launcher/Axolotl"
          target="_blank"
          rel="noreferrer"
          class="mt-5 inline-flex items-center gap-1.5 text-caption font-medium text-fg-muted transition-colors hover:text-fg"
        >
          <Icon name="lucide:github" class="size-4" />
          {{ t('actions.github') }}
        </a>
      </div>

      <div v-for="column in columns" :key="column.title">
        <h2 class="font-mono text-micro font-semibold text-fg-subtle uppercase">{{ column.title }}</h2>
        <ul class="mt-4 space-y-2.5">
          <li v-for="link in column.links" :key="link.to">
            <NuxtLink :to="link.to" class="text-caption text-fg-muted transition-colors hover:text-fg">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-border">
      <div
        class="site-container flex flex-col gap-2 py-5 text-micro text-fg-subtle sm:flex-row sm:items-center sm:justify-between"
      >
        <p>{{ t('footer.copyright', { year }) }}</p>
        <p class="font-mono tracking-[0.16em] uppercase">Minecraft is not affiliated with Axolotl.</p>
      </div>
    </div>
  </footer>
</template>
