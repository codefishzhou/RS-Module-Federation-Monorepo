import { encode as encodeJpeg } from '@jsquash/jpeg'
import { optimise as optimisePng } from '@jsquash/oxipng'
import { encode as encodeWebp } from '@jsquash/webp'
import resize from '@jsquash/resize'

export type OutputFormat = 'jpeg' | 'png' | 'webp'

export interface CompressOptions {
  quality: number // 1-100
  maxWidth?: number
  maxHeight?: number
}

export interface CompressResult {
  blob: Blob
  width: number
  height: number
  format: OutputFormat
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function loadImage(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const data = ctx.getImageData(0, 0, bitmap.width, bitmap.height)
  bitmap.close()
  return data
}

async function maybeResize(
  data: ImageData,
  maxWidth?: number,
  maxHeight?: number,
): Promise<ImageData> {
  const { width, height } = data
  if (!maxWidth && !maxHeight) return data

  const scaleW = maxWidth ? maxWidth / width : 1
  const scaleH = maxHeight ? maxHeight / height : 1
  const scale = Math.min(scaleW, scaleH, 1)
  if (scale >= 1) return data

  return resize(data, { width: Math.round(width * scale), height: Math.round(height * scale) })
}

// UI 75 → 0.85, UI 50 → 0.75, UI 100 → 0.95
function toQ(ui: number): number {
  return 0.55 + (ui / 100) * 0.40
}

async function jpegOptimized(data: ImageData, q: number): Promise<Blob> {
  const buf = await encodeJpeg(data, {
    quality: q,
    progressive: true,
    optimize_coding: true,
    trellis_multipass: true,
    trellis_opt_zero: true,
    auto_subsample: true,
  })
  return new Blob([buf], { type: 'image/jpeg' })
}

async function webpLossless(data: ImageData): Promise<Blob> {
  const buf = await encodeWebp(data, { quality: 100, lossless: 1, method: 6, exact: 1 })
  return new Blob([buf], { type: 'image/webp' })
}

async function webpNearLossless(data: ImageData, nearLossless: number): Promise<Blob> {
  const buf = await encodeWebp(data, {
    quality: 100,
    lossless: 1,
    near_lossless: nearLossless,
    method: 6,
    exact: 1,
  })
  return new Blob([buf], { type: 'image/webp' })
}

async function webpLossy(data: ImageData, q: number): Promise<Blob> {
  const buf = await encodeWebp(data, { quality: q, method: 4, pass: 2 })
  return new Blob([buf], { type: 'image/webp' })
}

async function pngOptimized(data: ImageData): Promise<Blob> {
  const buf = await optimisePng(data, { level: 6, optimiseAlpha: true })
  return new Blob([buf], { type: 'image/png' })
}

export async function compress(file: File, options: CompressOptions): Promise<CompressResult> {
  let data = await loadImage(file)
  data = await maybeResize(data, options.maxWidth, options.maxHeight)
  const { width, height } = data

  const format: OutputFormat =
    file.type === 'image/png' ? 'png'
    : file.type === 'image/webp' ? 'webp'
    : 'jpeg'

  let blob: Blob

  switch (format) {
    case 'png': {
      // PNG: near-lossless WebP + pure lossless WebP + oxipng, pick smallest
      const candidates: { blob: Blob; size: number }[] = []
      for (const nl of [80, 60, 40]) {
        try {
          const b = await webpNearLossless(data, nl)
          candidates.push({ blob: b, size: b.size })
        } catch { /* skip */ }
      }
      try {
        const b = await webpLossless(data)
        candidates.push({ blob: b, size: b.size })
      } catch { /* skip */ }
      try {
        const b = await pngOptimized(data)
        candidates.push({ blob: b, size: b.size })
      } catch { /* skip */ }
      if (candidates.length === 0) throw new Error('PNG encoding failed')
      blob = candidates.reduce((a, b) => a.size < b.size ? a : b).blob
      break
    }
    case 'jpeg': {
      const q = toQ(options.quality)
      const candidates: { blob: Blob; size: number }[] = []
      try {
        const b = await jpegOptimized(data, q)
        candidates.push({ blob: b, size: b.size })
      } catch { /* skip */ }
      try {
        const b = await webpLossy(data, q)
        candidates.push({ blob: b, size: b.size })
      } catch { /* skip */ }
      if (candidates.length === 0) throw new Error('JPEG encoding failed')
      blob = candidates.reduce((a, b) => a.size < b.size ? a : b).blob
      break
    }
    case 'webp': {
      const candidates: { blob: Blob; size: number }[] = []
      for (const nl of [80, 60, 40]) {
        try {
          const b = await webpNearLossless(data, nl)
          candidates.push({ blob: b, size: b.size })
        } catch { /* skip */ }
      }
      try {
        const b = await webpLossless(data)
        candidates.push({ blob: b, size: b.size })
      } catch { /* skip */ }
      try {
        const b = await webpLossy(data, toQ(options.quality))
        candidates.push({ blob: b, size: b.size })
      } catch { /* skip */ }
      if (candidates.length === 0) throw new Error('WebP encoding failed')
      blob = candidates.reduce((a, b) => a.size < b.size ? a : b).blob
      break
    }
  }

  if (blob.size > file.size) {
    blob = new Blob([await file.arrayBuffer()], { type: blob.type })
  }

  return { blob, width, height, format }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function compressionRatio(original: number, compressed: number): string {
  const pct = ((1 - compressed / original) * 100).toFixed(1)
  return `${pct}%`
}

export { ACCEPTED_TYPES }
