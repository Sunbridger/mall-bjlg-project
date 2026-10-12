/**
 * 商品图源。
 *
 * 默认走 picsum.photos 的「种子图」——同一个种子永远返回同一张照片，
 * 因此本地开发、构建产物、线上部署看到的图完全一致，且无需自备图床。
 * 若网络不可用（或想彻底离线），把 USE_REMOTE_IMAGES 改成 false，
 * 即可切换到本地生成的 SVG 占位图；加载失败时也会自动降级到占位图。
 */
import type { SyntheticEvent } from 'react'

export const USE_REMOTE_IMAGES = true

const REMOTE_CDN = 'https://picsum.photos/seed'

/** 占位图配色，按种子哈希取一组 */
const PALETTES = [
  ['#ffecd2', '#fcb69f'],
  ['#d4fc79', '#96e6a1'],
  ['#a1c4fd', '#c2e9fb'],
  ['#fbc2eb', '#a6c1ee'],
  ['#f6d365', '#fda085'],
  ['#e0c3fc', '#8ec5fc'],
  ['#f5f7fa', '#c3cfe2'],
  ['#fddb92', '#d1fdff'],
]

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 确定性的本地 SVG 占位图（data URI），无需网络 */
export function placeholderImage(seed: string, size = 600): string {
  const h = hash(seed)
  const [from, to] = PALETTES[h % PALETTES.length]
  const label = seed.replace(/^mall-/, '').replace(/-/g, ' ').slice(0, 12).toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
    font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="${Math.round(size / 14)}"
    fill="rgba(0,0,0,0.32)" letter-spacing="2">${label}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** 商品的第 index 张图（0 为主图） */
export function productImage(productId: string, index = 0, size = 600): string {
  const seed = `mall-${productId}-${index}`
  if (!USE_REMOTE_IMAGES) return placeholderImage(seed, size)
  return `${REMOTE_CDN}/${seed}/${size}/${size}`
}

/**
 * <img onError> 处理器：远程图挂了就换成占位图，且只换一次，避免死循环。
 */
export function handleImageError(seed: string, size = 600) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.dataset.fallback === '1') return
    img.dataset.fallback = '1'
    img.src = placeholderImage(seed, size)
  }
}
