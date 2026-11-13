<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), {
  compact: false,
})

const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath({ path: '/' })"
    class="group inline-flex items-center gap-2.5"
    aria-label="Axolotl Launcher"
  >
    <NuxtImg
      src="/axolotl.png"
      alt=""
      width="30"
      height="30"
      class="size-[30px] transition-transform duration-500 ease-spring group-hover:-rotate-6"
    />
    <span v-if="!compact" class="text-[0.95rem] font-bold tracking-tight text-heading">Axolotl</span>
  </NuxtLink>
</template>
