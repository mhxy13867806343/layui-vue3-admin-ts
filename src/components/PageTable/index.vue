<script setup lang="ts">
/**
 * PageTable —— 通用分页表格
 *
 * 直接把 columns 透传给 layui-vue 的 <lay-table>，并用 <lay-page> 接管分页。
 * 自定义渲染列：在 column 上设置 `customSlot: '<slotName>'`，业务侧通过同名具名 slot 渲染。
 */
import { computed } from 'vue'

export type ColumnAlign = 'left' | 'center' | 'right'

export interface PageTableColumn {
  title: string
  key?: string
  width?: string
  minWidth?: string
  align?: ColumnAlign
  customSlot?: string
}

interface Props {
  columns: PageTableColumn[]
  data: Record<string, unknown>[]
  loading?: boolean
  total: number
  page: number
  pageSize: number
  pageSizes?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pageSizes: () => [10, 20, 50],
})

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'change', payload: { page: number; pageSize: number }): void
}>()

const limits = computed<number[]>(() => props.pageSizes ?? [10, 20, 50])
type PageLayout = ('count' | 'prev' | 'page' | 'next' | 'limits' | 'refresh' | 'skip')[]
const layout = computed<PageLayout>(() => ['count', 'prev', 'page', 'next', 'limits', 'refresh', 'skip'])

const layColumns = computed(() =>
  props.columns.map((col) => {
    return {
      title: col.title,
      key: col.key ?? col.title,
      width: col.width,
      minWidth: col.minWidth,
      align: col.align ?? 'left',
      customSlot: col.customSlot,
    }
  }),
)

function emitChange(nextPage: number, nextSize: number): void {
  if (nextPage !== props.page) emit('update:page', nextPage)
  if (nextSize !== props.pageSize) emit('update:pageSize', nextSize)
  emit('change', { page: nextPage, pageSize: nextSize })
}

function onPageChange(p: number): void {
  emitChange(p, props.pageSize)
}

function onLimitChange(size: number): void {
  emitChange(1, size)
}

function slotNameOf(col: PageTableColumn): string {
  return col.customSlot ?? `__no_slot_${col.key ?? col.title}`
}
</script>

<template>
  <div class="lva-page-table">
    <lay-table :data-source="data" :columns="layColumns" :loading="loading">
      <template
        v-for="col in columns"
        #[slotNameOf(col)]="slotProps"
        :key="col.customSlot ?? col.key ?? col.title"
      >
        <slot
          v-if="col.customSlot"
          :name="col.customSlot"
          :row="slotProps.row"
          :index="slotProps.rowIndex"
        />
      </template>
    </lay-table>
    <div class="lva-page-table__footer">
      <lay-page
        :total="total"
        :current-page="page"
        :limit="pageSize"
        :limits="limits"
        :layout="layout"
        @change="(p: number) => onPageChange(p)"
        @limit-change="(s: number) => onLimitChange(s)"
      />
    </div>
  </div>
</template>

<style scoped>
.lva-page-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lva-page-table__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
