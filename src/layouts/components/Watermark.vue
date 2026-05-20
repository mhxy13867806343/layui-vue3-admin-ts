<script setup lang="ts">
/**
 * Watermark —— 容器内水印（默认填满父级）
 *
 * 用法：父级 position: relative；本组件以 absolute 全覆盖，pointer-events:none。
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { applyWatermark, removeWatermark } from '@/utils/watermark'

interface Props {
  text: string
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), { enabled: true })

const wrapper = ref<HTMLDivElement | null>(null)

function refresh(): void {
  if (!wrapper.value) return
  if (props.enabled && props.text) applyWatermark(wrapper.value, { text: props.text })
  else removeWatermark(wrapper.value)
}

onMounted(refresh)
onBeforeUnmount(() => removeWatermark(wrapper.value))
watch([() => props.text, () => props.enabled], refresh)
</script>

<template>
  <div ref="wrapper" class="lva-watermark" />
</template>

<style scoped>
.lva-watermark {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 9;
}
</style>
