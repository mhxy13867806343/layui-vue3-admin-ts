<script setup lang="ts">
/**
 * 富文本编辑器示例 - WangEditor 5
 *
 * 功能：
 * - 完整工具栏（标题/加粗/斜体/颜色/对齐/列表/链接/图片/表格/代码块）
 * - 双向绑定 HTML 内容
 * - 实时预览渲染结果
 * - 获取纯文本 / HTML / JSON
 */
import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

// 编辑器实例
const editorRef = shallowRef<IDomEditor>()
const htmlContent = ref('<h2>WangEditor 富文本编辑器</h2><p>这是一个基于 <strong>WangEditor 5</strong> 的富文本编辑器示例。</p><p>支持以下功能：</p><ul><li>标题、加粗、斜体、下划线、删除线</li><li>字体颜色、背景色</li><li>对齐方式（左/中/右/两端）</li><li>有序列表、无序列表、待办列表</li><li>插入链接、图片、视频</li><li>表格（增删行列、合并单元格）</li><li>代码块（支持语言高亮）</li><li>引用、分割线</li></ul><blockquote>提示：编辑内容后，下方会实时显示 HTML 输出。</blockquote>')

const showPreview = ref(true)
const outputMode = ref<'html' | 'text' | 'json'>('html')

const toolbarConfig: Partial<IToolbarConfig> = {}
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      // mock 上传：直接返回 base64
      customUpload(file: File, insertFn: (url: string) => void) {
        const reader = new FileReader()
        reader.onload = () => insertFn(reader.result as string)
        reader.readAsDataURL(file)
      },
    },
  },
}

function handleCreated(editor: IDomEditor): void {
  editorRef.value = editor
}

function getOutput(): string {
  const editor = editorRef.value
  if (!editor) return ''
  if (outputMode.value === 'html') return htmlContent.value
  if (outputMode.value === 'text') return editor.getText()
  return JSON.stringify(editor.children, null, 2)
}

function clearContent(): void {
  editorRef.value?.clear()
  htmlContent.value = ''
}

onBeforeUnmount(() => {
  editorRef.value?.destroy()
})
</script>

<template>
  <div class="lva-editor">
    <h2>富文本编辑器</h2>
    <p class="lva-editor__desc">基于 WangEditor 5，支持完整的富文本编辑功能。</p>

    <section class="lva-editor__card">
      <div class="lva-editor__toolbar">
        <Toolbar :editor="editorRef" :default-config="toolbarConfig" style="border-bottom: 1px solid #e8e8e8" />
      </div>
      <div class="lva-editor__body">
        <Editor
          v-model="htmlContent"
          :default-config="editorConfig"
          style="height: 360px; overflow-y: auto"
          @on-created="handleCreated"
        />
      </div>
    </section>

    <!-- 操作栏 -->
    <section class="lva-editor__card lva-editor__actions">
      <div class="lva-editor__action-left">
        <label class="lva-editor__switch">
          <input v-model="showPreview" type="checkbox" />
          <span>显示预览</span>
        </label>
        <span class="lva-editor__char-count">
          字数：{{ editorRef?.getText().length ?? 0 }}
        </span>
      </div>
      <div class="lva-editor__action-right">
        <select v-model="outputMode" class="lva-editor__select">
          <option value="html">HTML</option>
          <option value="text">纯文本</option>
          <option value="json">JSON</option>
        </select>
        <lay-button size="sm" @click="clearContent">清空</lay-button>
      </div>
    </section>

    <!-- 预览 -->
    <section v-if="showPreview" class="lva-editor__card">
      <h3>{{ outputMode === 'html' ? '渲染预览' : outputMode === 'text' ? '纯文本' : 'JSON 结构' }}</h3>
      <div v-if="outputMode === 'html'" class="lva-editor__preview" v-html="htmlContent" />
      <pre v-else class="lva-editor__output">{{ getOutput() }}</pre>
    </section>
  </div>
</template>

<style src="@wangeditor/editor/dist/css/style.css"></style>

<style scoped>
.lva-editor { padding: 4px; }
.lva-editor h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-editor__desc { color: #666; font-size: 13px; margin-bottom: 16px; }
.lva-editor__card { background: #fff; border-radius: 4px; margin-bottom: 14px; overflow: hidden; }
.lva-editor__card h3 { font-size: 14px; font-weight: 600; margin: 0 0 12px; padding: 16px 20px 0; }

.lva-editor__toolbar { border: 1px solid #e8e8e8; border-bottom: none; border-radius: 4px 4px 0 0; }
.lva-editor__body { border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 4px 4px; }

.lva-editor__actions {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border: none;
}
.lva-editor__action-left, .lva-editor__action-right { display: flex; align-items: center; gap: 12px; }
.lva-editor__switch { display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; }
.lva-editor__switch input { accent-color: var(--global-primary-color, #16baaa); }
.lva-editor__char-count { font-size: 12px; color: #999; }
.lva-editor__select { padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; }

.lva-editor__preview {
  padding: 16px 20px; line-height: 1.8; font-size: 14px;
}
.lva-editor__preview :deep(h1),
.lva-editor__preview :deep(h2),
.lva-editor__preview :deep(h3) { margin: 12px 0 8px; }
.lva-editor__preview :deep(ul),
.lva-editor__preview :deep(ol) { padding-left: 24px; }
.lva-editor__preview :deep(blockquote) {
  border-left: 4px solid var(--global-primary-color, #16baaa);
  padding: 8px 16px; margin: 12px 0; background: #f9fafb; color: #666;
}
.lva-editor__preview :deep(table) { border-collapse: collapse; width: 100%; }
.lva-editor__preview :deep(td),
.lva-editor__preview :deep(th) { border: 1px solid #ddd; padding: 6px 10px; }
.lva-editor__preview :deep(img) { max-width: 100%; border-radius: 4px; }

.lva-editor__output {
  padding: 16px 20px; background: #f7f8fa; font-size: 12px;
  max-height: 300px; overflow: auto; white-space: pre-wrap; margin: 0;
}
</style>
