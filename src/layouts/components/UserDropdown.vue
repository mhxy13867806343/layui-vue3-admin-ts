<script setup lang="ts">
/**
 * UserDropdown —— Header 右侧用户下拉
 *
 * - 个人中心：跳 /profile
 * - 修改密码：跳 /profile/change-password
 * - 退出登录：layer.confirm 二次确认 → useUserStore.logout()
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { layer } from '@layui/layui-vue'
import { useUserStore } from '@/store/modules/user'
import { useT } from '@/locales'

const userStore = useUserStore()
const router = useRouter()
const { t } = useT()

const nickname = computed(() => userStore.userInfo?.nickname ?? t('lock.fallbackName'))

function onProfile(): void {
  void router.push('/profile')
}
function onPwd(): void {
  void router.push('/profile/change-password')
}
function onLogout(): void {
  layer.confirm(t('common.confirm') + '？' + t('layout.logout'), {
    yes: async () => {
      await userStore.logout()
    },
  })
}
</script>

<template>
  <lay-dropdown trigger="click">
    <span class="lva-user-dropdown__trigger">
      <i class="layui-icon layui-icon-username"></i>
      <span class="lva-user-dropdown__name">{{ nickname }}</span>
      <i class="layui-icon layui-icon-down"></i>
    </span>
    <template #content>
      <lay-dropdown-menu>
        <lay-dropdown-menu-item @click="onProfile">{{ t('layout.profile') }}</lay-dropdown-menu-item>
        <lay-dropdown-menu-item @click="onPwd">{{ t('layout.changePwd') }}</lay-dropdown-menu-item>
        <lay-dropdown-menu-item @click="onLogout">{{ t('layout.logout') }}</lay-dropdown-menu-item>
      </lay-dropdown-menu>
    </template>
  </lay-dropdown>
</template>

<style scoped>
.lva-user-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  flex: none;
}
.lva-user-dropdown__trigger:hover {
  background: var(--global-neutral-color-3, #f0f0f0);
}
.lva-user-dropdown__name {
  font-size: 14px;
  white-space: nowrap;
}
</style>
