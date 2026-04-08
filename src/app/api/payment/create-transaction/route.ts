import { NextRequest, NextResponse } from "next/server"
import Midtrans from "midtrans-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, customerDetails } = body

    // Validate required fields
    if (!orderId || !amount || !customerDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Initialize Midtrans Snap (same pattern as reference repo)
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

    if (!serverKey || !clientKey) {
      return NextResponse.json(
        { error: "Payment configuration is missing" },
        { status: 500 }
      )
    }

    const snap = new Midtrans.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey,
      clientKey,
    })

    // Build transaction payload (same pattern as reference repo)
    // Do NOT use enabled_payments - let Snap show all available payment channels
    const transactionPayload: any = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(amount),
      },
      customer_details: {
        first_name: customerDetails.first_name,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
    }

    // Create transaction and return token
    const transaction = await snap.createTransaction(transactionPayload)

    return NextResponse.json({ token: transaction.token })
  } catch (error: any) {
    console.error("Midtrans transaction error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 }
    )
  }
}
