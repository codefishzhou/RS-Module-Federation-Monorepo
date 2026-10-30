<script setup lang="ts">
import { computed } from 'vue'
import { formatFileSize, compressionRatio, type OutputFormat } from './compress'

const props = defineProps<{
  name: string
  originalSize: number
  compressedSize: number
  originalUrl: string
  compressedUrl: string
  format: OutputFormat
  width: number
  height: number
}>()

defineEmits<{
  compare: []
  remove: []
}>()

const ratio = computed(() => compressionRatio(props.originalSize, props.compressedSize))
const isSmaller = computed(() => props.compressedSize < props.originalSize)
const downloadName = computed(() => {
  const ext = props.format === 'jpeg' ? 'jpg' : props.format
  return props.name.replace(/\.[^.]+$/, '') + '.' + ext
})
</script>

<template>
  <div class="card">
    <div class="card__thumb" @click="$emit('compare')">
      <img :src="compressedUrl" :alt="name" loading="lazy">
    </div>
    <div class="card__info">
      <p class="card__name" :title="name">{{ name }}</p>
      <p class="card__size">
        <span>{{ formatFileSize(originalSize) }}</span>
        <span class="card__arrow">→</span>
        <span :class="['card__compressed', { 'card__compressed--larger': !isSmaller }]">
          {{ formatFileSize(compressedSize) }}
        </span>
      </p>
      <p class="card__ratio">
        <span v-if="isSmaller" class="card__badge">↓ {{ ratio }}</span>
        <span v-else class="card__badge card__badge--warn">↑ {{ ratio }}</span>
        <span class="card__meta">{{ width }}×{{ height }} · {{ format.toUpperCase() }}</span>
      </p>
    </div>
    <div class="card__actions">
      <a :href="compressedUrl" :download="downloadName" class="card__btn" title="下载">⬇</a>
      <button class="card__btn card__btn--compare" title="对比" @click="$emit('compare')">⇔</button>
      <button class="card__btn card__btn--remove" title="移除" @click="$emit('remove')">✕</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px;
  border: 1px solid #d0d8d4;
  border-radius: 5px;
  background: #fff;
}
.card__thumb {
  width: 68px;
  height: 68px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #e9eeeb;
}
.card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card__info {
  flex: 1;
  min-width: 0;
}
.card__name {
  margin: 0 0 7px;
  font-size: 14px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card__size {
  margin: 0 0 6px;
  font-size: 13px;
  color: #66736e;
}
.card__arrow {
  margin: 0 4px;
  color: #9aa59f;
}
.card__compressed {
  font-weight: 600;
  color: #197052;
}
.card__compressed--larger {
  color: #dc2626;
}
.card__ratio {
  margin: 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.card__badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  background: #e4f1eb;
  color: #197052;
  font-weight: 600;
  font-size: 11px;
}
.card__badge--warn {
  background: #f8e8e6;
  color: #a82e25;
}
.card__meta {
  color: #7d8984;
}
.card__actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.card__btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd4d0;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  color: #39453f;
}
.card__btn:hover {
  border-color: #8fa39a;
  background: #edf3f0;
}
@media (max-width: 560px) {
  .card {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .card__info {
    width: calc(100% - 82px);
    flex: 0 0 calc(100% - 82px);
  }
  .card__actions {
    width: 100%;
    justify-content: flex-end;
    border-top: 1px solid #e3e8e5;
    padding-top: 10px;
  }
}
</style>
