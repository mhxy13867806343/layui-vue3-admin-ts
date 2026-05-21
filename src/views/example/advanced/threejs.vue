<template>
  <div class="threejs-page">
    <lay-card>
      <template #title>Three.js 3D 多场景演示</template>
      <lay-tab v-model="activeTab" @change="onTabChange">
        <lay-tab-item title="旋转立方体" id="cube">
          <div class="demo-controls">
            <lay-space>
              <span>旋转速度：</span>
              <lay-slider v-model="cubeSpeed" :min="1" :max="20" style="width: 150px" />
              <span>颜色：</span>
              <input type="color" v-model="cubeColor" class="color-picker" />
              <lay-switch v-model="cubeWireframe">
                <template #onswitch-icon>线框</template>
                <template #unswitch-icon>实体</template>
              </lay-switch>
            </lay-space>
          </div>
          <div ref="cubeContainer" class="canvas-container"></div>
        </lay-tab-item>
        <lay-tab-item title="粒子系统" id="particles">
          <div class="demo-controls">
            <lay-space>
              <span>粒子数量：</span>
              <lay-select v-model="particleCount" style="width: 120px">
                <lay-select-option :value="500" label="500" />
                <lay-select-option :value="1000" label="1000" />
                <lay-select-option :value="2000" label="2000" />
                <lay-select-option :value="5000" label="5000" />
              </lay-select>
              <span>颜色：</span>
              <input type="color" v-model="particleColor" class="color-picker" />
              <span>大小：</span>
              <lay-slider v-model="particleSize" :min="1" :max="10" style="width: 120px" />
            </lay-space>
          </div>
          <div ref="particleContainer" class="canvas-container"></div>
        </lay-tab-item>
        <lay-tab-item title="地球模型" id="earth">
          <div class="demo-controls">
            <lay-space>
              <span>自转速度：</span>
              <lay-slider v-model="earthSpeed" :min="1" :max="15" style="width: 150px" />
              <lay-switch v-model="earthWireframe">
                <template #onswitch-icon>线框</template>
                <template #unswitch-icon>实体</template>
              </lay-switch>
            </lay-space>
          </div>
          <div ref="earthContainer" class="canvas-container"></div>
        </lay-tab-item>
        <lay-tab-item title="几何体展示" id="geometries">
          <div class="demo-controls">
            <lay-space>
              <span>旋转速度：</span>
              <lay-slider v-model="geoSpeed" :min="1" :max="15" style="width: 150px" />
              <span>颜色：</span>
              <input type="color" v-model="geoColor" class="color-picker" />
            </lay-space>
          </div>
          <div ref="geoContainer" class="canvas-container"></div>
        </lay-tab-item>
        <lay-tab-item title="光影效果" id="lighting">
          <div class="demo-controls">
            <lay-space>
              <span>环境光强度：</span>
              <lay-slider v-model="ambientIntensity" :min="0" :max="20" style="width: 120px" />
              <span>点光源颜色：</span>
              <input type="color" v-model="pointLightColor" class="color-picker" />
              <span>聚光灯角度：</span>
              <lay-slider v-model="spotAngle" :min="10" :max="80" style="width: 120px" />
            </lay-space>
          </div>
          <div ref="lightContainer" class="canvas-container"></div>
        </lay-tab-item>
      </lay-tab>
    </lay-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Tab state
const activeTab = ref('cube')

// Cube controls
const cubeSpeed = ref(5)
const cubeColor = ref('#4a90d9')
const cubeWireframe = ref(false)

// Particle controls
const particleCount = ref(1000)
const particleColor = ref('#ffffff')
const particleSize = ref(3)

// Earth controls
const earthSpeed = ref(5)
const earthWireframe = ref(false)

// Geometries controls
const geoSpeed = ref(5)
const geoColor = ref('#16baaa')

// Lighting controls
const ambientIntensity = ref(5)
const pointLightColor = ref('#ff6b6b')
const spotAngle = ref(30)

