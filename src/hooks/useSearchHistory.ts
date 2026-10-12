import { useCallback, useState } from 'react'

const STORAGE_KEY = 'mall-search-history-v1'
const MAX_ITEMS = 10

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

function write(list: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* 忽略写入失败 */
  }
}

/** 搜索历史：最近搜索置顶、去重、最多 10 条 */
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(read)

  const push = useCallback((keyword: string) => {
    const kw = keyword.trim()
    if (!kw) return
    setHistory((prev) => {
      const next = [kw, ...prev.filter((h) => h !== kw)].slice(0, MAX_ITEMS)
      write(next)
      return next
    })
  }, [])

  const remove = useCallback((keyword: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h !== keyword)
      write(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setHistory([])
    write([])
  }, [])

  return { history, push, remove, clear }
}
