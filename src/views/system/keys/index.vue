<script setup lang="ts">
/**
 * 密钥管理 / system/keys
 *
 * - 10 个第三方服务，每个一张卡片
 * - 每个服务包含 2 个字段（普通 / 机密），机密字段可显示/隐藏
 * - 全部字段可选（允许为空）
 * - 底部「保存全部」「重置」按钮
 */
import { onMounted, ref } from 'vue'
import { layer } from '@layui/layui-vue'
import { getKeys, saveKeys, type ApiKeyService } from '@/api/keys'

const services = ref<ApiKeyService[]>([])
const original = ref<ApiKeyService[]>([])
const loading = ref(false)

/** 控制每个服务的两个字段的可见性： key 形如 `${id}-1` / `${id}-2` */
const visibleMap = ref<Record<string, boolean>>({})

function visibleKey(id: number, field: 1 | 2): string {
  return `${id}-${field}`
}

function isVisible(id: number, field: 1 | 2): boolean {
  return !!visibleMap.value[visibleKey(id, field)]
}

function toggleVisible(id: number, field: 1 | 2): void {
  const k = visibleKey(id, field)
  visibleMap.value[k] = !visibleMap.value[k]
}

function getInputType(svc: ApiKeyService, field: 1 | 2): string {
  const isSecret = field === 1 ? svc.field1Secret : svc.field2Secret
  if (!isSecret) return 'text'
  return isVisible(svc.id, field) ? 'text' : 'password'
}

async function loadKeys(): Promise<void> {
  loading.value = true
  try {
    const data = await getKeys()
    services.value = data.map((s) => ({ ...s }))
    original.value = data.map((s) => ({ ...s }))
  } catch {
    /* silent */
  } finally {
    loading.value = false
  }
}

async function onSaveAll(): Promise<void> {
  try {
    const updated = await saveKeys(services.value)
    services.value = updated.map((s) => ({ ...s }))
    original.value = updated.map((s) => ({ ...s }))
    layer.msg('保存成功', { icon: 1 })
  } catch {
    /* silent */
  }
}

function onReset(): void {
  layer.confirm('确认将所有字段重置为最近一次保存的值？', {
    yes: () => {
      services.value = original.value.map((s) => ({ ...s }))
      visibleMap.value = {}
      layer.msg('已重置', { icon: 1 })
    },
  })
}

onMounted(() => {
  void loadKeys()
})
</script>

<template>
  <div class="lva-keys-page">
    <div class="lva-keys-page__warning">
      <i class="layui-icon layui-icon-about" />
      请妥善保管密钥信息，所有字段均为可选项，未填写则视为禁用对应服务
    </div>

    <div class="lva-keys-page__list" v-loading="loading">
      <div
        v-for="svc in services"
        :key="svc.id"
        class="lva-keys-page__card"
      >
        <div class="lva-keys-page__card-header">
          <div class="lva-keys-page__card-icon">
            <i class="layui-icon" :class="svc.icon" />
          </div>
          <div class="lva-keys-page__card-title">
            <h4>{{ svc.name }}</h4>
            <p class="lva-keys-page__card-desc">{{ svc.description }}</p>
          </div>
        </div>

        <div class="lva-keys-page__fields">
          <!-- 字段 1 -->
          <div class="lva-keys-page__field">
            <label class="lva-keys-page__field-label">{{ svc.field1Label }}</label>
            <div class="lva-keys-page__field-input">
              <lay-input
                v-model="svc.field1Value"
                :type="getInputType(svc, 1)"
                :placeholder="`请输入${svc.field1Label}（可选）`"
                allow-clear
              />
              <a
                v-if="svc.field1Secret"
                class="lva-keys-page__eye"
                @click="toggleVisible(svc.id, 1)"
              >
                <i
                  :class="
                    isVisible(svc.id, 1)
                      ? 'layui-icon layui-icon-eye'
                      : 'layui-icon layui-icon-eye-invisible'
                  "
                />
              </a>
            </div>
          </div>

          <!-- 字段 2 -->
          <div class="lva-keys-page__field">
            <label class="lva-keys-page__field-label">{{ svc.field2Label }}</label>
            <div class="lva-keys-page__field-input">
              <lay-input
                v-model="svc.field2Value"
                :type="getInputType(svc, 2)"
                :placeholder="`请输入${svc.field2Label}（可选）`"
                allow-clear
              />
              <a
                v-if="svc.field2Secret"
                class="lva-keys-page__eye"
                @click="toggleVisible(svc.id, 2)"
              >
                <i
                  :class="
                    isVisible(svc.id, 2)
                      ? 'layui-icon layui-icon-eye'
                      : 'layui-icon layui-icon-eye-invisible'
                  "
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lva-keys-page__footer">
      <lay-button @click="onReset">重置</lay-button>
      <lay-button type="primary" @click="onSaveAll">保存全部</lay-button>
    </div>
  </div>
</template>

<style scoped>
.lva-keys-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.lva-keys-page__warning {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 4px;
  padding: 10px 16px;
  color: #d46b08;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.lva-keys-page__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 16px;
}
.lva-keys-page__card {
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 6px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: box-shadow 0.2s;
}
.lva-keys-page__card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.lva-keys-page__card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.lva-keys-page__card-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #f0f9f8;
  color: #16baaa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.lva-keys-page__card-title {
  flex: 1;
  min-width: 0;
}
.lva-keys-page__card-title h4 {
  margin: 0 0 4px;
  font-size: 15px;
  color: #333;
  font-weight: 600;
}
.lva-keys-page__card-desc {
  margin: 0;
  color: #888;
  font-size: 12px;
  line-height: 1.5;
}
.lva-keys-page__fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.lva-keys-page__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lva-keys-page__field-label {
  font-size: 13px;
  color: #555;
}
.lva-keys-page__field-input {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}
.lva-keys-page__field-input :deep(.layui-input-wrapper) {
  flex: 1;
}
.lva-keys-page__eye {
  cursor: pointer;
  color: #999;
  font-size: 18px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
}
.lva-keys-page__eye:hover {
  color: #16baaa;
  background: #f5f5f5;
}
.lva-keys-page__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
