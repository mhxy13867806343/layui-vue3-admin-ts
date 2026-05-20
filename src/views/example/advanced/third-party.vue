<script setup lang="ts">
/**
 * 第三方绑定页面
 *
 * 展示第三方账号绑定列表：
 * - 微信、QQ、GitHub、Google、Apple、钉钉
 * - 绑定/解绑操作
 * - 模拟二维码/跳转链接
 */
import { reactive, ref } from 'vue'
import { layer } from '@layui/layui-vue'

interface ThirdPartyAccount {
  key: string
  name: string
  icon: string
  iconColor: string
  bound: boolean
  bindTime?: string
  username?: string
}

const accounts = reactive<ThirdPartyAccount[]>([
  { key: 'wechat', name: '微信', icon: 'layui-icon-login-wechat', iconColor: '#07c160', bound: true, bindTime: '2024-03-15 14:30', username: 'wx_user_***8866' },
  { key: 'qq', name: 'QQ', icon: 'layui-icon-login-qq', iconColor: '#12b7f5', bound: false },
  { key: 'github', name: 'GitHub', icon: 'layui-icon-login-github', iconColor: '#24292f', bound: true, bindTime: '2024-01-20 09:15', username: 'dev-user' },
  { key: 'google', name: 'Google', icon: 'layui-icon-search', iconColor: '#4285f4', bound: false },
  { key: 'apple', name: 'Apple', icon: 'layui-icon-cellphone', iconColor: '#333', bound: false },
  { key: 'dingtalk', name: '钉钉', icon: 'layui-icon-dialogue', iconColor: '#0089ff', bound: true, bindTime: '2024-06-01 16:45', username: '钉钉用户_***2233' },
])

const showQrDialog = ref(false)
const currentBinding = ref<ThirdPartyAccount | null>(null)
const bindingStep = ref<'qr' | 'success'>('qr')

function handleBind(account: ThirdPartyAccount): void {
  currentBinding.value = account
  bindingStep.value = 'qr'
  showQrDialog.value = true
}

function confirmBind(): void {
  if (currentBinding.value) {
    const acc = accounts.find((a) => a.key === currentBinding.value!.key)
    if (acc) {
      acc.bound = true
      acc.bindTime = new Date().toLocaleString()
      acc.username = `${acc.name}_user_***${Math.floor(1000 + Math.random() * 9000)}`
    }
    bindingStep.value = 'success'
    setTimeout(() => {
      showQrDialog.value = false
    }, 1500)
  }
}

function handleUnbind(account: ThirdPartyAccount): void {
  layer.confirm(
    `确定要解绑 ${account.name} 账号吗？解绑后将无法使用该账号登录。`,
    { title: '解绑确认', btn: [{ text: '确定解绑', callback: (id: string) => {
      const acc = accounts.find((a) => a.key === account.key)
      if (acc) {
        acc.bound = false
        acc.bindTime = undefined
        acc.username = undefined
      }
      layer.close(id)
      layer.msg('解绑成功', { icon: 1 })
    }}, { text: '取消' }] },
  )
}
</script>

