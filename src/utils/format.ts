/**
 * format.ts — 通用格式化工具库
 *
 * 功能列表：
 * 1. timeAgo          — 相对时间（10秒前、1分钟前、1小时前、几个月前）
 * 2. formatMoney      — 金额格式化（分转元、千分位、货币符号）
 * 3. formatRegion     — 地区码转文本
 * 4. defaultText      — 默认值展示（空值时显示占位符）
 * 5. splitText        — 文本分割
 * 6. extractNumbers   — 提取数字
 * 7. extractContent   — 提取指定内容（正则）
 * 8. filterFormat     — 过滤格式（去除 HTML/特殊字符等）
 * 9. formatCalendar   — 格式化日历时间（今天/昨天/前天/周几/日期）
 * 10. formatDate      — 格式化时间戳为指定格式
 * 11. formatTimestamp — 时间戳转可读字符串
 * 12. highlightText   — 文本高亮
 * 13. highlightAt     — @xxx 高亮
 * 14. parseLyric      — 歌词解析（LRC 格式）
 */

// ===== 1. 相对时间 =====
/**
 * 将时间转为相对描述：刚刚、10秒前、1分钟前、1小时前、3天前、2个月前、1年前
 * @param input 时间戳(ms)、Date对象、或日期字符串
 */
