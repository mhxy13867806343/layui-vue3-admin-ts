<script setup lang="ts">
/**
 * LvaDrawer —— 简易抽屉
 *
 * layui-vue 没有 <lay-drawer> 组件式 API；本组件用于替代 SettingsDrawer 等使用场景。
 * - v-model 控制可见性
 * - placement 决定方向（默认 right）
 * - width / height 控制尺寸
 */
import { computed, onBeforeUnmount, watch } from 'vue'

type Placement = 'left' | 'right' | 'top' | 'bottom'

interface Props {
  modelValue: boolean
  title?: string
  placement?: Placement
  width?: string
  height?: string
  shadeClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  placement: 'right',
  width: '320px',
  height: '320px',
  shadeClose: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const panelStyle = computed(() => {
  if (props.placement === 'left' || props.placement === 'right') return { width: props.width }
  return { height: props.height }
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
    <Transition name="lva-drawer">
      <div v-if="visible" class="lva-drawer-mask" @click.self="onShade">
        <div
          class="lva-drawer"
          :class="`lva-drawer--${placement}`"
          :style="panelStyle"
        >
          <header v-if="title" class="lva-drawer__header">
            <span>{{ title }}</span>
            <button class="lva-drawer__close" type="button" @click="close">
              <i class="layui-icon layui-icon-close"></i>
            </button>
          </header>
          <div class="lva-drawer__body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lva-drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9000;
}
.lva-drawer {
  position: absolute;
  background: var(--global-neutral-color-2, #fff);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.12);
}
.lva-drawer--right { top: 0; bottom: 0; right: 0; }
.lva-drawer--left { top: 0; bottom: 0; left: 0; }
.lva-drawer--top { left: 0; right: 0; top: 0; }
.lva-drawer--bottom { left: 0; right: 0; bottom: 0; }
.lva-drawer__header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--global-neutral-color-3, #eee);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}
.lva-drawer__close { background: transparent; border: none; cursor: pointer; color: #999; }
.lva-drawer__close:hover { color: #333; }
.lva-drawer__body { flex: 1; overflow: auto; padding: 16px; }

.lva-drawer-enter-active,
.lva-drawer-leave-active { transition: opacity 0.2s ease; }
.lva-drawer-enter-active .lva-drawer,
.lva-drawer-leave-active .lva-drawer { transition: transform 0.2s ease; }
.lva-drawer-enter-from,
.lva-drawer-leave-to { opacity: 0; }
.lva-drawer-enter-from .lva-drawer--right,
.lva-drawer-leave-to .lva-drawer--right { transform: translateX(100%); }
.lva-drawer-enter-from .lva-drawer--left,
.lva-drawer-leave-to .lva-drawer--left { transform: translateX(-100%); }
.lva-drawer-enter-from .lva-drawer--top,
.lva-drawer-leave-to .lva-drawer--top { transform: translateY(-100%); }
.lva-drawer-enter-from .lva-drawer--bottom,
.lva-drawer-leave-to .lva-drawer--bottom { transform: translateY(100%); }
</style>
