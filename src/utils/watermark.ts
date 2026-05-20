/**
 * 水印工具：在容器右下角铺设重复文案
 *
 * 实现：用 canvas 渲染单个 tile，转 dataURL，作为容器的 background-image。
 * 仅在容器内生效（容器需 position: relative）；销毁时移除背景。
 */

interface WatermarkOptions {
  text: string
  fontSize?: number
  rotate?: number
  color?: string
  gap?: number
}

function createTile(opts: Required<WatermarkOptions>): string {
  const tileSize = 220
  const canvas = document.createElement('canvas')
  canvas.width = tileSize
  canvas.height = tileSize
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.clearRect(0, 0, tileSize, tileSize)
  ctx.font = `${opts.fontSize}px sans-serif`
  ctx.fillStyle = opts.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.translate(tileSize / 2, tileSize / 2)
  ctx.rotate((opts.rotate * Math.PI) / 180)
  ctx.fillText(opts.text, 0, 0)
  return canvas.toDataURL('image/png')
}

export function applyWatermark(el: HTMLElement | null, opts: WatermarkOptions): void {
  if (!el) return
  const text = (opts.text ?? '').trim()
  if (!text) {
    removeWatermark(el)
    return
  }
  const merged: Required<WatermarkOptions> = {
    text,
    fontSize: opts.fontSize ?? 14,
    rotate: opts.rotate ?? -20,
    color: opts.color ?? 'rgba(0,0,0,0.10)',
    gap: opts.gap ?? 220,
  }
  const url = createTile(merged)
  if (!url) return
  el.style.backgroundImage = `url("${url}")`
  el.style.backgroundRepeat = 'repeat'
  el.dataset.watermark = '1'
}

export function removeWatermark(el: HTMLElement | null): void {
  if (!el) return
  if (el.dataset.watermark === '1') {
    el.style.backgroundImage = ''
    el.style.backgroundRepeat = ''
    delete el.dataset.watermark
  }
}
