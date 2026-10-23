<script setup lang="ts">
const model = defineModel<number>({ required: true })
</script>

<template>
  <div class="quality">
    <label class="quality__label">质量：<strong>{{ model }}%</strong></label>
    <input type="range" min="1" max="100" v-model.number="model" class="quality__range" />
  </div>
</template>

<style scoped>
.quality {
  display: flex;
  align-items: center;·
  gap: 12px;
}
.quality__label {
  font-size: 14px;
  color: #374151;
  white-space: nowrap;
}
.quality__range {
  width: 200px;
  accent-color: #6366f1;
}
</style>
