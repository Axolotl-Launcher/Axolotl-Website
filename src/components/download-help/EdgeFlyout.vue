<script setup lang="ts">
import FluentIcon from './FluentIcon.vue'

/** Edge's Downloads flyout in the dark theme: 360 px wide, header row 50 px. */
defineProps<{ title: string }>()
</script>

<template>
    <div class="edge-flyout">
        <span class="absolute left-4 top-[13px] text-[16px] font-bold leading-[22px]">
            {{ title }}
        </span>
        <FluentIcon name="folder" :size="16" class="flyout-icon left-[268px]" />
        <FluentIcon name="search" :size="16" class="flyout-icon left-[302px]" />
        <FluentIcon name="more" :size="16" class="flyout-icon left-[334px]" />
        <div class="absolute inset-x-0 top-[50px] h-px bg-[#353535]" />
        <slot />
    </div>
</template>

<style scoped lang="scss">
.edge-flyout {
    position: absolute;
    z-index: 10;
    overflow: hidden;
    width: 360px;
    border-radius: 12px;
    background: #242424;
    color: #f0f0f0;
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
