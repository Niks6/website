import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        products: resolve(__dirname, 'products.html'),
        admin: resolve(__dirname, 'adminPage.html'),
        contact: resolve(__dirname, 'contact.html'),
        addToCart: resolve(__dirname, 'addToCart.html'),
      },
    },
  },
  // You might also need plugins if you're using React, Vue, etc.
  // plugins: [react()], // For example, if using React
});