import { NextRequest, NextResponse } from "next/server"
import midtransClient from "midtrans-client"

// Map payment method ID to Midtrans payment type
const PAYMENT_TYPE_MAP: Record<string, string> = {
  qris: "qris",
  bca: "bank_transfer",
  bri: "bank_transfer",
  bni: "bank_transfer",
  mandiri: "bank_transfer",
  gopay: "gopay",
  shopeepay: "shopeepay",
  indomaret: "cstore",
  alfamart: "cstore",
  credit_card: "credit_card",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, customerDetails, paymentMethod } = body

    // Validate required fields
    if (!orderId || !amount || !customerDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Initialize Snap API
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

    if (!serverKey || !clientKey) {
      return NextResponse.json(
        { error: "Payment configuration is missing" },
        { status: 500 }
      )
    }

    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey,
      clientKey,
    })

    // Build payment type config
    const paymentType = PAYMENT_TYPE_MAP[paymentMethod] || "credit_card"

    // Build transaction payload with specific payment method
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

    // Add payment method specific config
    if (paymentType === "bank_transfer") {
      transactionPayload.enabled_payments = [paymentMethod.toUpperCase()]
      transactionPayload.payment_type = "bank_transfer"
    } else if (paymentType === "cstore") {
      transactionPayload.enabled_payments = [paymentMethod]
      transactionPayload.payment_type = "cstore"
    } else {
      transactionPayload.enabled_payments = [paymentMethod]
      transactionPayload.payment_type = paymentType
    }

    // Create transaction
    const transaction = await snap.createTransaction(transactionPayload)

    return NextResponse.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    })
  } catch (error: any) {
    console.error("Midtrans transaction error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 }
    )
  }
}
