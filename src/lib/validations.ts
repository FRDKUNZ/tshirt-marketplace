import { z } from 'zod'

// User profile validation
export const userProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postal_code: z.string().min(5, 'Valid postal code is required'),
  country: z.string().default('Indonesia'),
})

export type UserProfileInput = z.infer<typeof userProfileSchema>

// Shipping address validation
export const shippingAddressSchema = z.object({
  recipient_name: z.string().min(2, 'Recipient name is required'),
  recipient_phone: z.string().min(10, 'Valid phone number is required'),
  shipping_address: z.string().min(5, 'Full address is required'),
  shipping_city: z.string().min(2, 'City is required'),
  shipping_province: z.string().min(2, 'Province is required'),
  shipping_postal_code: z.string().min(5, 'Postal code is required'),
  shipping_country: z.string().default('Indonesia'),
  notes: z.string().optional(),
})

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>

// Design configuration validation
export const designPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  scale: z.number().min(0.1).max(5),
  rotation: z.number().min(-360).max(360),
  width: z.number().optional(),
  height: z.number().optional(),
})

export type DesignPosition = z.infer<typeof designPositionSchema>

export const designConfigSchema = z.object({
  tshirt_color: z.string().default('#ffffff'),
  front_design: z.array(z.object({
    src: z.string(),
    position: designPositionSchema,
    name: z.string(),
  })).optional(),
  back_design: z.array(z.object({
    src: z.string(),
    position: designPositionSchema,
    name: z.string(),
  })).optional(),
  preview_url: z.string().optional(),
})

export type DesignConfig = z.infer<typeof designConfigSchema>

// Order item validation
export const orderItemSchema = z.object({
  design_id: z.string().uuid().optional(),
  quantity: z.number().min(1).max(10),
  unit_price: z.number().min(0),
  tshirt_color: z.string(),
  size: z.enum(['S', 'M', 'L', 'XL', 'XXL']),
  front_design_url: z.string().optional(),
  back_design_url: z.string().optional(),
  preview_url: z.string().optional(),
})

export type OrderItemInput = z.infer<typeof orderItemSchema>

// Cart item validation
export const cartItemSchema = z.object({
  id: z.string(),
  design: designConfigSchema,
  quantity: z.number().min(1).max(10),
  size: z.enum(['S', 'M', 'L', 'XL', 'XXL']),
  unit_price: z.number().min(0),
})

export type CartItem = z.infer<typeof cartItemSchema>

// Payment webhook validation
export const paymentWebhookSchema = z.object({
  order_id: z.string(),
  transaction_status: z.enum(['settlement', 'capture', 'pending', 'cancel', 'expire', 'failure']),
  fraud_status: z.string().optional(),
  gross_amount: z.string(),
  signature_key: z.string(),
  transaction_id: z.string(),
  payment_type: z.string().optional(),
  transaction_time: z.string().optional(),
  status_code: z.string().optional(),
})

export type PaymentWebhook = z.infer<typeof paymentWebhookSchema>
