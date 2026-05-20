<script setup lang="ts">
/**
 * AI 对话组件示例
 *
 * ChatGPT 风格的聊天界面：
 * - 流式输出（逐字显示）
 * - Markdown 渲染（加粗/代码块/列表）
 * - 消息历史
 * - 预设问题快捷入口
 * - 停止生成 / 重新生成
 * - 打字机动画效果
 */
import { nextTick, reactive, ref } from 'vue'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
  timestamp: string
}

const messages = reactive<Message[]>([
  {
    id: 0,
    role: 'assistant',
    content: '你好！我是 AI 助手，有什么可以帮你的吗？\n\n你可以问我关于 **Vue 3**、**TypeScript**、**前端开发** 等方面的问题。',
    timestamp: new Date().toLocaleTimeString(),
  },
])

const inputText = ref('')
const isGenerating = ref(false)
const chatListRef = ref<HTMLDivElement>()
let abortFlag = false
let msgId = 1

// 预设问题
const presets = [
  '如何在 Vue 3 中使用组合式 API？',
  '解释一下 TypeScript 的泛型',
  'Pinia 和 Vuex 有什么区别？',
  '如何优化 Vue 项目的性能？',
  '什么是属性测试（Property-Based Testing）？',
]

// 模拟 AI 回复内容
const aiResponses: Record<string, string> = {
  '如何在 Vue 3 中使用组合式 API？': `## 组合式 API (Composition API)

Vue 3 的组合式 API 通过 \`setup()\` 函数或 \`<\` + \`script setup>\` 语法糖来组织逻辑：

\`\`\`typescript
${'<'}script setup lang="ts"${'>'}
import { ref, computed, onMounted } from 'vue'

// 响应式状态
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}

// 生命周期
onMounted(() => {
  console.log('组件已挂载')
})
${'<'}/script${'>'}
\`\`\`

**核心优势：**
- 更好的逻辑复用（通过 composables）
- 更灵活的代码组织
- 更好的 TypeScript 支持
- 更小的打包体积（tree-shakeable）`,

  '解释一下 TypeScript 的泛型': `## TypeScript 泛型

泛型允许你创建可重用的组件，能够支持多种类型而不失去类型安全：

\`\`\`typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg
}

// 泛型接口
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 泛型约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// 使用
const res: ApiResponse<User[]> = await http.get('/users')
\`\`\`

**常见用途：**
1. API 响应类型封装
2. 通用组件 Props 定义
3. 工具类型（Partial、Pick、Omit）
4. 状态管理中的类型推导`,

  'Pinia 和 Vuex 有什么区别？': `## Pinia vs Vuex

| 特性 | Pinia | Vuex |
|------|-------|------|
| API 风格 | 组合式 + 选项式 | 仅选项式 |
| TypeScript | 原生支持 | 需要额外配置 |
| Mutations | ❌ 不需要 | ✅ 必须 |
| 模块嵌套 | 扁平结构 | 嵌套模块 |
| 包体积 | ~1KB | ~10KB |
| DevTools | ✅ 支持 | ✅ 支持 |

**Pinia 示例：**

\`\`\`typescript
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    doubled: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++  // 直接修改，无需 mutation
    }
  }
})
\`\`\`

**结论：** 新项目推荐使用 Pinia，它是 Vue 官方推荐的状态管理方案。`,
}

const defaultResponse = `这是一个很好的问题！让我来解答：

**关键要点：**
1. 首先需要理解基本概念
2. 然后通过实践加深理解
3. 最后在项目中灵活运用

\`\`\`javascript
// 示例代码
const example = {
  message: '这是 AI 生成的示例回复',
  tip: '实际项目中可接入 OpenAI / Claude API'
}
\`\`\`

> 💡 提示：本演示使用模拟数据，实际项目中可以接入 OpenAI、Claude 或其他 LLM API 实现真实的 AI 对话功能。`

function scrollToBottom(): void {
  nextTick(() => {
    if (chatListRef.value) {
      chatListRef.value.scrollTop = chatListRef.value.scrollHeight
    }
  })
}

async function sendMessage(text?: string): Promise<void> {
  const content = text || inputText.value.trim()
  if (!content || isGenerating.value) return
  inputText.value = ''

  // 添加用户消息
  messages.push({
    id: msgId++,
    role: 'user',
    content,
    timestamp: new Date().toLocaleTimeString(),
  })
  scrollToBottom()

  // 添加 AI 占位消息
  const aiMsg: Message = {
    id: msgId++,
    role: 'assistant',
    content: '',
    loading: true,
    timestamp: new Date().toLocaleTimeString(),
  }
  messages.push(aiMsg)
  scrollToBottom()

  // 模拟流式输出
  isGenerating.value = true
  abortFlag = false
  const fullText = aiResponses[content] || defaultResponse

  // 模拟延迟后开始输出
  await sleep(500)
  aiMsg.loading = false

  for (let i = 0; i < fullText.length; i++) {
    if (abortFlag) break
    aiMsg.content += fullText[i]
    if (i % 3 === 0) {
      scrollToBottom()
      await sleep(20 + Math.random() * 30)
    }
  }

  isGenerating.value = false
  scrollToBottom()
}

