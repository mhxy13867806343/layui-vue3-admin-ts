<script setup lang="ts">
/**
 * 示例 - 上传 / Excel
 *
 * 功能：
 * - 基础上传（走 mock /api/upload）+ 进度条
 * - 拖拽上传（支持点击触发、拒绝文件夹）+ 图片预览
 * - 多文件上传 + 文件列表 + 重试
 * - 图片裁剪预览（模拟）
 * - Excel 导出 / 解析
 */
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { layer } from '@layui/layui-vue'
import { uploadFile, type UploadResp } from '@/api/upload'
import { useDownload } from '@/hooks/useDownload'

// ===== 工具函数 =====
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function isFolder(file: File): boolean {
  // 文件夹通常 type 为空且 size 为 0 或 4096
  if (file.type) return false
  if (file.size === 0 || file.size === 4096) return true
  // 额外检查：没有扩展名的也可能是文件夹
  if (!file.name.includes('.')) return true
  return false
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif',
  'image/webp', 'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx']

function validateFile(file: File, maxMb = 10): string | null {
  // 注意：通过 webkitGetAsEntry 遍历得到的文件已经是真实文件，不会是文件夹
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_EXTS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
    return `不支持的文件类型：${ext || file.name}`
  }
  if (file.size > maxMb * 1024 * 1024) return `文件大小超过 ${maxMb}MB`
  return null
}

// ===== 基础上传 =====
const uploadedFiles = ref<UploadResp[]>([])
const uploading = ref(false)
const uploadPercent = ref(0)

async function onBasicUpload(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const err = validateFile(file, 5)
  if (err) { layer.msg(err, { icon: 2 }); input.value = ''; return }
  uploading.value = true
  uploadPercent.value = 0
  try {
    const resp = await uploadFile(file, {
      onProgress: (p) => { uploadPercent.value = p },
    })
    uploadedFiles.value.push(resp)
    layer.msg('上传成功', { icon: 1 })
  } catch {
    layer.msg('上传失败', { icon: 2 })
  } finally {
    uploading.value = false
    input.value = ''
  }
}

// ===== 拖拽上传 =====
const dragInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const dragUploading = ref(false)
const dragPercent = ref(0)
const dragResult = ref<UploadResp | null>(null)
const dragPreview = ref<string>('')
const dragError = ref('')

function onDragOver(e: DragEvent): void {
  e.preventDefault()
  dragOver.value = true
}
function onDragLeave(): void {
  dragOver.value = false
}

function triggerDragInput(): void {
  dragInputRef.value?.click()
}

function onDragInputChange(e: Event): void {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleDragFile(file)
  input.value = ''
}

async function onDrop(e: DragEvent): Promise<void> {
  e.preventDefault()
  dragOver.value = false
  const items = e.dataTransfer?.items
  if (!items || items.length === 0) return

  // 收集所有文件（递归遍历文件夹）
  const files: File[] = []
  const entries: FileSystemEntry[] = []
  for (let i = 0; i < items.length; i++) {
    const entry = items[i].webkitGetAsEntry?.()
    if (entry) entries.push(entry)
  }
  if (entries.length > 0) {
    for (const entry of entries) {
      await collectFiles(entry, files)
    }
  } else {
    // 兜底：直接读 files
    const fls = e.dataTransfer?.files
    if (fls) for (let i = 0; i < fls.length; i++) files.push(fls[i])
  }

  if (files.length === 0) {
    layer.msg('文件夹为空或无可上传文件', { icon: 2 })
    return
  }

  // 单文件夹/单文件：使用单文件展示；多文件提示
  if (files.length === 1) {
    handleDragFile(files[0])
  } else {
    layer.msg(`检测到 ${files.length} 个文件，将逐个上传`, { icon: 1 })
    for (const f of files) {
      await handleDragFile(f)
    }
  }
}

/** 递归遍历 FileSystemEntry，把所有文件追加到 acc */
async function collectFiles(entry: FileSystemEntry, acc: File[]): Promise<void> {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry
    return new Promise<void>((resolve) => {
      fileEntry.file((file) => { acc.push(file); resolve() }, () => resolve())
    })
  }
  if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry
    const reader = dirEntry.createReader()
    return new Promise<void>((resolve) => {
      const readBatch = (): void => {
        reader.readEntries(async (subEntries) => {
          if (subEntries.length === 0) { resolve(); return }
          for (const sub of subEntries) await collectFiles(sub, acc)
          readBatch()
        }, () => resolve())
      }
      readBatch()
    })
  }
}

