<script setup lang="ts">
// Smooth scrolling is provided by nuxt-lenis. Anchors keep in-page links
// working, and Lenis honors prefers-reduced-motion by default.
const lenisOptions = {
  autoRaf: true,
  anchors: true,
  lerp: 0.1,
}
</script>

<template>
  <NuxtLoadingIndicator color="var(--accent)" :height="2" />
  <NuxtRouteAnnouncer />
  <MotionConfig reduced-motion="user">
    <Lenis :options="lenisOptions">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Lenis>
  </MotionConfig>
</template>