function stopGeneration(): void {
  abortFlag = true
}

function regenerate(): void {
  // 删除最后一条 AI 消息，重新生成
  const lastAi = messages.findLast((m) => m.role === 'assistant')
  const lastUser = messages.findLast((m) => m.role === 'user')
  if (lastAi && lastUser) {
    const idx = messages.indexOf(lastAi)
    messages.splice(idx, 1)
    sendMessage(lastUser.content)
  }
}

function clearChat(): void {
  messages.length = 0
  messages.push({
    id: 0,
    role: 'assistant',
    content: '对话已清空。有什么新问题可以继续问我！',
    timestamp: new Date().toLocaleTimeString(),
  })
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 简单的 Markdown 渲染（不引入额外依赖）
function renderMd(text: string): string {
  return text
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="ai-code"><code>$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
    // 标题
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // 加粗
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 引用
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // 表格（简单处理）
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(Boolean).map((c) => c.trim())
      if (cells.every((c) => /^[-:]+$/.test(c))) return ''
      return '<tr>' + cells.map((c) => `<td>${c}</td>`).join('') + '</tr>'
    })
    // 无序列表
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // 有序列表
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // 换行
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <div class="lva-ai">
    <h2>AI 对话</h2>
    <p class="lva-ai__desc">ChatGPT 风格的 AI 对话组件，支持流式输出、Markdown 渲染、预设问题。</p>

    <div class="lva-ai__container">
      <!-- 聊天区域 -->
      <div ref="chatListRef" class="lva-ai__messages">
        <div v-for="msg in messages" :key="msg.id" class="lva-ai__msg" :class="`lva-ai__msg--${msg.role}`">
          <div class="lva-ai__avatar">
            <i v-if="msg.role === 'user'" class="layui-icon layui-icon-username" />
            <i v-else class="layui-icon layui-icon-dialogue" />
          </div>
          <div class="lva-ai__bubble">
            <div v-if="msg.loading" class="lva-ai__typing">
              <span /><span /><span />
            </div>
            <div v-else class="lva-ai__content" v-html="renderMd(msg.content)" />
            <span class="lva-ai__time">{{ msg.timestamp }}</span>
          </div>
        </div>
      </div>

      <!-- 预设问题 -->
      <div v-if="messages.length <= 1" class="lva-ai__presets">
        <span class="lva-ai__presets-title">试试这些问题：</span>
        <div class="lva-ai__preset-list">
          <span v-for="p in presets" :key="p" class="lva-ai__preset" @click="sendMessage(p)">{{ p }}</span>
        </div>
      </div>

      <!-- 操作栏 -->
      <div v-if="messages.length > 1 && !isGenerating" class="lva-ai__toolbar">
        <span class="lva-ai__tool" @click="regenerate"><i class="layui-icon layui-icon-refresh" /> 重新生成</span>
        <span class="lva-ai__tool" @click="clearChat"><i class="layui-icon layui-icon-delete" /> 清空对话</span>
      </div>

      <!-- 输入区域 -->
      <div class="lva-ai__input-area">
        <textarea
          v-model="inputText"
          class="lva-ai__input"
          placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
          rows="2"
          :disabled="isGenerating"
          @keydown="onKeydown"
        />
        <div class="lva-ai__send-area">
          <lay-button v-if="isGenerating" size="sm" type="danger" @click="stopGeneration">
            <i class="layui-icon layui-icon-pause" /> 停止
          </lay-button>
          <lay-button v-else size="sm" type="primary" :disabled="!inputText.trim()" @click="sendMessage()">
            <i class="layui-icon layui-icon-release" /> 发送
          </lay-button>
        </div>
      </div>
    </div>

    <!-- 说明 -->
    <section class="lva-ai__note">
      <p>💡 本演示使用模拟数据实现流式输出效果。实际项目中可接入：</p>
      <ul>
        <li><strong>OpenAI API</strong> — GPT-4 / GPT-3.5，使用 SSE 流式响应</li>
        <li><strong>Claude API</strong> — Anthropic 的 AI 模型</li>
        <li><strong>通义千问 / 文心一言</strong> — 国内大模型 API</li>
        <li><strong>本地部署</strong> — Ollama + Llama 等开源模型</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.lva-ai { padding: 4px; }
