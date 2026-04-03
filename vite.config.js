import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Ensures relative paths for assets so Github Pages works regardless of the repo name
});
