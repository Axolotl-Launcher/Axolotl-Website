<script setup lang="ts">
interface TabOption {
  value: string
  label: string
}

const props = defineProps<{
  options: TabOption[]
  label?: string
}>()

const model = defineModel<string>({ required: true })

// Tabs share the row equally, which lets the active indicator be positioned
// from the index alone — no DOM measuring, so it also renders correctly in
// the prerendered HTML.
const activeIndex = computed(() => {
  const index = props.options.findIndex((option) => option.value === model.value)
  return index < 0 ? 0 : index
})
</script>

<template>
  <div
    class="relative grid rounded-pill border border-border bg-surface-1 p-1"
    :style="{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }"
    role="radiogroup"
    :aria-label="label"
  >
    <span
      class="pointer-events-none absolute inset-y-1 left-1 rounded-pill bg-accent shadow-[0_6px_18px_-10px_var(--accent-glow)] transition-transform duration-300 ease-out motion-reduce:transition-none"
      :style="{
        width: `calc((100% - 0.5rem) / ${options.length})`,
        transform: `translateX(${activeIndex * 100}%)`,
      }"
      aria-hidden="true"
    />
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="relative z-10 rounded-pill px-3.5 py-1.5 text-caption font-semibold transition-colors duration-300"
      :class="
        model === option.value ? 'text-[color:var(--on-accent)]' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
      "
      role="radio"
      :aria-checked="model === option.value"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
