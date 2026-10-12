import { useState } from 'react'
import { DownOutlined, CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons'
import { Dropdown, Popover } from 'antd'
import type { PriceRange, SortKey } from '@/types'
import { useIsMobile } from '@/hooks/useResponsive'
import './FilterBar.less'

export interface PricePreset {
  label: string
  range?: PriceRange
}

/** 价格区间预设，区间为闭区间且互不重叠（商品价格为整数） */
export const PRICE_PRESETS: PricePreset[] = [
  { label: '全部价格', range: undefined },
  { label: '100 以下', range: { max: 99 } },
  { label: '100 - 499', range: { min: 100, max: 499 } },
  { label: '500 - 999', range: { min: 500, max: 999 } },
  { label: '1000 - 4999', range: { min: 1000, max: 4999 } },
  { label: '5000 以上', range: { min: 5000 } },
]

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: '综合' },
  { key: 'sales', label: '销量' },
  { key: 'rating', label: '评分' },
]

function sameRange(a?: PriceRange, b?: PriceRange): boolean {
  return (a?.min ?? null) === (b?.min ?? null) && (a?.max ?? null) === (b?.max ?? null)
}

interface Props {
  sort: SortKey
  onSortChange: (sort: SortKey) => void
  priceRange?: PriceRange
  onPriceChange: (range?: PriceRange) => void
}

/** PC 端：两行筛选标签 */
function DesktopFilterBar({ sort, onSortChange, priceRange, onPriceChange }: Props) {
  const priceAsc = sort === 'price-asc'

  return (
    <div className="filter-bar">
      <div className="filter-bar__row">
        {SORT_OPTIONS.map((option) => (
          <button
            type="button"
            key={option.key}
            className={`filter-chip${sort === option.key ? ' is-active' : ''}`}
            onClick={() => onSortChange(option.key)}
          >
            {option.label}
          </button>
        ))}

        <button
          type="button"
          className={`filter-chip filter-chip--price${
            priceAsc || sort === 'price-desc' ? ' is-active' : ''
          }`}
          onClick={() => onSortChange(priceAsc ? 'price-desc' : 'price-asc')}
        >
          价格
          {priceAsc ? <CaretUpOutlined /> : <CaretDownOutlined />}
        </button>
      </div>

      <div className="filter-bar__row filter-bar__row--price">
        {PRICE_PRESETS.map((preset) => (
          <button
            type="button"
            key={preset.label}
            className={`filter-chip${sameRange(priceRange, preset.range) ? ' is-active' : ''}`}
            onClick={() => onPriceChange(preset.range)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** 移动端：单行下拉式筛选条 */
function MobileFilterBar({ sort, onSortChange, priceRange, onPriceChange }: Props) {
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const priceAsc = sort === 'price-asc'
  const priceDesc = sort === 'price-desc'
  // 价格排序独立成一个入口，排序菜单里不重复出现
  const activeSortKey: SortKey = priceAsc || priceDesc ? 'default' : sort
  const sortLabel = SORT_OPTIONS.find((o) => o.key === activeSortKey)?.label ?? '综合'
  const filterLabel = priceRange
    ? (PRICE_PRESETS.find((p) => sameRange(priceRange, p.range))?.label ?? '价格')
    : '筛选'

  const panel = (
    <div className="filter-panel">
      <div className="filter-panel__title">价格区间</div>
      <div className="filter-panel__chips">
        {PRICE_PRESETS.map((preset) => (
          <button
            type="button"
            key={preset.label}
            className={`filter-panel__chip${sameRange(priceRange, preset.range) ? ' is-active' : ''}`}
            onClick={() => {
              onPriceChange(preset.range)
              setFilterOpen(false)
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="filter-bar filter-bar--mobile">
      <Dropdown
        trigger={['click']}
        open={sortOpen}
        onOpenChange={setSortOpen}
        placement="bottomLeft"
        menu={{
          items: SORT_OPTIONS.map((option) => ({ key: option.key, label: option.label })),
          selectable: true,
          selectedKeys: [activeSortKey],
          onClick: ({ key }) => {
            onSortChange(key as SortKey)
            setSortOpen(false)
          },
        }}
      >
        <button type="button" className={`filter-bar__item${activeSortKey !== 'default' ? ' is-active' : ''}`}>
          {sortLabel}
          <DownOutlined className="filter-bar__caret" />
        </button>
      </Dropdown>

      <button
        type="button"
        className={`filter-bar__item${priceAsc || priceDesc ? ' is-active' : ''}`}
        onClick={() => onSortChange(priceAsc ? 'price-desc' : 'price-asc')}
      >
        价格
        <span className="filter-bar__carets">
          <CaretUpOutlined className={priceAsc ? 'is-on' : ''} />
          <CaretDownOutlined className={priceDesc ? 'is-on' : ''} />
        </span>
      </button>

      <Popover
        trigger="click"
        open={filterOpen}
        onOpenChange={setFilterOpen}
        placement="bottomLeft"
        arrow={false}
        content={panel}
      >
        <button type="button" className={`filter-bar__item${priceRange ? ' is-active' : ''}`}>
          {filterLabel}
          <DownOutlined className="filter-bar__caret" />
        </button>
      </Popover>
    </div>
  )
}

export function FilterBar(props: Props) {
  const isMobile = useIsMobile()
  return isMobile ? <MobileFilterBar {...props} /> : <DesktopFilterBar {...props} />
}
