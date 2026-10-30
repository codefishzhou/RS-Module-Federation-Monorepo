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
const allDone = computed(
  () => items.value.length > 0 && items.value.every((i) => i.status === 'done'),
)

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
      <div>
        <span class="app__kicker">图像工作台</span>
        <h1>图片压缩</h1>
        <p>调整画质、对比结果，然后一次下载全部文件。</p>
      </div>
      <span class="app__privacy"><i aria-hidden="true" /> 仅在本地处理</span>
    </header>

    <div class="app__controls">
      <span class="app__controls-label">输出设置</span>
      <QualitySlider v-model="quality" />
    </div>

    <DropZone @files="onFiles" />

    <div v-if="hasItems" class="app__summary">
      <span><strong>{{ items.length }}</strong> 张图片</span>
      <span>原始 {{ formatFileSize(totalOriginal) }} / 压缩后
        {{ formatFileSize(totalCompressed) }}</span>
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
      <button class="app__batch-btn" @click="downloadAll">批量下载 ZIP</button>
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
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  min-width: 320px;
  margin: 0;
  background: #f3f5f2;
}
.app {
  width: min(100%, 960px);
  margin: 0 auto;
  padding: 40px clamp(20px, 5vw, 56px) 56px;
  font-family: 'Avenir Next', Avenir, 'Segoe UI', sans-serif;
  color: #18221f;
}
.app__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid #d7ddd9;
}
.app__header h1 {
  margin: 4px 0 7px;
  font-size: 36px;
  font-weight: 600;
  letter-spacing: 0;
}
.app__header p {
  margin: 0;
  color: #66736e;
  font-size: 14px;
  line-height: 1.5;
}
.app__kicker {
  color: #197052;
  font-family: SFMono-Regular, Consolas, monospace;
  font-size: 12px;
}
.app__privacy {
  display: inline-flex;
  min-height: 32px;
  flex: 0 0 auto;
  align-items: center;
  gap: 9px;
  border: 1px solid #b8c8c1;
  border-radius: 4px;
  padding: 0 11px;
  background: #e7f0eb;
  color: #11563e;
  font-size: 12px;
}
.app__privacy i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #57b78c;
}
.app__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 64px;
  margin-bottom: 14px;
  padding: 0 18px;
  border: 1px solid #d0d8d4;
  border-radius: 5px;
  background: #fff;
}
.app__controls-label {
  color: #66736e;
  font-size: 13px;
  font-weight: 600;
}
.app__summary {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 18px 0 10px;
  color: #66736e;
  font-size: 13px;
  flex-wrap: wrap;
}
.app__summary strong {
  color: #18221f;
  font-size: 16px;
}
.app__ratio {
  font-weight: 600;
  color: #197052;
}
.app__status {
  padding: 10px 0;
  color: #197052;
  font-size: 13px;
}
.app__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
.app__batch {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.app__batch-btn {
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid #11563e;
  border-radius: 4px;
  background: #11563e;
  color: #fff;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}
.app__batch-btn:hover {
  background: #0d4935;
}
.app__batch-btn--secondary {
  border-color: #bdc7c2;
  background: #fff;
  color: #39453f;
}
.app__batch-btn--secondary:hover {
  background: #e9eeeb;
}
.modal {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(12 19 16 / 82%);
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
  border: 1px solid rgb(255 255 255 / 45%);
  border-radius: 4px;
  background: rgb(12 19 16 / 72%);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid rgb(25 112 82 / 28%);
  outline-offset: 3px;
}
@media (max-width: 640px) {
  .app {
    padding-top: 26px;
  }
  .app__header {
    align-items: flex-start;
    flex-direction: column;
  }
  .app__header h1 {
    font-size: 30px;
  }
  .app__controls {
    align-items: flex-start;
    flex-direction: column;
    padding: 14px;
  }
  .app__batch {
    flex-direction: column;
  }
  .app__batch-btn {
    width: 100%;
  }
}
</style>