export function timeAgo(input: number | Date | string): string {
  const date = input instanceof Date ? input : new Date(input)
  const now = Date.now()
  const diff = Math.floor((now - date.getTime()) / 1000)

  if (diff < 5) return '刚刚'
  if (diff < 60) return `${diff}秒前`
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}个月前`
  return `${Math.floor(diff / 31536000)}年前`
}

// ===== 2. 金额格式化 =====
export interface MoneyOptions {
  /** 输入单位：'fen'(分) | 'yuan'(元)，默认 'yuan' */
  unit?: 'fen' | 'yuan'
  /** 小数位数，默认 2 */
  decimals?: number
  /** 货币符号，默认 '¥' */
  symbol?: string
  /** 千分位分隔符，默认 ',' */
  separator?: string
}

export function formatMoney(amount: number | string, options: MoneyOptions = {}): string {
  const { unit = 'yuan', decimals = 2, symbol = '¥', separator = ',' } = options
  let num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return `${symbol}0.${'0'.repeat(decimals)}`
  if (unit === 'fen') num = num / 100
  const fixed = num.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return `${symbol}${formatted}${decPart ? '.' + decPart : ''}`
}

// ===== 3. 地区转换 =====
const REGION_MAP: Record<string, string> = {
  '110000': '北京市', '120000': '天津市', '130000': '河北省', '140000': '山西省',
  '150000': '内蒙古', '210000': '辽宁省', '220000': '吉林省', '230000': '黑龙江省',
  '310000': '上海市', '320000': '江苏省', '330000': '浙江省', '340000': '安徽省',
  '350000': '福建省', '360000': '江西省', '370000': '山东省', '410000': '河南省',
  '420000': '湖北省', '430000': '湖南省', '440000': '广东省', '450000': '广西',
  '460000': '海南省', '500000': '重庆市', '510000': '四川省', '520000': '贵州省',
  '530000': '云南省', '540000': '西藏', '610000': '陕西省', '620000': '甘肃省',
  '630000': '青海省', '640000': '宁夏', '650000': '新疆',
}

/**
 * 地区码转文本
 * @param code 地区编码
 * @param fallback 未匹配时的默认值
 */
export function formatRegion(code: string | number, fallback = '未知地区'): string {
  return REGION_MAP[String(code)] || fallback
}

// ===== 4. 默认值展示 =====
/**
 * 空值时显示占位符
 * @param value 原始值
 * @param placeholder 占位符，默认 '--'
 */
export function defaultText(value: unknown, placeholder = '--'): string {
  if (value === null || value === undefined || value === '') return placeholder
  if (typeof value === 'string' && value.trim() === '') return placeholder
  return String(value)
}

// ===== 5. 文本分割 =====
/**
 * 按分隔符分割文本，过滤空项
 * @param text 原始文本
 * @param separator 分隔符，默认 ','
 */
export function splitText(text: string, separator: string | RegExp = ','): string[] {
  if (!text) return []
  return text.split(separator).map(s => s.trim()).filter(Boolean)
}

// ===== 6. 提取数字 =====
/**
 * 从文本中提取所有数字（含小数、负数）
 */
export function extractNumbers(text: string): number[] {
  if (!text) return []
  const matches = text.match(/-?\d+(\.\d+)?/g)
  return matches ? matches.map(Number) : []
}

// ===== 7. 提取指定内容 =====
/**
 * 用正则从文本中提取匹配内容
 * @param text 原始文本
 * @param pattern 正则表达式
 * @param group 捕获组索引，默认 0（整个匹配）
 */
export function extractContent(text: string, pattern: RegExp, group = 0): string[] {
  if (!text) return []
  const results: string[] = []
  const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g')
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    results.push(match[group] || match[0])
  }
  return results
}

// ===== 8. 过滤格式 =====
/**
 * 去除 HTML 标签
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 去除特殊字符，只保留中英文、数字、常用标点
 */
export function filterSpecialChars(text: string): string {
  if (!text) return ''
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s,.!?;:，。！？；：、""''（）\-_@#]/g, '')
}

/**
 * 过滤 XSS 危险字符
 */
export function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// ===== 9. 格式化日历时间 =====
/**
 * 日历式时间：今天 14:30、昨天 09:00、前天 18:20、周三 10:00、2026-05-15
 */
export function formatCalendar(input: number | Date | string): string {
  const date = input instanceof Date ? input : new Date(input)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diffDays = Math.floor((todayStart - dateStart) / 86400000)

  if (diffDays === 0) return `今天 ${time}`
  if (diffDays === 1) return `昨天 ${time}`
  if (diffDays === 2) return `前天 ${time}`
  if (diffDays < 7) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${weekDays[date.getDay()]} ${time}`
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${time}`
}

// ===== 10. 格式化时间 =====
/**
 * 将 Date/时间戳/字符串格式化为指定格式
 * @param input 时间输入
 * @param format 格式模板，默认 'YYYY-MM-DD HH:mm:ss'
 *   支持：YYYY, MM, DD, HH, mm, ss, SSS
 */
export function formatDate(input: number | Date | string, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const date = input instanceof Date ? input : new Date(input)
  if (isNaN(date.getTime())) return ''
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    SSS: pad(date.getMilliseconds(), 3),
  }
  let result = format
  for (const [token, value] of Object.entries(map)) {
    result = result.replace(token, value)
  }
  return result
}

// ===== 11. 格式化时间戳 =====
/**
 * Unix 时间戳（秒或毫秒）转可读字符串
 */
export function formatTimestamp(ts: number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  // 自动判断秒/毫秒
  const ms = ts > 9999999999 ? ts : ts * 1000
  return formatDate(ms, format)
}

// ===== 12. 文本高亮 =====
/**
 * 将文本中匹配的关键词用 <mark> 标签包裹
 * @param text 原始文本
 * @param keyword 关键词
 * @param tag 包裹标签，默认 'mark'
 */
export function highlightText(text: string, keyword: string, tag = 'mark'): string {
  if (!text || !keyword) return text || ''
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, `<${tag}>$1</${tag}>`)
}

// ===== 13. @xxx 高亮 =====
/**
 * 将文本中的 @用户名 高亮
 * @param text 原始文本
 * @param className CSS 类名，默认 'at-highlight'
 */
export function highlightAt(text: string, className = 'at-highlight'): string {
  if (!text) return ''
  return text.replace(/@([\w\u4e00-\u9fa5]+)/g, `<span class="${className}">@$1</span>`)
}

// ===== 14. 歌词解析 =====
export interface LyricLine {
  /** 时间（秒） */
  time: number
  /** 歌词文本 */
  text: string
}

/**
 * 解析 LRC 格式歌词
 * 支持格式：[mm:ss.xx] 歌词文本 或 [mm:ss] 歌词文本
 * 支持一行多时间标签：[00:01.00][00:15.00] 歌词
 *
 * @param lrc LRC 格式歌词字符串
 * @returns 按时间排序的歌词行数组
 */
export function parseLyric(lrc: string): LyricLine[] {
  if (!lrc) return []
  const lines = lrc.split('\n')
  const result: LyricLine[] = []
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // 提取所有时间标签
    const times: number[] = []
    let match: RegExpExecArray | null
    while ((match = timeRegex.exec(trimmed)) !== null) {
      const min = parseInt(match[1], 10)
      const sec = parseInt(match[2], 10)
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0
      times.push(min * 60 + sec + ms / 1000)
    }
    timeRegex.lastIndex = 0

    // 提取歌词文本（去掉所有时间标签）
    const text = trimmed.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim()
    if (!text && times.length === 0) continue

    for (const time of times) {
      result.push({ time, text })
    }
  }

  // 按时间排序
  return result.sort((a, b) => a.time - b.time)
}

/**
 * 根据当前播放时间获取当前歌词行索引
 * @param lyrics 解析后的歌词数组
 * @param currentTime 当前播放时间（秒）
 */
export function getCurrentLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (!lyrics.length) return -1
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) return i
  }
  return 0
}
