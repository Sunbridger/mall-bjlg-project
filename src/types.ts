/** 商品规格组，例如 { name: '颜色', options: ['深空黑', '银色'] } */
export interface SpecGroup {
  name: string
  options: string[]
}

export interface Product {
  id: string
  name: string
  brand: string
  /** 现价（元） */
  price: number
  /** 划线原价（元），等于 price 时表示无优惠 */
  originalPrice: number
  categoryId: string
  categoryName: string
  /** 二级分类，例如「手机通讯」 */
  subCategory: string
  /** 卖点标签，用于列表展示与搜索命中 */
  tags: string[]
  /** 累计销量（件） */
  sales: number
  /** 评分 0-5，保留一位小数 */
  rating: number
  /** 库存（件） */
  stock: number
  /** 商品图，至少 1 张，第 0 张为主图 */
  images: string[]
  desc: string
  specs: SpecGroup[]
}

export interface Category {
  id: string
  name: string
  /** emoji 图标，用于分类入口 */
  icon: string
  /** 该分类下的二级分类 */
  children: string[]
}

export interface CartItem {
  productId: string
  quantity: number
  /** 是否勾选结算 */
  selected: boolean
  /** 已选规格，如「颜色:深空黑 / 版本:256GB」 */
  specText: string
}

export type SortKey = 'default' | 'sales' | 'price-asc' | 'price-desc' | 'rating'

export interface PriceRange {
  min?: number
  max?: number
}

export interface ProductQuery {
  keyword?: string
  categoryId?: string
  subCategory?: string
  priceRange?: PriceRange
  sort?: SortKey
  page?: number
  pageSize?: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
