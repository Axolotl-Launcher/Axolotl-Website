<script setup lang="ts">
import FluentIcon from './FluentIcon.vue'

/** Download panel for the illustrated browser. */
defineProps<{ title: string }>()
</script>

<template>
  <div class="edge-flyout">
    <span class="absolute top-[13px] left-4 text-[16px] leading-[22px] font-bold">
      {{ title }}
    </span>
    <FluentIcon name="folder" :size="16" class="flyout-icon left-[268px]" />
    <FluentIcon name="search" :size="16" class="flyout-icon left-[302px]" />
    <FluentIcon name="more" :size="16" class="flyout-icon left-[334px]" />
    <div class="absolute inset-x-0 top-[50px] h-px bg-[#4e364d]" />
    <slot />
  </div>
</template>

<style scoped>
.edge-flyout {
  position: absolute;
  z-index: 10;
  overflow: hidden;
  width: 360px;
  border: 1px solid #a66591;
  border-radius: 16px;
  background: #2d202f;
  color: #f7e9f3;
  font-size: 14px;
  box-shadow:
    0 8px 28px rgb(0 0 0 / 0.6),
    0 0 0 1px rgb(255 255 255 / 0.07);
}

.flyout-icon {
  position: absolute;
  top: 17px;
  color: #dcdcdc;
}
</style>
