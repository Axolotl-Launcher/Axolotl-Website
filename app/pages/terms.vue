<script setup lang="ts">
const localePath = useLocalePath()
await navigateTo(localePath({ path: '/blog/terms' }), { redirectCode: 301, replace: true })
</script>

<template>
  <div />
</template>
