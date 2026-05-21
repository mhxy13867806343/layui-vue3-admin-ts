<template>
  <div class="threejs-page">
    <lay-card>
      <template #title>Three.js 3D 演示</template>
      <div class="controls">
        <lay-space>
          <lay-select v-model="currentGeometry" @change="switchGeometry" style="width: 150px">
            <lay-select-option value="cube" label="立方体" />
            <lay-select-option value="sphere" label="球体" />
            <lay-select-option value="torus" label="圆环" />
            <lay-select-option value="torusKnot" label="环面纽结" />
          </lay-select>
          <lay-switch v-model="wireframe" @change="toggleWireframe" change-tag>
            <template #onswitch-icon>线框</template>
            <template #unswitch-icon>实体</template>
          </lay-switch>
          <span class="color-label">颜色：</span>
          <input type="color" v-model="meshColor" @input="updateColor" class="color-picker" />
        </lay-space>
      </div>
      <div ref="containerRef" class="canvas-container"></div>
    </lay-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const containerRef = ref<HTMLDivElement>()
const currentGeometry = ref('cube')
const wireframe = ref(false)
const meshColor = ref('#4a90d9')

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let mesh: THREE.Mesh
let animationId: number
let statsDiv: HTMLDivElement

// FPS tracking
let frameCount = 0
let lastTime = performance.now()

function createGeometry(type: string): THREE.BufferGeometry {
  switch (type) {
    case 'sphere':
      return new THREE.SphereGeometry(1.2, 32, 32)
    case 'torus':
      return new THREE.TorusGeometry(1, 0.4, 16, 100)
    case 'torusKnot':
      return new THREE.TorusKnotGeometry(1, 0.3, 100, 16)
    case 'cube':
    default:
      return new THREE.BoxGeometry(1.5, 1.5, 1.5)
  }
}

function createMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: meshColor.value,
    wireframe: wireframe.value,
    metalness: 0.3,
    roughness: 0.6,
  })
}

function initScene() {
  if (!containerRef.value) return

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight || 500

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)

  // Camera
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(3, 2, 3)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 5, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  const pointLight = new THREE.PointLight(0xff6b6b, 0.5, 10)
  pointLight.position.set(-3, 2, -3)
  scene.add(pointLight)

  // Grid helper
  const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222)
  scene.add(gridHelper)

  // Mesh
  const geometry = createGeometry(currentGeometry.value)
  const material = createMaterial()
  mesh = new THREE.Mesh(geometry, material)
  mesh.position.y = 1.2
  mesh.castShadow = true
  scene.add(mesh)

  // Stats display
  statsDiv = document.createElement('div')
  statsDiv.style.cssText =
    'position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.7);color:#0f0;padding:4px 8px;font-size:12px;font-family:monospace;border-radius:4px;z-index:10;'
  statsDiv.textContent = 'FPS: --'
  container.style.position = 'relative'
  container.appendChild(statsDiv)
}

function animate() {
  animationId = requestAnimationFrame(animate)

  if (mesh) {
    mesh.rotation.x += 0.005
    mesh.rotation.y += 0.01
  }

  controls.update()
  renderer.render(scene, camera)

  // FPS calculation
  frameCount++
  const now = performance.now()
  if (now - lastTime >= 1000) {
    if (statsDiv) {
      statsDiv.textContent = `FPS: ${frameCount}`
    }
    frameCount = 0
    lastTime = now
  }
}

function switchGeometry() {
  if (!mesh || !scene) return
  const oldGeometry = mesh.geometry
  mesh.geometry = createGeometry(currentGeometry.value)
  oldGeometry.dispose()
}

function toggleWireframe() {
  if (!mesh) return
  const material = mesh.material as THREE.MeshStandardMaterial
  material.wireframe = wireframe.value
}

function updateColor() {
  if (!mesh) return
  const material = mesh.material as THREE.MeshStandardMaterial
  material.color.set(meshColor.value)
}

function onResize() {
  if (!containerRef.value || !camera || !renderer) return
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight || 500
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(() => {
  initScene()
  animate()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (mesh) {
    mesh.geometry.dispose()
    const material = mesh.material as THREE.MeshStandardMaterial
    material.dispose()
  }
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    if (containerRef.value && renderer.domElement.parentNode === containerRef.value) {
      containerRef.value.removeChild(renderer.domElement)
    }
  }
  if (statsDiv && statsDiv.parentNode) {
    statsDiv.parentNode.removeChild(statsDiv)
  }
  if (controls) {
    controls.dispose()
  }
})
</script>

<style scoped>
.threejs-page {
  padding: 16px;
}

.controls {
  margin-bottom: 16px;
}

.color-label {
  font-size: 14px;
  color: #666;
}

.color-picker {
  width: 36px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.canvas-container {
  width: 100%;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
