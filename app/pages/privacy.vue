<script setup lang="ts">
const localePath = useLocalePath()
await navigateTo(localePath({ path: '/blog/privacy' }), { redirectCode: 301, replace: true })
</script>

<template>
  <div />
</template>
