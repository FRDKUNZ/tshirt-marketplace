import { createClient } from '@/lib/supabase/client'

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket (e.g., 'designs/user-id/filename.png')
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Upload a design image and return its URL
 * @param file - The image file to upload
 * @param userId - The user's ID
 * @returns The public URL of the uploaded image
 */
export async function uploadDesignImage(file: File, userId: string): Promise<string> {
  const extension = file.name.split('.').pop() || 'png'
  const timestamp = Date.now()
  const path = `${userId}/${timestamp}.${extension}`

  return uploadFile(file, 'designs', path)
}

/**
 * Upload an order-related image (mockup, original design) to the order-images bucket
 * @param file - The image file to upload
 * @param orderId - The order ID
 * @param orderItemId - The order item ID
 * @param type - Image type: 'mockup' | 'original-front' | 'original-back'
 * @returns The public URL of the uploaded image
 */
export async function uploadOrderImage(
  file: File,
  orderId: string,
  orderItemId: string,
  type: 'mockup' | 'original-front' | 'original-back'
): Promise<string> {
  const extension = file.name.split('.').pop() || 'png'
  const path = `${orderId}/${orderItemId}/${type}.${extension}`
  return uploadFile(file, 'order-images', path)
}

/**
 * Upload an order image directly from a base64 data URL (canvas export)
 * @param dataUrl - The data URL from canvas.toDataURL()
 * @param orderId - The order ID
 * @param orderItemId - The order item ID
 * @param type - Image type: 'mockup' | 'original-front' | 'original-back'
 * @returns The public URL of the uploaded image
 */
export async function uploadOrderImageFromDataUrl(
  dataUrl: string,
  orderId: string,
  orderItemId: string,
  type: 'mockup' | 'original-front' | 'original-back'
): Promise<string> {
  // Convert data URL to blob
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const extension = type === 'mockup' ? 'png' : blob.type.split('/')[1] || 'png'
  const fileName = `${type}.${extension}`
  const path = `${orderId}/${orderItemId}/${fileName}`

  return uploadBlob(blob, 'order-images', path)
}

/**
 * Upload a blob to Supabase Storage
 */
async function uploadBlob(
  blob: Blob,
  bucket: string,
  path: string
): Promise<string> {
  const supabase = createClient()

  // Retry up to 3 times
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: blob.type || 'image/png',
      })

    if (!error) {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return urlData.publicUrl
    }

    lastError = new Error(`Failed to upload file (attempt ${attempt}): ${error.message}`)
    console.warn(lastError.message)

    // Wait before retrying (exponential backoff)
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }

  throw lastError || new Error('Failed to upload file after 3 attempts')
}

/**
 * Upload a custom print image to the custom-prints bucket
 * @param file - The image file to upload
 * @param userId - The user's ID
 * @returns The public URL of the uploaded image
 */
export async function uploadCustomPrintImage(
  file: File,
  userId: string
): Promise<string> {
  const extension = file.name.split('.').pop() || 'png'
  const timestamp = Date.now()
  const path = `${userId}/${timestamp}.${extension}`
  return uploadFile(file, 'custom-prints', path)
}
