<script setup lang="ts">
import { FLUENT_ICONS, type FluentIconName } from './fluent-icons'

const props = withDefaults(defineProps<{ name: FluentIconName; size?: number }>(), {
    size: undefined,
})

const icon = computed(() => FLUENT_ICONS[props.name])
const style = computed(() => {
    const size = `${props.size ?? icon.value.size}px`
    return { width: size, height: size }
})
</script>

<template>
    <svg :viewBox="`0 0 ${icon.size} ${icon.size}`" :style="style" fill="currentColor">
        <path v-for="(path, index) in icon.paths" :key="index" :d="path" />
    </svg>
</template>
