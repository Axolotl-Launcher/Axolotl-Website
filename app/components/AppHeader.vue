<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

const menuDialog = ref<HTMLDialogElement | null>(null)

const nav = computed(() => [
  { key: 'nav.home', to: localePath({ path: '/' }) },
  { key: 'nav.download', to: localePath({ path: '/download' }) },
  { key: 'nav.docs', to: localePath({ path: '/docs' }) },
  { key: 'nav.articles', to: localePath({ path: '/articles' }) },
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
  <header class="glass sticky top-0 z-50 border-x-0 border-t-0 border-b" style="view-transition-name: site-header">
    <div class="site-container flex h-16 items-center gap-4">
      <AppLogo />

      <nav class="ml-3 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
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

        <BaseButton :to="localePath({ path: '/download' })" size="sm" class="ml-1 max-sm:hidden">
          <Icon name="lucide:download" class="size-4" />
          {{ t('actions.download') }}
        </BaseButton>

        <button
          type="button"
          class="grid size-9 place-items-center rounded-btn text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg lg:hidden"
          :aria-label="t('actions.openMenu')"
          @click="openMenu"
        >
          <Icon name="lucide:menu" class="size-5" />
        </button>
      </div>
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
      <nav class="site-container mt-6 flex flex-col gap-1" aria-label="Mobile">
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
