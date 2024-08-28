const args = process.argv.slice(3);
const ms = Number.parseInt(args[0] ?? 10000, 10);

new Promise((resolve) => {
  setTimeout(resolve, ms);
}).then(() => {
  console.error(`
  Script timeout after ${ms}ms.
  Please check your script to stop all background process and avoid stalled promises.
  `);
  process.exit(1);
});
