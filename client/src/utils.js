export function fmtMoney(n) {
  return 'RM ' + Math.round(n).toLocaleString('en-MY');
}
