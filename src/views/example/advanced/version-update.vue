<template>
  <div class="version-update-page">
    <lay-row :space="16">
      <lay-col :md="12">
        <!-- Current Version -->
        <lay-card>
          <template #title>当前版本</template>
          <div class="version-current">
            <div class="version-badge">{{ currentVersion }}</div>
            <div class="version-info">
              <p>发布日期：{{ currentReleaseDate }}</p>
              <p>运行环境：Vue 3 + TypeScript + Vite</p>
            </div>
          </div>
        </lay-card>

        <!-- Update Available -->
        <lay-card style="margin-top: 16px">
          <template #title>可用更新</template>
          <div v-if="!isUpdating && !updateComplete" class="update-available">
            <div class="update-header">
              <span class="update-version">{{ newVersion }}</span>
              <lay-tag type="warm">新版本</lay-tag>
            </div>
            <p class="update-size">安装包大小：{{ packageSize }}</p>
            <div class="update-notes">
              <h4>更新内容：</h4>
              <ul>
                <li v-for="(note, idx) in releaseNotes" :key="idx">{{ note }}</li>
              </ul>
            </div>
            <div class="update-actions">
              <lay-button type="primary" @click="startUpdate">检查更新</lay-button>
              <div class="auto-update">
                <span>自动更新：</span>
                <lay-switch v-model="autoUpdate" />
              </div>
            </div>
          </div>

          <!-- Update Progress -->
          <div v-if="isUpdating" class="update-progress">
            <div class="progress-header">
              <span class="progress-step">{{ currentStepLabel }}</span>
              <span class="progress-speed">{{ downloadSpeed }}</span>
            </div>
            <lay-progress :percent="progress" :show-text="true" color="#16baaa" />
            <div class="progress-steps">
              <span v-for="(step, idx) in steps" :key="idx" :class="['step-item', { active: idx <= currentStep, done: idx < currentStep }]">
                <i :class="idx < currentStep ? 'layui-icon layui-icon-ok-circle' : 'layui-icon layui-icon-circle'" />
                {{ step.label }}
              </span>
            </div>
          </div>

          <!-- Update Complete -->
          <div v-if="updateComplete" class="update-complete">
            <i class="layui-icon layui-icon-ok-circle complete-icon" />
            <h3>更新完成！</h3>
            <p>已成功更新到 {{ newVersion }}</p>
            <lay-button type="primary" @click="resetUpdate">确定</lay-button>
          </div>
        </lay-card>
      </lay-col>

      <lay-col :md="12">
        <!-- Version History -->
        <lay-card>
          <template #title>版本历史</template>
          <lay-timeline>
            <lay-timeline-item v-for="(item, idx) in versionHistory" :key="idx" :title="item.version" :simple="false">
              <div class="timeline-content">
                <span class="timeline-date">{{ item.date }}</span>
                <ul class="timeline-changes">
                  <li v-for="(change, cIdx) in item.changes" :key="cIdx">{{ change }}</li>
                </ul>
              </div>
            </lay-timeline-item>
          </lay-timeline>
        </lay-card>
      </lay-col>
    </lay-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentVersion = ref('v1.0.0')
const currentReleaseDate = ref('2024-01-15')
const newVersion = ref('v1.1.0')
const packageSize = ref('12.5 MB')
const autoUpdate = ref(false)

const releaseNotes = ref([
  '新增 Three.js 多场景演示',
  '新增版本更新页面',
  '新增反馈系统（弹窗/表单/向导）',
  '优化登录页浏览器检测',
  '修复若干已知问题',
])

const steps = ref([
  { label: '下载中', duration: 2000 },
  { label: '解压中', duration: 1500 },
  { label: '安装中', duration: 2000 },
  { label: '完成', duration: 500 },
])

const isUpdating = ref(false)
const updateComplete = ref(false)
const progress = ref(0)
const currentStep = ref(0)
const downloadSpeed = ref('')

const currentStepLabel = ref('')

