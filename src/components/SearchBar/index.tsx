import { useEffect, useMemo, useState } from 'react'
import { AutoComplete, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { suggestKeywordsFor } from '@/api/product'
import './index.less'

interface Props {
  /** 初始关键词 */
  defaultValue?: string
  placeholder?: string
  /** 在搜索页内使用时，回车直接触发本页查询而不跳路由 */
  onSubmit?: (keyword: string) => void
  size?: 'middle' | 'large'
}

export function SearchBar({
  defaultValue = '',
  placeholder = '搜索商品 / 品牌 / 关键词',
  onSubmit,
  size = 'middle',
}: Props) {
  const navigate = useNavigate()
  const [value, setValue] = useState(defaultValue)

  // 路由参数变化（例如从首页热搜跳过来）时同步输入框
  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const options = useMemo(() => {
    const kw = value.trim()
    if (kw.length < 1) return []
    return suggestKeywordsFor(kw, 8).map((text) => ({
      value: text,
      label: <span className="search-bar__option">{text}</span>,
    }))
  }, [value])

  const submit = (keyword: string) => {
    const kw = keyword.trim()
    if (!kw) return
    if (onSubmit) onSubmit(kw)
    else navigate(`/search?q=${encodeURIComponent(kw)}`)
  }

  return (
    <div className="search-bar">
      <AutoComplete
        className="search-bar__autocomplete"
        value={value}
        options={options}
        onChange={setValue}
        onSelect={(text: string) => submit(text)}
        popupMatchSelectWidth={320}
      >
        <Input
          size={size}
          allowClear
          placeholder={placeholder}
          prefix={<SearchOutlined className="search-bar__icon" />}
          onPressEnter={(e) => submit((e.target as HTMLInputElement).value)}
          aria-label="搜索商品"
        />
      </AutoComplete>
      <button type="button" className="search-bar__submit" onClick={() => submit(value)}>
        搜索
      </button>
    </div>
  )
}
