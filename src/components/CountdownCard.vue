<template>
  <view class="countdown-card" @click="handleClick">
    <!-- 左侧装饰条 -->
    <view class="card-accent" :style="{ backgroundColor: accentColor }" />

    <!-- 卡片内容 -->
    <view class="card-body">
      <!-- 标题行 -->
      <view class="card-header">
        <view class="card-title-row">
          <text class="pin-star" :class="{ 'is-pinned': isPinned }" @click.stop="handlePin">★</text>
          <text class="card-title">{{ item.name }}</text>
        </view>
        <view class="card-more" @click.stop="handleMore">
          <view class="more-dots">
            <view class="dot" />
            <view class="dot" />
            <view class="dot" />
          </view>
          <!-- 悬浮下拉菜单 -->
          <view v-if="showPopover" class="popover-menu" @click.stop>
            <view
              v-for="(action, idx) in popoverActions"
              :key="idx"
              class="popover-item"
              :class="{ 'is-danger': action.danger }"
              @click.stop="$emit('popoverAction', action)"
            >
              <text class="popover-icon">{{ action.icon }}</text>
              <text class="popover-label">{{ action.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 类型标签 -->
      <view class="card-tags">
        <TypeTag :type="item.type" />
      </view>

      <!-- 目标日期 -->
      <text class="card-date">{{ formattedDate }}</text>

      <!-- 倒计时 -->
      <view class="card-countdown" :class="{ 'is-expired': isExpired, 'is-warning': isWarning }">
        <text class="countdown-text">{{ countdownText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 倒计时卡片组件
 * 仅负责UI渲染，通过 props 接收数据，通过 emit 触发事件
 */
import { computed } from 'vue'
import TypeTag from './TypeTag.vue'
import { calculateCountdown, formatCountdown, getCountdownTypeColor } from '@/services/countdown'
import { isWithinDays } from '@/utils'
import type { CountdownItem } from '@/types'

interface Props {
  item: CountdownItem
  isPinned?: boolean
  showPopover?: boolean
  popoverActions?: Array<{ label: string; icon: string; danger?: boolean; action: string }>
}

const props = withDefaults(defineProps<Props>(), {
  isPinned: false,
  showPopover: false,
  popoverActions: () => []
})

const emit = defineEmits<{
  (e: 'click', item: CountdownItem): void
  (e: 'pin', item: CountdownItem): void
  (e: 'more', item: CountdownItem): void
  (e: 'popoverAction', action: { label: string; icon: string; danger?: boolean; action: string }): void
}>()

/** 装饰条颜色 - 使用项目自身颜色 */
const accentColor = computed(() => {
  return props.item.color || getCountdownTypeColor(props.item.type)
})

/** 格式化日期显示 */
const formattedDate = computed(() => {
  const date = new Date(props.item.targetDate)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
})

/** 倒计时文本 */
const countdownText = computed(() => {
  const result = calculateCountdown(props.item.targetDate)
  if (result.isExpired) return '已到期'
  return formatCountdown(result, false)
})

/** 是否已过期 */
const isExpired = computed(() => {
  return new Date(props.item.targetDate).getTime() <= Date.now()
})

/** 是否预警（7天内） */
const isWarning = computed(() => {
  return !isExpired.value && isWithinDays(props.item.targetDate, 7)
})

const handleClick = () => emit('click', props.item)
const handleMore = () => emit('more', props.item)
const handlePin = () => emit('pin', props.item)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.countdown-card {
  display: flex;
  flex-direction: row;
  background-color: #FFFFFF;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

/* 左侧装饰条 - 用伪元素实现，完美贴合卡片圆角 */
.card-accent {
  width: 8rpx;
  flex-shrink: 0;
  border-radius: 20rpx 0 0 20rpx;
}

/* 卡片主体 */
.card-body {
  flex: 1;
  padding: 28rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

/* 标题行 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
  min-width: 0;
}

.pin-star {
  font-size: 32rpx;
  color: #DDDDDD;
  flex-shrink: 0;
  transition: color 0.2s;

  &.is-pinned {
    color: #FFC107;
  }
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A2E;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 更多按钮 - 简洁竖向省略号 */
.card-more {
  padding: 16rpx 12rpx;
  flex-shrink: 0;
  position: relative;
}

.more-dots {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #BFBFBF;
}

/* 悬浮下拉菜单 */
.popover-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 280rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  z-index: 100;
  overflow: hidden;
  margin-top: 8rpx;
}

.popover-item {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  transition: background-color 0.15s;

  &:active {
    background-color: #F5F5F5;
  }

  &:not(:last-child) {
    border-bottom: 1rpx solid #F0F0F0;
  }

  &.is-danger .popover-label {
    color: #FF4D4F;
  }
}

.popover-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.popover-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

/* 类型标签 */
.card-tags {
  display: flex;
  align-items: center;
}

/* 目标日期 */
.card-date {
  font-size: 24rpx;
  color: #8C8C8C;
}

/* 倒计时 */
.card-countdown {
  .countdown-text {
    font-size: 36rpx;
    font-weight: 600;
    color: #333333;
    letter-spacing: 2rpx;
  }

  &.is-warning .countdown-text {
    color: #FA3534;
  }

  &.is-expired .countdown-text {
    color: #BBBBBB;
  }
}
</style>
