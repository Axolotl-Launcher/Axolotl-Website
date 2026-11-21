<script setup lang="ts">
// A footer community entry: the brand mark links straight to the channel, and
// hovering or keyboard-focusing it reveals the channel's QR code in place.
defineProps<{
  label: string
  icon: string
  href: string
}>()
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="group relative grid size-9 place-items-center rounded-btn border border-border text-fg-muted transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    :aria-label="label"
  >
    <NuxtIcon :name="icon" class="text-[1.25rem] leading-none" aria-hidden="true" />

    <span
      aria-hidden="true"
      class="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-2 w-max rounded-card border border-border bg-surface-1 p-2 opacity-0 shadow-floating transition-[opacity,visibility] duration-150 ease-out group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100 motion-reduce:transition-none"
    >
      <span class="block rounded-btn bg-white p-1.5">
        <Qrcode :value="href" width="104" />
      </span>
      <span class="mt-1.5 block w-[7.5rem] text-center text-micro leading-snug text-fg-muted">{{ label }}</span>
    </span>
  </a>
</template>
