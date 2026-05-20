<script setup lang="ts">
/**
 * 示例 - Form 表单
 *
 * 综合展示 input / select / radio / checkbox / switch / date-picker 等表单控件。
 */
import { reactive, ref } from 'vue'

interface FormModel {
  username: string
  email: string
  gender: string
  hobby: string[]
  city: string
  enabled: boolean
  date: string
  remark: string
}

const form = reactive<FormModel>({
  username: '',
  email: '',
  gender: 'M',
  hobby: ['code'],
  city: '',
  enabled: true,
  date: '',
  remark: '',
})

const submitting = ref<boolean>(false)
const submitted = ref<string>('')

function onSubmit(): void {
  submitting.value = true
  setTimeout(() => {
    submitted.value = JSON.stringify(form, null, 2)
    submitting.value = false
  }, 600)
}

function onReset(): void {
  form.username = ''
  form.email = ''
  form.gender = 'M'
  form.hobby = []
  form.city = ''
  form.enabled = true
  form.date = ''
  form.remark = ''
  submitted.value = ''
}
</script>

<template>
  <div class="lva-example">
    <h2 class="lva-example__title">Form 表单</h2>
    <p class="lva-example__desc">综合表单控件示例。</p>

    <div class="lva-example__section">
      <lay-form :model="form" :label-width="100">
        <lay-form-item label="用户名" prop="username">
          <lay-input v-model="form.username" placeholder="请输入用户名" allow-clear />
        </lay-form-item>
        <lay-form-item label="邮箱" prop="email">
          <lay-input v-model="form.email" placeholder="请输入邮箱" allow-clear />
        </lay-form-item>
        <lay-form-item label="性别" prop="gender">
          <lay-radio v-model="form.gender" name="gender" value="M" label="男" />
          <lay-radio v-model="form.gender" name="gender" value="F" label="女" />
        </lay-form-item>
        <lay-form-item label="爱好" prop="hobby">
          <lay-checkbox v-model="form.hobby" label="编程" name="hobby" value="code" />
          <lay-checkbox v-model="form.hobby" label="阅读" name="hobby" value="read" />
          <lay-checkbox v-model="form.hobby" label="运动" name="hobby" value="sport" />
        </lay-form-item>
        <lay-form-item label="城市" prop="city">
          <lay-select v-model="form.city" placeholder="请选择" allow-clear>
            <lay-select-option label="北京" value="bj" />
            <lay-select-option label="上海" value="sh" />
            <lay-select-option label="广州" value="gz" />
            <lay-select-option label="深圳" value="sz" />
          </lay-select>
        </lay-form-item>
        <lay-form-item label="日期" prop="date">
          <lay-date-picker v-model="form.date" placeholder="请选择日期" />
        </lay-form-item>
        <lay-form-item label="启用" prop="enabled">
          <lay-switch v-model="form.enabled" />
        </lay-form-item>
        <lay-form-item label="备注" prop="remark">
          <lay-textarea v-model="form.remark" placeholder="请输入备注" :rows="3" />
        </lay-form-item>
        <lay-form-item :label-width="100">
          <lay-button type="primary" :loading="submitting" @click="onSubmit">提交</lay-button>
          <lay-button @click="onReset">重置</lay-button>
        </lay-form-item>
      </lay-form>
    </div>

    <div v-if="submitted" class="lva-example__section">
      <h3>提交结果</h3>
      <pre class="lva-example__pre">{{ submitted }}</pre>
    </div>
  </div>
</template>

<style scoped>
.lva-example { padding: 4px; }
.lva-example__title { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-example__desc { color: #666; font-size: 13px; margin-bottom: 18px; }
.lva-example__section {
  background: #fff;
  padding: 18px 20px;
  border-radius: 4px;
  margin-bottom: 14px;
}
.lva-example__section h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
}
.lva-example__pre {
  background: #f7f8fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  margin: 0;
  overflow: auto;
}
</style>
