export function formatNum(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}
