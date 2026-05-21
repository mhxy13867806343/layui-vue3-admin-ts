<template>
  <div class="video-page">
    <lay-tab v-model="activeTab" type="brief">
      <!-- Tab 1: 原生播放器 -->
      <lay-tab-item title="原生播放器" id="native">
        <lay-card>
          <template #title>HTML5 原生视频播放器</template>
          <div class="video-wrapper">
            <video
              ref="nativeVideoRef"
              class="video-player"
              controls
              :src="videoSources[0].url"
              :poster="posterUrl"
            >
              您的浏览器不支持 video 标签
            </video>
          </div>
          <p class="video-info">使用浏览器原生 HTML5 video 控件播放视频。</p>
        </lay-card>
      </lay-tab-item>

      <!-- Tab 2: 自定义控件 -->
      <lay-tab-item title="自定义控件" id="custom">
        <lay-card>
          <template #title>自定义视频控件</template>
          <div class="video-wrapper">
            <video
              ref="customVideoRef"
              class="video-player"
              :src="videoSources[0].url"
              :poster="posterUrl"
              @timeupdate="onTimeUpdate"
              @loadedmetadata="onMetaLoaded"
            >
            </video>
            <!-- Custom controls -->
            <div class="custom-controls">
              <lay-button size="xs" @click="togglePlay">
                {{ isPlaying ? '暂停' : '播放' }}
              </lay-button>
              <div class="progress-bar" @click="seekVideo">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
              <div class="volume-control">
                <lay-button size="xs" @click="toggleMute">
                  {{ isMuted ? '取消静音' : '静音' }}
                </lay-button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  :value="volume"
                  class="volume-slider"
                  @input="changeVolume"
                />
              </div>
              <lay-button size="xs" @click="toggleFullscreen">全屏</lay-button>
            </div>
          </div>
        </lay-card>
      </lay-tab-item>

      <!-- Tab 3: 播放列表 -->
      <lay-tab-item title="播放列表" id="playlist">
        <lay-card>
          <template #title>播放列表模式</template>
          <div class="playlist-layout">
            <div class="playlist-video">
              <video
                ref="playlistVideoRef"
                class="video-player"
                controls
                :src="videoSources[currentVideoIndex].url"
                :poster="posterUrl"
                @ended="playNext"
              >
              </video>
              <p class="now-playing">正在播放：{{ videoSources[currentVideoIndex].title }}</p>
            </div>
            <div class="playlist-list">
              <h4>播放列表</h4>
              <div
                v-for="(video, index) in videoSources"
                :key="index"
                :class="['playlist-item', { active: index === currentVideoIndex }]"
                @click="playVideo(index)"
              >
                <span class="playlist-index">{{ index + 1 }}</span>
                <span class="playlist-title">{{ video.title }}</span>
                <span class="playlist-duration">{{ video.duration }}</span>
              </div>
            </div>
          </div>
        </lay-card>
      </lay-tab-item>

      <!-- Tab 4: 配置面板 -->
      <lay-tab-item title="配置面板" id="config">
        <lay-card>
          <template #title>视频配置面板</template>
          <div class="config-layout">
            <div class="config-video">
              <video
                ref="configVideoRef"
                class="video-player"
                controls
                :src="videoSources[0].url"
                :poster="configPoster"
                :autoplay="configAutoplay"
                :loop="configLoop"
                :muted="configMuted"
              >
              </video>
            </div>
            <div class="config-panel">
              <h4>播放器配置</h4>
              <div class="config-item">
                <span>自动播放</span>
                <lay-switch v-model="configAutoplay" />
              </div>
              <div class="config-item">
                <span>循环播放</span>
                <lay-switch v-model="configLoop" />
              </div>
              <div class="config-item">
                <span>静音</span>
                <lay-switch v-model="configMuted" />
              </div>
              <div class="config-item">
                <span>播放速度</span>
                <lay-select v-model="configSpeed" @change="changeSpeed" style="width: 100px;">
                  <lay-select-option value="0.5" label="0.5x" />
                  <lay-select-option value="1" label="1x" />
                  <lay-select-option value="1.5" label="1.5x" />
                  <lay-select-option value="2" label="2x" />
                </lay-select>
              </div>
              <div class="config-item">
                <span>封面图</span>
                <lay-switch v-model="showPoster" />
              </div>
              <div class="config-item">
                <lay-button type="primary" size="sm" @click="applyConfig">应用配置</lay-button>
              </div>
            </div>
          </div>
        </lay-card>
      </lay-tab-item>
    </lay-tab>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { layer } from '@layui/layui-vue'

