/** 金额：1234.5 -> "1,234.50"（不含货币符号） */
export function formatAmount(value: number): string {
  const fixed = (Math.round(value * 100) / 100).toFixed(2)
  const [int, dec] = fixed.split('.')
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${dec}`
}

/** 带符号金额：1234.5 -> "¥1,234.50" */
export function formatPrice(value: number): string {
  return `¥${formatAmount(value)}`
}

/** 销量：12800 -> "1.3万"；999 -> "999" */
export function formatSales(value: number): string {
  if (value >= 10000) {
    const w = value / 10000
    return `${w >= 10 ? Math.round(w) : w.toFixed(1)}万`
  }
  return String(value)
}

/** 折扣：现价 499 / 原价 699 -> "7.1折"；无优惠返回 null */
export function formatDiscount(price: number, originalPrice: number): string | null {
  if (!originalPrice || originalPrice <= price) return null
  const zhe = (price / originalPrice) * 10
  return `${zhe.toFixed(1)}折`
}

/** 规格键拼接：["颜色:黑", "版本:标准"] -> "颜色:黑 / 版本:标准" */
export function joinSpecs(parts: string[]): string {
  return parts.filter(Boolean).join(' / ')
}
