declare module 'midtrans-client' {
  interface SnapConfig {
    isProduction: boolean
    serverKey: string
    clientKey: string
  }

  interface TransactionDetails {
    order_id: string
    gross_amount: number
  }

  interface CustomerDetails {
    first_name: string
    email: string
    phone: string
  }

  interface TransactionRequest {
    transaction_details: TransactionDetails
    customer_details?: CustomerDetails
    enabled_payments?: string[]
  }

  interface TransactionResponse {
    token: string
    redirect_url: string
  }

  class Snap {
    constructor(config: SnapConfig)
    createTransaction(request: TransactionRequest): Promise<TransactionResponse>
  }

  class Core {
    constructor(config: SnapConfig)
  }

  export { Snap, Core }
  export default { Snap, Core }
}
