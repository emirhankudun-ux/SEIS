<template>
  <div :class="['seis-release', motionClass]" role="status" :aria-label="label">
    <span>{{ status }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type ReleaseStatus = "ready" | "blocked" | "pending";

const props = defineProps<{
  status: ReleaseStatus;
  reducedMotion?: boolean;
}>();

const motionClass = computed(() =>
  props.reducedMotion ? "motion-reduced" : "motion-cinematic"
);

const label = computed(() => `SEIS release status: ${props.status}`);
</script>

<style scoped>
.seis-release { transition: opacity 0.3s ease; }
.motion-reduced { transition: none; }
</style>
