export function fmtMoney(n) {
  return 'RM ' + Math.round(n).toLocaleString('en-MY');
}

/** 大额金额用 k 缩写，避免在窄栏位（如 KPI 卡片）里挤不下换行/溢出 */
export function fmtMoneyShort(n) {
  const v = Math.round(n);
  if (Math.abs(v) >= 10000) return 'RM ' + (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return fmtMoney(v);
}
