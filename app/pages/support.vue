<script setup lang="ts">
import support from '~/data/support.json'

type LocalizedText = string | Record<string, string>

interface Plan {
  id: string
  amount: LocalizedText
  url: string
  period: LocalizedText
  title: LocalizedText
  description: LocalizedText
}

interface Cooperation {
  id: string
  title: LocalizedText
  description: LocalizedText
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const site = useSiteConfig()

function pick(value: LocalizedText | undefined) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[locale.value] ?? value['en-US'] ?? value['zh-CN'] ?? ''
}

const plans = computed(() =>
  (support.plans as Plan[]).map((plan) => ({
    ...plan,
    amount: pick(plan.amount),
    period: pick(plan.period),
    title: pick(plan.title),
    description: pick(plan.description),
  })),
)

const cooperation = computed(() =>
  (support.cooperation as Cooperation[]).map((item) => ({
    ...item,
    title: pick(item.title),
    description: pick(item.description),
  })),
)

const reasons = computed(() => [
  { icon: 'lucide:wrench', text: t('support.why1') },
  { icon: 'lucide:server', text: t('support.why2') },
  { icon: 'lucide:book-open', text: t('support.why3') },
])

const canonical = computed(() => `${site.url}${localePath({ path: '/support' })}`)

useSeoMeta({
  title: () => `${t('support.title')} — Axolotl Launcher`,
  description: () => t('support.lead'),
  ogTitle: () => `${t('support.title')} — Axolotl Launcher`,
  ogDescription: () => t('support.lead'),
  ogType: 'website',
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'DonateAction',
        name: t('support.title'),
        description: t('support.lead'),
        recipient: { '@type': 'Organization', name: 'Axolotl Launcher', url: site.url },
        target: support.afdianUrl,
      }),
    },
  ],
}))
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-divider">
      <div class="grid-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        class="pointer-events-none absolute -top-32 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-accent-glow blur-3xl"
        aria-hidden="true"
      />
      <div class="site-container relative py-16 sm:py-24">
        <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
          {{ t('support.eyebrow') }}
        </p>
        <h1 class="mt-4 max-w-3xl text-hero">{{ t('support.title') }}</h1>
        <p class="mt-5 max-w-2xl text-lead text-fg-muted">{{ t('support.lead') }}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <BaseButton :href="support.afdianUrl" target="_blank" rel="noopener noreferrer" size="lg">
            {{ t('support.supportOnAfdian') }}
            <Icon name="lucide:heart" class="size-4" />
          </BaseButton>
          <BaseButton :to="localePath({ path: '/thanks' })" variant="secondary" size="lg">{{
            t('support.viewThanks')
          }}</BaseButton>
        </div>
      </div>
    </section>

    <section class="site-container py-14 sm:py-20">
      <h2 class="text-section-sm">{{ t('support.tiersTitle') }}</h2>
      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <a
          v-for="plan in plans"
          :key="plan.id"
          :href="plan.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex flex-col rounded-card border border-border bg-surface-1 p-6 no-underline transition-colors hover:border-accent/50 hover:bg-surface-2"
        >
          <span class="font-mono text-caption text-fg-subtle">{{ plan.period }}</span>
          <span class="mt-3 text-section-sm font-bold text-heading">{{ plan.amount }}</span>
          <span class="mt-4 text-card font-semibold">{{ plan.title }}</span>
          <span class="mt-2 text-body leading-relaxed text-fg-muted">{{ plan.description }}</span>
          <span class="mt-6 inline-flex items-center gap-1 text-caption font-semibold text-accent">
            {{ t('support.supportOnAfdian') }} <Icon name="lucide:arrow-up-right" class="size-3.5" />
          </span>
        </a>
      </div>
    </section>

    <section class="border-y border-divider bg-surface-1/60">
      <div class="site-container grid gap-10 py-14 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 class="text-section-sm">{{ t('support.whyTitle') }}</h2>
          <p class="mt-3 max-w-md text-body leading-relaxed text-fg-muted">{{ t('support.thanksLead') }}</p>
        </div>
        <ul class="space-y-4">
          <li
            v-for="reason in reasons"
            :key="reason.text"
            class="flex items-start gap-3 rounded-card border border-border bg-surface-1 p-4"
          >
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <Icon :name="reason.icon" class="size-4" />
            </span>
            <span class="pt-1.5 text-body text-fg-muted">{{ reason.text }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="site-container py-14 sm:py-20">
      <h2 class="text-section-sm">{{ t('support.cooperationTitle') }}</h2>
      <div class="mt-8 grid gap-4 md:grid-cols-2">
        <div v-for="item in cooperation" :key="item.id" class="rounded-card border border-border bg-surface-1 p-6">
          <h3 class="text-card font-semibold">{{ item.title }}</h3>
          <p class="mt-2 text-body leading-relaxed text-fg-muted">{{ item.description }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
