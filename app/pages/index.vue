<script setup lang="ts">
import latestRelease from '~~/releases/latest.json'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const lang = computed(() => (locale.value === 'zh-CN' ? 'zh' : 'en'))
const latestVersion = latestRelease.tag_name.replace(/^v/, '')

const githubUrl = 'https://github.com/Axolotl-Launcher/Axolotl'
const contributorsUrl = `${githubUrl}/graphs/contributors`
const contributorsImage = 'https://contributors.hikarilink.org/image?repo=Axolotl-Launcher/Axolotl&columns=16'

const posterVars = computed(() => ({
  '--poster-light': `url(/launcher-preview/poster-light-${lang.value}-2x.webp)`,
  '--poster-dark': `url(/launcher-preview/poster-dark-${lang.value}-2x.webp)`,
  '--poster-oled': `url(/launcher-preview/poster-oled-${lang.value}-2x.webp)`,
}))

const platforms = [
  { icon: 'lucide:monitor', label: 'Windows' },
  { icon: 'lucide:laptop', label: 'macOS' },
  { icon: 'lucide:terminal', label: 'Linux' },
]

const pillars = computed(() => [
  { icon: 'lucide:layers', title: t('home.sections.isolationTitle'), body: t('home.sections.isolationBody') },
  { icon: 'lucide:shield-check', title: t('home.sections.repairTitle'), body: t('home.sections.repairBody') },
  { icon: 'lucide:network', title: t('home.sections.sourcesTitle'), body: t('home.sections.sourcesBody') },
])

