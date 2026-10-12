import { useEffect, useState } from 'react'
import { Badge } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useCart } from '@/store/cart'
import './CartBadge.less'

interface Props {
  /** 移动端底栏用紧凑样式 */
  compact?: boolean
  label?: string
}

export function CartBadge({ compact = false, label }: Props) {
  const { summary, pulse } = useCart()
  const [bump, setBump] = useState(false)

  // 每次加购（pulse 变化）播放一次跳动动画
  useEffect(() => {
    if (pulse === 0) return
    setBump(true)
    const timer = setTimeout(() => setBump(false), 320)
    return () => clearTimeout(timer)
  }, [pulse])

  return (
    <Link to="/cart" className={`cart-badge${compact ? ' cart-badge--compact' : ''}`}>
      <Badge count={summary.count} size="small" offset={[2, -2]} overflowCount={99}>
        <ShoppingCartOutlined className={`cart-badge__icon${bump ? ' is-bump' : ''}`} />
      </Badge>
      {label && <span className="cart-badge__label">{label}</span>}
    </Link>
  )
}
