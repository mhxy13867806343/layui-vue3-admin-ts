<script setup lang="ts">
/**
 * 系统设置 / system/settings
 *
 * 4 个 tab：
 *   1. 基本设置：系统名称 / Logo URL / 版权信息 / ICP 备案号 / 联系邮箱
 *   2. 安全设置：密码最小长度 / 登录失败锁定次数 / Token 过期时间(分钟) / 是否开启验证码
 *   3. 通知设置：SMTP 服务器 / 端口 / 发件邮箱 / 邮箱密码 / 是否启用邮件通知
 *   4. 存储设置：存储方式 / Bucket / Region / 上传大小限制(MB)
 *
 * 每个 tab 底部独立「保存」按钮，保存成功后弹 layer.msg。
 */
import { onMounted, ref } from 'vue'
import { layer } from '@layui/layui-vue'
import {
  getSettings,
  saveBasicSettings,
  saveNotificationSettings,
  saveSecuritySettings,
  saveStorageSettings,
  type BasicSettings,
  type NotificationSettings,
  type SecuritySettings,
  type StorageSettings,
} from '@/api/settings'

const activeTab = ref('basic')

const basicForm = ref<BasicSettings>({
  systemName: '',
  systemLogo: '',
  copyright: '',
  icp: '',
  contactEmail: '',
})

const securityForm = ref<SecuritySettings>({
  passwordMinLength: 6,
  loginFailLockCount: 5,
  lockDuration: 30,
  sessionTimeout: 120,
  enableCaptcha: true,
})

const notificationForm = ref<NotificationSettings>({
  smtpHost: '',
  smtpPort: 465,
  senderEmail: '',
  senderPassword: '',
  enableSSL: true,
  enableEmail: false,
})

const storageForm = ref<StorageSettings>({
  type: 'local',
  bucket: '',
  region: '',
  uploadSizeLimit: 10,
})

const loading = ref(false)

async function loadSettings(): Promise<void> {
  loading.value = true
  try {
    const data = await getSettings()
    basicForm.value = { ...data.basic }
    securityForm.value = { ...data.security }
    notificationForm.value = { ...data.notification }
    storageForm.value = { ...data.storage }
  } catch { /* silent */ }
  finally { loading.value = false }
}

async function onSaveBasic(): Promise<void> {
  try {
    await saveBasicSettings(basicForm.value)
    layer.msg('保存成功', { icon: 1 })
  } catch { /* silent */ }
}

async function onSaveSecurity(): Promise<void> {
  try {
    await saveSecuritySettings(securityForm.value)
    layer.msg('保存成功', { icon: 1 })
  } catch { /* silent */ }
}

async function onSaveNotification(): Promise<void> {
  try {
    await saveNotificationSettings(notificationForm.value)
    layer.msg('保存成功', { icon: 1 })
  } catch { /* silent */ }
}

async function onSaveStorage(): Promise<void> {
  try {
    await saveStorageSettings(storageForm.value)
    layer.msg('保存成功', { icon: 1 })
  } catch { /* silent */ }
}

const storageOptions = [
  { label: '本地存储', value: 'local' },
  { label: '阿里云 OSS', value: 'aliyun-oss' },
  { label: '腾讯云 COS', value: 'tencent-cos' },
]

onMounted(() => { void loadSettings() })
</script>

