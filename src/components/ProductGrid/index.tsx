import { Button, Skeleton } from 'antd'
import type { Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { EmptyState } from '@/components/EmptyState'
import './index.less'

interface Props {
  products: Product[]
  /** 首屏加载中（显示骨架屏） */
  loading?: boolean
  /** 加载更多中（显示按钮 loading 态） */
  loadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  emptyText?: string
  emptyExtra?: React.ReactNode
  showAddButton?: boolean
}

export function ProductGrid({
  products,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  emptyText = '没有找到相关商品',
  emptyExtra,
  showAddButton = true,
}: Props) {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: 10 }, (_, i) => (
          <div className="product-grid__skeleton" key={i}>
            <Skeleton.Image active className="product-grid__skeleton-img" />
            <Skeleton active paragraph={{ rows: 2 }} title={{ width: '80%' }} />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return <EmptyState description={emptyText} extra={emptyExtra} />
  }

  return (
    <div className="product-grid-wrap">
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} showAddButton={showAddButton} />
        ))}
      </div>

      {onLoadMore && (
        <div className="product-grid__more">
          {hasMore ? (
            <Button loading={loadingMore} onClick={onLoadMore} block>
              {loadingMore ? '加载中…' : '加载更多'}
            </Button>
          ) : (
            <span className="product-grid__end">— 已经到底啦 —</span>
          )}
        </div>
      )}
    </div>
  )
}
