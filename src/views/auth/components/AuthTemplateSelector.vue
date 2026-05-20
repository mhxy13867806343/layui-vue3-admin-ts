<script setup lang="ts">
/**
 * AuthTemplateSelector —— 登录/注册页右上角的模板切换器
 *
 * v-model: AuthTemplateKey；options 默认使用 AUTH_TEMPLATE_OPTIONS。
 * 视觉简洁：单个 <lay-select>，宽度自适应。
 */
import { computed } from 'vue'
import {
  AUTH_TEMPLATE_OPTIONS,
  type AuthTemplateKey,
  type AuthTemplateOption,
} from '@/types/auth-template'

interface Props {
  modelValue: AuthTemplateKey
  options?: AuthTemplateOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: AuthTemplateKey): void
}>()

const opts = computed<AuthTemplateOption[]>(() => props.options ?? AUTH_TEMPLATE_OPTIONS)

function onSelect(v: string | number | object): void {
  if (typeof v !== 'string') return
  emit('update:modelValue', v as AuthTemplateKey)
}
</script>

<template>
  <div class="lva-auth-tpl-selector">
    <lay-select
      :model-value="modelValue"
      placeholder="选择布局模板"
      @update:model-value="onSelect"
    >
      <lay-select-option
        v-for="o in opts"
        :key="o.value"
        :value="o.value"
        :label="o.label"
      />
    </lay-select>
  </div>
</template>

<style scoped>
.lva-auth-tpl-selector {
  width: 200px;
}
</style>
