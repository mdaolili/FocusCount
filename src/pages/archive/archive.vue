<template>
  <view class="page-archive">
    <!-- 顶部导航栏 -->
    <view class="nav-bar safe-area-top">
      <text class="nav-title">已归档</text>
      <view v-if="archivedItems.length > 0" class="nav-actions">
        <text class="archive-count">共{{ archivedItems.length }}项</text>
      </view>
    </view>

    <!-- 列表区域 -->
    <scroll-view
      class="archive-scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 有归档数据时显示列表 -->
      <view v-if="archivedItems.length > 0" class="archive-content">
        <view
          v-for="item in archivedItems"
          :key="item.id"
          class="archive-card card-base animate-fade-in"
        >
          <!-- 卡片主体 -->
          <view class="card-main" @click="handleCardClick(item)">
            <!-- 左侧颜色条 -->
            <view class="card-color-bar" :style="{ backgroundColor: getTypeColor(item.type) }" />

            <view class="card-info">
              <!-- 名称 + 类型 -->
              <view class="card-header">
                <text class="card-title text-ellipsis">{{ item.name }}</text>
                <view class="type-badge" :style="{ backgroundColor: getTypeColor(item.type) + '20', color: getTypeColor(item.type) }">
                  <text class="type-text">{{ getTypeLabel(item.type) }}</text>
                </view>
              </view>

              <!-- 目标日期 -->
              <text class="card-date">{{ item.targetDate }}</text>

              <!-- 归档时间 -->
              <text class="card-archive-time">归档于 {{ formatTime(item.updatedAt) }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="card-actions">
            <view class="action-btn restore-btn" @click="handleRestore(item)">
              <u-icon name="reload" size="32" color="#19BE6B" />
              <text class="action-text restore-text">恢复</text>
            </view>
            <view class="action-divider" />
            <view class="action-btn delete-btn" @click="handleDelete(item)">
              <u-icon name="trash" size="32" color="#FA3534" />
              <text class="action-text delete-text">彻底删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 无归档数据时显示空状态 -->
      <EmptyState
        v-else
        text="暂无归档项目"
        icon="archive"
      >
        <template #action>
          <u-button type="primary" text="返回列表" @click="goBack" />
        </template>
      </EmptyState>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
/**
 * 已归档页面
 * 展示所有已归档的倒计时项目，支持取消归档和彻底删除
 * 仅负责UI渲染和用户交互触发，业务逻辑通过 store 和 service 调用
 */

import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import EmptyState from '@/components/EmptyState.vue'
import { useCountdownStore } from '@/stores/countdown'
import { getCountdownTypeLabel, getCountdownTypeColor } from '@/services/countdown'
import type { CountdownItem } from '@/types'

const countdownStore = useCountdownStore()

/** 下拉刷新状态 */
const isRefreshing = ref(false)

/** 已归档的项目列表 */
const archivedItems = computed(() => {
  return countdownStore.archivedList
})

/** 页面显示时加载数据 */
onShow(() => {
  countdownStore.loadList()
})

/** 获取类型标签 */
const getTypeLabel = (type: CountdownItem['type']): string => {
  return getCountdownTypeLabel(type)
}

/** 获取类型颜色 */
const getTypeColor = (type: CountdownItem['type']): string => {
  return getCountdownTypeColor(type)
}

/** 格式化时间显示 */
const formatTime = (isoStr: string): string => {
  const date = new Date(isoStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/** 下拉刷新 */
const onRefresh = () => {
  isRefreshing.value = true
  countdownStore.loadList()
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

/** 点击卡片 - 查看详情 */
const handleCardClick = (item: CountdownItem) => {
  uni.showModal({
    title: item.name,
    content: `目标日期：${item.targetDate}\n类型：${getTypeLabel(item.type)}\n归档时间：${formatTime(item.updatedAt)}`,
    showCancel: false,
    confirmText: '关闭'
  })
}

/** 取消归档（恢复到列表） */
const handleRestore = (item: CountdownItem) => {
  uni.showModal({
    title: '确认恢复',
    content: `确定要将「${item.name}」恢复到列表中吗？`,
    success: (res) => {
      if (res.confirm) {
        countdownStore.toggleArchive(item.id)
        uni.showToast({ title: '已恢复到列表', icon: 'success' })
      }
    }
  })
}

/** 彻底删除 */
const handleDelete = (item: CountdownItem) => {
  uni.showModal({
    title: '彻底删除',
    content: `确定要彻底删除「${item.name}」吗？此操作不可恢复！`,
    confirmColor: '#FA3534',
    success: (res) => {
      if (res.confirm) {
        countdownStore.deleteItem(item.id)
        uni.showToast({ title: '已彻底删除', icon: 'success' })
      }
    }
  })
}

/** 返回列表 */
const goBack = () => {
  uni.switchTab({ url: '/pages/list/list' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/common.scss';

.page-archive {
  min-height: 100vh;
  background-color: var(--bg-color-page);
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-lg;
  background-color: var(--bg-color-card);
}

.nav-title {
  font-size: $font-size-lg;
  font-weight: 700;
  color: var(--text-color-primary);
}

.nav-actions {
  display: flex;
  align-items: center;
}

.archive-count {
  font-size: $font-size-sm;
  color: var(--text-color-secondary);
}

/* 列表滚动区域 */
.archive-scroll {
  flex: 1;
  height: calc(100vh - 100rpx - 100rpx);
}

/* 列表内容 */
.archive-content {
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc(#{$spacing-lg} + #{$safe-area-bottom});
}

/* 归档卡片 */
.archive-card {
  padding: 0;
  overflow: hidden;
}

.card-main {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

/* 左侧颜色条 */
.card-color-bar {
  width: 8rpx;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

/* 头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
}

.card-title {
  flex: 1;
  font-size: $font-size-md;
  font-weight: 600;
  color: var(--text-color-primary);
}

.type-badge {
  padding: 4rpx 16rpx;
  border-radius: $border-radius-round;
  flex-shrink: 0;
}

.type-text {
  font-size: $font-size-xs;
  font-weight: 500;
}

/* 日期信息 */
.card-date {
  font-size: $font-size-sm;
  color: var(--text-color-regular);
}

.card-archive-time {
  font-size: $font-size-xs;
  color: var(--text-color-placeholder);
}

/* 操作按钮区域 */
.card-actions {
  display: flex;
  flex-direction: row;
  border-top: 1rpx solid var(--border-color-light);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  padding: $spacing-md 0;
  transition: background-color 0.2s ease;

  &:active {
    background-color: var(--bg-color-hover);
  }
}

.action-divider {
  width: 1rpx;
  background-color: var(--border-color-light);
}

.action-text {
  font-size: $font-size-sm;
  font-weight: 500;
}

.restore-text {
  color: #19BE6B;
}

.delete-text {
  color: #FA3534;
}
</style>
