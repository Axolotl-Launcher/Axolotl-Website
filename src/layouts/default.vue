<script setup lang="ts">
import AxolotlFooter from '~/components/ui/AxolotlFooter.vue'
import AxolotlHeader from '~/components/ui/AxolotlHeader.vue'
import SiteSettingsModal from '~/components/ui/SiteSettingsModal.vue'

const settingsOpen = ref(false)
</script>

<template>
    <div class="site-layout">
        <AxolotlHeader @open-settings="settingsOpen = true" />
        <main id="main">
            <slot />
        </main>
        <AxolotlFooter />
        <SiteSettingsModal v-model="settingsOpen" />
    </div>
</template>

<style lang="scss">
@import '~/assets/styles/site.scss';
</style>
