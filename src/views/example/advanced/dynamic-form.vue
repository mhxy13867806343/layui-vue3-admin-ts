<script setup lang="ts">
/**
 * 动态表单示例
 *
 * 通过 JSON Schema 配置驱动表单渲染，支持：
 * - 多种字段类型：input/textarea/select/radio/checkbox/switch/date/number
 * - 校验规则配置（required/pattern/min/max）
 * - 联动显隐（showWhen 条件）
 * - 布局列数配置（1/2/3列）
 * - 实时预览 JSON 配置和表单数据
 */
import { computed, reactive, ref, watch } from 'vue'
import { layer } from '@layui/layui-vue'

// 字段类型定义
type FieldType = 'input' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'switch' | 'date' | 'number'

interface FieldOption { label: string; value: string | number }

interface ValidationRule {
  required?: boolean
  pattern?: string
  min?: number
  max?: number
  message?: string
}

interface FormField {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  defaultValue?: unknown
  options?: FieldOption[]
  rules?: ValidationRule[]
  showWhen?: { field: string; value: unknown }
  span?: number // 栅格占比 1-3
}

interface FormSchema {
  title: string
  columns: 1 | 2 | 3
  fields: FormField[]
}

// 预设模板
const templates: Record<string, FormSchema> = {
  userForm: {
    title: '用户信息表单',
    columns: 2,
    fields: [
      { key: 'username', label: '用户名', type: 'input', placeholder: '请输入用户名', rules: [{ required: true, message: '用户名不能为空' }, { pattern: '^[A-Za-z0-9_]{4,20}$', message: '4-20位字母数字下划线' }] },
      { key: 'nickname', label: '昵称', type: 'input', placeholder: '请输入昵称' },
      { key: 'email', label: '邮箱', type: 'input', placeholder: '请输入邮箱', rules: [{ pattern: '^\\S+@\\S+\\.\\S+$', message: '邮箱格式不正确' }] },
      { key: 'phone', label: '手机号', type: 'input', placeholder: '请输入手机号' },
      { key: 'gender', label: '性别', type: 'radio', options: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }, { label: '保密', value: 'secret' }], defaultValue: 'secret' },
      { key: 'age', label: '年龄', type: 'number', rules: [{ min: 1, max: 150, message: '年龄需在1-150之间' }] },
      { key: 'department', label: '部门', type: 'select', placeholder: '请选择部门', options: [{ label: '研发部', value: 'dev' }, { label: '产品部', value: 'product' }, { label: '设计部', value: 'design' }, { label: '市场部', value: 'market' }], rules: [{ required: true, message: '请选择部门' }] },
      { key: 'role', label: '角色', type: 'checkbox', options: [{ label: '管理员', value: 'admin' }, { label: '编辑', value: 'editor' }, { label: '访客', value: 'viewer' }] },
      { key: 'joinDate', label: '入职日期', type: 'date' },
      { key: 'status', label: '启用状态', type: 'switch', defaultValue: true },
      { key: 'bio', label: '个人简介', type: 'textarea', placeholder: '请输入个人简介', showWhen: { field: 'status', value: true }, span: 3 },
    ],
  },
  orderForm: {
    title: '订单表单',
    columns: 3,
    fields: [
      { key: 'orderNo', label: '订单号', type: 'input', placeholder: '自动生成', rules: [{ required: true }] },
      { key: 'customer', label: '客户名称', type: 'input', placeholder: '请输入客户名称', rules: [{ required: true }] },
      { key: 'amount', label: '金额', type: 'number', rules: [{ required: true, min: 0 }] },
      { key: 'type', label: '订单类型', type: 'select', options: [{ label: '普通订单', value: 'normal' }, { label: '加急订单', value: 'urgent' }, { label: '预约订单', value: 'reserve' }], rules: [{ required: true }] },
      { key: 'urgentReason', label: '加急原因', type: 'textarea', placeholder: '请说明加急原因', showWhen: { field: 'type', value: 'urgent' }, span: 3 },
      { key: 'payMethod', label: '支付方式', type: 'radio', options: [{ label: '微信', value: 'wechat' }, { label: '支付宝', value: 'alipay' }, { label: '银行转账', value: 'bank' }] },
      { key: 'deliveryDate', label: '交付日期', type: 'date' },
      { key: 'needInvoice', label: '需要发票', type: 'switch', defaultValue: false },
      { key: 'remark', label: '备注', type: 'textarea', placeholder: '选填', span: 3 },
    ],
  },
  simpleForm: {
    title: '简单反馈表单',
    columns: 1,
    fields: [
      { key: 'title', label: '标题', type: 'input', placeholder: '请输入反馈标题', rules: [{ required: true }] },
      { key: 'category', label: '分类', type: 'select', options: [{ label: 'Bug', value: 'bug' }, { label: '建议', value: 'suggestion' }, { label: '咨询', value: 'question' }], rules: [{ required: true }] },
      { key: 'priority', label: '优先级', type: 'radio', options: [{ label: '低', value: 'low' }, { label: '中', value: 'medium' }, { label: '高', value: 'high' }], defaultValue: 'medium' },
      { key: 'content', label: '详细描述', type: 'textarea', placeholder: '请详细描述您的问题或建议', rules: [{ required: true }] },
      { key: 'anonymous', label: '匿名提交', type: 'switch', defaultValue: false },
    ],
  },
}

