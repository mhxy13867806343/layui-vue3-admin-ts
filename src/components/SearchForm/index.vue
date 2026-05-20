<script setup lang="ts">
/**
 * SearchForm —— 通用搜索表单
 *
 * 设计目标（design.md「8. 业务模块拆解」）：
 *   - 纯展示 + 事件触发，不发起 HTTP 请求；
 *   - 通过 modelValue 与父组件双向同步表单值；
 *   - 「搜索」/「重置」按钮统一靠右对齐。
 */
import { computed } from 'vue'

export type SearchFieldType = 'input' | 'select' | 'date'

export interface SearchFieldOption {
  label: string
  value: string | number
}

export interface SearchField {
  label: string
  prop: string
  type: SearchFieldType
  placeholder?: string
  options?: SearchFieldOption[]
}

interface Props {
  modelValue: Record<string, unknown>
  fields: SearchField[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, unknown>): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const formModel = computed<Record<string, unknown>>(() => props.modelValue)

function getValue(prop: string): string | number | undefined {
  const raw = formModel.value[prop]
  if (raw === null || raw === undefined) return undefined
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  return String(raw)
}

function setValue(prop: string, value: unknown): void {
  emit('update:modelValue', { ...props.modelValue, [prop]: value })
}

function onSearch(): void {
  emit('search')
}

function onReset(): void {
  // 清空当前 modelValue 内容（参考 design.md：复制为空对象后向上同步）
  emit('update:modelValue', {})
  emit('reset')
}
</script>

<template>
  <lay-form class="lva-search-form" :model="formModel">
    <lay-form-item
      v-for="field in fields"
      :key="field.prop"
      :label="field.label"
      class="lva-search-form__item"
    >
      <lay-input
        v-if="field.type === 'input'"
        :model-value="getValue(field.prop)"
        :placeholder="field.placeholder"
        allow-clear
        @update:model-value="(v: string | number | object) => setValue(field.prop, v ?? '')"
      />
      <lay-select
        v-else-if="field.type === 'select'"
        :model-value="getValue(field.prop)"
        :placeholder="field.placeholder"
        allow-clear
        @update:model-value="(v: string | number | object) => setValue(field.prop, v ?? '')"
      >
        <lay-select-option
          v-for="opt in field.options ?? []"
          :key="String(opt.value)"
          :value="opt.value"
          :label="opt.label"
        />
      </lay-select>
      <lay-date-picker
        v-else
        :model-value="getValue(field.prop)"
        :placeholder="field.placeholder"
        @update:model-value="(v: string | number | object) => setValue(field.prop, v ?? '')"
      />
    </lay-form-item>
    <lay-form-item class="lva-search-form__actions">
      <lay-button type="primary" :loading="loading" @click="onSearch">搜索</lay-button>
      <lay-button @click="onReset">重置</lay-button>
    </lay-form-item>
  </lay-form>
</template>

<style scoped>
.lva-search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px 16px;
}

.lva-search-form__item {
  min-width: 220px;
}

.lva-search-form__actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
</style>