<template>
  <div class="lva-settings-page" v-loading="loading">
    <lay-tab v-model="activeTab">
      <!-- ==== 基本设置 ==== -->
      <lay-tab-item title="基本设置" id="basic">
        <div class="lva-settings-page__form">
          <lay-form :model="basicForm" label-width="120">
            <lay-form-item label="系统名称">
              <lay-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
            </lay-form-item>
            <lay-form-item label="Logo URL">
              <lay-input v-model="basicForm.systemLogo" placeholder="Logo 图片地址" />
            </lay-form-item>
            <lay-form-item label="版权信息">
              <lay-input v-model="basicForm.copyright" placeholder="如 Copyright © 2024 ..." />
            </lay-form-item>
            <lay-form-item label="ICP 备案号">
              <lay-input v-model="basicForm.icp" placeholder="如 京ICP备12345678号" />
            </lay-form-item>
            <lay-form-item label="联系邮箱">
              <lay-input v-model="basicForm.contactEmail" placeholder="请输入联系邮箱" />
            </lay-form-item>
            <lay-form-item>
              <lay-button type="primary" @click="onSaveBasic">保存</lay-button>
            </lay-form-item>
          </lay-form>
        </div>
      </lay-tab-item>

      <!-- ==== 安全设置 ==== -->
      <lay-tab-item title="安全设置" id="security">
        <div class="lva-settings-page__form">
          <lay-form :model="securityForm" label-width="180">
            <lay-form-item label="密码最小长度">
              <lay-input-number v-model="securityForm.passwordMinLength" :min="4" :max="32" />
            </lay-form-item>
            <lay-form-item label="登录失败锁定次数">
              <lay-input-number v-model="securityForm.loginFailLockCount" :min="1" :max="20" />
            </lay-form-item>
            <lay-form-item label="锁定时长（分钟）">
              <lay-input-number v-model="securityForm.lockDuration" :min="1" :max="1440" />
            </lay-form-item>
            <lay-form-item label="Token 过期时间（分钟）">
              <lay-input-number v-model="securityForm.sessionTimeout" :min="5" :max="10080" />
            </lay-form-item>
            <lay-form-item label="是否开启验证码">
              <lay-switch v-model="securityForm.enableCaptcha" />
            </lay-form-item>
            <lay-form-item>
              <lay-button type="primary" @click="onSaveSecurity">保存</lay-button>
            </lay-form-item>
          </lay-form>
        </div>
      </lay-tab-item>

      <!-- ==== 通知设置 ==== -->
      <lay-tab-item title="通知设置" id="notification">
        <div class="lva-settings-page__form">
          <lay-form :model="notificationForm" label-width="160">
            <lay-form-item label="SMTP 服务器">
              <lay-input v-model="notificationForm.smtpHost" placeholder="如 smtp.example.com" />
            </lay-form-item>
            <lay-form-item label="SMTP 端口">
              <lay-input-number v-model="notificationForm.smtpPort" :min="1" :max="65535" />
            </lay-form-item>
            <lay-form-item label="发件邮箱">
              <lay-input v-model="notificationForm.senderEmail" placeholder="请输入发件邮箱" />
            </lay-form-item>
            <lay-form-item label="邮箱密码">
              <lay-input
                v-model="notificationForm.senderPassword"
                type="password"
                placeholder="邮件密码或授权码"
              />
            </lay-form-item>
            <lay-form-item label="是否启用 SSL">
              <lay-switch v-model="notificationForm.enableSSL" />
            </lay-form-item>
            <lay-form-item label="是否启用邮件通知">
              <lay-switch v-model="notificationForm.enableEmail" />
            </lay-form-item>
            <lay-form-item>
              <lay-button type="primary" @click="onSaveNotification">保存</lay-button>
            </lay-form-item>
          </lay-form>
        </div>
      </lay-tab-item>

      <!-- ==== 存储设置 ==== -->
      <lay-tab-item title="存储设置" id="storage">
        <div class="lva-settings-page__form">
          <lay-form :model="storageForm" label-width="160">
            <lay-form-item label="存储方式">
              <lay-select v-model="storageForm.type" style="width: 240px">
                <lay-select-option
                  v-for="opt in storageOptions"
                  :key="opt.value"
                  :value="opt.value"
                  :label="opt.label"
                />
              </lay-select>
            </lay-form-item>
            <lay-form-item label="Bucket 名称">
              <lay-input v-model="storageForm.bucket" placeholder="请输入 Bucket 名称" />
            </lay-form-item>
            <lay-form-item label="Region">
              <lay-input v-model="storageForm.region" placeholder="如 cn-hangzhou / ap-shanghai" />
            </lay-form-item>
            <lay-form-item label="上传大小限制（MB）">
              <lay-input-number v-model="storageForm.uploadSizeLimit" :min="1" :max="10240" />
            </lay-form-item>
            <lay-form-item>
              <lay-button type="primary" @click="onSaveStorage">保存</lay-button>
            </lay-form-item>
          </lay-form>
        </div>
      </lay-tab-item>
    </lay-tab>
  </div>
</template>

<style scoped>
.lva-settings-page { display: flex; flex-direction: column; }
.lva-settings-page__form { max-width: 640px; padding: 20px 0; }
</style>
