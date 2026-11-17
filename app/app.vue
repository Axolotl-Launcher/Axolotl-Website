<script setup lang="ts">
const config = useRuntimeConfig()
const umami = config.public.umami

// Cookie-less page-view analytics. The snippet is only emitted when a website
// id is configured and never in development, so local consoles stay clean.
useHead({
  script:
    !import.meta.dev && umami?.enabled && umami.websiteId
      ? [
          {
            src: umami.scriptUrl,
            defer: true,
            'data-website-id': umami.websiteId,
          },
        ]
      : [],
})

// Smooth scrolling is provided by nuxt-lenis. Anchors keep in-page links
// working, and Lenis honors prefers-reduced-motion by default.
const lenisOptions = {
  autoRaf: true,
  anchors: true,
  lerp: 0.1,
}

// Give every page a generated OG image; article pages still override it with
// their own cover through useSeoMeta.
defineOgImageComponent('Default')
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
