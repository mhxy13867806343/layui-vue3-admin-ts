<script setup lang="ts">
/**
 * NotificationCenter —— Header 铃铛 + 通知弹层
 *
 * - 铃铛 + 红点徽章（unread > 0 时显示数字）
 * - 弹层：消息 / 公告 / 待办 三个 tab，每个 tab 列表 + 「全部已读」按钮
 * - 60s 轮询 unread-count
 * - 单条点击 → 标记已读 → 同步刷新本 tab 列表与未读数
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { layer } from '@layui/layui-vue'
import {
  getNoticeList,
  getUnreadCount,
  markAllNoticeRead,
  markNoticeRead,
  type NoticeItem,
  type NoticeType,
  type UnreadCount,
} from '@/api/notice'

const activeTab = ref<NoticeType>('message')
const unread = ref<UnreadCount>({ message: 0, announcement: 0, todo: 0, total: 0 })

const lists = ref<Record<NoticeType, NoticeItem[]>>({
  message: [],
  announcement: [],
  todo: [],
})
const loading = ref<Record<NoticeType, boolean>>({
  message: false,
  announcement: false,
  todo: false,
})

const totalBadge = computed<string>(() => (unread.value.total > 99 ? '99+' : String(unread.value.total)))
const showBadge = computed<boolean>(() => unread.value.total > 0)

async function loadUnread(): Promise<void> {
  try {
    unread.value = await getUnreadCount()
  } catch {
    /* silent */
  }
}

async function loadList(type: NoticeType): Promise<void> {
  loading.value[type] = true
  try {
    const result = await getNoticeList({ type, page: 1, pageSize: 20 })
    lists.value[type] = result.list
  } finally {
    loading.value[type] = false
  }
}

async function onItemClick(item: NoticeItem): Promise<void> {
  if (item.read) return
  try {
    await markNoticeRead(item.id)
    item.read = true
    await loadUnread()
  } catch {
    /* http 拦截器已弹错 */
  }
}

async function onMarkAll(type: NoticeType): Promise<void> {
  try {
    await markAllNoticeRead(type)
    await Promise.all([loadList(type), loadUnread()])
    layer.msg('已标记为全部已读', { icon: 1 })
  } catch {
    /* silent */
  }
}

watch(activeTab, (t) => {
  void loadList(t)
})

let pollTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  void loadUnread()
  void loadList(activeTab.value)
  pollTimer = setInterval(() => void loadUnread(), 60_000)
})
onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const tabDefs: Array<{ key: NoticeType; label: string }> = [
  { key: 'message', label: '消息' },
  { key: 'announcement', label: '公告' },
  { key: 'todo', label: '待办' },
]

function unreadOf(type: NoticeType): number {
  return unread.value[type]
}
</script>

<template>
  <div class="lva-noti">
    <lay-dropdown trigger="click">
      <button class="lva-noti__btn" :title="`${unread.total} 条未读`" type="button">
        <i class="layui-icon layui-icon-notice"></i>
        <span v-if="showBadge" class="lva-noti__badge">{{ totalBadge }}</span>
      </button>
      <template #content>
        <div class="lva-noti__panel">
          <div class="lva-noti__tabs">
            <button
              v-for="t in tabDefs"
              :key="t.key"
              type="button"
              class="lva-noti__tab"
              :class="{ 'is-active': activeTab === t.key }"
              @click="activeTab = t.key"
            >
              {{ t.label }}
              <span v-if="unreadOf(t.key) > 0" class="lva-noti__tab-badge">
                {{ unreadOf(t.key) }}
              </span>
            </button>
          </div>
          <div class="lva-noti__actions">
            <a class="lva-noti__action" @click="onMarkAll(activeTab)">全部已读</a>
          </div>
          <div class="lva-noti__list">
            <div v-if="loading[activeTab]" class="lva-noti__empty">加载中…</div>
            <div v-else-if="lists[activeTab].length === 0" class="lva-noti__empty">暂无通知</div>
            <div
              v-for="it in lists[activeTab]"
              v-else
              :key="it.id"
              class="lva-noti__item"
              :class="{ 'is-read': it.read }"
              @click="onItemClick(it)"
            >
              <div class="lva-noti__title">
                {{ it.title }}
                <span v-if="!it.read" class="lva-noti__dot" />
              </div>
              <div class="lva-noti__content">{{ it.content }}</div>
              <div class="lva-noti__time">{{ it.createdAt }}</div>
            </div>
          </div>
        </div>
      </template>
    </lay-dropdown>
  </div>
</template>

<style scoped>
.lva-noti { position: relative; }
.lva-noti__btn {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 18px;
}
.lva-noti__btn:hover { background: var(--global-neutral-color-3, #f0f0f0); }
.lva-noti__badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ff5722;
  color: #fff;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  border-radius: 9px;
}
.lva-noti__panel { display: flex; flex-direction: column; max-height: 440px; }
.lva-noti__tabs { display: flex; border-bottom: 1px solid var(--global-neutral-color-3, #e6e6e6); }
.lva-noti__tab {
  flex: 1;
  padding: 10px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 13px;
  position: relative;
}
.lva-noti__tab.is-active { color: var(--global-primary-color, #16baaa); border-bottom: 2px solid var(--global-primary-color, #16baaa); }
.lva-noti__tab-badge {
  display: inline-block;
  margin-left: 4px;
  min-width: 16px;
  padding: 0 4px;
  background: #ff5722;
  color: #fff;
  border-radius: 8px;
  font-size: 10px;
  line-height: 16px;
}
.lva-noti__actions { display: flex; justify-content: flex-end; padding: 4px 12px; }
.lva-noti__action { font-size: 12px; cursor: pointer; color: var(--global-primary-color, #16baaa); }
.lva-noti__list { padding: 4px 0; overflow: auto; max-height: 360px; }
.lva-noti__item {
  padding: 10px 14px;
  border-bottom: 1px solid var(--global-neutral-color-3, #f0f0f0);
  cursor: pointer;
}
.lva-noti__item:hover { background: var(--global-neutral-color-1, #fafafa); }
.lva-noti__item.is-read { opacity: 0.6; }
.lva-noti__title { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.lva-noti__dot { width: 6px; height: 6px; background: #ff5722; border-radius: 50%; }
.lva-noti__content { margin-top: 4px; font-size: 12px; color: #555; line-height: 1.4; }
.lva-noti__time { margin-top: 4px; font-size: 11px; color: #999; }
.lva-noti__empty { padding: 24px 0; text-align: center; color: #999; font-size: 13px; }
</style>
