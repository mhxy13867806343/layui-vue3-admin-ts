<script setup lang="ts">
/**
 * 用户管理 / system/user
 *
 * - 搜索：account / nickname / status
 * - 分页：默认 10，可选 10/20/50
 * - 操作：新增、编辑、重置密码、删除（当前用户行隐藏删除按钮）
 * - 导出：演示 exportExcel 能力，导出当前查询条件下的全量数据
 */
import { computed, onMounted, ref } from 'vue'
import { layer } from '@layui/layui-vue'
import { useTable } from '@/hooks/useTable'
import { useDict } from '@/hooks/useDict'
import { useUserStore } from '@/store/modules/user'
import {
  deleteUser,
  getUserPage,
  resetUserPassword,
  type UserPageParams,
} from '@/api/user'
import { getRolePage } from '@/api/role'
import { exportExcel, type ExcelColumn } from '@/utils/excel'
import type { Role, User } from '@/types/domain'
import { canDeleteRow } from '@/utils/user-row'
import UserFormDialog from './components/UserFormDialog.vue'

const userStore = useUserStore()
const statusDict = useDict('status')

interface Query extends Record<string, unknown> {
  username: string
  nickname: string
  status: '' | 0 | 1
}

const initialQuery: Query = { username: '', nickname: '', status: '' }

const table = useTable<User, Query>(
  async (params) => {
    const apiParams: UserPageParams = {
      page: params.page,
      pageSize: params.pageSize,
    }
    if (params.username) apiParams.username = params.username
    if (params.nickname) apiParams.nickname = params.nickname
    if (params.status !== '') apiParams.status = params.status as 0 | 1
    return getUserPage(apiParams)
  },
  { initialQuery, immediate: true },
)

// 角色下拉，弹窗也用同一份
const roleOptions = ref<Role[]>([])
async function loadRoles(): Promise<void> {
  const res = await getRolePage({ page: 1, pageSize: 100 })
  roleOptions.value = res.list
}

// ===== 弹窗 =====
const dialogVisible = ref<boolean>(false)
const dialogUser = ref<User | null>(null)

function onCreate(): void {
  dialogUser.value = null
  dialogVisible.value = true
}

function onEdit(row: User): void {
  dialogUser.value = row
  dialogVisible.value = true
}

async function onResetPassword(row: User): Promise<void> {
  layer.confirm(`确认将 ${row.nickname} 的密码重置为系统默认值？`, {
    yes: async () => {
      try {
        await resetUserPassword(row.id)
        layer.msg('已重置为默认密码 123456', { icon: 1 })
      } catch {
        /* silent */
      }
    },
  })
}

async function onDelete(row: User): Promise<void> {
  layer.confirm(`确认删除用户「${row.nickname}」？`, {
    yes: async () => {
      try {
        await deleteUser(row.id)
        layer.msg('删除成功', { icon: 1 })
        table.remove((r) => r.id === row.id)
      } catch {
        /* silent */
      }
    },
  })
}

const canDelete = (row: User): boolean => canDeleteRow(row, userStore.userInfo?.id ?? -1)

// ===== 导出 =====
async function onExport(): Promise<void> {
  // 拉取全量（最多 1000）
  const params: UserPageParams = { page: 1, pageSize: 1000 }
  if (table.query.value.username) params.username = table.query.value.username
  if (table.query.value.nickname) params.nickname = table.query.value.nickname
  if (table.query.value.status !== '') params.status = table.query.value.status as 0 | 1
  const result = await getUserPage(params)
  const cols: ExcelColumn[] = [
    { title: 'ID', key: 'id' },
    { title: '账号', key: 'username' },
    { title: '昵称', key: 'nickname' },
    { title: '角色', key: 'roleCodes', render: (v) => (Array.isArray(v) ? v.join(',') : '') },
    { title: '状态', key: 'status', render: (v) => statusDict.label(v as number) },
    { title: '创建时间', key: 'createdAt' },
  ]
  exportExcel(result.list as unknown as Record<string, unknown>[], cols, '用户列表')
  layer.msg('已导出', { icon: 1 })
}

// ===== 搜索 =====
function onSearch(): void { void table.search() }
function onReset(): void { void table.reset() }

onMounted(() => {
  void loadRoles()
})

