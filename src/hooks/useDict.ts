/**
 * useDict —— 字典 hook
 *
 * 用法：
 *   const { items, label, color, ready } = useDict('status')
 *   <span>{{ label(row.status) }}</span>
 *
 * 缓存：getDict 已由 http cache(ttl=5min, tags=['dict']) 接管。
 */
import { computed, onMounted, ref } from 'vue'
import { getDict, type DictItem } from '@/api/dict'

interface UseDictReturn {
  items: ReturnType<typeof ref<DictItem[]>>
  label(value: string | number | undefined | null): string
  color(value: string | number | undefined | null): string | undefined
  ready: ReturnType<typeof ref<boolean>>
  reload(): Promise<void>
}

export function useDict(code: string): UseDictReturn {
  const items = ref<DictItem[]>([])
  const ready = ref<boolean>(false)

  async function reload(): Promise<void> {
    ready.value = false
    try {
      items.value = await getDict(code)
    } finally {
      ready.value = true
    }
  }

  const map = computed<Map<string, DictItem>>(() => {
    const m = new Map<string, DictItem>()
    for (const it of items.value) m.set(String(it.value), it)
    return m
  })

  function label(value: string | number | undefined | null): string {
    if (value === undefined || value === null) return ''
    return map.value.get(String(value))?.label ?? ''
  }

  function color(value: string | number | undefined | null): string | undefined {
    if (value === undefined || value === null) return undefined
    return map.value.get(String(value))?.color
  }

  onMounted(() => {
    void reload()
  })

  return { items, label, color, ready, reload }
}
