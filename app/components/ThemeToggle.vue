<script setup lang="ts">
import type { ThemeMode } from '~/composables/useTheme'

const { mode, cycle } = useTheme()
const { t } = useI18n()

const icons: Record<ThemeMode, string> = {
  light: 'lucide:sun',
  dark: 'lucide:moon',
  oled: 'lucide:circle-dot',
  system: 'lucide:monitor',
}

const label = computed(() => `${t('theme.label')}: ${t(`theme.${mode.value}`)}`)
</script>

<template>
  <button
    type="button"
    class="grid size-9 place-items-center rounded-btn text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
    :aria-label="label"
    :title="label"
    @click="cycle"
  >
    <Icon :name="icons[mode]" class="size-4" />
  </button>
</template>
