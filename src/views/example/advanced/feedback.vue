<template>
  <div class="feedback-page">
    <lay-card>
      <template #title>反馈系统</template>
      <lay-tab v-model="activeMode">
        <lay-tab-item title="弹窗反馈" id="dialog">
          <div class="mode-content">
            <p class="mode-desc">点击按钮打开弹窗，填写反馈信息后提交。</p>
            <lay-button type="primary" @click="openDialog">打开反馈弹窗</lay-button>
            <div v-if="dialogSubmitted" class="submit-result">
              <i class="layui-icon layui-icon-ok-circle" style="color: #16baaa; font-size: 20px" />
              <span>反馈已提交成功！</span>
            </div>
          </div>
        </lay-tab-item>

        <lay-tab-item title="表单反馈" id="form">
          <div class="mode-content">
            <div class="inline-form">
              <div class="form-field">
                <label>标题 <span class="required">*</span></label>
                <lay-input v-model="inlineForm.title" placeholder="请输入反馈标题" />
                <span v-if="inlineErrors.title" class="field-error">{{ inlineErrors.title }}</span>
              </div>
              <div class="form-field">
                <label>分类 <span class="required">*</span></label>
                <lay-select v-model="inlineForm.category" placeholder="请选择分类">
                  <lay-select-option value="bug" label="Bug 缺陷" />
                  <lay-select-option value="feature" label="功能建议" />
                  <lay-select-option value="other" label="其他" />
                </lay-select>
              </div>
              <div class="form-field">
                <label>优先级</label>
                <lay-radio-group v-model="inlineForm.priority">
                  <lay-radio value="high" label="高" />
                  <lay-radio value="medium" label="中" />
                  <lay-radio value="low" label="低" />
                </lay-radio-group>
              </div>
              <div class="form-field">
                <label>详细描述 <span class="required">*</span></label>
                <lay-textarea v-model="inlineForm.description" placeholder="请详细描述您的反馈" :rows="4" />
                <span v-if="inlineErrors.description" class="field-error">{{ inlineErrors.description }}</span>
              </div>
              <div class="form-field">
                <label>联系邮箱</label>
                <lay-input v-model="inlineForm.email" placeholder="可选，方便我们联系您" />
                <span v-if="inlineErrors.email" class="field-error">{{ inlineErrors.email }}</span>
              </div>
              <div class="form-actions">
                <lay-button type="primary" @click="submitInlineForm">提交反馈</lay-button>
                <lay-button @click="resetInlineForm">重置</lay-button>
              </div>
              <div v-if="inlineSubmitted" class="submit-result">
                <i class="layui-icon layui-icon-ok-circle" style="color: #16baaa; font-size: 20px" />
                <span>反馈已提交成功！</span>
              </div>
            </div>
          </div>
        </lay-tab-item>

        <lay-tab-item title="动态表单(向导)" id="wizard">
          <div class="mode-content">
            <!-- Progress indicator -->
            <div class="wizard-progress">
              <lay-progress :percent="wizardProgress" :show-text="true" color="#16baaa" />
              <span class="wizard-page-info">第{{ wizardStep }}页，共3页</span>
            </div>

            <!-- Step 1: Basic Info -->
            <div v-show="wizardStep === 1" class="wizard-step">
              <h4>基本信息</h4>
              <div class="form-field">
                <label>姓名 <span class="required">*</span></label>
                <lay-input v-model="wizardForm.name" placeholder="请输入您的姓名" />
                <span v-if="wizardErrors.name" class="field-error">{{ wizardErrors.name }}</span>
              </div>
              <div class="form-field">
                <label>邮箱 <span class="required">*</span></label>
                <lay-input v-model="wizardForm.email" placeholder="请输入您的邮箱" />
                <span v-if="wizardErrors.email" class="field-error">{{ wizardErrors.email }}</span>
              </div>
              <div class="form-field">
                <label>反馈类型 <span class="required">*</span></label>
                <lay-select v-model="wizardForm.type" placeholder="请选择反馈类型">
                  <lay-select-option value="bug" label="Bug 缺陷" />
                  <lay-select-option value="feature" label="功能建议" />
                  <lay-select-option value="improvement" label="体验优化" />
                  <lay-select-option value="other" label="其他" />
                </lay-select>
                <span v-if="wizardErrors.type" class="field-error">{{ wizardErrors.type }}</span>
              </div>
            </div>

            <!-- Step 2: Details -->
            <div v-show="wizardStep === 2" class="wizard-step">
              <h4>详细信息</h4>
              <div class="form-field">
                <label>问题描述 <span class="required">*</span></label>
                <lay-textarea v-model="wizardForm.description" placeholder="请详细描述您遇到的问题或建议" :rows="4" />
                <span v-if="wizardErrors.description" class="field-error">{{ wizardErrors.description }}</span>
              </div>
              <div class="form-field">
                <label>复现步骤</label>
                <lay-textarea v-model="wizardForm.steps" placeholder="如果是 Bug，请描述复现步骤" :rows="3" />
              </div>
              <div class="form-field">
                <label>期望行为</label>
                <lay-textarea v-model="wizardForm.expected" placeholder="您期望的正确行为是什么？" :rows="3" />
              </div>
            </div>

            <!-- Step 3: Additional -->
            <div v-show="wizardStep === 3" class="wizard-step">
              <h4>补充信息</h4>
              <div class="form-field">
                <label>截图说明</label>
                <div class="screenshot-placeholder">
                  <i class="layui-icon layui-icon-upload" />
                  <span>点击或拖拽上传截图（演示功能）</span>
                </div>
              </div>
              <div class="form-field">
                <label>优先级</label>
                <lay-radio-group v-model="wizardForm.priority">
                  <lay-radio value="high" label="高 - 影响核心功能" />
                  <lay-radio value="medium" label="中 - 影响使用体验" />
                  <lay-radio value="low" label="低 - 轻微问题" />
                </lay-radio-group>
              </div>
              <div class="form-field">
                <label>信息汇总</label>
                <div class="wizard-summary">
                  <p><strong>姓名：</strong>{{ wizardForm.name }}</p>
                  <p><strong>邮箱：</strong>{{ wizardForm.email }}</p>
                  <p><strong>类型：</strong>{{ wizardForm.type }}</p>
                  <p><strong>描述：</strong>{{ wizardForm.description }}</p>
                </div>
              </div>
            </div>

            <!-- Navigation buttons -->
            <div class="wizard-actions">
              <lay-button v-if="wizardStep > 1" @click="prevStep">上一步</lay-button>
              <lay-button v-if="wizardStep < 3" type="primary" @click="nextStep">下一步</lay-button>
              <lay-button v-if="wizardStep === 3" type="primary" @click="submitWizard">提交</lay-button>
            </div>

            <div v-if="wizardSubmitted" class="submit-result">
              <i class="layui-icon layui-icon-ok-circle" style="color: #16baaa; font-size: 20px" />
              <span>反馈已提交成功！感谢您的反馈。</span>
            </div>
          </div>
        </lay-tab-item>
      </lay-tab>
    </lay-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { layer } from '@layui/layui-vue'

