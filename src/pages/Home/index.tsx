import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Carousel } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import type { Category, Product } from '@/types'
import { fetchCategories, fetchRecommended } from '@/api/product'
import { BANNERS } from '@/api/mockData'
import { useIsMobile } from '@/hooks/useResponsive'
import { SearchBar } from '@/components/SearchBar'
import { ProductGrid } from '@/components/ProductGrid'
import './Home.less'

const PAGE_SIZE = 10

export default function Home() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  // 已加载的批次数，兼作 fetchRecommended 的 offset
  const batches = useRef(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([fetchCategories(), fetchRecommended(0, PAGE_SIZE)]).then(([cats, list]) => {
      if (cancelled) return
      setCategories(cats)
      setProducts(list)
      batches.current = 1
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    const offset = batches.current * PAGE_SIZE
    const list = await fetchRecommended(offset, PAGE_SIZE)
    setProducts((prev) => {
      // 推荐按热度轮换，取满一轮后不再有新商品：去重后为空即到底
      const seen = new Set(prev.map((p) => p.id))
      const fresh = list.filter((p) => !seen.has(p.id))
      if (fresh.length === 0) {
        setHasMore(false)
        return prev
      }
      return [...prev, ...fresh]
    })
    batches.current += 1
    setLoadingMore(false)
  }, [])

  return (
    <div className="home page">
      {isMobile && (
        <div className="home__search">
          <SearchBar />
        </div>
      )}

      <Carousel autoplay autoplaySpeed={4000} className="home__banner" dots>
        {BANNERS.map((banner) => (
          <div key={banner.id}>
            <button
              type="button"
              className="home__banner-slide"
              style={{ '--banner-image': `url(${banner.image})` } as CSSProperties}
              onClick={() => navigate(`/search?q=${encodeURIComponent(banner.keyword)}`)}
            >
              <span className="home__banner-title">{banner.title}</span>
              <span className="home__banner-subtitle">{banner.subtitle}</span>
              <span className="home__banner-cta">立即查看 →</span>
            </button>
          </div>
        ))}
      </Carousel>

      <section className="home__categories">
        {categories.map((category) => (
          <Link key={category.id} to={`/category/${category.id}`} className="home__category">
            <span className="home__category-icon" aria-hidden>
              {category.icon}
            </span>
            <span className="home__category-name">{category.name}</span>
          </Link>
        ))}
      </section>

      <section className="home__feed">
        <h2 className="home__section-title">猜你喜欢</h2>
        <ProductGrid
          products={products}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          emptyText="暂无推荐商品"
        />
      </section>
    </div>
  )
}
