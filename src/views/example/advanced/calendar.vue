<script setup lang="ts">
/**
 * 日历页面
 *
 * - 月视图日历网格
 * - 前/后月导航
 * - 今日高亮
 * - 日期事件（彩色圆点）
 * - 点击日期查看事件列表
 * - 添加事件表单
 * - 周视图切换
 * - 迷你日历侧边栏
 */
import { computed, reactive, ref } from 'vue'

type ViewMode = 'month' | 'week'

interface CalendarEvent {
  id: number
  title: string
  date: string // YYYY-MM-DD
  color: string
}

const currentDate = ref(new Date())
const viewMode = ref<ViewMode>('month')
const selectedDate = ref('')
const showAddForm = ref(false)
let eventId = 100

const newEvent = reactive({ title: '', date: '', color: '#16baaa' })

const events = reactive<CalendarEvent[]>([
  { id: 1, title: '项目评审会议', date: formatDate(offsetDay(new Date(), 0)), color: '#1677ff' },
  { id: 2, title: '发布 v2.0', date: formatDate(offsetDay(new Date(), 2)), color: '#52c41a' },
  { id: 3, title: '团队聚餐', date: formatDate(offsetDay(new Date(), 5)), color: '#faad14' },
  { id: 4, title: '需求评审', date: formatDate(offsetDay(new Date(), -2)), color: '#ff4d4f' },
  { id: 5, title: '代码审查', date: formatDate(offsetDay(new Date(), 1)), color: '#722ed1' },
  { id: 6, title: '周报提交', date: formatDate(offsetDay(new Date(), 4)), color: '#13c2c2' },
  { id: 7, title: '客户演示', date: formatDate(offsetDay(new Date(), 7)), color: '#eb2f96' },
  { id: 8, title: '技术分享', date: formatDate(offsetDay(new Date(), -5)), color: '#1677ff' },
])

const colorOptions = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#16baaa']

function offsetDay(d: Date, offset: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + offset)
  return r
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())

const monthLabel = computed(() => `${year.value} 年 ${month.value + 1} 月`)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const calendarDays = computed(() => {
  const firstDay = new Date(year.value, month.value, 1)
  const startDay = firstDay.getDay()
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()
  const daysInPrevMonth = new Date(year.value, month.value, 0).getDate()

  const days: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean }[] = []

  // Previous month days
  for (let i = startDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const dateStr = formatDate(new Date(year.value, month.value - 1, d))
    days.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: false })
  }

  // Current month days
  const today = formatDate(new Date())
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = formatDate(new Date(year.value, month.value, i))
    days.push({ date: dateStr, day: i, isCurrentMonth: true, isToday: dateStr === today })
  }

  // Next month days to fill grid
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const dateStr = formatDate(new Date(year.value, month.value + 1, i))
    days.push({ date: dateStr, day: i, isCurrentMonth: false, isToday: false })
  }

  return days
})

const weekDays7 = computed(() => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - dayOfWeek)

  const days: { date: string; day: number; weekday: string; isToday: boolean }[] = []
  const todayStr = formatDate(today)
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    days.push({ date: formatDate(d), day: d.getDate(), weekday: weekDays[i], isToday: formatDate(d) === todayStr })
  }
  return days
})

function getEventsForDate(date: string): CalendarEvent[] {
  return events.filter((e) => e.date === date)
}

const selectedEvents = computed(() => {
  if (!selectedDate.value) return []
  return getEventsForDate(selectedDate.value)
})

function prevMonth(): void {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}

function nextMonth(): void {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}

function goToday(): void {
  currentDate.value = new Date()
}

function selectDate(date: string): void {
  selectedDate.value = date
}

function openAddForm(): void {
  newEvent.title = ''
  newEvent.date = selectedDate.value || formatDate(new Date())
  newEvent.color = '#16baaa'
  showAddForm.value = true
}

function addEvent(): void {
  if (!newEvent.title.trim() || !newEvent.date) return
  events.push({ id: eventId++, title: newEvent.title, date: newEvent.date, color: newEvent.color })
  showAddForm.value = false
}

function deleteEvent(id: number): void {
  const idx = events.findIndex((e) => e.id === id)
  if (idx > -1) events.splice(idx, 1)
}
</script>

