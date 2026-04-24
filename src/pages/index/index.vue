<template>
  <view class="page-index">
    <!-- 顶部状态栏 -->
    <view class="status-bar safe-area-top">
      <view class="title-wrap">
        <text class="app-title">心选倒计时</text>
      </view>
      <view class="settings-btn" @click="goSettings">
        <image class="settings-icon" src="/static/icon-settings.png" mode="aspectFit" />
      </view>
    </view>

    <!-- 核心展示区 -->
    <view v-if="pinnedItem" class="countdown-main">
      <!-- 项目名称 -->
      <view class="name-card">
        <text class="project-name">{{ pinnedItem.name }}</text>
      </view>

      <!-- 类型标签 -->
      <TypeTag :type="pinnedItem.type" />

      <!-- 倒计时数字 -->
      <view class="countdown-clock" :class="{ 'is-expired': isExpired, 'is-warning': isWarning }">
        <!-- 第一行：天数大卡片 -->
        <view class="clock-row clock-row-days" v-if="countdownResult.days > 0">
          <view class="number-bubble number-bubble-lg">
            <text class="clock-number clock-number-lg">{{ countdownResult.days }}</text>
          </view>
          <text class="clock-unit-inline">天</text>
        </view>

        <!-- 第二行：时分秒小卡片 -->
        <view class="clock-row clock-row-time">
          <view class="time-card">
            <text class="clock-number clock-number-sm">{{ padZero(countdownResult.hours) }}</text>
            <text class="clock-unit-sm">时</text>
          </view>
          <view class="time-card">
            <text class="clock-number clock-number-sm">{{ padZero(countdownResult.minutes) }}</text>
            <text class="clock-unit-sm">分</text>
          </view>
          <view v-if="showSeconds" class="time-card">
            <text class="clock-number clock-number-sm">{{ padZero(countdownResult.seconds) }}</text>
            <text class="clock-unit-sm">秒</text>
          </view>
        </view>
      </view>

      <!-- 已结束标识 -->
      <view v-if="isExpired" class="expired-badge">
        <text class="expired-label">已结束</text>
      </view>

      <!-- 分割线 -->
      <view class="section-divider" />
    </view>

    <!-- 底部信息区（靠底部） -->
    <view v-if="pinnedItem" class="bottom-info">
      <!-- 目标日期 -->
      <view class="target-date-row">
        <text class="target-date-icon">📅</text>
        <text class="target-date-text">目标日期：{{ formattedDate }}</text>
      </view>

      <!-- 底部提示 -->
      <view class="bottom-hint">
        <text class="hint-text">当前展示：首页置顶项目 · 在全部列表中可切换</text>
      </view>
    </view>

    <!-- 无置顶项目时显示引导 -->
    <view v-else class="empty-wrapper">
      <view class="empty-illustration">
        <text class="empty-emoji-main">⏰</text>
      </view>
      <text class="empty-title">还没有置顶项目</text>
      <text class="empty-desc">在「全部」列表中点击星标即可设置置顶</text>
      <view class="empty-action" @click="goList">
        <text class="empty-action-text">去全部列表 →</text>
      </view>
    </view>

    <!-- 设置弹窗 -->
    <view v-if="showSettings" class="settings-layer">
      <view class="settings-mask" @click="showSettings = false" />
      <view class="settings-box" @click.stop>
        <!-- 头部 -->
        <view class="settings-header">
          <view class="settings-header-left">
            <text class="settings-header-icon">⚙</text>
            <text class="settings-header-title">设置</text>
          </view>
          <view class="settings-close" @click="showSettings = false">
            <text class="settings-close-x">✕</text>
          </view>
        </view>

        <!-- 内容 -->
        <view class="settings-body">
          <view class="tip-card">
            <view class="tip-header">
              <text class="tip-icon">💡</text>
              <text class="tip-title">使用提示</text>
            </view>
            <view class="tip-list">
              <view class="tip-item">
                <text class="tip-dot">•</text>
                <text class="tip-text">在全部倒计时中点击星标可设置首页置顶</text>
              </view>
              <view class="tip-item">
                <text class="tip-dot">•</text>
                <text class="tip-text">只有一个倒计时可被置顶，新置顶会替换旧的</text>
              </view>
              <view class="tip-item">
                <text class="tip-dot">•</text>
                <text class="tip-text">倒计时到期后会自动显示「已结束」状态</text>
              </view>
              <view class="tip-item">
                <text class="tip-dot">•</text>
                <text class="tip-text">剩余7天内倒计时数字会自动变红预警</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部 -->
        <view class="settings-footer">
          <view class="settings-footer-divider" />
          <text class="settings-footer-version">心选倒计时 v1.0</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 首页 - 心选倒计时（核心页面）
 * 清新蓝简约风设计
 */
