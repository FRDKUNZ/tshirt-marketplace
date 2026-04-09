/**
 * Shared pricing logic for custom t-shirt orders.
 * All pricing tiers are defined here and used across:
 * - customize page (unit price display + add-to-cart)
 * - cart page (per-item unit price)
 * - checkout page (order total)
 */

export interface PricingTier {
  name: string
  minQty: number
  price1Side: number
  price2Side: number
}

export const PRICING_TIERS: PricingTier[] = [
  { name: "SATUAN",    minQty: 1,  price1Side: 89000,  price2Side: 128000 },
  { name: "BER-5",     minQty: 5,  price1Side: 79000,  price2Side: 108000 },
  { name: "KOMUNITAS", minQty: 50, price1Side: 65000,  price2Side: 84000 },
]

/**
 * Given a quantity and number of printed sides (1 or 2),
 * return the applicable tier and unit price.
 */
export function getUnitPrice(quantity: number, sides: 1 | 2): { tier: PricingTier; price: number } {
  // Find the highest tier the quantity qualifies for
  let applicableTier = PRICING_TIERS[0]
  for (const tier of PRICING_TIERS) {
    if (quantity >= tier.minQty) {
      applicableTier = tier
    }
  }
  const price = sides === 2 ? applicableTier.price2Side : applicableTier.price1Side
  return { tier: applicableTier, price }
}

/**
 * Format a number as Indonesian Rupiah currency.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}
