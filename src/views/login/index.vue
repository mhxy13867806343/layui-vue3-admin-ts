<script setup lang="ts">
/**
 * Login 页
 *
 * 通过 AuthFrame 注入 LoginForm，模板可由右上角下拉切换。
 * 模板 key 持久化到 localStorage（lva_auth_login_template）。
 */
import { onMounted, ref, watch } from 'vue'
import AuthFrame from '@/views/auth/AuthFrame.vue'
import LoginForm from '@/views/auth/components/LoginForm.vue'
import BrowserDetect from '@/components/BrowserDetect.vue'
import { storage } from '@/utils/storage'
import { DEFAULT_AUTH_TEMPLATE, type AuthTemplateKey } from '@/types/auth-template'

const STORAGE_KEY = 'auth_login_template'

const templateKey = ref<AuthTemplateKey>(DEFAULT_AUTH_TEMPLATE)

onMounted(() => {
  const saved = storage.get<AuthTemplateKey>(STORAGE_KEY)
  if (saved) templateKey.value = saved
})

watch(templateKey, (v) => {
  storage.set(STORAGE_KEY, v)
})
</script>

<template>
  <div>
    <BrowserDetect />
    <AuthFrame v-model:template-key="templateKey" mode="login">
      <template #form>
        <LoginForm />
      </template>
    </AuthFrame>
  </div>
</template>
