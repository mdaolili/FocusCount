<template>
  <view class="page-settings">
    <!-- 遮罩层 -->
    <view class="dialog-mask" @click="goBack" />

    <!-- 居中弹窗 -->
    <view class="dialog-box" @click.stop>
      <!-- 头部 -->
      <view class="dialog-header">
        <view class="header-left">
          <text class="header-icon">⚙</text>
          <text class="dialog-title">设置</text>
        </view>
        <view class="dialog-close" @click="goBack">
          <text class="close-x">✕</text>
        </view>
      </view>

      <!-- 内容区域 -->
      <view class="dialog-body">
        <!-- 使用提示 -->
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

      <!-- 底部分割线 + 版本信息 -->
      <view class="dialog-footer">
        <view class="footer-divider" />
        <text class="footer-version">心选倒计时 v1.0</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 设置页 - 居中弹窗
 */
const goBack = () => uni.navigateBack()
</script>

<style lang="scss" scoped>
.page-settings {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 999;
}

/* 遮罩层 */
.dialog-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

/* 居中弹窗 */
.dialog-box {
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

/* 头部 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 28rpx 16rpx;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.header-icon {
  font-size: 36rpx;
}

.dialog-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.dialog-close {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-x {
  font-size: 24rpx;
  color: #999999;
}

/* 内容区域 */
.dialog-body {
  padding: 4rpx 28rpx 16rpx;
}

/* 使用提示卡片 */
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

/* 底部 */
.dialog-footer {
  padding: 8rpx 28rpx 24rpx;
  flex-shrink: 0;
}

.footer-divider {
  height: 1rpx;
  background-color: #F0F0F0;
  margin-bottom: 16rpx;
}

.footer-version {
  font-size: 22rpx;
  color: #BFBFBF;
  text-align: center;
  display: block;
}
</style>
