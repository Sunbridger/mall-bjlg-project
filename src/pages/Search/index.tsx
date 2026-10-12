import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Tag } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import type { PriceRange, Product, SortKey } from '@/types'
import { fetchHotKeywords, fetchProducts } from '@/api/product'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { SearchBar } from '@/components/SearchBar'
import { FilterBar } from '@/components/FilterBar'
import { ProductGrid } from '@/components/ProductGrid'
import './Search.less'

const PAGE_SIZE = 20

function splitKeywords(text: string): string[] {
  return text.split(/\s+/).map((k) => k.trim()).filter(Boolean)
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const [hotKeywords, setHotKeywords] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sort, setSort] = useState<SortKey>('default')
  const [priceRange, setPriceRange] = useState<PriceRange | undefined>()

  const page = useRef(1)
  const prevQuery = useRef(query)
  const { history, push: pushHistory, remove: removeHistory, clear: clearHistory } = useSearchHistory()

  useEffect(() => {
    fetchHotKeywords().then(setHotKeywords)
  }, [])

  // 单一取数入口：关键词 / 排序 / 价格任一变化都重新查第一页。
  // 关键词变化时先把筛选条件恢复到默认，靠状态更新触发下一轮，避免双重请求。
  useEffect(() => {
    if (prevQuery.current !== query) {
      prevQuery.current = query
      const needReset = sort !== 'default' || priceRange !== undefined
      setSort('default')
      setPriceRange(undefined)
      pushHistory(query)
      if (needReset) return
    }

    page.current = 1

    if (!query.trim()) {
      setProducts([])
      setTotal(0)
      setHasMore(false)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    fetchProducts({ keyword: query, sort, priceRange, page: 1, pageSize: PAGE_SIZE }).then((res) => {
      if (cancelled) return
      setProducts(res.list)
      setTotal(res.total)
      setHasMore(res.hasMore)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [query, sort, priceRange, pushHistory])

  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    const next = page.current + 1
    const res = await fetchProducts({
      keyword: query,
      sort,
      priceRange,
      page: next,
      pageSize: PAGE_SIZE,
    })
    page.current = next
    setProducts((prev) => [...prev, ...res.list])
    setHasMore(res.hasMore)
    setLoadingMore(false)
  }, [query, sort, priceRange])

  const goto = (keyword: string) => setSearchParams({ q: keyword })

  const keywords = splitKeywords(query)

  return (
    <div className="search page">
      <div className="search__bar">
        <SearchBar defaultValue={query} onSubmit={goto} />
      </div>

      {!query.trim() ? (
        <div className="search__panels">
          {history.length > 0 && (
            <section className="search__panel">
              <header className="search__panel-head">
                <h2>搜索历史</h2>
                <Button type="link" size="small" onClick={clearHistory}>
                  清空
                </Button>
              </header>
              <div className="search__chips">
                {history.map((keyword) => (
                  <Tag
                    key={keyword}
                    className="search__chip"
                    closable
                    closeIcon={<CloseOutlined />}
                    onClose={(e) => {
                      e.preventDefault()
                      removeHistory(keyword)
                    }}
                    onClick={() => goto(keyword)}
                  >
                    {keyword}
                  </Tag>
                ))}
              </div>
            </section>
          )}

          <section className="search__panel">
            <header className="search__panel-head">
              <h2>热门搜索</h2>
            </header>
            <div className="search__chips">
              {hotKeywords.map((keyword) => (
                <Tag key={keyword} className="search__chip search__chip--hot" onClick={() => goto(keyword)}>
                  {keyword}
                </Tag>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <>
          <div className="search__summary">
            <span>
              搜索「<strong>{keywords.join(' ')}</strong>」，找到 {loading ? '…' : total} 件商品
            </span>
          </div>

          <FilterBar
            sort={sort}
            onSortChange={setSort}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
          />

          <ProductGrid
            products={products}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            emptyText={`没有找到与「${query}」相关的商品`}
            emptyExtra={
              <Button type="primary" onClick={() => goto('')}>
                重新搜索
              </Button>
            }
          />
        </>
      )}
    </div>
  )
}
