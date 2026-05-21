<script setup lang="ts">
/**
 * 操作日志 / system/audit-log
 *
 * 列：用户 / 操作类型 / 描述 / IP / 浏览器 / 操作系统 / 时间 / 状态 / 操作
 * 过滤：用户名 / 操作类型 / 状态 / 时间范围
 * 功能：分页 / 详情弹窗 / 导出 CSV / 清空日志
 */
import { computed, ref } from 'vue'
import { layer } from '@layui/layui-vue'
import { useTable } from '@/hooks/useTable'
import {
  clearAuditLogs,
  getAuditLogPage,
  type AuditLog,
  type AuditLogPageParams,
} from '@/api/audit-log'

interface Query extends Record<string, unknown> {
  username: string
  opType: string
  status: string
  startDate: string
  endDate: string
}

const initialQuery: Query = {
  username: '',
  opType: '',
  status: '',
  startDate: '',
  endDate: '',
}

const dateRange = ref<[string, string] | null>(null)

const table = useTable<AuditLog, Query>(
  async (params) => {
    const apiParams: AuditLogPageParams = {
      page: params.page,
      pageSize: params.pageSize,
    }
    if (params.username) apiParams.username = params.username
    if (params.opType) apiParams.opType = params.opType
    if (params.status) apiParams.status = params.status
    if (params.startDate) apiParams.startDate = params.startDate
    if (params.endDate) apiParams.endDate = params.endDate
    return getAuditLogPage(apiParams)
  },
  { initialQuery, immediate: true },
)

function onSearch(): void {
  if (dateRange.value && dateRange.value.length === 2) {
    table.query.value.startDate = dateRange.value[0]
    table.query.value.endDate = dateRange.value[1]
  } else {
    table.query.value.startDate = ''
    table.query.value.endDate = ''
  }
  void table.search()
}

function onReset(): void {
  dateRange.value = null
  void table.reset()
}

// ===== 详情弹窗 =====
const detailVisible = ref(false)
const detailRow = ref<AuditLog | null>(null)

function onShowDetail(row: AuditLog): void {
  detailRow.value = row
  detailVisible.value = true
}

function formatJson(jsonStr: string): string {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2)
  } catch {
    return jsonStr
  }
}

