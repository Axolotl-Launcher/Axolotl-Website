<script setup lang="ts">
import latestRelease from '~~/releases/latest.json'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const lang = computed(() => (locale.value === 'zh-CN' ? 'zh' : 'en'))

const features = computed(() => [
  {
    number: '01',
    title: t('home.sections.isolationTitle'),
    body: t('home.sections.isolationBody'),
    visual: 'strata',
  },
  {
    number: '02',
    title: t('home.sections.repairTitle'),
    body: t('home.sections.repairBody'),
    visual: 'repair',
  },
  {
    number: '03',
    title: t('home.sections.sourcesTitle'),
    body: t('home.sections.sourcesBody'),
    visual: 'sources',
  },
])

const posterVars = computed(() => ({
  '--poster-light': `url(/launcher-preview/poster-light-${lang.value}-2x.webp)`,
  '--poster-dark': `url(/launcher-preview/poster-dark-${lang.value}-2x.webp)`,
  '--poster-oled': `url(/launcher-preview/poster-oled-${lang.value}-2x.webp)`,
}))
const latestVersion = latestRelease.tag_name.replace(/^v/, '')

const flow = computed(() => [
  { number: '01', title: t('home.sections.flowInstall'), body: t('home.sections.flowInstallBody') },
  { number: '02', title: t('home.sections.flowChoose'), body: t('home.sections.flowChooseBody') },
  { number: '03', title: t('home.sections.flowLaunch'), body: t('home.sections.flowLaunchBody') },
  { number: '04', title: t('home.sections.flowRollback'), body: t('home.sections.flowRollbackBody') },
])

const capabilities = computed(() => [
  { icon: 'lucide:user-round', title: t('home.sections.capAccountsTitle'), body: t('home.sections.capAccountsBody') },
  { icon: 'lucide:coffee', title: t('home.sections.capJavaTitle'), body: t('home.sections.capJavaBody') },
  { icon: 'lucide:package', title: t('home.sections.capModsTitle'), body: t('home.sections.capModsBody') },
  { icon: 'lucide:wifi-off', title: t('home.sections.capOfflineTitle'), body: t('home.sections.capOfflineBody') },
  { icon: 'lucide:palette', title: t('home.sections.capThemesTitle'), body: t('home.sections.capThemesBody') },
  { icon: 'lucide:code-xml', title: t('home.sections.capOpenTitle'), body: t('home.sections.capOpenBody') },
])

useSeoMeta({
  title: t('meta.title'),
  description: t('meta.description'),
  ogTitle: t('meta.title'),
  ogDescription: t('meta.description'),
  ogType: 'website',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Axolotl Launcher',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Windows, macOS, Linux',
        url: config.public.siteUrl,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }),
    },
  ],
})
</script>