import { ref, computed } from 'vue'
import { onShow, onUnload } from '@dcloudio/uni-app'
import TypeTag from '@/components/TypeTag.vue'
import { useCountdownStore } from '@/stores/countdown'
import { useSettingsStore } from '@/stores/settings'
import { calculateCountdown } from '@/services/countdown'
import { isWithinDays } from '@/utils'

const countdownStore = useCountdownStore()
const settingsStore = useSettingsStore()
const showSettings = ref(false)

const countdownResult = ref({
  days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true
})

let timerId: ReturnType<typeof setInterval> | null = null

const pinnedItem = computed(() => countdownStore.pinnedItem)
const isExpired = computed(() => countdownResult.value.isExpired)
const isWarning = computed(() => {
  if (isExpired.value || !pinnedItem.value) return false
  return isWithinDays(pinnedItem.value.targetDate, 7)
})
const showSeconds = computed(() => settingsStore.settings.showSeconds)

const formattedDate = computed(() => {
  if (!pinnedItem.value) return ''
  const d = new Date(pinnedItem.value.targetDate)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}年${m}月${day}日 ${h}:${min}`
})

const padZero = (n: number) => String(n).padStart(2, '0')

const updateCountdown = () => {
  if (pinnedItem.value) {
    countdownResult.value = calculateCountdown(pinnedItem.value.targetDate)
  }
}

const startTimer = () => {
  stopTimer()
  updateCountdown()
  timerId = setInterval(updateCountdown, 1000)
}

const stopTimer = () => {
  if (timerId) { clearInterval(timerId); timerId = null }
}

onShow(() => {
  countdownStore.loadList()
  startTimer()
})

onUnload(() => stopTimer())

const goSettings = () => { showSettings.value = true }
const goList = () => uni.switchTab({ url: '/pages/list/list' })
</script>

<style lang="scss" scoped>
/* ========== 页面基础 ========== */
.page-index {
  height: 100vh;
  background: #E8EEF8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* ========== 顶部状态栏 ========== */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 36rpx 16rpx;
}

.title-wrap {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A2E;
  letter-spacing: 2rpx;
}

.settings-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-icon {
  width: 44rpx;
  height: 44rpx;
}

/* ========== 核心展示区 ========== */
.countdown-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 48rpx;
  overflow: hidden;
}

/* 项目名称 - 纯文字标题 */
.name-card {
  margin-bottom: 16rpx;
  text-align: center;
}

.project-name {
  font-size: 44rpx;
  font-weight: 800;
  color: #1A1A2E;
  text-align: center;
  letter-spacing: 4rpx;
}

/* ========== 倒计时数字 ========== */
.countdown-clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  margin: 32rpx 0;
}

.clock-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.clock-row-days {
  gap: 16rpx;
  align-items: baseline;
}

.clock-row-time {
  gap: 16rpx;
}

/* 天数大卡片 */
.number-bubble-lg {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  padding: 20rpx 56rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.clock-number-lg {
  font-size: 160rpx;
  font-weight: 800;
  color: #1A1A2E;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  min-width: 140rpx;
  text-align: center;
}

.clock-unit-inline {
  font-size: 40rpx;
  font-weight: 600;
  color: #8B9DC3;
}

/* 时分秒小卡片 - 数字和单位在同一个卡片内 */
.time-card {
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 16rpx 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.clock-number-sm {
  font-size: 56rpx;
  font-weight: 700;
  color: #1A1A2E;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  min-width: 56rpx;
  text-align: center;
}

.clock-unit-sm {
  font-size: 22rpx;
  font-weight: 500;
  color: #8B9DC3;
}

/* 预警样式 */
.is-warning .number-bubble-lg {
  background-color: #FFF1F0;
}

.is-warning .clock-number-lg {
  color: #FF4D4F;
}

.is-warning .time-card {
  background-color: #FFF1F0;
}

.is-warning .clock-number-sm {
  color: #FF4D4F;
}

/* 已结束样式 */
.is-expired .number-bubble-lg {
  background-color: #FAFAFA;
}

.is-expired .clock-number-lg {
  color: #BFBFBF;
}

.is-expired .clock-unit-inline {
  color: #D9D9D9;
}

.is-expired .time-card {
  background-color: #FAFAFA;
}

.is-expired .clock-number-sm {
  color: #BFBFBF;
}

/* 已结束标识 */
.expired-badge {
  display: flex;
  align-items: center;
  background-color: #F5F5F5;
  border-radius: 20rpx;
  padding: 8rpx 32rpx;
  margin-top: -12rpx;
  margin-bottom: 20rpx;
}

.expired-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #BFBFBF;
}

/* ========== 底部信息区 ========== */
.bottom-info {
  flex-shrink: 0;
  padding: 0 48rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

/* 分割线 */
.section-divider {
  width: 80%;
  height: 1rpx;
  background-color: rgba(139, 157, 195, 0.3);
  margin: 0 auto 20rpx;
}

/* 目标日期 */
.target-date-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.target-date-icon {
  font-size: 28rpx;
}

.target-date-text {
  font-size: 26rpx;
  color: #8B9DC3;
  font-weight: 400;
}

/* 底部提示 */
.bottom-hint {
  padding-top: 12rpx;
  text-align: center;
}

.hint-text {
  font-size: 22rpx;
  color: #B0BDD4;
  font-weight: 400;
}

/* ========== 空状态 ========== */
.empty-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 48rpx;
}

.empty-illustration {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(139, 157, 195, 0.15);
  border-radius: 50%;
}

.empty-emoji-main {
  font-size: 72rpx;
}

.empty-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #8B9DC3;
  text-align: center;
  margin-bottom: 48rpx;
  line-height: 1.6;
}

.empty-action {
  padding: 20rpx 56rpx;
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.3);
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.96);
  }

  .empty-action-text {
    font-size: 28rpx;
    color: #FFFFFF;
    font-weight: 600;
  }
}

/* ========== 设置弹窗 ========== */
.settings-layer {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 999;
}

.settings-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

.settings-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 82%;
  max-width: 600rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.15);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 28rpx 16rpx;
  flex-shrink: 0;
}

.settings-header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.settings-header-icon {
  font-size: 36rpx;
}

.settings-header-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.settings-close {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-close-x {
  font-size: 24rpx;
  color: #999999;
}

.settings-body {
  padding: 4rpx 28rpx 16rpx;
}

.tip-card {
  background-color: #EFF6FF;
  border-radius: 16rpx;
  padding: 24rpx;
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.tip-icon {
  font-size: 28rpx;
}

.tip-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2563EB;
}

.tip-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.tip-dot {
  font-size: 24rpx;
  color: #2563EB;
  line-height: 1.6;
}

.tip-text {
  font-size: 24rpx;
  color: #3B82F6;
  line-height: 1.6;
  flex: 1;
}

.settings-footer {
  padding: 8rpx 28rpx 24rpx;
  flex-shrink: 0;
}

.settings-footer-divider {
  height: 1rpx;
  background-color: #F0F0F0;
  margin-bottom: 16rpx;
}

.settings-footer-version {
  font-size: 22rpx;
  color: #BFBFBF;
  text-align: center;
  display: block;
}
</style>