// ===== 导出 CSV =====
function onExport(): void {
  if (table.list.value.length === 0) {
    layer.msg('当前没有可导出的数据', { icon: 2 })
    return
  }
  const header = ['用户名', '操作类型', '描述', 'IP', '浏览器', '操作系统', '状态', '时间']
  const rows = table.list.value.map((l) => [
    l.username,
    opTypeLabel(l.opType),
    l.description,
    l.ip,
    l.browser,
    l.os,
    statusLabel(l.status),
    l.createdAt,
  ])
  const csv = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `操作日志_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  layer.msg('已导出当前页 CSV', { icon: 1 })
}

function onClear(): void {
  layer.confirm('确认清空所有日志？此操作不可恢复。', {
    yes: async () => {
      try {
        await clearAuditLogs()
        layer.msg('已清空所有日志', { icon: 1 })
        void table.refresh()
      } catch { /* silent */ }
    },
  })
}

// ===== 标签映射 =====
function opTypeLabel(t: string): string {
  const map: Record<string, string> = {
    login: '登录',
    logout: '登出',
    create: '创建',
    update: '更新',
    delete: '删除',
    export: '导出',
    upload: '上传',
  }
  return map[t] || t
}
function opTypeColor(t: string): string {
  const map: Record<string, string> = {
    login: '#16baaa',
    logout: '#999',
    create: '#1e9fff',
    update: '#ffb800',
    delete: '#ff5722',
    export: '#06b6d4',
    upload: '#a855f7',
  }
  return map[t] || '#666'
}
function statusLabel(s: string): string {
  return s === 'success' ? '成功' : '失败'
}
function statusColor(s: string): string {
  return s === 'success' ? '#16baaa' : '#ff5722'
}

const opTypeOptions = [
  { label: '登录', value: 'login' },
  { label: '登出', value: 'logout' },
  { label: '创建', value: 'create' },
  { label: '更新', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '导出', value: 'export' },
  { label: '上传', value: 'upload' },
]
const statusOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'fail' },
]

const columns = computed(() => [
  { title: '用户', key: 'user', width: '130px', customSlot: 'userCol' },
  { title: '操作类型', key: 'opType', width: '90px', customSlot: 'opTypeCol' },
  { title: '描述', key: 'description', minWidth: '160px' },
  { title: 'IP', key: 'ip', width: '130px' },
  { title: '浏览器', key: 'browser', width: '110px' },
  { title: '操作系统', key: 'os', width: '120px' },
  { title: '操作时间', key: 'createdAt', width: '160px' },
  { title: '状态', key: 'status', width: '70px', customSlot: 'statusCol' },
  { title: '操作', key: 'op', width: '90px', customSlot: 'opCol' },
])

type PageLayout = ('count' | 'prev' | 'page' | 'next' | 'limits' | 'refresh' | 'skip')[]
const pageLayout = computed<PageLayout>(() => ['count', 'prev', 'page', 'next', 'limits', 'refresh'])
</script>

<template>
  <div class="lva-audit-page">
    <!-- 搜索 -->
    <section class="lva-audit-page__filter">
      <div class="lva-audit-page__row">
        <lay-input
          v-model="table.query.value.username"
          placeholder="用户名"
          allow-clear
          style="width: 160px"
        />
        <lay-select
          v-model="table.query.value.opType"
          placeholder="操作类型"
          allow-clear
          style="width: 140px"
        >
          <lay-select-option
            v-for="opt in opTypeOptions"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          />
        </lay-select>
        <lay-select
          v-model="table.query.value.status"
          placeholder="状态"
          allow-clear
          style="width: 120px"
        >
          <lay-select-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          />
        </lay-select>
        <lay-date-picker
          v-model="dateRange"
          type="daterange"
          placeholder="时间范围"
          style="width: 240px"
        />
        <lay-button type="primary" @click="onSearch">搜索</lay-button>
        <lay-button @click="onReset">重置</lay-button>
      </div>
      <div class="lva-audit-page__actions">
        <lay-button @click="onExport">
          <i class="layui-icon layui-icon-download-circle" /> 导出
        </lay-button>
        <lay-button type="danger" @click="onClear">
          <i class="layui-icon layui-icon-delete" /> 清空日志
        </lay-button>
      </div>
    </section>

    <!-- 表格 -->
    <lay-table
      :data-source="table.list.value"
      :columns="columns"
      :loading="table.loading.value"
    >
      <template #userCol="{ row }">
        <div class="lva-audit-page__user">
          <span class="lva-audit-page__avatar" :style="{ background: row.avatarColor }">
            {{ row.username.slice(0, 1).toUpperCase() }}
          </span>
          <span>{{ row.username }}</span>
        </div>
      </template>
      <template #opTypeCol="{ row }">
        <span
          class="lva-audit-page__tag"
          :style="{ background: opTypeColor(row.opType) }"
        >{{ opTypeLabel(row.opType) }}</span>
      </template>
      <template #statusCol="{ row }">
        <span :style="{ color: statusColor(row.status) }">{{ statusLabel(row.status) }}</span>
      </template>
      <template #opCol="{ row }">
        <a class="lva-audit-page__op" @click="onShowDetail(row)">详情</a>
      </template>
    </lay-table>

    <!-- 分页 -->
    <div class="lva-audit-page__pager">
      <lay-page
        :total="table.total.value"
        :current-page="table.page.value"
        :limit="table.pageSize.value"
        :limits="[10, 20, 50]"
        :layout="pageLayout"
        @change="(p: number) => (table.page.value = p)"
        @limit-change="(s: number) => { table.pageSize.value = s; table.page.value = 1 }"
      />
    </div>

    <!-- 详情弹窗 -->
    <lay-layer
      v-model="detailVisible"
      title="日志详情"
      :area="['620px', '600px']"
      :shade-close="false"
    >
      <div class="lva-audit-page__detail" v-if="detailRow">
        <div class="lva-audit-page__detail-row">
          <span class="lva-audit-page__detail-label">用户：</span>
          <span>{{ detailRow.username }} (ID: {{ detailRow.userId }})</span>
        </div>
        <div class="lva-audit-page__detail-row">
          <span class="lva-audit-page__detail-label">操作：</span>
          <span
            class="lva-audit-page__tag"
            :style="{ background: opTypeColor(detailRow.opType) }"
          >{{ opTypeLabel(detailRow.opType) }}</span>
          <span style="margin-left: 8px">{{ detailRow.description }}</span>
        </div>
        <div class="lva-audit-page__detail-row">
          <span class="lva-audit-page__detail-label">状态：</span>
          <span :style="{ color: statusColor(detailRow.status) }">
            {{ statusLabel(detailRow.status) }} （耗时 {{ detailRow.duration }}ms）
          </span>
        </div>
        <div class="lva-audit-page__detail-row">
          <span class="lva-audit-page__detail-label">IP：</span>
          <span>{{ detailRow.ip }}（{{ detailRow.location }}）</span>
        </div>
        <div class="lva-audit-page__detail-row">
          <span class="lva-audit-page__detail-label">客户端：</span>
          <span>{{ detailRow.browser }} / {{ detailRow.os }}</span>
        </div>
        <div class="lva-audit-page__detail-row">
          <span class="lva-audit-page__detail-label">User-Agent：</span>
          <span class="lva-audit-page__detail-ua">{{ detailRow.userAgent }}</span>
        </div>
        <div class="lva-audit-page__detail-row">
          <span class="lva-audit-page__detail-label">时间：</span>
          <span>{{ detailRow.createdAt }}</span>
        </div>
        <div class="lva-audit-page__detail-row">
          <span class="lva-audit-page__detail-label">请求 Payload：</span>
          <pre class="lva-audit-page__detail-pre">{{ formatJson(detailRow.payload) }}</pre>
        </div>
        <div class="lva-audit-page__detail-row">
          <span class="lva-audit-page__detail-label">响应：</span>
          <pre class="lva-audit-page__detail-pre">{{ formatJson(detailRow.response) }}</pre>
        </div>
      </div>
    </lay-layer>
  </div>
</template>

<style scoped>
.lva-audit-page { display: flex; flex-direction: column; gap: 12px; }
.lva-audit-page__filter {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.lva-audit-page__row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.lva-audit-page__actions { display: flex; gap: 8px; }
.lva-audit-page__pager { display: flex; justify-content: flex-end; }

.lva-audit-page__user {
  display: flex;
  align-items: center;
  gap: 8px;
}
.lva-audit-page__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.lva-audit-page__tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
}
.lva-audit-page__op {
  cursor: pointer;
  color: #16baaa;
}
.lva-audit-page__op:hover { text-decoration: underline; }

.lva-audit-page__detail { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.lva-audit-page__detail-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #333;
  flex-wrap: wrap;
}
.lva-audit-page__detail-label {
  display: inline-block;
  width: 120px;
  flex-shrink: 0;
  color: #666;
  font-weight: 500;
}
.lva-audit-page__detail-ua {
  flex: 1;
  word-break: break-all;
  font-family: ui-monospace, monospace;
  font-size: 12px;
  color: #555;
}
.lva-audit-page__detail-pre {
  flex: 1;
  background: #f8f8f8;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}
</style>
