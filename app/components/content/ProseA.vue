<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    href?: string
    target?: string
  }>(),
  { href: '', target: undefined },
)

const icon = computed(() => {
  if (props.href.startsWith('mailto:')) return 'lucide:mail'
  if (/^(?:https?:)?\/\//i.test(props.href)) return 'lucide:arrow-up-right'
  return 'lucide:arrow-right'
})
</script>

<template>
  <NuxtLink :href="props.href" :target="props.target" class="prose-link">
    <Icon :name="icon" class="me-1 align-[-0.125em]" aria-hidden="true" />
    <slot />
  </NuxtLink>
</template>
