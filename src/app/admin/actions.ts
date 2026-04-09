"use server"

import { requireAdmin } from "@/lib/auth"
import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin()

  const supabase = await createClient() as any

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin")
  revalidatePath(`/admin/orders/${orderId}`)

  return { success: true }
}

export async function deleteOrder(orderId: string) {
  "use server"

  await requireAdmin()

  const supabase = await createClient() as any

  // Delete related payments first (foreign key constraint)
  await supabase.from("payments").delete().eq("order_id", orderId)

  // Delete related order items
  await supabase.from("order_items").delete().eq("order_id", orderId)

  // Delete the order
  const { error } = await supabase.from("orders").delete().eq("id", orderId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin")
  revalidatePath(`/admin/orders/${orderId}`)

  return { success: true }
}

export async function cancelOrder(orderId: string) {
  "use server"

  const session = await requireAuth()

  const supabase = await createClient() as any

  // Verify the order belongs to the user
  const { data: order } = await supabase
    .from("orders")
    .select("status, user_id")
    .eq("id", orderId)
    .single()

  if (!order) {
    throw new Error("Order not found")
  }

  if (order.user_id !== session.id) {
    throw new Error("Unauthorized")
  }

  // Only allow cancellation of pending or paid orders
  if (order.status !== "pending" && order.status !== "paid") {
    throw new Error("Only pending or paid orders can be cancelled")
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/orders")
  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/admin")

  return { success: true }
}

export async function getOrderWithDetails(orderId: string) {
  await requireAdmin()

  const supabase = await createClient()

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single()

  if (!order) {
    throw new Error("Order not found")
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .single()

  return {
    order,
    orderItems,
    payment,
  }
}

// Custom Print Upload Actions
export async function updateCustomPrintStatus(printId: string, status: string, adminNotes?: string) {
  await requireAdmin()

  const supabase = await createClient() as any

  const updateData: Record<string, any> = { status }
  if (adminNotes !== undefined) {
    updateData.admin_notes = adminNotes
  }

  const { error } = await supabase
    .from("custom_print_uploads")
    .update(updateData)
    .eq("id", printId)

  if (error) {
    console.error("Failed to update print status:", error)
    return { error: "Failed to update print status" }
  }

  revalidatePath("/admin")
  revalidatePath("/customize")
  return { success: true }
}

export async function deleteCustomPrintUpload(printId: string) {
  await requireAdmin()

  const supabase = await createClient() as any

  // Get the file URL first
  const { data: printUpload } = await supabase
    .from("custom_print_uploads")
    .select("file_url")
    .eq("id", printId)
    .single()

  if (printUpload) {
    // Delete from storage
    try {
      // Extract path from URL and delete
      const path = printUpload.file_url.split("/").slice(-2).join("/")
      await supabase.storage
        .from("custom-prints")
        .remove([path])
    } catch (err) {
      console.warn("Failed to delete file from storage:", err)
    }
  }

  // Delete from database
  const { error } = await supabase
    .from("custom_print_uploads")
    .delete()
    .eq("id", printId)

  if (error) {
    console.error("Failed to delete print upload:", error)
    return { error: "Failed to delete print upload" }
  }

  revalidatePath("/admin")
  revalidatePath("/customize")
  return { success: true }
}
