import type { Product } from '@/types'
import { joinSpecs } from './format'

/** 规格组的默认选中项：每组取第一个选项 */
export function defaultSpecs(product: Product): Record<string, string> {
  const picked: Record<string, string> = {}
  for (const group of product.specs) {
    picked[group.name] = group.options[0] ?? ''
  }
  return picked
}

/** 把已选规格拼成可展示、可持久化的文本："颜色:深空黑 / 版本:标准版" */
export function specTextOf(selected: Record<string, string>): string {
  return joinSpecs(Object.entries(selected).map(([name, value]) => `${name}:${value}`))
}

/** 商品列表里直接加购时使用的默认规格文本 */
export function defaultSpecText(product: Product): string {
  return specTextOf(defaultSpecs(product))
}
