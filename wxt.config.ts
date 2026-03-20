import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'AlgoBridge',
    description:
      'Connects DSA problems on LeetCode to practical real-world industry scenarios.',
    permissions: ['tabs', 'storage'],
  },
});
