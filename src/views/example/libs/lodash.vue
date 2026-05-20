<script setup lang="ts">
/**
 * 示例 - Lodash 工具库
 *
 * 展示 lodash-es 常用方法的交互式演示：
 * - 防抖 debounce / 节流 throttle
 * - 深拷贝 cloneDeep
 * - 数组操作 (uniq, groupBy, chunk, flatten, difference)
 * - 对象操作 (pick, omit, merge, get/set)
 * - 字符串操作 (camelCase, kebabCase, capitalize, truncate)
 */
import { onBeforeUnmount, reactive, ref } from 'vue'
import { debounce, throttle, cloneDeep, uniq, groupBy, chunk, flatten, difference, pick, omit, merge, get, set, camelCase, kebabCase, capitalize, truncate } from 'lodash-es'

// ===== 防抖演示 =====
const debounceInput = ref('')
const debounceResult = ref('')
const debounceCount = ref(0)
const debounceRawCount = ref(0)

const debouncedFn = debounce((val: string) => {
  debounceResult.value = val
  debounceCount.value++
}, 500)

function onDebounceInput(e: Event): void {
  const val = (e.target as HTMLInputElement).value
  debounceInput.value = val
  debounceRawCount.value++
  debouncedFn(val)
}

// ===== 节流演示 =====
const throttleCount = ref(0)
const throttleRawCount = ref(0)
const throttlePos = reactive({ x: 0, y: 0 })

const throttledMove = throttle((e: MouseEvent) => {
  throttleCount.value++
  throttlePos.x = e.offsetX
  throttlePos.y = e.offsetY
}, 200)

function onMouseMove(e: MouseEvent): void {
  throttleRawCount.value++
  throttledMove(e)
}

// ===== 深拷贝 =====
const original = { name: '张三', address: { city: '北京', district: '朝阳' }, hobbies: ['编程', '阅读'] }
const cloned = ref(cloneDeep(original))
const cloneModified = ref(false)

function modifyClone(): void {
  cloned.value.address.city = '上海'
  cloned.value.hobbies.push('游泳')
  cloneModified.value = true
}

function resetClone(): void {
  cloned.value = cloneDeep(original)
  cloneModified.value = false
}

// ===== 数组操作 =====
const arrInput = ref('[1, 2, 2, 3, 4, 4, 5, 5, 6]')
const arrResults = reactive<{ method: string; result: string }[]>([])

function runArrayOps(): void {
  try {
    const arr = JSON.parse(arrInput.value)
    arrResults.length = 0
    arrResults.push({ method: 'uniq(arr)', result: JSON.stringify(uniq(arr)) })
    arrResults.push({ method: 'chunk(arr, 3)', result: JSON.stringify(chunk(arr, 3)) })
    arrResults.push({ method: 'flatten([[1,2],[3,4]])', result: JSON.stringify(flatten([[1, 2], [3, 4]])) })
    arrResults.push({ method: 'difference(arr, [2,4,6])', result: JSON.stringify(difference(arr, [2, 4, 6])) })
    const users = [{ name: 'A', age: 20 }, { name: 'B', age: 20 }, { name: 'C', age: 30 }]
    arrResults.push({ method: "groupBy(users, 'age')", result: JSON.stringify(groupBy(users, 'age')) })
  } catch { arrResults.push({ method: 'Error', result: '输入格式不正确' }) }
}

// ===== 对象操作 =====
const objSource = { id: 1, name: '张三', age: 28, email: 'zhang@test.com', role: 'admin', dept: '研发部' }
const objResults = reactive<{ method: string; result: string }[]>([])

function runObjectOps(): void {
  objResults.length = 0
  objResults.push({ method: "pick(obj, ['name','age'])", result: JSON.stringify(pick(objSource, ['name', 'age'])) })
  objResults.push({ method: "omit(obj, ['email','role'])", result: JSON.stringify(omit(objSource, ['email', 'role'])) })
  const target = { a: 1, b: { x: 1 } }
  const source = { b: { y: 2 }, c: 3 }
  objResults.push({ method: 'merge({a:1,b:{x:1}}, {b:{y:2},c:3})', result: JSON.stringify(merge({}, target, source)) })
  const nested = { user: { profile: { name: '李四' } } }
  objResults.push({ method: "get(obj, 'user.profile.name')", result: JSON.stringify(get(nested, 'user.profile.name')) })
  const setObj = cloneDeep(nested)
  set(setObj, 'user.profile.age', 25)
  objResults.push({ method: "set(obj, 'user.profile.age', 25)", result: JSON.stringify(setObj) })
}

