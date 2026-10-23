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

const emit = defineEmits<{
  compare: []
  remove: []
}>()

const ratio = computed(() => compressionRatio(props.originalSize, props.compressedSize))
const saved = computed(() => props.originalSize - props.compressedSize)
const isSmaller = computed(() => props.compressedSize < props.originalSize)
const downloadName = computed(() => {
  const ext = props.format === 'jpeg' ? 'jpg' : props.format
  return props.name.replace(/\.[^.]+$/, '') + '.' + ext
})
</script>

<template>
  <div class="card">
    <div class="card__thumb" @click="$emit('compare')">
      <img :src="compressedUrl" :alt="name" loading="lazy" />
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
      <button class="card__btn card__btn--compare" @click="$emit('compare')" title="对比">⇔</button>
      <button class="card__btn card__btn--remove" @click="$emit('remove')" title="移除">✕</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.card__thumb {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #f9fafb;
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
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card__size {
  font-size: 13px;
  color: #6b7280;
}
.card__arrow {
  margin: 0 4px;
  color: #9ca3af;
}
.card__compressed {
  font-weight: 600;
  color: #059669;
}
.card__compressed--larger {
  color: #dc2626;
}
.card__ratio {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.card__badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  background: #d1fae5;
  color: #059669;
  font-weight: 600;
  font-size: 11px;
}
.card__badge--warn {
  background: #fee2e2;
  color: #dc2626;
}
.card__meta {
  color: #9ca3af;
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
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  color: #374151;
}
.card__btn:hover {
  background: #f3f4f6;
}
</style>
