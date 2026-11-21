<script setup lang="ts">
import FluentIcon from './FluentIcon.vue'

/** Illustrated browser chrome. The scene supplies hover and download states. */
withDefaults(
  defineProps<{
    tabTitle: string
    /** The Downloads button: shown once something has been downloaded. */
    downloads?: 'hidden' | 'shown' | 'open' | 'warning'
    /** 0…1 while a download runs, drawn as the ring around the Downloads button. */
    progress?: number | null
    hover?: string
    pressed?: string
    /** The omnibox while it has focus: the text in it and how it shows. */
    omnibox?: { text: string; selected?: boolean; caret?: boolean; suggestion?: boolean } | null
  }>(),
  { downloads: 'hidden', progress: null, hover: undefined, pressed: undefined, omnibox: null },
)
</script>

<template>
  <div class="edge-window">
    <div class="absolute inset-x-0 top-0 h-10 bg-[#241824]">
      <div class="edge-tab">
        <img src="/axolotl.png" alt="" class="size-4 shrink-0 object-contain" />
        <span class="edge-tab-title">{{ tabTitle }}</span>
        <FluentIcon name="dismiss" :size="10" class="mx-1 shrink-0 text-[#cfcfcf]" />
      </div>
      <span
        class="edge-caption right-[92px]"
        :class="{ 'bg-white/10': hover === 'edge-minimize' }"
        data-target="edge-minimize"
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M0 5.5h10" stroke="#e6e6e6" />
        </svg>
      </span>
      <span class="edge-caption right-[46px]">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M2.5.5h6a1 1 0 0 1 1 1v6M.5 2.5h7v7h-7z" fill="none" stroke="#e6e6e6" />
        </svg>
      </span>
      <span class="edge-caption right-0">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M.5.5l9 9M9.5.5l-9 9" stroke="#e6e6e6" />
        </svg>
      </span>
    </div>

    <div class="absolute inset-x-0 top-10 h-10">
      <span class="edge-button left-1 text-[#7d7d7d]">
        <FluentIcon name="back" :size="16" />
      </span>
      <span class="edge-button left-10" :class="{ 'bg-white/10': hover === 'edge-refresh' }">
        <FluentIcon name="refresh" :size="16" />
      </span>
      <div
        class="absolute top-[5px] left-[77px] flex h-[30px] items-center rounded-[15px] bg-[#2d202f] pl-[31px] text-[14px] text-[#e8e8e8]"
        :class="[
          downloads === 'hidden' ? 'right-[120px]' : 'right-[156px]',
          { 'bg-[#3a293b]': hover === 'edge-address' && !omnibox },
        ]"
        data-target="edge-address"
      >
        <FluentIcon name="lock" :size="13" class="absolute top-2 left-[11px] text-[#c6c6c6]" />
        <span class="min-w-0 flex-1 truncate pr-9 leading-[30px] whitespace-pre">
          <template v-if="omnibox">
            <span :class="{ 'bg-[#69364f]': omnibox.selected }">{{ omnibox.text }}</span>
            <span v-if="omnibox.caret" class="ml-px inline-block h-4 w-px translate-y-[3px] bg-[#f2f2f2]" />
          </template>
          <slot v-else name="address" />
        </span>
        <FluentIcon name="star" :size="14" class="absolute top-2 right-[13px] text-[#cfcfcf]" />
      </div>
      <div
        v-if="omnibox?.suggestion"
        class="absolute top-[37px] left-[73px] z-20 overflow-hidden rounded-lg bg-[#402d41] py-1 shadow-[0_8px_24px_rgb(0_0_0/0.5),0_0_0_1px_rgb(255_255_255/0.07)]"
        :class="downloads === 'hidden' ? 'right-[116px]' : 'right-[152px]'"
      >
        <div class="mx-1 flex h-9 items-center gap-3 rounded-md bg-[#503951] px-3 text-[14px]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#cfcfcf">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M1.5 8h13M8 1.5c-2.2 2.2-2.2 10.8 0 13M8 1.5c2.2 2.2 2.2 10.8 0 13" />
          </svg>
          <span class="truncate text-[#f2f2f2]">{{ omnibox.text }}</span>
        </div>
      </div>
      <span class="edge-button" :class="downloads === 'hidden' ? 'right-20' : 'right-[116px]'">
        <FluentIcon name="favorites" :size="16" />
      </span>
      <span
        v-if="downloads !== 'hidden'"
        class="edge-button right-20"
        :class="{
          'bg-[#654260]': downloads === 'open' || downloads === 'warning',
          'bg-white/10': hover === 'edge-downloads' && downloads === 'shown',
        }"
        data-target="edge-downloads"
      >
        <FluentIcon name="download" :size="16" />
        <svg v-if="progress !== null" class="absolute top-px left-px" width="30" height="30" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12.5" fill="none" stroke="#4a4a4a" stroke-width="2" />
          <circle
            cx="15"
            cy="15"
            r="12.5"
            fill="none"
            stroke="#f6a4cc"
            stroke-width="2"
            :stroke-dasharray="`${(progress * 78.5).toFixed(1)} 79`"
            transform="rotate(-90 15 15)"
          />
        </svg>
        <FluentIcon
          v-if="downloads === 'warning'"
          name="warning"
          :size="10"
          class="absolute right-[5px] bottom-[5px] text-[#fc8b3a]"
        />
      </span>
      <span class="edge-button right-11">
        <span class="flex size-6 items-center justify-center rounded-full bg-[#69455c] text-[#d4d4d4]">
          <FluentIcon name="person" :size="13" />
        </span>
      </span>
      <span class="edge-button right-2">
        <FluentIcon name="more" :size="16" />
      </span>
    </div>

    <div class="absolute top-20 right-1 bottom-1 left-1 overflow-hidden rounded-lg">
      <slot name="page" />
    </div>
    <slot />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.edge-window {
  position: absolute;
  overflow: hidden;
  border: 2px solid #c87fac;
  border-radius: 18px;
  background: #352435;
  color: #e8e8e8;
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.1),
    0 20px 50px rgb(0 0 0 / 0.55);
}

.edge-tab {
  @apply absolute top-1 left-3 flex h-8 w-[239px] items-center gap-2 overflow-hidden rounded-full bg-[#352435] pr-2 pl-3 text-[12px] whitespace-nowrap text-white;
}

.edge-tab-title {
  @apply min-w-0 flex-1 overflow-hidden;

  mask-image: linear-gradient(90deg, #000 calc(100% - 26px), transparent);
}

.edge-caption {
  @apply absolute top-0 flex h-10 w-[46px] items-center justify-center;
}

.edge-button {
  @apply absolute top-1 flex size-8 items-center justify-center rounded-md text-[#dcdcdc];
}
</style>