// ===== 字符串操作 =====
const strInput = ref('hello world foo bar')
const strResults = reactive<{ method: string; result: string }[]>([])

function runStringOps(): void {
  const s = strInput.value
  strResults.length = 0
  strResults.push({ method: 'camelCase(str)', result: camelCase(s) })
  strResults.push({ method: 'kebabCase(str)', result: kebabCase(s) })
  strResults.push({ method: 'capitalize(str)', result: capitalize(s) })
  strResults.push({ method: "truncate(str, {length: 15})", result: truncate(s, { length: 15 }) })
}

onBeforeUnmount(() => { debouncedFn.cancel(); throttledMove.cancel() })
</script>

<template>
  <div class="lva-lodash">
    <h2>Lodash 工具库</h2>
    <p class="lva-lodash__desc">使用 <code>lodash-es</code>（tree-shakeable）展示常用工具方法的交互式演示。</p>

    <!-- 防抖 -->
    <section class="lva-lodash__card">
      <h3>debounce 防抖</h3>
      <p class="lva-lodash__tip">输入时实时触发，但回调延迟 500ms 执行。停止输入后才会更新结果。</p>
      <input class="lva-lodash__input" placeholder="快速输入试试..." :value="debounceInput" @input="onDebounceInput" />
      <div class="lva-lodash__stats">
        <span>原始触发：<strong>{{ debounceRawCount }}</strong> 次</span>
        <span>实际执行：<strong>{{ debounceCount }}</strong> 次</span>
        <span>结果：<code>{{ debounceResult || '(等待输入...)' }}</code></span>
      </div>
    </section>

    <!-- 节流 -->
    <section class="lva-lodash__card">
      <h3>throttle 节流</h3>
      <p class="lva-lodash__tip">在下方区域移动鼠标，回调每 200ms 最多执行一次。</p>
      <div class="lva-lodash__throttle-area" @mousemove="onMouseMove">
        <span>在此区域移动鼠标</span>
        <span class="lva-lodash__pos">x: {{ throttlePos.x }}, y: {{ throttlePos.y }}</span>
      </div>
      <div class="lva-lodash__stats">
        <span>原始触发：<strong>{{ throttleRawCount }}</strong> 次</span>
        <span>实际执行：<strong>{{ throttleCount }}</strong> 次</span>
        <span>节省：<strong>{{ throttleRawCount ? Math.round((1 - throttleCount / throttleRawCount) * 100) : 0 }}%</strong></span>
      </div>
    </section>

    <!-- 深拷贝 -->
    <section class="lva-lodash__card">
      <h3>cloneDeep 深拷贝</h3>
      <p class="lva-lodash__tip">深拷贝后修改副本不影响原对象。</p>
      <div class="lva-lodash__compare">
        <div><h4>原始对象</h4><pre>{{ JSON.stringify(original, null, 2) }}</pre></div>
        <div><h4>深拷贝副本 {{ cloneModified ? '(已修改)' : '' }}</h4><pre>{{ JSON.stringify(cloned, null, 2) }}</pre></div>
      </div>
      <div class="lva-lodash__btns">
        <lay-button size="sm" type="primary" @click="modifyClone">修改副本</lay-button>
        <lay-button size="sm" @click="resetClone">重置</lay-button>
      </div>
    </section>

    <!-- 数组操作 -->
    <section class="lva-lodash__card">
      <h3>数组操作</h3>
      <p class="lva-lodash__tip">输入一个 JSON 数组，点击运行查看各方法结果。</p>
      <div class="lva-lodash__run-row">
        <input class="lva-lodash__input" v-model="arrInput" />
        <lay-button size="sm" type="primary" @click="runArrayOps">运行</lay-button>
      </div>
      <div v-if="arrResults.length" class="lva-lodash__results">
        <div v-for="(r, i) in arrResults" :key="i" class="lva-lodash__result-item">
          <code class="lva-lodash__method">{{ r.method }}</code>
          <span class="lva-lodash__arrow">→</span>
          <code class="lva-lodash__value">{{ r.result }}</code>
        </div>
      </div>
    </section>

    <!-- 对象操作 -->
    <section class="lva-lodash__card">
      <h3>对象操作</h3>
      <p class="lva-lodash__tip">源对象：<code>{{ JSON.stringify(objSource) }}</code></p>
      <lay-button size="sm" type="primary" @click="runObjectOps">运行</lay-button>
      <div v-if="objResults.length" class="lva-lodash__results">
        <div v-for="(r, i) in objResults" :key="i" class="lva-lodash__result-item">
          <code class="lva-lodash__method">{{ r.method }}</code>
          <span class="lva-lodash__arrow">→</span>
          <code class="lva-lodash__value">{{ r.result }}</code>
        </div>
      </div>
    </section>

    <!-- 字符串操作 -->
    <section class="lva-lodash__card">
      <h3>字符串操作</h3>
      <div class="lva-lodash__run-row">
        <input class="lva-lodash__input" v-model="strInput" />
        <lay-button size="sm" type="primary" @click="runStringOps">运行</lay-button>
      </div>
      <div v-if="strResults.length" class="lva-lodash__results">
        <div v-for="(r, i) in strResults" :key="i" class="lva-lodash__result-item">
          <code class="lva-lodash__method">{{ r.method }}</code>
          <span class="lva-lodash__arrow">→</span>
          <code class="lva-lodash__value">{{ r.result }}</code>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lva-lodash { padding: 4px; }
