<script setup lang="ts">
/**
 * 可视化图形页面
 *
 * 纯 Canvas/SVG 实现，无重型外部依赖：
 * - 力导向图（SVG + requestAnimationFrame）
 * - 流程图（SVG）
 * - 粒子效果（Canvas）
 * - 树形图（SVG）
 */
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const activeTab = ref('force')
const forceRef = ref<SVGSVGElement>()
const canvasRef = ref<HTMLCanvasElement>()
let animationId = 0
let particleAnimId = 0

// ===== Force Graph =====
interface FNode {
  id: number; label: string; x: number; y: number; vx: number; vy: number; color: string; radius: number; dragging?: boolean
}
interface FEdge { source: number; target: number }

const forceNodes = ref<FNode[]>([
  { id: 0, label: 'Vue', x: 300, y: 200, vx: 0, vy: 0, color: '#42b883', radius: 28 },
  { id: 1, label: 'React', x: 200, y: 100, vx: 0, vy: 0, color: '#61dafb', radius: 24 },
  { id: 2, label: 'Angular', x: 400, y: 100, vx: 0, vy: 0, color: '#dd0031', radius: 24 },
  { id: 3, label: 'Svelte', x: 150, y: 300, vx: 0, vy: 0, color: '#ff3e00', radius: 20 },
  { id: 4, label: 'Solid', x: 450, y: 300, vx: 0, vy: 0, color: '#4f88c6', radius: 20 },
  { id: 5, label: 'Vite', x: 300, y: 350, vx: 0, vy: 0, color: '#646cff', radius: 22 },
  { id: 6, label: 'Webpack', x: 100, y: 200, vx: 0, vy: 0, color: '#8dd6f9', radius: 20 },
  { id: 7, label: 'TS', x: 500, y: 200, vx: 0, vy: 0, color: '#3178c6', radius: 22 },
])

const forceEdges: FEdge[] = [
  { source: 0, target: 1 }, { source: 0, target: 2 }, { source: 0, target: 5 },
  { source: 1, target: 6 }, { source: 1, target: 7 }, { source: 2, target: 7 },
  { source: 3, target: 5 }, { source: 4, target: 5 }, { source: 0, target: 7 },
  { source: 3, target: 0 }, { source: 4, target: 2 },
]

let dragNode: FNode | null = null

function startForceSimulation(): void {
  const width = 600, height = 400
  const centerX = width / 2, centerY = height / 2

  function tick(): void {
    const nodes = forceNodes.value
    // Repulsion between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = 800 / (dist * dist)
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        if (!nodes[i].dragging) { nodes[i].vx -= fx; nodes[i].vy -= fy }
        if (!nodes[j].dragging) { nodes[j].vx += fx; nodes[j].vy += fy }
      }
    }

    // Attraction along edges
    for (const edge of forceEdges) {
      const s = nodes[edge.source], t = nodes[edge.target]
      const dx = t.x - s.x, dy = t.y - s.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const force = (dist - 120) * 0.01
      const fx = (dx / dist) * force, fy = (dy / dist) * force
      if (!s.dragging) { s.vx += fx; s.vy += fy }
      if (!t.dragging) { t.vx -= fx; t.vy -= fy }
    }

    // Center gravity
    for (const n of nodes) {
      if (n.dragging) continue
      n.vx += (centerX - n.x) * 0.001
      n.vy += (centerY - n.y) * 0.001
      n.vx *= 0.9; n.vy *= 0.9
      n.x += n.vx; n.y += n.vy
      n.x = Math.max(n.radius, Math.min(width - n.radius, n.x))
      n.y = Math.max(n.radius, Math.min(height - n.radius, n.y))
    }

    animationId = requestAnimationFrame(tick)
  }
  tick()
}

function onForceMouseDown(e: MouseEvent, node: FNode): void {
  dragNode = node
  node.dragging = true
  e.preventDefault()
}

function onForceMouseMove(e: MouseEvent): void {
  if (!dragNode || !forceRef.value) return
  const rect = forceRef.value.getBoundingClientRect()
  dragNode.x = e.clientX - rect.left
  dragNode.y = e.clientY - rect.top
}

function onForceMouseUp(): void {
  if (dragNode) { dragNode.dragging = false; dragNode = null }
}

// ===== Flow Chart =====
interface FlowNode { id: string; label: string; x: number; y: number; w: number; h: number; type: 'start' | 'process' | 'decision' | 'end' }
interface FlowEdge { from: string; to: string; label?: string }

