import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppstoreOutlined, HomeOutlined, LeftOutlined, SearchOutlined } from '@ant-design/icons'
import { useIsMobile } from '@/hooks/useResponsive'
import { SearchBar } from '@/components/SearchBar'
import { CartBadge } from '@/components/CartBadge'
import './index.less'

/** 路由 -> 移动端标题 */
function resolveTitle(pathname: string): string {
  if (pathname.startsWith('/product/')) return '商品详情'
  if (pathname.startsWith('/category')) return '全部分类'
  if (pathname.startsWith('/search')) return '搜索结果'
  if (pathname.startsWith('/cart')) return '购物车'
  return '优选商城'
}

function DesktopHeader() {
  const navigate = useNavigate()
  return (
    <header className="app-header app-header--desktop">
      <div className="app-header__inner">
        <Link to="/" className="app-header__logo" onClick={() => navigate('/')}>
          <span className="app-header__logo-mark">优</span>
          <span className="app-header__logo-text">优选商城</span>
        </Link>

        <div className="app-header__search">
          <SearchBar />
        </div>

        <nav className="app-header__nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
            首页
          </NavLink>
          <NavLink to="/category" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            分类
          </NavLink>
        </nav>

        <CartBadge label="购物车" />
      </div>
    </header>
  )
}

function MobileHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isRoot = pathname === '/' || pathname === '/category' || pathname === '/cart'

  return (
    <header className="app-header app-header--mobile">
      {isRoot ? (
        <Link to="/" className="app-header__logo">
          <span className="app-header__logo-mark">优</span>
          <span className="app-header__logo-text">优选商城</span>
        </Link>
      ) : (
        <>
          <button type="button" className="app-header__back" aria-label="返回" onClick={() => navigate(-1)}>
            <LeftOutlined />
          </button>
          <h1 className="app-header__title">{resolveTitle(pathname)}</h1>
        </>
      )}

      {isRoot && <CartBadge compact />}
    </header>
  )
}

function MobileTabBar() {
  return (
    <nav className="app-tabbar safe-bottom">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
        <HomeOutlined />
        <span>首页</span>
      </NavLink>
      <NavLink to="/category" className={({ isActive }) => (isActive ? 'is-active' : '')}>
        <AppstoreOutlined />
        <span>分类</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => (isActive ? 'is-active' : '')}>
        <SearchOutlined />
        <span>搜索</span>
      </NavLink>
      <div className="app-tabbar__cart">
        <CartBadge compact />
        <span>购物车</span>
      </div>
    </nav>
  )
}

export function AppLayout() {
  const isMobile = useIsMobile()

  return (
    <div className={`app-layout${isMobile ? ' is-mobile' : ''}`}>
      {isMobile ? <MobileHeader /> : <DesktopHeader />}

      <main className="app-layout__main">
        <Outlet />
      </main>

      {isMobile ? (
        <MobileTabBar />
      ) : (
        <footer className="app-footer">
          <div className="app-footer__inner">
            <p>优选商城 · 前端演示项目</p>
            <p>全部商品与订单数据均为本地 Mock，不涉及真实交易与支付</p>
          </div>
        </footer>
      )}
    </div>
  )
}