// Container refs
const cubeContainer = ref<HTMLDivElement>()
const particleContainer = ref<HTMLDivElement>()
const earthContainer = ref<HTMLDivElement>()
const geoContainer = ref<HTMLDivElement>()
const lightContainer = ref<HTMLDivElement>()

// Scene management
interface SceneContext {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  animationId: number
  objects: THREE.Object3D[]
}

const scenes: Record<string, SceneContext | null> = {
  cube: null,
  particles: null,
  earth: null,
  geometries: null,
  lighting: null,
}

function createBaseScene(container: HTMLDivElement): Omit<SceneContext, 'animationId' | 'objects'> {
  const width = container.clientWidth
  const height = container.clientHeight || 500

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(3, 2, 3)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  return { scene, camera, renderer, controls }
}

function disposeScene(key: string) {
  const ctx = scenes[key]
  if (!ctx) return
  cancelAnimationFrame(ctx.animationId)
  ctx.objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose()
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose())
      } else {
        obj.material.dispose()
      }
    }
    if (obj instanceof THREE.Points) {
      obj.geometry.dispose()
      ;(obj.material as THREE.PointsMaterial).dispose()
    }
  })
  ctx.controls.dispose()
  ctx.renderer.dispose()
  ctx.renderer.forceContextLoss()
  const parent = ctx.renderer.domElement.parentNode
  if (parent) parent.removeChild(ctx.renderer.domElement)
  scenes[key] = null
}

// ===== Demo 1: Rotating Cube =====
function initCube() {
  if (!cubeContainer.value || scenes.cube) return
  const { scene, camera, renderer, controls } = createBaseScene(cubeContainer.value)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(5, 5, 5)
  scene.add(dirLight)

  const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222)
  scene.add(gridHelper)

  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
  const material = new THREE.MeshStandardMaterial({ color: cubeColor.value, metalness: 0.3, roughness: 0.6 })
  const cube = new THREE.Mesh(geometry, material)
  cube.position.y = 1.2
  scene.add(cube)

  const ctx: SceneContext = { scene, camera, renderer, controls, animationId: 0, objects: [cube] }

  function animate() {
    ctx.animationId = requestAnimationFrame(animate)
    const speed = cubeSpeed.value * 0.002
    cube.rotation.x += speed
    cube.rotation.y += speed * 2
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
  scenes.cube = ctx
}

watch(cubeColor, (val) => {
  const ctx = scenes.cube
  if (!ctx) return
  const mesh = ctx.objects[0] as THREE.Mesh
  ;(mesh.material as THREE.MeshStandardMaterial).color.set(val)
})

watch(cubeWireframe, (val) => {
  const ctx = scenes.cube
  if (!ctx) return
  const mesh = ctx.objects[0] as THREE.Mesh
  ;(mesh.material as THREE.MeshStandardMaterial).wireframe = val
})

// ===== Demo 2: Particle System =====
function initParticles() {
  if (!particleContainer.value || scenes.particles) return
  const { scene, camera, renderer, controls } = createBaseScene(particleContainer.value)
  camera.position.set(0, 0, 5)

  const count = particleCount.value
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: particleColor.value,
    size: particleSize.value * 0.02,
    sizeAttenuation: true,
  })
  const points = new THREE.Points(geometry, material)
  scene.add(points)

  const ctx: SceneContext = { scene, camera, renderer, controls, animationId: 0, objects: [points] }

  function animate() {
    ctx.animationId = requestAnimationFrame(animate)
    points.rotation.y += 0.002
    points.rotation.x += 0.001
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
  scenes.particles = ctx
}

watch(particleColor, (val) => {
  const ctx = scenes.particles
  if (!ctx) return
  const pts = ctx.objects[0] as THREE.Points
  ;(pts.material as THREE.PointsMaterial).color.set(val)
})

watch(particleSize, (val) => {
  const ctx = scenes.particles
  if (!ctx) return
  const pts = ctx.objects[0] as THREE.Points
  ;(pts.material as THREE.PointsMaterial).size = val * 0.02
})

watch(particleCount, () => {
  disposeScene('particles')
  nextTick(() => initParticles())
})

