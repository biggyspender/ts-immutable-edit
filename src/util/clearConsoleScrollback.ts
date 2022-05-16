export function clearConsoleScrollback() {
  process.stdout.write('\u001b[3J\u001b[1J');
}
