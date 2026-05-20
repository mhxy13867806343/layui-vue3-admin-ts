<script setup lang="ts">
/**
 * SidebarItem —— 自定义递归侧边菜单项（亮色 + 分组风格）
 *
 * 行为：
 *   - directory + level=0 + 有 group 子项：标题 + 分组小标题 + 普通子项
 *   - directory + 普通：可展开/收起
 *   - menu：点击 router.push
 *
 * 视觉参考用户给的截图风格：
 *   亮色背景；目录标题加粗；menu 项常态浅灰、激活时蓝色 +
 *   左侧 indicator；分组标题小字浅灰。
 */
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useT } from '@/locales'

export interface SidebarMenuItem {
  id: number
  fullPath: string
  name: string
  icon?: string
  type: 'directory' | 'menu' | 'group'
  /** group 仅作分组小标题，不可点击 */
  children?: SidebarMenuItem[]
}

interface Props {
  item: SidebarMenuItem
  level: number
  openIds: Set<number>
  collapsed: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'toggle', id: number): void
  (e: 'navigate', fullPath: string): void
}>()

const route = useRoute()
const { t } = useT()

const isOpen = computed(() => props.openIds.has(props.item.id))

function matchActive(node: SidebarMenuItem): boolean {
  if (node.type === 'menu' && route.fullPath === node.fullPath) return true
  if (node.children) return node.children.some(matchActive)
  return false
}

const isActive = computed<boolean>(() => {
  if (props.item.type === 'menu') return route.fullPath === props.item.fullPath
  return matchActive(props.item)
})

function display(raw: string): string {
  if (!raw) return raw
  if (raw.startsWith('i18n:')) return t(raw.slice('i18n:'.length))
  return raw
}

function onClick(): void {
  if (props.item.type === 'group') return
  if (props.item.type === 'directory') {
    emit('toggle', props.item.id)
    return
  }
  emit('navigate', props.item.fullPath)
}

const indent = computed(() => 18 + props.level * 14)
const showCollapsedRoot = computed(() => props.collapsed && props.level === 0)

const popHover = ref(false)
let popTimer: ReturnType<typeof setTimeout> | null = null
function onMouseEnter(): void {
  if (!showCollapsedRoot.value || props.item.type !== 'directory') return
  if (popTimer) clearTimeout(popTimer)
  popHover.value = true
}
function onMouseLeave(): void {
  if (!showCollapsedRoot.value) return
  if (popTimer) clearTimeout(popTimer)
  popTimer = setTimeout(() => (popHover.value = false), 120)
}
function onPopEnter(): void {
  if (popTimer) clearTimeout(popTimer)
}
function onPopLeave(): void {
  if (popTimer) clearTimeout(popTimer)
  popTimer = setTimeout(() => (popHover.value = false), 120)
}
function onPopItemClick(node: SidebarMenuItem): void {
  if (node.type === 'menu') {
    emit('navigate', node.fullPath)
    popHover.value = false
  }
}
</script>

