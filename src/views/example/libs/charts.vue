<script setup lang="ts">
/**
 * 示例 - ECharts
 *
 * 展示多种图表类型：折线图、柱状图、饼图、雷达图、仪表盘、混合图
 */
import { ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, RadarChart, GaugeChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
  DataZoomComponent,
  ToolboxComponent,
  VisualMapComponent,
} from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  GaugeChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
  DataZoomComponent,
  ToolboxComponent,
  VisualMapComponent,
])

// 折线图 - 多系列 + 渐变
const lineOption = ref<EChartsOption>({
  title: { text: '用户增长趋势', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0, data: ['新增用户', '活跃用户', '付费用户'] },
  grid: { top: 50, bottom: 50, left: 50, right: 30 },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] },
  yAxis: { type: 'value' },
  series: [
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      data: [820, 932, 901, 1034, 1290, 1330, 1520, 1680, 1750, 1890, 2100, 2350],
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,186,170,0.3)' }, { offset: 1, color: 'rgba(22,186,170,0.02)' }] } },
      itemStyle: { color: '#16baaa' },
    },
    {
      name: '活跃用户',
      type: 'line',
      smooth: true,
      data: [620, 732, 801, 834, 990, 1130, 1220, 1380, 1450, 1590, 1700, 1850],
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(30,159,255,0.3)' }, { offset: 1, color: 'rgba(30,159,255,0.02)' }] } },
      itemStyle: { color: '#1e9fff' },
    },
    {
      name: '付费用户',
      type: 'line',
      smooth: true,
      data: [120, 182, 191, 234, 290, 330, 410, 480, 520, 590, 650, 720],
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,184,0,0.3)' }, { offset: 1, color: 'rgba(255,184,0,0.02)' }] } },
      itemStyle: { color: '#ffb800' },
    },
  ],
})

