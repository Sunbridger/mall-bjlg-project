import { Link } from 'react-router-dom'
import type { Category } from '@/types'
import './index.less'

interface Props {
  categories: Category[]
  activeId?: string
  /** 二级分类，仅 PC 侧边栏展示 */
  children?: string[]
  activeChild?: string
  onChildChange?: (child?: string) => void
}

/** 移动端：横向滚动的分类 tab */
export function CategoryTabs({ categories, activeId }: Props) {
  return (
    <div className="category-tabs">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.id}`}
          className={`filter-chip${activeId === category.id ? ' is-active' : ''}`}
        >
          <span aria-hidden>{category.icon}</span>
          {category.name}
        </Link>
      ))}
    </div>
  )
}

/** PC 端：左侧分类树 */
export function CategorySidebar({ categories, activeId, children, activeChild, onChildChange }: Props) {
  return (
    <nav className="category-sidebar">
      {categories.map((category) => {
        const active = category.id === activeId
        return (
          <div className="category-sidebar__group" key={category.id}>
            <Link
              to={`/category/${category.id}`}
              className={`category-sidebar__item${active ? ' is-active' : ''}`}
            >
              <span className="category-sidebar__icon" aria-hidden>
                {category.icon}
              </span>
              {category.name}
            </Link>

            {active && children && children.length > 0 && (
              <div className="category-sidebar__children">
                <button
                  type="button"
                  className={`category-sidebar__child${!activeChild ? ' is-active' : ''}`}
                  onClick={() => onChildChange?.(undefined)}
                >
                  全部
                </button>
                {children.map((child) => (
                  <button
                    type="button"
                    key={child}
                    className={`category-sidebar__child${activeChild === child ? ' is-active' : ''}`}
                    onClick={() => onChildChange?.(child)}
                  >
                    {child}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
