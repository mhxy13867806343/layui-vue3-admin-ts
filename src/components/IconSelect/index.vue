<script setup lang="ts">
/**
 * IconSelect —— layui-vue 图标选择器
 *
 * - 预置常用图标类名供点选；
 * - 同时允许在输入框内手输 icon 类名（方便后续接入更多自定义图标）；
 * - 通过 modelValue / update:modelValue 双向同步当前选中类名。
 */
import { computed } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '选择或输入 layui-icon 类名',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const PRESET_ICONS: string[] = [
  'layui-icon-home',
  'layui-icon-username',
  'layui-icon-password',
  'layui-icon-set',
  'layui-icon-list',
  'layui-icon-user',
  'layui-icon-tabs',
  'layui-icon-table',
  'layui-icon-tree',
  'layui-icon-form',
  'layui-icon-app',
  'layui-icon-component',
  'layui-icon-template',
  'layui-icon-chart',
  'layui-icon-console',
  'layui-icon-notice',
  'layui-icon-search',
  'layui-icon-edit',
  'layui-icon-delete',
  'layui-icon-refresh',
]

const inputValue = computed<string>(() => props.modelValue)

function onInput(value: string | number | object | undefined): void {
  if (value === undefined || value === null) {
    emit('update:modelValue', '')
    return
  }
  emit('update:modelValue', String(value))
}

function onPick(icon: string): void {
  emit('update:modelValue', icon)
}
</script>

<template>
  <div class="lva-icon-select">
    <lay-dropdown trigger="click">
      <lay-input
        :model-value="inputValue"
        :placeholder="placeholder"
        allow-clear
        readonly
        @update:model-value="onInput"
      >
        <template #suffix>
          <i v-if="modelValue" class="layui-icon" :class="modelValue"></i>
          <i v-else class="layui-icon layui-icon-down"></i>
        </template>
      </lay-input>
      <template #content>
        <div class="lva-icon-select__grid">
          <button
            v-for="icon in PRESET_ICONS"
            :key="icon"
            type="button"
            class="lva-icon-select__item"
            :class="{ 'is-active': icon === modelValue }"
            :title="icon"
            @click="onPick(icon)"
          >
            <i class="layui-icon" :class="icon"></i>
          </button>
        </div>
      </template>
    </lay-dropdown>
  </div>
</template>

<style scoped>
.lva-icon-select {
  display: inline-block;
  width: 100%;
}

.lva-icon-select__grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 12px;
}

.lva-icon-select__item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 36px;
  padding: 0;
  border: 1px solid var(--global-neutral-color-3, #e6e6e6);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.lva-icon-select__item:hover,
.lva-icon-select__item.is-active {
  border-color: var(--global-primary-color, #16baaa);
  color: var(--global-primary-color, #16baaa);
}
</style>
