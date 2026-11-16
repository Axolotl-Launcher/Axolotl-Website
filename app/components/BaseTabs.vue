<script setup lang="ts">
interface TabOption {
  value: string
  label: string
}

defineProps<{
  options: TabOption[]
  label?: string
}>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <div
    class="inline-flex items-center gap-1 rounded-pill border border-border bg-surface-1 p-1"
    role="group"
    :aria-label="label"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="rounded-pill px-3.5 py-1.5 text-caption font-semibold transition-colors"
      :class="
        model === option.value
          ? 'bg-accent text-[color:var(--on-accent)] shadow-[0_6px_18px_-10px_var(--accent-glow)]'
          : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
      "
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