<template>
  <div class="lva-third-party">
    <h2>第三方账号绑定</h2>
    <p class="lva-third-party__desc">管理您的第三方账号绑定，绑定后可使用对应账号快捷登录。</p>

    <div class="lva-third-party__list">
      <div v-for="account in accounts" :key="account.key" class="lva-third-party__item">
        <div class="lva-third-party__left">
          <i class="layui-icon" :class="account.icon" :style="{ color: account.iconColor, fontSize: '28px' }" />
          <div class="lva-third-party__info">
            <span class="lva-third-party__name">{{ account.name }}</span>
            <span v-if="account.bound" class="lva-third-party__detail">
              已绑定：{{ account.username }} · {{ account.bindTime }}
            </span>
            <span v-else class="lva-third-party__detail lva-third-party__detail--unbound">未绑定</span>
          </div>
        </div>
        <div class="lva-third-party__right">
          <lay-button v-if="account.bound" size="sm" @click="handleUnbind(account)">解绑</lay-button>
          <lay-button v-else size="sm" type="primary" @click="handleBind(account)">绑定</lay-button>
        </div>
      </div>
    </div>

    <!-- 绑定弹窗 -->
    <lay-layer
      v-model="showQrDialog"
      :title="`绑定${currentBinding?.name || ''}`"
      :area="['400px', '420px']"
      :shadeClose="true"
    >
      <div class="lva-third-party__dialog">
        <template v-if="bindingStep === 'qr'">
          <p class="lva-third-party__dialog-tip">请使用 {{ currentBinding?.name }} 扫描下方二维码完成绑定</p>
          <div class="lva-third-party__qr">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <rect width="180" height="180" fill="#fff" stroke="#eee" />
              <g fill="#333">
                <rect x="20" y="20" width="40" height="40" />
                <rect x="120" y="20" width="40" height="40" />
                <rect x="20" y="120" width="40" height="40" />
                <rect x="70" y="20" width="10" height="10" />
                <rect x="90" y="20" width="10" height="10" />
                <rect x="70" y="40" width="10" height="10" />
                <rect x="80" y="50" width="10" height="10" />
                <rect x="100" y="40" width="10" height="10" />
                <rect x="70" y="70" width="10" height="10" />
                <rect x="80" y="80" width="10" height="10" />
                <rect x="90" y="70" width="10" height="10" />
                <rect x="100" y="80" width="10" height="10" />
                <rect x="110" y="70" width="10" height="10" />
                <rect x="20" y="70" width="10" height="10" />
                <rect x="40" y="80" width="10" height="10" />
                <rect x="120" y="70" width="10" height="10" />
                <rect x="140" y="80" width="10" height="10" />
                <rect x="130" y="90" width="10" height="10" />
                <rect x="70" y="100" width="10" height="10" />
                <rect x="90" y="110" width="10" height="10" />
                <rect x="110" y="100" width="10" height="10" />
                <rect x="120" y="120" width="10" height="10" />
                <rect x="140" y="130" width="10" height="10" />
                <rect x="130" y="150" width="10" height="10" />
              </g>
            </svg>
          </div>
          <p class="lva-third-party__dialog-url">
            或访问：<code>https://oauth.example.com/bind/{{ currentBinding?.key }}</code>
          </p>
          <div style="text-align: center; margin-top: 16px;">
            <lay-button type="primary" @click="confirmBind">模拟绑定成功</lay-button>
          </div>
        </template>
        <template v-else>
          <div class="lva-third-party__success">
            <i class="layui-icon layui-icon-ok-circle" style="font-size: 48px; color: #52c41a;" />
            <p>绑定成功！</p>
          </div>
        </template>
      </div>
    </lay-layer>

    <section class="lva-third-party__note">
      <p>💡 本页面演示第三方账号绑定流程，实际项目中需要对接 OAuth 2.0 授权。</p>
    </section>
  </div>
</template>

<style scoped>
.lva-third-party { padding: 4px; }
.lva-third-party h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-third-party__desc { color: #666; font-size: 13px; margin-bottom: 20px; }

.lva-third-party__list {
  background: #fff; border-radius: 8px; border: 1px solid #e8e8e8; overflow: hidden;
}
.lva-third-party__item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #f0f0f0;
}
.lva-third-party__item:last-child { border-bottom: none; }
.lva-third-party__left { display: flex; align-items: center; gap: 14px; }
.lva-third-party__info { display: flex; flex-direction: column; gap: 4px; }
.lva-third-party__name { font-size: 15px; font-weight: 500; }
.lva-third-party__detail { font-size: 12px; color: #999; }
.lva-third-party__detail--unbound { color: #bbb; }

.lva-third-party__dialog { padding: 20px; text-align: center; }
.lva-third-party__dialog-tip { font-size: 13px; color: #666; margin-bottom: 16px; }
.lva-third-party__qr { display: flex; justify-content: center; margin: 16px 0; }
.lva-third-party__dialog-url { font-size: 12px; color: #999; margin-top: 12px; }
.lva-third-party__dialog-url code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 11px; }

.lva-third-party__success { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 0; }
.lva-third-party__success p { font-size: 16px; color: #333; }

.lva-third-party__note {
  background: #fff; padding: 16px 20px; border-radius: 4px; margin-top: 14px;
  font-size: 13px; color: #666;
}
</style>
