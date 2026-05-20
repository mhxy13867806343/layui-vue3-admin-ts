/**
 * Mock：菜单管理模块
 *
 * 接口列表：
 * - GET    /api/menu/tree         返回完整菜单树
 * - GET    /api/menu/page         扁平化分页（name 过滤）
 * - POST   /api/menu              新增（依据 parentId 决定挂在根 or 父节点 children）
 * - PUT    /api/menu              递归在树中按 id 更新
 * - DELETE /api/menu/:id          有 children -> 40030；否则递归移除
 *
 * 内部工具：findMenu / removeMenu / updateMenu
 */
import type { Menu, MenuType } from '@/types/domain'
import {
  fail,
  guard,
  ok,
  paginate,
  parseBody,
  parseQuery,
  type MockMethod,
} from './_utils'
import { flattenMenus, menus, nextMenuId } from './_data/menus'

interface MenuPageQuery {
  page?: string
  pageSize?: string
  name?: string
}

interface MenuCreateBody {
  parentId: number | null
  name: string
  icon?: string
  type: MenuType
  path?: string
  component?: string
  permission?: string
  sort?: number
  visible?: boolean
}

interface MenuUpdateBody extends Partial<MenuCreateBody> {
  id: number
}

const MENU_HAS_CHILDREN = 40030

function extractMenuId(url: string): number | null {
  const path = url.split('?')[0]
  const match = /\/api\/menu\/(\d+)/.exec(path)
  if (!match) return null
  const id = Number(match[1])
  return Number.isFinite(id) ? id : null
}

/** 在树中递归查找节点；命中返回节点本身（保留引用） */
export function findMenu(tree: Menu[], id: number): Menu | null {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children?.length) {
      const hit = findMenu(node.children, id)
      if (hit) return hit
    }
  }
  return null
}

/** 在树中递归移除节点；返回是否移除成功 */
export function removeMenu(tree: Menu[], id: number): boolean {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      tree.splice(i, 1)
      return true
    }
    const children = tree[i].children
    if (children?.length && removeMenu(children, id)) return true
  }
  return false
}

/** 在树中递归更新节点；返回是否更新成功 */
export function updateMenu(tree: Menu[], id: number, patch: Partial<Menu>): boolean {
  for (const node of tree) {
    if (node.id === id) {
      Object.assign(node, patch)
      return true
    }
    if (node.children?.length && updateMenu(node.children, id, patch)) return true
  }
  return false
}

const menuMocks: MockMethod[] = [
  // ===== 树 =====
  {
    url: '/api/menu/tree',
    method: 'get',
    response: guard(() => ok(menus)),
  },

  // ===== 扁平分页 =====
  {
    url: '/api/menu/page',
    method: 'get',
    response: guard((req): unknown => {
      const q = parseQuery(req.url) as MenuPageQuery
      const flat = flattenMenus(menus)
      const filtered = q.name ? flat.filter((m) => m.name.includes(q.name as string)) : flat
      return ok(
        paginate(filtered, {
          page: Number(q.page) || 1,
          pageSize: Number(q.pageSize) || 10,
        }),
      )
    }),
  },

  // ===== 新增 =====
  {
    url: '/api/menu',
    method: 'post',
    response: guard((req): unknown => {
      const body = parseBody<MenuCreateBody>(req)
      if (!body.name || !body.type) return fail('缺少必要字段', 40000)
      const created: Menu = {
        id: nextMenuId(),
        parentId: body.parentId ?? null,
        name: body.name,
        icon: body.icon ?? '',
        type: body.type,
        path: body.path ?? '',
        component: body.component ?? '',
        permission: body.permission ?? '',
        sort: body.sort ?? 0,
        visible: body.visible ?? true,
        children: [],
      }
      if (created.parentId !== null) {
        const parent = findMenu(menus, created.parentId)
        if (!parent) return fail('父节点不存在', 40004)
        if (!parent.children) parent.children = []
        parent.children.push(created)
      } else {
        menus.push(created)
      }
      return ok(created, '新增成功')
    }),
  },

  // ===== 更新 =====
  {
    url: '/api/menu',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<MenuUpdateBody>(req)
      if (!body.id) return fail('缺少 id', 40000)
      const target = findMenu(menus, body.id)
      if (!target) return fail('菜单不存在', 40004)
      // 仅更新可编辑字段，children/parentId 不通过 PUT 调整
      const patch: Partial<Menu> = {}
      if (body.name !== undefined) patch.name = body.name
      if (body.icon !== undefined) patch.icon = body.icon
      if (body.type !== undefined) patch.type = body.type
      if (body.path !== undefined) patch.path = body.path
      if (body.component !== undefined) patch.component = body.component
      if (body.permission !== undefined) patch.permission = body.permission
      if (body.sort !== undefined) patch.sort = body.sort
      if (body.visible !== undefined) patch.visible = body.visible
      updateMenu(menus, body.id, patch)
      return ok(findMenu(menus, body.id), '更新成功')
    }),
  },

  // ===== 删除 =====
  {
    url: '/api/menu/:id',
    method: 'delete',
    response: guard((req): unknown => {
      const id = extractMenuId(req.url)
      if (id === null) return fail('缺少 id', 40000)
      const target = findMenu(menus, id)
      if (!target) return fail('菜单不存在', 40004)
      if (target.children && target.children.length > 0) {
        return fail('请先删除其子节点', MENU_HAS_CHILDREN)
      }
      removeMenu(menus, id)
      return ok(null, '删除成功')
    }),
  },
]

export default menuMocks
