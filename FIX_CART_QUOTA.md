# Fix: Cart Storage Quota Exceeded

## Problem
LocalStorage penuh karena menyimpan data base64 image yang besar.

## Solution Applied

### 1. **Removed Large Data from Cart**
- ✅ `mockupDataUrl` tidak lagi disimpan di cart
- ✅ `originalFrontImageDataUrl` tidak lagi disimpan di cart
- ✅ `originalBackImageDataUrl` tidak lagi disimpan di cart
- ✅ Hanya design references yang disimpan (src, position, name)

### 2. **Added Storage Size Check**
- Cart store sekarang cek ukuran sebelum menyimpan (max 4MB)
- Error yang user-friendly jika quota exceeded

### 3. **Type Fix**
- Fixed position schema: `scaleX/scaleY` → `scale` (uniform scale)

## How to Clear Existing Full Cart

### Option 1: Browser Console (Recommended)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run: `localStorage.removeItem('tshirt-cart')`
4. Refresh page

### Option 2: Application Tab
1. Open DevTools (F12)
2. Go to **Application** tab
3. Left sidebar: **Local Storage** → `http://localhost:3000`
4. Find key `tshirt-cart` and delete it
5. Refresh page

### Option 3: Clear All LocalStorage (Nuclear Option)
1. Open DevTools (F12)
2. Console tab
3. Run: `localStorage.clear()`
4. Refresh page

## Prevention
- Cart sekarang max 4MB per item
- Error handling yang jelas jika quota exceeded
- Toast notification yang informative

## Testing
1. Clear existing cart data (see above)
2. Go to `/customize` page
3. Upload image to front side
4. Click "Continue to Back Side"
5. Upload image to back side (optional)
6. Click "Add to Cart"
7. Should work without quota error now ✅
