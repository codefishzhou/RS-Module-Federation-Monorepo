<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  originalUrl: string
  compressedUrl: string
  name: string
}>()

const position = ref(50)
const isDragging = ref(false)
const container = ref<HTMLElement>()

function onMove(clientX: number) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  const x = clientX - rect.left
  position.value = Math.max(0, Math.min(100, (x / rect.width) * 100))
}

function onPointerDown(e: PointerEvent) {
  isDragging.value = true
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  onMove(e.clientX)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  onMove(e.clientX)
}

function onPointerUp() {
  isDragging.value = false
}
</script>

<template>
  <div class="compare" ref="container" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp">
    <img class="compare__img compare__img--original" :src="originalUrl" :alt="name" draggable="false" />
    <div class="compare__overlay" :style="{ width: position + '%' }">
      <img class="compare__img" :src="compressedUrl" :alt="name" draggable="false" />
    </div>
    <div class="compare__slider" :style="{ left: position + '%' }" />
    <span class="compare__label compare__label--left">压缩后</span>
    <span class="compare__label compare__label--right">原图</span>
  </div>
</template>

<style scoped>
.compare {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  cursor: ew-resize;
  user-select: none;
  touch-action: none;
  line-height: 0;
}
.compare__img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
}
.compare__overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  overflow: hidden;
}
.compare__overlay .compare__img {
  width: v-bind("container ? container.offsetWidth + 'px' : '100%'");
  height: auto;
  max-height: 70vh;
  object-fit: contain;
}
.compare__slider {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
.compare__label {
  position: absolute;
  bottom: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  pointer-events: none;
}
.compare__label--left {
  left: 12px;
}
.compare__label--right {
  right: 12px;
}
</style>
