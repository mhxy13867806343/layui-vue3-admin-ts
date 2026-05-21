<script setup lang="ts">
/**
 * 多端动态 / advanced/dynamic-feed
 *
 * 类似 Gitee 动态页面，使用 tabs 切换三端预览：
 * - PC 端（宽屏时间线）
 * - H5/APP 端（手机外壳）
 * - 小程序端（微信小程序外壳）
 *
 * 每端展示相同的动态数据，但 UI 风格不同。
 * 支持筛选：所有动态 / 我的动态 / @我的 / 系统通知
 */
import { ref, computed } from 'vue'
import { layer } from '@layui/layui-vue'

type FeedType = 'all' | 'mine' | 'atMe' | 'system'
type Platform = 'pc' | 'h5' | 'miniapp'

interface FeedItem {
  id: number
  avatar: string
  avatarColor: string
  username: string
  action: string
  target: string
  detail: string
  time: string
  timeAgo: string
  type: FeedType
  liked: boolean
  likeCount: number
  commentCount: number
}

const platform = ref<Platform>('pc')
const filter = ref<FeedType>('all')

const currentTime = ref('')
function updateTime(): void {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  currentTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
updateTime()
setInterval(updateTime, 60_000)

const FEEDS: FeedItem[] = [
  { id: 1, avatar: 'A', avatarColor: '#16baaa', username: 'admin', action: '推送到了分支', target: 'layui-vue3-admin-ts 的 main 分支', detail: 'feat: add system management pages', time: '2026-05-21 14:30:00', timeAgo: '5 分钟前', type: 'mine', liked: false, likeCount: 3, commentCount: 1 },
  { id: 2, avatar: 'J', avatarColor: '#1e9fff', username: 'john', action: '创建了 Issue', target: '#42 登录页验证码不显示', detail: '在 Chrome 120 下验证码 canvas 为空白', time: '2026-05-21 13:20:00', timeAgo: '1 小时前', type: 'atMe', liked: false, likeCount: 5, commentCount: 3 },
  { id: 3, avatar: 'S', avatarColor: '#ff5722', username: 'system', action: '系统通知', target: '版本 v1.2.0 已发布', detail: '新增字典管理、系统设置、密钥管理等功能', time: '2026-05-21 10:00:00', timeAgo: '4 小时前', type: 'system', liked: false, likeCount: 12, commentCount: 0 },
  { id: 4, avatar: 'A', avatarColor: '#a855f7', username: 'alice', action: '评论了 Issue', target: '#38 菜单权限问题', detail: '已确认是路由守卫的判断逻辑问题', time: '2026-05-21 09:15:00', timeAgo: '5 小时前', type: 'atMe', liked: true, likeCount: 2, commentCount: 1 },
  { id: 5, avatar: 'A', avatarColor: '#16baaa', username: 'admin', action: '合并了 PR', target: '#15 feat: add Three.js demos', detail: '合并 feature/threejs 到 main', time: '2026-05-20 18:00:00', timeAgo: '昨天', type: 'mine', liked: false, likeCount: 8, commentCount: 2 },
  { id: 6, avatar: 'B', avatarColor: '#f59e0b', username: 'bob', action: '关注了你', target: '', detail: '', time: '2026-05-20 16:30:00', timeAgo: '昨天', type: 'atMe', liked: false, likeCount: 0, commentCount: 0 },
  { id: 7, avatar: 'S', avatarColor: '#ff5722', username: 'system', action: '安全提醒', target: '异地登录检测', detail: '检测到您的账号在新设备上登录，IP: 203.0.113.42（上海）', time: '2026-05-20 14:00:00', timeAgo: '昨天', type: 'system', liked: false, likeCount: 0, commentCount: 0 },
  { id: 8, avatar: 'T', avatarColor: '#ec4899', username: 'tester', action: '提交了代码', target: 'fix: 修复上传组件拖拽问题', detail: '修复 webkitGetAsEntry 在 Firefox 下的兼容性', time: '2026-05-20 11:00:00', timeAgo: '昨天', type: 'all', liked: false, likeCount: 4, commentCount: 1 },
  { id: 9, avatar: 'A', avatarColor: '#16baaa', username: 'admin', action: '创建了仓库', target: 'layui-vue3-admin-ts', detail: '基于 Vue3 + TypeScript + layui-vue 的后台管理系统', time: '2026-05-19 09:00:00', timeAgo: '2 天前', type: 'mine', liked: true, likeCount: 25, commentCount: 6 },
  { id: 10, avatar: 'S', avatarColor: '#ff5722', username: 'system', action: '系统维护通知', target: '计划维护时间：2026-05-25 02:00-04:00', detail: '届时系统将暂停服务，请提前保存工作', time: '2026-05-19 08:00:00', timeAgo: '2 天前', type: 'system', liked: false, likeCount: 1, commentCount: 0 },
]

const filteredFeeds = computed(() => {
  if (filter.value === 'all') return FEEDS
  return FEEDS.filter(f => f.type === filter.value)
})

const FILTER_OPTIONS = [
  { label: '所有动态', value: 'all' },
  { label: '我的动态', value: 'mine' },
  { label: '@我的', value: 'atMe' },
  { label: '系统通知', value: 'system' },
]

function onLike(feed: FeedItem): void {
  feed.liked = !feed.liked
  feed.likeCount += feed.liked ? 1 : -1
}

function onComment(feed: FeedItem): void {
  layer.msg(`评论「${feed.target || feed.action}」`, { icon: 0 })
}

function groupByDate(feeds: FeedItem[]): { date: string; items: FeedItem[] }[] {
  const map = new Map<string, FeedItem[]>()
  for (const f of feeds) {
    const date = f.time.split(' ')[0]
    if (!map.has(date)) map.set(date, [])
    map.get(date)!.push(f)
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }))
}

