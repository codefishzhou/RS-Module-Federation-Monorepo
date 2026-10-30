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
      <span class="dropzone__icon" aria-hidden="true"><i /></span>
      <span class="dropzone__text">拖入图片，或从设备选择</span>
      <span class="dropzone__hint">PNG、JPEG、WebP · 支持多选</span>
      <input
        type="file"
        multiple
        :accept="ACCEPTED_TYPES.join(',')"
        class="dropzone__input"
        @change="onChange"
      >
    </label>
  </div>
</template>

<style scoped>
.dropzone {
  border: 1px dashed #8fa39a;
  border-radius: 5px;
  padding: 44px 24px;
  background: #fff;
  text-align: center;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.dropzone:hover,
.dropzone:active {
  border-color: #197052;
  background: #edf3f0;
}
.dropzone__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.dropzone__icon {
  position: relative;
  display: block;
  width: 48px;
  height: 38px;
  margin-bottom: 5px;
  border: 1px solid #7c9188;
  border-radius: 4px;
}
.dropzone__icon::before {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d99124;
  content: '';
}
.dropzone__icon::after {
  position: absolute;
  right: 7px;
  bottom: 7px;
  left: 7px;
  height: 15px;
  border-right: 1px solid #197052;
  border-bottom: 1px solid #197052;
  transform: skew(-28deg);
  content: '';
}
.dropzone__text {
  color: #26332e;
  font-size: 16px;
  font-weight: 600;
}
.dropzone__hint {
  color: #74817c;
  font-size: 12px;
}
.dropzone__input {
  display: none;
}
</style>
