import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem, Product } from '@/types'
import { PRODUCT_MAP } from '@/api/mockData'
import {
  cartReducer,
  lineKey,
  loadCart,
  saveCart,
  summarize,
  type CartSummary,
} from './cartReducer'

/** 购物车行 + 商品快照 */
export interface CartLine extends CartItem {
  key: string
  product: Product
}

interface CartContextValue {
  /** 带商品信息的购物车行（商品已下架的行会被过滤） */
  lines: CartLine[]
  summary: CartSummary
  /** 每次成功加入购物车自增，供角标播放动画 */
  pulse: number
  /** 最近一次加入的 key，供列表高亮 */
  lastAddedKey: string | null
  addItem: (product: Product, options?: { quantity?: number; specText?: string }) => void
  removeItem: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  toggleItem: (key: string) => void
  toggleAll: (selected: boolean) => void
  removeSelected: () => void
  clear: () => void
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  // 首次渲染即从 localStorage 恢复，避免闪一下空购物车
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart)
  const [pulse, setPulse] = useState(0)
  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null)
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 任何变更都落盘
  useEffect(() => {
    saveCart(state)
  }, [state])

  useEffect(() => {
    return () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current)
    }
  }, [])

  const addItem = useCallback<CartContextValue['addItem']>((product, options = {}) => {
    const { quantity = 1, specText = '' } = options
    dispatch({ type: 'add', productId: product.id, specText, quantity })
    const key = lineKey({ productId: product.id, specText })
    setLastAddedKey(key)
    setPulse((n) => n + 1)
    if (pulseTimer.current) clearTimeout(pulseTimer.current)
    pulseTimer.current = setTimeout(() => setLastAddedKey(null), 1600)
  }, [])

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = state.items
      .map((item) => {
        const product = PRODUCT_MAP[item.productId]
        return product ? { ...item, key: lineKey(item), product } : null
      })
      .filter((line): line is CartLine => line !== null)

    return {
      lines,
      summary: summarize(state.items, (id) => PRODUCT_MAP[id]),
      pulse,
      lastAddedKey,
      addItem,
      removeItem: (key) => dispatch({ type: 'remove', key }),
      setQuantity: (key, quantity) => dispatch({ type: 'setQuantity', key, quantity }),
      toggleItem: (key) => dispatch({ type: 'toggle', key }),
      toggleAll: (selected) => dispatch({ type: 'toggleAll', selected }),
      removeSelected: () => dispatch({ type: 'removeSelected' }),
      clear: () => dispatch({ type: 'clear' }),
      isInCart: (productId) => state.items.some((i) => i.productId === productId),
    }
  }, [state, pulse, lastAddedKey, addItem])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart 必须在 <CartProvider> 内使用')
  return ctx
}