const activeMode = ref('dialog')

// ===== Mode 1: Dialog Feedback =====
const dialogSubmitted = ref(false)

const dialogForm = reactive({
  title: '',
  type: 'bug',
  description: '',
})

function openDialog() {
  dialogSubmitted.value = false
  dialogForm.title = ''
  dialogForm.type = 'bug'
  dialogForm.description = ''

  layer.open({
    type: 1,
    title: '提交反馈',
    area: ['500px', '420px'],
    content: buildDialogContent(),
    btn: [
      {
        text: '提交',
        callback: (id: string) => {
          dialogSubmitted.value = true
          layer.close(id)
        },
      },
      {
        text: '取消',
        callback: (id: string) => {
          layer.close(id)
        },
      },
    ],
  })
}

function buildDialogContent(): string {
  return `<div style="padding: 16px;">
    <div style="margin-bottom: 12px;">
      <label style="display: block; margin-bottom: 4px; font-weight: 500;">标题</label>
      <input type="text" placeholder="请输入反馈标题" style="width: 100%; padding: 8px 12px; border: 1px solid #e8e8e8; border-radius: 4px; box-sizing: border-box;" />
    </div>
    <div style="margin-bottom: 12px;">
      <label style="display: block; margin-bottom: 4px; font-weight: 500;">类型</label>
      <select style="width: 100%; padding: 8px 12px; border: 1px solid #e8e8e8; border-radius: 4px;">
        <option value="bug">Bug 缺陷</option>
        <option value="feature">功能建议</option>
        <option value="other">其他</option>
      </select>
    </div>
    <div style="margin-bottom: 12px;">
      <label style="display: block; margin-bottom: 4px; font-weight: 500;">详细描述</label>
      <textarea placeholder="请详细描述您的反馈" rows="4" style="width: 100%; padding: 8px 12px; border: 1px solid #e8e8e8; border-radius: 4px; resize: vertical; box-sizing: border-box;"></textarea>
    </div>
    <div>
      <label style="display: block; margin-bottom: 4px; font-weight: 500;">截图（可选）</label>
      <div style="border: 2px dashed #e8e8e8; border-radius: 4px; padding: 20px; text-align: center; color: #999; cursor: pointer;">
        点击上传截图（演示功能）
      </div>
    </div>
  </div>`
}