async function handleDragFile(file: File): Promise<void> {
  dragError.value = ''
  dragPreview.value = ''
  const err = validateFile(file, 10)
  if (err) { dragError.value = err; layer.msg(err, { icon: 2 }); return }
  // 图片预览
  if (file.type.startsWith('image/')) {
    dragPreview.value = URL.createObjectURL(file)
  }
  dragUploading.value = true
  dragPercent.value = 0
  dragResult.value = null
  try {
    const resp = await uploadFile(file, {
      onProgress: (p) => { dragPercent.value = p },
    })
    dragResult.value = resp
    layer.msg('上传成功', { icon: 1 })
  } catch {
    dragError.value = '上传失败，请重试'
    layer.msg('上传失败', { icon: 2 })
  } finally {
    dragUploading.value = false
  }
}

function resetDrag(): void {
  dragResult.value = null
  dragPreview.value = ''
  dragError.value = ''
}

// ===== 多文件上传 =====
interface MultiFileItem {
  file: File
  name: string
  size: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  percent: number
  url?: string
}
const multiFiles = ref<MultiFileItem[]>([])

function onMultiSelect(e: Event): void {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files) return
  for (const f of Array.from(files)) {
    if (isFolder(f)) continue
    const item: MultiFileItem = {
      file: f, name: f.name, size: formatSize(f.size),
      status: 'pending', percent: 0,
    }
    multiFiles.value.push(item)
    doUploadMulti(multiFiles.value.length - 1)
  }
  input.value = ''
}

async function doUploadMulti(idx: number): Promise<void> {
  const item = multiFiles.value[idx]
  item.status = 'uploading'
  try {
    const resp = await uploadFile(item.file, {
      onProgress: (p) => { item.percent = p },
    })
    item.status = 'done'
    item.url = resp.url
  } catch {
    item.status = 'error'
  }
}

function retryMulti(idx: number): void {
  doUploadMulti(idx)
}

function removeFile(idx: number): void {
  multiFiles.value.splice(idx, 1)
}

function clearMulti(): void {
  multiFiles.value = []
}

// ===== Excel =====
interface ExcelRow {
  ID: number
  姓名: string
  邮箱: string
  部门: string
  职位: string
  状态: string
  入职日期: string
  薪资: number
}

const sampleRows: ExcelRow[] = [
  { ID: 1, 姓名: '张三', 邮箱: 'zhang@example.com', 部门: '研发部', 职位: '高级工程师', 状态: '在职', 入职日期: '2022-03-15', 薪资: 25000 },
  { ID: 2, 姓名: '李四', 邮箱: 'li@example.com', 部门: '产品部', 职位: '产品经理', 状态: '在职', 入职日期: '2021-08-20', 薪资: 22000 },
  { ID: 3, 姓名: '王五', 邮箱: 'wang@example.com', 部门: '设计部', 职位: 'UI设计师', 状态: '离职', 入职日期: '2020-01-10', 薪资: 18000 },
  { ID: 4, 姓名: '赵六', 邮箱: 'zhao@example.com', 部门: '市场部', 职位: '市场总监', 状态: '在职', 入职日期: '2023-06-01', 薪资: 30000 },
  { ID: 5, 姓名: '孙七', 邮箱: 'sun@example.com', 部门: '运营部', 职位: '运营专员', 状态: '在职', 入职日期: '2022-11-28', 薪资: 15000 },
  { ID: 6, 姓名: '周八', 邮箱: 'zhou@example.com', 部门: '研发部', 职位: '前端工程师', 状态: '在职', 入职日期: '2023-02-14', 薪资: 20000 },
  { ID: 7, 姓名: '吴九', 邮箱: 'wu@example.com', 部门: '研发部', 职位: '后端工程师', 状态: '在职', 入职日期: '2021-05-06', 薪资: 23000 },
  { ID: 8, 姓名: '郑十', 邮箱: 'zheng@example.com', 部门: '人事部', 职位: 'HR', 状态: '在职', 入职日期: '2020-09-18', 薪资: 16000 },
]

const parsedRows = ref<Record<string, unknown>[]>([])
const parseError = ref('')
const parsedFileName = ref('')

