-- Add delete policies for admin on orders, order_items, and payments
-- Also add cancel policy for users on their own orders

-- Admin can delete orders
CREATE POLICY "Admins can delete orders"
ON public.orders FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can delete order_items
CREATE POLICY "Admins can delete order_items"
ON public.order_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can delete payments
CREATE POLICY "Admins can delete payments"
ON public.payments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users can update their own orders (for cancellation)
CREATE POLICY "Users can update own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id);
