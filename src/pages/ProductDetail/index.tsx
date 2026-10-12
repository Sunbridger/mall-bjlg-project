import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { App, Button, Skeleton, Tag } from 'antd'
import { ShoppingCartOutlined, ThunderboltOutlined } from '@ant-design/icons'
import type { Product } from '@/types'
import { fetchProductById, fetchRelated } from '@/api/product'
import { useCart } from '@/store/cart'
import { useIsMobile } from '@/hooks/useResponsive'
import { formatDiscount, formatPrice, formatSales } from '@/utils/format'
import { handleImageError } from '@/utils/image'
import { defaultSpecs, specTextOf } from '@/utils/product'
import { ProductGrid } from '@/components/ProductGrid'
import { QuantityStepper } from '@/components/QuantityStepper'
import { EmptyState } from '@/components/EmptyState'
import './ProductDetail.less'

export default function ProductDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { addItem } = useCart()
  const { message } = App.useApp()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setActiveImage(0)
    setQuantity(1)

    fetchProductById(id).then((found) => {
      if (cancelled) return
      setProduct(found)
      setSelectedSpecs(found ? defaultSpecs(found) : {})
      setLoading(false)
      if (found) fetchRelated(found, 5).then((list) => !cancelled && setRelated(list))
    })

    return () => {
      cancelled = true
    }
  }, [id])

  const discount = useMemo(
    () => (product ? formatDiscount(product.price, product.originalPrice) : null),
    [product],
  )

  const specText = specTextOf(selectedSpecs)

  const handleAdd = (thenGoCart = false) => {
    if (!product) return
    addItem(product, { quantity, specText })
    if (thenGoCart) {
      navigate('/cart')
      return
    }
    message.success({ content: `已加入购物车 × ${quantity}`, duration: 1.2 })
  }

  if (loading) {
    return (
      <div className="detail page">
        <div className="detail__hero">
          <Skeleton.Image active className="detail__skeleton-img" />
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="detail page">
        <EmptyState
          description="商品不存在或已下架"
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              回到首页
            </Button>
          }
        />
      </div>
    )
  }

  const soldOut = product.stock <= 0
  const maxQuantity = Math.max(1, Math.min(product.stock, 99))

  const gallery = (
    <div className="detail__gallery">
      <div className="detail__stage">
        <img
          key={activeImage}
          src={product.images[activeImage]}
          alt={product.name}
          onError={handleImageError(`mall-${product.id}-${activeImage}`)}
        />
      </div>
      <div className="detail__thumbs">
        {product.images.map((image, index) => (
          <button
            type="button"
            key={image}
            className={`detail__thumb${index === activeImage ? ' is-active' : ''}`}
            aria-label={`查看第 ${index + 1} 张图`}
            onMouseEnter={() => !isMobile && setActiveImage(index)}
            onClick={() => setActiveImage(index)}
          >
            <img src={image} alt="" onError={handleImageError(`mall-${product.id}-${index}`)} />
          </button>
        ))}
      </div>
    </div>
  )

  const actions = (
    <div className="detail__actions">
      <QuantityStepper value={quantity} onChange={setQuantity} max={maxQuantity} />
      <Button
        size="large"
        icon={<ShoppingCartOutlined />}
        disabled={soldOut}
        onClick={() => handleAdd(false)}
      >
        加入购物车
      </Button>
      <Button
        size="large"
        type="primary"
        icon={<ThunderboltOutlined />}
        disabled={soldOut}
        onClick={() => handleAdd(true)}
      >
        {soldOut ? '已售罄' : '立即购买'}
      </Button>
    </div>
  )

  return (
    <div className="detail page">
      <div className="detail__hero">
        {gallery}

        <div className="detail__info">
          <h1 className="detail__name">{product.name}</h1>

          <div className="detail__tags">
            {product.tags.map((tag) => (
              <Tag key={tag} color="red" bordered={false}>
                {tag}
              </Tag>
            ))}
          </div>

          <div className="detail__price-box">
            <div className="detail__price-row">
              <span className="detail__price">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <del className="detail__origin">{formatPrice(product.originalPrice)}</del>
              )}
              {discount && <span className="detail__discount">{discount}</span>}
            </div>
            <div className="detail__stats">
              <span>已售 {formatSales(product.sales)}</span>
              <span>评分 {product.rating.toFixed(1)}</span>
              <span>库存 {product.stock}</span>
            </div>
          </div>

          {product.specs.map((group) => (
            <div className="detail__spec" key={group.name}>
              <span className="detail__spec-label">{group.name}</span>
              <div className="detail__spec-options">
                {group.options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`spec-option${
                      selectedSpecs[group.name] === option ? ' is-active' : ''
                    }`}
                    onClick={() =>
                      setSelectedSpecs((prev) => ({ ...prev, [group.name]: option }))
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="detail__meta">
            <span>品牌：{product.brand}</span>
            <span>分类：{product.categoryName} / {product.subCategory}</span>
          </div>

          {!isMobile && actions}
        </div>
      </div>

      <section className="detail__desc">
        <h2 className="detail__section-title">商品详情</h2>
        <p>{product.desc}</p>
      </section>

      {related.length > 0 && (
        <section className="detail__related">
          <h2 className="detail__section-title">相关推荐</h2>
          <ProductGrid products={related} />
        </section>
      )}

      {isMobile && (
        <div className="detail__bar safe-bottom">
          <button type="button" className="detail__bar-icon" onClick={() => navigate('/cart')}>
            <ShoppingCartOutlined />
            <span>购物车</span>
          </button>
          <div className="detail__bar-actions">{actions}</div>
        </div>
      )}
    </div>
  )
}