const { downloadBlob } = useDownload()

function onExportExcel(): void {
  const ws = XLSX.utils.json_to_sheet(sampleRows)
  ws['!cols'] = [{ wch: 5 }, { wch: 8 }, { wch: 22 }, { wch: 10 }, { wch: 12 }, { wch: 6 }, { wch: 12 }, { wch: 10 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '员工列表')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  const blob = new Blob([buf], { type: 'application/octet-stream' })
  downloadBlob(blob, `员工列表_${new Date().toISOString().slice(0, 10)}.xlsx`)
  layer.msg('导出成功', { icon: 1 })
}

function onPickExcel(e: Event): void {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  parseError.value = ''
  parsedFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      parsedRows.value = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
    } catch (err) {
      parseError.value = err instanceof Error ? err.message : String(err)
    }
  }
  reader.readAsArrayBuffer(file)
  input.value = ''
}
</script>

<template>
  <div class="lva-example">
    <h2 class="lva-example__title">文件上传 / Excel</h2>
    <p class="lva-example__desc">演示基础上传、拖拽上传（含图片预览）、多文件并行上传、Excel 导出与解析。</p>

    <!-- 基础上传 -->
    <section class="lva-example__section">
      <h3>基础上传</h3>
      <p class="lva-example__tip">选择文件后自动上传，支持进度显示。限制 5MB，支持图片/PDF/Word。</p>
      <div class="lva-upload-basic">
        <label class="lva-upload-btn">
          <i class="layui-icon layui-icon-upload" />
          {{ uploading ? '上传中...' : '选择文件' }}
          <input type="file" accept="image/*,.pdf,.doc,.docx" @change="onBasicUpload" />
        </label>
        <div v-if="uploading" class="lva-progress">
          <div class="lva-progress__bar" :style="{ width: uploadPercent + '%' }" />
          <span class="lva-progress__text">{{ uploadPercent }}%</span>
        </div>
      </div>
      <div v-if="uploadedFiles.length" class="lva-upload-list">
        <div v-for="(f, i) in uploadedFiles" :key="i" class="lva-upload-list__item">
          <i class="layui-icon layui-icon-ok-circle" style="color: #16baaa" />
          <span>{{ f.name }}</span>
          <span class="lva-upload-list__size">{{ formatSize(f.size) }}</span>
        </div>
      </div>
    </section>

    <!-- 拖拽上传 -->
    <section class="lva-example__section">
      <h3>拖拽上传</h3>
      <p class="lva-example__tip">将文件或文件夹拖入下方区域或点击选择文件。限制 10MB，支持递归遍历文件夹。图片文件自动预览。</p>
      <input ref="dragInputRef" type="file" style="display:none" accept="image/*,.pdf,.doc,.docx" @change="onDragInputChange" />
      <div
        class="lva-dropzone"
        :class="{ 'is-over': dragOver, 'is-uploading': dragUploading }"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
        @click="triggerDragInput"
      >
        <template v-if="dragUploading">
          <i class="layui-icon layui-icon-loading-1 lva-dropzone__spin" />
          <p>上传中 {{ dragPercent }}%</p>
          <div class="lva-progress" style="width: 60%; margin: 0 auto">
            <div class="lva-progress__bar" :style="{ width: dragPercent + '%' }" />
          </div>
        </template>
        <template v-else-if="dragResult">
          <img v-if="dragPreview" :src="dragPreview" class="lva-dropzone__preview" />
          <i v-else class="layui-icon layui-icon-ok-circle" style="font-size: 36px; color: #16baaa" />
          <p style="color: #16baaa">{{ dragResult.name }} 上传成功</p>
          <a class="lva-dropzone__reset" @click.stop="resetDrag">重新上传</a>
        </template>
        <template v-else-if="dragError">
          <i class="layui-icon layui-icon-close-fill" style="font-size: 36px; color: #ff5722" />
          <p style="color: #ff5722">{{ dragError }}</p>
          <a class="lva-dropzone__reset" @click.stop="resetDrag">重试</a>
        </template>
        <template v-else>
          <i class="layui-icon layui-icon-upload" style="font-size: 40px; color: #bbb" />
          <p>将文件或文件夹拖到此处，或 <em>点击选择文件</em></p>
          <p class="lva-dropzone__hint">支持 jpg/png/gif/webp/pdf/doc，单文件不超过 10MB</p>
          <p class="lva-dropzone__hint">📁 拖入文件夹会自动递归遍历所有文件</p>
        </template>
      </div>
    </section>

    <!-- 多文件上传 -->
    <section class="lva-example__section">
      <h3>多文件上传</h3>
      <p class="lva-example__tip">支持同时选择多个文件，并行上传并显示各自进度。失败可重试。</p>
      <div class="lva-multi-header">
        <label class="lva-upload-btn">
          <i class="layui-icon layui-icon-upload" /> 选择多个文件
          <input type="file" multiple @change="onMultiSelect" />
        </label>
        <lay-button v-if="multiFiles.length" size="sm" @click="clearMulti">清空列表</lay-button>
      </div>
      <div v-if="multiFiles.length" class="lva-multi-list">
        <div v-for="(f, i) in multiFiles" :key="i" class="lva-multi-list__item">
          <div class="lva-multi-list__info">
            <i
              class="layui-icon"
              :class="{
                'layui-icon-ok-circle': f.status === 'done',
                'layui-icon-close-fill': f.status === 'error',
                'layui-icon-loading-1': f.status === 'uploading',
                'layui-icon-file': f.status === 'pending',
              }"
              :style="{ color: f.status === 'done' ? '#16baaa' : f.status === 'error' ? '#ff5722' : '#999' }"
            />
            <span class="lva-multi-list__name">{{ f.name }}</span>
            <span class="lva-multi-list__size">{{ f.size }}</span>
            <a v-if="f.status === 'error'" class="lva-multi-list__retry" @click="retryMulti(i)">重试</a>
            <a class="lva-multi-list__remove" @click="removeFile(i)">×</a>
          </div>
          <div v-if="f.status === 'uploading'" class="lva-progress lva-progress--sm">
            <div class="lva-progress__bar" :style="{ width: f.percent + '%' }" />
          </div>
          <div v-if="f.status === 'done'" class="lva-multi-list__done">
            ✓ 已上传
          </div>
        </div>
      </div>
      <div v-else class="lva-multi-empty">暂无文件，请点击上方按钮选择</div>
    </section>

    <!-- Excel 导出 -->
    <section class="lva-example__section">
      <h3>Excel 导出</h3>
      <p class="lva-example__tip">将内存数据导出为 .xlsx 文件，支持自定义列宽。</p>
      <div class="lva-table-wrap">
        <table class="lva-example__table">
          <thead>
            <tr><th>ID</th><th>姓名</th><th>邮箱</th><th>部门</th><th>职位</th><th>状态</th><th>入职日期</th><th>薪资</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in sampleRows" :key="row.ID">
              <td>{{ row.ID }}</td><td>{{ row.姓名 }}</td><td>{{ row.邮箱 }}</td>
              <td>{{ row.部门 }}</td><td>{{ row.职位 }}</td>
              <td><span :class="row.状态 === '在职' ? 'lva-tag--green' : 'lva-tag--red'">{{ row.状态 }}</span></td>
              <td>{{ row.入职日期 }}</td><td>¥{{ row.薪资.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <lay-button type="primary" style="margin-top: 12px" @click="onExportExcel">
        <i class="layui-icon layui-icon-export" /> 导出为 Excel
      </lay-button>
    </section>

    <!-- Excel 解析 -->
    <section class="lva-example__section">
      <h3>Excel 解析</h3>
      <p class="lva-example__tip">选择本地 .xlsx/.xls 文件，解析后以 JSON 格式展示数据。</p>
      <label class="lva-upload-btn">
        <i class="layui-icon layui-icon-file" /> 选择 Excel 文件
        <input type="file" accept=".xlsx,.xls" @change="onPickExcel" />
      </label>
      <div v-if="parseError" class="lva-example__error">解析失败：{{ parseError }}</div>
      <template v-else-if="parsedRows.length">
        <p class="lva-example__tip" style="margin-top: 12px">
          📄 文件：{{ parsedFileName }}，共 {{ parsedRows.length }} 行数据
        </p>
        <div class="lva-example__pre-wrap">
          <pre class="lva-example__pre">{{ JSON.stringify(parsedRows, null, 2) }}</pre>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.lva-example { padding: 4px; }
.lva-example__title { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-example__desc { color: #666; font-size: 13px; margin-bottom: 18px; }
.lva-example__tip { font-size: 12px; color: #999; margin: 0 0 12px; }
.lva-example__section {
  background: #fff; padding: 20px 24px; border-radius: 4px; margin-bottom: 14px;
}
.lva-example__section h3 { font-size: 15px; font-weight: 600; margin: 0 0 8px; }
.lva-example__error { margin-top: 10px; font-size: 12px; color: #ff5722; }
.lva-example__pre-wrap { max-height: 300px; overflow: auto; margin-top: 8px; }
.lva-example__pre {
  background: #f7f8fa; padding: 12px; border-radius: 4px;
  font-size: 12px; margin: 0; white-space: pre-wrap;
}

/* Table */
.lva-table-wrap { overflow-x: auto; }
.lva-example__table {
  font-size: 13px; margin-top: 8px; width: 100%; border-collapse: collapse;
}
.lva-example__table th,
.lva-example__table td {
  padding: 8px 12px; border: 1px solid #eee; text-align: left; white-space: nowrap;
}
.lva-example__table th { background: #f7f8fa; font-weight: 600; }
.lva-example__table tr:hover td { background: #fafafa; }
.lva-tag--green { color: #16baaa; background: #e8f8f5; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
.lva-tag--red { color: #ff5722; background: #fff3e0; padding: 2px 8px; border-radius: 3px; font-size: 12px; }

/* Upload button */
.lva-upload-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd;
  border-radius: 4px; cursor: pointer; font-size: 13px; transition: all 0.2s;
}
.lva-upload-btn:hover { border-color: var(--global-primary-color, #16baaa); color: var(--global-primary-color, #16baaa); }
.lva-upload-btn input { display: none; }

/* Progress bar */
.lva-progress {
  position: relative; height: 18px; background: #f0f0f0;
  border-radius: 9px; overflow: hidden; margin-top: 8px;
}
.lva-progress--sm { height: 4px; margin-top: 4px; border-radius: 2px; }
.lva-progress__bar {
  height: 100%; background: var(--global-primary-color, #16baaa);
  border-radius: inherit; transition: width 0.3s;
}
.lva-progress__text {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  font-size: 11px; color: #fff; font-weight: 600;
}

/* Upload list */
.lva-upload-basic { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.lva-upload-list { margin-top: 12px; }
.lva-upload-list__item {
  display: flex; align-items: center; gap: 8px; padding: 6px 0;
  font-size: 13px; border-bottom: 1px solid #f5f5f5;
}
.lva-upload-list__size { color: #999; font-size: 12px; margin-left: auto; }

/* Dropzone */
.lva-dropzone {
  border: 2px dashed #ddd; border-radius: 8px; padding: 40px 20px;
  text-align: center; cursor: pointer; transition: all 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  min-height: 180px; justify-content: center;
}
.lva-dropzone p { margin: 0; font-size: 14px; color: #666; }
.lva-dropzone em { color: var(--global-primary-color, #16baaa); font-style: normal; text-decoration: underline; }
.lva-dropzone__hint { font-size: 12px !important; color: #bbb !important; }
.lva-dropzone.is-over { border-color: var(--global-primary-color, #16baaa); background: rgba(22,186,170,0.04); }
.lva-dropzone.is-uploading { border-color: #1e9fff; }
.lva-dropzone__spin { font-size: 28px; color: #1e9fff; animation: spin 1s linear infinite; }
.lva-dropzone__preview { max-width: 120px; max-height: 120px; border-radius: 4px; object-fit: cover; }
.lva-dropzone__reset { font-size: 13px; color: var(--global-primary-color, #16baaa); cursor: pointer; }
.lva-dropzone__reset:hover { text-decoration: underline; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Multi file */
.lva-multi-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.lva-multi-list { margin-top: 0; }
.lva-multi-list__item { padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
.lva-multi-list__info { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.lva-multi-list__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lva-multi-list__size { color: #999; font-size: 12px; }
.lva-multi-list__retry { color: #1e9fff; cursor: pointer; font-size: 12px; margin-left: 8px; }
.lva-multi-list__remove { color: #ff5722; cursor: pointer; font-size: 16px; margin-left: 8px; }
.lva-multi-list__done { font-size: 11px; color: #16baaa; margin-top: 2px; padding-left: 24px; }
.lva-multi-empty { color: #ccc; font-size: 13px; text-align: center; padding: 24px 0; }
</style>
