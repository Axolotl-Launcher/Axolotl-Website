<script setup lang="ts">
import { twMerge } from 'tailwind-merge'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    to?: string
    href?: string
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    to: undefined,
    href: undefined,
    block: false,
  },
)

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-on-accent shadow-[0_10px_30px_-12px_var(--accent-glow)] hover:bg-accent-strong active:translate-y-px',
  secondary: 'border border-border bg-surface-1 text-fg hover:border-border-strong hover:bg-surface-2',
  ghost: 'text-fg-muted hover:bg-surface-2 hover:text-fg',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-caption',
  md: 'h-11 px-5 text-caption',
  lg: 'h-12 px-6 text-body',
}

const classes = computed(() =>
  twMerge(
    'inline-flex select-none items-center justify-center gap-2 rounded-btn font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50',
    variants[props.variant],
    sizes[props.size],
    props.block && 'w-full',
  ),
)
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes">
    <slot />
  </NuxtLink>
  <a v-else-if="href" :href="href" :class="classes" rel="noreferrer" target="_blank">
    <slot />
  </a>
  <button v-else :type="type" :class="classes">
    <slot />
  </button>
</template>
