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