const groupedFeeds = computed(() => groupByDate(filteredFeeds.value))
</script>

<template>
  <div class="lva-feed">
    <!-- 平台切换 Tabs -->
    <lay-tab v-model="platform">
      <lay-tab-item title="💻 PC 端" id="pc" />
      <lay-tab-item title="📱 H5/APP 端" id="h5" />
      <lay-tab-item title="🔲 小程序端" id="miniapp" />
    </lay-tab>

    <!-- ===== PC 端 ===== -->
    <div v-if="platform === 'pc'" class="lva-feed-pc">
      <div class="lva-feed-pc__header">
        <h2 class="lva-feed-pc__title">动态</h2>
        <lay-select v-model="filter" style="width: 140px">
          <lay-select-option v-for="o in FILTER_OPTIONS" :key="o.value" :value="o.value" :label="o.label" />
        </lay-select>
      </div>
      <div class="lva-feed-pc__timeline">
        <div v-for="group in groupedFeeds" :key="group.date" class="lva-feed-pc__group">
          <div class="lva-feed-pc__date">
            <i class="layui-icon layui-icon-date" />
            <span>{{ group.date }}</span>
          </div>
          <div v-for="feed in group.items" :key="feed.id" class="lva-feed-pc__item">
            <div class="lva-feed-pc__avatar" :style="{ background: feed.avatarColor }">{{ feed.avatar }}</div>
            <div class="lva-feed-pc__body">
              <div class="lva-feed-pc__meta">
                <strong>{{ feed.username }}</strong>
                <span class="lva-feed-pc__action">{{ feed.action }}</span>
                <span class="lva-feed-pc__time">{{ feed.timeAgo }}</span>
              </div>
              <div v-if="feed.target" class="lva-feed-pc__target">{{ feed.target }}</div>
              <div v-if="feed.detail" class="lva-feed-pc__detail">{{ feed.detail }}</div>
              <div class="lva-feed-pc__actions">
                <span :class="['lva-feed-pc__like', { liked: feed.liked }]" @click="onLike(feed)">
                  <i class="layui-icon layui-icon-praise" /> {{ feed.likeCount }}
                </span>
                <span class="lva-feed-pc__comment" @click="onComment(feed)">
                  <i class="layui-icon layui-icon-reply-fill" /> {{ feed.commentCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="filteredFeeds.length === 0" class="lva-feed-pc__empty">暂无动态</div>
      </div>
    </div>

    <!-- ===== H5/APP 端 ===== -->
    <div v-if="platform === 'h5'" class="lva-feed-mobile">
      <div class="lva-phone">
        <div class="lva-phone__status"><span>{{ currentTime }}</span><div class="lva-phone__status-r"><span class="lva-phone__battery"><span class="lva-phone__battery-fill" /></span></div></div>
        <div class="lva-phone__navbar">
          <span class="lva-phone__navbar-title">动态</span>
          <lay-select v-model="filter" size="sm" style="width:110px">
            <lay-select-option v-for="o in FILTER_OPTIONS" :key="o.value" :value="o.value" :label="o.label" />
          </lay-select>
        </div>
        <div class="lva-phone__scroll">
          <div v-for="feed in filteredFeeds" :key="feed.id" class="lva-feed-h5__item">
            <div class="lva-feed-h5__avatar" :style="{ background: feed.avatarColor }">{{ feed.avatar }}</div>
            <div class="lva-feed-h5__body">
              <div class="lva-feed-h5__top"><strong>{{ feed.username }}</strong><span>{{ feed.timeAgo }}</span></div>
              <div class="lva-feed-h5__action">{{ feed.action }} <span v-if="feed.target">{{ feed.target }}</span></div>
              <div v-if="feed.detail" class="lva-feed-h5__detail">{{ feed.detail }}</div>
              <div class="lva-feed-h5__footer">
                <span :class="{ liked: feed.liked }" @click="onLike(feed)"><i class="layui-icon layui-icon-praise" /> {{ feed.likeCount }}</span>
                <span @click="onComment(feed)"><i class="layui-icon layui-icon-reply-fill" /> {{ feed.commentCount }}</span>
              </div>
            </div>
          </div>
          <div v-if="filteredFeeds.length === 0" class="lva-feed-h5__empty">暂无动态</div>
        </div>
        <div class="lva-phone__safe-area"><span class="lva-phone__home-bar" /></div>
      </div>
    </div>

    <!-- ===== 小程序端 ===== -->
    <div v-if="platform === 'miniapp'" class="lva-feed-mobile">
      <div class="lva-miniapp">
        <div class="lva-miniapp__status"><span>{{ currentTime }}</span><span class="lva-miniapp__capsule">···</span></div>
        <div class="lva-miniapp__navbar">
          <span class="lva-miniapp__back">‹</span>
          <span class="lva-miniapp__title">动态</span>
          <span class="lva-miniapp__dots">•••</span>
        </div>
        <div class="lva-miniapp__filter">
          <span v-for="o in FILTER_OPTIONS" :key="o.value" :class="['lva-miniapp__filter-item', { active: filter === o.value }]" @click="filter = o.value as FeedType">{{ o.label }}</span>
        </div>
        <div class="lva-miniapp__scroll">
          <div v-for="feed in filteredFeeds" :key="feed.id" class="lva-feed-mp__item">
            <div class="lva-feed-mp__avatar" :style="{ background: feed.avatarColor }">{{ feed.avatar }}</div>
            <div class="lva-feed-mp__body">
              <div class="lva-feed-mp__top"><strong>{{ feed.username }}</strong><span>{{ feed.timeAgo }}</span></div>
              <div class="lva-feed-mp__content">{{ feed.action }} {{ feed.target }}</div>
              <div v-if="feed.detail" class="lva-feed-mp__detail">{{ feed.detail }}</div>
              <div class="lva-feed-mp__footer">
                <span :class="{ liked: feed.liked }" @click="onLike(feed)">👍 {{ feed.likeCount }}</span>
                <span @click="onComment(feed)">💬 {{ feed.commentCount }}</span>
              </div>
            </div>
          </div>
          <div v-if="filteredFeeds.length === 0" class="lva-feed-mp__empty">暂无动态</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-feed { padding: 16px; }
/* ===== PC 端 ===== */
.lva-feed-pc { max-width: 800px; }
.lva-feed-pc__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.lva-feed-pc__title { margin: 0; font-size: 22px; color: #333; }
.lva-feed-pc__group { margin-bottom: 24px; }
.lva-feed-pc__date { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #666; margin-bottom: 12px; padding-left: 4px; }
.lva-feed-pc__date i { font-size: 16px; }
.lva-feed-pc__item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f0f0f0; }
.lva-feed-pc__item:last-child { border-bottom: none; }
.lva-feed-pc__avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 600; flex-shrink: 0; }
.lva-feed-pc__body { flex: 1; min-width: 0; }
.lva-feed-pc__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lva-feed-pc__meta strong { color: #333; font-size: 14px; }
.lva-feed-pc__action { color: #666; font-size: 13px; }
.lva-feed-pc__time { color: #bbb; font-size: 12px; margin-left: auto; }
.lva-feed-pc__target { margin-top: 6px; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; border-left: 3px solid #16baaa; font-size: 13px; color: #555; }
.lva-feed-pc__detail { margin-top: 6px; font-size: 13px; color: #888; }
.lva-feed-pc__actions { display: flex; gap: 16px; margin-top: 8px; }
.lva-feed-pc__like, .lva-feed-pc__comment { cursor: pointer; font-size: 13px; color: #999; display: flex; align-items: center; gap: 4px; transition: color 0.2s; }
.lva-feed-pc__like:hover { color: #ff5722; }
.lva-feed-pc__like.liked { color: #ff5722; }
.lva-feed-pc__comment:hover { color: #16baaa; }
.lva-feed-pc__empty { text-align: center; color: #bbb; padding: 40px 0; }
/* ===== H5/APP 端 ===== */
.lva-feed-mobile { display: flex; justify-content: center; padding: 20px 0; }
.lva-phone { width: 390px; border-radius: 36px; background: #1a1a1a; padding: 6px; box-shadow: 0 12px 40px rgba(0,0,0,.18); overflow: hidden; display: flex; flex-direction: column; }
.lva-phone__status { display: flex; justify-content: space-between; align-items: center; padding: 8px 24px 4px; color: #fff; font-size: 14px; font-weight: 600; }
.lva-phone__status-r { display: flex; align-items: center; gap: 6px; }
.lva-phone__battery { display: inline-block; width: 22px; height: 11px; border: 1px solid #fff; border-radius: 3px; position: relative; }
.lva-phone__battery::after { content: ''; position: absolute; top: 3px; right: -3px; width: 2px; height: 5px; background: #fff; border-radius: 0 1px 1px 0; }
.lva-phone__battery-fill { display: block; width: 80%; height: 100%; background: #4ade80; border-radius: 2px; }
.lva-phone__navbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #222; }
.lva-phone__navbar-title { color: #fff; font-size: 18px; font-weight: 600; }
.lva-phone__scroll { flex: 1; min-height: 520px; background: #111; overflow-y: auto; padding: 12px; }
.lva-phone__safe-area { padding: 8px 0 12px; text-align: center; background: #111; }
.lva-phone__home-bar { display: block; width: 130px; height: 4px; background: #fff; border-radius: 2px; margin: 0 auto; }
.lva-feed-h5__item { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
.lva-feed-h5__avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 15px; font-weight: 600; flex-shrink: 0; }
.lva-feed-h5__body { flex: 1; min-width: 0; }
.lva-feed-h5__top { display: flex; justify-content: space-between; align-items: center; }
.lva-feed-h5__top strong { color: #eee; font-size: 14px; }
.lva-feed-h5__top span { color: #666; font-size: 11px; }
.lva-feed-h5__action { color: #aaa; font-size: 13px; margin-top: 4px; }
.lva-feed-h5__action span { color: #16baaa; }
.lva-feed-h5__detail { margin-top: 6px; padding: 8px; background: #1a1a2e; border-radius: 6px; font-size: 12px; color: #888; }
.lva-feed-h5__footer { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: #666; }
.lva-feed-h5__footer span { cursor: pointer; display: flex; align-items: center; gap: 4px; }
.lva-feed-h5__footer .liked { color: #ff5722; }
.lva-feed-h5__empty { text-align: center; color: #555; padding: 40px 0; }
/* ===== 小程序端 ===== */
.lva-miniapp { width: 375px; border-radius: 20px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.12); overflow: hidden; display: flex; flex-direction: column; }
.lva-miniapp__status { display: flex; justify-content: space-between; align-items: center; padding: 6px 16px; background: #ededed; font-size: 12px; color: #333; }
.lva-miniapp__capsule { background: rgba(0,0,0,.08); padding: 2px 10px; border-radius: 12px; font-size: 14px; }
.lva-miniapp__navbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.lva-miniapp__back { font-size: 22px; color: #333; cursor: pointer; width: 30px; }
.lva-miniapp__title { font-size: 17px; font-weight: 600; color: #333; }
.lva-miniapp__dots { font-size: 18px; color: #999; width: 30px; text-align: right; }
.lva-miniapp__filter { display: flex; gap: 0; padding: 0 12px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.lva-miniapp__filter-item { padding: 10px 14px; font-size: 13px; color: #666; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
.lva-miniapp__filter-item.active { color: #07c160; border-bottom-color: #07c160; font-weight: 500; }
.lva-miniapp__scroll { flex: 1; min-height: 480px; overflow-y: auto; padding: 12px; background: #f6f6f6; }
.lva-feed-mp__item { display: flex; gap: 10px; padding: 12px; background: #fff; border-radius: 8px; margin-bottom: 10px; }
.lva-feed-mp__avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 600; flex-shrink: 0; }
.lva-feed-mp__body { flex: 1; min-width: 0; }
.lva-feed-mp__top { display: flex; justify-content: space-between; align-items: center; }
.lva-feed-mp__top strong { color: #333; font-size: 14px; }
.lva-feed-mp__top span { color: #999; font-size: 11px; }
.lva-feed-mp__content { color: #555; font-size: 13px; margin-top: 4px; }
.lva-feed-mp__detail { margin-top: 6px; padding: 8px; background: #f9f9f9; border-radius: 4px; font-size: 12px; color: #888; border-left: 3px solid #07c160; }
.lva-feed-mp__footer { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: #999; }
.lva-feed-mp__footer span { cursor: pointer; }
.lva-feed-mp__footer .liked { color: #ff5722; }
.lva-feed-mp__empty { text-align: center; color: #bbb; padding: 40px 0; }
</style>
