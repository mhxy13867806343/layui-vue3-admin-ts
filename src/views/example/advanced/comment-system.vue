<script setup lang="ts">
/**
 * 多端评论系统 / advanced/comment-system
 *
 * 支持多级嵌套回复的评论组件，三端预览：PC / H5(APP) / 小程序
 * - 多级嵌套（最多3层缩进，超过3层平铺显示 @回复人）
 * - 点赞、回复、删除
 * - 发表评论输入框
 * - 时间显示、头像、用户名
 */
import { ref, computed } from 'vue'
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

const comments = ref<Comment[]>([
  {
    id: 1, parentId: null, replyTo: null, username: 'admin', avatarColor: '#16baaa',
    content: '这个项目做得不错，功能很全面！特别是权限管理和多模板登录页的设计。',
    time: '2026-05-21 14:00', timeAgo: '30 分钟前', liked: true, likeCount: 12,
    children: [
      {
        id: 2, parentId: 1, replyTo: null, username: 'alice', avatarColor: '#a855f7',
        content: '同意！Three.js 的演示也很酷，5个场景切换很流畅。',
        time: '2026-05-21 14:10', timeAgo: '20 分钟前', liked: false, likeCount: 5,
        children: [
          {
            id: 5, parentId: 2, replyTo: 'alice', username: 'admin', avatarColor: '#16baaa',
            content: '谢谢！后续还会加入更多 3D 场景，比如模型加载和动画编辑器。',
            time: '2026-05-21 14:15', timeAgo: '15 分钟前', liked: false, likeCount: 3,
            children: [
              {
                id: 8, parentId: 5, replyTo: 'admin', username: 'bob', avatarColor: '#f59e0b',
                content: '期待模型加载功能！能支持 glTF 格式吗？',
                time: '2026-05-21 14:20', timeAgo: '10 分钟前', liked: false, likeCount: 1,
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: 3, parentId: 1, replyTo: null, username: 'john', avatarColor: '#1e9fff',
        content: '字典管理和操作日志也很实用，省了不少开发时间。',
        time: '2026-05-21 14:12', timeAgo: '18 分钟前', liked: false, likeCount: 4,
        children: [],
      },
    ],
  },
  {
    id: 4, parentId: null, replyTo: null, username: 'tester', avatarColor: '#ec4899',
    content: '发现一个小问题：在 Firefox 下验证码 canvas 偶尔会闪烁，Chrome 和 Edge 正常。',
    time: '2026-05-21 13:30', timeAgo: '1 小时前', liked: false, likeCount: 2,
    children: [
      {
        id: 6, parentId: 4, replyTo: null, username: 'admin', avatarColor: '#16baaa',
        content: '感谢反馈！已记录 Issue，会在下个版本修复。',
        time: '2026-05-21 13:45', timeAgo: '45 分钟前', liked: true, likeCount: 3,
        children: [],
      },
    ],
  },
  {
    id: 7, parentId: null, replyTo: null, username: 'bob', avatarColor: '#f59e0b',
    content: '请问有计划支持暗黑模式下的图表主题自动切换吗？现在 ECharts 在暗黑模式下文字颜色不太对。',
    time: '2026-05-21 12:00', timeAgo: '2 小时前', liked: false, likeCount: 6,
    children: [],
  },
])

const replyingTo = ref<Comment | null>(null)
const replyContent = ref('')
const newComment = ref('')

function onLike(comment: Comment): void {
  comment.liked = !comment.liked
  comment.likeCount += comment.liked ? 1 : -1
}

function onReply(comment: Comment): void {
  replyingTo.value = comment
  replyContent.value = ''
}

function cancelReply(): void {
  replyingTo.value = null
  replyContent.value = ''
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
  replyingTo.value = null
  replyContent.value = ''
  layer.msg('回复成功', { icon: 1 })
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
  layer.msg('评论成功', { icon: 1 })
}

function onDelete(comment: Comment, parent: Comment | null): void {
  layer.confirm(`确认删除该评论？`, {
    yes: () => {
      if (parent) {
        parent.children = parent.children.filter(c => c.id !== comment.id)
      } else {
        comments.value = comments.value.filter(c => c.id !== comment.id)
      }
      layer.msg('已删除', { icon: 1 })
    },
  })
}

const totalCount = computed(() => {
  let count = 0
  function walk(list: Comment[]): void {
    for (const c of list) { count++; walk(c.children) }
  }
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
      <div class="lva-cmt-pc__header">
        <h3>评论 ({{ totalCount }})</h3>
      </div>
      <!-- 发表评论 -->
      <div class="lva-cmt-pc__input-box">
        <div class="lva-cmt-pc__avatar" style="background:#16baaa">A</div>
        <div class="lva-cmt-pc__input-wrap">
          <textarea v-model="newComment" placeholder="写下你的评论..." rows="3" class="lva-cmt-pc__textarea" />
          <div class="lva-cmt-pc__input-actions">
            <lay-button type="primary" size="sm" @click="submitComment">发表评论</lay-button>
          </div>
        </div>
      </div>
      <!-- 评论列表 -->
      <div class="lva-cmt-pc__list">
        <template v-for="c in comments" :key="c.id">
          <div class="lva-cmt-pc__item">
            <div class="lva-cmt-pc__avatar" :style="{ background: c.avatarColor }">{{ c.username.slice(0,1).toUpperCase() }}</div>
            <div class="lva-cmt-pc__body">
              <div class="lva-cmt-pc__meta"><strong>{{ c.username }}</strong><span>{{ c.timeAgo }}</span></div>
              <div class="lva-cmt-pc__content">{{ c.content }}</div>
              <div class="lva-cmt-pc__actions">
                <span :class="{ liked: c.liked }" @click="onLike(c)"><i class="layui-icon layui-icon-praise" /> {{ c.likeCount }}</span>
                <span @click="onReply(c)"><i class="layui-icon layui-icon-reply-fill" /> 回复</span>
                <span class="del" @click="onDelete(c, null)"><i class="layui-icon layui-icon-delete" /> 删除</span>
              </div>
              <!-- 回复输入框 -->
              <div v-if="replyingTo?.id === c.id" class="lva-cmt-pc__reply-box">
                <textarea v-model="replyContent" :placeholder="`回复 @${c.username}...`" rows="2" class="lva-cmt-pc__textarea lva-cmt-pc__textarea--sm" />
                <div class="lva-cmt-pc__reply-actions">
                  <lay-button type="primary" size="xs" @click="submitReply">回复</lay-button>
                  <lay-button size="xs" @click="cancelReply">取消</lay-button>
                </div>
              </div>
              <!-- 子评论 (递归展示) -->
              <div v-if="c.children.length" class="lva-cmt-pc__children">
                <template v-for="c2 in c.children" :key="c2.id">
                  <div class="lva-cmt-pc__item lva-cmt-pc__item--child">
                    <div class="lva-cmt-pc__avatar lva-cmt-pc__avatar--sm" :style="{ background: c2.avatarColor }">{{ c2.username.slice(0,1).toUpperCase() }}</div>
                    <div class="lva-cmt-pc__body">
                      <div class="lva-cmt-pc__meta"><strong>{{ c2.username }}</strong><span v-if="c2.replyTo" class="lva-cmt-pc__reply-tag">回复 @{{ c2.replyTo }}</span><span>{{ c2.timeAgo }}</span></div>
                      <div class="lva-cmt-pc__content">{{ c2.content }}</div>
                      <div class="lva-cmt-pc__actions">
                        <span :class="{ liked: c2.liked }" @click="onLike(c2)"><i class="layui-icon layui-icon-praise" /> {{ c2.likeCount }}</span>
                        <span @click="onReply(c2)"><i class="layui-icon layui-icon-reply-fill" /> 回复</span>
                        <span class="del" @click="onDelete(c2, c)"><i class="layui-icon layui-icon-delete" /> 删除</span>
                      </div>
                      <div v-if="replyingTo?.id === c2.id" class="lva-cmt-pc__reply-box">
                        <textarea v-model="replyContent" :placeholder="`回复 @${c2.username}...`" rows="2" class="lva-cmt-pc__textarea lva-cmt-pc__textarea--sm" />
                        <div class="lva-cmt-pc__reply-actions"><lay-button type="primary" size="xs" @click="submitReply">回复</lay-button><lay-button size="xs" @click="cancelReply">取消</lay-button></div>
                      </div>
                      <!-- 第三级 -->
                      <div v-if="c2.children.length" class="lva-cmt-pc__children">
                        <div v-for="c3 in c2.children" :key="c3.id" class="lva-cmt-pc__item lva-cmt-pc__item--child">
                          <div class="lva-cmt-pc__avatar lva-cmt-pc__avatar--sm" :style="{ background: c3.avatarColor }">{{ c3.username.slice(0,1).toUpperCase() }}</div>
                          <div class="lva-cmt-pc__body">
                            <div class="lva-cmt-pc__meta"><strong>{{ c3.username }}</strong><span v-if="c3.replyTo" class="lva-cmt-pc__reply-tag">回复 @{{ c3.replyTo }}</span><span>{{ c3.timeAgo }}</span></div>
                            <div class="lva-cmt-pc__content">{{ c3.content }}</div>
                            <div class="lva-cmt-pc__actions">
                              <span :class="{ liked: c3.liked }" @click="onLike(c3)"><i class="layui-icon layui-icon-praise" /> {{ c3.likeCount }}</span>
                              <span @click="onReply(c3)"><i class="layui-icon layui-icon-reply-fill" /> 回复</span>
                            </div>
                            <div v-if="replyingTo?.id === c3.id" class="lva-cmt-pc__reply-box">
                              <textarea v-model="replyContent" :placeholder="`回复 @${c3.username}...`" rows="2" class="lva-cmt-pc__textarea lva-cmt-pc__textarea--sm" />
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
          </div>
        </template>
      </div>
    </div>

    <!-- ===== H5/APP 端 ===== -->
    <div v-if="platform === 'h5'" class="lva-cmt-mobile">
      <div class="lva-phone">
        <div class="lva-phone__status"><span>{{ currentTime }}</span><span class="lva-phone__battery"><span class="lva-phone__battery-fill" /></span></div>
        <div class="lva-phone__navbar"><span>评论 ({{ totalCount }})</span></div>
        <div class="lva-phone__scroll">
          <div v-for="c in comments" :key="c.id" class="lva-cmt-h5__item">
            <div class="lva-cmt-h5__avatar" :style="{ background: c.avatarColor }">{{ c.username.slice(0,1).toUpperCase() }}</div>
            <div class="lva-cmt-h5__body">
              <div class="lva-cmt-h5__top"><strong>{{ c.username }}</strong><span>{{ c.timeAgo }}</span></div>
              <div class="lva-cmt-h5__text">{{ c.content }}</div>
              <div class="lva-cmt-h5__footer">
                <span :class="{ liked: c.liked }" @click="onLike(c)">👍 {{ c.likeCount }}</span>
                <span @click="onReply(c)">💬 回复</span>
              </div>
              <!-- 子评论 -->
              <div v-if="c.children.length" class="lva-cmt-h5__replies">
                <div v-for="c2 in c.children" :key="c2.id" class="lva-cmt-h5__reply">
                  <strong>{{ c2.username }}</strong>
                  <span v-if="c2.replyTo" class="lva-cmt-h5__reply-to"> 回复 @{{ c2.replyTo }}</span>
                  ：{{ c2.content }}
                  <div v-if="c2.children.length" class="lva-cmt-h5__sub-replies">
                    <div v-for="c3 in c2.children" :key="c3.id" class="lva-cmt-h5__reply">
                      <strong>{{ c3.username }}</strong>
                      <span v-if="c3.replyTo" class="lva-cmt-h5__reply-to"> 回复 @{{ c3.replyTo }}</span>
                      ：{{ c3.content }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 底部输入框 -->
        <div class="lva-phone__input-bar">
          <input v-model="newComment" :placeholder="replyingTo ? `回复 @${replyingTo.username}...` : '写评论...'" class="lva-phone__input" @keyup.enter="replyingTo ? submitReply() : submitComment()" />
          <button class="lva-phone__send" @click="replyingTo ? submitReply() : submitComment()">发送</button>
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
            <div class="lva-cmt-mp__avatar" :style="{ background: c.avatarColor }">{{ c.username.slice(0,1).toUpperCase() }}</div>
            <div class="lva-cmt-mp__body">
              <div class="lva-cmt-mp__top"><strong>{{ c.username }}</strong><span>{{ c.timeAgo }}</span></div>
              <div class="lva-cmt-mp__text">{{ c.content }}</div>
              <div class="lva-cmt-mp__footer">
                <span :class="{ liked: c.liked }" @click="onLike(c)">❤️ {{ c.likeCount }}</span>
                <span @click="onReply(c)">回复</span>
              </div>
              <div v-if="c.children.length" class="lva-cmt-mp__replies">
                <div v-for="c2 in c.children" :key="c2.id" class="lva-cmt-mp__reply-item">
                  <span class="lva-cmt-mp__reply-name">{{ c2.username }}</span>
                  <span v-if="c2.replyTo"> 回复 <span class="lva-cmt-mp__reply-name">@{{ c2.replyTo }}</span></span>
                  ：{{ c2.content }}
                  <div v-for="c3 in c2.children" :key="c3.id" class="lva-cmt-mp__reply-item" style="margin-left:12px">
                    <span class="lva-cmt-mp__reply-name">{{ c3.username }}</span>
                    <span v-if="c3.replyTo"> 回复 <span class="lva-cmt-mp__reply-name">@{{ c3.replyTo }}</span></span>
                    ：{{ c3.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="lva-miniapp__input-bar">
          <input v-model="newComment" :placeholder="replyingTo ? `回复 @${replyingTo.username}` : '说点什么...'" class="lva-miniapp__input" @keyup.enter="replyingTo ? submitReply() : submitComment()" />
          <button class="lva-miniapp__send" @click="replyingTo ? submitReply() : submitComment()">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-comment-page { padding: 16px; }
/* ===== PC 端 ===== */
.lva-cmt-pc { max-width: 800px; }
.lva-cmt-pc__header h3 { margin: 0 0 16px; font-size: 18px; color: #333; }
.lva-cmt-pc__input-box { display: flex; gap: 12px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0; }
.lva-cmt-pc__input-wrap { flex: 1; }
.lva-cmt-pc__textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; resize: vertical; font-size: 14px; box-sizing: border-box; }
.lva-cmt-pc__textarea--sm { font-size: 13px; }
.lva-cmt-pc__textarea:focus { border-color: #16baaa; outline: none; }
.lva-cmt-pc__input-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
.lva-cmt-pc__list { display: flex; flex-direction: column; }
.lva-cmt-pc__item { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid #f5f5f5; }
.lva-cmt-pc__item:last-child { border-bottom: none; }
.lva-cmt-pc__item--child { padding: 10px 0; border-bottom: none; }
.lva-cmt-pc__avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 600; flex-shrink: 0; }
.lva-cmt-pc__avatar--sm { width: 32px; height: 32px; font-size: 13px; }
.lva-cmt-pc__body { flex: 1; min-width: 0; }
.lva-cmt-pc__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
.lva-cmt-pc__meta strong { font-size: 14px; color: #333; }
.lva-cmt-pc__meta span { font-size: 12px; color: #bbb; }
.lva-cmt-pc__reply-tag { color: #16baaa !important; font-size: 12px !important; }
.lva-cmt-pc__content { font-size: 14px; color: #555; line-height: 1.6; }
.lva-cmt-pc__actions { display: flex; gap: 16px; margin-top: 8px; font-size: 13px; color: #999; }
.lva-cmt-pc__actions span { cursor: pointer; display: flex; align-items: center; gap: 4px; transition: color 0.2s; }
.lva-cmt-pc__actions span:hover { color: #16baaa; }
.lva-cmt-pc__actions .liked { color: #ff5722; }
.lva-cmt-pc__actions .del:hover { color: #ff5722; }
.lva-cmt-pc__reply-box { margin-top: 10px; }
.lva-cmt-pc__reply-actions { display: flex; gap: 8px; margin-top: 6px; }
.lva-cmt-pc__children { margin-top: 8px; padding-left: 12px; border-left: 2px solid #f0f0f0; }
/* ===== H5/APP 端 ===== */
.lva-cmt-mobile { display: flex; justify-content: center; padding: 20px 0; }
.lva-phone { width: 390px; border-radius: 36px; background: #1a1a1a; padding: 6px; box-shadow: 0 12px 40px rgba(0,0,0,.18); overflow: hidden; display: flex; flex-direction: column; }
.lva-phone__status { display: flex; justify-content: space-between; align-items: center; padding: 8px 24px 4px; color: #fff; font-size: 14px; font-weight: 600; }
.lva-phone__battery { display: inline-block; width: 22px; height: 11px; border: 1px solid #fff; border-radius: 3px; position: relative; }
.lva-phone__battery::after { content: ''; position: absolute; top: 3px; right: -3px; width: 2px; height: 5px; background: #fff; border-radius: 0 1px 1px 0; }
.lva-phone__battery-fill { display: block; width: 80%; height: 100%; background: #4ade80; border-radius: 2px; }
.lva-phone__navbar { padding: 12px 16px; background: #222; color: #fff; font-size: 17px; font-weight: 600; text-align: center; }
.lva-phone__scroll { flex: 1; min-height: 460px; background: #111; overflow-y: auto; padding: 12px; }
.lva-phone__input-bar { display: flex; gap: 8px; padding: 10px 12px; background: #222; }
.lva-phone__input { flex: 1; padding: 8px 12px; border-radius: 18px; border: none; background: #333; color: #eee; font-size: 14px; outline: none; }
.lva-phone__send { padding: 8px 16px; border-radius: 18px; background: #16baaa; color: #fff; border: none; font-size: 13px; cursor: pointer; }
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
.lva-cmt-h5__reply { margin-bottom: 4px; }
.lva-cmt-h5__reply strong { color: #16baaa; }
.lva-cmt-h5__reply-to { color: #16baaa; }
.lva-cmt-h5__sub-replies { margin-left: 12px; margin-top: 4px; }
/* ===== 小程序端 ===== */
.lva-miniapp { width: 375px; border-radius: 20px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.12); overflow: hidden; display: flex; flex-direction: column; }
.lva-miniapp__status { display: flex; justify-content: space-between; align-items: center; padding: 6px 16px; background: #ededed; font-size: 12px; color: #333; }
.lva-miniapp__capsule { background: rgba(0,0,0,.08); padding: 2px 10px; border-radius: 12px; font-size: 14px; }
.lva-miniapp__navbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #fff; border-bottom: 1px solid #f0f0f0; font-size: 17px; font-weight: 600; }
.lva-miniapp__back { font-size: 22px; color: #333; cursor: pointer; width: 30px; }
.lva-miniapp__dots { font-size: 18px; color: #999; width: 30px; text-align: right; }
.lva-miniapp__scroll { flex: 1; min-height: 440px; overflow-y: auto; padding: 12px; background: #f6f6f6; }
.lva-miniapp__input-bar { display: flex; gap: 8px; padding: 10px 12px; background: #fff; border-top: 1px solid #eee; }
.lva-miniapp__input { flex: 1; padding: 8px 12px; border-radius: 18px; border: 1px solid #e5e7eb; font-size: 14px; outline: none; }
.lva-miniapp__input:focus { border-color: #07c160; }
.lva-miniapp__send { padding: 8px 16px; border-radius: 18px; background: #07c160; color: #fff; border: none; font-size: 13px; cursor: pointer; }
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
.lva-cmt-mp__reply-item { margin-bottom: 4px; }
.lva-cmt-mp__reply-name { color: #07c160; font-weight: 500; }
</style>
