import type { User } from '@/types/domain'

/**
 * 判断当前行用户是否可以被删除。
 * 规则：当前登录用户自身行不允许删除（防止自删）。
 *
 * @param row 用户行数据
 * @param currentUserId 当前登录用户 ID
 * @returns true 表示可以删除
 */
export function canDeleteRow(row: Pick<User, 'id'>, currentUserId: number): boolean {
  return row.id !== currentUserId
}
