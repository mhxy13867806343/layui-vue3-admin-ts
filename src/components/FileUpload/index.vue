<script setup lang="ts">
/**
 * FileUpload —— 通用文件上传
 *
 * - 包装 `<lay-upload>` 时按需使用，但本组件采用最小依赖：原生 input + 自带逻辑
 *   以避免依赖 layui-vue upload 组件具体 API 在不同版本的差异
 * - 校验：扩展名白名单 + 文件大小上限
 * - 进度：上传过程实时回调
 */
import { computed, ref } from 'vue'
import { layer } from '@layui/layui-vue'
import { uploadFile, type UploadResp } from '@/api/upload'

interface Props {
  /** 多选 */
  multiple?: boolean
  /** 扩展名白名单（小写，含点：['.png', '.jpg']） */
  accept?: string[]
  /** 大小上限 MB */
  maxSizeMb?: number
  /** 自动触发上传（false 时仅 emit selected，由外部决定何时上传） */
  auto?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  accept: () => [],
  maxSizeMb: 5,
  auto: true,
})

const emit = defineEmits<{
  (e: 'success', payload: UploadResp[]): void
  (e: 'error', err: Error): void
  (e: 'progress', percent: number): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const uploading = ref<boolean>(false)
const percent = ref<number>(0)

const acceptAttr = computed<string>(() => props.accept.join(','))

function trigger(): void {
  inputRef.value?.click()
}

function validate(file: File): string | null {
  if (props.accept.length > 0) {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!props.accept.includes(ext)) return `不支持的文件类型：${ext}`
  }
  const maxBytes = props.maxSizeMb * 1024 * 1024
  if (file.size > maxBytes) return `文件大小超过 ${props.maxSizeMb}MB`
  return null
}

async function onChange(e: Event): Promise<void> {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  const list = Array.from(files)
  const errs: string[] = []
  for (const f of list) {
    const e2 = validate(f)
    if (e2) errs.push(`${f.name}: ${e2}`)
  }
  if (errs.length > 0) {
    layer.msg(errs.join('\n'), { icon: 2 })
    return
  }

  if (!props.auto) return

  uploading.value = true
  percent.value = 0
  try {
    const out: UploadResp[] = []
    for (const f of list) {
      const resp = await uploadFile(f, {
        onProgress: (p) => {
          percent.value = p
          emit('progress', p)
        },
      })
      out.push(resp)
    }
    emit('success', out)
  } catch (err) {
    emit('error', err as Error)
  } finally {
    uploading.value = false
    if (inputRef.value) inputRef.value.value = ''
  }
}
</script>

<template>
  <div class="lva-upload">
    <input
      ref="inputRef"
      type="file"
      class="lva-upload__input"
      :multiple="multiple"
      :accept="acceptAttr || undefined"
      @change="onChange"
    />
    <lay-button :loading="uploading" @click="trigger">
      <i class="layui-icon layui-icon-upload" /> 选择文件
    </lay-button>
    <span v-if="uploading" class="lva-upload__percent">{{ percent }}%</span>
  </div>
</template>

<style scoped>
.lva-upload { display: inline-flex; align-items: center; gap: 12px; }
.lva-upload__input { display: none; }
.lva-upload__percent { font-size: 12px; color: #666; }
</style>
