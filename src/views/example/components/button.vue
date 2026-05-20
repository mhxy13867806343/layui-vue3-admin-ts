<script setup lang="ts">
/**
 * 示例 - Button 组件
 *
 * 展示 layui-vue 的 lay-button 各种变体:类型、尺寸、图标、加载态、禁用态。
 */
import { ref } from 'vue'

const loading = ref<boolean>(false)
function toggleLoading(): void {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1500)
}
</script>

<template>
  <div class="lva-example">
    <h2 class="lva-example__title">Button 按钮</h2>
    <p class="lva-example__desc">layui-vue 提供的按钮组件,支持多种类型、尺寸、加载态。</p>

    <section class="lva-example__section">
      <h3>类型</h3>
      <div class="lva-example__row">
        <lay-button>默认</lay-button>
        <lay-button type="primary">主要</lay-button>
        <lay-button type="normal">次要</lay-button>
        <lay-button type="warm">警告</lay-button>
        <lay-button type="danger">危险</lay-button>
        <lay-button border="green">绿色</lay-button>
      </div>
    </section>

    <section class="lva-example__section">
      <h3>尺寸</h3>
      <div class="lva-example__row">
        <lay-button type="primary" size="lg">大号</lay-button>
        <lay-button type="primary">默认</lay-button>
        <lay-button type="primary" size="sm">小号</lay-button>
        <lay-button type="primary" size="xs">迷你</lay-button>
      </div>
    </section>

    <section class="lva-example__section">
      <h3>加载态 / 禁用</h3>
      <div class="lva-example__row">
        <lay-button type="primary" :loading="loading" @click="toggleLoading">
          点击触发加载
        </lay-button>
        <lay-button type="primary" loading>持续加载</lay-button>
        <lay-button disabled>禁用</lay-button>
      </div>
    </section>

    <section class="lva-example__section">
      <h3>圆角 / 圆形</h3>
      <div class="lva-example__row">
        <lay-button type="primary" radius>圆角按钮</lay-button>
        <lay-button type="primary" round>
          <i class="layui-icon layui-icon-search"></i>
        </lay-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lva-example { padding: 4px; }
.lva-example__title { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-example__desc { color: #666; font-size: 13px; margin-bottom: 18px; }
.lva-example__section {
  background: #fff;
  padding: 16px 20px;
  border-radius: 4px;
  margin-bottom: 14px;
}
.lva-example__section h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
}
.lva-example__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
</style>
