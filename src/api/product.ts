/**
 * 模拟后端接口层。
 *
 * 所有函数返回 Promise 并带人为延迟，用来复现真实的加载/骨架屏体验；
 * 页面只依赖这一层，将来接真实后端时替换实现即可，不改动任何组件。
 */
import type { Category, PageResult, Product, ProductQuery } from '@/types'
import { CATEGORIES, PRODUCT_MAP, PRODUCTS } from './mockData'
import { HOT_KEYWORDS } from './seed'
import { queryProducts, suggestKeywords } from '@/utils/search'

/** 模拟网络延迟（毫秒） */
const LATENCY = 260

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function respond<T>(data: T, ms = LATENCY): Promise<T> {
  await sleep(ms)
  return data
}

/** 全部一级分类 */
export function fetchCategories(): Promise<Category[]> {
  return respond(CATEGORIES, 120)
}

/** 热门搜索词 */
export function fetchHotKeywords(): Promise<string[]> {
  return respond(HOT_KEYWORDS, 80)
}

/** 分页查询商品：支持关键词 / 分类 / 价格区间 / 排序 */
export async function fetchProducts(query: ProductQuery = {}): Promise<PageResult<Product>> {
  const { page = 1, pageSize = 20 } = query
  const all = queryProducts(PRODUCTS, query)
  const start = (page - 1) * pageSize
  const list = all.slice(start, start + pageSize)
  return respond({
    list,
    total: all.length,
    page,
    pageSize,
    hasMore: start + list.length < all.length,
  })
}

/**
 * 同步联想词。走本地索引、不加延迟，避免输入时每个字符都跳一下骨架屏。
 * 数据量到万级时应换成防抖 + 后端接口。
 */
export function suggestKeywordsFor(keyword: string, limit = 8): string[] {
  return suggestKeywords(PRODUCTS, keyword, limit)
}

/** 商品详情 */
export function fetchProductById(id: string): Promise<Product | null> {
  return respond(PRODUCT_MAP[id] ?? null)
}

/** 同分类下的推荐商品（排除自身） */
export async function fetchRelated(product: Product, limit = 6): Promise<Product[]> {
  const sameCategory = PRODUCTS.filter(
    (p) => p.categoryId === product.categoryId && p.id !== product.id,
  )
  const fill = PRODUCTS.filter((p) => p.categoryId !== product.categoryId && p.id !== product.id)
  return respond([...sameCategory, ...fill].slice(0, limit), 200)
}

/** 首页「猜你喜欢」：按综合热度取前 N，请求新的一批时用 offset 轮换 */
export async function fetchRecommended(offset = 0, limit = 10): Promise<Product[]> {
  const ranked = queryProducts(PRODUCTS, { sort: 'default' })
  const picked: Product[] = []
  for (let i = 0; i < limit && ranked.length > 0; i++) {
    picked.push(ranked[(offset + i) % ranked.length])
  }
  return respond(picked, 300)
}
