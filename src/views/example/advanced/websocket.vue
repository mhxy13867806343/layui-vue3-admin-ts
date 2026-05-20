<script setup lang="ts">
/**
 * WebSocket 聊天室模拟
 *
 * - 模拟 WebSocket 连接状态
 * - 消息列表 + 发送
 * - 在线用户侧边栏
 * - 系统通知
 * - 自动滚动到底部
 */
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

interface ChatMessage {
  id: number
  type: 'user' | 'system'
  sender?: string
  content: string
  timestamp: string
  avatar?: string
}

interface OnlineUser {
  id: number
  name: string
  avatar: string
  status: 'online' | 'away'
}

const connectionStatus = ref<ConnectionStatus>('disconnected')
const messages = reactive<ChatMessage[]>([])
const inputText = ref('')
const chatListRef = ref<HTMLDivElement>()
let msgId = 0
let timers: ReturnType<typeof setTimeout>[] = []

const onlineUsers = reactive<OnlineUser[]>([
  { id: 1, name: '张三', avatar: 'Z', status: 'online' },
  { id: 2, name: '李四', avatar: 'L', status: 'online' },
  { id: 3, name: '王五', avatar: 'W', status: 'away' },
  { id: 4, name: '赵六', avatar: 'R', status: 'online' },
])

const currentUser = { id: 0, name: '我', avatar: 'M' }

const mockMessages = [
  { sender: '张三', content: '大家好，今天的需求评审几点开始？' },
  { sender: '李四', content: '下午 3 点，会议室 A' },
  { sender: '赵六', content: '收到，我准时到' },
  { sender: '张三', content: '好的，记得带上原型图' },
  { sender: '李四', content: '已经上传到共享文档了，大家可以提前看看' },
]

function now(): string {
  return new Date().toLocaleTimeString()
}

function scrollToBottom(): void {
  nextTick(() => {
    if (chatListRef.value) {
      chatListRef.value.scrollTop = chatListRef.value.scrollHeight
    }
  })
}

function addSystemMessage(content: string): void {
  messages.push({ id: msgId++, type: 'system', content, timestamp: now() })
  scrollToBottom()
}

function addUserMessage(sender: string, content: string): void {
  messages.push({ id: msgId++, type: 'user', sender, content, timestamp: now() })
  scrollToBottom()
}

function connect(): void {
  connectionStatus.value = 'reconnecting'
  addSystemMessage('正在连接服务器...')

  const t = setTimeout(() => {
    connectionStatus.value = 'connected'
    addSystemMessage('连接成功！欢迎进入聊天室。')

    // 模拟其他用户发消息
    simulateChat()
  }, 1500)
  timers.push(t)
}

function disconnect(): void {
  connectionStatus.value = 'disconnected'
  addSystemMessage('已断开连接')
  timers.forEach(clearTimeout)
  timers = []
}

function simulateChat(): void {
  let index = 0
  function next(): void {
    if (connectionStatus.value !== 'connected' || index >= mockMessages.length) return
    const msg = mockMessages[index++]
    addUserMessage(msg.sender, msg.content)

    const t = setTimeout(next, 2000 + Math.random() * 3000)
    timers.push(t)
  }
  const t = setTimeout(next, 2000)
  timers.push(t)

  // 模拟用户加入/离开
  const t2 = setTimeout(() => {
    if (connectionStatus.value !== 'connected') return
    const newUser = { id: 5, name: '孙七', avatar: 'S', status: 'online' as const }
    onlineUsers.push(newUser)
    addSystemMessage('孙七 加入了聊天室')
  }, 8000)
  timers.push(t2)

  const t3 = setTimeout(() => {
    if (connectionStatus.value !== 'connected') return
    const idx = onlineUsers.findIndex((u) => u.name === '王五')
    if (idx > -1) {
      onlineUsers.splice(idx, 1)
      addSystemMessage('王五 离开了聊天室')
    }
  }, 12000)
  timers.push(t3)
}

