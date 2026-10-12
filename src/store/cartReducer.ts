/**
 * 购物车纯逻辑：reducer + 派生计算 + 持久化。
 * 不依赖 React，可直接单元测试。
 */
import type { CartItem, Product } from '@/types'

export interface CartState {
  items: CartItem[]
}

export const CART_STORAGE_KEY = 'mall-cart-v1'
export const MAX_QUANTITY = 99

export type CartAction =
  | { type: 'add'; productId: string; specText: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'setQuantity'; key: string; quantity: number }
  | { type: 'toggle'; key: string }
  | { type: 'toggleAll'; selected: boolean }
  | { type: 'removeSelected' }
  | { type: 'clear' }
  | { type: 'hydrate'; state: CartState }

export const emptyCart: CartState = { items: [] }

/** 购物车行主键：同一商品的不同规格算两行 */
export function lineKey(item: Pick<CartItem, 'productId' | 'specText'>): string {
  return `${item.productId}__${item.specText}`
}

/** 数量收敛到 [1, MAX_QUANTITY] */
function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)))
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'hydrate':
      return action.state

    case 'add': {
      const quantity = clampQuantity(action.quantity)
      const key = lineKey(action)
      const existing = state.items.find((i) => lineKey(i) === key)
      // 已在车里：累加数量并勾选，而不是新增一行
      if (existing) {
        return {
          items: state.items.map((i) =>
            lineKey(i) === key
              ? { ...i, quantity: clampQuantity(i.quantity + quantity), selected: true }
              : i,
          ),
        }
      }
      return {
        items: [
          ...state.items,
          { productId: action.productId, specText: action.specText, quantity, selected: true },
        ],
      }
    }

    case 'remove':
      return { items: state.items.filter((i) => lineKey(i) !== action.key) }

    case 'setQuantity': {
      const quantity = clampQuantity(action.quantity)
      return {
        items: state.items.map((i) => (lineKey(i) === action.key ? { ...i, quantity } : i)),
      }
    }

    case 'toggle':
      return {
        items: state.items.map((i) =>
          lineKey(i) === action.key ? { ...i, selected: !i.selected } : i,
        ),
      }

    case 'toggleAll':
      return { items: state.items.map((i) => ({ ...i, selected: action.selected })) }

    case 'removeSelected':
      return { items: state.items.filter((i) => !i.selected) }

    case 'clear':
      return emptyCart

    default:
      return state
  }
}

/** 已存在行则把数量补满（用于「再次购买」等场景的容错） */
export function mergeInto(existing: CartItem[], incoming: CartItem[]): CartItem[] {
  const map = new Map(existing.map((i) => [lineKey(i), { ...i }]))
  for (const item of incoming) {
    const key = lineKey(item)
    const found = map.get(key)
    if (found) found.quantity = clampQuantity(found.quantity + item.quantity)
    else map.set(key, { ...item, quantity: clampQuantity(item.quantity) })
  }
  return [...map.values()]
}

export interface CartSummary {
  /** 购物车行数 */
  lines: number
  /** 商品总件数（含数量） */
  count: number
  /** 已勾选件数 */
  selectedCount: number
  /** 已勾选商品金额合计 */
  selectedAmount: number
  /** 是否全选（空车视为未全选） */
  allSelected: boolean
  /** 勾选商品可省金额 */
  savedAmount: number
}

/** 派生统计。productOf 由调用方提供（购物车只存 id，价格实时取自商品数据） */
export function summarize(
  items: CartItem[],
  productOf: (id: string) => Product | undefined,
): CartSummary {
  let count = 0
  let selectedCount = 0
  let selectedAmount = 0
  let savedAmount = 0

  for (const item of items) {
    const product = productOf(item.productId)
    count += item.quantity
    if (!item.selected) continue
    selectedCount += item.quantity
    if (product) {
      selectedAmount += product.price * item.quantity
      const saved = product.originalPrice - product.price
      if (saved > 0) savedAmount += saved * item.quantity
    }
  }

  return {
    lines: items.length,
    count,
    selectedCount,
    selectedAmount,
    savedAmount,
    allSelected: items.length > 0 && items.every((i) => i.selected),
  }
}

/** 从 localStorage 读取（损坏/不可用时静默返回空车） */
export function loadCart(storage: Storage | undefined = safeStorage()): CartState {
  if (!storage) return emptyCart
  try {
    const raw = storage.getItem(CART_STORAGE_KEY)
    if (!raw) return emptyCart
    const parsed = JSON.parse(raw) as CartState
    if (!parsed || !Array.isArray(parsed.items)) return emptyCart
    const items = parsed.items
      .filter((i) => i && typeof i.productId === 'string')
      .map<CartItem>((i) => ({
        productId: i.productId,
        specText: typeof i.specText === 'string' ? i.specText : '',
        quantity: clampQuantity(i.quantity),
        selected: i.selected !== false,
      }))
    return { items }
  } catch {
    return emptyCart
  }
}

/** 写入 localStorage */
export function saveCart(state: CartState, storage: Storage | undefined = safeStorage()): void {
  if (!storage) return
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* 隐私模式 / 配额满：忽略，购物车退化为会话内有效 */
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}
