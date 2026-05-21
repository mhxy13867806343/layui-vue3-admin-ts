<script setup lang="ts">
/**
 * Format 工具库演示 / libs/format-demo
 *
 * 展示 src/utils/format.ts 中所有函数的用法和效果
 */
import { ref, computed } from 'vue'
import {
  timeAgo, formatMoney, formatRegion, defaultText, splitText,
  extractNumbers, extractContent, stripHtml, filterSpecialChars, escapeHtml,
  formatCalendar, formatDate, formatTimestamp, highlightText, highlightAt,
  parseLyric, getCurrentLyricIndex,
} from '@/utils/format'

// timeAgo
const timeAgoInputs = [
  Date.now() - 3000,
  Date.now() - 45000,
  Date.now() - 3600000,
  Date.now() - 86400000 * 3,
  Date.now() - 86400000 * 60,
  Date.now() - 86400000 * 400,
]

// formatMoney
const moneyInput = ref(12345.6)
const moneyUnit = ref<'yuan' | 'fen'>('yuan')
const moneySymbol = ref('¥')

// formatRegion
const regionCode = ref('440000')

// defaultText
const defaultInputs = [null, undefined, '', '  ', 'Hello']

// splitText
const splitInput = ref('Vue,React,Angular,Svelte')
const splitSep = ref(',')

// extractNumbers
const numInput = ref('价格是 ¥99.9，共 3 件，折扣 -10 元')

// extractContent
const contentInput = ref('联系邮箱：admin@test.com 和 user@example.org')
const contentPattern = ref('[\\w.-]+@[\\w.-]+')

// filterFormat
const htmlInput = ref('<p>Hello <b>World</b></p>&lt;script&gt;alert(1)&lt;/script&gt;')

// formatCalendar
const calendarInputs = [
  Date.now(),
  Date.now() - 86400000,
  Date.now() - 86400000 * 2,
  Date.now() - 86400000 * 4,
  Date.now() - 86400000 * 30,
]

// formatDate
const dateInput = ref(Date.now())
const dateFormat = ref('YYYY-MM-DD HH:mm:ss')

// formatTimestamp
const tsInput = ref(Math.floor(Date.now() / 1000))

// highlightText
const hlText = ref('Vue3 是一个渐进式 JavaScript 框架，Vue3 性能优秀')
const hlKeyword = ref('Vue3')

// highlightAt
const atText = ref('感谢 @admin 和 @alice 的贡献，@bob 也辛苦了')

// parseLyric
const lrcInput = ref(`[00:00.00] 作词：示例
[00:01.00] 作曲：示例
[00:04.00] 编曲：示例
[00:08.00] 当我走在这条路上
[00:12.50] 看着远方的天空
[00:16.80] 心中充满了希望
[00:21.00] 未来就在前方
[00:25.30] 不管风雨有多大
[00:29.60] 我都不会放弃
[00:33.90] 因为梦想在心中
[00:38.20] 永远不会熄灭`)

const parsedLyrics = computed(() => parseLyric(lrcInput.value))
const playTime = ref(0)
const currentLyricIdx = computed(() => getCurrentLyricIndex(parsedLyrics.value, playTime.value))
let playTimer: ReturnType<typeof setInterval> | null = null
const isPlaying = ref(false)

function togglePlay(): void {
  if (isPlaying.value) {
    if (playTimer) clearInterval(playTimer)
    isPlaying.value = false
  } else {
    isPlaying.value = true
    playTimer = setInterval(() => {
      playTime.value += 0.5
      if (playTime.value > 45) { playTime.value = 0 }
    }, 500)
  }
}
</script>