const limits = computed(() => [10, 20, 50])
type PageLayout = ('count' | 'prev' | 'page' | 'next' | 'limits' | 'refresh' | 'skip')[]
const pageLayout = computed<PageLayout>(() => ['count', 'prev', 'page', 'next', 'limits', 'refresh', 'skip'])

const columns = computed(() => [
  { title: 'ID', key: 'id', width: '80px' },
  { title: '账号', key: 'username' },
  { title: '昵称', key: 'nickname' },
  { title: '角色', key: 'roleCodes', customSlot: 'roleCol' },
  { title: '状态', key: 'status', width: '100px', customSlot: 'statusCol' },
  { title: '创建时间', key: 'createdAt', width: '180px' },
  { title: '操作', key: 'op', width: '240px', customSlot: 'opCol' },
])
</script>

<template>
  <div class="lva-user-page">
    <!-- 搜索条 -->
    <section class="lva-user-page__filter">
      <div class="lva-user-page__row">
        <lay-input
          v-model="table.query.value.username"
          placeholder="账号"
          allow-clear
          style="width: 180px"
        />
        <lay-input
          v-model="table.query.value.nickname"
          placeholder="昵称"
          allow-clear
          style="width: 180px"
        />
        <lay-select
          v-model="table.query.value.status"
          placeholder="状态"
          allow-clear
          style="width: 140px"
        >
          <lay-select-option
            v-for="opt in statusDict.items.value"
            :key="String(opt.value)"
            :value="opt.value"
            :label="opt.label"
          />
        </lay-select>
        <lay-button type="primary" @click="onSearch">搜索</lay-button>
        <lay-button @click="onReset">重置</lay-button>
      </div>
      <div class="lva-user-page__actions">
        <lay-button v-permission="'user:create'" type="primary" @click="onCreate">
          <i class="layui-icon layui-icon-add-1" /> 新增
        </lay-button>
        <lay-button @click="onExport">
          <i class="layui-icon layui-icon-download-circle" /> 导出
        </lay-button>
      </div>
    </section>

    <!-- 列表 -->
    <lay-table
      :data-source="table.list.value"
      :columns="columns"
      :loading="table.loading.value"
    >
      <template #roleCol="{ row }">
        <span>{{ Array.isArray(row.roleCodes) ? row.roleCodes.join(', ') : '' }}</span>
      </template>
      <template #statusCol="{ row }">
        <span :style="{ color: statusDict.color(row.status) === 'green' ? '#16baaa' : '#999' }">
          {{ statusDict.label(row.status) }}
        </span>
      </template>
      <template #opCol="{ row }">
        <a v-permission="'user:update'" class="lva-user-page__op" @click="onEdit(row)">编辑</a>
        <a v-permission="'user:reset-password'" class="lva-user-page__op" @click="onResetPassword(row)">重置密码</a>
        <a
          v-if="canDelete(row)"
          v-permission="'user:delete'"
          class="lva-user-page__op lva-user-page__op--danger"
          @click="onDelete(row)"
        >
          删除
        </a>
      </template>
    </lay-table>

    <!-- 分页 -->
    <div class="lva-user-page__pager">
      <lay-page
        :total="table.total.value"
        :current-page="table.page.value"
        :limit="table.pageSize.value"
        :limits="limits"
        :layout="pageLayout"
        @change="(p: number) => (table.page.value = p)"
        @limit-change="(s: number) => { table.pageSize.value = s; table.page.value = 1 }"
      />
    </div>

    <!-- 表单弹窗 -->
    <UserFormDialog
      v-model="dialogVisible"
      :user="dialogUser"
      :role-options="roleOptions"
      @saved="table.refresh()"
    />
  </div>
</template>

<style scoped>
.lva-user-page { display: flex; flex-direction: column; gap: 12px; }
.lva-user-page__filter {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.lva-user-page__row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.lva-user-page__actions { display: flex; gap: 8px; }
.lva-user-page__pager { display: flex; justify-content: flex-end; }
.lva-user-page__op {
  cursor: pointer;
  color: var(--global-primary-color, #16baaa);
  margin-right: 12px;
}
.lva-user-page__op:hover { text-decoration: underline; }
.lva-user-page__op--danger { color: #ff5722; }
</style>
