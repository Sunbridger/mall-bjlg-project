import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import type { Category as CategoryType, PriceRange, Product, SortKey } from '@/types'
import { fetchCategories, fetchProducts } from '@/api/product'
import { CATEGORY_MAP } from '@/api/mockData'
import { useIsMobile } from '@/hooks/useResponsive'
import { CategorySidebar, CategoryTabs } from '@/components/CategoryNav'
import { FilterBar } from '@/components/FilterBar'
import { ProductGrid } from '@/components/ProductGrid'
import './Category.less'

export default function Category() {
  const { id } = useParams<{ id: string }>()
  const isMobile = useIsMobile()

  const [categories, setCategories] = useState<CategoryType[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [subCategory, setSubCategory] = useState<string | undefined>()
  const [sort, setSort] = useState<SortKey>('default')
  const [priceRange, setPriceRange] = useState<PriceRange | undefined>()

  useEffect(() => {
    fetchCategories().then(setCategories)
  }, [])

  // 切换分类时重置该分类下的筛选条件
  useEffect(() => {
    setSubCategory(undefined)
    setPriceRange(undefined)
    setSort('default')
  }, [id])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    // 每个分类商品量有限，一次取全，前端筛选无需翻页
    fetchProducts({ categoryId: id, subCategory, priceRange, sort, pageSize: 200 }).then((res) => {
      if (cancelled) return
      setProducts(res.list)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [id, subCategory, priceRange, sort])

  const activeCategory = id ? CATEGORY_MAP[id] : undefined

  const sidebar = useMemo(
    () => (
      <CategorySidebar
        categories={categories}
        activeId={id}
        children={activeCategory?.children}
        activeChild={subCategory}
        onChildChange={setSubCategory}
      />
    ),
    [categories, id, activeCategory, subCategory],
  )

  if (!id) return <Navigate to={`/category/${categories[0]?.id ?? 'digital'}`} replace />

  return (
    <div className="category page">
      {isMobile && (
        <CategoryTabs categories={categories} activeId={id} />
      )}

      <div className="category__layout">
        {!isMobile && sidebar}

        <div className="category__content">
          <FilterBar
            sort={sort}
            onSortChange={setSort}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
          />

          <ProductGrid products={products} loading={loading} emptyText="该分类下暂无商品" />
        </div>
      </div>
    </div>
  )
}