const gallery = computed(() => [
  {
    src: '/showcase/launcher-home.webp',
    label: t('home.sections.galleryHome'),
    span: 'sm:col-span-2 lg:col-span-8 lg:row-span-2',
  },
  { src: '/showcase/theme-accent-1280.webp', label: t('home.sections.galleryThemes'), span: 'lg:col-span-4' },
  { src: '/showcase/recent-lab-1600.webp', label: t('home.sections.galleryLab'), span: 'lg:col-span-4' },
])

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
    <section
      class="relative isolate -mt-16 flex min-h-svh flex-col justify-center overflow-hidden border-b border-divider"
    >
      <div class="grid-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        class="pointer-events-none absolute -top-56 right-[-12%] h-[44rem] w-[40rem] bg-[radial-gradient(closest-side,var(--accent-glow),transparent)] opacity-70 dark:opacity-100"
        aria-hidden="true"
      />

      <div class="site-container relative pt-28 pb-16 lg:pt-28 lg:pb-20">
        <div class="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p
              class="inline-flex items-center gap-2.5 rounded-pill border border-border bg-surface-1/70 px-3.5 py-1.5 font-mono text-micro font-semibold tracking-[0.18em] text-fg-muted uppercase backdrop-blur"
            >
              <span class="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              {{ t('home.eyebrow') }}
              <span class="text-fg-subtle">v{{ latestVersion }}</span>
            </p>

            <h1 class="mt-7 text-section leading-[1.15] text-balance">
              {{ t('home.titleLead') }}
              <span class="block text-accent">{{ t('home.titleAccent') }}</span>
            </h1>

            <p class="mt-6 max-w-xl text-lead text-fg-muted">
              {{ t('home.lead') }}
            </p>

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

            <div class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-fg-subtle">
              <span v-for="platform in platforms" :key="platform.label" class="inline-flex items-center gap-1.5">
                <Icon :name="platform.icon" class="size-3.5" aria-hidden="true" />
                {{ platform.label }}
              </span>
              <span class="hidden h-3.5 w-px bg-divider sm:block" aria-hidden="true" />
              <span class="inline-flex items-center gap-1.5">
                <Icon name="lucide:code-xml" class="size-3.5" aria-hidden="true" />
                {{ t('home.sections.capOpenTitle') }}
              </span>
            </div>
          </div>

          <figure
            class="relative mx-auto w-full max-w-xl min-[1440px]:-mr-[5.25rem] min-[1440px]:w-[calc(100%+5.25rem)] lg:max-w-none"
          >
            <div class="absolute -inset-6 rounded-[2.5rem] bg-accent/10 blur-3xl" aria-hidden="true" />
            <div class="glass relative rounded-panel p-1.5 shadow-floating">
              <div
                class="hero-poster w-full rounded-card border border-border/60"
                role="img"
                :aria-label="t('home.preview')"
                :style="posterVars"
              />
            </div>
            <figcaption class="sr-only">{{ t('home.preview') }}</figcaption>

            <NuxtLink
              :to="localePath({ path: '/changelog' })"
              class="group absolute -bottom-5 left-5 hidden items-center gap-3 rounded-card border border-border bg-surface-1/95 px-4 py-3 shadow-raised backdrop-blur sm:flex"
            >
              <span class="grid size-9 place-items-center rounded-full bg-accent/10 text-accent">
                <Icon name="lucide:git-commit-horizontal" class="size-4" aria-hidden="true" />
              </span>
              <span>
                <span class="block text-caption font-semibold">v{{ latestVersion }}</span>
                <span class="block text-micro tracking-[0.12em] text-fg-subtle uppercase">
                  {{ t('nav.changelog') }}
                </span>
              </span>
              <Icon
                name="lucide:arrow-up-right"
                class="ml-1 size-3.5 text-fg-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                aria-hidden="true"
              />
            </NuxtLink>
          </figure>
        </div>
      </div>
    </section>

    <section class="site-container py-section">
      <div class="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div class="lg:col-span-7">
          <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
            {{ t('home.sections.featuresEyebrow') }}
          </p>
          <h2 class="mt-4 max-w-2xl text-section-sm text-balance">{{ t('home.sections.featuresTitle') }}</h2>
        </div>
        <div class="lg:col-span-5 lg:pt-2">
          <p class="text-body leading-relaxed text-fg-muted">{{ t('home.sections.featuresLead') }}</p>
          <NuxtLink
            :to="localePath({ path: '/docs' })"
            class="group mt-5 inline-flex items-center gap-2 text-caption font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            {{ t('home.secondary') }}
            <Icon
              name="lucide:arrow-right"
              class="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
              aria-hidden="true"
            />
          </NuxtLink>
        </div>
      </div>

      <div class="mt-14 grid gap-10 border-t border-divider pt-10 sm:grid-cols-3">
        <article v-for="pillar in pillars" :key="pillar.title">
          <span class="grid size-10 place-items-center rounded-card border border-border bg-surface-1 text-accent">
            <Icon :name="pillar.icon" class="size-5" aria-hidden="true" />
          </span>
          <h3 class="mt-5 text-card font-semibold">{{ pillar.title }}</h3>
          <p class="mt-2.5 text-body leading-relaxed text-fg-muted">{{ pillar.body }}</p>
        </article>
      </div>
    </section>

    <section class="border-y border-border bg-surface-1">
      <div class="site-container py-section">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div class="max-w-xl">
            <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
              {{ t('home.sections.galleryEyebrow') }}
            </p>
            <h2 class="mt-4 text-section-sm text-balance">{{ t('home.sections.galleryTitle') }}</h2>
          </div>
          <p class="max-w-sm text-body leading-relaxed text-fg-muted">{{ t('home.sections.galleryLead') }}</p>
        </div>

        <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:h-[30rem] lg:grid-cols-12 lg:grid-rows-2 lg:gap-5">
          <Motion
            v-for="shot in gallery"
            :key="shot.src"
            as="figure"
            class="group relative aspect-[16/10] overflow-hidden rounded-panel border border-border bg-surface-2 lg:aspect-auto"
            :class="shot.span"
            :while-hover="{ y: -4 }"
            :transition="{ type: 'spring', stiffness: 260, damping: 30 }"
          >
            <img
              :src="shot.src"
              :alt="`${shot.label} — Axolotl Launcher`"
              loading="lazy"
              decoding="async"
              class="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transform-none motion-reduce:transition-none"
            />
            <figcaption
              class="absolute top-3 left-3 rounded-pill border border-border bg-surface-0/85 px-3 py-1 text-caption font-medium text-fg backdrop-blur"
            >
              {{ shot.label }}
            </figcaption>
          </Motion>
        </div>
      </div>
    </section>

    <section class="site-container py-section">
      <header class="max-w-2xl">
        <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
          {{ t('home.sections.flowEyebrow') }}
        </p>
        <h2 class="mt-4 text-section-sm text-balance">{{ t('home.sections.flowTitle') }}</h2>
      </header>

      <ol class="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div class="absolute inset-x-0 top-5 hidden h-px bg-divider lg:block" aria-hidden="true" />
        <li v-for="step in flow" :key="step.number" class="relative">
          <span
            class="relative z-10 grid size-10 place-items-center rounded-full border border-border bg-surface-1 font-mono text-caption text-fg-muted"
          >
            {{ step.number }}
          </span>
          <h3 class="mt-5 text-card font-semibold">{{ step.title }}</h3>
          <p class="mt-2 text-caption leading-relaxed text-fg-muted">{{ step.body }}</p>
        </li>
      </ol>
    </section>

    <section class="border-t border-border">
      <div class="site-container py-section">
        <header class="max-w-2xl">
          <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
            {{ t('home.sections.capabilitiesEyebrow') }}
          </p>
          <h2 class="mt-4 text-section-sm text-balance">{{ t('home.sections.capabilitiesTitle') }}</h2>
        </header>

        <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="capability in capabilities"
            :key="capability.title"
            class="rounded-card border border-border bg-surface-1 p-6 transition-colors duration-200 hover:border-border-strong"
          >
            <span class="grid size-9 place-items-center rounded-btn bg-accent/10 text-accent">
              <Icon :name="capability.icon" class="size-4.5" aria-hidden="true" />
            </span>
            <h3 class="mt-4 text-body font-semibold">{{ capability.title }}</h3>
            <p class="mt-2 text-caption leading-relaxed text-fg-muted">{{ capability.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="border-t border-border">
      <div class="site-container py-section">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div class="max-w-2xl">
            <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
              {{ t('home.sections.contributorsEyebrow') }}
            </p>
            <h2 class="mt-4 text-section-sm text-balance">{{ t('home.sections.contributorsTitle') }}</h2>
          </div>
          <div class="max-w-sm">
            <p class="text-body leading-relaxed text-fg-muted">{{ t('home.sections.contributorsLead') }}</p>
            <a
              :href="contributorsUrl"
              target="_blank"
              rel="noreferrer"
              class="group mt-4 inline-flex items-center gap-2 text-caption font-semibold text-accent transition-colors hover:text-accent-strong"
            >
              {{ t('home.sections.contributorsLink') }}
              <Icon
                name="lucide:arrow-up-right"
                class="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        <div class="mt-12 overflow-hidden rounded-panel border border-border bg-surface-1 p-4 sm:p-6">
          <img
            :src="contributorsImage"
            alt="Axolotl Launcher contributors"
            width="1084"
            height="472"
            fetchpriority="low"
            decoding="async"
            class="h-auto w-full"
          />
        </div>
      </div>
    </section>

    <section class="site-container pb-section">
      <div
        class="relative isolate overflow-hidden rounded-panel border border-border bg-surface-1 px-6 py-10 sm:px-10 sm:py-12 lg:px-14"
      >
        <div
          class="pointer-events-none absolute -top-28 -right-20 size-80 rounded-full bg-accent/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-accent/10 blur-3xl"
          aria-hidden="true"
        />

        <div class="relative flex flex-wrap items-end justify-between gap-8">
          <div class="max-w-xl">
            <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
              {{ t('support.eyebrow') }}
            </p>
            <h2 class="mt-4 text-section-sm text-balance">{{ t('support.title') }}</h2>
            <p class="mt-3 text-body leading-relaxed text-fg-muted">{{ t('support.lead') }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <BaseButton :to="localePath({ path: '/support' })">
              <Icon name="lucide:heart" class="size-4" aria-hidden="true" />
              {{ t('nav.support') }}
            </BaseButton>
            <BaseButton :href="githubUrl" variant="secondary">
              <Icon name="lucide:github" class="size-4" aria-hidden="true" />
              {{ t('nav.github') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <section class="site-container pb-section">
      <div class="mx-auto max-w-3xl text-center">
        <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
          {{ t('home.sections.ctaEyebrow') }}
        </p>
        <h2 class="mt-4 text-section-sm text-balance">{{ t('home.sections.ctaTitle') }}</h2>
        <p class="mt-4 text-lead text-fg-muted">{{ t('home.sections.ctaBody') }}</p>

        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <BaseButton :to="localePath({ path: '/download' })" size="lg">
            <Icon name="lucide:download" class="size-4" />
            {{ t('home.primary') }}
          </BaseButton>
          <BaseButton :to="localePath({ path: '/docs' })" variant="secondary" size="lg">
            <Icon name="lucide:book-open" class="size-4" />
            {{ t('home.sections.ctaDocs') }}
          </BaseButton>
        </div>

        <p class="mt-5 font-mono text-micro tracking-[0.18em] text-fg-subtle uppercase">
          {{ t('home.note') }}
        </p>
      </div>
    </section>
  </div>
</template>
