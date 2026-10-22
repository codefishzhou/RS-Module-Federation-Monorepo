<script setup lang="ts">
import { ACCEPTED_TYPES } from './compress'

const emit = defineEmits<{
  files: [files: File[]]
}>()

function onDrop(e: DragEvent) {
  e.preventDefault()
  const files = filterFiles(e.dataTransfer?.files)
  if (files.length) emit('files', files)
}

function onChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = filterFiles(input.files)
  if (files.length) emit('files', files)
  input.value = ''
}

function filterFiles(fileList?: FileList | null): File[] {
  if (!fileList) return []
  return Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type))
}
</script>

<template>
  <div class="dropzone" @dragover.prevent @drop="onDrop">
    <label class="dropzone__label">
      <span class="dropzone__icon">📷</span>
      <span class="dropzone__text">拖拽图片到这里，或点击选择</span>
      <span class="dropzone__hint">支持 PNG、JPEG、WebP</span>
      <input type="file" multiple :accept="ACCEPTED_TYPES.join(',')" class="dropzone__input" @change="onChange" />
    </label>
  </div>
</template>

<style scoped>
.dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
}
.dropzone:hover,
.dropzone:active {
  border-color: #6366f1;
  background: #f5f3ff;
}
.dropzone__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.dropzone__icon {
  font-size: 48px;
  line-height: 1;
}
.dropzone__text {
  font-size: 18px;
  font-weight: 500;
  color: #374151;
}
.dropzone__hint {
  font-size: 14px;
  color: #9ca3af;
}
.dropzone__input {
  display: none;
}
</style>
