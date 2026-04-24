<script setup lang="ts">
/**
 * App.vue - 根组件
 * 应用级别的全局配置和生命周期
 */
</script>

<template>
  <view>
    <slot />
  </view>
</template>

<style lang="scss">
/* 引入全局样式 */
@import '@/styles/global.scss';
/* 引入动画样式 */
@import '@/styles/animations.scss';
</style>
