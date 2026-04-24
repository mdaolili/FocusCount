<template>
  <view class="countdown-display" :class="{ 'is-expired': isExpired, 'is-warning': isWarning }">
    <!-- 已结束状态 -->
    <view v-if="isExpired" class="expired-label">已结束</view>

    <!-- 倒计时数字 -->
    <view class="countdown-digits">
      <view class="digit-block">
        <text class="digit-value">{{ result.days }}</text>
        <text class="digit-unit">天</text>
      </view>
      <text class="digit-separator">:</text>
      <view class="digit-block">
        <text class="digit-value">{{ result.hours }}</text>
        <text class="digit-unit">时</text>
      </view>
      <text class="digit-separator">:</text>
      <view class="digit-block">
        <text class="digit-value">{{ result.minutes }}</text>
        <text class="digit-unit">分</text>
      </view>
      <template v-if="showSeconds">
        <text class="digit-separator">:</text>
        <view class="digit-block">
          <text class="digit-value">{{ result.seconds }}</text>
          <text class="digit-unit">秒</text>
        </view>
      </template>
    </view>

    <!-- 剩余总天数提示 -->
    <view v-if="!isExpired" class="countdown-summary">
      剩余 {{ result.totalDays }} 天
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 倒计时数字展示组件
 * 仅负责UI渲染，展示超大倒计时数字
 * 预警样式（7天内变红、已结束灰色）由父组件通过 props 控制
 */

import { computed } from 'vue'
import type { CountdownResult } from '@/types'

interface Props {
  /** 倒计时计算结果 */
  result: CountdownResult & { totalDays?: number }
  /** 是否显示秒 */
  showSeconds?: boolean
  /** 是否已过期 */
  isExpired?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSeconds: true,
  isExpired: false
})

/** 预警状态：剩余7天内 */
const isWarning = computed(() => {
  const totalDays = props.result.totalDays ?? Math.floor(props.result.totalSeconds / (60 * 60 * 24))
  return !props.isExpired && totalDays <= 7 && totalDays >= 0
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.countdown-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl 0;
}

/* 倒计时数字区域 */
.countdown-digits {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
}

/* 单个数字块 */
.digit-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.digit-value {
  font-size: $font-size-countdown;
  font-weight: 700;
  line-height: 1.1;
  color: var(--primary-color);
  font-variant-numeric: tabular-nums;
  min-width: 2ch;
  text-align: center;
}

.digit-unit {
  font-size: $font-size-sm;
  color: var(--text-color-secondary);
  margin-top: $spacing-xs;
}

/* 分隔符 */
.digit-separator {
  font-size: $font-size-xxl;
  font-weight: 700;
  color: var(--text-color-secondary);
  margin: 0 $spacing-xs;
  padding-bottom: $spacing-lg;
}

/* 剩余总天数 */
.countdown-summary {
  font-size: $font-size-md;
  color: var(--text-color-secondary);
  margin-top: $spacing-lg;
}

/* 预警样式：7天内变红 */
.is-warning {
  .digit-value {
    color: $color-danger;
  }

  .countdown-summary {
    color: $color-danger;
  }
}

/* 已结束样式 */
.is-expired {
  .digit-value {
    color: var(--text-color-placeholder);
  }

  .digit-separator {
    color: var(--text-color-placeholder);
  }

  .countdown-summary {
    color: var(--text-color-placeholder);
  }
}

.expired-label {
  font-size: $font-size-xl;
  font-weight: 700;
  color: var(--text-color-placeholder);
  margin-bottom: $spacing-md;
}
</style>