const flowNodes: FlowNode[] = [
  { id: 'start', label: '开始', x: 250, y: 20, w: 100, h: 40, type: 'start' },
  { id: 'input', label: '用户输入', x: 250, y: 100, w: 120, h: 50, type: 'process' },
  { id: 'validate', label: '验证数据?', x: 250, y: 190, w: 120, h: 60, type: 'decision' },
  { id: 'process', label: '处理请求', x: 250, y: 300, w: 120, h: 50, type: 'process' },
  { id: 'error', label: '显示错误', x: 440, y: 190, w: 110, h: 50, type: 'process' },
  { id: 'save', label: '保存数据', x: 250, y: 390, w: 120, h: 50, type: 'process' },
  { id: 'end', label: '结束', x: 250, y: 470, w: 100, h: 40, type: 'end' },
]

const flowEdges: FlowEdge[] = [
  { from: 'start', to: 'input' },
  { from: 'input', to: 'validate' },
  { from: 'validate', to: 'process', label: '是' },
  { from: 'validate', to: 'error', label: '否' },
  { from: 'process', to: 'save' },
  { from: 'save', to: 'end' },
  { from: 'error', to: 'input' },
]

function getFlowNodeCenter(id: string): { x: number; y: number } {
  const n = flowNodes.find((node) => node.id === id)!
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 }
}

function getFlowEdgePath(edge: FlowEdge): string {
  const from = flowNodes.find((n) => n.id === edge.from)!
  const to = flowNodes.find((n) => n.id === edge.to)!
  const fx = from.x + from.w / 2, fy = from.y + from.h
  const tx = to.x + to.w / 2, ty = to.y

  if (edge.from === 'validate' && edge.to === 'error') {
    return `M${from.x + from.w},${from.y + from.h / 2} L${to.x},${to.y + to.h / 2}`
  }
  if (edge.from === 'error' && edge.to === 'input') {
    const ex = from.x + from.w / 2, ey = from.y
    const ix = to.x + to.w, iy = to.y + to.h / 2
    return `M${ex},${ey} L${ex},${ey - 30} L${ix + 40},${ey - 30} L${ix + 40},${iy} L${ix},${iy}`
  }
  return `M${fx},${fy} L${tx},${ty}`
}

const hoveredFlowNode = ref('')

// ===== Particle Effect =====
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; }

let particles: Particle[] = []

function initParticles(): void {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  particles = []

  for (let i = 0; i < 150; i++) {
    particles.push(createParticle(canvas.width, canvas.height))
  }
  animateParticles()
}

function createParticle(w: number, h: number): Particle {
  const colors = ['#16baaa', '#1677ff', '#722ed1', '#eb2f96', '#faad14', '#52c41a']
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    life: Math.random() * 200,
    maxLife: 200 + Math.random() * 100,
    size: 1 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
  }
}