<template>
  <div class="lva-cal">
    <h2>日历</h2>
    <p class="lva-cal__desc">日历组件，支持月/周视图、事件管理、日期导航。</p>

    <div class="lva-cal__layout">
      <!-- 迷你日历侧边栏 -->
      <div class="lva-cal__sidebar">
        <div class="lva-cal__mini">
          <div class="lva-cal__mini-header">
            <span>{{ monthLabel }}</span>
          </div>
          <div class="lva-cal__mini-grid">
            <span v-for="w in weekDays" :key="w" class="lva-cal__mini-weekday">{{ w }}</span>
            <span
              v-for="(d, i) in calendarDays.slice(0, 42)"
              :key="i"
              class="lva-cal__mini-day"
              :class="{
                'lva-cal__mini-day--other': !d.isCurrentMonth,
                'lva-cal__mini-day--today': d.isToday,
                'lva-cal__mini-day--selected': d.date === selectedDate,
              }"
              @click="selectDate(d.date)"
            >{{ d.day }}</span>
          </div>
        </div>

        <!-- 选中日期的事件 -->
        <div v-if="selectedDate" class="lva-cal__events-panel">
          <div class="lva-cal__events-title">
            {{ selectedDate }} 的事件
            <lay-button size="xs" type="primary" @click="openAddForm">+ 添加</lay-button>
          </div>
          <div v-if="selectedEvents.length === 0" class="lva-cal__no-events">暂无事件</div>
          <div v-for="ev in selectedEvents" :key="ev.id" class="lva-cal__event-item">
            <span class="lva-cal__event-dot" :style="{ background: ev.color }" />
            <span class="lva-cal__event-title">{{ ev.title }}</span>
            <i class="layui-icon layui-icon-close" style="cursor: pointer; font-size: 12px; color: #999;" @click="deleteEvent(ev.id)" />
          </div>
        </div>
      </div>

      <!-- 主日历区域 -->
      <div class="lva-cal__main">
        <!-- 工具栏 -->
        <div class="lva-cal__toolbar">
          <div class="lva-cal__nav">
            <lay-button size="sm" @click="prevMonth"><i class="layui-icon layui-icon-left" /></lay-button>
            <span class="lva-cal__month-label">{{ monthLabel }}</span>
            <lay-button size="sm" @click="nextMonth"><i class="layui-icon layui-icon-right" /></lay-button>
            <lay-button size="sm" @click="goToday">今天</lay-button>
          </div>
          <div class="lva-cal__view-toggle">
            <lay-button size="sm" :type="viewMode === 'month' ? 'primary' : 'default'" @click="viewMode = 'month'">月</lay-button>
            <lay-button size="sm" :type="viewMode === 'week' ? 'primary' : 'default'" @click="viewMode = 'week'">周</lay-button>
          </div>
        </div>

        <!-- 月视图 -->
        <div v-if="viewMode === 'month'" class="lva-cal__grid">
          <div v-for="w in weekDays" :key="w" class="lva-cal__grid-header">{{ w }}</div>
          <div
            v-for="(d, i) in calendarDays"
            :key="i"
            class="lva-cal__grid-cell"
            :class="{
              'lva-cal__grid-cell--other': !d.isCurrentMonth,
              'lva-cal__grid-cell--today': d.isToday,
              'lva-cal__grid-cell--selected': d.date === selectedDate,
            }"
            @click="selectDate(d.date)"
          >
            <span class="lva-cal__grid-day">{{ d.day }}</span>
            <div class="lva-cal__grid-dots">
              <span v-for="ev in getEventsForDate(d.date).slice(0, 3)" :key="ev.id" class="lva-cal__dot" :style="{ background: ev.color }" />
            </div>
          </div>
        </div>

        <!-- 周视图 -->
        <div v-if="viewMode === 'week'" class="lva-cal__week">
          <div v-for="d in weekDays7" :key="d.date" class="lva-cal__week-col" :class="{ 'lva-cal__week-col--today': d.isToday }" @click="selectDate(d.date)">
            <div class="lva-cal__week-header">
              <span class="lva-cal__week-weekday">{{ d.weekday }}</span>
              <span class="lva-cal__week-day">{{ d.day }}</span>
            </div>
            <div class="lva-cal__week-events">
              <div v-for="ev in getEventsForDate(d.date)" :key="ev.id" class="lva-cal__week-event" :style="{ borderLeftColor: ev.color }">
                {{ ev.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加事件弹窗 -->
    <lay-layer v-model="showAddForm" title="添加事件" :area="['380px', '320px']" :shadeClose="true">
      <div class="lva-cal__form">
        <div class="lva-cal__form-item">
          <label>标题</label>
          <input v-model="newEvent.title" class="lva-cal__form-input" placeholder="事件标题" />
        </div>
        <div class="lva-cal__form-item">
          <label>日期</label>
          <input v-model="newEvent.date" class="lva-cal__form-input" type="date" />
        </div>
        <div class="lva-cal__form-item">
          <label>颜色</label>
          <div class="lva-cal__color-picker">
            <span
              v-for="c in colorOptions"
              :key="c"
              class="lva-cal__color-opt"
              :class="{ 'lva-cal__color-opt--active': newEvent.color === c }"
              :style="{ background: c }"
              @click="newEvent.color = c"
            />
          </div>
        </div>
        <div class="lva-cal__form-actions">
          <lay-button type="primary" @click="addEvent">确定</lay-button>
          <lay-button @click="showAddForm = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>
  </div>
</template>

<style scoped>
.lva-cal { padding: 4px; }
.lva-cal h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-cal__desc { color: #666; font-size: 13px; margin-bottom: 20px; }

.lva-cal__layout { display: flex; gap: 16px; }

/* Sidebar */
.lva-cal__sidebar { width: 240px; flex-shrink: 0; }
.lva-cal__mini { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 12px; }
.lva-cal__mini-header { font-size: 13px; font-weight: 500; text-align: center; margin-bottom: 8px; }
.lva-cal__mini-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; }
.lva-cal__mini-weekday { font-size: 11px; color: #999; padding: 4px 0; }
.lva-cal__mini-day { font-size: 12px; padding: 4px; border-radius: 4px; cursor: pointer; }
.lva-cal__mini-day:hover { background: #f0f0f0; }
.lva-cal__mini-day--other { color: #ccc; }
.lva-cal__mini-day--today { background: var(--global-primary-color, #16baaa); color: #fff; font-weight: 600; }
.lva-cal__mini-day--selected { outline: 2px solid var(--global-primary-color, #16baaa); }

.lva-cal__events-panel { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 12px; margin-top: 12px; }
.lva-cal__events-title { font-size: 13px; font-weight: 500; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
.lva-cal__no-events { font-size: 12px; color: #bbb; text-align: center; padding: 16px 0; }
.lva-cal__event-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f5f5f5; }
.lva-cal__event-item:last-child { border-bottom: none; }
.lva-cal__event-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.lva-cal__event-title { flex: 1; font-size: 13px; }

/* Main */
.lva-cal__main { flex: 1; background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; }
.lva-cal__toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.lva-cal__nav { display: flex; align-items: center; gap: 8px; }
.lva-cal__month-label { font-size: 16px; font-weight: 500; min-width: 120px; text-align: center; }
.lva-cal__view-toggle { display: flex; gap: 4px; }

/* Month grid */
.lva-cal__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #f0f0f0; border: 1px solid #f0f0f0; border-radius: 4px; overflow: hidden; }
.lva-cal__grid-header { background: #fafafa; padding: 8px; text-align: center; font-size: 13px; font-weight: 500; }
.lva-cal__grid-cell {
  background: #fff; padding: 8px; min-height: 70px; cursor: pointer; transition: background 0.15s;
}
.lva-cal__grid-cell:hover { background: #f9f9f9; }
.lva-cal__grid-cell--other { opacity: 0.4; }
.lva-cal__grid-cell--today .lva-cal__grid-day {
  background: var(--global-primary-color, #16baaa); color: #fff;
  width: 24px; height: 24px; border-radius: 50%; display: inline-flex;
  align-items: center; justify-content: center;
}
.lva-cal__grid-cell--selected { background: rgba(22, 186, 170, 0.06); }
.lva-cal__grid-day { font-size: 13px; }
.lva-cal__grid-dots { display: flex; gap: 3px; margin-top: 6px; flex-wrap: wrap; }
.lva-cal__dot { width: 6px; height: 6px; border-radius: 50%; }

/* Week view */
.lva-cal__week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.lva-cal__week-col { background: #fafafa; border-radius: 6px; padding: 12px 8px; min-height: 300px; cursor: pointer; }
.lva-cal__week-col:hover { background: #f5f5f5; }
.lva-cal__week-col--today { background: rgba(22, 186, 170, 0.06); border: 1px solid var(--global-primary-color, #16baaa); }
.lva-cal__week-header { text-align: center; margin-bottom: 10px; }
.lva-cal__week-weekday { display: block; font-size: 12px; color: #999; }
.lva-cal__week-day { display: block; font-size: 18px; font-weight: 600; }
.lva-cal__week-events { display: flex; flex-direction: column; gap: 6px; }
.lva-cal__week-event { font-size: 11px; padding: 4px 6px; background: #fff; border-left: 3px solid #16baaa; border-radius: 3px; }

/* Add form */
.lva-cal__form { padding: 20px; }
.lva-cal__form-item { margin-bottom: 14px; }
.lva-cal__form-item label { display: block; font-size: 13px; color: #666; margin-bottom: 6px; }
.lva-cal__form-input { width: 100%; border: 1px solid #ddd; border-radius: 4px; padding: 8px 10px; font-size: 14px; box-sizing: border-box; }
.lva-cal__form-input:focus { border-color: var(--global-primary-color, #16baaa); outline: none; }
.lva-cal__color-picker { display: flex; gap: 8px; }
.lva-cal__color-opt { width: 24px; height: 24px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; }
.lva-cal__color-opt--active { border-color: #333; transform: scale(1.2); }
.lva-cal__form-actions { display: flex; gap: 8px; margin-top: 20px; }
</style>
