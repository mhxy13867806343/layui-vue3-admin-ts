<script setup lang="ts">
/**
 * 版本管理 / system/version
 *
 * 列：版本号 / 类型(主版本/次版本/补丁) / 更新摘要 / 发布日期 / 是否强制 / 状态(草稿/已发布) / 操作
 * 操作：新增 / 编辑 / 删除 / 发布(仅草稿) / 对比
 */
import { computed, ref } from 'vue'
import { layer } from '@layui/layui-vue'
import { useTable } from '@/hooks/useTable'
import {
  createVersion,
  deleteVersion,
  getVersionPage,
  publishVersion,
  updateVersion,
  type Version,
  type VersionPageParams,
} from '@/api/version'

interface Query extends Record<string, unknown> {
  version: string
  status: string
  type: string
}

const initialQuery: Query = { version: '', status: '', type: '' }

const table = useTable<Version, Query>(
  async (params) => {
    const apiParams: VersionPageParams = {
      page: params.page,
      pageSize: params.pageSize,
    }
    if (params.version) apiParams.version = params.version
    if (params.status) apiParams.status = params.status
    if (params.type) apiParams.type = params.type
    return getVersionPage(apiParams)
  },
  { initialQuery, immediate: true },
)

function onSearch(): void { void table.search() }
function onReset(): void { void table.reset() }

// ===== 弹窗 =====
const dialogVisible = ref(false)
const form = ref<Partial<Version>>({})
const isEdit = ref(false)

function onCreate(): void {
  isEdit.value = false
  form.value = {
    version: '',
    type: 'patch',
    summary: '',
    content: '',
    publishDate: '',
    status: 'draft',
    forceUpdate: false,
    downloadUrl: '',
  }
  dialogVisible.value = true
}

function onEdit(row: Version): void {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

async function onSave(): Promise<void> {
  if (!form.value.version) {
    layer.msg('版本号不能为空', { icon: 2 })
    return
  }
  try {
    if (isEdit.value) {
      await updateVersion(form.value)
    } else {
      await createVersion(form.value)
    }
    layer.msg('保存成功', { icon: 1 })
    dialogVisible.value = false
    table.refresh()
  } catch { /* silent */ }
}

async function onPublish(row: Version): Promise<void> {
  layer.confirm(`确认发布版本「${row.version}」？`, {
    yes: async () => {
      try {
        await publishVersion(row.id)
        layer.msg('发布成功', { icon: 1 })
        table.refresh()
      } catch { /* silent */ }
    },
  })
}

function onDelete(row: Version): void {
  layer.confirm(`确认删除版本「${row.version}」？`, {
    yes: async () => {
      try {
        await deleteVersion(row.id)
        layer.msg('删除成功', { icon: 1 })
        table.remove((r) => r.id === row.id)
      } catch { /* silent */ }
    },
  })
}

// ===== 版本对比 =====
const compareVisible = ref(false)
const compareLeft = ref<Version | null>(null)
const compareRight = ref<Version | null>(null)

function onCompare(row: Version): void {
  const others = table.list.value.filter((v) => v.id !== row.id)
  if (others.length === 0) {
    layer.msg('没有其他版本可供对比', { icon: 2 })
    return
  }
  compareLeft.value = row
  compareRight.value = others[0]
  compareVisible.value = true
}

// ===== 映射 =====
function statusLabel(status: string): string {
  const map: Record<string, string> = { published: '已发布', draft: '草稿', deprecated: '已废弃' }
  return map[status] || status
}

function statusColor(status: string): string {
  const map: Record<string, string> = { published: '#16baaa', draft: '#ffb800', deprecated: '#999' }
  return map[status] || '#333'
}

function typeLabel(type: string): string {
  const map: Record<string, string> = { major: '主版本', minor: '次版本', patch: '补丁' }
  return map[type] || type
}

const columns = computed(() => [
  { title: '版本号', key: 'version', width: '120px' },
  { title: '类型', key: 'type', width: '100px', customSlot: 'typeCol' },
  { title: '更新摘要', key: 'summary', customSlot: 'summaryCol' },
  { title: '发布日期', key: 'publishDate', width: '120px' },
  { title: '强制更新', key: 'forceUpdate', width: '100px', customSlot: 'forceCol' },
  { title: '状态', key: 'status', width: '100px', customSlot: 'statusCol' },
  { title: '操作', key: 'op', width: '260px', customSlot: 'opCol' },
])

type PageLayout = ('count' | 'prev' | 'page' | 'next' | 'limits' | 'refresh' | 'skip')[]
const pageLayout = computed<PageLayout>(() => ['count', 'prev', 'page', 'next', 'limits', 'refresh'])

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已废弃', value: 'deprecated' },
]