function animateParticles(): void {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx; p.y += p.vy; p.life++

    if (p.life > p.maxLife || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
      particles[i] = createParticle(canvas.width, canvas.height)
      continue
    }

    const alpha = 1 - p.life / p.maxLife
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
    ctx.fill()

    // Draw connections
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j]
      const dx = p.x - p2.x, dy = p.y - p2.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 80) {
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = `rgba(100, 200, 200, ${(1 - dist / 80) * 0.3})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }

  particleAnimId = requestAnimationFrame(animateParticles)
}

function onCanvasClick(e: MouseEvent): void {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left, y = e.clientY - rect.top
  // Burst effect
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20
    const speed = 2 + Math.random() * 3
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0, maxLife: 60 + Math.random() * 40,
      size: 2 + Math.random() * 2,
      color: ['#ff4d4f', '#faad14', '#52c41a', '#1677ff', '#722ed1'][Math.floor(Math.random() * 5)],
    })
  }
}

// ===== Tree Diagram =====
interface TreeNode { id: string; label: string; children?: TreeNode[] }

const treeData: TreeNode = {
  id: 'ceo', label: 'CEO',
  children: [
    { id: 'cto', label: 'CTO', children: [
      { id: 'fe', label: '前端组', children: [
        { id: 'fe1', label: '张三' },
        { id: 'fe2', label: '李四' },
      ]},
      { id: 'be', label: '后端组', children: [
        { id: 'be1', label: '王五' },
        { id: 'be2', label: '赵六' },
      ]},
    ]},
    { id: 'cfo', label: 'CFO', children: [
      { id: 'fin', label: '财务部', children: [
        { id: 'fin1', label: '钱七' },
      ]},
    ]},
    { id: 'coo', label: 'COO', children: [
      { id: 'ops', label: '运营部', children: [
        { id: 'ops1', label: '孙八' },
        { id: 'ops2', label: '周九' },
      ]},
    ]},
  ],
}

interface TreeLayout { id: string; label: string; x: number; y: number; parentX?: number; parentY?: number }
const treeLayout = ref<TreeLayout[]>([])
const hoveredTreeNode = ref('')

function layoutTree(): void {
  const result: TreeLayout[] = []
  const nodeWidth = 80, levelHeight = 80, gap = 20

  function getWidth(node: TreeNode): number {
    if (!node.children || node.children.length === 0) return nodeWidth
    return node.children.reduce((sum, c) => sum + getWidth(c) + gap, -gap)
  }

  function layout(node: TreeNode, x: number, y: number, parentX?: number, parentY?: number): void {
    result.push({ id: node.id, label: node.label, x, y, parentX, parentY })
    if (!node.children) return
    const totalWidth = getWidth(node)
    let startX = x - totalWidth / 2
    for (const child of node.children) {
      const childWidth = getWidth(child)
      const childX = startX + childWidth / 2
      layout(child, childX, y + levelHeight, x, y)
      startX += childWidth + gap
    }
  }

  layout(treeData, 300, 30)
  treeLayout.value = result
}

// Lifecycle
onMounted(() => {
  layoutTree()
  if (activeTab.value === 'force') startForceSimulation()
  if (activeTab.value === 'particle') nextTick(initParticles)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  cancelAnimationFrame(particleAnimId)
})

watch(activeTab, (tab) => {
  cancelAnimationFrame(animationId)
  cancelAnimationFrame(particleAnimId)
  if (tab === 'force') nextTick(startForceSimulation)
  if (tab === 'particle') nextTick(initParticles)
})
</script>

<template>
  <div class="lva-vis">
    <h2>可视化图形</h2>
    <p class="lva-vis__desc">纯 SVG/Canvas 实现的交互式可视化，无重型外部依赖。</p>

    <div class="lva-vis__tabs">
      <span class="lva-vis__tab" :class="{ 'lva-vis__tab--active': activeTab === 'force' }" @click="activeTab = 'force'">力导向图</span>
      <span class="lva-vis__tab" :class="{ 'lva-vis__tab--active': activeTab === 'flow' }" @click="activeTab = 'flow'">流程图</span>
      <span class="lva-vis__tab" :class="{ 'lva-vis__tab--active': activeTab === 'particle' }" @click="activeTab = 'particle'">粒子效果</span>
      <span class="lva-vis__tab" :class="{ 'lva-vis__tab--active': activeTab === 'tree' }" @click="activeTab = 'tree'">树形图</span>
    </div>

    <div class="lva-vis__content">
      <!-- Force Graph -->
      <div v-show="activeTab === 'force'" class="lva-vis__panel">
        <p class="lva-vis__tip">拖拽节点查看力导向效果</p>
        <svg ref="forceRef" class="lva-vis__svg" viewBox="0 0 600 400" @mousemove="onForceMouseMove" @mouseup="onForceMouseUp" @mouseleave="onForceMouseUp">
          <line v-for="(edge, i) in forceEdges" :key="'e' + i" :x1="forceNodes[edge.source].x" :y1="forceNodes[edge.source].y" :x2="forceNodes[edge.target].x" :y2="forceNodes[edge.target].y" stroke="#ddd" stroke-width="1.5" />
          <g v-for="node in forceNodes" :key="node.id" style="cursor: grab;" @mousedown.prevent="onForceMouseDown($event, node)">
            <circle :cx="node.x" :cy="node.y" :r="node.radius" :fill="node.color" opacity="0.9" />
            <text :x="node.x" :y="node.y + 4" text-anchor="middle" fill="#fff" font-size="11" font-weight="500">{{ node.label }}</text>
          </g>
        </svg>
      </div>

      <!-- Flow Chart -->
      <div v-show="activeTab === 'flow'" class="lva-vis__panel">
        <p class="lva-vis__tip">悬停节点查看高亮效果</p>
        <svg class="lva-vis__svg" viewBox="0 0 600 530">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
            </marker>
          </defs>
          <path v-for="(edge, i) in flowEdges" :key="'fe' + i" :d="getFlowEdgePath(edge)" fill="none" stroke="#bbb" stroke-width="1.5" marker-end="url(#arrowhead)" />
          <text v-for="(edge, i) in flowEdges" :key="'fl' + i" v-show="edge.label" :x="(getFlowNodeCenter(edge.from).x + getFlowNodeCenter(edge.to).x) / 2 + (edge.label === '否' ? 20 : -14)" :y="(getFlowNodeCenter(edge.from).y + getFlowNodeCenter(edge.to).y) / 2" font-size="11" fill="#999">{{ edge.label }}</text>
          <g v-for="node in flowNodes" :key="node.id" @mouseenter="hoveredFlowNode = node.id" @mouseleave="hoveredFlowNode = ''">
            <rect v-if="node.type === 'process'" :x="node.x" :y="node.y" :width="node.w" :height="node.h" rx="6" :fill="hoveredFlowNode === node.id ? '#e6f7ff' : '#fff'" stroke="#1677ff" stroke-width="1.5" />
            <rect v-if="node.type === 'start' || node.type === 'end'" :x="node.x" :y="node.y" :width="node.w" :height="node.h" :rx="node.h / 2" :fill="hoveredFlowNode === node.id ? '#f6ffed' : '#fff'" :stroke="node.type === 'start' ? '#52c41a' : '#ff4d4f'" stroke-width="1.5" />
            <polygon v-if="node.type === 'decision'" :points="`${node.x + node.w/2},${node.y} ${node.x + node.w},${node.y + node.h/2} ${node.x + node.w/2},${node.y + node.h} ${node.x},${node.y + node.h/2}`" :fill="hoveredFlowNode === node.id ? '#fff7e6' : '#fff'" stroke="#faad14" stroke-width="1.5" />
            <text :x="node.x + node.w / 2" :y="node.y + node.h / 2 + 4" text-anchor="middle" font-size="12" fill="#333">{{ node.label }}</text>
          </g>
        </svg>
      </div>

      <!-- Particle Effect -->
      <div v-show="activeTab === 'particle'" class="lva-vis__panel">
        <p class="lva-vis__tip">点击画布产生粒子爆炸效果</p>
        <canvas ref="canvasRef" class="lva-vis__canvas" @click="onCanvasClick" />
      </div>

      <!-- Tree Diagram -->
      <div v-show="activeTab === 'tree'" class="lva-vis__panel">
        <p class="lva-vis__tip">组织架构树形图，悬停查看节点</p>
        <svg class="lva-vis__svg" viewBox="0 0 600 380">
          <line v-for="node in treeLayout.filter(n => n.parentX !== undefined)" :key="'tl' + node.id" :x1="node.parentX" :y1="(node.parentY || 0) + 18" :x2="node.x" :y2="node.y - 14" stroke="#d9d9d9" stroke-width="1.5" />
          <g v-for="node in treeLayout" :key="'tn' + node.id" @mouseenter="hoveredTreeNode = node.id" @mouseleave="hoveredTreeNode = ''">
            <rect :x="node.x - 36" :y="node.y - 14" width="72" height="28" rx="14" :fill="hoveredTreeNode === node.id ? 'var(--global-primary-color, #16baaa)' : '#f0f0f0'" :stroke="hoveredTreeNode === node.id ? 'var(--global-primary-color, #16baaa)' : '#d9d9d9'" stroke-width="1" />
            <text :x="node.x" :y="node.y + 4" text-anchor="middle" font-size="11" :fill="hoveredTreeNode === node.id ? '#fff' : '#333'">{{ node.label }}</text>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-vis { padding: 4px; }
.lva-vis h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-vis__desc { color: #666; font-size: 13px; margin-bottom: 20px; }

.lva-vis__tabs { display: flex; gap: 0; border-bottom: 2px solid #e8e8e8; margin-bottom: 0; }
.lva-vis__tab {
  padding: 10px 20px; font-size: 14px; cursor: pointer; color: #666;
  border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s;
}
.lva-vis__tab:hover { color: var(--global-primary-color, #16baaa); }
.lva-vis__tab--active { color: var(--global-primary-color, #16baaa); border-bottom-color: var(--global-primary-color, #16baaa); font-weight: 500; }

.lva-vis__content { background: #fff; border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 8px 8px; }
.lva-vis__panel { padding: 16px; }
.lva-vis__tip { font-size: 12px; color: #999; margin-bottom: 12px; }

.lva-vis__svg { width: 100%; height: auto; max-height: 500px; display: block; background: #fafafa; border-radius: 6px; }
.lva-vis__canvas { width: 100%; height: 400px; border-radius: 6px; cursor: crosshair; display: block; }
</style>
