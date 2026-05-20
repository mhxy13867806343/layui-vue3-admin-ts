/**
 * 字典静态数据
 *
 * 设计：以 code 为键的 `Record<string, DictItem[]>`，单一来源；
 *      mock/dict.ts 直接读取此结构。
 */

export interface DictItem {
  label: string
  value: string | number
  /** 可选：UI 标签颜色 */
  color?: 'red' | 'green' | 'blue' | 'orange' | 'gray'
}

export const dicts: Record<string, DictItem[]> = {
  status: [
    { label: '启用', value: 1, color: 'green' },
    { label: '禁用', value: 0, color: 'gray' },
  ],
  menuType: [
    { label: '目录', value: 'directory', color: 'blue' },
    { label: '菜单', value: 'menu', color: 'green' },
    { label: '按钮', value: 'button', color: 'orange' },
  ],
  yesNo: [
    { label: '是', value: 1, color: 'green' },
    { label: '否', value: 0, color: 'gray' },
  ],
}
