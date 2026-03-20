import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'AlgoBridge',
    description:
      'Connects DSA problems on LeetCode to practical real-world industry scenarios.',
    permissions: ['tabs', 'storage'],
    browser_action: {
      default_title: 'Open AlgoBridge',
    },
    action: {
      default_title: 'Open AlgoBridge',
    },
  },
});
