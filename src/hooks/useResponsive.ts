import { useEffect, useState } from 'react'

/** 与 styles/variables.less 的 @bp-md 保持一致 */
export const MOBILE_BREAKPOINT = 768

function query(): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}

/** 当前是否为移动端视口（< 768px），随窗口尺寸实时变化 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => query()?.matches ?? false)

  useEffect(() => {
    const mql = query()
    if (!mql) return
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