const activeTemplate = ref<string>('userForm')
const schema = computed(() => templates[activeTemplate.value])
const formData = reactive<Record<string, unknown>>({})
const formErrors = reactive<Record<string, string>>({})

// 初始化表单数据
function initFormData(): void {
  Object.keys(formData).forEach((k) => delete formData[k])
  Object.keys(formErrors).forEach((k) => delete formErrors[k])
  schema.value.fields.forEach((f) => {
    if (f.defaultValue !== undefined) formData[f.key] = f.defaultValue
    else if (f.type === 'checkbox') formData[f.key] = []
    else if (f.type === 'switch') formData[f.key] = false
    else formData[f.key] = ''
  })
}

watch(activeTemplate, () => initFormData(), { immediate: true })

// 字段是否可见
function isVisible(field: FormField): boolean {
  if (!field.showWhen) return true
  return formData[field.showWhen.field] === field.showWhen.value
}

// 校验
function validateField(field: FormField): string {
  const val = formData[field.key]
  if (!field.rules) return ''
  for (const rule of field.rules) {
    if (rule.required && (val === '' || val === undefined || val === null || (Array.isArray(val) && val.length === 0))) {
      return rule.message || `${field.label}不能为空`
    }
    if (rule.pattern && typeof val === 'string' && val) {
      if (!new RegExp(rule.pattern).test(val)) return rule.message || '格式不正确'
    }
    if (rule.min !== undefined && typeof val === 'number' && val < rule.min) {
      return rule.message || `不能小于${rule.min}`
    }
    if (rule.max !== undefined && typeof val === 'number' && val > rule.max) {
      return rule.message || `不能大于${rule.max}`
    }
  }
  return ''
}

function validateAll(): boolean {
  let valid = true
  schema.value.fields.forEach((f) => {
    if (!isVisible(f)) return
    const err = validateField(f)
    formErrors[f.key] = err
    if (err) valid = false
  })
  return valid
}

function onSubmit(): void {
  if (validateAll()) {
    layer.msg('表单验证通过！数据已打印到控制台', { icon: 1 })
    console.log('[DynamicForm] Submit:', JSON.parse(JSON.stringify(formData)))
  } else {
    layer.msg('请检查表单填写', { icon: 2 })
  }
}

function onReset(): void {
  initFormData()
  layer.msg('已重置', { icon: 1 })
}

// JSON 编辑器
const showJson = ref(false)
</script>

<template>
  <div class="lva-df">
    <h2>动态表单</h2>
    <p class="lva-df__desc">通过 JSON Schema 配置驱动表单渲染。支持多种字段类型、校验规则、联动显隐、多列布局。</p>

    <!-- 模板选择 -->
    <section class="lva-df__card">
      <h3>选择表单模板</h3>
      <div class="lva-df__templates">
        <div v-for="(t, key) in templates" :key="key" class="lva-df__tpl" :class="{ active: activeTemplate === key }" @click="activeTemplate = key">
          <span class="lva-df__tpl-name">{{ t.title }}</span>
          <span class="lva-df__tpl-info">{{ t.fields.length }} 个字段 · {{ t.columns }} 列布局</span>
        </div>
      </div>
      <div class="lva-df__toggle">
        <a @click="showJson = !showJson">{{ showJson ? '隐藏' : '查看' }} JSON 配置</a>
      </div>
      <pre v-if="showJson" class="lva-df__json">{{ JSON.stringify(schema, null, 2) }}</pre>
    </section>

    <!-- 动态表单渲染 -->
    <section class="lva-df__card">
      <h3>{{ schema.title }}</h3>
      <div class="lva-df__form" :class="`cols-${schema.columns}`">
        <template v-for="field in schema.fields" :key="field.key">
          <div v-if="isVisible(field)" class="lva-df__field" :class="{ [`span-${field.span || 1}`]: true }">
            <label class="lva-df__label">
              <span v-if="field.rules?.some(r => r.required)" class="lva-df__required">*</span>
              {{ field.label }}
            </label>
            <!-- input -->
            <input v-if="field.type === 'input'" v-model="formData[field.key]" type="text" class="lva-df__input" :placeholder="field.placeholder" @blur="formErrors[field.key] = validateField(field)" />
            <!-- textarea -->
            <textarea v-else-if="field.type === 'textarea'" v-model="formData[field.key]" class="lva-df__textarea" :placeholder="field.placeholder" @blur="formErrors[field.key] = validateField(field)" />
            <!-- number -->
            <input v-else-if="field.type === 'number'" v-model.number="formData[field.key]" type="number" class="lva-df__input" @blur="formErrors[field.key] = validateField(field)" />
            <!-- select -->
            <select v-else-if="field.type === 'select'" v-model="formData[field.key]" class="lva-df__select" @change="formErrors[field.key] = validateField(field)">
              <option value="" disabled>{{ field.placeholder || '请选择' }}</option>
              <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <!-- radio -->
            <div v-else-if="field.type === 'radio'" class="lva-df__radios">
              <label v-for="opt in field.options" :key="opt.value" class="lva-df__radio">
                <input type="radio" :value="opt.value" v-model="formData[field.key]" /> {{ opt.label }}
              </label>
            </div>
            <!-- checkbox -->
            <div v-else-if="field.type === 'checkbox'" class="lva-df__checks">
              <label v-for="opt in field.options" :key="opt.value" class="lva-df__check">
                <input type="checkbox" :value="opt.value" v-model="formData[field.key]" /> {{ opt.label }}
              </label>
            </div>
            <!-- switch -->
            <label v-else-if="field.type === 'switch'" class="lva-df__switch">
              <input type="checkbox" v-model="formData[field.key]" />
              <span class="lva-df__switch-slider" />
              <span>{{ formData[field.key] ? '开' : '关' }}</span>
            </label>
            <!-- date -->
            <input v-else-if="field.type === 'date'" v-model="formData[field.key]" type="date" class="lva-df__input" />
            <!-- error -->
            <p v-if="formErrors[field.key]" class="lva-df__error">{{ formErrors[field.key] }}</p>
          </div>
        </template>
      </div>
      <div class="lva-df__actions">
        <lay-button type="primary" @click="onSubmit">提交</lay-button>
        <lay-button @click="onReset">重置</lay-button>
      </div>
    </section>

    <!-- 实时数据 -->
    <section class="lva-df__card">
      <h3>表单数据（实时）</h3>
      <pre class="lva-df__json">{{ JSON.stringify(formData, null, 2) }}</pre>
    </section>
  </div>