const versionHistory = ref([
  {
    version: 'v1.0.0',
    date: '2024-01-15',
    changes: ['项目初始化', '基础框架搭建', '用户/角色/菜单管理', '权限系统'],
  },
  {
    version: 'v0.9.0',
    date: '2023-12-20',
    changes: ['Dashboard 仪表盘', 'ECharts 图表集成', '暗黑模式支持'],
  },
  {
    version: 'v0.8.0',
    date: '2023-11-10',
    changes: ['登录/注册页面', '多模板切换', '验证码功能', '记住密码'],
  },
  {
    version: 'v0.7.0',
    date: '2023-10-05',
    changes: ['路由权限控制', '动态菜单加载', '面包屑导航'],
  },
  {
    version: 'v0.6.0',
    date: '2023-09-01',
    changes: ['国际化支持', '主题切换', '水印功能'],
  },
])

function startUpdate() {
  isUpdating.value = true
  updateComplete.value = false
  progress.value = 0
  currentStep.value = 0
  currentStepLabel.value = steps.value[0].label
  downloadSpeed.value = ''
  runStep(0)
}

function runStep(stepIdx: number) {
  if (stepIdx >= steps.value.length) {
    isUpdating.value = false
    updateComplete.value = true
    return
  }

  currentStep.value = stepIdx
  currentStepLabel.value = steps.value[stepIdx].label

  const stepDuration = steps.value[stepIdx].duration
  const stepProgress = 100 / steps.value.length
  const startProgress = stepIdx * stepProgress
  const endProgress = (stepIdx + 1) * stepProgress
  const interval = 50
  const increments = stepDuration / interval
  const progressPerTick = (endProgress - startProgress) / increments

  let tick = 0
  const timer = setInterval(() => {
    tick++
    progress.value = Math.min(Math.round(startProgress + progressPerTick * tick), Math.round(endProgress))

    // Simulate download speed for first step
    if (stepIdx === 0) {
      const speeds = ['2.1 MB/s', '3.4 MB/s', '2.8 MB/s', '4.1 MB/s', '3.6 MB/s']
      downloadSpeed.value = speeds[tick % speeds.length]
    } else {
      downloadSpeed.value = ''
    }

    if (tick >= increments) {
      clearInterval(timer)
      setTimeout(() => runStep(stepIdx + 1), 200)
    }
  }, interval)
}

function resetUpdate() {
  updateComplete.value = false
  currentVersion.value = newVersion.value
  newVersion.value = 'v1.2.0'
  currentReleaseDate.value = new Date().toISOString().split('T')[0]
}
</script>

<style scoped>
.version-update-page {
  padding: 16px;
}

.version-current {
  display: flex;
  align-items: center;
  gap: 20px;
}

.version-badge {
  font-size: 28px;
  font-weight: bold;
  color: #16baaa;
  background: linear-gradient(135deg, #e8f8f5, #d1f2eb);
  padding: 16px 24px;
  border-radius: 12px;
}

.version-info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.update-available {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.update-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.update-version {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.update-size {
  color: #888;
  font-size: 13px;
  margin: 0;
}

.update-notes h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #333;
}

.update-notes ul {
  margin: 0;
  padding-left: 20px;
}

.update-notes li {
  font-size: 13px;
  color: #555;
  line-height: 1.8;
}

.update-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.auto-update {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.update-progress {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-step {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.progress-speed {
  font-size: 13px;
  color: #16baaa;
  font-weight: 500;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
}

.step-item.active {
  color: #16baaa;
}

.step-item.done i {
  color: #16baaa;
}

.update-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
}

.complete-icon {
  font-size: 48px;
  color: #16baaa;
}

.update-complete h3 {
  margin: 0;
  color: #333;
}

.update-complete p {
  margin: 0;
  color: #666;
}

.timeline-content {
  padding: 4px 0;
}

.timeline-date {
  font-size: 12px;
  color: #999;
}

.timeline-changes {
  margin: 4px 0 0;
  padding-left: 16px;
}

.timeline-changes li {
  font-size: 13px;
  color: #555;
  line-height: 1.8;
}
</style>