// ===== Demo 3: Earth Globe =====
function initEarth() {
  if (!earthContainer.value || scenes.earth) return
  const { scene, camera, renderer, controls } = createBaseScene(earthContainer.value)
  camera.position.set(0, 0, 3)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(5, 3, 5)
  scene.add(dirLight)

  // Create earth with procedural color
  const earthGeo = new THREE.SphereGeometry(1, 64, 64)
  const earthMat = new THREE.MeshStandardMaterial({
    color: 0x2233aa,
    metalness: 0.1,
    roughness: 0.8,
  })
  const earth = new THREE.Mesh(earthGeo, earthMat)
  scene.add(earth)

  // Add "continents" as a second layer
  const landGeo = new THREE.SphereGeometry(1.005, 32, 32)
  const landMat = new THREE.MeshStandardMaterial({
    color: 0x33aa55,
    transparent: true,
    opacity: 0.6,
    wireframe: false,
  })
  const land = new THREE.Mesh(landGeo, landMat)
  scene.add(land)

  // Atmosphere glow
  const atmosGeo = new THREE.SphereGeometry(1.1, 32, 32)
  const atmosMat = new THREE.MeshStandardMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide,
  })
  const atmos = new THREE.Mesh(atmosGeo, atmosMat)
  scene.add(atmos)

  const ctx: SceneContext = { scene, camera, renderer, controls, animationId: 0, objects: [earth, land, atmos] }

  function animate() {
    ctx.animationId = requestAnimationFrame(animate)
    const speed = earthSpeed.value * 0.001
    earth.rotation.y += speed
    land.rotation.y += speed
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
  scenes.earth = ctx
}

watch(earthWireframe, (val) => {
  const ctx = scenes.earth
  if (!ctx) return
  ctx.objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh) {
      ;(obj.material as THREE.MeshStandardMaterial).wireframe = val
    }
  })
})

// ===== Demo 4: Multiple Geometries =====
function initGeometries() {
  if (!geoContainer.value || scenes.geometries) return
  const { scene, camera, renderer, controls } = createBaseScene(geoContainer.value)
  camera.position.set(0, 2, 8)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(5, 5, 5)
  scene.add(dirLight)

  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
  scene.add(gridHelper)

  const geometries = [
    { geo: new THREE.SphereGeometry(0.8, 32, 32), pos: [-4, 1, 0] },
    { geo: new THREE.TorusGeometry(0.6, 0.25, 16, 100), pos: [-2, 1, 0] },
    { geo: new THREE.ConeGeometry(0.6, 1.5, 32), pos: [0, 1, 0] },
    { geo: new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32), pos: [2, 1, 0] },
    { geo: new THREE.DodecahedronGeometry(0.7), pos: [4, 1, 0] },
  ]

  const objects: THREE.Mesh[] = []
  geometries.forEach(({ geo, pos }) => {
    const mat = new THREE.MeshStandardMaterial({ color: geoColor.value, metalness: 0.4, roughness: 0.5 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(pos[0], pos[1], pos[2])
    scene.add(mesh)
    objects.push(mesh)
  })

  const ctx: SceneContext = { scene, camera, renderer, controls, animationId: 0, objects }

  function animate() {
    ctx.animationId = requestAnimationFrame(animate)
    const speed = geoSpeed.value * 0.003
    objects.forEach((obj) => {
      obj.rotation.x += speed
      obj.rotation.y += speed * 1.5
    })
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
  scenes.geometries = ctx
}

watch(geoColor, (val) => {
  const ctx = scenes.geometries
  if (!ctx) return
  ctx.objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh) {
      ;(obj.material as THREE.MeshStandardMaterial).color.set(val)
    }
  })
})

