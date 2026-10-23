<script setup lang="ts">
import { ref, computed } from 'vue'
import { compress, formatFileSize, compressionRatio, type OutputFormat } from './compress'
import DropZone from './DropZone.vue'
import ImageCard from './ImageCard.vue'
import CompareSlider from './CompareSlider.vue'
import QualitySlider from './QualitySlider.vue'

interface ImageItem {
  id: number
  file: File
  name: string
  originalSize: number
  compressedSize: number
  originalUrl: string
  compressedUrl: string
  format: OutputFormat
  width: number
  height: number
  status: 'pending' | 'compressing' | 'done' | 'error'
  error?: string
}

let nextId = 0
const items = ref<ImageItem[]>([])
const quality = ref(75)
const compareIndex = ref<number | null>(null)
const isCompressing = ref(false)

const totalOriginal = computed(() => items.value.reduce((s, i) => s + i.originalSize, 0))
const totalCompressed = computed(() => items.value.reduce((s, i) => s + i.compressedSize, 0))
const hasItems = computed(() => items.value.length > 0)
const allDone = computed(() => items.value.length > 0 && items.value.every((i) => i.status === 'done'))

async function onFiles(files: File[]) {
  const newItems: ImageItem[] = files.map((file) => ({
    id: nextId++,
    file,
    name: file.name,
    originalSize: file.size,
    compressedSize: 0,
    originalUrl: URL.createObjectURL(file),
    compressedUrl: '',
    format: 'jpeg',
    width: 0,
    height: 0,
    status: 'pending',
  }))
  items.value.push(...newItems)
  await compressAll()
}

async function compressAll() {
  isCompressing.value = true
  const pending = items.value.filter((i) => i.status === 'pending' || i.status === 'error')

  for (const item of pending) {
    item.status = 'compressing'
    try {
      const result = await compress(item.file, { quality: quality.value })
      item.compressedSize = result.blob.size
      item.compressedUrl = URL.createObjectURL(result.blob)
      item.format = result.format
      item.width = result.width
      item.height = result.height
      item.status = 'done'
    } catch (e) {
      item.status = 'error'
      item.error = String(e)
    }
  }
  isCompressing.value = false
}

function removeItem(id: number) {
  const idx = items.value.findIndex((i) => i.id === id)
  if (idx < 0) return
  const item = items.value[idx]
  URL.revokeObjectURL(item.originalUrl)
  if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl)
  items.value.splice(idx, 1)
  if (compareIndex.value === idx) compareIndex.value = null
  else if (compareIndex.value !== null && compareIndex.value > idx) compareIndex.value--
}

function clearAll() {
  for (const item of items.value) {
    URL.revokeObjectURL(item.originalUrl)
    if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl)
  }
  items.value = []
  compareIndex.value = null
}

function openCompare(id: number) {
  compareIndex.value = items.value.findIndex((i) => i.id === id)
}

function closeCompare() {
  compareIndex.value = null
}

const compareItem = computed(() => {
  if (compareIndex.value === null) return null
  return items.value[compareIndex.value]
})

function getOutputName(item: ImageItem): string {
  const ext = item.format === 'jpeg' ? 'jpg' : item.format
  const base = item.name.replace(/\.[^.]+$/, '')
  return `${base}.${ext}`
}

async function downloadAll() {
  const JSZip = (await import('jszip')).default
  const { saveAs } = await import('file-saver')
  const zip = new JSZip()
  const done = items.value.filter((i) => i.status === 'done')
  for (const item of done) {
    const resp = await fetch(item.compressedUrl)
    zip.file(getOutputName(item), await resp.arrayBuffer())
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, 'compressed-images.zip')
}
</script>

<template>
  <div class="app">
    <header class="app__header">
      <h1>📷 图片压缩</h1>
      <p>在浏览器本地压缩图片，数据不会上传到服务器</p>
    </header>

    <div class="app__controls">
      <QualitySlider v-model="quality" />
    </div>

    <DropZone @files="onFiles" />

    <div v-if="hasItems" class="app__summary">
      <span>共 {{ items.length }} 张</span>
      <span>原始 {{ formatFileSize(totalOriginal) }} → 压缩后 {{ formatFileSize(totalCompressed) }}</span>
      <span v-if="totalOriginal > 0" class="app__ratio">
        节省 {{ compressionRatio(totalOriginal, totalCompressed) }}
      </span>
    </div>

    <div v-if="isCompressing" class="app__status">压缩中…</div>

    <div v-if="hasItems" class="app__list">
      <ImageCard
        v-for="item in items"
        :key="item.id"
        :name="item.name"
        :original-size="item.originalSize"
        :compressed-size="item.compressedSize"
        :original-url="item.originalUrl"
        :compressed-url="item.compressedUrl"
        :format="item.format"
        :width="item.width"
        :height="item.height"
        @compare="openCompare(item.id)"
        @remove="removeItem(item.id)"
      />
    </div>

    <div v-if="allDone" class="app__batch">
      <button class="app__batch-btn" @click="downloadAll">📦 批量下载 ZIP</button>
      <button class="app__batch-btn app__batch-btn--secondary" @click="clearAll">清空</button>
    </div>

    <Teleport to="body">
      <div v-if="compareItem" class="modal" @click.self="closeCompare">
        <div class="modal__content">
          <CompareSlider
            :original-url="compareItem.originalUrl"
            :compressed-url="compareItem.compressedUrl"
            :name="compareItem.name"
          />
          <button class="modal__close" @click="closeCompare">✕</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: #1f2937;
}
.app__header {
  text-align: center;
  margin-bottom: 24px;
}
.app__header h1 {
  font-size: 28px;
  margin: 0 0 4px;
}
.app__header p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}
.app__controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.app__summary {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 16px 0;
  font-size: 14px;
  color: #6b7280;
  flex-wrap: wrap;
}
.app__ratio {
  font-weight: 600;
  color: #059669;
}
.app__status {
  text-align: center;
  padding: 8px;
  font-size: 14px;
  color: #6366f1;
}
.app__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
.app__batch {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
.app__batch-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #6366f1;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.app__batch-btn:hover {
  background: #4f46e5;
}
.app__batch-btn--secondary {
  background: #e5e7eb;
  color: #374151;
}
.app__batch-btn--secondary:hover {
  background: #d1d5db;
}
.modal {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
}
.modal__content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}
.modal__close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}
</style>
