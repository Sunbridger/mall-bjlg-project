import type { PriceRange, Product, ProductQuery, SortKey } from '@/types'

/** 归一化：去首尾空格、转小写、去掉常见分隔符，便于宽松匹配 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s\-_/·]/g, '')
}

/** 把商品打平成可检索文本（名称 + 品牌 + 分类 + 标签） */
function haystack(product: Product): string {
  return normalize(
    [product.name, product.brand, product.categoryName, product.subCategory, ...product.tags].join(' '),
  )
}

/** 关键词是否命中商品（空关键词视为命中全部） */
export function matchProduct(product: Product, keyword: string): boolean {
  const kw = normalize(keyword.trim())
  if (!kw) return true
  // 整串命中优先；否则按空格拆词，要求全部命中（AND 语义）
  const hay = haystack(product)
  if (hay.includes(kw)) return true
  const words = keyword.trim().toLowerCase().split(/\s+/).map(normalize).filter(Boolean)
  return words.length > 1 && words.every((w) => hay.includes(w))
}

/** 价格区间过滤（两端都可选，闭区间） */
export function matchPrice(product: Product, range?: PriceRange): boolean {
  if (!range) return true
  const { min, max } = range
  if (typeof min === 'number' && product.price < min) return false
  if (typeof max === 'number' && product.price > max) return false
  return true
}

/** 综合排序权重：销量与评分共同决定「综合」顺序 */
function heat(product: Product): number {
  return product.sales * 0.7 + product.rating * 2000
}

const COMPARATORS: Record<SortKey, (a: Product, b: Product) => number> = {
  default: (a, b) => heat(b) - heat(a),
  sales: (a, b) => b.sales - a.sales,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.sales - a.sales,
}

/** 按排序键排序，返回新数组（不修改入参） */
export function sortProducts(products: Product[], sort: SortKey = 'default'): Product[] {
  const compare = COMPARATORS[sort] ?? COMPARATORS.default
  return [...products].sort(compare)
}

/** 关键词 / 分类 / 价格 / 排序 一站式筛选排序，纯函数 */
export function queryProducts(products: Product[], query: ProductQuery = {}): Product[] {
  const { keyword = '', categoryId, subCategory, priceRange, sort = 'default' } = query
  const filtered = products.filter(
    (p) =>
      matchProduct(p, keyword) &&
      (!categoryId || p.categoryId === categoryId) &&
      (!subCategory || p.subCategory === subCategory) &&
      matchPrice(p, priceRange),
  )
  return sortProducts(filtered, sort)
}

/** 搜索联想词：从商品名与标签中挑出包含关键词的候选项，去重后截断 */
export function suggestKeywords(products: Product[], keyword: string, limit = 8): string[] {
  const kw = normalize(keyword.trim())
  if (!kw) return []
  const pool = new Set<string>()
  for (const p of products) {
    if (normalize(p.name).includes(kw)) pool.add(p.name)
    if (normalize(p.brand).includes(kw)) pool.add(p.brand)
    for (const tag of p.tags) if (normalize(tag).includes(kw)) pool.add(tag)
    if (pool.size >= limit * 3) break
  }
  return [...pool].slice(0, limit)
}
