export default defineBackground(() => {
  console.log('AlgoBridge background ready', { id: browser.runtime.id });
});
