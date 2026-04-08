import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      console.error("Midtrans webhook: Missing server key")
      return NextResponse.json({ error: "Configuration error" }, { status: 500 })
    }

    const signature = crypto
      .createHash("sha512")
      .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
      .digest("hex")

    if (signature !== body.signature_key) {
      console.error("Midtrans webhook: Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    // Use service role key for server-side admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceKey) {
      console.error("Midtrans webhook: Missing Supabase credentials")
      return NextResponse.json({ error: "Configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Find payment record by midtrans_order_id
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("midtrans_order_id", body.order_id)
      .single()

    if (!payment) {
      console.error(`Midtrans webhook: Payment not found for order ${body.order_id}`)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Map Midtrans status to our payment status
    const paymentStatusMap: Record<string, string> = {
      settlement: "settlement",
      capture: "capture",
      pending: "pending",
      cancel: "cancel",
      expire: "expire",
      failure: "failure",
    }

    const paymentStatus = paymentStatusMap[body.transaction_status] || "pending"

    // Update payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        midtrans_transaction_id: body.transaction_id,
        payment_type: body.payment_type,
        payment_status: paymentStatus,
        midtrans_response: body,
        paid_at:
          body.transaction_status === "settlement" || body.transaction_status === "capture"
            ? body.transaction_time || new Date().toISOString()
            : payment.paid_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id)

    if (paymentError) {
      console.error("Midtrans webhook: Failed to update payment:", paymentError)
      return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
    }

    // Update order status based on payment status
    let orderStatus = "pending"

    if (paymentStatus === "settlement" || paymentStatus === "capture") {
      orderStatus = "paid"
    } else if (paymentStatus === "cancel" || paymentStatus === "expire") {
      orderStatus = "cancelled"
    } else if (paymentStatus === "failure") {
      orderStatus = "cancelled"
    }

    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.order_id)

    if (orderError) {
      console.error("Midtrans webhook: Failed to update order:", orderError)
      // Don't return error here since payment was updated successfully
    }

    console.log(
      `Midtrans webhook: Order ${body.order_id} updated - Payment: ${paymentStatus}, Order: ${orderStatus}`
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Midtrans webhook error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