const activeTab = ref('native')

const posterUrl = 'https://peach.blender.org/wp-content/uploads/bbb-splash.png'

const videoSources = [
  { title: 'Big Buck Bunny', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '0:10' },
  { title: 'Elephant Dream', url: 'https://www.w3schools.com/html/movie.mp4', duration: '0:12' },
  { title: '示例视频 3', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '0:10' },
  { title: '示例视频 4', url: 'https://www.w3schools.com/html/movie.mp4', duration: '0:12' },
]

// ===== Native player =====
const nativeVideoRef = ref<HTMLVideoElement>()

// ===== Custom controls =====
const customVideoRef = ref<HTMLVideoElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isMuted = ref(false)

const progressPercent = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

function togglePlay() {
  const video = customVideoRef.value
  if (!video) return
  if (video.paused) {
    video.play()
    isPlaying.value = true
  } else {
    video.pause()
    isPlaying.value = false
  }
}

function onTimeUpdate() {
  const video = customVideoRef.value
  if (video) currentTime.value = video.currentTime
}

function onMetaLoaded() {
  const video = customVideoRef.value
  if (video) duration.value = video.duration
}

function seekVideo(e: MouseEvent) {
  const video = customVideoRef.value
  if (!video) return
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  video.currentTime = percent * duration.value
}

function toggleMute() {
  const video = customVideoRef.value
  if (!video) return
  video.muted = !video.muted
  isMuted.value = video.muted
}

function changeVolume(e: Event) {
  const video = customVideoRef.value
  const target = e.target as HTMLInputElement
  if (!video) return
  volume.value = parseFloat(target.value)
  video.volume = volume.value
}

function toggleFullscreen() {
  const video = customVideoRef.value
  if (!video) return
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    video.requestFullscreen()
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ===== Playlist =====
const playlistVideoRef = ref<HTMLVideoElement>()
const currentVideoIndex = ref(0)

function playVideo(index: number) {
  currentVideoIndex.value = index
}

function playNext() {
  if (currentVideoIndex.value < videoSources.length - 1) {
    currentVideoIndex.value++
  } else {
    currentVideoIndex.value = 0
  }
}

// ===== Config panel =====
const configVideoRef = ref<HTMLVideoElement>()
const configAutoplay = ref(false)
const configLoop = ref(false)
const configMuted = ref(false)
const configSpeed = ref('1')
const showPoster = ref(true)

const configPoster = computed(() => showPoster.value ? posterUrl : '')

function changeSpeed() {
  const video = configVideoRef.value
  if (video) {
    video.playbackRate = parseFloat(configSpeed.value)
  }
}

function applyConfig() {
  const video = configVideoRef.value
  if (!video) return
  video.playbackRate = parseFloat(configSpeed.value)
  video.loop = configLoop.value
  video.muted = configMuted.value
  layer.msg('配置已应用', { icon: 1 })
}
</script>

<style scoped>
.video-page {
  padding: 16px;
}

.video-wrapper {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  max-height: 450px;
  display: block;
}

.video-info {
  margin: 12px 0 0;
  font-size: 13px;
  color: #666;
}

/* Custom controls */
.custom-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.8);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #444;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: #16baaa;
  border-radius: 3px;
  transition: width 0.1s;
}

.time-display {
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 6px;
}

.volume-slider {
  width: 60px;
  cursor: pointer;
}

/* Playlist */
.playlist-layout {
  display: flex;
  gap: 16px;
}

.playlist-video {
  flex: 1;
}

.now-playing {
  margin: 8px 0 0;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.playlist-list {
  width: 250px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
}

.playlist-list h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #333;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.playlist-item:hover {
  background: #f5f5f5;
}

.playlist-item.active {
  background: #e8f8f5;
  color: #16baaa;
}

.playlist-index {
  font-size: 12px;
  color: #999;
  width: 20px;
}

.playlist-title {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-duration {
  font-size: 12px;
  color: #999;
}

/* Config */
.config-layout {
  display: flex;
  gap: 20px;
}

.config-video {
  flex: 1;
}

.config-panel {
  width: 250px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
}

.config-panel h4 {
  margin: 0 0 16px;
  font-size: 14px;
  color: #333;
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.config-item span {
  font-size: 13px;
  color: #666;
}

@media (max-width: 768px) {
  .playlist-layout,
  .config-layout {
    flex-direction: column;
  }

  .playlist-list,
  .config-panel {
    width: 100%;
  }
}
</style>
