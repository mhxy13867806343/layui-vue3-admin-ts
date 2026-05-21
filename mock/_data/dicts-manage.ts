/**
 * 字典管理 Mock 数据
 */

export interface DictType {
  id: number
  name: string
  code: string
  status: 0 | 1
  remark: string
  createdAt: string
}

export interface DictItem {
  id: number
  dictTypeId: number
  label: string
  value: string | number
  sort: number
  status: 0 | 1
  createdAt: string
}

let dictTypeIdSeq = 6
export const nextDictTypeId = (): number => dictTypeIdSeq++

let dictItemIdSeq = 100
export const nextDictItemId = (): number => dictItemIdSeq++

export const dictTypes: DictType[] = [
  { id: 1, name: '状态', code: 'status', status: 1, remark: '通用状态字典', createdAt: '2024-01-01 10:00:00' },
  { id: 2, name: '菜单类型', code: 'menuType', status: 1, remark: '菜单节点类型', createdAt: '2024-01-02 10:00:00' },
  { id: 3, name: '性别', code: 'gender', status: 1, remark: '用户性别', createdAt: '2024-01-03 10:00:00' },
  { id: 4, name: '优先级', code: 'priority', status: 1, remark: '任务优先级', createdAt: '2024-01-04 10:00:00' },
  { id: 5, name: '通知类型', code: 'noticeType', status: 1, remark: '系统通知类型', createdAt: '2024-01-05 10:00:00' },
]

export const dictItems: DictItem[] = [
  // status
  { id: 1, dictTypeId: 1, label: '启用', value: 1, sort: 1, status: 1, createdAt: '2024-01-01 10:00:00' },
  { id: 2, dictTypeId: 1, label: '禁用', value: 0, sort: 2, status: 1, createdAt: '2024-01-01 10:00:00' },
  // menuType
  { id: 3, dictTypeId: 2, label: '目录', value: 'directory', sort: 1, status: 1, createdAt: '2024-01-02 10:00:00' },
  { id: 4, dictTypeId: 2, label: '菜单', value: 'menu', sort: 2, status: 1, createdAt: '2024-01-02 10:00:00' },
  { id: 5, dictTypeId: 2, label: '按钮', value: 'button', sort: 3, status: 1, createdAt: '2024-01-02 10:00:00' },
  // gender
  { id: 6, dictTypeId: 3, label: '男', value: 1, sort: 1, status: 1, createdAt: '2024-01-03 10:00:00' },
  { id: 7, dictTypeId: 3, label: '女', value: 2, sort: 2, status: 1, createdAt: '2024-01-03 10:00:00' },
  { id: 8, dictTypeId: 3, label: '未知', value: 0, sort: 3, status: 1, createdAt: '2024-01-03 10:00:00' },
  // priority
  { id: 9, dictTypeId: 4, label: '低', value: 'low', sort: 1, status: 1, createdAt: '2024-01-04 10:00:00' },
  { id: 10, dictTypeId: 4, label: '中', value: 'medium', sort: 2, status: 1, createdAt: '2024-01-04 10:00:00' },
  { id: 11, dictTypeId: 4, label: '高', value: 'high', sort: 3, status: 1, createdAt: '2024-01-04 10:00:00' },
  { id: 12, dictTypeId: 4, label: '紧急', value: 'urgent', sort: 4, status: 1, createdAt: '2024-01-04 10:00:00' },
  // noticeType
  { id: 13, dictTypeId: 5, label: '系统通知', value: 'system', sort: 1, status: 1, createdAt: '2024-01-05 10:00:00' },
  { id: 14, dictTypeId: 5, label: '公告', value: 'announcement', sort: 2, status: 1, createdAt: '2024-01-05 10:00:00' },
  { id: 15, dictTypeId: 5, label: '提醒', value: 'reminder', sort: 3, status: 1, createdAt: '2024-01-05 10:00:00' },
]