const typeOptions = [
  { label: '主版本', value: 'major' },
  { label: '次版本', value: 'minor' },
  { label: '补丁', value: 'patch' },
]
</script>

<template>
  <div class="lva-version-page">
    <!-- 搜索条 -->
    <section class="lva-version-page__filter">
      <div class="lva-version-page__row">
        <lay-input
          v-model="table.query.value.version"
          placeholder="版本号"
          allow-clear
          style="width: 180px"
        />
        <lay-select
          v-model="table.query.value.type"
          placeholder="类型"
          allow-clear
          style="width: 140px"
        >
          <lay-select-option
            v-for="opt in typeOptions"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          />
        </lay-select>
        <lay-select
          v-model="table.query.value.status"
          placeholder="状态"
          allow-clear
          style="width: 140px"
        >
          <lay-select-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          />
        </lay-select>
        <lay-button type="primary" @click="onSearch">搜索</lay-button>
        <lay-button @click="onReset">重置</lay-button>
      </div>
      <div class="lva-version-page__actions">
        <lay-button type="primary" @click="onCreate">
          <i class="layui-icon layui-icon-add-1" /> 新增版本
        </lay-button>
      </div>
    </section>

    <!-- 列表 -->
    <lay-table
      :data-source="table.list.value"
      :columns="columns"
      :loading="table.loading.value"
    >
      <template #typeCol="{ row }">
        <span>{{ typeLabel(row.type) }}</span>
      </template>
      <template #summaryCol="{ row }">
        <span class="lva-version-page__summary">{{ row.summary }}</span>
      </template>
      <template #forceCol="{ row }">
        <span :style="{ color: row.forceUpdate ? '#ff5722' : '#999' }">
          {{ row.forceUpdate ? '是' : '否' }}
        </span>
      </template>
      <template #statusCol="{ row }">
        <span :style="{ color: statusColor(row.status) }">{{ statusLabel(row.status) }}</span>
      </template>
      <template #opCol="{ row }">
        <a class="lva-version-page__op" @click="onEdit(row)">编辑</a>
        <a v-if="row.status === 'draft'" class="lva-version-page__op" @click="onPublish(row)">发布</a>
        <a class="lva-version-page__op" @click="onCompare(row)">对比</a>
        <a class="lva-version-page__op lva-version-page__op--danger" @click="onDelete(row)">删除</a>
      </template>
    </lay-table>

    <!-- 分页 -->
    <div class="lva-version-page__pager">
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

    <!-- 新增/编辑弹窗 -->
    <lay-layer
      v-model="dialogVisible"
      :title="isEdit ? '编辑版本' : '新增版本'"
      :area="['620px', '600px']"
      :shade-close="false"
    >
      <div style="padding: 20px">
        <lay-form :model="form" label-width="110">
          <lay-form-item label="版本号" required>
            <lay-input v-model="form.version" placeholder="如 v1.2.0" />
          </lay-form-item>
          <lay-form-item label="类型">
            <lay-select v-model="form.type" style="width: 100%">
              <lay-select-option
                v-for="opt in typeOptions"
                :key="opt.value"
                :value="opt.value"
                :label="opt.label"
              />
            </lay-select>
          </lay-form-item>
          <lay-form-item label="更新摘要">
            <lay-input v-model="form.summary" placeholder="一句话概括本次更新" />
          </lay-form-item>
          <lay-form-item label="详细更新内容">
            <lay-textarea v-model="form.content" placeholder="详细的更新日志（支持多行）" :rows="5" />
          </lay-form-item>
          <lay-form-item label="是否强制更新">
            <lay-switch v-model="form.forceUpdate" />
          </lay-form-item>
          <lay-form-item label="下载链接">
            <lay-input v-model="form.downloadUrl" placeholder="下载地址" />
          </lay-form-item>
          <lay-form-item label="发布日期">
            <lay-input v-model="form.publishDate" placeholder="如 2024-01-01" />
          </lay-form-item>
          <lay-form-item label="状态">
            <lay-select v-model="form.status" style="width: 100%">
              <lay-select-option
                v-for="opt in statusOptions"
                :key="opt.value"
                :value="opt.value"
                :label="opt.label"
              />
            </lay-select>
          </lay-form-item>
          <lay-form-item>
            <lay-button type="primary" @click="onSave">确定</lay-button>
            <lay-button @click="dialogVisible = false">取消</lay-button>
          </lay-form-item>
        </lay-form>
      </div>
    </lay-layer>

    <!-- 版本对比弹窗 -->
    <lay-layer
      v-model="compareVisible"
      title="版本对比"
      :area="['760px', '520px']"
      :shade-close="false"
    >
      <div style="padding: 20px">
        <div v-if="compareLeft && compareRight" class="lva-version-compare">
          <div class="lva-version-compare__col">
            <h4>{{ compareLeft.version }}</h4>
            <p><strong>类型：</strong>{{ typeLabel(compareLeft.type) }}</p>
            <p><strong>发布日期：</strong>{{ compareLeft.publishDate }}</p>
            <p><strong>状态：</strong>{{ statusLabel(compareLeft.status) }}</p>
            <p><strong>强制更新：</strong>{{ compareLeft.forceUpdate ? '是' : '否' }}</p>
            <p><strong>更新摘要：</strong>{{ compareLeft.summary }}</p>
            <p><strong>详细内容：</strong></p>
            <pre class="lva-version-compare__pre">{{ compareLeft.content }}</pre>
          </div>
          <div class="lva-version-compare__col">
            <h4>{{ compareRight.version }}</h4>
            <p><strong>类型：</strong>{{ typeLabel(compareRight.type) }}</p>
            <p><strong>发布日期：</strong>{{ compareRight.publishDate }}</p>
            <p><strong>状态：</strong>{{ statusLabel(compareRight.status) }}</p>
            <p><strong>强制更新：</strong>{{ compareRight.forceUpdate ? '是' : '否' }}</p>
            <p><strong>更新摘要：</strong>{{ compareRight.summary }}</p>
            <p><strong>详细内容：</strong></p>
            <pre class="lva-version-compare__pre">{{ compareRight.content }}</pre>
          </div>
        </div>
      </div>
    </lay-layer>
  </div>
</template>

<style scoped>
.lva-version-page { display: flex; flex-direction: column; gap: 12px; }
.lva-version-page__filter { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.lva-version-page__row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.lva-version-page__actions { display: flex; gap: 8px; }
.lva-version-page__pager { display: flex; justify-content: flex-end; }
.lva-version-page__summary {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
}
.lva-version-page__op {
  cursor: pointer;
  color: var(--global-primary-color, #16baaa);
  margin-right: 10px;
}
.lva-version-page__op:hover { text-decoration: underline; }
.lva-version-page__op--danger { color: #ff5722; }
.lva-version-compare { display: flex; gap: 20px; }
.lva-version-compare__col { flex: 1; border: 1px solid #eee; border-radius: 4px; padding: 12px; }
.lva-version-compare__col h4 { margin: 0 0 8px; color: #16baaa; }
.lva-version-compare__pre {
  background: #f8f8f8;
  padding: 8px;
  border-radius: 4px;
  white-space: pre-wrap;
  font-size: 13px;
  max-height: 180px;
  overflow-y: auto;
}
</style>