.lva-ai h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-ai__desc { color: #666; font-size: 13px; margin-bottom: 16px; }

.lva-ai__container {
  background: #fff; border-radius: 8px; border: 1px solid #e8e8e8;
  display: flex; flex-direction: column; height: 600px; overflow: hidden;
}

/* Messages */
.lva-ai__messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.lva-ai__msg { display: flex; gap: 12px; max-width: 85%; }
.lva-ai__msg--user { align-self: flex-end; flex-direction: row-reverse; }
.lva-ai__msg--assistant { align-self: flex-start; }

.lva-ai__avatar {
  width: 36px; height: 36px; border-radius: 50%; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
}
.lva-ai__msg--user .lva-ai__avatar { background: var(--global-primary-color, #16baaa); color: #fff; }
.lva-ai__msg--assistant .lva-ai__avatar { background: #f0f0f0; color: #666; }

.lva-ai__bubble {
  padding: 12px 16px; border-radius: 12px; position: relative;
  line-height: 1.7; font-size: 14px;
}
.lva-ai__msg--user .lva-ai__bubble { background: var(--global-primary-color, #16baaa); color: #fff; border-bottom-right-radius: 4px; }
.lva-ai__msg--assistant .lva-ai__bubble { background: #f7f8fa; color: #333; border-bottom-left-radius: 4px; }

.lva-ai__time { display: block; font-size: 11px; color: #bbb; margin-top: 6px; }
.lva-ai__msg--user .lva-ai__time { color: rgba(255,255,255,0.7); text-align: right; }

/* Typing animation */
.lva-ai__typing { display: flex; gap: 4px; padding: 4px 0; }
.lva-ai__typing span {
  width: 8px; height: 8px; border-radius: 50%; background: #999;
  animation: typing 1.4s infinite ease-in-out;
}
.lva-ai__typing span:nth-child(2) { animation-delay: 0.2s; }
.lva-ai__typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }

/* Markdown content */
.lva-ai__content :deep(h2), .lva-ai__content :deep(h3), .lva-ai__content :deep(h4) { margin: 8px 0 4px; }
.lva-ai__content :deep(pre.ai-code) {
  background: #1e1e2e; color: #cdd6f4; padding: 12px 16px; border-radius: 6px;
  font-size: 12px; overflow-x: auto; margin: 8px 0;
}
.lva-ai__content :deep(code.ai-inline-code) {
  background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 3px; font-size: 12px; color: #e91e63;
}
.lva-ai__content :deep(blockquote) {
  border-left: 3px solid var(--global-primary-color, #16baaa); padding: 4px 12px;
  margin: 8px 0; background: rgba(22,186,170,0.05); color: #666;
}
.lva-ai__content :deep(li) { margin: 2px 0; }
.lva-ai__content :deep(strong) { color: inherit; }
.lva-ai__content :deep(table) { border-collapse: collapse; margin: 8px 0; font-size: 13px; }
.lva-ai__content :deep(td) { border: 1px solid #ddd; padding: 4px 10px; }

/* Presets */
.lva-ai__presets { padding: 0 20px 12px; }
.lva-ai__presets-title { font-size: 12px; color: #999; display: block; margin-bottom: 8px; }
.lva-ai__preset-list { display: flex; flex-wrap: wrap; gap: 8px; }
.lva-ai__preset {
  padding: 6px 12px; background: #f5f5f5; border: 1px solid #eee;
  border-radius: 16px; font-size: 12px; cursor: pointer; transition: all 0.2s;
}
.lva-ai__preset:hover { border-color: var(--global-primary-color, #16baaa); color: var(--global-primary-color, #16baaa); }

/* Toolbar */
.lva-ai__toolbar { display: flex; gap: 16px; padding: 8px 20px; border-top: 1px solid #f0f0f0; }
.lva-ai__tool { font-size: 12px; color: #999; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.lva-ai__tool:hover { color: var(--global-primary-color, #16baaa); }

/* Input */
.lva-ai__input-area { display: flex; gap: 10px; padding: 12px 16px; border-top: 1px solid #e8e8e8; align-items: flex-end; }
.lva-ai__input {
  flex: 1; resize: none; border: 1px solid #ddd; border-radius: 8px;
  padding: 10px 14px; font-size: 14px; line-height: 1.5; font-family: inherit;
}
.lva-ai__input:focus { border-color: var(--global-primary-color, #16baaa); outline: none; }
.lva-ai__send-area { flex-shrink: 0; }

/* Note */
.lva-ai__note {
  background: #fff; padding: 16px 20px; border-radius: 4px; margin-top: 14px;
  font-size: 13px; color: #666;
}
.lva-ai__note p { margin: 0 0 8px; }
.lva-ai__note ul { margin: 0; padding-left: 20px; }
.lva-ai__note li { margin: 4px 0; }
</style>
