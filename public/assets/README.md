# Assets Folder

This folder contains custom mockup SVGs and other design assets for the t-shirt marketplace.

## Folder Structure

```
public/assets/
└── mockups/
    ├── tshirt-front.svg    # Front view t-shirt mockup template
    ├── tshirt-back.svg     # Back view t-shirt mockup template
    └── (add your custom SVGs here)
```

## How to Use Your Custom Mockup SVGs

1. **Replace the templates** with your own SVG mockup files
2. Keep the same filenames (`tshirt-front.svg`, `tshirt-back.svg`) or update the code references
3. Your SVG should have:
   - A t-shirt shape as the base
   - A clearly defined print area (where designs go)
   - Transparent or colored background

## SVG Requirements

- **ViewBox**: `0 0 400 500` (or adjust in code)
- **Print area**: Should be centered on the chest area
- **File size**: Keep under 50KB for performance
- **Colors**: Use CSS custom properties or simple hex colors

## Example Custom Mockup

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
  <!-- Your t-shirt shape -->
  <path d="..." fill="#ffffff" stroke="#ccc" stroke-width="2"/>
  
  <!-- Optional: Print area guide -->
  <rect x="130" y="80" width="140" height="200" 
        fill="none" stroke="#999" stroke-dasharray="5,5"/>
</svg>
```

## Adding More Assets

You can add:
- Different t-shirt styles (crew neck, v-neck, polo)
- Product photography backgrounds
- Pattern overlays
- Brand logos/watermarks

Place them in appropriate subfolders and reference them in your code.