// 柱状图 - 堆叠 + 数据缩放
const barOption = ref<EChartsOption>({
  title: { text: '各部门季度业绩', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { bottom: 30, data: ['Q1', 'Q2', 'Q3', 'Q4'] },
  grid: { top: 50, bottom: 80, left: 60, right: 30 },
  dataZoom: [{ type: 'slider', bottom: 5, height: 20 }],
  xAxis: { type: 'category', data: ['研发部', '产品部', '设计部', '市场部', '运营部', '销售部', '客服部', '财务部'] },
  yAxis: { type: 'value', name: '万元' },
  series: [
    { name: 'Q1', type: 'bar', stack: 'total', data: [320, 180, 140, 260, 190, 380, 120, 90], itemStyle: { color: '#16baaa' } },
    { name: 'Q2', type: 'bar', stack: 'total', data: [280, 220, 160, 310, 210, 420, 140, 110], itemStyle: { color: '#1e9fff' } },
    { name: 'Q3', type: 'bar', stack: 'total', data: [350, 250, 180, 280, 240, 460, 160, 130], itemStyle: { color: '#ffb800' } },
    { name: 'Q4', type: 'bar', stack: 'total', data: [410, 290, 200, 340, 270, 520, 180, 150], itemStyle: { color: '#ff5722' } },
  ],
})

// 饼图 - 嵌套环形
const pieOption = ref<EChartsOption>({
  title: { text: '流量来源分析', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { bottom: 0, type: 'scroll' },
  series: [
    {
      name: '来源',
      type: 'pie',
      radius: ['35%', '55%'],
      center: ['50%', '48%'],
      label: { show: true, formatter: '{b}\n{d}%' },
      data: [
        { value: 1048, name: '搜索引擎', itemStyle: { color: '#16baaa' } },
        { value: 735, name: '直接访问', itemStyle: { color: '#1e9fff' } },
        { value: 580, name: '邮件营销', itemStyle: { color: '#ffb800' } },
        { value: 484, name: '联盟广告', itemStyle: { color: '#ff5722' } },
        { value: 300, name: '视频广告', itemStyle: { color: '#a233c6' } },
        { value: 200, name: '社交媒体', itemStyle: { color: '#2db7f5' } },
      ],
    },
  ],
})

// 雷达图 - 多维度对比
const radarOption = ref<EChartsOption>({
  title: { text: '团队能力评估', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: {},
  legend: { bottom: 0, data: ['前端组', '后端组', '测试组'] },
  radar: {
    indicator: [
      { name: '代码质量', max: 100 },
      { name: '交付速度', max: 100 },
      { name: '协作能力', max: 100 },
      { name: '创新能力', max: 100 },
      { name: '文档规范', max: 100 },
      { name: '问题解决', max: 100 },
    ],
    center: ['50%', '52%'],
    radius: '60%',
  },
  series: [
    {
      type: 'radar',
      data: [
        { value: [92, 85, 88, 95, 78, 90], name: '前端组', areaStyle: { color: 'rgba(22,186,170,0.2)' }, lineStyle: { color: '#16baaa' }, itemStyle: { color: '#16baaa' } },
        { value: [88, 78, 82, 75, 92, 95], name: '后端组', areaStyle: { color: 'rgba(30,159,255,0.2)' }, lineStyle: { color: '#1e9fff' }, itemStyle: { color: '#1e9fff' } },
        { value: [75, 70, 90, 68, 95, 85], name: '测试组', areaStyle: { color: 'rgba(255,184,0,0.2)' }, lineStyle: { color: '#ffb800' }, itemStyle: { color: '#ffb800' } },
      ],
    },
  ],
})

// 仪表盘
const gaugeOption = ref<EChartsOption>({
  title: { text: '系统健康度', left: 'center', textStyle: { fontSize: 14 } },
  series: [
    {
      type: 'gauge',
      center: ['50%', '60%'],
      radius: '75%',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 20,
          color: [[0.3, '#ff5722'], [0.7, '#ffb800'], [1, '#16baaa']],
        },
      },
      pointer: { itemStyle: { color: 'auto' } },
      axisTick: { distance: -20, length: 6, lineStyle: { color: '#fff', width: 1 } },
      splitLine: { distance: -24, length: 20, lineStyle: { color: '#fff', width: 2 } },
      axisLabel: { color: 'inherit', distance: 30, fontSize: 11 },
      detail: { valueAnimation: true, formatter: '{value}%', color: 'inherit', fontSize: 22, offsetCenter: [0, '70%'] },
      data: [{ value: 86 }],
    },
  ],
})

// 混合图 - 柱状 + 折线
const mixedOption = ref<EChartsOption>({
  title: { text: '销售额与增长率', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
  legend: { bottom: 0, data: ['销售额', '增长率'] },
  grid: { top: 50, bottom: 50, left: 60, right: 60 },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  yAxis: [
    { type: 'value', name: '万元', position: 'left' },
    { type: 'value', name: '%', position: 'right', axisLabel: { formatter: '{value}%' } },
  ],
  series: [
    {
      name: '销售额',
      type: 'bar',
      data: [260, 320, 380, 410, 520, 580],
      itemStyle: { color: '#16baaa', borderRadius: [4, 4, 0, 0] },
    },
    {
      name: '增长率',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      data: [12, 23, 18, 8, 27, 11],
      itemStyle: { color: '#ff5722' },
      lineStyle: { width: 3 },
    },
  ],
})
</script>

<template>
  <div class="lva-example">
    <h2 class="lva-example__title">ECharts 图表</h2>
    <p class="lva-example__desc">
      使用 vue-echarts 按需引入，展示折线图、柱状图、饼图、雷达图、仪表盘、混合图等多种图表类型。
    </p>

    <div class="lva-example__grid">
      <section class="lva-example__section lva-example__section--wide">
        <VChart class="lva-example__chart" :option="lineOption" autoresize />
      </section>
      <section class="lva-example__section lva-example__section--wide">
        <VChart class="lva-example__chart" :option="barOption" autoresize />
      </section>
      <section class="lva-example__section">
        <VChart class="lva-example__chart" :option="pieOption" autoresize />
      </section>
      <section class="lva-example__section">
        <VChart class="lva-example__chart" :option="radarOption" autoresize />
      </section>
      <section class="lva-example__section">
        <VChart class="lva-example__chart" :option="gaugeOption" autoresize />
      </section>
      <section class="lva-example__section">
        <VChart class="lva-example__chart" :option="mixedOption" autoresize />
      </section>
    </div>
  </div>
</template>

<style scoped>
.lva-example { padding: 4px; }
.lva-example__title { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-example__desc { color: #666; font-size: 13px; margin-bottom: 18px; }
.lva-example__grid {
  display: grid; gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}
.lva-example__section {
  background: #fff; padding: 16px 20px; border-radius: 4px;
}
.lva-example__section--wide {
  grid-column: 1 / -1;
}
.lva-example__chart { height: 320px; width: 100%; }
</style>
