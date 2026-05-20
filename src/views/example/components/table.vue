<script setup lang="ts">
/**
 * 示例 - Table 表格
 *
 * 演示 layui-vue 原生 lay-table 与本项目封装的 PageTable。
 */
import { ref } from 'vue'
import PageTable, { type PageTableColumn } from '@/components/PageTable/index.vue'

interface Row {
  id: number
  name: string
  role: string
  status: 0 | 1
  createTime: string
}

const baseRows: Row[] = [
  { id: 1, name: '张三', role: '管理员', status: 1, createTime: '2026-01-15 10:21' },
  { id: 2, name: '李四', role: '编辑', status: 1, createTime: '2026-02-08 09:11' },
  { id: 3, name: '王五', role: '访客', status: 0, createTime: '2026-03-19 16:45' },
  { id: 4, name: '赵六', role: '编辑', status: 1, createTime: '2026-04-02 14:22' },
  { id: 5, name: '钱七', role: '访客', status: 0, createTime: '2026-04-21 11:38' },
]

// 原生表格
const nativeColumns = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: '姓名', key: 'name' },
  { title: '角色', key: 'role' },
  { title: '创建时间', key: 'createTime' },
]

// 封装后的分页表格
const allRows: Row[] = Array.from({ length: 28 }, (_, i) => {
  const tpl = baseRows[i % baseRows.length]
  return { ...tpl, id: i + 1, createTime: tpl.createTime }
})

const page = ref<number>(1)
const pageSize = ref<number>(10)
const loading = ref<boolean>(false)

const columns: PageTableColumn[] = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: '姓名', key: 'name' },
  { title: '角色', key: 'role' },
  { title: '状态', key: 'status', customSlot: 'status', width: '100px' },
  { title: '创建时间', key: 'createTime' },
]

function pageData(): Row[] {
  const start = (page.value - 1) * pageSize.value
  return allRows.slice(start, start + pageSize.value)
}

const data = ref<Row[]>(pageData())

function onPageChange({ page: p, pageSize: s }: { page: number; pageSize: number }): void {
  loading.value = true
  page.value = p
  pageSize.value = s
  setTimeout(() => {
    data.value = pageData()
    loading.value = false
  }, 200)
}
</script>

<template>
  <div class="lva-example">
    <h2 class="lva-example__title">Table 表格</h2>
    <p class="lva-example__desc">原生 lay-table 与项目封装 PageTable 的使用对比。</p>

    <section class="lva-example__section">
      <h3>原生 lay-table</h3>
      <lay-table :data-source="baseRows" :columns="nativeColumns" />
    </section>

    <section class="lva-example__section">
      <h3>PageTable(分页 + 自定义列)</h3>
      <PageTable
        :columns="columns"
        :data="data"
        :loading="loading"
        :total="allRows.length"
        :page="page"
        :page-size="pageSize"
        @change="onPageChange"
      >
        <template #status="{ row }">
          <lay-badge v-if="row.status === 1" type="primary">启用</lay-badge>
          <lay-badge v-else>停用</lay-badge>
        </template>
      </PageTable>
    </section>
  </div>
</template>

<style scoped>
.lva-example { padding: 4px; }
.lva-example__title { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-example__desc { color: #666; font-size: 13px; margin-bottom: 18px; }
.lva-example__section {
  background: #fff;
  padding: 16px 20px;
  border-radius: 4px;
  margin-bottom: 14px;
}
.lva-example__section h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
}
</style>
