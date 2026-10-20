export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_INPUT_BYTES = 15 * 1024 * 1024
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const MAX_DIMENSION = 1600

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return file.name + ': only JPG, PNG or WebP images are allowed.'
  }
  if (file.size > MAX_INPUT_BYTES) {
    return file.name + ' is too large (maximum 15 MB).'
  }
  return null
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

// Resizes large photos and re-encodes them as WebP (JPEG on older browsers) to save storage and data.
export async function compressImage(file: File): Promise<File> {
  if (typeof createImageBitmap === 'undefined') {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error(file.name + ' is too large (maximum 5 MB).')
    return file
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process ' + file.name)
  ctx.drawImage(bitmap, 0, 0, width, height)

  let blob = await toBlob(canvas, 'image/webp', 0.82)
  let ext = 'webp'
  if (!blob || blob.type !== 'image/webp') {
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    blob = await toBlob(canvas, 'image/jpeg', 0.85)
    ext = 'jpg'
  }
  if (!blob) throw new Error('Could not process ' + file.name)
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error(file.name + ' is still too large after compression.')

  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.' + ext, { type: blob.type })
}
