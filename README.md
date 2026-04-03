# The Hall of Fame

An immersive, 800-piece virtual web exhibition archive featuring a 3D cylindrical gallery.

## Features
- **High-Performance Rendering**: Utilizes Three.js `InstancedMesh` to render 800 individual frames smoothly at 60fps in a single draw call.
- **Atmospheric Navigation**: Cinematic camera movement via GSAP and scroll-based exploration.
- **Optimized for GitHub Pages**: Designed as a static frontend site that can be effortlessly deployed on GH Pages via Vite.
- **Custom Font Engine**: Draws text to CanvasTextures on the fly allowing any system or loaded font (like Futura PT) to be used natively within the 3D space.

## Development Setup

First, install dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

## Building for Production (GitHub Pages)

To create a production build ready for GitHub Pages:
```bash
npm run build
```
The compiled files will be located in the `/dist` directory. The project has been pre-configured with a relative base path (`base: "./"`) in `vite.config.js` to ensure asset URLs resolve correctly regardless of the repository name on GitHub.

## Customization
- Adjust `numItems`, `rings`, and `radius` parameters within `main.js` to change the layout density of the exhibition.
- Import a CSV parser mapping to assign distinct textual details per node!
