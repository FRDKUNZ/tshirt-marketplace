"use server"

import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { uploadCustomPrintImage } from "@/lib/supabase/storage"

export async function uploadCustomPrint(formData: FormData) {
  const user = await requireAuth()

  const file = formData.get("file") as File
  const description = formData.get("description") as string

  if (!file || !file.size || file.size === 0) {
    return { error: "No file provided" }
  }

  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" }
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return { error: "File size must be less than 10MB" }
  }

  try {
    const supabase = await createClient() as any

    // Upload file to storage with detailed error logging
    let fileUrl: string
    try {
      fileUrl = await uploadCustomPrintImage(file, user.id)
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : String(uploadError)
      console.error("Storage upload failed:", message)
      return { error: `Failed to upload file: ${message}` }
    }

    // Save record to database
    const { data, error } = await supabase
      .from("custom_print_uploads")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size,
        file_type: file.type,
        description: description || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Database insert failed:", error)
      return { error: "Failed to save upload record" }
    }

    revalidatePath("/customize")
    revalidatePath("/admin")

    return { success: true, data }
  } catch (err) {
    console.error("Upload error:", err)
    const message = err instanceof Error ? err.message : String(err)
    return { error: `Failed to upload file: ${message}` }
  }
}

export async function updateUserPrintDescription(printId: string, description: string) {
  const user = await requireAuth()
  
  const supabase = await createClient() as any

  const { error } = await supabase
    .from("custom_print_uploads")
    .update({ description })
    .eq("id", printId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Update error:", error)
    return { error: "Failed to update description" }
  }

  revalidatePath("/customize")
  return { success: true }
}