<template>
  <div class="lva-fmt">
    <h2>Format 工具库演示</h2>
    <p class="lva-fmt__desc">展示 <code>src/utils/format.ts</code> 中所有格式化函数的用法和效果。</p>

    <!-- 1. timeAgo -->
    <lay-card class="lva-fmt__card">
      <template #title>1. timeAgo — 相对时间</template>
      <div class="lva-fmt__demo">
        <div v-for="(ts, i) in timeAgoInputs" :key="i" class="lva-fmt__row">
          <code>timeAgo({{ ts }})</code>
          <span class="lva-fmt__result">→ {{ timeAgo(ts) }}</span>
        </div>
      </div>
    </lay-card>

    <!-- 2. formatMoney -->
    <lay-card class="lva-fmt__card">
      <template #title>2. formatMoney — 金额格式化</template>
      <div class="lva-fmt__demo">
        <div class="lva-fmt__inputs">
          <lay-input v-model.number="moneyInput" type="number" placeholder="金额" style="width:150px" />
          <lay-select v-model="moneyUnit" style="width:100px">
            <lay-select-option value="yuan" label="元" />
            <lay-select-option value="fen" label="分" />
          </lay-select>
          <lay-input v-model="moneySymbol" placeholder="符号" style="width:80px" />
        </div>
        <div class="lva-fmt__row">
          <code>formatMoney({{ moneyInput }}, { unit: '{{ moneyUnit }}', symbol: '{{ moneySymbol }}' })</code>
          <span class="lva-fmt__result">→ {{ formatMoney(moneyInput, { unit: moneyUnit, symbol: moneySymbol }) }}</span>
        </div>
        <div class="lva-fmt__row"><code>formatMoney(1234567, { unit: 'fen' })</code><span class="lva-fmt__result">→ {{ formatMoney(1234567, { unit: 'fen' }) }}</span></div>
      </div>
    </lay-card>

    <!-- 3. formatRegion -->
    <lay-card class="lva-fmt__card">
      <template #title>3. formatRegion — 地区转换</template>
      <div class="lva-fmt__demo">
        <lay-input v-model="regionCode" placeholder="地区码如440000" style="width:200px" />
        <div class="lva-fmt__row"><code>formatRegion('{{ regionCode }}')</code><span class="lva-fmt__result">→ {{ formatRegion(regionCode) }}</span></div>
      </div>
    </lay-card>

    <!-- 4. defaultText -->
    <lay-card class="lva-fmt__card">
      <template #title>4. defaultText — 默认值展示</template>
      <div class="lva-fmt__demo">
        <div v-for="(v, i) in defaultInputs" :key="i" class="lva-fmt__row">
          <code>defaultText({{ JSON.stringify(v) }})</code>
          <span class="lva-fmt__result">→ "{{ defaultText(v) }}"</span>
        </div>
      </div>
    </lay-card>

    <!-- 5. splitText -->
    <lay-card class="lva-fmt__card">
      <template #title>5. splitText — 文本分割</template>
      <div class="lva-fmt__demo">
        <div class="lva-fmt__inputs">
          <lay-input v-model="splitInput" placeholder="文本" style="width:250px" />
          <lay-input v-model="splitSep" placeholder="分隔符" style="width:80px" />
        </div>
        <div class="lva-fmt__row"><span class="lva-fmt__result">→ {{ JSON.stringify(splitText(splitInput, splitSep)) }}</span></div>
      </div>
    </lay-card>

    <!-- 6. extractNumbers -->
    <lay-card class="lva-fmt__card">
      <template #title>6. extractNumbers — 提取数字</template>
      <div class="lva-fmt__demo">
        <lay-input v-model="numInput" placeholder="含数字的文本" style="width:400px" />
        <div class="lva-fmt__row"><span class="lva-fmt__result">→ {{ JSON.stringify(extractNumbers(numInput)) }}</span></div>
      </div>
    </lay-card>

    <!-- 7. extractContent -->
    <lay-card class="lva-fmt__card">
      <template #title>7. extractContent — 正则提取</template>
      <div class="lva-fmt__demo">
        <lay-input v-model="contentInput" placeholder="文本" style="width:400px" />
        <lay-input v-model="contentPattern" placeholder="正则" style="width:200px" />
        <div class="lva-fmt__row"><span class="lva-fmt__result">→ {{ JSON.stringify(extractContent(contentInput, new RegExp(contentPattern, 'g'))) }}</span></div>
      </div>
    </lay-card>

    <!-- 8. 过滤格式 -->
    <lay-card class="lva-fmt__card">
      <template #title>8. 过滤格式 — stripHtml / filterSpecialChars / escapeHtml</template>
      <div class="lva-fmt__demo">
        <lay-input v-model="htmlInput" placeholder="HTML文本" style="width:400px" />
        <div class="lva-fmt__row"><code>stripHtml</code><span class="lva-fmt__result">→ {{ stripHtml(htmlInput) }}</span></div>
        <div class="lva-fmt__row"><code>escapeHtml</code><span class="lva-fmt__result">→ {{ escapeHtml(htmlInput) }}</span></div>
        <div class="lva-fmt__row"><code>filterSpecialChars</code><span class="lva-fmt__result">→ {{ filterSpecialChars(htmlInput) }}</span></div>
      </div>
    </lay-card>

    <!-- 9. formatCalendar -->
    <lay-card class="lva-fmt__card">
      <template #title>9. formatCalendar — 日历时间</template>
      <div class="lva-fmt__demo">
        <div v-for="(ts, i) in calendarInputs" :key="i" class="lva-fmt__row">
          <code>formatCalendar(now - {{ i === 0 ? '0' : i === 1 ? '1天' : i === 2 ? '2天' : i === 3 ? '4天' : '30天' }})</code>
          <span class="lva-fmt__result">→ {{ formatCalendar(ts) }}</span>
        </div>
      </div>
    </lay-card>

    <!-- 10. formatDate -->
    <lay-card class="lva-fmt__card">
      <template #title>10. formatDate — 格式化时间</template>
      <div class="lva-fmt__demo">
        <div class="lva-fmt__inputs">
          <lay-input v-model="dateFormat" placeholder="格式" style="width:250px" />
        </div>
        <div class="lva-fmt__row"><code>formatDate(Date.now(), '{{ dateFormat }}')</code><span class="lva-fmt__result">→ {{ formatDate(dateInput, dateFormat) }}</span></div>
        <div class="lva-fmt__row"><code>formatDate(Date.now(), 'MM/DD HH:mm')</code><span class="lva-fmt__result">→ {{ formatDate(dateInput, 'MM/DD HH:mm') }}</span></div>
      </div>
    </lay-card>

    <!-- 11. formatTimestamp -->
    <lay-card class="lva-fmt__card">
      <template #title>11. formatTimestamp — 时间戳转换</template>
      <div class="lva-fmt__demo">
        <lay-input v-model.number="tsInput" type="number" placeholder="时间戳" style="width:200px" />
        <div class="lva-fmt__row"><code>formatTimestamp({{ tsInput }})</code><span class="lva-fmt__result">→ {{ formatTimestamp(tsInput) }}</span></div>
      </div>
    </lay-card>

    <!-- 12. highlightText -->
    <lay-card class="lva-fmt__card">
      <template #title>12. highlightText — 文本高亮</template>
      <div class="lva-fmt__demo">
        <div class="lva-fmt__inputs">
          <lay-input v-model="hlText" placeholder="文本" style="width:350px" />
          <lay-input v-model="hlKeyword" placeholder="关键词" style="width:120px" />
        </div>
        <div class="lva-fmt__row"><span class="lva-fmt__result" v-html="highlightText(hlText, hlKeyword)" /></div>
      </div>
    </lay-card>

    <!-- 13. highlightAt -->
    <lay-card class="lva-fmt__card">
      <template #title>13. highlightAt — @用户名高亮</template>
      <div class="lva-fmt__demo">
        <lay-input v-model="atText" placeholder="含@的文本" style="width:400px" />
        <div class="lva-fmt__row"><span class="lva-fmt__result lva-fmt__at-demo" v-html="highlightAt(atText)" /></div>
      </div>
    </lay-card>

    <!-- 14. parseLyric -->
    <lay-card class="lva-fmt__card">
      <template #title>14. parseLyric — 歌词解析</template>
      <div class="lva-fmt__demo">
        <div class="lva-fmt__lyric-wrap">
          <div class="lva-fmt__lyric-input">
            <lay-textarea v-model="lrcInput" :rows="8" placeholder="LRC 格式歌词" />
          </div>
          <div class="lva-fmt__lyric-preview">
            <div class="lva-fmt__lyric-controls">
              <lay-button size="sm" @click="togglePlay">{{ isPlaying ? '⏸ 暂停' : '▶ 播放' }}</lay-button>
              <lay-button size="sm" @click="playTime = 0">⏮ 重置</lay-button>
              <span class="lva-fmt__lyric-time">{{ playTime.toFixed(1) }}s</span>
            </div>
            <div class="lva-fmt__lyric-lines">
              <div
                v-for="(line, i) in parsedLyrics"
                :key="i"
                :class="['lva-fmt__lyric-line', { active: i === currentLyricIdx }]"
              >
                <span class="lva-fmt__lyric-ts">[{{ line.time.toFixed(2) }}]</span>
                <span>{{ line.text || '♪' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </lay-card>
  </div>
</template>

<style scoped>
.lva-fmt { padding: 16px; max-width: 900px; }
.lva-fmt h2 { margin: 0 0 4px; font-size: 20px; color: #333; }
.lva-fmt__desc { margin: 0 0 20px; color: #888; font-size: 13px; }
.lva-fmt__desc code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
.lva-fmt__card { margin-bottom: 16px; }
.lva-fmt__demo { display: flex; flex-direction: column; gap: 10px; padding: 8px 0; }
.lva-fmt__inputs { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.lva-fmt__row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 13px; }
.lva-fmt__row code { background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #555; white-space: nowrap; }
.lva-fmt__result { color: #16baaa; font-weight: 500; word-break: break-all; }
.lva-fmt__result :deep(mark) { background: #fef08a; padding: 1px 2px; border-radius: 2px; }
.lva-fmt__at-demo :deep(.at-highlight) { color: #1e9fff; font-weight: 600; }
/* 歌词 */
.lva-fmt__lyric-wrap { display: flex; gap: 16px; }
.lva-fmt__lyric-input { flex: 1; }
.lva-fmt__lyric-preview { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.lva-fmt__lyric-controls { display: flex; align-items: center; gap: 8px; }
.lva-fmt__lyric-time { font-size: 12px; color: #888; margin-left: auto; }
.lva-fmt__lyric-lines { max-height: 200px; overflow-y: auto; border: 1px solid #f0f0f0; border-radius: 6px; padding: 8px; }
.lva-fmt__lyric-line { padding: 4px 8px; font-size: 13px; color: #888; border-radius: 4px; transition: all 0.3s; }
.lva-fmt__lyric-line.active { color: #16baaa; font-weight: 600; background: #e8f8f5; transform: scale(1.02); }
.lva-fmt__lyric-ts { font-size: 11px; color: #bbb; margin-right: 8px; font-family: monospace; }
</style>
