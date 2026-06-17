<script lang="ts">
  export let status: "ready" | "blocked" | "pending" = "pending";
  export let reducedMotion: boolean = false;

  $: motionClass = reducedMotion ? "motion-reduced" : "motion-cinematic";
  $: label = `SEIS release status: ${status}`;
</script>

<div class="seis-release {motionClass}" role="status" aria-label={label}>
  <span>{status}</span>
</div>

<style>
  .seis-release { transition: opacity 0.3s ease; }
  .motion-reduced { transition: none; }
</style>
