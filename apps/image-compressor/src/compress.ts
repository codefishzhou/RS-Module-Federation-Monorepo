import { encode as encodeJpeg } from '@jsquash/jpeg'
import { encode as encodePng } from '@jsquash/png'
import { encode as encodeWebp } from '@jsquash/webp'
import resize from '@jsquash/resize'

export type OutputFormat = 'jpeg' | 'png' | 'webp'

export interface CompressOptions {
  quality: number
  outputFormat?: OutputFormat
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
  console.log('[compress] loadImage:', file.name, file.type, file.size)
  const bitmap = await createImageBitmap(file)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const data = ctx.getImageData(0, 0, bitmap.width, bitmap.height)
  bitmap.close()
  console.log('[compress] imageData:', data.width, 'x', data.height)
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

async function encodeOne(
  data: ImageData,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  console.log('[compress] encodeOne:', format, 'quality:', quality)
  switch (format) {
    case 'jpeg': {
      const buf = await encodeJpeg(data, {
        quality,
        progressive: true,
        optimize_coding: true,
        trellis_multipass: true,
        trellis_opt_zero: true,
        trellis_opt_table: true,
        trellis_loops: 8,
        auto_subsample: true,
      })
      console.log('[compress] jpeg result:', buf?.byteLength, 'bytes')
      return new Blob([buf], { type: 'image/jpeg' })
    }
    case 'webp': {
      const buf = await encodeWebp(data, {
        quality,
        method: 6,
        pass: 6,
        filter_strength: 20,
        sns_strength: 50,
        segments: 4,
        partition_limit: 2,
      })
      console.log('[compress] webp result:', buf?.byteLength, 'bytes')
      return new Blob([buf], { type: 'image/webp' })
    }
    case 'png': {
      const buf = await encodePng(data)
      console.log('[compress] png result:', buf?.byteLength, 'bytes')
      return new Blob([buf], { type: 'image/png' })
    }
  }
}

export async function compress(file: File, options: CompressOptions): Promise<CompressResult> {
  console.log('[compress] start:', file.name, 'quality:', options.quality)
  let data = await loadImage(file)
  data = await maybeResize(data, options.maxWidth, options.maxHeight)
  const { width, height } = data

  let blob: Blob
  let format: OutputFormat

  if (options.outputFormat) {
    const q = options.quality / 100
    blob = await encodeOne(data, options.outputFormat, q)
    format = options.outputFormat
  } else {
    // Auto: try WebP first (best compression), then original format
    const sourceType = file.type
    const tryFormats: OutputFormat[] =
      sourceType === 'image/png'
        ? ['webp', 'png']
        : sourceType === 'image/webp'
          ? ['webp']
          : ['jpeg', 'webp']

    let best: { blob: Blob; format: OutputFormat; size: number } | null = null

    for (const fmt of tryFormats) {
      try {
        const q = options.quality / 100
        const resultBlob = await encodeOne(data, fmt, q)
        if (!best || resultBlob.size < best.size) {
          best = { blob: resultBlob, format: fmt, size: resultBlob.size }
        }
      } catch (e) {
        console.warn('[compress] format', fmt, 'failed:', e)
      }
    }

    if (!best) throw new Error('All encoding attempts failed')
    blob = best.blob
    format = best.format
  }

  console.log('[compress] done:', format, blob.size, 'bytes, original:', file.size)

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
