# Assets Directory

This directory contains static assets for the Cyoda SaaS application.

## Images

### Logos

- **cyoda-logo.svg** (3.5KB) - Main Cyoda logo in SVG format (recommended for best quality)
- **cyoda-logo.png** (45KB) - Main Cyoda logo in PNG format
- **cyoda-small.png** (12KB) - Small version of the Cyoda logo

### Usage

The logos are used in:
- **AppHeader** - Main header logo (uses SVG)
- **Login Page** - Login screen logo (uses SVG)

### Favicons

Located in `/public/`:
- **favicon.ico** (15KB) - Standard favicon
- **favicon-16x16.png** (1.1KB) - 16x16 favicon
- **favicon-32x32.png** (1.8KB) - 32x32 favicon

## Source

All assets were copied from the original Vue project:
- Source: `.old_project /packages/*/src/assets/`
- Date: October 26, 2025

## Adding New Assets

To add new images or assets:

1. Place files in the appropriate subdirectory under `/public/assets/`
2. Reference them in your components using absolute paths: `/assets/images/your-image.png`
3. Vite will automatically serve files from the `/public/` directory

## Optimization

For production builds, consider:
- Using SVG format for logos (scalable, smaller file size)
- Optimizing PNG files with tools like `pngquant` or `imageoptim`
- Using WebP format for photos and complex images

