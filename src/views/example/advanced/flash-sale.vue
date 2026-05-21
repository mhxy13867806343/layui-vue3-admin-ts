<script setup lang="ts">
/**
 * 多端秒杀 / advanced/flash-sale
 *
 * 类似淘宝/京东秒杀页面，支持：
 * - 三端预览：PC / H5(APP) / 小程序
 * - 时间段配置：可自定义多个场次（08:00-10:00, 10:00-12:00 等）
 * - 全天模式
 * - 倒计时
 * - 商品卡片：图片、原价、秒杀价、进度条、已抢百分比
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { layer } from '@layui/layui-vue'

type Platform = 'pc' | 'h5' | 'miniapp'

interface TimeSlot {
  id: number
  start: string
  end: string
  label: string
}

interface SaleItem {
  id: number
  title: string
  coverColor: string
  originalPrice: number
  salePrice: number
  sold: number
  total: number
  tag: string
}

const platform = ref<Platform>('pc')
const isAllDay = ref(false)

const currentTime = ref('')
function updateTime(): void {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  currentTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
updateTime()
const timeInterval = setInterval(updateTime, 60_000)
onUnmounted(() => clearInterval(timeInterval))

// 时间段配置
let slotIdSeq = 10
const timeSlots = ref<TimeSlot[]>([
  { id: 1, start: '08:00', end: '10:00', label: '早场' },
  { id: 2, start: '10:00', end: '12:00', label: '上午场' },
  { id: 3, start: '12:00', end: '14:00', label: '午间场' },
  { id: 4, start: '14:00', end: '16:00', label: '下午场' },
  { id: 5, start: '16:00', end: '18:00', label: '傍晚场' },
  { id: 6, start: '20:00', end: '22:00', label: '晚间场' },
])
const activeSlotId = ref(2)
const newSlotStart = ref('')
const newSlotEnd = ref('')
const newSlotLabel = ref('')

function addSlot(): void {
  if (!newSlotStart.value || !newSlotEnd.value) { layer.msg('请填写开始和结束时间', { icon: 2 }); return }
  if (newSlotStart.value >= newSlotEnd.value) { layer.msg('结束时间必须大于开始时间', { icon: 2 }); return }
  slotIdSeq++
  timeSlots.value.push({ id: slotIdSeq, start: newSlotStart.value, end: newSlotEnd.value, label: newSlotLabel.value || `${newSlotStart.value}-${newSlotEnd.value}` })
  timeSlots.value.sort((a, b) => a.start.localeCompare(b.start))
  newSlotStart.value = ''; newSlotEnd.value = ''; newSlotLabel.value = ''
  layer.msg('已添加场次', { icon: 1 })
}

function removeSlot(id: number): void {
  if (timeSlots.value.length <= 1) { layer.msg('至少保留一个场次', { icon: 2 }); return }
  timeSlots.value = timeSlots.value.filter(s => s.id !== id)
  if (activeSlotId.value === id) activeSlotId.value = timeSlots.value[0].id
}

const activeSlot = computed(() => timeSlots.value.find(s => s.id === activeSlotId.value) || timeSlots.value[0])

// 倒计时
const countdown = ref({ hours: 0, minutes: 0, seconds: 0 })
let countdownTimer: ReturnType<typeof setInterval> | null = null

function startCountdown(): void {
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    const now = new Date()
    const endStr = activeSlot.value.end
    const [eh, em] = endStr.split(':').map(Number)
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eh, em, 0)
    let diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
    if (isAllDay.value) diff = 86400 - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds())
    countdown.value = { hours: Math.floor(diff / 3600), minutes: Math.floor((diff % 3600) / 60), seconds: diff % 60 }
  }, 1000)
}
onMounted(() => startCountdown())
onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer) })

// 商品数据
const COLORS = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#f368e0','#ee5a24','#009432','#6c5ce7','#fd79a8']
const TITLES = ['618超级美妆预售','心相印抽纸特价','今日秒杀工厂直发','泰国榴莲19.9/个','数码好物限时抢','家居收纳5折起','零食大礼包','运动装备清仓','母婴好物精选','护肤品套装','手机壳买一送一','蓝牙耳机特惠']
const TAGS = ['限时','秒杀','爆款','新品','热卖','特价']

function generateItems(count: number): SaleItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: TITLES[i % TITLES.length],
    coverColor: COLORS[i % COLORS.length],
    originalPrice: Math.floor(Math.random() * 200) + 50,
    salePrice: Math.floor(Math.random() * 30) + 5,
    sold: Math.floor(Math.random() * 90) + 10,
    total: 100,
    tag: TAGS[Math.floor(Math.random() * TAGS.length)],
  }))
}

const items = ref<SaleItem[]>(generateItems(12))

function onBuy(item: SaleItem): void {
  if (item.sold >= item.total) { layer.msg('已抢光', { icon: 2 }); return }
  item.sold = Math.min(item.sold + 1, item.total)
  layer.msg(`已抢购「${item.title}」🎉`, { icon: 1 })
}

const pad2 = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <div class="lva-sale">
    <!-- 配置面板 -->
    <div class="lva-sale__config">
      <div class="lva-sale__config-row">
        <span>平台：</span>
        <lay-radio-group v-model="platform">
          <lay-radio value="pc" label="💻 PC" />
          <lay-radio value="h5" label="📱 H5/APP" />
          <lay-radio value="miniapp" label="🔲 小程序" />
        </lay-radio-group>
      </div>
      <div class="lva-sale__config-row">
        <span>全天模式：</span>
        <lay-switch v-model="isAllDay" />
      </div>
    </div>
    <!-- 场次管理 -->
    <div v-if="!isAllDay" class="lva-sale__slots-config">
      <div class="lva-sale__slots-header">
        <strong>场次管理</strong>
        <div class="lva-sale__add-slot">
          <lay-input v-model="newSlotStart" placeholder="开始 如08:00" style="width:100px" size="sm" />
          <span>-</span>
          <lay-input v-model="newSlotEnd" placeholder="结束 如10:00" style="width:100px" size="sm" />
          <lay-input v-model="newSlotLabel" placeholder="标签(可选)" style="width:90px" size="sm" />
          <lay-button type="primary" size="xs" @click="addSlot">添加</lay-button>
        </div>
      </div>
      <div class="lva-sale__slots-list">
        <div v-for="s in timeSlots" :key="s.id" :class="['lva-sale__slot-tag', { active: s.id === activeSlotId }]" @click="activeSlotId = s.id">
          <span>{{ s.start }}-{{ s.end }}</span>
          <span class="lva-sale__slot-label">{{ s.label }}</span>
          <span class="lva-sale__slot-del" @click.stop="removeSlot(s.id)">✕</span>
        </div>
      </div>
    </div>

    <!-- ===== PC 端 ===== -->
    <div v-if="platform === 'pc'" class="lva-sale-pc">
      <div class="lva-sale-pc__header">
        <div class="lva-sale-pc__title">
          <span class="lva-sale-pc__flash">⚡ 限时秒杀</span>
          <span v-if="!isAllDay" class="lva-sale-pc__time-label">{{ activeSlot.start }} - {{ activeSlot.end }}</span>
          <span v-else class="lva-sale-pc__time-label">全天秒杀</span>
        </div>
        <div class="lva-sale-pc__countdown">
          <span>距结束</span>
          <span class="lva-sale-pc__cd-box">{{ pad2(countdown.hours) }}</span>:
          <span class="lva-sale-pc__cd-box">{{ pad2(countdown.minutes) }}</span>:
          <span class="lva-sale-pc__cd-box">{{ pad2(countdown.seconds) }}</span>
        </div>
      </div>
      <!-- 场次横向滚动 -->
      <div v-if="!isAllDay" class="lva-sale-pc__slots">
        <span v-for="s in timeSlots" :key="s.id" :class="['lva-sale-pc__slot', { active: s.id === activeSlotId }]" @click="activeSlotId = s.id">
          {{ s.start }}<br /><small>{{ s.label }}</small>
        </span>
      </div>
      <!-- 商品网格 -->
      <div class="lva-sale-pc__grid">
        <div v-for="item in items" :key="item.id" class="lva-sale-pc__card">
          <div class="lva-sale-pc__cover" :style="{ background: item.coverColor }">
            <span class="lva-sale-pc__tag">{{ item.tag }}</span>
          </div>
          <div class="lva-sale-pc__info">
            <div class="lva-sale-pc__item-title">{{ item.title }}</div>
            <div class="lva-sale-pc__prices">
              <span class="lva-sale-pc__sale-price">¥{{ item.salePrice }}</span>
              <span class="lva-sale-pc__orig-price">¥{{ item.originalPrice }}</span>
            </div>
            <div class="lva-sale-pc__progress">
              <div class="lva-sale-pc__progress-bar"><div class="lva-sale-pc__progress-fill" :style="{ width: (item.sold / item.total * 100) + '%' }" /></div>
              <span class="lva-sale-pc__progress-text">已抢{{ item.sold }}%</span>
            </div>
            <button class="lva-sale-pc__buy" :disabled="item.sold >= item.total" @click="onBuy(item)">{{ item.sold >= item.total ? '已抢光' : '马上抢' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== H5/APP 端 ===== -->
    <div v-if="platform === 'h5'" class="lva-sale-mobile">
      <div class="lva-phone">
        <div class="lva-phone__status"><span>{{ currentTime }}</span><span class="lva-phone__battery"><span class="lva-phone__battery-fill" /></span></div>
        <div class="lva-phone__navbar">
          <span>⚡ 限时秒杀</span>
          <span class="lva-phone__cd">{{ pad2(countdown.hours) }}:{{ pad2(countdown.minutes) }}:{{ pad2(countdown.seconds) }}</span>
        </div>
        <!-- 场次 -->
        <div v-if="!isAllDay" class="lva-phone__slots">
          <span v-for="s in timeSlots" :key="s.id" :class="['lva-phone__slot', { active: s.id === activeSlotId }]" @click="activeSlotId = s.id">{{ s.start }}<br /><small>{{ s.label }}</small></span>
        </div>
        <div class="lva-phone__scroll">
          <div class="lva-sale-h5__grid">
            <div v-for="item in items.slice(0,8)" :key="item.id" class="lva-sale-h5__card" @click="onBuy(item)">
              <div class="lva-sale-h5__cover" :style="{ background: item.coverColor }">
                <span class="lva-sale-h5__tag">{{ item.tag }}</span>
              </div>
              <div class="lva-sale-h5__info">
                <div class="lva-sale-h5__title">{{ item.title }}</div>
                <div class="lva-sale-h5__prices"><span class="lva-sale-h5__sale">¥{{ item.salePrice }}</span><span class="lva-sale-h5__orig">¥{{ item.originalPrice }}</span></div>
                <div class="lva-sale-h5__bar"><div class="lva-sale-h5__bar-fill" :style="{ width: (item.sold / item.total * 100) + '%' }" /><span>{{ item.sold }}%</span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="lva-phone__safe-area"><span class="lva-phone__home-bar" /></div>
      </div>
    </div>

    <!-- ===== 小程序端 ===== -->
    <div v-if="platform === 'miniapp'" class="lva-sale-mobile">
      <div class="lva-miniapp">
        <div class="lva-miniapp__status"><span>{{ currentTime }}</span><span class="lva-miniapp__capsule">···</span></div>
        <div class="lva-miniapp__navbar"><span class="lva-miniapp__back">‹</span><span>限时秒杀</span><span class="lva-miniapp__dots">•••</span></div>
        <div class="lva-miniapp__cd-bar">
          <span>🔥 距结束</span>
          <span class="lva-miniapp__cd">{{ pad2(countdown.hours) }}:{{ pad2(countdown.minutes) }}:{{ pad2(countdown.seconds) }}</span>
          <span v-if="!isAllDay">{{ activeSlot.start }}-{{ activeSlot.end }}</span>
          <span v-else>全天</span>
        </div>
        <div v-if="!isAllDay" class="lva-miniapp__slots">
          <span v-for="s in timeSlots" :key="s.id" :class="['lva-miniapp__slot', { active: s.id === activeSlotId }]" @click="activeSlotId = s.id">{{ s.start }}</span>
        </div>
        <div class="lva-miniapp__scroll">
          <div v-for="item in items.slice(0,8)" :key="item.id" class="lva-sale-mp__card">
            <div class="lva-sale-mp__cover" :style="{ background: item.coverColor }"><span class="lva-sale-mp__tag">{{ item.tag }}</span></div>
            <div class="lva-sale-mp__info">
              <div class="lva-sale-mp__title">{{ item.title }}</div>
              <div class="lva-sale-mp__prices"><span class="lva-sale-mp__sale">¥{{ item.salePrice }}</span><span class="lva-sale-mp__orig">¥{{ item.originalPrice }}</span></div>
              <button class="lva-sale-mp__buy" :disabled="item.sold >= item.total" @click="onBuy(item)">{{ item.sold >= item.total ? '已抢光' : '抢购' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-sale { padding: 16px; }
.lva-sale__config { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; padding: 12px 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px; }
.lva-sale__config-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555; }
.lva-sale__slots-config { padding: 12px 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px; }
.lva-sale__slots-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.lva-sale__slots-header strong { font-size: 14px; color: #333; }
.lva-sale__add-slot { display: flex; align-items: center; gap: 6px; }
.lva-sale__slots-list { display: flex; flex-wrap: wrap; gap: 8px; }
.lva-sale__slot-tag { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 16px; background: #f3f4f6; font-size: 12px; color: #555; cursor: pointer; transition: all 0.2s; position: relative; }
.lva-sale__slot-tag.active { background: #ff5722; color: #fff; }
.lva-sale__slot-label { font-size: 11px; opacity: 0.8; }
.lva-sale__slot-del { font-size: 14px; opacity: 0.5; cursor: pointer; margin-left: 4px; }
.lva-sale__slot-del:hover { opacity: 1; }
/* PC */
.lva-sale-pc { max-width: 900px; }
.lva-sale-pc__header { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 2px solid #ff5722; margin-bottom: 16px; }
.lva-sale-pc__flash { font-size: 22px; font-weight: 700; color: #ff5722; }
.lva-sale-pc__time-label { font-size: 14px; color: #888; margin-left: 12px; }
.lva-sale-pc__countdown { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #666; }
.lva-sale-pc__cd-box { display: inline-block; background: #333; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 16px; min-width: 28px; text-align: center; }
.lva-sale-pc__slots { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 4px; }
.lva-sale-pc__slot { padding: 8px 16px; border-radius: 8px; background: #f5f5f5; font-size: 13px; color: #666; cursor: pointer; text-align: center; white-space: nowrap; transition: all 0.2s; }
.lva-sale-pc__slot.active { background: #ff5722; color: #fff; }
.lva-sale-pc__slot small { font-size: 11px; opacity: 0.8; }
.lva-sale-pc__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.lva-sale-pc__card { border-radius: 8px; overflow: hidden; background: #fff; border: 1px solid #f0f0f0; transition: transform 0.2s; }
.lva-sale-pc__card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.08); }
.lva-sale-pc__cover { height: 140px; position: relative; display: flex; align-items: flex-start; padding: 8px; }
.lva-sale-pc__tag { background: #ff5722; color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
.lva-sale-pc__info { padding: 10px; }
.lva-sale-pc__item-title { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lva-sale-pc__prices { margin-bottom: 6px; }
.lva-sale-pc__sale-price { font-size: 18px; font-weight: 700; color: #ff5722; margin-right: 8px; }
.lva-sale-pc__orig-price { font-size: 12px; color: #bbb; text-decoration: line-through; }
.lva-sale-pc__progress { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.lva-sale-pc__progress-bar { flex: 1; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.lva-sale-pc__progress-fill { height: 100%; background: linear-gradient(90deg, #ff5722, #ff9800); border-radius: 3px; transition: width 0.3s; }
.lva-sale-pc__progress-text { font-size: 11px; color: #ff5722; white-space: nowrap; }
.lva-sale-pc__buy { width: 100%; padding: 8px; border: none; border-radius: 20px; background: linear-gradient(135deg, #ff5722, #ff9800); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
.lva-sale-pc__buy:hover { opacity: 0.9; }
.lva-sale-pc__buy:disabled { background: #ccc; cursor: not-allowed; }
/* H5 */
.lva-sale-mobile { display: flex; justify-content: center; padding: 20px 0; }
.lva-phone { width: 390px; border-radius: 36px; background: #1a1a1a; padding: 6px; box-shadow: 0 12px 40px rgba(0,0,0,.18); overflow: hidden; display: flex; flex-direction: column; }
.lva-phone__status { display: flex; justify-content: space-between; align-items: center; padding: 8px 24px 4px; color: #fff; font-size: 14px; font-weight: 600; }
.lva-phone__battery { display: inline-block; width: 22px; height: 11px; border: 1px solid #fff; border-radius: 3px; position: relative; }
.lva-phone__battery::after { content: ''; position: absolute; top: 3px; right: -3px; width: 2px; height: 5px; background: #fff; border-radius: 0 1px 1px 0; }
.lva-phone__battery-fill { display: block; width: 80%; height: 100%; background: #4ade80; border-radius: 2px; }
.lva-phone__navbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: linear-gradient(135deg, #ff5722, #ff9800); color: #fff; font-size: 17px; font-weight: 600; }
.lva-phone__cd { font-size: 14px; background: rgba(0,0,0,.3); padding: 4px 10px; border-radius: 12px; }
.lva-phone__slots { display: flex; gap: 0; background: #222; overflow-x: auto; }
.lva-phone__slot { padding: 8px 14px; font-size: 12px; color: #aaa; text-align: center; cursor: pointer; white-space: nowrap; border-bottom: 2px solid transparent; }
.lva-phone__slot.active { color: #ff5722; border-bottom-color: #ff5722; }
.lva-phone__slot small { font-size: 10px; }
.lva-phone__scroll { flex: 1; min-height: 420px; background: #111; overflow-y: auto; padding: 8px; }
.lva-phone__safe-area { padding: 6px 0 10px; text-align: center; background: #111; }
.lva-phone__home-bar { display: block; width: 130px; height: 4px; background: #fff; border-radius: 2px; margin: 0 auto; }
.lva-sale-h5__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.lva-sale-h5__card { border-radius: 8px; overflow: hidden; background: #222; cursor: pointer; }
.lva-sale-h5__cover { height: 100px; position: relative; padding: 6px; }
.lva-sale-h5__tag { background: #ff5722; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 8px; }
.lva-sale-h5__info { padding: 8px; }
.lva-sale-h5__title { font-size: 12px; color: #eee; font-weight: 500; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lva-sale-h5__prices { margin-bottom: 4px; }
.lva-sale-h5__sale { font-size: 16px; font-weight: 700; color: #ff5722; margin-right: 6px; }
.lva-sale-h5__orig { font-size: 11px; color: #666; text-decoration: line-through; }
.lva-sale-h5__bar { display: flex; align-items: center; gap: 4px; height: 14px; background: rgba(255,87,34,.15); border-radius: 7px; padding: 0 6px; font-size: 10px; color: #ff5722; position: relative; overflow: hidden; }
.lva-sale-h5__bar-fill { position: absolute; left: 0; top: 0; height: 100%; background: rgba(255,87,34,.3); border-radius: 7px; }
.lva-sale-h5__bar span { position: relative; z-index: 1; }
/* 小程序 */
.lva-miniapp { width: 375px; border-radius: 20px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.12); overflow: hidden; display: flex; flex-direction: column; }
.lva-miniapp__status { display: flex; justify-content: space-between; align-items: center; padding: 6px 16px; background: #ededed; font-size: 12px; color: #333; }
.lva-miniapp__capsule { background: rgba(0,0,0,.08); padding: 2px 10px; border-radius: 12px; font-size: 14px; }
.lva-miniapp__navbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #fff; border-bottom: 1px solid #f0f0f0; font-size: 17px; font-weight: 600; }
.lva-miniapp__back { font-size: 22px; color: #333; cursor: pointer; width: 30px; }
.lva-miniapp__dots { font-size: 18px; color: #999; width: 30px; text-align: right; }
.lva-miniapp__cd-bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: linear-gradient(90deg, #fff5f5, #fff); font-size: 12px; color: #ff5722; }
.lva-miniapp__cd { background: #333; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 13px; }
.lva-miniapp__slots { display: flex; gap: 0; border-bottom: 1px solid #f0f0f0; overflow-x: auto; }
.lva-miniapp__slot { padding: 8px 14px; font-size: 12px; color: #666; cursor: pointer; border-bottom: 2px solid transparent; }
.lva-miniapp__slot.active { color: #ff5722; border-bottom-color: #ff5722; font-weight: 500; }
.lva-miniapp__scroll { flex: 1; min-height: 400px; overflow-y: auto; padding: 10px; background: #f6f6f6; }
.lva-sale-mp__card { display: flex; gap: 10px; padding: 10px; background: #fff; border-radius: 8px; margin-bottom: 8px; }
.lva-sale-mp__cover { width: 90px; height: 90px; border-radius: 6px; flex-shrink: 0; position: relative; }
.lva-sale-mp__tag { position: absolute; top: 4px; left: 4px; background: #ff5722; color: #fff; font-size: 10px; padding: 1px 6px; border-radius: 6px; }
.lva-sale-mp__info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.lva-sale-mp__title { font-size: 13px; font-weight: 600; color: #333; }
.lva-sale-mp__prices { }
.lva-sale-mp__sale { font-size: 18px; font-weight: 700; color: #ff5722; margin-right: 6px; }
.lva-sale-mp__orig { font-size: 12px; color: #bbb; text-decoration: line-through; }
.lva-sale-mp__buy { align-self: flex-end; padding: 5px 16px; border: none; border-radius: 14px; background: linear-gradient(135deg, #ff5722, #ff9800); color: #fff; font-size: 12px; cursor: pointer; }
.lva-sale-mp__buy:disabled { background: #ccc; }
</style>
