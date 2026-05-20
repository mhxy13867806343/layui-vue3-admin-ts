<script setup lang="ts">
/**
 * SettingsDrawer —— 右侧设置抽屉
 *
 * 分组：布局 / 主题 / 界面 / 安全
 * 通过 v-model 控制可见性。
 */
import { computed } from 'vue'
import { useAppStore, type LayoutMode, type VisualMode } from '@/store/modules/app'
import { PRESET_PRIMARIES } from '@/utils/theme'
import LvaDrawer from '@/components/LvaDrawer/index.vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const appStore = useAppStore()
const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const layoutOptions: Array<{ label: string; value: LayoutMode }> = [
  { label: '左侧菜单（side）', value: 'side' },
  { label: '顶部导航（top）', value: 'top' },
  { label: '混合（mix）', value: 'mix' },
]

const visualOptions: Array<{ label: string; value: VisualMode }> = [
  { label: '正常', value: 'normal' },
  { label: '色弱', value: 'weak' },
  { label: '灰度', value: 'gray' },
]

function setLayout(v: LayoutMode): void { appStore.setLayoutMode(v) }
function setVisual(v: VisualMode): void { appStore.setVisualMode(v) }
function toggleTheme(): void { appStore.setTheme(appStore.theme === 'dark' ? 'light' : 'dark') }
function setPrimary(c: string): void { appStore.setPrimary(c) }
function setWatermarkEnabled(v: boolean): void { appStore.setWatermark({ enabled: v }) }
function setWatermarkText(text: string | number | undefined): void {
  appStore.setWatermark({ text: text === undefined || text === null ? '' : String(text) })
}
function lockNow(): void {
  appStore.lock()
  visible.value = false
}
</script>

<template>
  <LvaDrawer v-model="visible" title="系统设置" placement="right" width="320px">
    <div class="lva-settings">
      <!-- 布局 -->
      <section class="lva-settings__group">
        <h4 class="lva-settings__h">布局</h4>
        <div class="lva-settings__row">
          <button
            v-for="o in layoutOptions"
            :key="o.value"
            class="lva-settings__chip"
            :class="{ 'is-active': appStore.layoutMode === o.value }"
            type="button"
            @click="setLayout(o.value)"
          >
            {{ o.label }}
          </button>
        </div>
      </section>

      <!-- 主题 -->
      <section class="lva-settings__group">
        <h4 class="lva-settings__h">主题</h4>
        <div class="lva-settings__row">
          <button class="lva-settings__chip" type="button" @click="toggleTheme">
            {{ appStore.theme === 'dark' ? '切换为明亮' : '切换为暗黑' }}
          </button>
        </div>
        <div class="lva-settings__row lva-settings__palette">
          <span
            v-for="c in PRESET_PRIMARIES"
            :key="c"
            class="lva-settings__color"
            :class="{ 'is-active': c === appStore.primary }"
            :style="{ background: c }"
            @click="setPrimary(c)"
          />
        </div>
        <h5 class="lva-settings__sub">视觉模式</h5>
        <div class="lva-settings__row">
          <button
            v-for="o in visualOptions"
            :key="o.value"
            class="lva-settings__chip"
            :class="{ 'is-active': appStore.visualMode === o.value }"
            type="button"
            @click="setVisual(o.value)"
          >
            {{ o.label }}
          </button>
        </div>
      </section>

      <!-- 界面 -->
      <section class="lva-settings__group">
        <h4 class="lva-settings__h">界面</h4>
        <div class="lva-settings__row lva-settings__row--between">
          <span>水印</span>
          <lay-switch
            :model-value="appStore.watermark.enabled"
            @update:model-value="(v: boolean) => setWatermarkEnabled(v)"
          />
        </div>
        <div class="lva-settings__row">
          <lay-input
            :model-value="appStore.watermark.text"
            placeholder="水印文本"
            @update:model-value="(v: string | number | undefined) => setWatermarkText(v)"
          />
        </div>
      </section>

      <!-- 安全 -->
      <section class="lva-settings__group">
        <h4 class="lva-settings__h">安全</h4>
        <div class="lva-settings__row">
          <lay-button type="primary" fluid @click="lockNow">立即锁屏</lay-button>
        </div>
      </section>
    </div>
  </LvaDrawer>
</template>

<style scoped>
.lva-settings { display: flex; flex-direction: column; gap: 16px; padding: 4px 8px; }
.lva-settings__group { display: flex; flex-direction: column; gap: 8px; }
.lva-settings__h { margin: 0; font-size: 14px; font-weight: 600; }
.lva-settings__sub { margin: 8px 0 0; font-size: 13px; color: #666; font-weight: 500; }
.lva-settings__row { display: flex; gap: 8px; flex-wrap: wrap; }
.lva-settings__row--between { justify-content: space-between; align-items: center; }
.lva-settings__chip {
  padding: 4px 10px;
  border: 1px solid var(--global-neutral-color-3, #e6e6e6);
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.lva-settings__chip.is-active {
  border-color: var(--global-primary-color, #16baaa);
  color: var(--global-primary-color, #16baaa);
}
.lva-settings__palette { padding: 4px 0; }
.lva-settings__color {
  display: inline-block;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
}
.lva-settings__color.is-active { border-color: #000; }
</style>
