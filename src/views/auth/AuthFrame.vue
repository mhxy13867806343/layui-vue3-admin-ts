<script setup lang="ts">
/**
 * AuthFrame —— 登录 / 注册页公共壳
 *
 * 职责：
 *   1. 右上角放置 AuthTemplateSelector，切换 templateKey；
 *   2. 根据 templateKey 渲染 5 套模板组件；
 *   3. 768px 以下双栏模板降级为 centered-card（仅渲染层降级，不修改 storage）；
 *   4. 表单实例由调用方通过 <template #form> 注入，模板切换不重建表单状态（Property 11）。
 *
 * 用法：
 *   <AuthFrame mode="login" v-model:template-key="key">
 *     <template #form><LoginForm /></template>
 *   </AuthFrame>
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AuthTemplateSelector from './components/AuthTemplateSelector.vue'
import CenteredCardTemplate from './templates/CenteredCardTemplate.vue'
import SplitLeftIllustrationTemplate from './templates/SplitLeftIllustrationTemplate.vue'
import SplitRightIllustrationTemplate from './templates/SplitRightIllustrationTemplate.vue'
import FullscreenBgTemplate from './templates/FullscreenBgTemplate.vue'
import TopBannerTemplate from './templates/TopBannerTemplate.vue'
import { SPLIT_TEMPLATES, type AuthTemplateKey } from '@/types/auth-template'

interface Props {
  mode: 'login' | 'register'
  templateKey: AuthTemplateKey
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:templateKey', value: AuthTemplateKey): void
}>()

const templateMap = {
  'centered-card': CenteredCardTemplate,
  'split-left-illustration': SplitLeftIllustrationTemplate,
  'split-right-illustration': SplitRightIllustrationTemplate,
  'fullscreen-bg': FullscreenBgTemplate,
  'top-banner': TopBannerTemplate,
} as const

// ===== 小屏降级 =====
const isNarrow = ref<boolean>(false)
let mq: MediaQueryList | null = null
const onMQ = (e: MediaQueryListEvent | MediaQueryList): void => {
  isNarrow.value = e.matches
}

onMounted(() => {
  if (typeof window === 'undefined') return
  mq = window.matchMedia('(max-width: 768px)')
  isNarrow.value = mq.matches
  mq.addEventListener('change', onMQ)
})
onBeforeUnmount(() => {
  if (mq) mq.removeEventListener('change', onMQ)
})

/** 实际渲染的模板 key（小屏时把双栏降级为 centered-card；不写回 storage） */
const effectiveKey = computed<AuthTemplateKey>(() => {
  if (isNarrow.value && SPLIT_TEMPLATES.has(props.templateKey)) {
    return 'centered-card'
  }
  return props.templateKey
})

const TemplateComp = computed(() => templateMap[effectiveKey.value])

function onSelect(v: AuthTemplateKey): void {
  emit('update:templateKey', v)
}
</script>

<template>
  <div class="lva-auth-frame">
    <header class="lva-auth-frame__topbar">
      <AuthTemplateSelector :model-value="templateKey" @update:model-value="onSelect" />
    </header>
    <component :is="TemplateComp" :mode="mode">
      <template #form>
        <slot name="form" />
      </template>
    </component>
  </div>
</template>

<style scoped>
.lva-auth-frame {
  position: relative;
  min-height: 100vh;
}
.lva-auth-frame__topbar {
  position: fixed;
  top: 16px;
  right: 24px;
  z-index: 100;
}
@media (max-width: 768px) {
  .lva-auth-frame__topbar {
    top: 12px;
    right: 12px;
  }
}
</style>
