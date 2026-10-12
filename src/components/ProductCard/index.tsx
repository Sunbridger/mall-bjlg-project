import { memo, useCallback, type MouseEvent } from 'react'
import { App, Button } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import type { Product } from '@/types'
import { useCart } from '@/store/cart'
import { formatDiscount, formatPrice, formatSales } from '@/utils/format'
import { handleImageError } from '@/utils/image'
import { defaultSpecText } from '@/utils/product'
import './index.less'

interface Props {
  product: Product
  /** 详情页推荐位等场景可关掉加购按钮 */
  showAddButton?: boolean
}

function ProductCardBase({ product, showAddButton = true }: Props) {
  const navigate = useNavigate()
  const { addItem, lastAddedKey } = useCart()
  const { message } = App.useApp()

  const detailPath = `/product/${product.id}`
  const discount = formatDiscount(product.price, product.originalPrice)
  const justAdded = lastAddedKey === `${product.id}__${defaultSpecText(product)}`

  const handleAdd = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      // 阻止冒泡，避免点加购时同时跳详情
      e.preventDefault()
      e.stopPropagation()
      addItem(product, { quantity: 1, specText: defaultSpecText(product) })
      message.success({ content: '已加入购物车', duration: 1.2 })
    },
    [addItem, message, product],
  )

  return (
    <article className="product-card" onClick={() => navigate(detailPath)}>
      <div className="product-card__media">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={handleImageError(`mall-${product.id}-0`)}
        />
        {discount && <span className="product-card__discount">{discount}</span>}
        {justAdded && <span className="product-card__added">已加入 ✓</span>}
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">
          <Link to={detailPath}>{product.name}</Link>
        </h3>

        <div className="product-card__tags">
          {product.tags.slice(0, 2).map((tag) => (
            <span className="product-card__tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className="product-card__meta">
          <span>已售 {formatSales(product.sales)}</span>
          <span>{product.rating.toFixed(1)} 分</span>
        </div>

        <div className="product-card__footer">
          <div className="product-card__prices">
            <span className="product-card__price">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <del className="product-card__origin">{formatPrice(product.originalPrice)}</del>
            )}
          </div>

          {showAddButton && (
            <Button
              type="primary"
              shape="circle"
              size="small"
              aria-label={`将 ${product.name} 加入购物车`}
              icon={<ShoppingCartOutlined />}
              onClick={handleAdd}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export const ProductCard = memo(ProductCardBase)