// ===== Mode 2: Inline Form =====
const inlineSubmitted = ref(false)
const inlineForm = reactive({
  title: '',
  category: '',
  priority: 'medium',
  description: '',
  email: '',
})
const inlineErrors = reactive({
  title: '',
  category: '',
  description: '',
  email: '',
})

function validateInlineForm(): boolean {
  inlineErrors.title = ''
  inlineErrors.category = ''
  inlineErrors.description = ''
  inlineErrors.email = ''

  let valid = true
  if (!inlineForm.title.trim()) {
    inlineErrors.title = '标题不能为空'
    valid = false
  }
  if (!inlineForm.category) {
    inlineErrors.category = '请选择分类'
    valid = false
  }
  if (!inlineForm.description.trim()) {
    inlineErrors.description = '描述不能为空'
    valid = false
  }
  if (inlineForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inlineForm.email)) {
    inlineErrors.email = '邮箱格式不正确'
    valid = false
  }
  return valid
}

function submitInlineForm() {
  inlineSubmitted.value = false
  if (!validateInlineForm()) return
  inlineSubmitted.value = true
  layer.msg('反馈提交成功！', { icon: 1 })
}

function resetInlineForm() {
  inlineForm.title = ''
  inlineForm.category = ''
  inlineForm.priority = 'medium'
  inlineForm.description = ''
  inlineForm.email = ''
  inlineErrors.title = ''
  inlineErrors.category = ''
  inlineErrors.description = ''
  inlineErrors.email = ''
  inlineSubmitted.value = false
}

// ===== Mode 3: Wizard Form =====
const wizardStep = ref(1)
const wizardSubmitted = ref(false)
const wizardForm = reactive({
  name: '',
  email: '',
  type: '',
  description: '',
  steps: '',
  expected: '',
  priority: 'medium',
})
const wizardErrors = reactive({
  name: '',
  email: '',
  type: '',
  description: '',
})

const wizardProgress = computed(() => Math.round((wizardStep.value / 3) * 100))

function validateWizardStep(): boolean {
  wizardErrors.name = ''
  wizardErrors.email = ''
  wizardErrors.type = ''
  wizardErrors.description = ''

  let valid = true
  if (wizardStep.value === 1) {
    if (!wizardForm.name.trim()) {
      wizardErrors.name = '姓名不能为空'
      valid = false
    }
    if (!wizardForm.email.trim()) {
      wizardErrors.email = '邮箱不能为空'
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wizardForm.email)) {
      wizardErrors.email = '邮箱格式不正确'
      valid = false
    }
    if (!wizardForm.type) {
      wizardErrors.type = '请选择反馈类型'
      valid = false
    }
  } else if (wizardStep.value === 2) {
    if (!wizardForm.description.trim()) {
      wizardErrors.description = '描述不能为空'
      valid = false
    }
  }
  return valid
}

function nextStep() {
  if (!validateWizardStep()) return
  if (wizardStep.value < 3) wizardStep.value++
}

function prevStep() {
  if (wizardStep.value > 1) wizardStep.value--
}

function submitWizard() {
  wizardSubmitted.value = true
  layer.msg('反馈提交成功！感谢您的反馈。', { icon: 1 })
}
</script>

<style scoped>
.feedback-page {
  padding: 16px;
}

.mode-content {
  padding: 16px 0;
}

.mode-desc {
  color: #666;
  margin: 0 0 16px;
}

.inline-form {
  max-width: 600px;
}

.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.required {
  color: #ff5722;
}

.field-error {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #ff5722;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.submit-result {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: #e8f8f5;
  border-radius: 6px;
  color: #16baaa;
  font-weight: 500;
}

/* Wizard styles */
.wizard-progress {
  margin-bottom: 24px;
}

.wizard-page-info {
  display: block;
  text-align: center;
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}

.wizard-step {
  max-width: 600px;
}

.wizard-step h4 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #333;
}

.wizard-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.screenshot-placeholder {
  border: 2px dashed #e8e8e8;
  border-radius: 6px;
  padding: 32px;
  text-align: center;
  color: #999;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.screenshot-placeholder i {
  font-size: 32px;
}

.screenshot-placeholder:hover {
  border-color: #16baaa;
  color: #16baaa;
}

.wizard-summary {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 6px;
}

.wizard-summary p {
  margin: 4px 0;
  font-size: 13px;
  color: #555;
}
</style>
