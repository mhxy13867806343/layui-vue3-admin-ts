<script setup lang="ts">
/**
 * 多端瀑布流布局 / advanced/waterfall-layout
 *
 * 类似淘宝直播/小红书的瀑布流卡片布局，支持：
 * - 三端预览：PC / H5(APP) / 小程序
 * - 可配置列数：2列 / 3列 / 4列
 * - 固定布局 + 瀑布流布局切换
 * - 卡片内容：封面图(随机高度)、标题、描述、观看数、头像、用户名
 */
import { ref, computed } from 'vue'
import { layer } from '@layui/layui-vue'

type Platform = 'pc' | 'h5' | 'miniapp'
type LayoutMode = 'waterfall' | 'grid'

interface CardItem {
  id: number
  title: string
  desc: string
  coverColor: string
  coverHeight: number
  avatar: string
  avatarColor: string
  username: string
  views: string
  tag: string
  tagColor: string
  liked: boolean
  likeCount: number
}

const platform = ref<Platform>('pc')
const layoutMode = ref<LayoutMode>('waterfall')
const columns = ref(2)
const gap = ref(10)

const currentTime = ref('')
function updateTime(): void {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  currentTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
updateTime()
setInterval(updateTime, 60_000)

const COLORS = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#f368e0','#ee5a24','#009432']
const TAGS = [
  { text: '618预售', color: '#ff4757' }, { text: '秒杀', color: '#ff6348' },
  { text: '直播中', color: '#e84393' }, { text: '新品', color: '#0984e3' },
  { text: '热门', color: '#fdcb6e' }, { text: '推荐', color: '#00b894' },
]

function generateCards(count: number): CardItem[] {
  const titles = ['618超级美妆预售~','心相印特价抽纸','今日秒杀-工厂直发','泰国大姐姐榴莲','数码好物推荐','家居收纳神器','零食大礼包','运动装备清仓','母婴好物精选','美食探店vlog','旅行必备清单','穿搭分享日常','护肤心得分享','手工DIY教程','宠物日常记录','健身打卡第30天','读书笔记分享','摄影技巧教学','烘焙新手入门','园艺种植日记']
  const descs = ['纸巾大促 来囤货啦','抢榴莲19.9元/个','限时特惠 手慢无','品质生活好物','超值优惠不容错过','精选好货推荐','新品首发 限量抢购','清仓特卖 最后一天']
  const users = ['李佳琦Austin','心相印官方','工厂直营店','泰国水果哥','数码小王子','收纳达人','零食控小美','运动装备铺','宝妈优选','美食家小陈','旅行者阿杰','时尚博主Lily','护肤小课堂','手工匠人','萌宠日记','健身教练Tom','书虫阿文','摄影师老张','烘焙小厨','花园主人']
  const cards: CardItem[] = []
  for (let i = 0; i < count; i++) {
    const tag = TAGS[Math.floor(Math.random() * TAGS.length)]
    cards.push({
      id: i + 1,
      title: titles[i % titles.length],
      desc: descs[Math.floor(Math.random() * descs.length)],
      coverColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      coverHeight: Math.floor(Math.random() * 80) + 120,
      avatar: users[i % users.length].slice(0, 1),
      avatarColor: COLORS[(i + 3) % COLORS.length],
      username: users[i % users.length],
      views: Math.random() > 0.5 ? `${(Math.random() * 1000 + 100).toFixed(0)}人观看` : `${(Math.random() * 36 + 1).toFixed(2)}万人观看`,
      tag: tag.text,
      tagColor: tag.color,
      liked: Math.random() > 0.7,
      likeCount: Math.floor(Math.random() * 500) + 10,
    })
  }
  return cards
}

const cards = ref<CardItem[]>(generateCards(20))

function onRefresh(): void {
  cards.value = generateCards(20)
  layer.msg('已刷新内容', { icon: 1 })
}

function onLike(card: CardItem): void {
  card.liked = !card.liked
  card.likeCount += card.liked ? 1 : -1
}

// 瀑布流分列算法
function getWaterfallColumns(items: CardItem[], colCount: number): CardItem[][] {
  const cols: CardItem[][] = Array.from({ length: colCount }, () => [])
  const heights: number[] = new Array(colCount).fill(0)
  for (const item of items) {
    const minIdx = heights.indexOf(Math.min(...heights))
    cols[minIdx].push(item)
    heights[minIdx] += item.coverHeight + 80
  }
  return cols
}

const waterfallCols = computed(() => getWaterfallColumns(cards.value, columns.value))
</script>

<template>
  <div class="lva-wf">
    <!-- 配置栏 -->
    <div class="lva-wf__config">
      <div class="lva-wf__config-row">
        <span>平台：</span>
        <lay-radio-group v-model="platform">
          <lay-radio value="pc" label="💻 PC" />
          <lay-radio value="h5" label="📱 H5/APP" />
          <lay-radio value="miniapp" label="🔲 小程序" />
        </lay-radio-group>
      </div>
      <div class="lva-wf__config-row">
        <span>布局：</span>
        <lay-radio-group v-model="layoutMode">
          <lay-radio value="waterfall" label="瀑布流" />
          <lay-radio value="grid" label="固定网格" />
        </lay-radio-group>
      </div>
      <div class="lva-wf__config-row">
        <span>列数：</span>
        <lay-radio-group v-model="columns">
          <lay-radio :value="2" label="2列" />
          <lay-radio :value="3" label="3列" />
          <lay-radio :value="4" label="4列" />
        </lay-radio-group>
      </div>
      <div class="lva-wf__config-row">
        <span>间距：{{ gap }}px</span>
        <lay-slider v-model="gap" :min="4" :max="20" :step="2" style="width:120px" />
      </div>
      <lay-button size="sm" @click="onRefresh"><i class="layui-icon layui-icon-refresh" /> 刷新数据</lay-button>
    </div>

    <!-- ===== PC 端 ===== -->
    <div v-if="platform === 'pc'" class="lva-wf__pc">
      <!-- 瀑布流 -->
      <div v-if="layoutMode === 'waterfall'" class="lva-wf__waterfall" :style="{ gap: gap + 'px' }">
        <div v-for="(col, ci) in waterfallCols" :key="ci" class="lva-wf__col" :style="{ gap: gap + 'px' }">
          <div v-for="card in col" :key="card.id" class="lva-wf__card" @click="onLike(card)">
            <div class="lva-wf__cover" :style="{ background: card.coverColor, height: card.coverHeight + 'px' }">
              <span class="lva-wf__views"><i class="layui-icon layui-icon-chart" /> {{ card.views }}</span>
              <span class="lva-wf__tag" :style="{ background: card.tagColor }">{{ card.tag }}</span>
            </div>
            <div class="lva-wf__info">
              <div class="lva-wf__user">
                <span class="lva-wf__avatar" :style="{ background: card.avatarColor }">{{ card.avatar }}</span>
                <span class="lva-wf__username">{{ card.username }}</span>
              </div>
              <div class="lva-wf__title">{{ card.title }}</div>
              <div class="lva-wf__desc">{{ card.desc }}</div>
              <div class="lva-wf__footer">
                <span :class="{ liked: card.liked }">❤️ {{ card.likeCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 固定网格 -->
      <div v-else class="lva-wf__grid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: gap + 'px' }">
        <div v-for="card in cards" :key="card.id" class="lva-wf__card" @click="onLike(card)">
          <div class="lva-wf__cover" :style="{ background: card.coverColor, height: '160px' }">
            <span class="lva-wf__views"><i class="layui-icon layui-icon-chart" /> {{ card.views }}</span>
            <span class="lva-wf__tag" :style="{ background: card.tagColor }">{{ card.tag }}</span>
          </div>
          <div class="lva-wf__info">
            <div class="lva-wf__user"><span class="lva-wf__avatar" :style="{ background: card.avatarColor }">{{ card.avatar }}</span><span class="lva-wf__username">{{ card.username }}</span></div>
            <div class="lva-wf__title">{{ card.title }}</div>
            <div class="lva-wf__desc">{{ card.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== H5/APP 端 ===== -->
    <div v-if="platform === 'h5'" class="lva-wf__mobile">
      <div class="lva-phone">
        <div class="lva-phone__status"><span>{{ currentTime }}</span><span class="lva-phone__battery"><span class="lva-phone__battery-fill" /></span></div>
        <div class="lva-phone__navbar">推荐</div>
        <div class="lva-phone__scroll">
          <div v-if="layoutMode === 'waterfall'" class="lva-wf__waterfall lva-wf__waterfall--mobile" :style="{ gap: gap + 'px' }">
            <div v-for="(col, ci) in getWaterfallColumns(cards.slice(0,12), columns)" :key="ci" class="lva-wf__col" :style="{ gap: gap + 'px' }">
              <div v-for="card in col" :key="card.id" class="lva-wf__card lva-wf__card--dark">
                <div class="lva-wf__cover" :style="{ background: card.coverColor, height: card.coverHeight * 0.7 + 'px' }">
                  <span class="lva-wf__views"><i class="layui-icon layui-icon-chart" /> {{ card.views }}</span>
                </div>
                <div class="lva-wf__info">
                  <div class="lva-wf__user"><span class="lva-wf__avatar lva-wf__avatar--sm" :style="{ background: card.avatarColor }">{{ card.avatar }}</span><span class="lva-wf__username">{{ card.username }}</span></div>
                  <div class="lva-wf__title">{{ card.title }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="lva-wf__grid lva-wf__grid--mobile" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: gap + 'px' }">
            <div v-for="card in cards.slice(0,12)" :key="card.id" class="lva-wf__card lva-wf__card--dark">
              <div class="lva-wf__cover" :style="{ background: card.coverColor, height: '100px' }">
                <span class="lva-wf__views"><i class="layui-icon layui-icon-chart" /> {{ card.views }}</span>
              </div>
              <div class="lva-wf__info"><div class="lva-wf__title">{{ card.title }}</div></div>
            </div>
          </div>
        </div>
        <div class="lva-phone__safe-area"><span class="lva-phone__home-bar" /></div>
      </div>
    </div>

    <!-- ===== 小程序端 ===== -->
    <div v-if="platform === 'miniapp'" class="lva-wf__mobile">
      <div class="lva-miniapp">
        <div class="lva-miniapp__status"><span>{{ currentTime }}</span><span class="lva-miniapp__capsule">···</span></div>
        <div class="lva-miniapp__navbar"><span class="lva-miniapp__back">‹</span><span>发现</span><span class="lva-miniapp__dots">•••</span></div>
        <div class="lva-miniapp__scroll">
          <div v-if="layoutMode === 'waterfall'" class="lva-wf__waterfall lva-wf__waterfall--mp" :style="{ gap: gap + 'px' }">
            <div v-for="(col, ci) in getWaterfallColumns(cards.slice(0,12), columns)" :key="ci" class="lva-wf__col" :style="{ gap: gap + 'px' }">
              <div v-for="card in col" :key="card.id" class="lva-wf__card lva-wf__card--mp">
                <div class="lva-wf__cover" :style="{ background: card.coverColor, height: card.coverHeight * 0.65 + 'px' }">
                  <span class="lva-wf__tag lva-wf__tag--sm" :style="{ background: card.tagColor }">{{ card.tag }}</span>
                </div>
                <div class="lva-wf__info">
                  <div class="lva-wf__title">{{ card.title }}</div>
                  <div class="lva-wf__user"><span class="lva-wf__avatar lva-wf__avatar--sm" :style="{ background: card.avatarColor }">{{ card.avatar }}</span><span class="lva-wf__username">{{ card.username }}</span><span class="lva-wf__like-sm" :class="{ liked: card.liked }">❤️ {{ card.likeCount }}</span></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="lva-wf__grid lva-wf__grid--mp" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: gap + 'px' }">
            <div v-for="card in cards.slice(0,12)" :key="card.id" class="lva-wf__card lva-wf__card--mp">
              <div class="lva-wf__cover" :style="{ background: card.coverColor, height: '90px' }"></div>
              <div class="lva-wf__info"><div class="lva-wf__title">{{ card.title }}</div><div class="lva-wf__desc">{{ card.desc }}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-wf { padding: 16px; }
.lva-wf__config { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; padding: 12px 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 16px; }
.lva-wf__config-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555; }
/* 瀑布流 */
.lva-wf__waterfall { display: flex; }
.lva-wf__col { flex: 1; display: flex; flex-direction: column; }
/* 固定网格 */
.lva-wf__grid { display: grid; }
/* 卡片 */
.lva-wf__card { border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.06); cursor: pointer; transition: transform 0.2s; }
.lva-wf__card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.1); }
.lva-wf__card--dark { background: #222; }
.lva-wf__card--dark .lva-wf__title { color: #eee; }
.lva-wf__card--dark .lva-wf__username { color: #aaa; }
.lva-wf__card--mp { background: #fff; box-shadow: none; border: 1px solid #f0f0f0; }
.lva-wf__cover { position: relative; display: flex; align-items: flex-start; justify-content: space-between; padding: 8px; border-radius: 8px 8px 0 0; }
.lva-wf__views { display: inline-flex; align-items: center; gap: 4px; background: rgba(0,0,0,.5); color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 10px; }
.lva-wf__tag { display: inline-block; color: #fff; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 500; }
.lva-wf__tag--sm { font-size: 9px; padding: 2px 6px; position: absolute; top: 6px; left: 6px; }
.lva-wf__info { padding: 10px; }
.lva-wf__user { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.lva-wf__avatar { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.lva-wf__avatar--sm { width: 20px; height: 20px; font-size: 10px; }
.lva-wf__username { font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lva-wf__title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lva-wf__desc { font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lva-wf__footer { display: flex; justify-content: flex-end; margin-top: 4px; font-size: 12px; color: #999; }
.lva-wf__footer .liked { color: #ff5722; }
.lva-wf__like-sm { margin-left: auto; font-size: 11px; color: #999; }
.lva-wf__like-sm.liked { color: #ff5722; }
/* PC */
.lva-wf__pc { max-width: 1000px; }
/* 手机 */
.lva-wf__mobile { display: flex; justify-content: center; padding: 20px 0; }
.lva-phone { width: 390px; border-radius: 36px; background: #1a1a1a; padding: 6px; box-shadow: 0 12px 40px rgba(0,0,0,.18); overflow: hidden; display: flex; flex-direction: column; }
.lva-phone__status { display: flex; justify-content: space-between; align-items: center; padding: 8px 24px 4px; color: #fff; font-size: 14px; font-weight: 600; }
.lva-phone__battery { display: inline-block; width: 22px; height: 11px; border: 1px solid #fff; border-radius: 3px; position: relative; }
.lva-phone__battery::after { content: ''; position: absolute; top: 3px; right: -3px; width: 2px; height: 5px; background: #fff; border-radius: 0 1px 1px 0; }
.lva-phone__battery-fill { display: block; width: 80%; height: 100%; background: #4ade80; border-radius: 2px; }
.lva-phone__navbar { padding: 12px 16px; background: #222; color: #fff; font-size: 17px; font-weight: 600; text-align: center; }
.lva-phone__scroll { flex: 1; min-height: 520px; background: #111; overflow-y: auto; padding: 8px; }
.lva-phone__safe-area { padding: 6px 0 10px; text-align: center; background: #111; }
.lva-phone__home-bar { display: block; width: 130px; height: 4px; background: #fff; border-radius: 2px; margin: 0 auto; }
.lva-wf__waterfall--mobile { padding: 0; }
.lva-wf__grid--mobile { padding: 0; }
/* 小程序 */
.lva-miniapp { width: 375px; border-radius: 20px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.12); overflow: hidden; display: flex; flex-direction: column; }
.lva-miniapp__status { display: flex; justify-content: space-between; align-items: center; padding: 6px 16px; background: #ededed; font-size: 12px; color: #333; }
.lva-miniapp__capsule { background: rgba(0,0,0,.08); padding: 2px 10px; border-radius: 12px; font-size: 14px; }
.lva-miniapp__navbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #fff; border-bottom: 1px solid #f0f0f0; font-size: 17px; font-weight: 600; }
.lva-miniapp__back { font-size: 22px; color: #333; cursor: pointer; width: 30px; }
.lva-miniapp__dots { font-size: 18px; color: #999; width: 30px; text-align: right; }
.lva-miniapp__scroll { flex: 1; min-height: 500px; overflow-y: auto; padding: 8px; background: #f6f6f6; }
.lva-wf__waterfall--mp { padding: 0; }
.lva-wf__grid--mp { padding: 0; }
</style>
