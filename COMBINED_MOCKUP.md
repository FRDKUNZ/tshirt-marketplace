# Combined Mockup Feature (Front + Back)

## Overview
Saat user klik "Add to Cart", sistem sekarang menghasilkan **1 gambar mockup** yang berisi **Front dan Back side-by-side** seperti gambar referensi.

## Implementation

### 1. **generateCombinedMockup Function**
Lokasi: `src/app/customize/page.tsx`

Fungsi ini membuat canvas tersembunyi dengan:
- **Gray background** (#808080) seperti referensi
- **Front mockup** di sisi kiri (diambil dari canvas utama)
- **Back mockup** di sisi kanan (dibuat dari temporary canvas)

#### Process Flow:
```
1. Create offscreen canvas (800x500)
2. Fill gray background
3. Draw front t-shirt (from current canvas)
4. Create temp canvas for back
5. Draw back t-shirt + designs on temp canvas
6. Draw back to offscreen canvas
7. Return combined image as base64
```

### 2. **handleAddToCart Changes**

**Before:**
```typescript
addItem({
  mockupDataUrl: undefined, // ❌ Not stored
  originalFrontImageDataUrl: frontSrc, // ❌ Large base64
  originalBackImageDataUrl: backSrc,   // ❌ Large base64
})
```

**After:**
```typescript
const combinedMockupUrl = await generateCombinedMockup()

addItem({
  mockupDataUrl: combinedMockupUrl, // ✅ Single combined image
  originalFrontImageDataUrl: undefined, // ✅ Removed
  originalBackImageDataUrl: undefined,  // ✅ Removed
})
```

### 3. **UI Enhancement**

Added **"Preview Mockup" button** yang membuka combined mockup di new tab untuk preview.

```
[Export] [Delete] [Clear] [Preview Mockup] ← NEW
```

## Technical Details

### Constants
```typescript
const COMBINED_WIDTH = 800
const COMBINED_HEIGHT = 500
const COMBINED_MOCKUP_SCALE = 0.42
const FRONT_COMBINED_X = 80
const FRONT_COMBINED_Y = 40
const BACK_COMBINED_X = 460
const BACK_COMBINED_Y = 40
```

### Storage Optimization
- **Before**: 3 large base64 images (front, back, mockup) = ~5-10MB
- **After**: 1 combined mockup image = ~500KB-1MB
- **Reduction**: ~80-90% smaller!

### Error Handling
```typescript
try {
  combinedMockupUrl = await generateCombinedMockup()
} catch (error) {
  console.error("[Mockup] Failed:", error)
  toast.error("Failed to generate mockup, but continuing...")
}
```

## Testing Steps

1. Go to `/customize`
2. Upload image to **Front Side**
3. Click "Continue to Back Side"
4. Upload image to **Back Side** (optional)
5. Click **"Preview Mockup"** button
   - ✅ Should open new tab with combined front+back image
6. Click **"Add to Cart"**
   - ✅ Should show loading toast "Generating mockup preview..."
   - ✅ Should add to cart successfully
7. Go to `/cart`
   - ✅ Should show combined mockup image

## Files Changed

| File | Changes |
|------|---------|
| `src/app/customize/page.tsx` | Added `generateCombinedMockup`, updated `handleAddToCart`, added Preview button |
| `src/lib/store/cart.ts` | Added storage quota check (from previous fix) |

## Visual Output

The generated mockup looks like this:

```
┌────────────────────────────────────────┐
│         #808080 (Gray Background)      │
│                                        │
│   ┌──────┐           ┌──────┐         │
│   │      │           │      │         │
│   │ FRONT│           │ BACK │         │
│   │      │           │      │         │
│   └──────┘           └──────┘         │
│                                        │
└────────────────────────────────────────┘
```

- Front: Left side with user's front design
- Back: Right side with user's back design (if any)
- Both t-shirts have same color
- Gray background for professional look

## Performance

- **Generation time**: ~200-500ms (async)
- **File size**: ~500KB-1MB (PNG)
- **Storage**: Well within 4MB localStorage limit

## Future Improvements

- [ ] Add download button for combined mockup
- [ ] Allow custom background color
- [ ] Add text label "Front" / "Back" below each mockup
- [ ] Generate mockup on design change (not just on add to cart)
