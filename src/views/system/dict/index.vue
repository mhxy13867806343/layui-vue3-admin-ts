<script setup lang="ts">
/**
 * 字典管理 / system/dict
 *
 * - 左侧：字典类型列表（搜索 + CRUD）
 * - 右侧：选中字典类型后展示字典项列表（CRUD）
 */
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { layer } from '@layui/layui-vue'
import { useTable } from '@/hooks/useTable'
import {
  createDictItem,
  createDictType,
  deleteDictItem,
  deleteDictType,
  getDictItemList,
  getDictTypePage,
  updateDictItem,
  updateDictType,
  type DictItem,
  type DictType,
  type DictTypePageParams,
} from '@/api/dict-manage'

// ===== 字典类型 =====
interface TypeQuery extends Record<string, unknown> {
  name: string
  code: string
}

const initialTypeQuery: TypeQuery = { name: '', code: '' }

const typeTable = useTable<DictType, TypeQuery>(
  async (params) => {
    const apiParams: DictTypePageParams = {
      page: params.page,
      pageSize: params.pageSize,
    }
    if (params.name) apiParams.name = params.name
    if (params.code) apiParams.code = params.code
    return getDictTypePage(apiParams)
  },
  { initialQuery: initialTypeQuery, immediate: true },
)

function onTypeSearch(): void { void typeTable.search() }
function onTypeReset(): void { void typeTable.reset() }

// 选中的字典类型
const selectedType = ref<DictType | null>(null)

function onSelectType(row: DictType): void {
  selectedType.value = row
}

// ===== 字典类型弹窗 =====
const typeDialogVisible = ref(false)
const typeForm = ref<Partial<DictType>>({})
const isTypeEdit = ref(false)

function onCreateType(): void {
  isTypeEdit.value = false
  typeForm.value = { name: '', code: '', status: 1, remark: '' }
  typeDialogVisible.value = true
}

function onEditType(row: DictType): void {
  isTypeEdit.value = true
  typeForm.value = { ...row }
  typeDialogVisible.value = true
}

async function onSaveType(): Promise<void> {
  if (!typeForm.value.name || !typeForm.value.code) {
    layer.msg('名称和编码不能为空', { icon: 2 })
    return
  }
  try {
    if (isTypeEdit.value) {
      await updateDictType(typeForm.value)
    } else {
      await createDictType(typeForm.value)
    }
    layer.msg('保存成功', { icon: 1 })
    typeDialogVisible.value = false
    typeTable.refresh()
  } catch { /* silent */ }
}

function onDeleteType(row: DictType): void {
  layer.confirm(`确认删除字典类型「${row.name}」？`, {
    yes: async () => {
      try {
        await deleteDictType(row.id)
        layer.msg('删除成功', { icon: 1 })
        typeTable.remove((r) => r.id === row.id)
        if (selectedType.value?.id === row.id) {
          selectedType.value = null
        }
      } catch { /* silent */ }
    },
  })
}

// ===== 字典项 =====
const itemList = ref<DictItem[]>([])
const itemLoading = ref(false)

async function loadItems(): Promise<void> {
  if (!selectedType.value) {
    itemList.value = []
    return
  }
  itemLoading.value = true
  try {
    itemList.value = await getDictItemList(selectedType.value.id)
  } catch {
    itemList.value = []
  } finally {
    itemLoading.value = false
  }
}

watch(selectedType, () => { void loadItems() })

// ===== 字典项弹窗 =====
const itemDialogVisible = ref(false)
const itemForm = ref<Partial<DictItem>>({})
const isItemEdit = ref(false)

function onCreateItem(): void {
  if (!selectedType.value) {
    layer.msg('请先选择字典类型', { icon: 2 })
    return
  }
  isItemEdit.value = false
  itemForm.value = { dictTypeId: selectedType.value.id, label: '', value: '', sort: 0, status: 1 }
  itemDialogVisible.value = true
}

function onEditItem(row: DictItem): void {
  isItemEdit.value = true
  itemForm.value = { ...row }
  itemDialogVisible.value = true
}

