import { readFileSync, writeFileSync } from 'node:fs'
import { encode as encodeJpeg } from '@jsquash/jpeg'
import { encode as encodePng } from '@jsquash/png'
import { encode as encodeWebp } from '@jsquash/webp'

async function test() {
  // Read test images
  const pngBuf = readFileSync('/tmp/test-image.png')
  const jpgBuf = readFileSync('/tmp/test-photo.jpg')

  // Create ImageData from file
  async function toImageData(buf) {
    const { createCanvas, loadImage } = await import('canvas')
    const img = await loadImage(buf)
    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    return ctx.getImageData(0, 0, img.width, img.height)
  }

  console.log('=== PNG 4MB → WebP/JPEG ===')
  const pngData = await toImageData(pngBuf)
  console.log(`Original: ${pngBuf.length} bytes (${(pngBuf.length/1024/1024).toFixed(2)} MB)`)
  console.log(`Dimensions: ${pngData.width}x${pngData.height}`)

  // Test WebP at different qualities
  for (const q of [80, 60, 40]) {
    const encoded = await encodeWebp(pngData, { quality: q/100, method: 6, pass: 6 })
    const ratio = ((1 - encoded.byteLength / pngBuf.length) * 100).toFixed(1)
    console.log(`  WebP q=${q}: ${(encoded.byteLength/1024/1024).toFixed(2)} MB (↓${ratio}%)`)
    if (q === 60) writeFileSync('/tmp/test-png-to-webp.webp', Buffer.from(encoded))
  }

  // Test JPEG at different qualities
  for (const q of [80, 60, 40]) {
    const encoded = await encodeJpeg(pngData, { quality: q/100, progressive: true, optimize_coding: true, trellis_multipass: true, trellis_opt_zero: true, trellis_opt_table: true, trellis_loops: 8, auto_subsample: true })
    const ratio = ((1 - encoded.byteLength / pngBuf.length) * 100).toFixed(1)
    console.log(`  JPEG q=${q}: ${(encoded.byteLength/1024/1024).toFixed(2)} MB (↓${ratio}%)`)
  }

  console.log('\n=== JPEG 5.9MB → JPEG/WebP ===')
  const jpgData = await toImageData(jpgBuf)
  console.log(`Original: ${jpgBuf.length} bytes (${(jpgBuf.length/1024/1024).toFixed(2)} MB)`)
  console.log(`Dimensions: ${jpgData.width}x${jpgData.height}`)

  for (const q of [80, 60, 40]) {
    const encoded = await encodeJpeg(jpgData, { quality: q/100, progressive: true, optimize_coding: true, trellis_multipass: true, trellis_opt_zero: true, trellis_opt_table: true, trellis_loops: 8, auto_subsample: true })
    const ratio = ((1 - encoded.byteLength / jpgBuf.length) * 100).toFixed(1)
    console.log(`  JPEG q=${q}: ${(encoded.byteLength/1024/1024).toFixed(2)} MB (↓${ratio}%)`)
  }

  for (const q of [80, 60, 40]) {
    const encoded = await encodeWebp(jpgData, { quality: q/100, method: 6, pass: 6 })
    const ratio = ((1 - encoded.byteLength / jpgBuf.length) * 100).toFixed(1)
    console.log(`  WebP q=${q}: ${(encoded.byteLength/1024/1024).toFixed(2)} MB (↓${ratio}%)`)
  }
}

test().catch(e => { console.error(e); process.exit(1) })
