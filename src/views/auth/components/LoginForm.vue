<script setup lang="ts">
/**
 * LoginForm —— 登录表单
 *
 * 功能：
 * - 双 Tab 切换：账号密码登录 / 二维码扫码登录
 * - 账号密码模式：账号 + 密码 + 验证码 + 记住密码
 * - 第三方登录入口：微信、钉钉、Gitee、Github
 * - 校验：空值字段级提示；账号正则 `^[A-Za-z0-9_]{4,20}$`；验证码 4 位
 * - 提交：调用 useUserStore.login → 拉取菜单 → 跳转 redirect 或 /dashboard
 * - 失败：layer.msg 后端 message
 * - 超时：登录请求 10s 超时文案
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useT } from '@/locales'
import { layer } from '@layui/layui-vue'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { storage } from '@/utils/storage'

type LoginTab = 'account' | 'qrcode'

interface FormState {
  username: string
  password: string
  captcha: string
  remember: boolean
}

const REMEMBER_KEY = 'login_remember'

// 默认填入演示账号
const form = reactive<FormState>({
  username: 'admin',
  password: '123456',
  captcha: '',
  remember: false,
})
const errors = reactive<{ username: string; password: string; captcha: string }>({
  username: '',
  password: '',
  captcha: '',
})
const submitting = ref(false)
const activeTab = ref<LoginTab>('account')

// 验证码相关
const captchaCode = ref('')
const captchaCanvas = ref<HTMLCanvasElement | null>(null)

// 二维码相关
const qrcodeExpired = ref(false)
let qrcodeTimer: ReturnType<typeof setTimeout> | null = null

const userStore = useUserStore()
const permissionStore = usePermissionStore()
const route = useRoute()
const router = useRouter()
const { t } = useT()

const usernameRegex = /^[A-Za-z0-9_]{4,20}$/

const canSubmit = computed(
  () => form.username.length > 0 && form.password.length > 0 && form.captcha.length > 0 && !submitting.value,
)

// ===== 验证码生成 =====
function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function drawCaptcha(): void {
  captchaCode.value = generateCaptcha()
  const canvas = captchaCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height

  // 背景
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, w, h)

  // 干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(${rand(0, 200)},${rand(0, 200)},${rand(0, 200)},0.5)`
    ctx.beginPath()
    ctx.moveTo(rand(0, w), rand(0, h))
    ctx.lineTo(rand(0, w), rand(0, h))
    ctx.stroke()
  }

  // 干扰点
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(${rand(0, 255)},${rand(0, 255)},${rand(0, 255)},0.8)`
    ctx.fillRect(rand(0, w), rand(0, h), 2, 2)
  }

  // 文字
  const fontSize = 22
  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.textBaseline = 'middle'
  for (let i = 0; i < captchaCode.value.length; i++) {
    const x = 10 + i * 24
    const y = h / 2 + rand(-4, 4)
    ctx.fillStyle = `rgb(${rand(0, 150)},${rand(0, 150)},${rand(0, 150)})`
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(((rand(-15, 15)) * Math.PI) / 180)
    ctx.fillText(captchaCode.value[i], 0, 0)
    ctx.restore()
  }
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function refreshCaptcha(): void {
  drawCaptcha()
  form.captcha = ''
}

// ===== 记住密码 =====
function loadRemembered(): void {
  const saved = storage.get<{ username: string; password: string }>('login_remember')
  if (saved) {
    form.username = saved.username
    form.password = saved.password
    form.remember = true
  }
}

function saveRemembered(): void {
  if (form.remember) {
    storage.set(REMEMBER_KEY, { username: form.username, password: form.password })
  } else {
    storage.remove(REMEMBER_KEY)
  }
}

// ===== 二维码 =====
function startQrcodeTimer(): void {
  qrcodeExpired.value = false
  if (qrcodeTimer) clearTimeout(qrcodeTimer)
  // 模拟 60s 后过期
  qrcodeTimer = setTimeout(() => {
    qrcodeExpired.value = true
  }, 60_000)
}

function refreshQrcode(): void {
  startQrcodeTimer()
}

function onTabChange(tab: LoginTab): void {
  activeTab.value = tab
  if (tab === 'qrcode') {
    startQrcodeTimer()
  }
}

// ===== 校验 =====
function validate(): boolean {
  errors.username = ''
  errors.password = ''
  errors.captcha = ''
  if (!form.username) errors.username = t('validate.usernameRequired')
  else if (!usernameRegex.test(form.username)) errors.username = t('validate.usernameInvalid')
  if (!form.password) errors.password = t('validate.passwordRequired')
  if (!form.captcha) {
    errors.captcha = t('auth.inputCaptcha')
  } else if (form.captcha.toLowerCase() !== captchaCode.value.toLowerCase()) {
    errors.captcha = t('auth.captchaInvalid')
    refreshCaptcha()
  }
  return !errors.username && !errors.password && !errors.captcha
}

// ===== 提交 =====
async function onSubmit(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  const timer = setTimeout(() => {
    if (submitting.value) {
      submitting.value = false
      layer.msg(t('auth.timeout'), { icon: 2 })
    }
  }, 10_000)
  try {
    await userStore.login({ username: form.username, password: form.password })
    saveRemembered()
    const menus = await userStore.fetchUserMenus()
    await permissionStore.generateRoutes(menus.menus, menus.permissions, menus.roles)
    const redirect = (route.query.redirect as string) || '/dashboard'
    await router.replace(redirect)
  } catch {
    refreshCaptcha()
  } finally {
    clearTimeout(timer)
    submitting.value = false
  }
}

// ===== 第三方登录 =====
function onThirdPartyLogin(provider: string): void {
  layer.msg(t('auth.thirdPartyHint'), { icon: 0 })
  // 实际项目中这里跳转 OAuth 授权页
  console.log(`[ThirdParty] ${provider} login triggered`)
}

function goRegister(): void {
  void router.push('/register')
}

onMounted(() => {
  loadRemembered()
  // 延迟绘制验证码，确保 canvas 已挂载
  setTimeout(() => drawCaptcha(), 50)
})
</script>

<template>
  <div class="lva-login-form">
    <!-- Tab 切换：账号 / 二维码 -->
    <div class="lva-login-tabs">
      <span
        :class="['lva-login-tabs__item', { active: activeTab === 'account' }]"
        @click="onTabChange('account')"
      >
        <i class="layui-icon layui-icon-username" />
        {{ t('auth.tabAccount') }}
      </span>
      <span
        :class="['lva-login-tabs__item', { active: activeTab === 'qrcode' }]"
        @click="onTabChange('qrcode')"
      >
        <i class="layui-icon layui-icon-cellphone" />
        {{ t('auth.tabQrcode') }}
      </span>
    </div>

    <!-- 账号密码登录 -->
    <form v-show="activeTab === 'account'" class="lva-login-form__body" @submit.prevent="onSubmit">
      <div class="lva-login-form__field">
        <lay-input
          v-model="form.username"
          :placeholder="t('auth.inputUsername')"
          prefix-icon="layui-icon-username"
          size="lg"
        />
        <p v-if="errors.username" class="lva-login-form__err">{{ errors.username }}</p>
      </div>
      <div class="lva-login-form__field">
        <lay-input
          v-model="form.password"
          type="password"
          password
          :placeholder="t('auth.inputPassword')"
          prefix-icon="layui-icon-password"
          size="lg"
        />
        <p v-if="errors.password" class="lva-login-form__err">{{ errors.password }}</p>
      </div>
      <div class="lva-login-form__field lva-login-form__captcha-row">
        <lay-input
          v-model="form.captcha"
          :placeholder="t('auth.inputCaptcha')"
          prefix-icon="layui-icon-vercode"
          size="lg"
          class="lva-login-form__captcha-input"
        />
        <canvas
          ref="captchaCanvas"
          class="lva-login-form__captcha-img"
          width="110"
          height="38"
          :title="t('auth.captcha')"
          @click="refreshCaptcha"
        />
      </div>
      <p v-if="errors.captcha" class="lva-login-form__err" style="margin-top: -8px">{{ errors.captcha }}</p>

      <div class="lva-login-form__options">
        <label class="lva-login-form__remember">
          <input v-model="form.remember" type="checkbox" />
          {{ t('auth.rememberPassword') }}
        </label>
      </div>

      <lay-button
        type="primary"
        size="lg"
        fluid
        :loading="submitting"
        :disabled="!canSubmit"
        native-type="submit"
      >
        {{ t('auth.submitLogin') }}
      </lay-button>

      <div class="lva-login-form__hint">
        <span>{{ t('auth.presetTip') }}</span>
      </div>

      <!-- 第三方登录 -->
      <div class="lva-login-form__third-party">
        <div class="lva-login-form__divider">
          <span>{{ t('auth.otherLoginMethods') }}</span>
        </div>
        <div class="lva-login-form__providers">
          <div class="lva-login-form__provider" @click="onThirdPartyLogin('wechat')">
            <i class="layui-icon layui-icon-login-wechat" />
            <span>{{ t('auth.wechat') }}</span>
          </div>
          <div class="lva-login-form__provider" @click="onThirdPartyLogin('dingtalk')">
            <i class="layui-icon layui-icon-login-qq" />
            <span>{{ t('auth.dingtalk') }}</span>
          </div>
          <div class="lva-login-form__provider" @click="onThirdPartyLogin('gitee')">
            <i class="layui-icon layui-icon-website" />
            <span>{{ t('auth.gitee') }}</span>
          </div>
          <div class="lva-login-form__provider" @click="onThirdPartyLogin('github')">
            <i class="layui-icon layui-icon-github" />
            <span>{{ t('auth.github') }}</span>
          </div>
        </div>
      </div>

      <div class="lva-login-form__footer">
        <a class="lva-login-form__link" @click="goRegister">{{ t('auth.toRegister') }}</a>
      </div>
    </form>

    <!-- 二维码登录 -->
    <div v-show="activeTab === 'qrcode'" class="lva-login-form__qrcode">
      <h3 class="lva-login-form__qrcode-title">{{ t('auth.qrcodeTitle') }}</h3>
      <div class="lva-login-form__qrcode-box">
        <div class="lva-login-form__qrcode-placeholder">
          <!-- 模拟二维码图案 -->
          <svg viewBox="0 0 200 200" width="180" height="180">
            <rect x="10" y="10" width="60" height="60" fill="#333" rx="4" />
            <rect x="15" y="15" width="50" height="50" fill="#fff" rx="2" />
            <rect x="22" y="22" width="36" height="36" fill="#333" rx="2" />
            <rect x="130" y="10" width="60" height="60" fill="#333" rx="4" />
            <rect x="135" y="15" width="50" height="50" fill="#fff" rx="2" />
            <rect x="142" y="22" width="36" height="36" fill="#333" rx="2" />
            <rect x="10" y="130" width="60" height="60" fill="#333" rx="4" />
            <rect x="15" y="135" width="50" height="50" fill="#fff" rx="2" />
            <rect x="22" y="142" width="36" height="36" fill="#333" rx="2" />
            <!-- 中间随机点阵 -->
            <rect x="85" y="10" width="10" height="10" fill="#333" />
            <rect x="100" y="25" width="10" height="10" fill="#333" />
            <rect x="85" y="40" width="10" height="10" fill="#333" />
            <rect x="110" y="45" width="10" height="10" fill="#333" />
            <rect x="85" y="85" width="10" height="10" fill="#333" />
            <rect x="100" y="95" width="10" height="10" fill="#333" />
            <rect x="115" y="85" width="10" height="10" fill="#333" />
            <rect x="130" y="100" width="10" height="10" fill="#333" />
            <rect x="145" y="115" width="10" height="10" fill="#333" />
            <rect x="160" y="95" width="10" height="10" fill="#333" />
            <rect x="85" y="130" width="10" height="10" fill="#333" />
            <rect x="100" y="145" width="10" height="10" fill="#333" />
            <rect x="115" y="130" width="10" height="10" fill="#333" />
            <rect x="130" y="145" width="10" height="10" fill="#333" />
            <rect x="145" y="160" width="10" height="10" fill="#333" />
            <rect x="160" y="145" width="10" height="10" fill="#333" />
            <rect x="175" y="130" width="10" height="10" fill="#333" />
            <rect x="10" y="95" width="10" height="10" fill="#333" />
            <rect x="30" y="100" width="10" height="10" fill="#333" />
            <rect x="50" y="85" width="10" height="10" fill="#333" />
          </svg>
        </div>
        <!-- 过期遮罩 -->
        <div v-if="qrcodeExpired" class="lva-login-form__qrcode-expired" @click="refreshQrcode">
          <i class="layui-icon layui-icon-refresh" />
          <p>{{ t('auth.qrcodeExpired') }}</p>
          <span>{{ t('auth.qrcodeRefresh') }}</span>
        </div>
      </div>
      <p class="lva-login-form__qrcode-hint">{{ t('auth.qrcodeHint') }}</p>
    </div>
  </div>
</template>

<style scoped>
.lva-login-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ===== Tabs ===== */
.lva-login-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}
.lva-login-tabs__item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.lva-login-tabs__item.active {
  color: var(--global-primary-color, #16baaa);
  border-bottom-color: var(--global-primary-color, #16baaa);
}
.lva-login-tabs__item:hover {
  color: var(--global-primary-color, #16baaa);
}

/* ===== Form Body ===== */
.lva-login-form__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.lva-login-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lva-login-form__err {
  font-size: 12px;
  color: #ff5722;
  margin: 0;
}

/* ===== Captcha ===== */
.lva-login-form__captcha-row {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
.lva-login-form__captcha-input {
  flex: 1;
}
.lva-login-form__captcha-img {
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  height: 38px;
  flex-shrink: 0;
}

/* ===== Options ===== */
.lva-login-form__options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.lva-login-form__remember {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}
.lva-login-form__remember input[type="checkbox"] {
  accent-color: var(--global-primary-color, #16baaa);
}

/* ===== Hint ===== */
.lva-login-form__hint {
  font-size: 12px;
  color: #888;
}

/* ===== Third Party ===== */
.lva-login-form__third-party {
  margin-top: 4px;
}
.lva-login-form__divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 12px;
  color: #999;
}
.lva-login-form__divider::before,
.lva-login-form__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e8e8e8;
}
.lva-login-form__providers {
  display: flex;
  justify-content: center;
  gap: 24px;
}
.lva-login-form__provider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}
.lva-login-form__provider:hover {
  transform: scale(1.1);
}
.lva-login-form__provider i {
  font-size: 28px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
  color: #555;
  transition: all 0.2s;
}
.lva-login-form__provider:nth-child(1) i { color: #07c160; }
.lva-login-form__provider:nth-child(2) i { color: #3296fa; }
.lva-login-form__provider:nth-child(3) i { color: #c71d23; }
.lva-login-form__provider:nth-child(4) i { color: #24292f; }
.lva-login-form__provider:hover i {
  background: var(--global-primary-color, #16baaa);
  color: #fff;
}
.lva-login-form__provider span {
  font-size: 12px;
  color: #666;
}

/* ===== Footer ===== */
.lva-login-form__footer {
  display: flex;
  gap: 6px;
  font-size: 13px;
}
.lva-login-form__link {
  color: var(--global-primary-color, #16baaa);
  cursor: pointer;
}
.lva-login-form__link:hover {
  text-decoration: underline;
}

/* ===== QR Code ===== */
.lva-login-form__qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}
.lva-login-form__qrcode-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 20px;
  color: #333;
}
.lva-login-form__qrcode-box {
  position: relative;
  width: 200px;
  height: 200px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.lva-login-form__qrcode-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}
.lva-login-form__qrcode-expired {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}
.lva-login-form__qrcode-expired i {
  font-size: 32px;
  color: var(--global-primary-color, #16baaa);
}
.lva-login-form__qrcode-expired p {
  margin: 0;
  font-size: 14px;
  color: #666;
}
.lva-login-form__qrcode-expired span {
  font-size: 12px;
  color: var(--global-primary-color, #16baaa);
}
.lva-login-form__qrcode-hint {
  margin-top: 16px;
  font-size: 13px;
  color: #999;
}

/* ===== Dark mode ===== */
:root.layui-theme-dark .lva-login-tabs {
  border-bottom-color: #3a3a3a;
}
:root.layui-theme-dark .lva-login-form__captcha-img {
  border-color: #3a3a3a;
}
:root.layui-theme-dark .lva-login-form__divider::before,
:root.layui-theme-dark .lva-login-form__divider::after {
  background: #3a3a3a;
}
:root.layui-theme-dark .lva-login-form__provider i {
  background: #2a2a2a;
}
:root.layui-theme-dark .lva-login-form__qrcode-box {
  border-color: #3a3a3a;
}
:root.layui-theme-dark .lva-login-form__qrcode-expired {
  background: rgba(30, 30, 30, 0.95);
}
</style>