async function onSaveItem(): Promise<void> {
  if (!itemForm.value.label) {
    layer.msg('字典标签不能为空', { icon: 2 })
    return
  }
  try {
    if (isItemEdit.value) {
      await updateDictItem(itemForm.value)
    } else {
      await createDictItem(itemForm.value)
    }
    layer.msg('保存成功', { icon: 1 })
    itemDialogVisible.value = false
    void loadItems()
  } catch { /* silent */ }
}

function onDeleteItem(row: DictItem): void {
  layer.confirm(`确认删除字典项「${row.label}」？`, {
    yes: async () => {
      try {
        await deleteDictItem(row.id)
        layer.msg('删除成功', { icon: 1 })
        void loadItems()
      } catch { /* silent */ }
    },
  })
}

// ===== 列定义 =====
const typeColumns = computed(() => [
  { title: '字典名称', key: 'name' },
  { title: '字典编码', key: 'code' },
  { title: '状态', key: 'status', width: '80px', customSlot: 'typeStatusCol' },
  { title: '操作', key: 'op', width: '180px', customSlot: 'typeOpCol' },
])

const itemColumns = computed(() => [
  { title: '字典标签', key: 'label' },
  { title: '字典值', key: 'value' },
  { title: '排序', key: 'sort', width: '80px' },
  { title: '状态', key: 'status', width: '80px', customSlot: 'itemStatusCol' },
  { title: '操作', key: 'op', width: '150px', customSlot: 'itemOpCol' },
])

type PageLayout = ('count' | 'prev' | 'page' | 'next' | 'limits' | 'refresh' | 'skip')[]
const pageLayout = computed<PageLayout>(() => ['count', 'prev', 'page', 'next', 'limits'])

/** lay-page @change 回调，参数为 { current, limit } */
function onPageChange(evt: { current: number; limit: number }): void {
  if (evt.limit !== typeTable.pageSize.value) {
    typeTable.pageSize.value = evt.limit
    typeTable.page.value = 1
  }
}

// 默认选中第一条字典类型
watch(
  () => typeTable.list.value,
  (list) => {
    if (!selectedType.value && list.length > 0) {
      void nextTick(() => {
        selectedType.value = list[0]
      })
    }
  },
  { immediate: true },
)

onMounted(() => {})
</script>