.lva-lodash h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-lodash__desc { color: #666; font-size: 13px; margin-bottom: 16px; }
.lva-lodash__desc code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
.lva-lodash__tip { font-size: 12px; color: #999; margin: 0 0 12px; }
.lva-lodash__tip code { background: #f5f5f5; padding: 1px 4px; border-radius: 2px; font-size: 11px; }
.lva-lodash__card { background: #fff; padding: 20px 24px; border-radius: 4px; margin-bottom: 14px; }
.lva-lodash__card h3 { font-size: 15px; font-weight: 600; margin: 0 0 4px; }
.lva-lodash__card h4 { font-size: 13px; font-weight: 600; margin: 0 0 6px; }
.lva-lodash__card pre { background: #f7f8fa; padding: 10px; border-radius: 4px; font-size: 12px; margin: 0; white-space: pre-wrap; }

.lva-lodash__input {
  width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;
}
.lva-lodash__input:focus { border-color: var(--global-primary-color, #16baaa); outline: none; }
.lva-lodash__stats { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; font-size: 13px; color: #666; }
.lva-lodash__stats strong { color: var(--global-primary-color, #16baaa); }
.lva-lodash__stats code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }

.lva-lodash__throttle-area {
  height: 120px; border: 2px dashed #eee; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; cursor: crosshair; transition: border-color 0.2s; user-select: none; color: #999;
}
.lva-lodash__throttle-area:hover { border-color: var(--global-primary-color, #16baaa); }
.lva-lodash__pos { font-family: monospace; font-size: 14px; color: #333; }

.lva-lodash__compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
.lva-lodash__btns { display: flex; gap: 8px; }

.lva-lodash__run-row { display: flex; gap: 10px; align-items: center; }
.lva-lodash__run-row .lva-lodash__input { flex: 1; }

.lva-lodash__results { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.lva-lodash__result-item { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 8px 12px; background: #f9fafb; border-radius: 4px; flex-wrap: wrap; }
.lva-lodash__method { color: #e91e63; font-size: 12px; }
.lva-lodash__arrow { color: #999; }
.lva-lodash__value { color: #16baaa; font-size: 12px; word-break: break-all; }

@media (max-width: 768px) { .lva-lodash__compare { grid-template-columns: 1fr; } }
</style>
