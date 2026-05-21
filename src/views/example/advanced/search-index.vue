<script setup lang="ts">
/**
 * 搜索+历史+热门+字母索引 / advanced/search-index
 *
 * 三端预览：PC / H5(APP) / 小程序
 * - 搜索框 + 搜索历史 + 热门搜索
 * - 右侧 A-Z # 字母索引导航（H5/小程序端可触摸滑动）
 * - 按字母分组的联系人/城市列表
 * - PC 端点击字母跳转，H5/小程序端支持触摸拖动索引
 */
import { ref, computed, nextTick } from 'vue'
import { layer } from '@layui/layui-vue'

type Platform = 'pc' | 'h5' | 'miniapp'

const platform = ref<Platform>('pc')
const searchText = ref('')
const currentTime = ref('')

function updateTime(): void {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  currentTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
updateTime()
setInterval(updateTime, 60_000)

// 搜索历史
const history = ref<string[]>(['Vue3', 'TypeScript', 'layui-vue', 'Vite', 'Pinia', 'ECharts'])
function addHistory(text: string): void {
  if (!text.trim()) return
  history.value = [text, ...history.value.filter(h => h !== text)].slice(0, 10)
}
function removeHistory(text: string): void {
  history.value = history.value.filter(h => h !== text)
}
function clearHistory(): void { history.value = [] }

// 热门搜索
const hotList = [
  { text: 'Vue3 教程', hot: true }, { text: 'React 18', hot: false },
  { text: 'TypeScript 5', hot: true }, { text: 'Vite 5', hot: false },
  { text: 'Tailwind CSS', hot: false }, { text: 'Next.js', hot: true },
  { text: 'Nuxt 3', hot: false }, { text: 'Electron', hot: false },
  { text: 'Flutter', hot: true }, { text: 'Rust', hot: false },
]

function onSearch(): void {
  if (!searchText.value.trim()) return
  addHistory(searchText.value.trim())
  layer.msg(`搜索: ${searchText.value}`, { icon: 1 })
  searchText.value = ''
}

function onClickHot(text: string): void {
  searchText.value = text
  onSearch()
}

// 字母索引数据
const LETTERS = ['#', 'A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','W','X','Y','Z']

interface IndexItem { name: string; desc: string }
const INDEX_DATA: Record<string, IndexItem[]> = {
  '#': [{ name: '123云盘', desc: '云存储服务' }, { name: '360安全', desc: '安全软件' }],
  'A': [{ name: '阿里云', desc: '云计算平台' }, { name: '爱奇艺', desc: '视频平台' }, { name: 'Ant Design', desc: 'UI 组件库' }],
  'B': [{ name: '百度', desc: '搜索引擎' }, { name: '哔哩哔哩', desc: '视频社区' }, { name: 'Bootstrap', desc: 'CSS 框架' }],
  'C': [{ name: '抖音', desc: '短视频平台' }],
  'D': [{ name: '钉钉', desc: '企业协作' }, { name: 'Docker', desc: '容器技术' }],
  'E': [{ name: 'Element Plus', desc: 'Vue3 UI 库' }, { name: 'ESLint', desc: '代码检查' }],
  'F': [{ name: '飞书', desc: '协作平台' }, { name: 'Flutter', desc: '跨端框架' }],
  'G': [{ name: 'GitHub', desc: '代码托管' }, { name: 'Gitee', desc: '国内代码托管' }, { name: 'Go', desc: '编程语言' }],
  'H': [{ name: '华为云', desc: '云服务' }, { name: 'Homebrew', desc: '包管理器' }],
  'J': [{ name: '京东', desc: '电商平台' }, { name: 'Jenkins', desc: 'CI/CD' }],
  'K': [{ name: 'Kubernetes', desc: '容器编排' }, { name: 'Kafka', desc: '消息队列' }],
  'L': [{ name: 'Layui', desc: 'UI 框架' }, { name: 'Linux', desc: '操作系统' }],
  'M': [{ name: '美团', desc: '生活服务' }, { name: 'MongoDB', desc: '数据库' }, { name: 'MySQL', desc: '关系数据库' }],
  'N': [{ name: 'Nginx', desc: 'Web 服务器' }, { name: 'Node.js', desc: 'JS 运行时' }, { name: 'Nuxt', desc: 'Vue SSR' }],
  'P': [{ name: 'Pinia', desc: '状态管理' }, { name: 'PostgreSQL', desc: '数据库' }],
  'Q': [{ name: 'QQ', desc: '即时通讯' }, { name: '七牛云', desc: '云存储' }],
  'R': [{ name: 'React', desc: 'UI 库' }, { name: 'Redis', desc: '缓存数据库' }, { name: 'Rust', desc: '编程语言' }],
  'S': [{ name: 'Spring Boot', desc: 'Java 框架' }, { name: 'Svelte', desc: '前端框架' }],
  'T': [{ name: '淘宝', desc: '电商平台' }, { name: 'TypeScript', desc: '编程语言' }, { name: 'Three.js', desc: '3D 库' }],
  'W': [{ name: '微信', desc: '社交平台' }, { name: 'Webpack', desc: '打包工具' }, { name: 'WebSocket', desc: '通信协议' }],
  'X': [{ name: '小红书', desc: '社区平台' }, { name: 'Xcode', desc: 'Apple IDE' }],
  'Y': [{ name: '有道', desc: '翻译工具' }, { name: 'Yarn', desc: '包管理器' }],
  'Z': [{ name: '知乎', desc: '问答社区' }, { name: '掘金', desc: '技术社区' }],
}

const activeLetter = ref('')
const scrollContainerRef = ref<HTMLElement | null>(null)
const isTouching = ref(false)

function scrollToLetter(letter: string): void {
  activeLetter.value = letter
  const el = document.getElementById(`idx-${letter}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 触摸滑动索引（H5/小程序）
function onTouchStart(e: TouchEvent): void {
  isTouching.value = true
  handleTouch(e)
}
function onTouchMove(e: TouchEvent): void {
  if (!isTouching.value) return
  e.preventDefault()
  handleTouch(e)
}
function onTouchEnd(): void { isTouching.value = false }

function handleTouch(e: TouchEvent): void {
  const touch = e.touches[0]
  const target = document.elementFromPoint(touch.clientX, touch.clientY)
  if (target && target.getAttribute('data-letter')) {
    const letter = target.getAttribute('data-letter')!
    scrollToLetter(letter)
  }
}

const filteredData = computed(() => {
  if (!searchText.value.trim()) return INDEX_DATA
  const kw = searchText.value.toLowerCase()
  const result: Record<string, IndexItem[]> = {}
  for (const [letter, items] of Object.entries(INDEX_DATA)) {
    const filtered = items.filter(i => i.name.toLowerCase().includes(kw) || i.desc.toLowerCase().includes(kw))
    if (filtered.length) result[letter] = filtered
  }
  return result
})
</script>

<template>
  <div class="lva-si">
    <lay-tab v-model="platform">
      <lay-tab-item title="💻 PC 端" id="pc" />
      <lay-tab-item title="📱 H5/APP 端" id="h5" />
      <lay-tab-item title="🔲 小程序端" id="miniapp" />
    </lay-tab>

    <!-- ===== PC 端 ===== -->
    <div v-if="platform === 'pc'" class="lva-si-pc">
      <div class="lva-si-pc__left">
        <!-- 搜索框 -->
        <div class="lva-si-pc__search">
          <lay-input v-model="searchText" placeholder="搜索..." prefix-icon="layui-icon-search" @keyup.enter="onSearch" />
          <lay-button type="primary" @click="onSearch">搜索</lay-button>
        </div>
        <!-- 搜索历史 -->
        <div v-if="history.length && !searchText" class="lva-si-pc__section">
          <div class="lva-si-pc__section-header"><span>搜索历史</span><a @click="clearHistory">清空</a></div>
          <div class="lva-si-pc__tags">
            <span v-for="h in history" :key="h" class="lva-si-pc__tag" @click="searchText = h; onSearch()">{{ h }}<i class="layui-icon layui-icon-close" @click.stop="removeHistory(h)" /></span>
          </div>
        </div>
        <!-- 热门搜索 -->
        <div v-if="!searchText" class="lva-si-pc__section">
          <div class="lva-si-pc__section-header"><span>🔥 热门搜索</span></div>
          <div class="lva-si-pc__tags">
            <span v-for="h in hotList" :key="h.text" :class="['lva-si-pc__tag', { hot: h.hot }]" @click="onClickHot(h.text)">{{ h.text }}</span>
          </div>
        </div>
        <!-- 字母分组列表 -->
        <div class="lva-si-pc__list">
          <template v-for="letter in LETTERS" :key="letter">
            <div v-if="filteredData[letter]" :id="`idx-${letter}`" class="lva-si-pc__group">
              <div class="lva-si-pc__letter">{{ letter }}</div>
              <div v-for="item in filteredData[letter]" :key="item.name" class="lva-si-pc__item">
                <span class="lva-si-pc__name">{{ item.name }}</span>
                <span class="lva-si-pc__desc">{{ item.desc }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <!-- 右侧字母索引 -->
      <div class="lva-si-pc__index">
        <span v-for="l in LETTERS" :key="l" :class="['lva-si-pc__idx-item', { active: activeLetter === l }]" @click="scrollToLetter(l)">{{ l }}</span>
      </div>
    </div>

    <!-- ===== H5/APP 端 ===== -->
    <div v-if="platform === 'h5'" class="lva-si-mobile">
      <div class="lva-phone">
        <div class="lva-phone__status"><span>{{ currentTime }}</span><span class="lva-phone__battery"><span class="lva-phone__battery-fill" /></span></div>
        <div class="lva-phone__search-bar">
          <input v-model="searchText" placeholder="搜索" class="lva-phone__search-input" @keyup.enter="onSearch" />
        </div>
        <div class="lva-phone__scroll" ref="scrollContainerRef">
          <!-- 历史+热门 -->
          <div v-if="!searchText">
            <div v-if="history.length" class="lva-si-h5__section">
              <div class="lva-si-h5__header"><span>搜索历史</span><span class="lva-si-h5__clear" @click="clearHistory">清空</span></div>
              <div class="lva-si-h5__tags"><span v-for="h in history" :key="h" class="lva-si-h5__tag" @click="searchText=h;onSearch()">{{ h }}</span></div>
            </div>
            <div class="lva-si-h5__section">
              <div class="lva-si-h5__header"><span>🔥 热门</span></div>
              <div class="lva-si-h5__tags"><span v-for="h in hotList" :key="h.text" :class="['lva-si-h5__tag', { hot: h.hot }]" @click="onClickHot(h.text)">{{ h.text }}</span></div>
            </div>
          </div>
          <!-- 列表 -->
          <template v-for="letter in LETTERS" :key="letter">
            <div v-if="filteredData[letter]" :id="`idx-${letter}`" class="lva-si-h5__group">
              <div class="lva-si-h5__letter">{{ letter }}</div>
              <div v-for="item in filteredData[letter]" :key="item.name" class="lva-si-h5__item">
                <span class="lva-si-h5__name">{{ item.name }}</span>
                <span class="lva-si-h5__desc">{{ item.desc }}</span>
              </div>
            </div>
          </template>
        </div>
        <!-- 右侧字母索引（可触摸滑动） -->
        <div class="lva-phone__index" @touchstart="onTouchStart" @touchmove.prevent="onTouchMove" @touchend="onTouchEnd">
          <span v-for="l in LETTERS" :key="l" :data-letter="l" :class="['lva-phone__idx-item', { active: activeLetter === l }]" @click="scrollToLetter(l)">{{ l }}</span>
        </div>
        <!-- 字母提示 -->
        <div v-if="isTouching && activeLetter" class="lva-phone__letter-tip">{{ activeLetter }}</div>
        <div class="lva-phone__safe-area"><span class="lva-phone__home-bar" /></div>
      </div>
    </div>

    <!-- ===== 小程序端 ===== -->
    <div v-if="platform === 'miniapp'" class="lva-si-mobile">
      <div class="lva-miniapp">
        <div class="lva-miniapp__status"><span>{{ currentTime }}</span><span class="lva-miniapp__capsule">···</span></div>
        <div class="lva-miniapp__search-bar">
          <input v-model="searchText" placeholder="搜索" class="lva-miniapp__search-input" @keyup.enter="onSearch" />
        </div>
        <div class="lva-miniapp__scroll">
          <div v-if="!searchText">
            <div v-if="history.length" class="lva-si-mp__section">
              <div class="lva-si-mp__header"><span>搜索历史</span><span class="lva-si-mp__clear" @click="clearHistory">清空</span></div>
              <div class="lva-si-mp__tags"><span v-for="h in history" :key="h" class="lva-si-mp__tag" @click="searchText=h;onSearch()">{{ h }}</span></div>
            </div>
            <div class="lva-si-mp__section">
              <div class="lva-si-mp__header"><span>🔥 热门</span></div>
              <div class="lva-si-mp__tags"><span v-for="h in hotList" :key="h.text" :class="['lva-si-mp__tag', { hot: h.hot }]" @click="onClickHot(h.text)">{{ h.text }}</span></div>
            </div>
          </div>
          <template v-for="letter in LETTERS" :key="letter">
            <div v-if="filteredData[letter]" :id="`idx-${letter}`" class="lva-si-mp__group">
              <div class="lva-si-mp__letter">{{ letter }}</div>
              <div v-for="item in filteredData[letter]" :key="item.name" class="lva-si-mp__item">{{ item.name }} <small>{{ item.desc }}</small></div>
            </div>
          </template>
        </div>
        <div class="lva-miniapp__index" @touchstart="onTouchStart" @touchmove.prevent="onTouchMove" @touchend="onTouchEnd">
          <span v-for="l in LETTERS" :key="l" :data-letter="l" :class="['lva-miniapp__idx-item', { active: activeLetter === l }]" @click="scrollToLetter(l)">{{ l }}</span>
        </div>
        <div v-if="isTouching && activeLetter" class="lva-miniapp__letter-tip">{{ activeLetter }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-si { padding: 16px; }
/* PC */
.lva-si-pc { display: flex; gap: 0; max-width: 800px; position: relative; }
.lva-si-pc__left { flex: 1; min-width: 0; }
.lva-si-pc__search { display: flex; gap: 8px; margin-bottom: 16px; }
.lva-si-pc__section { margin-bottom: 16px; }
.lva-si-pc__section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 14px; color: #333; font-weight: 500; }
.lva-si-pc__section-header a { font-size: 12px; color: #999; cursor: pointer; }
.lva-si-pc__tags { display: flex; flex-wrap: wrap; gap: 8px; }
.lva-si-pc__tag { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; background: #f3f4f6; border-radius: 14px; font-size: 13px; color: #555; cursor: pointer; transition: all 0.2s; }
.lva-si-pc__tag:hover { background: #e8f8f5; color: #16baaa; }
.lva-si-pc__tag.hot { background: #fff5f5; color: #ff5722; }
.lva-si-pc__tag i { font-size: 12px; color: #bbb; }
.lva-si-pc__list { border-top: 1px solid #f0f0f0; padding-top: 12px; }
.lva-si-pc__group { margin-bottom: 12px; }
.lva-si-pc__letter { font-size: 15px; font-weight: 700; color: #16baaa; padding: 6px 0; border-bottom: 1px solid #f5f5f5; margin-bottom: 6px; }
.lva-si-pc__item { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
.lva-si-pc__item:hover { background: #f9fafb; }
.lva-si-pc__name { font-size: 14px; color: #333; font-weight: 500; }
.lva-si-pc__desc { font-size: 12px; color: #999; }
.lva-si-pc__index { position: sticky; top: 20px; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 6px; margin-left: 8px; }
.lva-si-pc__idx-item { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #888; border-radius: 50%; cursor: pointer; transition: all 0.15s; user-select: none; }
.lva-si-pc__idx-item:hover, .lva-si-pc__idx-item.active { background: #16baaa; color: #fff; }
/* H5 */
.lva-si-mobile { display: flex; justify-content: center; padding: 20px 0; }
.lva-phone { width: 390px; border-radius: 36px; background: #1a1a1a; padding: 6px; box-shadow: 0 12px 40px rgba(0,0,0,.18); overflow: hidden; display: flex; flex-direction: column; position: relative; }
.lva-phone__status { display: flex; justify-content: space-between; align-items: center; padding: 8px 24px 4px; color: #fff; font-size: 14px; font-weight: 600; }
.lva-phone__battery { display: inline-block; width: 22px; height: 11px; border: 1px solid #fff; border-radius: 3px; position: relative; }
.lva-phone__battery::after { content: ''; position: absolute; top: 3px; right: -3px; width: 2px; height: 5px; background: #fff; border-radius: 0 1px 1px 0; }
.lva-phone__battery-fill { display: block; width: 80%; height: 100%; background: #4ade80; border-radius: 2px; }
.lva-phone__search-bar { padding: 8px 12px; background: #222; }
.lva-phone__search-input { width: 100%; padding: 8px 12px; border-radius: 18px; border: none; background: #333; color: #eee; font-size: 14px; outline: none; box-sizing: border-box; }
.lva-phone__scroll { flex: 1; min-height: 480px; max-height: 500px; background: #111; overflow-y: auto; padding: 12px; padding-right: 28px; }
.lva-phone__index { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; gap: 1px; z-index: 10; background: rgba(0,0,0,.3); border-radius: 10px; padding: 4px 2px; }
.lva-phone__idx-item { width: 18px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #aaa; border-radius: 50%; cursor: pointer; user-select: none; touch-action: none; }
.lva-phone__idx-item.active { color: #16baaa; font-weight: 700; }
.lva-phone__letter-tip { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: rgba(22,186,170,.9); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; font-weight: 700; z-index: 20; }
.lva-phone__safe-area { padding: 6px 0 10px; text-align: center; background: #111; }
.lva-phone__home-bar { display: block; width: 130px; height: 4px; background: #fff; border-radius: 2px; margin: 0 auto; }
.lva-si-h5__section { margin-bottom: 14px; }
.lva-si-h5__header { display: flex; justify-content: space-between; font-size: 13px; color: #aaa; margin-bottom: 8px; }
.lva-si-h5__clear { color: #666; cursor: pointer; font-size: 12px; }
.lva-si-h5__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.lva-si-h5__tag { padding: 4px 10px; background: #222; border-radius: 12px; font-size: 12px; color: #ccc; cursor: pointer; }
.lva-si-h5__tag.hot { color: #ff5722; background: rgba(255,87,34,.1); }
.lva-si-h5__group { margin-bottom: 10px; }
.lva-si-h5__letter { font-size: 13px; font-weight: 700; color: #16baaa; padding: 4px 0; border-bottom: 1px solid #222; margin-bottom: 4px; }
.lva-si-h5__item { display: flex; align-items: center; gap: 10px; padding: 8px 4px; }
.lva-si-h5__name { font-size: 14px; color: #eee; }
.lva-si-h5__desc { font-size: 11px; color: #666; }
/* 小程序 */
.lva-miniapp { width: 375px; border-radius: 20px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.12); overflow: hidden; display: flex; flex-direction: column; position: relative; }
.lva-miniapp__status { display: flex; justify-content: space-between; align-items: center; padding: 6px 16px; background: #ededed; font-size: 12px; color: #333; }
.lva-miniapp__capsule { background: rgba(0,0,0,.08); padding: 2px 10px; border-radius: 12px; font-size: 14px; }
.lva-miniapp__search-bar { padding: 8px 12px; background: #f6f6f6; }
.lva-miniapp__search-input { width: 100%; padding: 8px 12px; border-radius: 18px; border: 1px solid #e5e7eb; font-size: 14px; outline: none; box-sizing: border-box; }
.lva-miniapp__scroll { flex: 1; min-height: 460px; max-height: 480px; overflow-y: auto; padding: 12px; padding-right: 28px; background: #fff; }
.lva-miniapp__index { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; gap: 1px; z-index: 10; }
.lva-miniapp__idx-item { width: 16px; height: 15px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #999; cursor: pointer; user-select: none; touch-action: none; }
.lva-miniapp__idx-item.active { color: #07c160; font-weight: 700; }
.lva-miniapp__letter-tip { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 50px; height: 50px; background: rgba(7,193,96,.9); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; font-weight: 700; z-index: 20; }
.lva-si-mp__section { margin-bottom: 14px; }
.lva-si-mp__header { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 8px; }
.lva-si-mp__clear { color: #999; cursor: pointer; font-size: 12px; }
.lva-si-mp__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.lva-si-mp__tag { padding: 4px 10px; background: #f3f4f6; border-radius: 12px; font-size: 12px; color: #555; cursor: pointer; }
.lva-si-mp__tag.hot { color: #ff5722; background: #fff5f5; }
.lva-si-mp__group { margin-bottom: 10px; }
.lva-si-mp__letter { font-size: 13px; font-weight: 700; color: #07c160; padding: 4px 0; border-bottom: 1px solid #f0f0f0; margin-bottom: 4px; }
.lva-si-mp__item { padding: 8px 4px; font-size: 14px; color: #333; border-bottom: 1px solid #f9f9f9; }
.lva-si-mp__item small { color: #999; font-size: 12px; margin-left: 8px; }
</style>