<template>
  <div class="lva-dict-page">
    <!-- 左侧：字典类型 -->
    <div class="lva-dict-page__left">
      <section class="lva-dict-page__filter">
        <div class="lva-dict-page__row">
          <lay-input v-model="typeTable.query.value.name" placeholder="字典名称" allow-clear style="width: 120px" />
          <lay-input v-model="typeTable.query.value.code" placeholder="字典编码" allow-clear style="width: 120px" />
          <lay-button type="primary" size="sm" @click="onTypeSearch">搜索</lay-button>
          <lay-button size="sm" @click="onTypeReset">重置</lay-button>
        </div>
        <lay-button type="primary" size="sm" @click="onCreateType">
          <i class="layui-icon layui-icon-add-1" /> 新增
        </lay-button>
      </section>

      <lay-table
        :data-source="typeTable.list.value"
        :columns="typeColumns"
        :loading="typeTable.loading.value"
      >
        <template #typeStatusCol="{ row }">
          <span :style="{ color: row.status === 1 ? '#16baaa' : '#999' }">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </span>
        </template>
        <template #typeOpCol="{ row }">
          <a class="lva-dict-page__op" @click="onSelectType(row)">选择</a>
          <a class="lva-dict-page__op" @click="onEditType(row)">编辑</a>
          <a class="lva-dict-page__op lva-dict-page__op--danger" @click="onDeleteType(row)">删除</a>
        </template>
      </lay-table>

      <div class="lva-dict-page__pager">
        <lay-page
          v-model="typeTable.page.value"
          :total="typeTable.total.value"
          :limit="typeTable.pageSize.value"
          :limits="[10, 20]"
          :layout="pageLayout"
          @change="onPageChange"
        />
      </div>
    </div>

    <!-- 右侧：字典项 -->
    <div class="lva-dict-page__right">
      <section class="lva-dict-page__filter">
        <span v-if="selectedType" class="lva-dict-page__title">
          {{ selectedType.name }}（{{ selectedType.code }}）的字典项
        </span>
        <span v-else class="lva-dict-page__title">请选择左侧字典类型</span>
        <lay-button v-if="selectedType" type="primary" size="sm" @click="onCreateItem">
          <i class="layui-icon layui-icon-add-1" /> 新增
        </lay-button>
      </section>

      <lay-table
        :data-source="itemList"
        :columns="itemColumns"
        :loading="itemLoading"
      >
        <template #itemStatusCol="{ row }">
          <span :style="{ color: row.status === 1 ? '#16baaa' : '#999' }">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </span>
        </template>
        <template #itemOpCol="{ row }">
          <a class="lva-dict-page__op" @click="onEditItem(row)">编辑</a>
          <a class="lva-dict-page__op lva-dict-page__op--danger" @click="onDeleteItem(row)">删除</a>
        </template>
      </lay-table>
    </div>

    <!-- 字典类型弹窗 -->
    <lay-layer
      v-model="typeDialogVisible"
      :title="isTypeEdit ? '编辑字典类型' : '新增字典类型'"
      :area="['500px', '380px']"
      :shade-close="false"
    >
      <div style="padding: 20px">
        <lay-form :model="typeForm" label-width="90">
          <lay-form-item label="字典名称" required>
            <lay-input v-model="typeForm.name" placeholder="请输入字典名称" />
          </lay-form-item>
          <lay-form-item label="字典编码" required>
            <lay-input v-model="typeForm.code" placeholder="请输入字典编码" :disabled="isTypeEdit" />
          </lay-form-item>
          <lay-form-item label="状态">
            <lay-switch v-model="typeForm.status" :onswitch-value="1" :unswitch-value="0" />
          </lay-form-item>
          <lay-form-item label="备注">
            <lay-input v-model="typeForm.remark" placeholder="请输入备注" />
          </lay-form-item>
          <lay-form-item>
            <lay-button type="primary" @click="onSaveType">确定</lay-button>
            <lay-button @click="typeDialogVisible = false">取消</lay-button>
          </lay-form-item>
        </lay-form>
      </div>
    </lay-layer>

    <!-- 字典项弹窗 -->
    <lay-layer
      v-model="itemDialogVisible"
      :title="isItemEdit ? '编辑字典项' : '新增字典项'"
      :area="['500px', '420px']"
      :shade-close="false"
    >
      <div style="padding: 20px">
        <lay-form :model="itemForm" label-width="90">
          <lay-form-item label="字典标签" required>
            <lay-input v-model="itemForm.label" placeholder="请输入字典标签" />
          </lay-form-item>
          <lay-form-item label="字典值" required>
            <lay-input v-model="itemForm.value" placeholder="请输入字典值" />
          </lay-form-item>
          <lay-form-item label="排序">
            <lay-input v-model.number="itemForm.sort" type="number" placeholder="排序号" />
          </lay-form-item>
          <lay-form-item label="状态">
            <lay-switch v-model="itemForm.status" :onswitch-value="1" :unswitch-value="0" />
          </lay-form-item>
          <lay-form-item>
            <lay-button type="primary" @click="onSaveItem">确定</lay-button>
            <lay-button @click="itemDialogVisible = false">取消</lay-button>
          </lay-form-item>
        </lay-form>
      </div>
    </lay-layer>
  </div>
</template>

<style scoped>
.lva-dict-page { display: flex; gap: 16px; height: 100%; }
.lva-dict-page__left { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.lva-dict-page__right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.lva-dict-page__filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.lva-dict-page__row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.lva-dict-page__title { font-weight: 600; font-size: 14px; color: #333; }
.lva-dict-page__pager { display: flex; justify-content: flex-end; }
.lva-dict-page__op {
  cursor: pointer;
  color: var(--global-primary-color, #16baaa);
  margin-right: 10px;
}
.lva-dict-page__op:hover { text-decoration: underline; }
.lva-dict-page__op--danger { color: #ff5722; }
</style>
