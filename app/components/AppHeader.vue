<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
const config = useRuntimeConfig()
const githubUrl = config.public.githubUrl
const repoApi = githubUrl.replace('https://github.com/', 'https://api.github.com/repos/')

// The expanded header surfaces the repository's star count. It is fetched in
// the browser so static builds never depend on GitHub's API at build time.
const stars = ref<number | null>(null)

onMounted(async () => {
  try {
    const response = await fetch(repoApi, { headers: { Accept: 'application/vnd.github+json' } })
    if (!response.ok) return
    const data = (await response.json()) as { stargazers_count?: number }
    if (typeof data.stargazers_count === 'number') stars.value = data.stargazers_count
  } catch {
    // The count is decorative; the header stays usable when GitHub is unreachable.
  }
})

const starText = computed(() => {
  const count = stars.value
  if (count === null) return ''
  return count < 1000 ? String(count) : `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`
})

const menuDialog = ref<HTMLDialogElement | null>(null)

// The header changes shape when the reader crosses 12% of the page, but never
// later than one viewport height, so very long articles still collapse the bar
// promptly. Short pages never reach either threshold.
const { y } = useWindowScroll()
const collapsed = ref(false)

function syncHeader() {
  if (!import.meta.client) return
  const pageThreshold = document.documentElement.scrollHeight * 0.12
  const viewportThreshold = window.innerHeight
  collapsed.value = window.scrollY > Math.min(pageThreshold, viewportThreshold)
}

watch(y, syncHeader)

onMounted(syncHeader)
useEventListener('resize', syncHeader)

// Download is deliberately absent: the header already carries a dedicated
// download button, and repeating it in the nav gave the same destination two
// adjacent entry points on every page.
const nav = computed(() => [
  { key: 'nav.home', to: localePath({ path: '/' }) },
  { key: 'nav.docs', to: localePath({ path: '/docs' }) },
  { key: 'nav.blog', to: localePath({ path: '/blog' }) },
  { key: 'nav.changelog', to: localePath({ path: '/changelog' }) },
  { key: 'nav.demo', to: localePath({ path: '/demo' }) },
  { key: 'nav.support', to: localePath({ path: '/support' }) },
])

const otherLocale = computed<{ code: 'zh-CN' | 'en'; label: string }>(() =>
  locale.value === 'zh-CN' ? { code: 'en', label: 'EN' } : { code: 'zh-CN', label: '中文' },
)

function isActive(to: string) {
  if (to === '/' || to === '/en') return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}

function openMenu() {
  menuDialog.value?.showModal()
}

function closeMenu() {
  menuDialog.value?.close()
}

watch(
  () => route.fullPath,
  () => closeMenu(),
)
</script>

