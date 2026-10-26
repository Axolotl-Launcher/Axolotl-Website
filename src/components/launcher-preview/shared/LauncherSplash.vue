<script setup lang="ts">
import Button from '@modrinth/ui/src/components/base/buttons/Button.vue'
import ProgressBar from '@modrinth/ui/src/components/base/ProgressBar.vue'

import axolotlLogo from '../screens/settings/categories/updates/splash/axolotl.webp'
import cubeBackground from '../screens/settings/categories/updates/splash/cube.webp'

withDefaults(
    defineProps<{
        progress: number
        loadingLabel?: string
        failed?: boolean
        failureLabel?: string
        retryLabel?: string
    }>(),
    { loadingLabel: '', failed: false, failureLabel: '', retryLabel: '' },
)

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
    <div
        class="dark-mode absolute inset-0 isolate overflow-hidden rounded-[inherit] bg-surface-1 text-[var(--color-text-primary)] [container-type:inline-size]"
        :aria-busy="!failed"
    >
        <!-- An image rather than a CSS background, so the server-rendered hero requests
             it while the HTML parses: it is the page's largest paint. The cube is flattened
             onto this surface's dark #101215 (no alpha, 1024px wide) so it decodes in time
             for the first frame. -->
        <img
            :src="cubeBackground"
            alt=""
            aria-hidden="true"
            draggable="false"
            fetchpriority="high"
            class="pointer-events-none absolute left-1/2 top-1/2 h-[180%] w-[180%] max-w-none -translate-x-1/2 -translate-y-1/2 bg-surface-1 object-contain opacity-80"
        />
        <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,77,157,0.24)_0%,rgba(48,16,40,0.56)_97.29%),linear-gradient(0deg,rgba(22,18,28,0.68),rgba(22,18,28,0.68))]"
        />
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-[1.25cqw]">
            <img
                :src="axolotlLogo"
                alt="Axolotl Launcher"
                draggable="false"
                decoding="async"
                class="aspect-square w-[22.5%] object-contain"
            />
            <template v-if="failed">
                <p
                    v-if="failureLabel"
                    role="alert"
                    class="m-0 max-w-[80%] text-center text-[1.25cqw]"
                >
                    {{ failureLabel }}
                </p>
                <Button v-if="retryLabel" @click="emit('retry')">{{ retryLabel }}</Button>
            </template>
            <ProgressBar
                v-else
                class="!w-[18.75%] !max-w-none [&>[role=progressbar]]:h-[0.625cqw]"
                :progress="progress"
                :max="100"
                color="green"
                :aria-label="loadingLabel"
            />
        </div>
    </div>
</template>
