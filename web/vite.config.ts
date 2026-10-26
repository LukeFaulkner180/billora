import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project Pages URL: https://lukefaulkner180.github.io/billora/
export default defineConfig({
  plugins: [react()],
  base: '/billora/',
});
