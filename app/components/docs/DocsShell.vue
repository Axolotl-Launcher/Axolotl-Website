<script setup lang="ts">
interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

defineProps<{ toc?: TocLink[] }>()
</script>

<template>
  <div class="site-container py-10 sm:py-14">
    <div
      class="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_14rem] xl:gap-12"
    >
      <DocsSidebar />
      <div class="min-w-0">
        <slot />
      </div>
      <DocsToc v-if="toc?.length" :links="toc" class="hidden xl:block" />
    </div>
  </div>
</template>
