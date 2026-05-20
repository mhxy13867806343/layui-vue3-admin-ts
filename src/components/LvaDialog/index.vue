<script setup lang="ts">
/**
 * LvaDialog —— 简易模态对话框
 *
 * 由于 layui-vue 没有 <lay-layer> 组件式 API，业务弹窗使用本组件代替。
 *   - v-model 控制可见性；
 *   - 点击遮罩 / Esc 触发关闭；
 *   - 头部 title + body slot + 默认 footer 由调用方填充；
 *
 * 视觉与 layui-vue 卡片风格保持一致，深色主题适配通过 var(--global-...) 变量。
 */
import { computed, onBeforeUnmount, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  width?: string
  shadeClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '480px',
  shadeClose: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

function close(): void {
  visible.value = false
}

function onShade(): void {
  if (props.shadeClose) close()
}

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape' && visible.value) close()
}

watch(visible, (v) => {
  if (typeof document === 'undefined') return
  if (v) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lva-dialog">
      <div v-if="visible" class="lva-dialog-mask" @click.self="onShade">
        <div class="lva-dialog" :style="{ width }">
          <header v-if="title || $slots.header" class="lva-dialog__header">
            <slot name="header">
              <span class="lva-dialog__title">{{ title }}</span>
            </slot>
            <button class="lva-dialog__close" type="button" @click="close">
              <i class="layui-icon layui-icon-close"></i>
            </button>
          </header>
          <div class="lva-dialog__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="lva-dialog__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lva-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
}
.lva-dialog {
  background: var(--global-neutral-color-2, #fff);
  border-radius: 6px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}
.lva-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--global-neutral-color-3, #eee);
}
.lva-dialog__title { font-weight: 600; font-size: 15px; }
.lva-dialog__close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
  color: #999;
}
.lva-dialog__close:hover { color: #333; }
.lva-dialog__body { flex: 1; overflow: auto; }
.lva-dialog__footer {
  padding: 12px 16px;
  border-top: 1px solid var(--global-neutral-color-3, #eee);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.lva-dialog-enter-active,
.lva-dialog-leave-active {
  transition: opacity 0.18s ease;
}
.lva-dialog-enter-active .lva-dialog,
.lva-dialog-leave-active .lva-dialog {
  transition: transform 0.18s ease;
}
.lva-dialog-enter-from,
.lva-dialog-leave-to { opacity: 0; }
.lva-dialog-enter-from .lva-dialog,
.lva-dialog-leave-to .lva-dialog { transform: translateY(-12px); }
</style>
