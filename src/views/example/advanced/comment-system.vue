<script setup lang="ts">
/**
 * 多端评论系统 / advanced/comment-system
 *
 * 修复：
 * 1. H5/小程序端点击回复 → 底部弹出回复面板（非弹窗）
 * 2. 添加表情选择器
 * 3. 多级回复全部展示（超过3层平铺 @回复人）
 */
import { ref, computed, nextTick } from 'vue'
import { layer } from '@layui/layui-vue'

type Platform = 'pc' | 'h5' | 'miniapp'

interface Comment {
  id: number
  parentId: number | null
  replyTo: string | null
  username: string
  avatarColor: string
  content: string
  time: string
  timeAgo: string
  liked: boolean
  likeCount: number
  children: Comment[]
}

const platform = ref<Platform>('pc')
let idSeq = 100

const currentTime = ref('')
function updateTime(): void {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  currentTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
updateTime()
setInterval(updateTime, 60_000)

// 表情列表
const EMOJIS = ['😀','😂','🤣','😍','🥰','😎','🤔','👍','👎','❤️','🔥','💯','🎉','👏','😭','😱','🙏','💪','✨','🌟','😊','🥺','😤','🤝','💕']
const showEmoji = ref(false)

const comments = ref<Comment[]>([
  { id: 1, parentId: null, replyTo: null, username: 'admin', avatarColor: '#16baaa',
    content: '这个项目做得不错，功能很全面！特别是权限管理和多模板登录页的设计。👍',
    time: '2026-05-21 14:00', timeAgo: '30 分钟前', liked: true, likeCount: 12,
    children: [
      { id: 2, parentId: 1, replyTo: null, username: 'alice', avatarColor: '#a855f7',
        content: '同意！Three.js 的演示也很酷 🔥',
        time: '2026-05-21 14:10', timeAgo: '20 分钟前', liked: false, likeCount: 5,
        children: [
          { id: 5, parentId: 2, replyTo: 'alice', username: 'admin', avatarColor: '#16baaa',
            content: '谢谢！后续还会加入更多 3D 场景 ✨',
            time: '2026-05-21 14:15', timeAgo: '15 分钟前', liked: false, likeCount: 3,
            children: [
              { id: 8, parentId: 5, replyTo: 'admin', username: 'bob', avatarColor: '#f59e0b',
                content: '期待模型加载功能！能支持 glTF 格式吗？🤔',
                time: '2026-05-21 14:20', timeAgo: '10 分钟前', liked: false, likeCount: 1, children: [] },
            ] },
        ] },
      { id: 3, parentId: 1, replyTo: null, username: 'john', avatarColor: '#1e9fff',
        content: '字典管理和操作日志也很实用 💯',
        time: '2026-05-21 14:12', timeAgo: '18 分钟前', liked: false, likeCount: 4, children: [] },
    ] },
  { id: 4, parentId: null, replyTo: null, username: 'tester', avatarColor: '#ec4899',
    content: '发现一个小问题：在 Firefox 下验证码 canvas 偶尔会闪烁 😱',
    time: '2026-05-21 13:30', timeAgo: '1 小时前', liked: false, likeCount: 2,
    children: [
      { id: 6, parentId: 4, replyTo: null, username: 'admin', avatarColor: '#16baaa',
        content: '感谢反馈！已记录 Issue，会在下个版本修复 🙏',
        time: '2026-05-21 13:45', timeAgo: '45 分钟前', liked: true, likeCount: 3, children: [] },
    ] },
  { id: 7, parentId: null, replyTo: null, username: 'bob', avatarColor: '#f59e0b',
    content: '请问有计划支持暗黑模式下的图表主题自动切换吗？现在 ECharts 在暗黑模式下文字颜色不太对。',
    time: '2026-05-21 12:00', timeAgo: '2 小时前', liked: false, likeCount: 6, children: [] },
])

const replyingTo = ref<Comment | null>(null)
const replyContent = ref('')
const newComment = ref('')
const mobileInputRef = ref<HTMLInputElement | null>(null)

function onLike(c: Comment): void { c.liked = !c.liked; c.likeCount += c.liked ? 1 : -1 }

function onReply(c: Comment): void {
  replyingTo.value = c
  replyContent.value = ''
  showEmoji.value = false
  nextTick(() => { mobileInputRef.value?.focus() })
}

function cancelReply(): void { replyingTo.value = null; replyContent.value = '' }

function insertEmoji(emoji: string): void {
  if (replyingTo.value) { replyContent.value += emoji }
  else { newComment.value += emoji }
}

function submitReply(): void {
  if (!replyContent.value.trim()) { layer.msg('请输入回复内容', { icon: 2 }); return }
  if (!replyingTo.value) return
  idSeq++
  const newReply: Comment = {
    id: idSeq, parentId: replyingTo.value.id, replyTo: replyingTo.value.username,
    username: 'admin', avatarColor: '#16baaa', content: replyContent.value.trim(),
    time: new Date().toISOString().slice(0, 16).replace('T', ' '),
    timeAgo: '刚刚', liked: false, likeCount: 0, children: [],
  }
  replyingTo.value.children.push(newReply)
  layer.msg('回复成功 ✓', { icon: 1 })
  replyingTo.value = null
  replyContent.value = ''
  showEmoji.value = false
}

function submitComment(): void {
  if (!newComment.value.trim()) { layer.msg('请输入评论内容', { icon: 2 }); return }
  idSeq++
  comments.value.unshift({
    id: idSeq, parentId: null, replyTo: null,
    username: 'admin', avatarColor: '#16baaa', content: newComment.value.trim(),
    time: new Date().toISOString().slice(0, 16).replace('T', ' '),
    timeAgo: '刚刚', liked: false, likeCount: 0, children: [],
  })
  newComment.value = ''
  showEmoji.value = false
  layer.msg('评论成功 ✓', { icon: 1 })
}

function onMobileSend(): void {
  if (replyingTo.value) { submitReply() } else { submitComment() }
}

// H5/小程序端用 replyContent 或 newComment
const mobileInput = computed({
  get: () => replyingTo.value ? replyContent.value : newComment.value,
  set: (v: string) => { if (replyingTo.value) replyContent.value = v; else newComment.value = v },
})

const mobilePlaceholder = computed(() =>
  replyingTo.value ? `回复 @${replyingTo.value.username}...` : '写评论...'
)

function onDelete(c: Comment, parent: Comment | null): void {
  layer.confirm('确认删除该评论？', {
    yes: () => {
      if (parent) { parent.children = parent.children.filter(x => x.id !== c.id) }
      else { comments.value = comments.value.filter(x => x.id !== c.id) }
      layer.msg('已删除', { icon: 1 })
    },
  })
}

// 递归扁平化所有回复（用于 H5/小程序展示全部层级）
function flattenReplies(children: Comment[], depth = 0): { comment: Comment; depth: number }[] {
  const result: { comment: Comment; depth: number }[] = []
  for (const c of children) {
    result.push({ comment: c, depth })
    if (c.children.length) result.push(...flattenReplies(c.children, depth + 1))
  }
  return result
}

const totalCount = computed(() => {
  let count = 0
  function walk(list: Comment[]): void { for (const c of list) { count++; walk(c.children) } }
  walk(comments.value)
  return count
})
</script>

<template>
  <div class="lva-comment-page">
    <lay-tab v-model="platform">
      <lay-tab-item title="💻 PC 端" id="pc" />
      <lay-tab-item title="📱 H5/APP 端" id="h5" />
      <lay-tab-item title="🔲 小程序端" id="miniapp" />
    </lay-tab>

    <!-- ===== PC 端 ===== -->
    <div v-if="platform === 'pc'" class="lva-cmt-pc">
      <h3>评论 ({{ totalCount }})</h3>
      <div class="lva-cmt-pc__input-box">
        <div class="lva-cmt-pc__avatar" style="background:#16baaa">A</div>
        <div class="lva-cmt-pc__input-wrap">
          <textarea v-model="newComment" placeholder="写下你的评论..." rows="3" class="lva-cmt-pc__textarea" />
          <div class="lva-cmt-pc__toolbar">
            <div class="lva-cmt-pc__emoji-trigger" @click="showEmoji = !showEmoji">😀 表情</div>
            <lay-button type="primary" size="sm" @click="submitComment">发表评论</lay-button>
          </div>
          <div v-if="showEmoji && !replyingTo" class="lva-cmt-pc__emoji-panel">
            <span v-for="e in EMOJIS" :key="e" class="lva-cmt-pc__emoji" @click="insertEmoji(e)">{{ e }}</span>
          </div>
        </div>
      </div>
      <!-- 评论列表 (PC 递归3层) -->
      <div class="lva-cmt-pc__list">
        <template v-for="c in comments" :key="c.id">
          <div class="lva-cmt-pc__item">
            <div class="lva-cmt-pc__avatar" :style="{background:c.avatarColor}">{{ c.username.slice(0,1).toUpperCase() }}</div>
            <div class="lva-cmt-pc__body">
              <div class="lva-cmt-pc__meta"><strong>{{ c.username }}</strong><span>{{ c.timeAgo }}</span></div>
              <div class="lva-cmt-pc__content">{{ c.content }}</div>
              <div class="lva-cmt-pc__actions">
                <span :class="{liked:c.liked}" @click="onLike(c)"><i class="layui-icon layui-icon-praise" /> {{ c.likeCount }}</span>
                <span @click="onReply(c)"><i class="layui-icon layui-icon-reply-fill" /> 回复</span>
                <span class="del" @click="onDelete(c,null)"><i class="layui-icon layui-icon-delete" /> 删除</span>
              </div>
              <div v-if="replyingTo?.id===c.id" class="lva-cmt-pc__reply-box">
                <textarea v-model="replyContent" :placeholder="`回复 @${c.username}...`" rows="2" class="lva-cmt-pc__textarea lva-cmt-pc__textarea--sm" />
                <div class="lva-cmt-pc__emoji-trigger" @click="showEmoji=!showEmoji">😀</div>
                <div v-if="showEmoji" class="lva-cmt-pc__emoji-panel"><span v-for="e in EMOJIS" :key="e" class="lva-cmt-pc__emoji" @click="insertEmoji(e)">{{ e }}</span></div>
                <div class="lva-cmt-pc__reply-actions"><lay-button type="primary" size="xs" @click="submitReply">回复</lay-button><lay-button size="xs" @click="cancelReply">取消</lay-button></div>
              </div>
              <!-- 子评论全部展示 -->
              <div v-if="c.children.length" class="lva-cmt-pc__children">
                <div v-for="item in flattenReplies(c.children)" :key="item.comment.id" class="lva-cmt-pc__item lva-cmt-pc__item--child" :style="{marginLeft: Math.min(item.depth,2)*20+'px'}">
                  <div class="lva-cmt-pc__avatar lva-cmt-pc__avatar--sm" :style="{background:item.comment.avatarColor}">{{ item.comment.username.slice(0,1).toUpperCase() }}</div>
                  <div class="lva-cmt-pc__body">
                    <div class="lva-cmt-pc__meta"><strong>{{ item.comment.username }}</strong><span v-if="item.comment.replyTo" class="reply-tag">回复 @{{ item.comment.replyTo }}</span><span>{{ item.comment.timeAgo }}</span></div>
                    <div class="lva-cmt-pc__content">{{ item.comment.content }}</div>
                    <div class="lva-cmt-pc__actions">
                      <span :class="{liked:item.comment.liked}" @click="onLike(item.comment)"><i class="layui-icon layui-icon-praise" /> {{ item.comment.likeCount }}</span>
                      <span @click="onReply(item.comment)"><i class="layui-icon layui-icon-reply-fill" /> 回复</span>
                      <span class="del" @click="onDelete(item.comment,c)"><i class="layui-icon layui-icon-delete" /> 删除</span>
                    </div>
                    <div v-if="replyingTo?.id===item.comment.id" class="lva-cmt-pc__reply-box">
                      <textarea v-model="replyContent" :placeholder="`回复 @${item.comment.username}...`" rows="2" class="lva-cmt-pc__textarea lva-cmt-pc__textarea--sm" />
                      <div class="lva-cmt-pc__reply-actions"><lay-button type="primary" size="xs" @click="submitReply">回复</lay-button><lay-button size="xs" @click="cancelReply">取消</lay-button></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ===== H5/APP 端 ===== -->
    <div v-if="platform === 'h5'" class="lva-cmt-mobile">
      <div class="lva-phone">
        <div class="lva-phone__status"><span>{{ currentTime }}</span><span class="lva-phone__battery"><span class="lva-phone__battery-fill" /></span></div>
        <div class="lva-phone__navbar">评论 ({{ totalCount }})</div>
        <div class="lva-phone__scroll">
          <div v-for="c in comments" :key="c.id" class="lva-cmt-h5__item">
            <div class="lva-cmt-h5__avatar" :style="{background:c.avatarColor}">{{ c.username.slice(0,1).toUpperCase() }}</div>
            <div class="lva-cmt-h5__body">
              <div class="lva-cmt-h5__top"><strong>{{ c.username }}</strong><span>{{ c.timeAgo }}</span></div>
              <div class="lva-cmt-h5__text">{{ c.content }}</div>
              <div class="lva-cmt-h5__footer">
                <span :class="{liked:c.liked}" @click="onLike(c)">👍 {{ c.likeCount }}</span>
                <span @click="onReply(c)">💬 回复</span>
              </div>
              <!-- 全部子回复平铺展示 -->
              <div v-if="c.children.length" class="lva-cmt-h5__replies">
                <div v-for="item in flattenReplies(c.children)" :key="item.comment.id" class="lva-cmt-h5__reply" @click="onReply(item.comment)">
                  <strong>{{ item.comment.username }}</strong>
                  <span v-if="item.comment.replyTo" class="lva-cmt-h5__at"> 回复 @{{ item.comment.replyTo }}</span>
                  ：{{ item.comment.content }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 底部回复面板 -->
        <div class="lva-phone__reply-panel">
          <div v-if="replyingTo" class="lva-phone__reply-hint">
            <span>回复 @{{ replyingTo.username }}</span>
            <span class="lva-phone__reply-cancel" @click="cancelReply">✕</span>
          </div>
          <div class="lva-phone__input-bar">
            <button class="lva-phone__emoji-btn" @click="showEmoji=!showEmoji">😀</button>
            <input ref="mobileInputRef" v-model="mobileInput" :placeholder="mobilePlaceholder" class="lva-phone__input" @keyup.enter="onMobileSend" />
            <button class="lva-phone__send" @click="onMobileSend">发送</button>
          </div>
          <div v-if="showEmoji" class="lva-phone__emoji-panel">
            <span v-for="e in EMOJIS" :key="e" class="lva-phone__emoji" @click="insertEmoji(e)">{{ e }}</span>
          </div>
        </div>
        <div class="lva-phone__safe-area"><span class="lva-phone__home-bar" /></div>
      </div>
    </div>

    <!-- ===== 小程序端 ===== -->
    <div v-if="platform === 'miniapp'" class="lva-cmt-mobile">
      <div class="lva-miniapp">
        <div class="lva-miniapp__status"><span>{{ currentTime }}</span><span class="lva-miniapp__capsule">···</span></div>
        <div class="lva-miniapp__navbar"><span class="lva-miniapp__back">‹</span><span>评论 ({{ totalCount }})</span><span class="lva-miniapp__dots">•••</span></div>
        <div class="lva-miniapp__scroll">
          <div v-for="c in comments" :key="c.id" class="lva-cmt-mp__item">
            <div class="lva-cmt-mp__avatar" :style="{background:c.avatarColor}">{{ c.username.slice(0,1).toUpperCase() }}</div>
            <div class="lva-cmt-mp__body">
              <div class="lva-cmt-mp__top"><strong>{{ c.username }}</strong><span>{{ c.timeAgo }}</span></div>
              <div class="lva-cmt-mp__text">{{ c.content }}</div>
              <div class="lva-cmt-mp__footer">
                <span :class="{liked:c.liked}" @click="onLike(c)">❤️ {{ c.likeCount }}</span>
                <span @click="onReply(c)">回复</span>
              </div>
              <div v-if="c.children.length" class="lva-cmt-mp__replies">
                <div v-for="item in flattenReplies(c.children)" :key="item.comment.id" class="lva-cmt-mp__reply-row" @click="onReply(item.comment)">
                  <span class="lva-cmt-mp__reply-name">{{ item.comment.username }}</span>
                  <span v-if="item.comment.replyTo"> 回复 <span class="lva-cmt-mp__reply-name">@{{ item.comment.replyTo }}</span></span>
                  ：{{ item.comment.content }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 底部回复面板 -->
        <div class="lva-miniapp__reply-panel">
          <div v-if="replyingTo" class="lva-miniapp__reply-hint">
            <span>回复 @{{ replyingTo.username }}</span>
            <span class="lva-miniapp__reply-cancel" @click="cancelReply">✕</span>
          </div>
          <div class="lva-miniapp__input-bar">
            <button class="lva-miniapp__emoji-btn" @click="showEmoji=!showEmoji">😀</button>
            <input v-model="mobileInput" :placeholder="mobilePlaceholder" class="lva-miniapp__input" @keyup.enter="onMobileSend" />
            <button class="lva-miniapp__send" @click="onMobileSend">发送</button>
          </div>
          <div v-if="showEmoji" class="lva-miniapp__emoji-panel">
            <span v-for="e in EMOJIS" :key="e" class="lva-miniapp__emoji" @click="insertEmoji(e)">{{ e }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-comment-page { padding: 16px; }
/* PC */
.lva-cmt-pc { max-width: 800px; }
.lva-cmt-pc h3 { margin: 0 0 16px; font-size: 18px; color: #333; }
.lva-cmt-pc__input-box { display: flex; gap: 12px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0; }
.lva-cmt-pc__input-wrap { flex: 1; position: relative; }
.lva-cmt-pc__textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; resize: vertical; font-size: 14px; box-sizing: border-box; }
.lva-cmt-pc__textarea--sm { font-size: 13px; }
.lva-cmt-pc__textarea:focus { border-color: #16baaa; outline: none; }
.lva-cmt-pc__toolbar { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.lva-cmt-pc__emoji-trigger { cursor: pointer; font-size: 13px; color: #888; user-select: none; padding: 4px 8px; border-radius: 4px; }
.lva-cmt-pc__emoji-trigger:hover { background: #f5f5f5; }
.lva-cmt-pc__emoji-panel { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; margin-top: 6px; max-width: 320px; }
.lva-cmt-pc__emoji { cursor: pointer; font-size: 20px; padding: 4px; border-radius: 4px; transition: background 0.15s; }
.lva-cmt-pc__emoji:hover { background: #f0f0f0; }
.lva-cmt-pc__list { display: flex; flex-direction: column; }
.lva-cmt-pc__item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f5f5f5; }
.lva-cmt-pc__item:last-child { border-bottom: none; }
.lva-cmt-pc__item--child { padding: 8px 0; border-bottom: none; }
.lva-cmt-pc__avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 600; flex-shrink: 0; }
.lva-cmt-pc__avatar--sm { width: 30px; height: 30px; font-size: 12px; }
.lva-cmt-pc__body { flex: 1; min-width: 0; }
.lva-cmt-pc__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
.lva-cmt-pc__meta strong { font-size: 14px; color: #333; }
.lva-cmt-pc__meta span { font-size: 12px; color: #bbb; }
.lva-cmt-pc__meta .reply-tag { color: #16baaa !important; }
.lva-cmt-pc__content { font-size: 14px; color: #555; line-height: 1.6; }
.lva-cmt-pc__actions { display: flex; gap: 16px; margin-top: 6px; font-size: 13px; color: #999; }
.lva-cmt-pc__actions span { cursor: pointer; display: flex; align-items: center; gap: 4px; transition: color 0.2s; }
.lva-cmt-pc__actions span:hover { color: #16baaa; }
.lva-cmt-pc__actions .liked { color: #ff5722; }
.lva-cmt-pc__actions .del:hover { color: #ff5722; }
.lva-cmt-pc__reply-box { margin-top: 8px; }
.lva-cmt-pc__reply-actions { display: flex; gap: 8px; margin-top: 6px; }
.lva-cmt-pc__children { margin-top: 8px; padding-left: 8px; border-left: 2px solid #f0f0f0; }
/* H5 */
.lva-cmt-mobile { display: flex; justify-content: center; padding: 20px 0; }
.lva-phone { width: 390px; border-radius: 36px; background: #1a1a1a; padding: 6px; box-shadow: 0 12px 40px rgba(0,0,0,.18); overflow: hidden; display: flex; flex-direction: column; }
.lva-phone__status { display: flex; justify-content: space-between; align-items: center; padding: 8px 24px 4px; color: #fff; font-size: 14px; font-weight: 600; }
.lva-phone__battery { display: inline-block; width: 22px; height: 11px; border: 1px solid #fff; border-radius: 3px; position: relative; }
.lva-phone__battery::after { content: ''; position: absolute; top: 3px; right: -3px; width: 2px; height: 5px; background: #fff; border-radius: 0 1px 1px 0; }
.lva-phone__battery-fill { display: block; width: 80%; height: 100%; background: #4ade80; border-radius: 2px; }
.lva-phone__navbar { padding: 12px 16px; background: #222; color: #fff; font-size: 17px; font-weight: 600; text-align: center; }
.lva-phone__scroll { flex: 1; min-height: 400px; max-height: 460px; background: #111; overflow-y: auto; padding: 12px; }
.lva-phone__reply-panel { background: #222; }
.lva-phone__reply-hint { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #2a2a2a; font-size: 12px; color: #16baaa; }
.lva-phone__reply-cancel { cursor: pointer; color: #999; font-size: 16px; }
.lva-phone__input-bar { display: flex; gap: 8px; padding: 10px 12px; align-items: center; }
.lva-phone__emoji-btn { background: none; border: none; font-size: 22px; cursor: pointer; padding: 4px; }
.lva-phone__input { flex: 1; padding: 8px 12px; border-radius: 18px; border: none; background: #333; color: #eee; font-size: 14px; outline: none; }
.lva-phone__send { padding: 8px 16px; border-radius: 18px; background: #16baaa; color: #fff; border: none; font-size: 13px; cursor: pointer; }
.lva-phone__emoji-panel { display: flex; flex-wrap: wrap; gap: 2px; padding: 8px 12px; background: #2a2a2a; }
.lva-phone__emoji { cursor: pointer; font-size: 22px; padding: 4px; border-radius: 4px; }
.lva-phone__emoji:hover { background: #333; }
.lva-phone__safe-area { padding: 6px 0 10px; text-align: center; background: #222; }
.lva-phone__home-bar { display: block; width: 130px; height: 4px; background: #fff; border-radius: 2px; margin: 0 auto; }
.lva-cmt-h5__item { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
.lva-cmt-h5__avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 600; flex-shrink: 0; }
.lva-cmt-h5__body { flex: 1; min-width: 0; }
.lva-cmt-h5__top { display: flex; justify-content: space-between; }
.lva-cmt-h5__top strong { color: #eee; font-size: 13px; }
.lva-cmt-h5__top span { color: #666; font-size: 11px; }
.lva-cmt-h5__text { color: #ccc; font-size: 13px; margin-top: 4px; line-height: 1.5; }
.lva-cmt-h5__footer { display: flex; gap: 16px; margin-top: 6px; font-size: 12px; color: #888; }
.lva-cmt-h5__footer span { cursor: pointer; }
.lva-cmt-h5__footer .liked { color: #ff5722; }
.lva-cmt-h5__replies { margin-top: 8px; padding: 8px 10px; background: #1a1a2e; border-radius: 6px; font-size: 12px; color: #aaa; line-height: 1.8; }
.lva-cmt-h5__reply { margin-bottom: 4px; cursor: pointer; }
.lva-cmt-h5__reply:hover { color: #16baaa; }
.lva-cmt-h5__reply strong { color: #16baaa; }
.lva-cmt-h5__at { color: #16baaa; }
/* 小程序 */
.lva-miniapp { width: 375px; border-radius: 20px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.12); overflow: hidden; display: flex; flex-direction: column; }
.lva-miniapp__status { display: flex; justify-content: space-between; align-items: center; padding: 6px 16px; background: #ededed; font-size: 12px; color: #333; }
.lva-miniapp__capsule { background: rgba(0,0,0,.08); padding: 2px 10px; border-radius: 12px; font-size: 14px; }
.lva-miniapp__navbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #fff; border-bottom: 1px solid #f0f0f0; font-size: 17px; font-weight: 600; }
.lva-miniapp__back { font-size: 22px; color: #333; cursor: pointer; width: 30px; }
.lva-miniapp__dots { font-size: 18px; color: #999; width: 30px; text-align: right; }
.lva-miniapp__scroll { flex: 1; min-height: 380px; max-height: 420px; overflow-y: auto; padding: 12px; background: #f6f6f6; }
.lva-miniapp__reply-panel { background: #fff; border-top: 1px solid #eee; }
.lva-miniapp__reply-hint { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #f0faf8; font-size: 12px; color: #07c160; }
.lva-miniapp__reply-cancel { cursor: pointer; color: #999; font-size: 16px; }
.lva-miniapp__input-bar { display: flex; gap: 8px; padding: 10px 12px; align-items: center; }
.lva-miniapp__emoji-btn { background: none; border: none; font-size: 22px; cursor: pointer; padding: 4px; }
.lva-miniapp__input { flex: 1; padding: 8px 12px; border-radius: 18px; border: 1px solid #e5e7eb; font-size: 14px; outline: none; }
.lva-miniapp__input:focus { border-color: #07c160; }
.lva-miniapp__send { padding: 8px 16px; border-radius: 18px; background: #07c160; color: #fff; border: none; font-size: 13px; cursor: pointer; }
.lva-miniapp__emoji-panel { display: flex; flex-wrap: wrap; gap: 2px; padding: 8px 12px; background: #f9f9f9; border-top: 1px solid #eee; }
.lva-miniapp__emoji { cursor: pointer; font-size: 22px; padding: 4px; border-radius: 4px; }
.lva-miniapp__emoji:hover { background: #e8e8e8; }
.lva-cmt-mp__item { display: flex; gap: 10px; padding: 12px; background: #fff; border-radius: 8px; margin-bottom: 10px; }
.lva-cmt-mp__avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 600; flex-shrink: 0; }
.lva-cmt-mp__body { flex: 1; min-width: 0; }
.lva-cmt-mp__top { display: flex; justify-content: space-between; }
.lva-cmt-mp__top strong { color: #333; font-size: 13px; }
.lva-cmt-mp__top span { color: #999; font-size: 11px; }
.lva-cmt-mp__text { color: #555; font-size: 13px; margin-top: 4px; line-height: 1.5; }
.lva-cmt-mp__footer { display: flex; gap: 16px; margin-top: 6px; font-size: 12px; color: #999; }
.lva-cmt-mp__footer span { cursor: pointer; }
.lva-cmt-mp__footer .liked { color: #ff5722; }
.lva-cmt-mp__replies { margin-top: 8px; padding: 8px 10px; background: #f9f9f9; border-radius: 6px; font-size: 12px; color: #666; line-height: 1.8; }
.lva-cmt-mp__reply-row { margin-bottom: 4px; cursor: pointer; }
.lva-cmt-mp__reply-row:hover { color: #07c160; }
.lva-cmt-mp__reply-name { color: #07c160; font-weight: 500; }
</style>
