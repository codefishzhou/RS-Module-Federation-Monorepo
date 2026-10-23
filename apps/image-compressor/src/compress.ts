import { encode as encodeJpeg } from '@jsquash/jpeg'
import { encode as encodePng } from '@jsquash/png'
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

// Map UI quality to encoder quality. Keeps values high to preserve visual quality.
// UI 85 → 0.88, UI 50 → 0.74
function toEncoderQ(ui: number): number {
  return 0.48 + (ui / 100) * 0.52
}

// ---- Encoders ----

async function jpegOptimized(data: ImageData, q: number): Promise<Blob> {
  const buf = await encodeJpeg(data, {
    quality: q,
    progressive: true,
    optimize_coding: true,
    trellis_multipass: true,
    trellis_opt_zero: true,
    trellis_opt_table: true,
    trellis_loops: 8,
    auto_subsample: true,
  })
  return new Blob([buf], { type: 'image/jpeg' })
}

async function webpLossless(data: ImageData): Promise<Blob> {
  const buf = await encodeWebp(data, {
    quality: 100,
    lossless: 1,
    method: 6,
    pass: 1,
    exact: 1,
  })
  return new Blob([buf], { type: 'image/webp' })
}

async function webpLossy(data: ImageData, q: number): Promise<Blob> {
  const buf = await encodeWebp(data, {
    quality: q,
    lossless: 0,
    method: 6,
    pass: 6,
    filter_strength: 10,
    sns_strength: 20,
    segments: 4,
  })
  return new Blob([buf], { type: 'image/webp' })
}

async function pngOptimized(data: ImageData): Promise<Blob> {
  const buf = await encodePng(data)
  return new Blob([buf], { type: 'image/png' })
}

// ---- Per-format strategies (output format matches input) ----

async function compressAsPng(data: ImageData, originalSize: number, uiQuality: number): Promise<Blob> {
  // For PNG output: try lossless WebP (as PNG alternative), optimized PNG, then lossy WebP
  // Pick the smallest that preserves quality best
  const candidates: { blob: Blob; size: number }[] = []

  try {
    const b = await pngOptimized(data)
    candidates.push({ blob: b, size: b.size })
  } catch { /* skip */ }

  try {
    const b = await webpLossless(data)
    candidates.push({ blob: b, size: b.size })
  } catch { /* skip */ }

  // Only try lossy if quality slider is low
  if (uiQuality < 80) {
    try {
      const b = await webpLossy(data, toEncoderQ(uiQuality))
      candidates.push({ blob: b, size: b.size })
    } catch { /* skip */ }
  }

  if (candidates.length === 0) throw new Error('PNG encoding failed')
  const smaller = candidates.filter(c => c.size < originalSize)
  const pool = smaller.length > 0 ? smaller : candidates
  return pool.reduce((a, b) => a.size < b.size ? a : b).blob
}

async function compressAsJpeg(data: ImageData, originalSize: number, uiQuality: number): Promise<Blob> {
  const encoderQ = toEncoderQ(uiQuality)
  const candidates: { blob: Blob; size: number }[] = []

  try {
    const b = await jpegOptimized(data, encoderQ)
    candidates.push({ blob: b, size: b.size })
  } catch { /* skip */ }

  if (candidates.length === 0) throw new Error('JPEG encoding failed')
  const smaller = candidates.filter(c => c.size < originalSize)
  const pool = smaller.length > 0 ? smaller : candidates
  return pool.reduce((a, b) => a.size < b.size ? a : b).blob
}

async function compressAsWebp(data: ImageData, originalSize: number, uiQuality: number): Promise<Blob> {
  const candidates: { blob: Blob; size: number }[] = []

  try {
    const b = await webpLossless(data)
    candidates.push({ blob: b, size: b.size })
  } catch { /* skip */ }

  if (uiQuality < 90) {
    try {
      const b = await webpLossy(data, toEncoderQ(uiQuality))
      candidates.push({ blob: b, size: b.size })
    } catch { /* skip */ }
  }

  if (candidates.length === 0) throw new Error('WebP encoding failed')
  const smaller = candidates.filter(c => c.size < originalSize)
  const pool = smaller.length > 0 ? smaller : candidates
  return pool.reduce((a, b) => a.size < b.size ? a : b).blob
}

// ---- Main entry ----

export async function compress(file: File, options: CompressOptions): Promise<CompressResult> {
  let data = await loadImage(file)
  data = await maybeResize(data, options.maxWidth, options.maxHeight)
  const { width, height } = data

  // Output format matches input format
  const format: OutputFormat =
    file.type === 'image/png' ? 'png'
    : file.type === 'image/webp' ? 'webp'
    : 'jpeg'

  let blob: Blob

  switch (format) {
    case 'png':
      blob = await compressAsPng(data, file.size, options.quality)
      break
    case 'jpeg':
      blob = await compressAsJpeg(data, file.size, options.quality)
      break
    case 'webp':
      blob = await compressAsWebp(data, file.size, options.quality)
      break
  }

  // If compressed is larger, return original bytes
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
