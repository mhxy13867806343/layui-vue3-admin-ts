<script setup lang="ts">
/**
 * 移动端排行榜 / advanced/mobile-rank
 *
 * 模拟 Gitee「推荐关注」移动端 H5 列表样式：
 * - 顶部 tab 切换：周榜 / 月榜 / 总榜
 * - 内容置于手机外壳容器内（max-width 390px，居中）
 * - 每行：头像 + 昵称 + 简介 + 数据统计 + 关注/已关注 按钮
 * - 前 3 名展示金/银/铜奖牌徽章
 * - 顶部「换一批」按钮，洗牌当前列表
 */
import { computed, onMounted, ref } from 'vue'
import { layer } from '@layui/layui-vue'
import { getMobileRank, type RankPeriod, type RankUser } from '@/api/mobile-rank'

const period = ref<RankPeriod>('week')
const list = ref<RankUser[]>([])
const loading = ref(false)

const currentTime = ref('')

function updateTime(): void {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  currentTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function loadList(): Promise<void> {
  loading.value = true
  try {
    list.value = await getMobileRank(period.value)
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function onTabChange(p: RankPeriod): void {
  period.value = p
  void loadList()
}

function onShuffle(): void {
  list.value = [...list.value].sort(() => Math.random() - 0.5)
  layer.msg('已为你换一批 🔄', { icon: 1 })
}

function onToggleFollow(user: RankUser): void {
  user.followed = !user.followed
  if (user.followed) {
    user.fansCount += 1
    layer.msg(`已关注 ${user.name}`, { icon: 1 })
  } else {
    user.fansCount = Math.max(0, user.fansCount - 1)
    layer.msg(`已取消关注 ${user.name}`, { icon: 0 })
  }
}

function rankBadge(idx: number): { text: string; bg: string } | null {
  if (idx === 0) return { text: '#1', bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }
  if (idx === 1) return { text: '#2', bg: 'linear-gradient(135deg,#cbd5e1,#94a3b8)' }
  if (idx === 2) return { text: '#3', bg: 'linear-gradient(135deg,#fb923c,#c2410c)' }
  return null
}

const periodLabel = computed(() => {
  if (period.value === 'week') return '本周'
  if (period.value === 'month') return '本月'
  return '总榜'
})

onMounted(() => {
  updateTime()
  setInterval(updateTime, 60_000)
  void loadList()
})
</script>

<template>
  <div class="lva-mobile-rank">
    <div class="lva-mobile-rank__intro">
      <h3>📱 移动端 H5 排行榜预览</h3>
      <p>下方为模拟手机视口效果，支持周榜 / 月榜 / 总榜切换、关注 / 取消关注、换一批洗牌。</p>
      <div class="lva-mobile-rank__tabs">
        <span
          :class="['lva-mobile-rank__tab', { active: period === 'week' }]"
          @click="onTabChange('week')"
        >周榜</span>
        <span
          :class="['lva-mobile-rank__tab', { active: period === 'month' }]"
          @click="onTabChange('month')"
        >月榜</span>
        <span
          :class="['lva-mobile-rank__tab', { active: period === 'all' }]"
          @click="onTabChange('all')"
        >总榜</span>
      </div>
    </div>

    <!-- 手机外壳 -->
    <div class="lva-phone">
      <!-- 状态栏 -->
      <div class="lva-phone__status">
        <span class="lva-phone__time">{{ currentTime }}</span>
        <div class="lva-phone__status-icons">
          <i class="layui-icon layui-icon-cellphone-fine" />
          <i class="layui-icon layui-icon-website" />
          <span class="lva-phone__battery">
            <span class="lva-phone__battery-fill" />
          </span>
        </div>
      </div>

      <!-- 顶部 Header -->
      <div class="lva-phone__header">
        <span class="lva-phone__title">💗 推荐关注</span>
        <button class="lva-phone__refresh" @click="onShuffle">
          <i class="layui-icon layui-icon-refresh" />
          换一批
        </button>
      </div>

      <!-- 列表 -->
      <div class="lva-phone__list" v-loading="loading">
        <div v-if="list.length === 0 && !loading" class="lva-phone__empty">
          暂无数据
        </div>
        <div
          v-for="(user, idx) in list"
          :key="user.id"
          class="lva-rank-item"
        >
          <div class="lva-rank-item__avatar-wrap">
            <div class="lva-rank-item__avatar" :style="{ background: user.avatarColor }">
              {{ user.name.slice(0, 1).toUpperCase() }}
            </div>
            <span
              v-if="rankBadge(idx)"
              class="lva-rank-item__badge"
              :style="{ background: rankBadge(idx)!.bg }"
            >
              {{ rankBadge(idx)!.text }}
            </span>
          </div>
          <div class="lva-rank-item__main">
            <div class="lva-rank-item__name">{{ user.name }}</div>
            <div class="lva-rank-item__bio">{{ user.bio }}</div>
            <div class="lva-rank-item__stats">
              <span><b>{{ user.followCount }}</b> 关注</span>
              <span><b>{{ user.fansCount }}</b> 粉丝</span>
              <span><b>{{ user.articleCount }}</b> 文章</span>
            </div>
          </div>
          <button
            :class="['lva-rank-item__follow', { followed: user.followed }]"
            @click="onToggleFollow(user)"
          >
            {{ user.followed ? '已关注' : '关注' }}
          </button>
        </div>
      </div>

      <!-- 底部安全区 -->
      <div class="lva-phone__safe-area">
        <span>{{ periodLabel }}排行榜</span>
        <span class="lva-phone__home-bar"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-mobile-rank {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.lva-mobile-rank__intro {
  text-align: center;
  max-width: 500px;
}
.lva-mobile-rank__intro h3 { margin: 0 0 4px; color: #333; }
.lva-mobile-rank__intro p { margin: 0 0 12px; color: #888; font-size: 13px; }
.lva-mobile-rank__tabs {
  display: inline-flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}
.lva-mobile-rank__tab {
  padding: 6px 18px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  border-radius: 6px;
  transition: all 0.2s;
  user-select: none;
}
.lva-mobile-rank__tab.active {
  background: #fff;
  color: #16baaa;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  font-weight: 500;
}

/* 手机外壳 */
.lva-phone {
  width: 390px;
  border-radius: 36px;
  background: #1a1a1a;
  padding: 6px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
.lva-phone__status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px 4px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.lva-phone__status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.lva-phone__battery {
  display: inline-block;
  width: 22px;
  height: 11px;
  border: 1px solid #fff;
  border-radius: 3px;
  position: relative;
  margin-left: 2px;
}
.lva-phone__battery::after {
  content: '';
  position: absolute;
  top: 3px;
  right: -3px;
  width: 2px;
  height: 5px;
  background: #fff;
  border-radius: 0 1px 1px 0;
}
.lva-phone__battery-fill {
  display: block;
  width: 80%;
  height: 100%;
  background: #4ade80;
  border-radius: 2px;
}
.lva-phone__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #1a1a1a;
}
.lva-phone__title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}
.lva-phone__refresh {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  background: #2a2a2a;
  color: #ddd;
  border: none;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}
.lva-phone__refresh:hover { background: #3a3a3a; }
.lva-phone__refresh i { font-size: 14px; }
.lva-phone__list {
  background: #1a1a1a;
  padding: 0 14px 12px;
  min-height: 540px;
}
.lva-phone__empty {
  color: #666;
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
}

.lva-rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.lva-rank-item:last-child { border-bottom: none; }
.lva-rank-item__avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.lva-rank-item__avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  font-weight: 600;
}
.lva-rank-item__badge {
  position: absolute;
  top: -6px;
  left: -6px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
.lva-rank-item__main {
  flex: 1;
  min-width: 0;
}
.lva-rank-item__name {
  font-size: 15px;
  color: #fff;
  font-weight: 600;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lva-rank-item__bio {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lva-rank-item__stats {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #666;
}
.lva-rank-item__stats b {
  color: #aaa;
  font-weight: 500;
}
.lva-rank-item__follow {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: 16px;
  border: 1px solid #2a2a2a;
  background: transparent;
  color: #ddd;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.lva-rank-item__follow:hover {
  background: #2a2a2a;
}
.lva-rank-item__follow.followed {
  background: rgba(22, 186, 170, 0.15);
  border-color: rgba(22, 186, 170, 0.4);
  color: #16baaa;
}
.lva-phone__safe-area {
  background: #1a1a1a;
  padding: 14px 0 18px;
  text-align: center;
  color: #555;
  font-size: 12px;
}
.lva-phone__home-bar {
  display: block;
  width: 130px;
  height: 4px;
  background: #fff;
  border-radius: 2px;
  margin: 12px auto 0;
}
</style>
