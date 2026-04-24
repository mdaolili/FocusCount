<!--
  FocusCount - 桌面小组件组件
  展示置顶倒计时项目的名称和剩余天数
  简洁设计，适配桌面小组件尺寸限制
  支持暗黑/浅色模式

  注意：此组件为小组件 UI 模板，实际桌面小组件需要原生开发配合
  在 UniApp 中可作为页面内嵌组件或预览组件使用
-->
<template>
  <view class="countdown-widget" :class="{ 'is-dark': isDark }">
    <!-- 有数据时展示倒计时卡片 -->
    <view v-if="displayData" class="widget-card">
      <!-- 顶部颜色条 -->
      <view class="widget-accent" :style="{ backgroundColor: displayData.color }" />

      <!-- 主体内容区 -->
      <view class="widget-body">
        <!-- 倒计时天数（大字体） -->
        <view class="widget-days-section">
          <text class="widget-days-number">{{ displayData.days }}</text>
          <text class="widget-days-unit">{{ displayData.unit }}</text>
        </view>

        <!-- 项目名称 -->
        <text class="widget-name">{{ displayData.name }}</text>

        <!-- 目标日期 -->
        <text class="widget-date">{{ displayData.targetDateText }}</text>
      </view>
    </view>

    <!-- 无数据时展示空状态 -->
    <view v-else class="widget-empty">
      <text class="widget-empty-icon">&#9200;</text>
      <text class="widget-empty-text">暂无置顶倒计时</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 桌面小组件组件
 * 仅负责 UI 渲染，数据通过 props 接收
 * 业务逻辑由 widget-service.ts 提供
 */
import { computed } from 'vue'
import type { WidgetDisplayData } from './widget-service'

/** 组件属性 */
const props = defineProps<{
  /** 小组件展示数据，由父组件通过 widget-service 获取后传入 */
  displayData: WidgetDisplayData | null
  /** 主题模式，默认浅色 */
  theme?: 'light' | 'dark'
}>()

/** 是否为暗黑模式 */
const isDark = computed(() => props.theme === 'dark')
</script>

<style scoped lang="scss">
/* 桌面小组件样式 - 简洁紧凑设计 */

.countdown-widget {
  width: 100%;
  min-height: 120rpx;
  border-radius: 16rpx;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* ========== 有数据时的卡片样式 ========== */
.widget-card {
  position: relative;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* 顶部颜色装饰条 */
.widget-accent {
  height: 6rpx;
  width: 100%;
}

/* 主体内容 */
.widget-body {
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 天数展示区域 */
.widget-days-section {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 8rpx;
}

/* 天数数字 - 大字体突出显示 */
.widget-days-number {
  font-size: 72rpx;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  letter-spacing: -2rpx;
}

/* 天数单位 */
.widget-days-unit {
  font-size: 24rpx;
  color: #909399;
  margin-left: 8rpx;
  font-weight: 500;
}

/* 项目名称 */
.widget-name {
  font-size: 28rpx;
  color: #606266;
  font-weight: 500;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4rpx;
}

/* 目标日期 */
.widget-date {
  font-size: 22rpx;
  color: #c0c4cc;
  text-align: center;
}

/* ========== 空状态样式 ========== */
.widget-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.widget-empty-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
  opacity: 0.4;
}

.widget-empty-text {
  font-size: 24rpx;
  color: #c0c4cc;
}

/* ========== 暗黑模式样式 ========== */
.is-dark .widget-card {
  background-color: #2c2c2c;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.3);
}

.is-dark .widget-days-number {
  color: #e5eaf3;
}

.is-dark .widget-days-unit {
  color: #a3a6ad;
}

.is-dark .widget-name {
  color: #cfd3dc;
}

.is-dark .widget-date {
  color: #82848a;
}

.is-dark .widget-empty {
  background-color: #2c2c2c;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.3);
}

.is-dark .widget-empty-text {
  color: #82848a;
}
</style>
