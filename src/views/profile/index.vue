<script setup lang="ts">
/**
 * 个人中心
 *
 * 展示当前用户基本信息（账号、昵称、邮箱、手机、角色），
 * 简单只读卡片实现，后续可接「编辑资料」接口。
 */
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useT } from '@/locales'

const userStore = useUserStore()
const { t } = useT()

const info = computed(() => userStore.userInfo)
const fields = computed(() => [
  { label: t('auth.username'), value: info.value?.username ?? '-' },
  { label: t('auth.nickname'), value: info.value?.nickname ?? '-' },
  { label: 'Email', value: info.value?.email || '-' },
  { label: 'Phone', value: info.value?.phone || '-' },
  { label: t('user.role'), value: (info.value?.roleCodes ?? []).join(', ') || '-' },
])
</script>

<template>
  <div class="lva-profile">
    <h2 class="lva-profile__title">{{ t('layout.profile') }}</h2>
    <div class="lva-profile__card">
      <div v-for="f in fields" :key="f.label" class="lva-profile__row">
        <span class="lva-profile__label">{{ f.label }}</span>
        <span class="lva-profile__value">{{ f.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-profile { padding: 24px; max-width: 720px; }
.lva-profile__title { margin: 0 0 16px; font-size: 18px; font-weight: 600; }
.lva-profile__card {
  background: var(--global-neutral-color-2, #fff);
  border: 1px solid var(--global-neutral-color-3, #eee);
  border-radius: 6px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lva-profile__row { display: flex; align-items: center; gap: 16px; }
.lva-profile__label { width: 96px; color: #888; font-size: 13px; }
.lva-profile__value { font-size: 14px; color: #222; }
</style>
