# UI Redesign - T-Shirt Designer

## Overview
Complete UI redesign to match the reference screenshots with:
- **Header** with navigation and cart badge
- **Dual mockup display** (Front + Back side-by-side)
- **SVG-based t-shirt outlines** with print area indicators
- **Step-based workflow** for front → back design
- **Clean sidebar controls** for color, size, quantity

## Visual Changes

### Before
```
┌─────────────────────────────┐
│ Design Your T-Shirt         │
│                             │
│ ┌─────────────────────────┐ │
│ │ [Tabs: Front | Back]    │ │
│ │                         │ │
│ │   [Single Canvas]       │ │
│ │                         │ │
│ │  [Upload Image]         │ │
│ └─────────────────────────┘ │
│                             │
│ [Color] [Size] [Add Cart]   │
└─────────────────────────────┘
```

### After
```
┌──────────────────────────────────────────────────────┐
│ [Logo] Azure Store    Home | Customize    [Cart] 👤  │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────┐ ┌────────────────────┐ │
│ │ T-Shirt Designer         │ │ T-Shirt Color      │ │
│ │ [Export][Delete][Clear]  │ │ [⬜][][🟦][]...│ │
│ │                          │ │ Selected: White    │ │
│ │ ① Front → ② Back        │ │                    │ │
│ │                          │ ├────────────────────┤ │
│ │ ┌────────────────────┐   │ │ Size & Quantity    │ │
│ │ │ Front    Back      │   │ │ Size: [M ▼]        │ │
│ │ │                    │   │ │ Qty: 1 ━━━━━       │ │
│ │ │ [Front Mockup]     │   │ ├────────────────────┤ │
│ │ │  + Design          │   │ │ Unit: Rp 149.000   │ │
│ │ │                    │   │ │ Total: Rp 149.000  │ │
│ │ │ [Back Mockup]      │   │ │ [Add to Cart]      │ │
│ │ │  Upload design     │   │ └────────────────────┘ │
│ │ │                    │   │                        │
│ │ └────────────────────┘   │                        │
│ │   [Upload Image]         │                        │
│ └──────────────────────────┘                        │
└──────────────────────────────────────────────────────┘
```

## Key Features

### 1. **Header Navigation**
- Store logo + name
- Navigation links (Home, Customize)
- Cart icon with badge showing item count
- Profile icon

### 2. **Dual Mockup Display**
- **SVG-based t-shirt outlines** (not canvas)
- Front (left) + Back (right) side-by-side
- **Print area indicators** (dashed rectangles)
- Dynamic color changes based on selection
- Labels "Front Side" and "Back Side"

### 3. **Step Indicator**
```
[① Front Side] → [② Back Side]
 Upload design     Optional
```
- Active step highlighted
- Completed steps show ✓
- Click to switch between sides
- Back side disabled until front has design

### 4. **Interactive Elements**

#### Toolbar (ghost buttons)
```
[↓ Export] [🗑 Delete] [↓ Clear] [Preview Mockup]
```

#### Upload Area
- Centered upload button
- Hidden file input
- Click to upload image to active side

### 5. **Right Sidebar Controls**

#### Color Selection
- 5 columns grid
- Color swatches with ring indicator
- Shows selected color name

#### Size & Quantity
- Size dropdown (S, M, L, XL, XXL)
- Quantity slider (1-25)

#### Price & Cart
- Unit price display
- Total calculation
- "Add to Cart" button (disabled if no front design)
- Helper text when disabled

### 6. **Cart Dialog**
Shows summary:
- ✓ Front Side: X design(s)
- ✓ Back Side: X design(s) (if any)
- Size, Quantity, Color
- Continue Designing / Go to Cart buttons

## Technical Implementation

### SVG Mockup Structure
```jsx
<svg viewBox="0 0 900 600">
  {/* Front T-Shirt */}
  <g transform="translate(60, 60)">
    <path d={TSHIRT_FRONT_OUTLINE} fill={color} stroke="#666" />
    <rect x="135" y="180" width="100" height="140" 
          strokeDasharray={activeSide === "front" ? "none" : "4,4"} />
    {designs.front.length === 0 && <text>Upload your design</text>}
  </g>
  
  {/* Back T-Shirt */}
  <g transform="translate(480, 60)">
    <path d={TSHIRT_BACK_OUTLINE} fill={color} stroke="#666" />
    <rect x="135" y="180" width="100" height="140" />
    {designs.back.length === 0 && <text>Upload your design</text>}
  </g>
  
  {/* User uploaded images */}
  {designs.front.map(d => <image href={d.src} ... />)}
  {designs.back.map(d => <image href={d.src} ... />)}
</svg>
```

### Canvas Strategy
- **Hidden Fabric.js canvas** for image manipulation
- **SVG for visual display** to admin
- Images stored in `designStore` with positions
- SVG renders images at correct positions

### Print Area
```typescript
const PRINT_AREA = {
  left: 135,
  top: 180,
  width: 100,
  height: 140,
}
```
- Dashed border when inactive
- Solid border when active side
- "Upload your design" text when empty

### State Management
```typescript
activeSide: "front" | "back"
designs: {
  front: DesignElement[]
  back: DesignElement[]
}
tshirtColor: string
selectedSize: string
quantity: number
```

## Files Changed

| File | Changes |
|------|---------|
| `src/app/customize/page.tsx` | Complete UI rewrite |
| `src/lib/store/cart.ts` | Storage quota check (previous) |

## Responsive Behavior

- **Desktop (lg+)**: 2-column layout (designer + sidebar)
- **Mobile**: Single column, stacked vertically
- **Tablet**: Adjusts gracefully

## Color System

Uses semantic Tailwind tokens:
- `bg-background`, `bg-card`, `bg-muted`
- `text-foreground`, `text-muted-foreground`
- `border`, `ring-foreground`
- `bg-primary`, `text-primary-foreground`

## Accessibility

- ✅ Proper heading hierarchy
- ✅ ARIA labels on color buttons
- ✅ Disabled state for incomplete steps
- ✅ Keyboard navigable
- ✅ Focus indicators
- ✅ Screen reader friendly cart summary

## Testing Checklist

- [ ] Header displays correctly
- [ ] Navigation links work
- [ ] Cart badge shows correct count
- [ ] Front mockup displays on load
- [ ] Back mockup displays (disabled initially)
- [ ] Upload image to front side
- [ ] Front design appears on mockup
- [ ] Step 2 becomes clickable
- [ ] Click step 2 → switch to back
- [ ] Upload image to back side
- [ ] Back design appears on mockup
- [ ] Change color → both mockups update
- [ ] Change size → updates correctly
- [ ] Change quantity → total updates
- [ ] Add to Cart → dialog shows summary
- [ ] Preview Mockup → opens in new tab
- [ ] Export → downloads PNG
- [ ] Delete → removes selected element
- [ ] Clear → clears active side

## Admin View

When order is created, admin receives:
1. **Combined mockup image** (front + back)
2. **Design data** with positions for printing
3. **Color, size, quantity** specifications

This allows admin to:
- See exactly what user designed
- Know where to print on t-shirt
- Print at correct scale and position

## Future Enhancements

- [ ] Drag & drop image upload
- [ ] Text tool for adding text designs
- [ ] Shape tools (circle, rectangle, etc.)
- [ ] Undo/redo functionality
- [ ] Save draft designs
- [ ] Template gallery
- [ ] Zoom in/out controls
- [ ] Grid overlay for alignment
- [ ] Snap to print area
- [ ] Design size limits validation