<template>
  <header
    class="sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 motion-reduce:transition-none"
    :class="collapsed ? 'border-transparent bg-transparent' : 'glass border-x-0 border-t-0 border-b'"
    style="view-transition-name: site-header"
  >
    <div class="site-container flex h-16 items-center">
      <Motion
        layout
        :transition="{ type: 'spring', stiffness: 300, damping: 30, mass: 0.7 }"
        class="flex items-center gap-4 transition-[background-color,border-color,border-radius,padding,box-shadow] duration-300 motion-reduce:transition-none"
        :class="
          collapsed
            ? 'mx-auto h-12 w-fit max-w-full gap-2 rounded-pill border border-border/85 bg-[color-mix(in_oklab,var(--surface-0)_75%,var(--surface-4))]/95 px-4 shadow-[0_18px_50px_-24px_rgb(0_0_0/0.4),0_0_36px_-8px_var(--accent-glow)] backdrop-blur-2xl'
            : 'w-full'
        "
      >
        <AppLogo />

        <nav class="ml-3 hidden items-center gap-0.5 lg:flex" :aria-label="t('nav.primary')">
          <NuxtLink
            v-for="item in nav"
            :key="item.key"
            :to="item.to"
            class="rounded-btn px-3 py-2 text-caption font-medium transition-colors"
            :class="isActive(item.to) ? 'bg-surface-2 text-heading' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'"
          >
            {{ t(item.key) }}
          </NuxtLink>
        </nav>

        <div class="ml-auto flex items-center gap-0.5">
          <NuxtLink
            :to="switchLocalePath(otherLocale.code)"
            :hreflang="otherLocale.code"
            class="inline-flex h-9 items-center rounded-btn px-2.5 text-caption font-semibold text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg max-sm:hidden"
          >
            {{ otherLocale.label }}
          </NuxtLink>

          <ThemeToggle />

          <!--
            Two fixed controls: the GitHub chip always opens GitHub and the
            download button always opens /download, in the same place whether
            the bar is expanded or collapsed.
          -->
          <NuxtLink
            :to="githubUrl"
            target="_blank"
            rel="noreferrer"
            :aria-label="starText ? `${t('nav.github')} · ${starText}` : t('nav.github')"
            class="ml-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-btn border border-border bg-surface-2/70 px-2.5 text-caption font-semibold text-fg transition-colors hover:border-border-strong hover:bg-surface-2 max-sm:hidden"
          >
            <Icon name="lucide:github" class="size-4" aria-hidden="true" />
            <span v-if="starText" class="inline-flex items-center gap-1 text-micro font-medium text-fg-muted">
              <Icon name="lucide:star" class="size-3.5 text-accent" aria-hidden="true" />
              <span class="tabular-nums">{{ starText }}</span>
            </span>
          </NuxtLink>

          <NuxtLink
            :to="localePath({ path: '/download' })"
            :aria-label="t('actions.download')"
            class="ml-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-btn bg-accent px-2.5 text-caption font-semibold [color:var(--on-accent)] shadow-[0_10px_30px_-12px_var(--accent-glow)] transition-colors hover:bg-accent-strong max-sm:hidden"
          >
            <Icon name="lucide:download" class="size-4" aria-hidden="true" />
            <span>{{ t('actions.download') }}</span>
          </NuxtLink>

          <button
            type="button"
            class="grid size-9 place-items-center rounded-btn text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg lg:hidden"
            :aria-label="t('actions.openMenu')"
            @click="openMenu"
          >
            <Icon name="lucide:menu" class="size-5" />
          </button>
        </div>
      </Motion>
    </div>

    <dialog
      ref="menuDialog"
      class="m-0 h-dvh max-h-none w-full max-w-none bg-surface-0 p-0 text-fg backdrop:bg-black/40"
      :aria-label="t('actions.openMenu')"
    >
      <div class="site-container flex h-16 items-center justify-between">
        <AppLogo />
        <button
          type="button"
          class="grid size-9 place-items-center rounded-btn text-fg-muted hover:bg-surface-2 hover:text-fg"
          :aria-label="t('actions.closeMenu')"
          @click="closeMenu"
        >
          <Icon name="lucide:x" class="size-5" />
        </button>
      </div>
      <nav class="site-container mt-6 flex flex-col gap-1" :aria-label="t('nav.mobile')">
        <NuxtLink
          v-for="item in nav"
          :key="item.key"
          :to="item.to"
          class="rounded-card px-4 py-3 text-lg font-semibold transition-colors"
          :class="isActive(item.to) ? 'bg-surface-2 text-heading' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'"
          @click="closeMenu"
        >
          {{ t(item.key) }}
        </NuxtLink>
      </nav>
      <div class="site-container mt-6 flex items-center gap-2">
        <BaseButton :to="localePath({ path: '/download' })" size="lg" block @click="closeMenu">
          <Icon name="lucide:download" class="size-4" />
          {{ t('actions.download') }}
        </BaseButton>
        <NuxtLink
          :to="switchLocalePath(otherLocale.code)"
          class="grid h-12 min-w-16 place-items-center rounded-btn border border-border text-caption font-semibold"
          :hreflang="otherLocale.code"
          @click="closeMenu"
        >
          {{ otherLocale.label }}
        </NuxtLink>
      </div>
    </dialog>
  </header>
</template>