</template>

<style scoped>
.lva-df { padding: 4px; }
.lva-df h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-df__desc { color: #666; font-size: 13px; margin-bottom: 16px; }
.lva-df__card { background: #fff; padding: 20px 24px; border-radius: 4px; margin-bottom: 14px; }
.lva-df__card h3 { font-size: 15px; font-weight: 600; margin: 0 0 12px; }

.lva-df__templates { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.lva-df__tpl { padding: 12px 16px; border: 2px solid #eee; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.lva-df__tpl:hover { border-color: var(--global-primary-color, #16baaa); }
.lva-df__tpl.active { border-color: var(--global-primary-color, #16baaa); background: rgba(22,186,170,0.04); }
.lva-df__tpl-name { font-size: 14px; font-weight: 600; display: block; }
.lva-df__tpl-info { font-size: 12px; color: #999; }
.lva-df__toggle { margin-top: 12px; }
.lva-df__toggle a { color: var(--global-primary-color, #16baaa); cursor: pointer; font-size: 13px; }

.lva-df__form { display: grid; gap: 16px; }
.lva-df__form.cols-1 { grid-template-columns: 1fr; }
.lva-df__form.cols-2 { grid-template-columns: 1fr 1fr; }
.lva-df__form.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
.lva-df__field.span-2 { grid-column: span 2; }
.lva-df__field.span-3 { grid-column: 1 / -1; }

.lva-df__label { display: block; font-size: 13px; color: #333; margin-bottom: 6px; font-weight: 500; }
.lva-df__required { color: #ff5722; margin-right: 2px; }
.lva-df__input, .lva-df__select, .lva-df__textarea {
  width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;
  transition: border-color 0.2s; box-sizing: border-box;
}
.lva-df__input:focus, .lva-df__select:focus, .lva-df__textarea:focus { border-color: var(--global-primary-color, #16baaa); outline: none; }
.lva-df__textarea { min-height: 80px; resize: vertical; }
.lva-df__radios, .lva-df__checks { display: flex; flex-wrap: wrap; gap: 12px; }
.lva-df__radio, .lva-df__check { display: flex; align-items: center; gap: 4px; font-size: 13px; cursor: pointer; }
.lva-df__radio input, .lva-df__check input { accent-color: var(--global-primary-color, #16baaa); }

.lva-df__switch { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
.lva-df__switch input { display: none; }
.lva-df__switch-slider {
  width: 36px; height: 20px; background: #ccc; border-radius: 10px; position: relative; transition: background 0.2s;
}
.lva-df__switch-slider::after {
  content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
  background: #fff; border-radius: 50%; transition: transform 0.2s;
}
.lva-df__switch input:checked + .lva-df__switch-slider { background: var(--global-primary-color, #16baaa); }
.lva-df__switch input:checked + .lva-df__switch-slider::after { transform: translateX(16px); }

.lva-df__error { font-size: 12px; color: #ff5722; margin: 4px 0 0; }
.lva-df__actions { margin-top: 20px; display: flex; gap: 10px; }
.lva-df__json { background: #f7f8fa; padding: 12px; border-radius: 4px; font-size: 12px; max-height: 300px; overflow: auto; margin-top: 8px; white-space: pre-wrap; }

@media (max-width: 768px) {
  .lva-df__form.cols-2, .lva-df__form.cols-3 { grid-template-columns: 1fr; }
  .lva-df__field.span-2, .lva-df__field.span-3 { grid-column: span 1; }
}
</style>
