import type { Directive, DirectiveBinding } from 'vue'
import { hasPermission } from '@/utils/permission'

/**
 * v-permission 指令
 *
 * 用法：
 *   <button v-permission="'user:create'">新增</button>
 *   <button v-permission="['user:edit', 'user:delete']">操作</button>
 *
 * 语义：
 *   - 不通过权限校验时，从 DOM 树中移除该元素（与 design.md「v-permission 指令」一致）。
 *   - 空入参视为「无权限要求」，元素保留显示（由 hasPermission 决定）。
 *   - mounted 与 updated 共用同一份判断，保证幂等。
 */
type PermissionValue = string | string[] | undefined | null

function check(el: HTMLElement, binding: DirectiveBinding<PermissionValue>): void {
  if (!hasPermission(binding.value)) {
    el.parentNode?.removeChild(el)
  }
}

export const permission: Directive<HTMLElement, PermissionValue> = {
  mounted: check,
  updated: check,
}

export default permission
