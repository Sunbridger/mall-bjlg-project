import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** 路由切换时回到页面顶部（PC 端滚动的是 window） */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