<template>
  <div
    class="lva-si"
    :class="{ 'is-group': item.type === 'group' }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- group：仅作分隔标题，不可点击 -->
    <div
      v-if="item.type === 'group'"
      class="lva-si__group-title"
      :style="{ paddingLeft: `${indent}px` }"
    >
      {{ display(item.name) }}
    </div>

    <!-- 普通项 -->
    <div
      v-else
      class="lva-si__row"
      :class="{
        'is-active': isActive,
        'is-leaf': item.type === 'menu',
        'is-dir-root': item.type === 'directory' && level === 0,
        'is-collapsed': showCollapsedRoot,
        'is-open': isOpen,
        [`level-${level}`]: true,
      }"
      :style="showCollapsedRoot ? undefined : { paddingLeft: `${indent}px` }"
      :title="showCollapsedRoot ? display(item.name) : undefined"
      @click="onClick"
    >
      <i v-if="item.icon" class="layui-icon lva-si__icon" :class="item.icon"></i>
      <span v-show="!showCollapsedRoot" class="lva-si__text">
        {{ display(item.name) }}
      </span>
      <i
        v-if="item.type === 'directory' && !showCollapsedRoot"
        class="layui-icon layui-icon-up lva-si__arrow"
        :class="{ 'is-open': isOpen }"
      ></i>
    </div>

    <!-- 展开模式：递归子项 -->
    <transition name="lva-si-collapse">
      <div
        v-if="
          (item.type === 'directory' || item.type === 'group') &&
          item.children?.length &&
          (item.type === 'group' || isOpen) &&
          !showCollapsedRoot
        "
        class="lva-si__children"
      >
        <SidebarItem
          v-for="c in item.children"
          :key="c.id"
          :item="c"
          :level="level + 1"
          :open-ids="openIds"
          :collapsed="collapsed"
          @toggle="(id: number) => emit('toggle', id)"
          @navigate="(p: string) => emit('navigate', p)"
        />
      </div>
    </transition>

    <!-- 折叠模式：hover popover -->
    <div
      v-if="
        showCollapsedRoot &&
        item.type === 'directory' &&
        item.children?.length &&
        popHover
      "
      class="lva-si__popover"
      @mouseenter="onPopEnter"
      @mouseleave="onPopLeave"
    >
      <div class="lva-si__pop-title">{{ display(item.name) }}</div>
      <template v-for="c in item.children" :key="c.id">
        <div v-if="c.type === 'group'" class="lva-si__pop-group">
          {{ display(c.name) }}
        </div>
        <div
          v-else
          class="lva-si__pop-item"
          :class="{ 'is-active': c.type === 'menu' && route.fullPath === c.fullPath }"
          @click="onPopItemClick(c)"
        >
          <i v-if="c.icon" class="layui-icon" :class="c.icon"></i>
          <span>{{ display(c.name) }}</span>
        </div>
        <template v-if="c.type === 'group' && c.children?.length">
          <div
            v-for="g in c.children"
            :key="`g-${g.id}`"
            class="lva-si__pop-item lva-si__pop-item--sub"
            :class="{ 'is-active': g.type === 'menu' && route.fullPath === g.fullPath }"
            @click="onPopItemClick(g)"
          >
            <i v-if="g.icon" class="layui-icon" :class="g.icon"></i>
            <span>{{ display(g.name) }}</span>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.lva-si { position: relative; }

.lva-si__group-title {
  padding: 12px 16px 6px;
  font-size: 12px;
  color: #b0b0b0;
  user-select: none;
  letter-spacing: 0.3px;
}

.lva-si__row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding-right: 16px;
  cursor: pointer;
  color: #595959;
  user-select: none;
  font-size: 14px;
  transition: background-color 0.15s ease, color 0.15s ease;
  border-left: 3px solid transparent;
}
.lva-si__row.is-dir-root {
  font-weight: 600;
  color: #303133;
}
.lva-si__row:hover {
  background: #f5f7fa;
  color: var(--global-primary-color, #16baaa);
}
.lva-si__row.is-leaf.is-active {
  color: var(--global-primary-color, #16baaa);
  background: #ecf5ff;
  border-left-color: var(--global-primary-color, #16baaa);
}
.lva-si__row.is-dir-root.is-active {
  color: var(--global-primary-color, #16baaa);
}

.lva-si__icon {
  font-size: 16px;
  flex: none;
  width: 18px;
  text-align: center;
}

.lva-si__text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lva-si__arrow {
  font-size: 12px;
  flex: none;
  opacity: 0.5;
  transition: transform 0.2s ease;
  transform: rotate(180deg);
}
.lva-si__arrow.is-open { transform: rotate(0deg); }

.lva-si__row.is-collapsed {
  justify-content: center;
  padding-left: 0 !important;
  padding-right: 0;
  border-left: none;
}

.lva-si__children { overflow: hidden; }

/* hover popover（折叠态） */
.lva-si__popover {
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 4px;
  min-width: 180px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
  z-index: 1000;
  border: 1px solid var(--global-neutral-color-3, #ebeef5);
}
.lva-si__pop-title {
  padding: 6px 14px 8px;
  font-size: 12px;
  color: #909399;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 4px;
  font-weight: 600;
}
.lva-si__pop-group {
  padding: 6px 14px 4px;
  font-size: 11px;
  color: #b0b0b0;
}
.lva-si__pop-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
}
.lva-si__pop-item--sub { padding-left: 26px; }
.lva-si__pop-item:hover {
  background: #f5f7fa;
  color: var(--global-primary-color, #16baaa);
}
.lva-si__pop-item.is-active {
  color: var(--global-primary-color, #16baaa);
  background: #ecf5ff;
}

/* 展开/收起动画 */
.lva-si-collapse-enter-active,
.lva-si-collapse-leave-active {
  overflow: hidden;
  transition: max-height 0.22s ease, opacity 0.18s ease;
  max-height: 800px;
}
.lva-si-collapse-enter-from,
.lva-si-collapse-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
