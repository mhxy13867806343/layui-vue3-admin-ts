<script setup lang="ts">
/**
 * Register 页
 *
 * 复用 AuthFrame，模板列表与登录页一致，但持久化使用独立 key。
 */
import { onMounted, ref, watch } from 'vue'
import AuthFrame from '@/views/auth/AuthFrame.vue'
import RegisterForm from '@/views/auth/components/RegisterForm.vue'
import { storage } from '@/utils/storage'
import { DEFAULT_AUTH_TEMPLATE, type AuthTemplateKey } from '@/types/auth-template'

const STORAGE_KEY = 'auth_register_template'

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
  <AuthFrame v-model:template-key="templateKey" mode="register">
    <template #form>
      <RegisterForm />
    </template>
  </AuthFrame>
</template>
