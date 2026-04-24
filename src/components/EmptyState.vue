<template>
  <view class="empty-state">
    <!-- 图标 -->
    <view class="empty-icon">
      <u-icon :name="icon" size="120" color="var(--text-color-placeholder)" />
    </view>

    <!-- 提示文字 -->
    <text class="empty-text">{{ text }}</text>

    <!-- 插槽：可放置操作按钮 -->
    <view v-if="$slots.action" class="empty-action">
      <slot name="action"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 空状态组件
 * 仅负责UI渲染，无数据时展示引导
 */

interface Props {
  /** 提示文字 */
  text?: string
  /** 图标名称（uView Plus 图标） */
  icon?: string
}

withDefaults(defineProps<Props>(), {
  text: '暂无数据',
  icon: 'clock'
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xxl * 2 $spacing-xl;
}

.empty-icon {
  margin-bottom: $spacing-lg;
  opacity: 0.5;
}

.empty-text {
  font-size: $font-size-base;
  color: var(--text-color-secondary);
  text-align: center;
  line-height: 1.6;
}

.empty-action {
  margin-top: $spacing-xl;
}
</style>
