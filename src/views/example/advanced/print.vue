<template>
  <div class="print-page">
    <lay-card class="no-print">
      <template #title>打印演示</template>
      <div class="settings">
        <lay-space direction="vertical" fill>
          <lay-space>
            <span class="setting-label">模板：</span>
            <lay-radio-group v-model="templateType">
              <lay-radio value="invoice" label="发票" />
              <lay-radio value="receipt" label="收据" />
              <lay-radio value="report" label="报表" />
            </lay-radio-group>
          </lay-space>
          <lay-space>
            <span class="setting-label">纸张：</span>
            <lay-radio-group v-model="paperSize">
              <lay-radio value="A4" label="A4" />
              <lay-radio value="A5" label="A5" />
            </lay-radio-group>
            <span class="setting-label" style="margin-left: 16px">方向：</span>
            <lay-radio-group v-model="orientation">
              <lay-radio value="portrait" label="纵向" />
              <lay-radio value="landscape" label="横向" />
            </lay-radio-group>
          </lay-space>
          <lay-space>
            <lay-switch v-model="showHeader" onswitch-text="页眉" unswitch-text="页眉" />
            <lay-switch v-model="showFooter" onswitch-text="页脚" unswitch-text="页脚" />
          </lay-space>
          <lay-button type="primary" @click="handlePrint">
            <i class="layui-icon layui-icon-print"></i> 打印
          </lay-button>
        </lay-space>
      </div>
    </lay-card>

    <!-- Print Area -->
    <div ref="printAreaRef" class="print-area" :class="[`paper-${paperSize}`, orientation]">
      <!-- Header -->
      <div v-if="showHeader" class="print-header">
        <div class="header-left">Layui Vue Admin</div>
        <div class="header-right">{{ currentDate }}</div>
      </div>

      <!-- Invoice Template -->
      <div v-if="templateType === 'invoice'" class="template-content">
        <h2 class="template-title">增值税普通发票</h2>
        <div class="invoice-info">
          <div class="info-row">
            <span class="info-label">发票代码：</span>
            <span>0441001107</span>
            <span class="info-label" style="margin-left: 40px">发票号码：</span>
            <span>23456789</span>
          </div>
          <div class="info-row">
            <span class="info-label">开票日期：</span>
            <span>{{ currentDate }}</span>
          </div>
        </div>
        <table class="print-table">
          <thead>
            <tr>
              <th>项目名称</th>
              <th>规格型号</th>
              <th>单位</th>
              <th>数量</th>
              <th>单价</th>
              <th>金额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in invoiceItems" :key="item.name">
              <td>{{ item.name }}</td>
              <td>{{ item.spec }}</td>
              <td>{{ item.unit }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.price.toFixed(2) }}</td>
              <td>{{ (item.quantity * item.price).toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align: right; font-weight: bold">合计：</td>
              <td style="font-weight: bold">¥{{ invoiceTotal.toFixed(2) }}</td>
            </tr>
          </tfoot>
        </table>
        <div class="invoice-footer-info">
          <p><strong>收款人：</strong>张三 &nbsp;&nbsp; <strong>复核：</strong>李四 &nbsp;&nbsp; <strong>开票人：</strong>王五</p>
        </div>
      </div>

      <!-- Receipt Template -->
      <div v-if="templateType === 'receipt'" class="template-content">
        <h2 class="template-title">收 据</h2>
        <div class="receipt-content">
          <div class="receipt-no">No. 00012345</div>
          <div class="receipt-date">日期：{{ currentDate }}</div>
          <div class="receipt-body">
            <p>今收到 <span class="underline">深圳市某某科技有限公司</span> 交来</p>
            <p>人民币（大写）<span class="underline">壹万贰仟叁佰肆拾伍元整</span></p>
            <p>（小写）¥ <span class="underline">12,345.00</span></p>
            <p>系付 <span class="underline">2024年度软件服务费</span></p>
          </div>
          <div class="receipt-sign">
            <div class="sign-item">
              <span>收款单位（盖章）：</span>
              <span class="underline-blank"></span>
            </div>
            <div class="sign-item">
              <span>经手人：</span>
              <span class="underline-blank"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Template -->
      <div v-if="templateType === 'report'" class="template-content">
        <h2 class="template-title">月度销售报表</h2>
        <div class="report-meta">
          <span>报表期间：2024年1月</span>
          <span>生成日期：{{ currentDate }}</span>
          <span>部门：销售一部</span>
        </div>
        <table class="print-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>产品名称</th>
              <th>销售数量</th>
              <th>销售金额</th>
              <th>同比增长</th>
              <th>完成率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in reportItems" :key="item.name">
              <td>{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>¥{{ item.amount.toLocaleString() }}</td>
              <td :style="{ color: item.growth >= 0 ? '#52c41a' : '#f5222d' }">
                {{ item.growth >= 0 ? '+' : '' }}{{ item.growth }}%
              </td>
              <td>{{ item.completion }}%</td>
            </tr>
          </tbody>
        </table>
        <div class="report-summary">
          <p><strong>总销售额：</strong>¥{{ reportTotal.toLocaleString() }}</p>
          <p><strong>平均完成率：</strong>{{ avgCompletion }}%</p>
        </div>
        <div class="page-break"></div>
        <div class="report-notes">
          <h3>备注说明</h3>
          <p>1. 本报表数据来源于销售管理系统，统计截止日期为当月最后一个工作日。</p>
          <p>2. 同比增长率以上年同期数据为基准计算。</p>
          <p>3. 完成率以年度目标分解到月度的计划值为基准。</p>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="showFooter" class="print-footer">
        <div class="footer-left">机密文件 - 仅供内部使用</div>
        <div class="footer-right">第 1 页</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const templateType = ref('invoice')
const paperSize = ref('A4')
const orientation = ref('portrait')
const showHeader = ref(true)
const showFooter = ref(true)

const currentDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const invoiceItems = ref([
  { name: '云服务器 ECS', spec: '4核8G', unit: '月', quantity: 12, price: 580 },
  { name: '对象存储 OSS', spec: '500GB', unit: '年', quantity: 1, price: 1200 },
  { name: '负载均衡 SLB', spec: '标准型', unit: '月', quantity: 12, price: 120 },
  { name: 'CDN 流量包', spec: '1TB', unit: '个', quantity: 5, price: 260 },
])

const invoiceTotal = computed(() => {
  return invoiceItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0)
})

const reportItems = ref([
  { name: '企业版套餐', quantity: 156, amount: 468000, growth: 12.5, completion: 95 },
  { name: '专业版套餐', quantity: 342, amount: 273600, growth: -3.2, completion: 82 },
  { name: '基础版套餐', quantity: 1205, amount: 180750, growth: 28.1, completion: 110 },
  { name: '增值服务包', quantity: 89, amount: 133500, growth: 5.7, completion: 76 },
  { name: '定制开发', quantity: 12, amount: 360000, growth: 45.0, completion: 120 },
])

const reportTotal = computed(() => {
  return reportItems.value.reduce((sum, item) => sum + item.amount, 0)
})

const avgCompletion = computed(() => {
  const total = reportItems.value.reduce((sum, item) => sum + item.completion, 0)
  return (total / reportItems.value.length).toFixed(1)
})

const printAreaRef = ref<HTMLDivElement>()

function handlePrint() {
  window.print()
}
</script>

<style scoped>
.print-page {
  padding: 16px;
}

.settings {
  margin-bottom: 16px;
}

.setting-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.print-area {
  background: #fff;
  padding: 40px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-top: 16px;
  min-height: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.print-area.paper-A5 {
  max-width: 600px;
}

.print-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 2px solid #333;
  margin-bottom: 24px;
  font-size: 12px;
  color: #666;
}

.print-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ddd;
  margin-top: 40px;
  font-size: 11px;
  color: #999;
}

.template-title {
  text-align: center;
  font-size: 22px;
  margin-bottom: 24px;
  letter-spacing: 4px;
}

/* Invoice styles */
.invoice-info {
  margin-bottom: 20px;
}

.info-row {
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label {
  color: #666;
}

.invoice-footer-info {
  margin-top: 24px;
  font-size: 13px;
  color: #555;
}

/* Receipt styles */
.receipt-content {
  padding: 20px;
}

.receipt-no {
  text-align: right;
  font-size: 14px;
  color: #c00;
  margin-bottom: 8px;
}

.receipt-date {
  text-align: right;
  font-size: 13px;
  margin-bottom: 24px;
}

.receipt-body p {
  font-size: 15px;
  line-height: 2.5;
}

.underline {
  border-bottom: 1px solid #333;
  padding: 0 12px;
}

.receipt-sign {
  margin-top: 60px;
  display: flex;
  justify-content: space-between;
}

.sign-item {
  font-size: 14px;
}

.underline-blank {
  display: inline-block;
  width: 120px;
  border-bottom: 1px solid #333;
}

/* Report styles */
.report-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 13px;
  color: #666;
}

.report-summary {
  margin-top: 20px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
}

.report-summary p {
  margin: 4px 0;
  font-size: 14px;
}

.report-notes {
  margin-top: 24px;
}

.report-notes h3 {
  font-size: 15px;
  margin-bottom: 8px;
}

.report-notes p {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

/* Table styles */
.print-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.print-table th,
.print-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: center;
}

.print-table th {
  background: #f5f5f5;
  font-weight: 600;
}

.print-table tbody tr:nth-child(even) {
  background: #fafafa;
}

.page-break {
  page-break-before: always;
}
</style>

<style>
@media print {
  body * {
    visibility: hidden;
  }

  .print-area,
  .print-area * {
    visibility: visible;
  }

  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    border: none;
    box-shadow: none;
    padding: 20mm;
    margin: 0;
  }

  .no-print {
    display: none !important;
  }

  .print-area.landscape {
    width: 297mm;
    height: 210mm;
  }

  @page {
    margin: 10mm;
  }
}
</style>
