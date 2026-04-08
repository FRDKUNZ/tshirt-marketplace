"use server"

import { requireAdmin } from "@/lib/auth"
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
