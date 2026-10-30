<script setup lang="ts">
const model = defineModel<number>({ required: true })
</script>

<template>
  <div class="quality">
    <label class="quality__label" for="quality-range">图片质量 <strong>{{ model }}%</strong></label>
    <input
      id="quality-range"
      v-model.number="model"
      type="range"
      min="1"
      max="100"
      class="quality__range"
    >
  </div>
</template>

<style scoped>
.quality {
  display: flex;
  align-items: center;
  gap: 12px;
}
.quality__label {
  color: #39453f;
  font-size: 13px;
  white-space: nowrap;
}
.quality__label strong {
  margin-left: 5px;
  color: #11563e;
  font-family: SFMono-Regular, Consolas, monospace;
}
.quality__range {
  width: 200px;
  accent-color: #197052;
}
@media (max-width: 480px) {
  .quality {
    width: 100%;
  }
  .quality__range {
    width: 100%;
  }
}
</style>
