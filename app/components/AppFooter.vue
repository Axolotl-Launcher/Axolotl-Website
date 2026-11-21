<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { sponsors } = useSponsors()
const year = new Date().getFullYear()

// Community entry points sit with the legal links instead of a floating dock.
// Each one uses its own brand mark and reveals a QR code on hover or focus.
const community = computed(() => [
  {
    id: 'qq-group',
    label: t('utility.qqGroup'),
    icon: 'qq-group',
    href: 'https://qm.qq.com/cgi-bin/qm/qr?k=tWbgLa33x9gSeWB0cII0Rm7z3pXE16fZ&jump_from=webapi&qr=1',
  },
  {
    id: 'qq-channel',
    label: t('utility.qqChannel'),
    icon: 'qq-channel',
    href: 'https://pd.qq.com/s/1r6aqng3k?utm_source=qr_share',
  },
  {
    id: 'discord',
    label: t('utility.discord'),
    icon: 'discord',
    href: 'https://discord.gg/CrtbsntYp7',
  },
  {
    id: 'afdian',
    label: t('utility.afdian'),
    icon: 'afdian',
    href: 'https://afdian.com/a/Mystic-Stars?utm_source=qrpic&utm_medium=link',
  },
])

const columns = computed(() => [
  {
    id: 'product',
    title: t('footer.product'),
    links: [
      { label: t('nav.download'), to: localePath({ path: '/download' }) },
      { label: t('nav.changelog'), to: localePath({ path: '/changelog' }) },
      { label: t('nav.demo'), to: localePath({ path: '/demo' }) },
    ],
  },
  {
    id: 'resources',
    title: t('footer.resources'),
    links: [
      { label: t('nav.docs'), to: localePath({ path: '/docs' }) },
      { label: t('nav.blog'), to: localePath({ path: '/blog' }) },
      { label: t('nav.support'), to: localePath({ path: '/support' }) },
    ],
  },
  {
    id: 'legal',
    title: t('footer.legal'),
    links: [
      { label: t('nav.terms'), to: localePath({ path: '/blog/terms' }) },
      { label: t('nav.privacy'), to: localePath({ path: '/blog/privacy' }) },
    ],
  },
])
</script>

<template>
  <footer class="mt-section border-t border-border">
    <div class="border-b border-border">
      <div class="site-container flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p class="eyebrow text-fg-subtle">
          {{ t('sponsors.footer') }}
        </p>
        <SponsorLogos :sponsors="sponsors" />
      </div>
    </div>
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

        <nav class="mt-5" :aria-label="t('footer.community')">
          <ul class="flex flex-wrap items-center gap-2">
            <li v-for="item in community" :key="item.id">
              <FooterCommunityLink :label="item.label" :icon="item.icon" :href="item.href" />
            </li>
          </ul>
        </nav>
      </div>

      <div v-for="column in columns" :key="column.id">
        <h2 class="eyebrow text-fg-subtle">{{ column.title }}</h2>
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
        <p class="eyebrow">{{ t('footer.disclaimer') }}</p>
      </div>
    </div>
  </footer>
</template>