function sendMessage(): void {
  const text = inputText.value.trim()
  if (!text || connectionStatus.value !== 'connected') return
  inputText.value = ''
  addUserMessage(currentUser.name, text)
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const statusColor: Record<ConnectionStatus, string> = {
  connected: '#52c41a',
  disconnected: '#ff4d4f',
  reconnecting: '#faad14',
}

const statusLabel: Record<ConnectionStatus, string> = {
  connected: '已连接',
  disconnected: '未连接',
  reconnecting: '连接中...',
}

onMounted(() => {
  // Auto-connect on mount
  connect()
})

onUnmounted(() => {
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div class="lva-ws">
    <h2>WebSocket 聊天室</h2>
    <p class="lva-ws__desc">模拟 WebSocket 实时通信，包含连接状态、消息收发、在线用户列表。</p>

    <div class="lva-ws__container">
      <!-- 头部状态栏 -->
      <div class="lva-ws__header">
        <div class="lva-ws__status">
          <span class="lva-ws__dot" :style="{ background: statusColor[connectionStatus] }" />
          <span>{{ statusLabel[connectionStatus] }}</span>
        </div>
        <div class="lva-ws__header-actions">
          <lay-button v-if="connectionStatus === 'disconnected'" size="xs" type="primary" @click="connect">连接</lay-button>
          <lay-button v-if="connectionStatus === 'connected'" size="xs" type="warm" @click="disconnect">断开</lay-button>
        </div>
      </div>

      <div class="lva-ws__body">
        <!-- 消息区域 -->
        <div class="lva-ws__chat">
          <div ref="chatListRef" class="lva-ws__messages">
            <div v-for="msg in messages" :key="msg.id" class="lva-ws__msg" :class="`lva-ws__msg--${msg.type}`">
              <template v-if="msg.type === 'system'">
                <div class="lva-ws__system">{{ msg.content }}</div>
              </template>
              <template v-else>
                <div class="lva-ws__user-msg" :class="{ 'lva-ws__user-msg--self': msg.sender === '我' }">
                  <div class="lva-ws__msg-avatar">{{ msg.sender?.charAt(0) }}</div>
                  <div class="lva-ws__msg-body">
                    <div class="lva-ws__msg-meta">
                      <span class="lva-ws__msg-name">{{ msg.sender }}</span>
                      <span class="lva-ws__msg-time">{{ msg.timestamp }}</span>
                    </div>
                    <div class="lva-ws__msg-content">{{ msg.content }}</div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="lva-ws__input-area">
            <input
              v-model="inputText"
              class="lva-ws__input"
              placeholder="输入消息，Enter 发送..."
              :disabled="connectionStatus !== 'connected'"
              @keydown="onKeydown"
            />
            <lay-button size="sm" type="primary" :disabled="connectionStatus !== 'connected' || !inputText.trim()" @click="sendMessage">发送</lay-button>
          </div>
        </div>

        <!-- 在线用户侧边栏 -->
        <div class="lva-ws__sidebar">
          <div class="lva-ws__sidebar-title">在线用户 ({{ onlineUsers.length }})</div>
          <div class="lva-ws__user-list">
            <div v-for="user in onlineUsers" :key="user.id" class="lva-ws__user-item">
              <div class="lva-ws__user-avatar">{{ user.avatar }}</div>
              <span class="lva-ws__user-name">{{ user.name }}</span>
              <span class="lva-ws__user-status" :style="{ background: user.status === 'online' ? '#52c41a' : '#faad14' }" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="lva-ws__note">
      <p>💡 本页面使用 setTimeout 模拟 WebSocket 通信。实际项目中可使用原生 WebSocket 或 Socket.IO 库。</p>
    </section>
  </div>
</template>

<style scoped>
.lva-ws { padding: 4px; }
.lva-ws h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-ws__desc { color: #666; font-size: 13px; margin-bottom: 20px; }

.lva-ws__container {
  background: #fff; border-radius: 8px; border: 1px solid #e8e8e8; overflow: hidden;
  display: flex; flex-direction: column; height: 600px;
}

.lva-ws__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-bottom: 1px solid #e8e8e8; background: #fafafa;
}
.lva-ws__status { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.lva-ws__dot { width: 8px; height: 8px; border-radius: 50%; }

.lva-ws__body { display: flex; flex: 1; overflow: hidden; }

.lva-ws__chat { flex: 1; display: flex; flex-direction: column; }
.lva-ws__messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }

.lva-ws__system { text-align: center; font-size: 12px; color: #999; padding: 4px 0; }

.lva-ws__user-msg { display: flex; gap: 10px; }
.lva-ws__user-msg--self { flex-direction: row-reverse; }
.lva-ws__msg-avatar {
  width: 32px; height: 32px; border-radius: 50%; background: var(--global-primary-color, #16baaa);
  color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;
}
.lva-ws__user-msg--self .lva-ws__msg-avatar { background: #1677ff; }
.lva-ws__msg-body { max-width: 70%; }
.lva-ws__msg-meta { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
.lva-ws__msg-name { font-size: 12px; color: #666; font-weight: 500; }
.lva-ws__msg-time { font-size: 11px; color: #bbb; }
.lva-ws__msg-content {
  padding: 8px 12px; background: #f5f5f5; border-radius: 8px;
  font-size: 14px; line-height: 1.5; word-break: break-all;
}
.lva-ws__user-msg--self .lva-ws__msg-content { background: #e6f7ff; }

.lva-ws__input-area { display: flex; gap: 10px; padding: 12px 16px; border-top: 1px solid #e8e8e8; }
.lva-ws__input {
  flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px;
  font-size: 14px; outline: none;
}
.lva-ws__input:focus { border-color: var(--global-primary-color, #16baaa); }

.lva-ws__sidebar {
  width: 180px; border-left: 1px solid #e8e8e8; background: #fafafa;
  display: flex; flex-direction: column;
}
.lva-ws__sidebar-title { padding: 12px 14px; font-size: 13px; font-weight: 500; border-bottom: 1px solid #e8e8e8; }
.lva-ws__user-list { flex: 1; overflow-y: auto; padding: 8px; }
.lva-ws__user-item { display: flex; align-items: center; gap: 8px; padding: 8px 6px; border-radius: 4px; }
.lva-ws__user-item:hover { background: #f0f0f0; }
.lva-ws__user-avatar {
  width: 28px; height: 28px; border-radius: 50%; background: #e8e8e8;
  display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;
}
.lva-ws__user-name { flex: 1; font-size: 13px; }
.lva-ws__user-status { width: 6px; height: 6px; border-radius: 50%; }

.lva-ws__note {
  background: #fff; padding: 16px 20px; border-radius: 4px; margin-top: 14px;
  font-size: 13px; color: #666;
}
</style>
