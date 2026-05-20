<script setup lang="ts">
/**
 * 支付方式页面
 *
 * - 支付方式选择（支付宝、微信、银行卡、余额）
 * - 模拟二维码
 * - 订单摘要
 * - 支付状态模拟
 * - 支付历史表格
 */
import { reactive, ref } from 'vue'

type PayMethod = 'alipay' | 'wechat' | 'bank' | 'balance'
type PayStatus = 'idle' | 'pending' | 'processing' | 'success' | 'failed'

interface PaymentRecord {
  id: string
  orderNo: string
  product: string
  amount: number
  method: string
  status: string
  time: string
}

const selectedMethod = ref<PayMethod>('alipay')
const payStatus = ref<PayStatus>('idle')

const order = reactive({
  product: 'LayUI Vue Pro 企业版授权',
  amount: 1299.0,
  orderNo: `ORD${Date.now().toString().slice(-10)}`,
})

const paymentHistory = reactive<PaymentRecord[]>([
  { id: '1', orderNo: 'ORD2024060001', product: '基础版年费', amount: 299.0, method: '支付宝', status: '成功', time: '2024-06-01 10:30' },
  { id: '2', orderNo: 'ORD2024050012', product: '存储扩容 50GB', amount: 49.9, method: '微信支付', status: '成功', time: '2024-05-15 14:22' },
  { id: '3', orderNo: 'ORD2024040008', product: '企业版月费', amount: 199.0, method: '银行卡', status: '成功', time: '2024-04-20 09:10' },
  { id: '4', orderNo: 'ORD2024030003', product: '短信包 1000条', amount: 80.0, method: '余额', status: '失败', time: '2024-03-10 16:45' },
  { id: '5', orderNo: 'ORD2024020015', product: '基础版年费', amount: 299.0, method: '支付宝', status: '成功', time: '2024-02-01 11:00' },
])

const methods: { key: PayMethod; name: string; icon: string; color: string }[] = [
  { key: 'alipay', name: '支付宝', icon: 'layui-icon-login-wechat', color: '#1677ff' },
  { key: 'wechat', name: '微信支付', icon: 'layui-icon-login-wechat', color: '#07c160' },
  { key: 'bank', name: '银行卡', icon: 'layui-icon-template-1', color: '#faad14' },
  { key: 'balance', name: '余额支付', icon: 'layui-icon-rmb', color: '#ff4d4f' },
]

function startPayment(): void {
  payStatus.value = 'pending'
  setTimeout(() => {
    payStatus.value = 'processing'
    setTimeout(() => {
      const success = Math.random() > 0.2
      payStatus.value = success ? 'success' : 'failed'
      if (success) {
        paymentHistory.unshift({
          id: String(paymentHistory.length + 1),
          orderNo: order.orderNo,
          product: order.product,
          amount: order.amount,
          method: methods.find((m) => m.key === selectedMethod.value)?.name || '',
          status: '成功',
          time: new Date().toLocaleString(),
        })
      }
    }, 2000)
  }, 1500)
}

function resetPayment(): void {
  payStatus.value = 'idle'
  order.orderNo = `ORD${Date.now().toString().slice(-10)}`
}

const statusText: Record<PayStatus, string> = {
  idle: '',
  pending: '等待支付...',
  processing: '支付处理中...',
  success: '支付成功！',
  failed: '支付失败，请重试',
}

const statusIcon: Record<PayStatus, string> = {
  idle: '',
  pending: 'layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop',
  processing: 'layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop',
  success: 'layui-icon-ok-circle',
  failed: 'layui-icon-close-fill',
}
</script>

