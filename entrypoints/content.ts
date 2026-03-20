export default defineContentScript({
  matches: ['*://leetcode.com/problems/*'],
  main() {
    console.log('AlgoBridge content script loaded');
  },
});
