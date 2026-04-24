<template>
  <view class="type-tag" :style="tagStyle">
    <text class="type-tag-text">{{ tagLabel }}</text>
  </view>
</template>

<script setup lang="ts">
/**
 * 类型标签组件
 * 仅负责UI渲染，展示彩色类型标签
 */
import { computed } from 'vue'
import { getCountdownTypeLabel, getCountdownTypeColor } from '@/services/countdown'
import type { CountdownType } from '@/types'

interface Props {
  type: CountdownType | string
}

const props = defineProps<Props>()

const tagLabel = computed(() => getCountdownTypeLabel(props.type))

const tagStyle = computed(() => {
  const color = getCountdownTypeColor(props.type)
  return {
    backgroundColor: color + '18',
    color: color,
  }
})
</script>

<style lang="scss" scoped>
.type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.type-tag-text {
  font-size: 22rpx;
  line-height: 1.2;
  font-weight: 600;
}
</style>
