import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'
import { AppLayout } from '@/components/AppLayout'
import './router.less'

// 页面级懒加载：首屏只加载首页，其余按路由分包
const Home = lazy(() => import('@/pages/Home'))
const Category = lazy(() => import('@/pages/Category'))
const Search = lazy(() => import('@/pages/Search'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const Cart = lazy(() => import('@/pages/Cart'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function PageFallback() {
  return (
    <div className="route-fallback">
      <Spin size="large" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="category" element={<Category />} />
          <Route path="category/:id" element={<Category />} />
          <Route path="search" element={<Search />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
