<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { useId } from 'vue'
import type { DownloadSource } from '~/utils/download-sources'

interface DownloadSourceOption {
  value: DownloadSource
  label: string
  description: string
  meta?: string
  unavailable?: boolean
}

const props = defineProps<{
  modelValue: DownloadSource
  options: DownloadSourceOption[]
  label: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: DownloadSource] }>()

const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const list = ref<HTMLElement | null>(null)
const open = ref(false)
const activeIndex = ref(0)
const id = useId()

const selectedIndex = computed(() => props.options.findIndex((option) => option.value === props.modelValue))
const selected = computed(() => props.options[selectedIndex.value] ?? props.options[0])

function optionId(index: number) {
  return `${id}-option-${index}`
}

function openMenu() {
  if (open.value) return
  open.value = true
  activeIndex.value = Math.max(0, selectedIndex.value)
  nextTick(() => list.value?.focus())
}

function closeMenu(refocus = false) {
  open.value = false
  if (refocus) trigger.value?.focus()
}

function select(option: DownloadSourceOption) {
  if (option.unavailable) return
  emit('update:modelValue', option.value)
  closeMenu(true)
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openMenu()
  }
}

function onListKeydown(event: KeyboardEvent) {
  const count = props.options.length
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu(true)
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % count
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + count) % count
    return
  }
  if (event.key === 'Home') {
    event.preventDefault()
    activeIndex.value = 0
    return
  }
  if (event.key === 'End') {
    event.preventDefault()
    activeIndex.value = count - 1
    return
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const option = props.options[activeIndex.value]
    if (option) select(option)
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!open.value) return
  if (!root.value?.contains(event.target as Node)) closeMenu()
}

useEventListener('pointerdown', onDocumentPointerDown)
</script>

<template>
  <div ref="root" class="relative">
    <span :id="`${id}-label`" class="text-caption font-semibold">{{ props.label }}</span>
    <button
      ref="trigger"
      type="button"
      class="mt-2 flex h-11 w-full items-center justify-between gap-3 rounded-btn border border-border bg-surface-2 px-3 text-left text-caption text-fg transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-labelledby="`${id}-label`"
      @click="open ? closeMenu() : openMenu()"
      @keydown="onTriggerKeydown"
    >
      <span class="flex min-w-0 items-center gap-2">
        <span class="truncate font-semibold">{{ selected?.label }}</span>
        <span v-if="selected?.meta" class="truncate text-micro font-normal text-fg-subtle">
          {{ selected.meta }}
        </span>
      </span>
      <Icon
        name="lucide:chevron-down"
        class="size-4 shrink-0 text-fg-subtle transition-transform"
        :class="{ 'rotate-180': open }"
        aria-hidden="true"
      />
    </button>

    <AnimatePresence>
      <Motion
        v-if="open"
        :initial="{ opacity: 0, y: -4 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -4 }"
        :transition="{ duration: 0.14, ease: 'easeOut' }"
        class="absolute inset-x-0 z-30 mt-2 overflow-hidden rounded-card border border-border bg-surface-1 p-1 shadow-raised"
      >
        <ul
          ref="list"
          role="listbox"
          tabindex="-1"
          class="max-h-72 overflow-y-auto outline-none"
          :aria-labelledby="`${id}-label`"
          :aria-activedescendant="optionId(activeIndex)"
          @keydown="onListKeydown"
        >
          <li
            v-for="(option, index) in props.options"
            :id="optionId(index)"
            :key="option.value"
            role="option"
            :aria-selected="option.value === props.modelValue"
            :aria-disabled="option.unavailable || undefined"
            class="relative rounded-[0.65rem] px-3 py-2.5 transition-colors"
            :class="[
              option.unavailable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
              index === activeIndex
                ? 'bg-accent/10 before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-accent before:content-[\'\']'
                : '',
            ]"
            @click="select(option)"
            @mouseenter="activeIndex = index"
          >
            <span class="flex items-center justify-between gap-3">
              <span class="flex min-w-0 items-center gap-1.5 text-caption font-semibold">
                <Icon
                  v-if="option.value === props.modelValue"
                  name="lucide:check"
                  class="size-3.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span class="truncate">{{ option.label }}</span>
              </span>
              <span v-if="option.meta" class="shrink-0 text-micro text-fg-subtle">
                {{ option.meta }}
              </span>
            </span>
            <span class="mt-0.5 block text-caption leading-relaxed text-fg-subtle">
              {{ option.description }}
            </span>
          </li>
        </ul>
      </Motion>
    </AnimatePresence>
  </div>
</template>
