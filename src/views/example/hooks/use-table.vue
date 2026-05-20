<script setup lang="ts">
/**
 * 示例 - useTable
 *
 * 演示 useTable 的标准用法:loader + 双向同步 page/pageSize + search/reset/refresh。
 * 这里直接复用 user 接口拉数据,只是为了展示 hook 行为。
 */
import { useTable } from '@/hooks/useTable'
import { getUserPage, type UserPageParams } from '@/api/user'
import PageTable, { type PageTableColumn } from '@/components/PageTable/index.vue'

interface Query extends Record<string, unknown> {
  username?: string
}

const { list, total, loading, page, pageSize, query, search, reset, refresh } =
  useTable<Record<string, unknown>, Query>((params) =>
    getUserPage(params as unknown as UserPageParams),
  )

const columns: PageTableColumn[] = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: '用户名', key: 'username' },
  { title: '昵称', key: 'nickname' },
  { title: '邮箱', key: 'email' },
  { title: '状态', key: 'status', customSlot: 'status', width: '100px' },
]

function onPageChange({ page: p, pageSize: s }: { page: number; pageSize: number }): void {
  page.value = p
  pageSize.value = s
}
</script>

<template>
  <div class="lva-example">
    <h2 class="lva-example__title">useTable</h2>
    <p class="lva-example__desc">分页表格 hook,统一管理 list/total/loading/page/pageSize/query。</p>

    <section class="lva-example__section">
      <div class="lva-example__bar">
        <lay-input
          v-model="query.username"
          placeholder="按用户名搜索"
          allow-clear
          style="width: 220px"
        />
        <lay-button type="primary" @click="search">搜索</lay-button>
        <lay-button @click="reset">重置</lay-button>
        <lay-button @click="refresh">刷新</lay-button>
      </div>

      <PageTable
        :columns="columns"
        :data="list as Record<string, unknown>[]"
        :loading="loading"
        :total="total"
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

    <section class="lva-example__section">
      <h3>当前状态</h3>
      <pre class="lva-example__pre">{{ { page, pageSize, total, query, loading } }}</pre>
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
.lva-example__section h3 { font-size: 14px; font-weight: 600; margin: 0 0 12px; }
.lva-example__bar { display: flex; gap: 10px; margin-bottom: 12px; }
.lva-example__pre {
  background: #f7f8fa; padding: 12px; border-radius: 4px;
  font-size: 12px; margin: 0; overflow: auto;
}
</style>