// ===== Demo 5: Lighting Effects =====
function initLighting() {
  if (!lightContainer.value || scenes.lighting) return
  const { scene, camera, renderer, controls } = createBaseScene(lightContainer.value)
  camera.position.set(5, 4, 5)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // Floor
  const floorGeo = new THREE.PlaneGeometry(12, 12)
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  // Objects
  const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32)
  const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.4 })
  const sphere = new THREE.Mesh(sphereGeo, sphereMat)
  sphere.position.set(-2, 0.8, 0)
  sphere.castShadow = true
  scene.add(sphere)

  const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2)
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.4 })
  const box = new THREE.Mesh(boxGeo, boxMat)
  box.position.set(2, 0.6, 0)
  box.castShadow = true
  scene.add(box)

  const torusGeo = new THREE.TorusGeometry(0.6, 0.2, 16, 100)
  const torusMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.4 })
  const torus = new THREE.Mesh(torusGeo, torusMat)
  torus.position.set(0, 1.2, -2)
  torus.castShadow = true
  scene.add(torus)

  // Ambient light
  const ambient = new THREE.AmbientLight(0xffffff, ambientIntensity.value * 0.05)
  scene.add(ambient)

  // Point light
  const pointLight = new THREE.PointLight(pointLightColor.value, 2, 15)
  pointLight.position.set(-2, 3, 2)
  pointLight.castShadow = true
  scene.add(pointLight)
  const pointHelper = new THREE.PointLightHelper(pointLight, 0.2)
  scene.add(pointHelper)

  // Spot light
  const spotLight = new THREE.SpotLight(0xffff88, 2, 20, (spotAngle.value * Math.PI) / 180, 0.3)
  spotLight.position.set(3, 5, 2)
  spotLight.target.position.set(0, 0, 0)
  spotLight.castShadow = true
  scene.add(spotLight)
  scene.add(spotLight.target)
  const spotHelper = new THREE.SpotLightHelper(spotLight)
  scene.add(spotHelper)

  const ctx: SceneContext = {
    scene,
    camera,
    renderer,
    controls,
    animationId: 0,
    objects: [sphere, box, torus, floor],
  }

  // Store lights for updates
  ;(ctx as any)._ambient = ambient
  ;(ctx as any)._pointLight = pointLight
  ;(ctx as any)._spotLight = spotLight
  ;(ctx as any)._spotHelper = spotHelper

  let time = 0
  function animate() {
    ctx.animationId = requestAnimationFrame(animate)
    time += 0.02
    pointLight.position.x = Math.sin(time) * 3
    pointLight.position.z = Math.cos(time) * 3
    pointHelper.update()
    spotHelper.update()
    torus.rotation.x += 0.01
    torus.rotation.y += 0.015
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
  scenes.lighting = ctx
}

watch(ambientIntensity, (val) => {
  const ctx = scenes.lighting as any
  if (!ctx?._ambient) return
  ctx._ambient.intensity = val * 0.05
})

watch(pointLightColor, (val) => {
  const ctx = scenes.lighting as any
  if (!ctx?._pointLight) return
  ctx._pointLight.color.set(val)
})

watch(spotAngle, (val) => {
  const ctx = scenes.lighting as any
  if (!ctx?._spotLight) return
  ctx._spotLight.angle = (val * Math.PI) / 180
})

// ===== Tab switching =====
function onTabChange(id: string) {
  activeTab.value = id
  nextTick(() => {
    initCurrentScene()
  })
}

function initCurrentScene() {
  switch (activeTab.value) {
    case 'cube':
      initCube()
      break
    case 'particles':
      initParticles()
      break
    case 'earth':
      initEarth()
      break
    case 'geometries':
      initGeometries()
      break
    case 'lighting':
      initLighting()
      break
  }
}

function onResize() {
  Object.values(scenes).forEach((ctx) => {
    if (!ctx) return
    const parent = ctx.renderer.domElement.parentElement
    if (!parent) return
    const width = parent.clientWidth
    const height = parent.clientHeight || 500
    ctx.camera.aspect = width / height
    ctx.camera.updateProjectionMatrix()
    ctx.renderer.setSize(width, height)
  })
}

onMounted(() => {
  initCube()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  Object.keys(scenes).forEach((key) => disposeScene(key))
})
</script>

<style scoped>
.threejs-page {
  padding: 16px;
}

.demo-controls {
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
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
