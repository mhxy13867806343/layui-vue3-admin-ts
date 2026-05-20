<script setup lang="ts">
/**
 * Dashboard —— 仪表盘
 *
 * - 欢迎语 + 当前用户昵称 + 当前日期
 * - 四个统计卡片：用户数 / 角色数 / 菜单数 / 今日访问
 * - 访问趋势折线图
 * - 快捷操作入口
 * - 最近活动 / 待办事项
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useT } from '@/locales'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import type { EChartsOption } from 'echarts'
import {
  getMenuCount,
  getRoleCount,
  getTodayVisits,
  getUserCount,
  type CountResp,
} from '@/api/dashboard'

use([CanvasRenderer, LineChart, BarChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

interface CardState {
  key: 'user' | 'role' | 'menu' | 'visit'
  title: string
  icon: string
  color: string
  value: number
  loading: boolean
  error: boolean
}

const userStore = useUserStore()
const router = useRouter()
const { t } = useT()

const nickname = computed(() => userStore.userInfo?.nickname ?? '管理员')
const today = ref(new Date().toLocaleDateString('zh-CN'))
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return t('dashboard.morningEarly')
  if (h < 12) return t('dashboard.morning')
  if (h < 14) return t('dashboard.noon')
  if (h < 18) return t('dashboard.afternoon')
  return t('dashboard.night')
})

const cards = reactive<Record<CardState['key'], CardState>>({
  user: { key: 'user', title: '', icon: 'layui-icon-username', color: '#16baaa', value: 0, loading: true, error: false },
  role: { key: 'role', title: '', icon: 'layui-icon-user', color: '#1e9fff', value: 0, loading: true, error: false },
  menu: { key: 'menu', title: '', icon: 'layui-icon-list', color: '#ffb800', value: 0, loading: true, error: false },
  visit: { key: 'visit', title: '', icon: 'layui-icon-chart', color: '#ff5722', value: 0, loading: true, error: false },
})

// 使用 computed 让标题响应语言切换
const cardTitles = computed(() => ({
  user: t('dashboard.cardUser'),
  role: t('dashboard.cardRole'),
  menu: t('dashboard.cardMenu'),
  visit: t('dashboard.cardVisit'),
}))

const cardOrder: CardState['key'][] = ['user', 'role', 'menu', 'visit']

const loaders: Record<CardState['key'], () => Promise<CountResp>> = {
  user: getUserCount,
  role: getRoleCount,
  menu: getMenuCount,
  visit: getTodayVisits,
}

async function loadCard(key: CardState['key']): Promise<void> {
  const c = cards[key]
  c.loading = true
  c.error = false
  try {
    const data = await loaders[key]()
    c.value = data.count
  } catch {
    c.error = true
  } finally {
    c.loading = false
  }
}

function loadAll(): void {
  cardOrder.forEach((k) => void loadCard(k))
}

// ===== 访问趋势图 =====
const trendOption = ref<EChartsOption>({
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0, data: ['访问量', '新增用户'] },
  grid: { top: 20, bottom: 50, left: 50, right: 30 },
  xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
  yAxis: { type: 'value' },
  series: [
    {
      name: '访问量',
      type: 'line',
      smooth: true,
      data: [820, 932, 901, 1034, 1290, 1330, 1320],
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,186,170,0.3)' }, { offset: 1, color: 'rgba(22,186,170,0.02)' }] } },
      itemStyle: { color: '#16baaa' },
    },
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      data: [120, 182, 191, 234, 290, 330, 310],
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(30,159,255,0.3)' }, { offset: 1, color: 'rgba(30,159,255,0.02)' }] } },
      itemStyle: { color: '#1e9fff' },
    },
  ],
})

// ===== 模块使用分布 =====
const moduleOption = ref<EChartsOption>({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { bottom: 0, type: 'scroll' },
  series: [
    {
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '45%'],
      label: { show: false },
      data: [
        { value: 435, name: '用户管理', itemStyle: { color: '#16baaa' } },
        { value: 310, name: '角色管理', itemStyle: { color: '#1e9fff' } },
        { value: 234, name: '菜单管理', itemStyle: { color: '#ffb800' } },
        { value: 180, name: '仪表盘', itemStyle: { color: '#ff5722' } },
        { value: 120, name: '其他', itemStyle: { color: '#a233c6' } },
      ],
    },
  ],
})

// ===== 快捷操作 =====
const shortcuts = [
  { icon: 'layui-icon-username', label: '用户管理', path: '/system/user', color: '#16baaa' },
  { icon: 'layui-icon-user', label: '角色管理', path: '/system/role', color: '#1e9fff' },
  { icon: 'layui-icon-list', label: '菜单管理', path: '/system/menu', color: '#ffb800' },
  { icon: 'layui-icon-set', label: '系统设置', path: '/system/user', color: '#ff5722' },
  { icon: 'layui-icon-chart', label: '图表示例', path: '/example/libs/charts', color: '#a233c6' },
  { icon: 'layui-icon-upload', label: '上传示例', path: '/example/libs/upload', color: '#2db7f5' },
]

function goTo(path: string): void {
  void router.push(path)
}

// ===== 最近活动 =====
const activities = [
  { time: '10 分钟前', user: 'admin', action: '修改了用户「张三」的角色' },
  { time: '30 分钟前', user: 'admin', action: '新增了角色「运营专员」' },
  { time: '1 小时前', user: 'editor', action: '导出了用户列表' },
  { time: '2 小时前', user: 'admin', action: '修改了菜单「系统管理」的排序' },
  { time: '3 小时前', user: 'admin', action: '重置了用户「李四」的密码' },
  { time: '昨天 18:30', user: 'editor', action: '登录了系统' },
]

// ===== 待办事项 =====
const todos = reactive([
  { id: 1, text: '完善用户导入功能', done: false },
  { id: 2, text: '优化角色权限分配交互', done: false },
  { id: 3, text: '添加操作日志模块', done: false },
  { id: 4, text: '接入消息推送服务', done: true },
  { id: 5, text: '完成单元测试覆盖', done: true },
])

function toggleTodo(id: number): void {
  const item = todos.find((t) => t.id === id)
  if (item) item.done = !item.done
}

onMounted(loadAll)
</script>

<template>
  <div class="lva-dashboard">
    <!-- 欢迎区 -->
    <section class="lva-dashboard__welcome">
      <div class="lva-dashboard__title">{{ greeting }}，{{ nickname }} 👋</div>
      <div class="lva-dashboard__sub">{{ today }} · 欢迎使用 layui-vue Admin 后台管理系统</div>
    </section>

    <!-- 统计卡片 -->
    <section class="lva-dashboard__grid">
      <div
        v-for="k in cardOrder"
        :key="k"
        class="lva-dashboard__card"
        :style="{ borderTop: `3px solid ${cards[k].color}` }"
      >
        <div class="lva-dashboard__card-head">
          <span class="lva-dashboard__card-title">{{ cardTitles[k] }}</span>
          <i class="layui-icon" :class="cards[k].icon" :style="{ color: cards[k].color }" />
        </div>
        <div class="lva-dashboard__card-body">
          <template v-if="cards[k].loading">
            <div class="lva-dashboard__skeleton" />
          </template>
          <template v-else-if="cards[k].error">
            <a class="lva-dashboard__retry" @click="loadCard(k)">{{ t('dashboard.retry') }}</a>
          </template>
          <template v-else>
            <div class="lva-dashboard__num">{{ cards[k].value }}</div>
          </template>
        </div>
      </div>
    </section>

    <!-- 图表区 -->
    <section class="lva-dashboard__charts">
      <div class="lva-dashboard__chart-card lva-dashboard__chart-card--wide">
        <h3>访问趋势（近一周）</h3>
        <VChart class="lva-dashboard__chart" :option="trendOption" autoresize />
      </div>
      <div class="lva-dashboard__chart-card">
        <h3>模块使用分布</h3>
        <VChart class="lva-dashboard__chart" :option="moduleOption" autoresize />
      </div>
    </section>

    <!-- 快捷操作 -->
    <section class="lva-dashboard__shortcuts">
      <h3>快捷操作</h3>
      <div class="lva-dashboard__shortcut-grid">
        <div
          v-for="s in shortcuts"
          :key="s.path"
          class="lva-dashboard__shortcut-item"
          @click="goTo(s.path)"
        >
          <i class="layui-icon" :class="s.icon" :style="{ color: s.color }" />
          <span>{{ s.label }}</span>
        </div>
      </div>
    </section>

    <!-- 底部两栏 -->
    <section class="lva-dashboard__bottom">
      <!-- 最近活动 -->
      <div class="lva-dashboard__panel">
        <h3>最近活动</h3>
        <div class="lva-dashboard__activity-list">
          <div v-for="(a, i) in activities" :key="i" class="lva-dashboard__activity-item">
            <div class="lva-dashboard__activity-dot" />
            <div class="lva-dashboard__activity-content">
              <span class="lva-dashboard__activity-user">{{ a.user }}</span>
              <span>{{ a.action }}</span>
            </div>
            <span class="lva-dashboard__activity-time">{{ a.time }}</span>
          </div>
        </div>
      </div>

      <!-- 待办事项 -->
      <div class="lva-dashboard__panel">
        <h3>待办事项</h3>
        <div class="lva-dashboard__todo-list">
          <div
            v-for="item in todos"
            :key="item.id"
            class="lva-dashboard__todo-item"
            :class="{ 'is-done': item.done }"
            @click="toggleTodo(item.id)"
          >
            <input type="checkbox" :checked="item.done" @click.stop="toggleTodo(item.id)" />
            <span>{{ item.text }}</span>
          </div>
        </div>
        <div class="lva-dashboard__todo-summary">
          已完成 {{ todos.filter(t => t.done).length }} / {{ todos.length }}
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lva-dashboard { display: flex; flex-direction: column; gap: 16px; }

/* Welcome */
.lva-dashboard__welcome {
  background: var(--global-neutral-color-2, #fff);
  border-radius: 4px; padding: 20px 24px;
}
.lva-dashboard__title { font-size: 22px; font-weight: 600; }
.lva-dashboard__sub { margin-top: 6px; font-size: 13px; color: #666; }

/* Cards */
.lva-dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.lva-dashboard__card {
  background: var(--global-neutral-color-2, #fff);
  border-radius: 4px; padding: 16px 20px; min-height: 100px;
  display: flex; flex-direction: column; gap: 12px;
  transition: transform 0.2s, box-shadow 0.2s; cursor: default;
}
.lva-dashboard__card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.lva-dashboard__card-head { display: flex; align-items: center; justify-content: space-between; }
.lva-dashboard__card-title { font-size: 13px; color: #666; }
.lva-dashboard__card-body { flex: 1; display: flex; align-items: center; }
.lva-dashboard__num { font-size: 28px; font-weight: 700; }
.lva-dashboard__skeleton {
  width: 80%; height: 28px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%; animation: lva-shimmer 1.4s infinite linear; border-radius: 4px;
}
.lva-dashboard__retry { cursor: pointer; color: #ff5722; font-size: 13px; }
.lva-dashboard__retry:hover { text-decoration: underline; }

/* Charts */
.lva-dashboard__charts {
  display: grid; gap: 16px;
  grid-template-columns: 2fr 1fr;
}
.lva-dashboard__chart-card {
  background: var(--global-neutral-color-2, #fff);
  border-radius: 4px; padding: 16px 20px;
}
.lva-dashboard__chart-card h3 { font-size: 14px; font-weight: 600; margin: 0 0 12px; }
.lva-dashboard__chart { height: 260px; width: 100%; }

/* Shortcuts */
.lva-dashboard__shortcuts {
  background: var(--global-neutral-color-2, #fff);
  border-radius: 4px; padding: 16px 20px;
}
.lva-dashboard__shortcuts h3 { font-size: 14px; font-weight: 600; margin: 0 0 14px; }
.lva-dashboard__shortcut-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px;
}
.lva-dashboard__shortcut-item {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
  background: #f9fafb;
}
.lva-dashboard__shortcut-item:hover { background: #ecf5ff; transform: translateY(-2px); }
.lva-dashboard__shortcut-item i { font-size: 24px; }
.lva-dashboard__shortcut-item span { font-size: 12px; color: #666; }

/* Bottom panels */
.lva-dashboard__bottom {
  display: grid; gap: 16px; grid-template-columns: 1fr 1fr;
}
.lva-dashboard__panel {
  background: var(--global-neutral-color-2, #fff);
  border-radius: 4px; padding: 16px 20px;
}
.lva-dashboard__panel h3 { font-size: 14px; font-weight: 600; margin: 0 0 14px; }

/* Activity */
.lva-dashboard__activity-list { display: flex; flex-direction: column; }
.lva-dashboard__activity-item {
  display: flex; align-items: flex-start; gap: 10px; padding: 10px 0;
  border-bottom: 1px solid #f5f5f5; font-size: 13px;
}
.lva-dashboard__activity-item:last-child { border-bottom: none; }
.lva-dashboard__activity-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #16baaa;
  margin-top: 5px; flex-shrink: 0;
}
.lva-dashboard__activity-content { flex: 1; color: #333; }
.lva-dashboard__activity-user { color: var(--global-primary-color, #16baaa); font-weight: 500; margin-right: 4px; }
.lva-dashboard__activity-time { font-size: 12px; color: #999; white-space: nowrap; }

/* Todo */
.lva-dashboard__todo-list { display: flex; flex-direction: column; }
.lva-dashboard__todo-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 0;
  border-bottom: 1px solid #f5f5f5; font-size: 13px; cursor: pointer;
}
.lva-dashboard__todo-item:last-child { border-bottom: none; }
.lva-dashboard__todo-item.is-done span { text-decoration: line-through; color: #ccc; }
.lva-dashboard__todo-item input[type="checkbox"] { accent-color: var(--global-primary-color, #16baaa); }
.lva-dashboard__todo-summary { margin-top: 12px; font-size: 12px; color: #999; text-align: right; }

@keyframes lva-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 768px) {
  .lva-dashboard__charts { grid-template-columns: 1fr; }
  .lva-dashboard__bottom { grid-template-columns: 1fr; }
}
</style>