<template>
  <div>
    <section class="relative isolate overflow-hidden">
      <div class="grid-lines pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" />
      <div
        class="pointer-events-none absolute top-[-18rem] left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-accent-glow blur-[100px]"
        aria-hidden="true"
      />

      <div class="site-container relative pt-20 pb-16 sm:pt-28 sm:pb-20">
        <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
          {{ t('home.eyebrow') }}
        </p>
        <h1 class="mt-6 max-w-4xl text-hero">{{ t('home.title') }}</h1>
        <p class="mt-6 max-w-2xl text-lead text-fg-muted">{{ t('home.lead') }}</p>

        <div class="mt-9 flex flex-wrap items-center gap-3">
          <BaseButton :to="localePath({ path: '/download' })" size="lg">
            <Icon name="lucide:download" class="size-4" />
            {{ t('home.primary') }}
          </BaseButton>
          <BaseButton :to="localePath({ path: '/docs' })" variant="secondary" size="lg">
            <Icon name="lucide:book-open" class="size-4" />
            {{ t('home.secondary') }}
          </BaseButton>
        </div>

        <p class="mt-4 flex items-center gap-2 text-caption text-fg-subtle">
          <span class="inline-block size-1.5 rounded-full bg-accent" aria-hidden="true" />
          {{ t('home.note') }}
        </p>
      </div>
    </section>

    <section class="site-container pb-section">
      <figure class="overflow-hidden rounded-panel border border-border bg-surface-1 p-1.5 shadow-raised sm:p-2">
        <div
          class="hero-poster w-full rounded-card border border-border/70"
          role="img"
          :aria-label="t('home.preview')"
          :style="posterVars"
        />
        <figcaption class="flex items-center justify-between gap-4 px-3 py-3 text-caption text-fg-subtle">
          <span>{{ t('home.preview') }}</span>
          <span class="font-mono text-micro tracking-[0.16em] uppercase">v{{ latestVersion }}</span>
        </figcaption>
      </figure>
    </section>

    <section class="site-container py-section">
      <header class="max-w-2xl">
        <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
          {{ t('home.sections.featuresEyebrow') }}
        </p>
        <h2 class="mt-4 text-section">{{ t('home.sections.featuresTitle') }}</h2>
        <p class="mt-4 text-lead text-fg-muted">{{ t('home.sections.featuresLead') }}</p>
      </header>

      <div class="mt-14 space-y-16 sm:space-y-20">
        <article
          v-for="(feature, index) in features"
          :key="feature.number"
          class="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
        >
          <div :class="index % 2 === 1 ? 'lg:order-2' : ''">
            <p class="font-mono text-caption text-fg-subtle">{{ feature.number }}</p>
            <h3 class="mt-3 text-section-sm">{{ feature.title }}</h3>
            <p class="mt-4 max-w-lg text-body leading-relaxed text-fg-muted">{{ feature.body }}</p>
          </div>

          <div :class="index % 2 === 1 ? 'lg:order-1' : ''">
            <div
              v-if="feature.visual === 'strata'"
              class="relative aspect-[4/3] overflow-hidden rounded-panel border border-border bg-surface-1 p-5"
            >
              <div class="absolute inset-x-10 top-8 h-20 rounded-card border border-border bg-surface-2 opacity-60" />
              <div class="absolute inset-x-7 top-16 h-24 rounded-card border border-border bg-surface-3 opacity-80" />
              <div class="relative mt-24 rounded-card border border-border-strong bg-surface-1 p-4 shadow-raised">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-micro tracking-[0.18em] text-fg-subtle uppercase">Instance</span>
                  <span class="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-micro text-emerald-500"
                    >READY</span
                  >
                </div>
                <p class="mt-3 font-semibold">1.21.5 · Fabric</p>
                <div class="mt-4 flex flex-wrap gap-1.5">
                  <span
                    class="rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-micro text-fg-muted"
                    >VERSION</span
                  >
                  <span
                    class="rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-micro text-fg-muted"
                    >MODS</span
                  >
                  <span
                    class="rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-micro text-fg-muted"
                    >CONFIG</span
                  >
                </div>
              </div>
              <div
                class="absolute right-5 bottom-5 left-5 flex items-center justify-between border-t border-divider pt-3 font-mono text-micro text-fg-subtle"
              >
                <span>instance/1.21.5-fabric</span>
                <span>isolated</span>
              </div>
            </div>

            <div
              v-else-if="feature.visual === 'repair'"
              class="rounded-panel border border-border bg-surface-1 p-5 shadow-raised"
            >
              <div class="flex items-center gap-1.5" aria-hidden="true">
                <span class="size-2 rounded-full bg-red-400/70" />
                <span class="size-2 rounded-full bg-amber-400/70" />
                <span class="size-2 rounded-full bg-emerald-400/70" />
                <span class="ml-3 font-mono text-micro text-fg-subtle">preflight.log</span>
              </div>
              <div class="mt-5 space-y-2.5 font-mono text-caption">
                <p class="flex items-center gap-2 text-fg-muted">
                  <Icon name="lucide:check" class="size-3.5 text-emerald-500" /> libraries/asm-9.7.1.jar
                </p>
                <p class="flex items-center gap-2 text-fg-muted">
                  <Icon name="lucide:check" class="size-3.5 text-emerald-500" /> assets/index-1.21.5.json
                </p>
                <p class="flex items-center gap-2 text-accent">
                  <Icon name="lucide:refresh-cw" class="size-3.5 animate-spin motion-reduce:animate-none" /> fetching 3
                  missing artifacts…
                </p>
                <p class="flex items-center gap-2 text-fg-muted">
                  <Icon name="lucide:check" class="size-3.5 text-emerald-500" /> natives/1.21.5-natives
                </p>
                <p class="flex items-center gap-2 text-emerald-500">
                  <Icon name="lucide:circle-check" class="size-3.5" /> instance ready in 1.8s
                </p>
              </div>
              <div class="mt-5 border-t border-divider pt-3 font-mono text-micro text-fg-subtle">
                <span class="text-accent">↻</span> resume from checkpoint
              </div>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="source in [
                  {
                    name: 'update.axlmc.org',
                    icon: 'lucide:server',
                    width: 'w-[92%]',
                    speed: '42 MB/s',
                    state: 'active',
                  },
                  { name: 'github.com', icon: 'lucide:github', width: 'w-[64%]', speed: '28 MB/s', state: 'standby' },
                  {
                    name: 'gitlink.org.cn',
                    icon: 'lucide:git-branch',
                    width: 'w-[38%]',
                    speed: '17 MB/s',
                    state: 'standby',
                  },
                ]"
                :key="source.name"
                class="rounded-card border border-border bg-surface-1 p-4"
              >
                <div class="flex items-center gap-2.5">
                  <Icon :name="source.icon" class="size-4 text-fg-muted" />
                  <span class="font-mono text-caption">{{ source.name }}</span>
                  <span
                    class="ml-auto font-mono text-micro"
                    :class="source.state === 'active' ? 'text-accent' : 'text-fg-subtle'"
                  >
                    {{ source.state }}
                  </span>
                </div>
                <div class="mt-3 flex items-center gap-3">
                  <div class="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
                    <div class="h-full rounded-full bg-accent" :class="source.width" />
                  </div>
                  <span class="font-mono text-micro text-fg-subtle">{{ source.speed }}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="border-y border-border bg-surface-1">
      <div class="site-container py-section">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
              {{ t('home.sections.flowEyebrow') }}
            </p>
            <h2 class="mt-4 text-section">{{ t('home.sections.flowTitle') }}</h2>
          </div>
        </div>
        <ol
          class="mt-12 grid gap-px overflow-hidden rounded-panel border border-border bg-divider sm:grid-cols-2 lg:grid-cols-4"
        >
          <li v-for="step in flow" :key="step.number" class="bg-surface-2 p-6">
            <p class="font-mono text-caption text-accent">{{ step.number }}</p>
            <h3 class="mt-5 text-card font-semibold">{{ step.title }}</h3>
            <p class="mt-2 text-caption leading-relaxed text-fg-muted">{{ step.body }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="site-container py-section">
      <header class="max-w-2xl">
        <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
          {{ t('home.sections.capabilitiesEyebrow') }}
        </p>
        <h2 class="mt-4 text-section">{{ t('home.sections.capabilitiesTitle') }}</h2>
      </header>
      <div class="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="capability in capabilities"
          :key="capability.title"
          class="rounded-card border border-border bg-surface-1 p-5 transition-colors hover:border-border-strong hover:bg-surface-2"
        >
          <Icon :name="capability.icon" class="size-5 text-accent" />
          <h3 class="mt-5 text-card font-semibold">{{ capability.title }}</h3>
          <p class="mt-2 text-caption leading-relaxed text-fg-muted">{{ capability.body }}</p>
        </article>
      </div>
    </section>

    <section class="site-container pb-section">
      <div class="relative overflow-hidden rounded-panel border border-accent/25 bg-surface-1 p-8 sm:p-12">
        <div
          class="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-accent-glow blur-[80px]"
          aria-hidden="true"
        />
        <div class="relative max-w-2xl">
          <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
            {{ t('home.sections.ctaEyebrow') }}
          </p>
          <h2 class="mt-4 text-section">{{ t('home.sections.ctaTitle') }}</h2>
          <p class="mt-4 text-lead text-fg-muted">{{ t('home.sections.ctaBody') }}</p>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <BaseButton :to="localePath({ path: '/download' })" size="lg">
              <Icon name="lucide:download" class="size-4" />
              {{ t('home.primary') }}
            </BaseButton>
            <BaseButton :to="localePath({ path: '/docs' })" variant="secondary" size="lg">
              {{ t('home.sections.ctaDocs') }}
            </BaseButton>
            <a
              :href="config.public.githubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="link-underline ml-1 text-caption text-fg-muted"
            >
              {{ t('home.sections.openSource') }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
