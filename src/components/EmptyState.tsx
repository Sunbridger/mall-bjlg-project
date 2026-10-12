import { Empty } from 'antd'
import type { ReactNode } from 'react'
import './EmptyState.less'

interface Props {
  description?: string
  extra?: ReactNode
}

export function EmptyState({ description = '暂无数据', extra }: Props) {
  return (
    <div className="empty-state">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
      {extra && <div className="empty-state__extra">{extra}</div>}
    </div>
  )
}
