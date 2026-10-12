import type { Category, Product } from '@/types'
import { DESC_SNIPPETS, SEED_CATEGORIES, SPEC_TEMPLATES } from './seed'
import { productImage } from '@/utils/image'

/** 32 位字符串哈希，保证同一 id 每次生成结果一致（不使用 Math.random，便于测试） */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 由 id 派生 [0,1) 的确定性伪随机数 */
function rand(id: string, salt: string): number {
  return (hash(`${id}:${salt}`) % 100000) / 100000
}

/** 在 [min, max] 内派生一个确定性整数 */
function randInt(id: string, salt: string, min: number, max: number): number {
  return min + Math.floor(rand(id, salt) * (max - min + 1))
}

/** 把 items 按 perSub 顺序切分并打上对应的二级分类名 */
function assignSubCategories(name: string, subs: string[], perSub: number[], total: number): string[] {
  if (subs.reduce((a, _, i) => a + (perSub[i] ?? 0), 0) === total) {
    const result: string[] = []
    subs.forEach((sub, i) => {
      for (let k = 0; k < (perSub[i] ?? 0); k++) result.push(sub)
    })
    return result
  }
  // 种子数据与分组不匹配时降级为“其他”，避免开发期报错
  console.warn(`[mockData] 分类「${name}」的 perSub 与商品数量不一致，已降级为「其他」`)
  return new Array(total).fill('其他')
}

export const CATEGORIES: Category[] = SEED_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  icon: c.icon,
  children: c.subs,
}))

export const PRODUCTS: Product[] = SEED_CATEGORIES.flatMap((category) => {
  const subs = assignSubCategories(category.name, category.subs, category.perSub, category.items.length)
  const specs = SPEC_TEMPLATES[category.id] ?? []

  return category.items.map((seed, index) => {
    const id = `${category.id}-${index + 1}`
    const originalPrice = seed.o ?? seed.p
    return {
      id,
      name: seed.n,
      brand: seed.b,
      price: seed.p,
      originalPrice,
      categoryId: category.id,
      categoryName: category.name,
      subCategory: subs[index],
      tags: seed.t,
      sales: randInt(id, 'sales', 120, 48000),
      rating: Number((4 + rand(id, 'rating')).toFixed(1)),
      stock: randInt(id, 'stock', 8, 480),
      images: [0, 1, 2, 3].map((i) => productImage(id, i)),
      desc: `${seed.n}。${DESC_SNIPPETS[category.id] ?? ''}${seed.b} 官方出品，支持七天无理由退换（演示数据）。`,
      specs,
    }
  })
})

/** id -> 商品，供详情页 O(1) 查询 */
export const PRODUCT_MAP: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p]),
)

/** 分类 id -> 分类 */
export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
)

/**
 * 首页轮播 Banner。
 * 背景直接取该品类下一件商品的实拍图，不用纯色渐变；
 * 文字可读性由 Home.less 里叠的一层压暗遮罩保证。
 */
export const BANNERS = [
  {
    id: 'b1',
    title: '秋季数码焕新',
    subtitle: '旗舰手机 / 降噪耳机 限时直降',
    keyword: '降噪耳机',
    image: productImage('digital-7', 1, 1200),
  },
  {
    id: 'b2',
    title: '秋冬衣橱上新',
    subtitle: '羽绒服 · 摇粒绒 满 299 减 50',
    keyword: '羽绒服',
    image: productImage('clothing-4', 1, 1200),
  },
  {
    id: 'b3',
    title: '囤货季 · 食品专场',
    subtitle: '坚果 / 牛奶 / 咖啡 第二件半价',
    keyword: '咖啡',
    image: productImage('food-8', 1, 1200),
  },
  {
    id: 'b4',
    title: '家居好物节',
    subtitle: '床品 · 厨具 · 小家电 低至 5 折',
    keyword: '四件套',
    image: productImage('home-1', 1, 1200),
  },
]
