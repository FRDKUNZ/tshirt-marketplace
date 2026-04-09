export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          address: string | null
          city: string | null
          province: string | null
          postal_code: string | null
          country: string | null
          role: 'user' | 'admin' | null
          created_at: string | null
          updated_at: string | null
          email: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          country?: string | null
          role?: 'user' | 'admin' | null
          created_at?: string | null
          updated_at?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          country?: string | null
          role?: 'user' | 'admin' | null
          created_at?: string | null
          updated_at?: string | null
          email?: string | null
        }
      }
      designs: {
        Row: {
          id: string
          user_id: string | null
          tshirt_color: string | null
          front_design: Json | null
          back_design: Json | null
          preview_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          tshirt_color?: string | null
          front_design?: Json | null
          back_design?: Json | null
          preview_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          tshirt_color?: string | null
          front_design?: Json | null
          back_design?: Json | null
          preview_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          status: string | null
          subtotal: number
          shipping_cost: number | null
          total: number
          shipping_address: string
          shipping_city: string
          shipping_province: string
          shipping_postal_code: string
          shipping_country: string | null
          recipient_name: string
          recipient_phone: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_number: string
          status?: string | null
          subtotal: number
          shipping_cost?: number | null
          total: number
          shipping_address: string
          shipping_city: string
          shipping_province: string
          shipping_postal_code: string
          shipping_country?: string | null
          recipient_name: string
          recipient_phone: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          order_number?: string
          status?: string | null
          subtotal?: number
          shipping_cost?: number | null
          total?: number
          shipping_address?: string
          shipping_city?: string
          shipping_province?: string
          shipping_postal_code?: string
          shipping_country?: string | null
          recipient_name?: string
          recipient_phone?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          design_id: string | null
          quantity: number
          unit_price: number
          tshirt_color: string
          size: 'S' | 'M' | 'L' | 'XL' | 'XXL'
          front_design_url: string | null
          back_design_url: string | null
          preview_url: string | null
          original_front_image_url: string | null
          original_back_image_url: string | null
          mockup_url: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          design_id?: string | null
          quantity?: number
          unit_price: number
          tshirt_color: string
          size: 'S' | 'M' | 'L' | 'XL' | 'XXL'
          front_design_url?: string | null
          back_design_url?: string | null
          preview_url?: string | null
          original_front_image_url?: string | null
          original_back_image_url?: string | null
          mockup_url?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          design_id?: string | null
          quantity?: number
          unit_price?: number
          tshirt_color?: string
          size?: 'S' | 'M' | 'L' | 'XL' | 'XXL'
          front_design_url?: string | null
          back_design_url?: string | null
          preview_url?: string | null
          original_front_image_url?: string | null
          original_back_image_url?: string | null
          mockup_url?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string | null
          midtrans_order_id: string
          midtrans_transaction_id: string | null
          payment_type: string | null
          payment_status: string | null
          gross_amount: number
          midtrans_response: Json | null
          paid_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          midtrans_order_id: string
          midtrans_transaction_id?: string | null
          payment_type?: string | null
          payment_status?: string | null
          gross_amount: number
          midtrans_response?: Json | null
          paid_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          midtrans_order_id?: string
          midtrans_transaction_id?: string | null
          payment_type?: string | null
          payment_status?: string | null
          gross_amount?: number
          midtrans_response?: Json | null
          paid_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      custom_print_uploads: {
        Row: {
          id: string
          user_id: string | null
          file_name: string
          file_url: string
          file_size: number | null
          file_type: string | null
          description: string | null
          status: string | null
          admin_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          file_name: string
          file_url: string
          file_size?: number | null
          file_type?: string | null
          description?: string | null
          status?: string | null
          admin_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          file_name?: string
          file_url?: string
          file_size?: number | null
          file_type?: string | null
          description?: string | null
          status?: string | null
          admin_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