<template>
  <div class="lva-payment">
    <h2>支付方式</h2>
    <p class="lva-payment__desc">模拟支付流程，包含多种支付方式选择、二维码展示和状态流转。</p>

    <div class="lva-payment__main">
      <!-- 订单信息 -->
      <lay-card title="订单信息">
        <div class="lva-payment__order">
          <div class="lva-payment__order-row">
            <span class="lva-payment__label">商品名称</span>
            <span>{{ order.product }}</span>
          </div>
          <div class="lva-payment__order-row">
            <span class="lva-payment__label">订单编号</span>
            <span><code>{{ order.orderNo }}</code></span>
          </div>
          <div class="lva-payment__order-row lva-payment__order-row--total">
            <span class="lva-payment__label">支付金额</span>
            <span class="lva-payment__amount">¥ {{ order.amount.toFixed(2) }}</span>
          </div>
        </div>
      </lay-card>

      <!-- 支付方式选择 -->
      <lay-card title="选择支付方式" style="margin-top: 16px;">
        <div class="lva-payment__methods">
          <div
            v-for="m in methods"
            :key="m.key"
            class="lva-payment__method"
            :class="{ 'lva-payment__method--active': selectedMethod === m.key }"
            @click="selectedMethod = m.key"
          >
            <i class="layui-icon" :class="m.icon" :style="{ color: m.color }" />
            <span>{{ m.name }}</span>
          </div>
        </div>

        <!-- 二维码区域 -->
        <div v-if="payStatus === 'idle' && (selectedMethod === 'alipay' || selectedMethod === 'wechat')" class="lva-payment__qr-section">
          <p class="lva-payment__qr-tip">请使用{{ selectedMethod === 'alipay' ? '支付宝' : '微信' }}扫描二维码完成支付</p>
          <div class="lva-payment__qr">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <rect width="160" height="160" fill="#fff" stroke="#ddd" />
              <g fill="#333">
                <rect x="15" y="15" width="35" height="35" />
                <rect x="110" y="15" width="35" height="35" />
                <rect x="15" y="110" width="35" height="35" />
                <rect x="60" y="15" width="8" height="8" />
                <rect x="75" y="25" width="8" height="8" />
                <rect x="90" y="15" width="8" height="8" />
                <rect x="60" y="60" width="8" height="8" />
                <rect x="75" y="70" width="8" height="8" />
                <rect x="90" y="60" width="8" height="8" />
                <rect x="60" y="90" width="8" height="8" />
                <rect x="75" y="100" width="8" height="8" />
                <rect x="90" y="90" width="8" height="8" />
                <rect x="110" y="60" width="8" height="8" />
                <rect x="125" y="75" width="8" height="8" />
                <rect x="140" y="90" width="8" height="8" />
                <rect x="110" y="110" width="8" height="8" />
                <rect x="130" y="120" width="8" height="8" />
                <rect x="140" y="140" width="8" height="8" />
              </g>
            </svg>
          </div>
        </div>

        <!-- 银行卡/余额 -->
        <div v-if="payStatus === 'idle' && selectedMethod === 'bank'" class="lva-payment__bank-info">
          <p>银行卡号：**** **** **** 6688</p>
          <p>持卡人：张 **</p>
        </div>
        <div v-if="payStatus === 'idle' && selectedMethod === 'balance'" class="lva-payment__bank-info">
          <p>当前余额：¥ 5,280.50</p>
          <p>支付后余额：¥ {{ (5280.5 - order.amount).toFixed(2) }}</p>
        </div>

        <!-- 支付状态 -->
        <div v-if="payStatus !== 'idle'" class="lva-payment__status">
          <i class="layui-icon" :class="statusIcon[payStatus]" :style="{ color: payStatus === 'success' ? '#52c41a' : payStatus === 'failed' ? '#ff4d4f' : '#1677ff', fontSize: '48px' }" />
          <p>{{ statusText[payStatus] }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="lva-payment__actions">
          <lay-button v-if="payStatus === 'idle'" type="primary" @click="startPayment">确认支付 ¥{{ order.amount.toFixed(2) }}</lay-button>
          <lay-button v-if="payStatus === 'success' || payStatus === 'failed'" @click="resetPayment">重新下单</lay-button>
        </div>
      </lay-card>

      <!-- 支付历史 -->
      <lay-card title="支付历史" style="margin-top: 16px;">
        <table class="lva-payment__table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>商品</th>
              <th>金额</th>
              <th>方式</th>
              <th>状态</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in paymentHistory" :key="record.id">
              <td><code>{{ record.orderNo }}</code></td>
              <td>{{ record.product }}</td>
              <td>¥{{ record.amount.toFixed(2) }}</td>
              <td>{{ record.method }}</td>
              <td>
                <span :style="{ color: record.status === '成功' ? '#52c41a' : '#ff4d4f' }">{{ record.status }}</span>
              </td>
              <td>{{ record.time }}</td>
            </tr>
          </tbody>
        </table>
      </lay-card>
    </div>
  </div>
</template>

<style scoped>
.lva-payment { padding: 4px; }
.lva-payment h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-payment__desc { color: #666; font-size: 13px; margin-bottom: 20px; }

.lva-payment__order-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.lva-payment__order-row:last-child { border-bottom: none; }
.lva-payment__order-row--total { font-weight: 500; }
.lva-payment__label { color: #999; }
.lva-payment__amount { font-size: 22px; color: #ff4d4f; font-weight: 600; }

.lva-payment__methods { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.lva-payment__method {
  display: flex; align-items: center; gap: 8px; padding: 12px 20px;
  border: 2px solid #e8e8e8; border-radius: 8px; cursor: pointer; transition: all 0.2s;
}
.lva-payment__method:hover { border-color: var(--global-primary-color, #16baaa); }
.lva-payment__method--active { border-color: var(--global-primary-color, #16baaa); background: rgba(22, 186, 170, 0.04); }
.lva-payment__method i { font-size: 22px; }

.lva-payment__qr-section { text-align: center; padding: 16px 0; }
.lva-payment__qr-tip { font-size: 13px; color: #666; margin-bottom: 12px; }
.lva-payment__qr { display: flex; justify-content: center; }

.lva-payment__bank-info { padding: 16px; background: #f9f9f9; border-radius: 6px; font-size: 14px; color: #555; line-height: 2; }

.lva-payment__status { text-align: center; padding: 30px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.lva-payment__status p { font-size: 15px; color: #333; }

.lva-payment__actions { text-align: center; padding: 16px 0; }

.lva-payment__table { width: 100%; border-collapse: collapse; font-size: 13px; }
.lva-payment__table th { background: #fafafa; padding: 10px 12px; text-align: left; font-weight: 500; border-bottom: 1px solid #e8e8e8; }
.lva-payment__table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
.lva-payment__table code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
</style>
