<template>
  <view class="page-add">
    <!-- 遮罩 -->
    <view class="popup-mask" @click="goBack" />

    <!-- 居中弹窗 -->
    <view class="popup-dialog">
      <!-- 弹窗头部 -->
      <view class="popup-header">
        <text class="popup-title">新建倒计时</text>
        <view class="popup-close" @click="goBack">
          <text class="close-icon">✕</text>
        </view>
      </view>

      <!-- 表单内容 -->
      <scroll-view class="popup-body" scroll-y>
        <!-- 项目名称 -->
        <view class="form-item">
          <text class="form-label">标题</text>
          <view class="form-input-wrap">
            <input
              v-model="formData.name"
              class="form-input"
              placeholder="输入倒计时名称"
              placeholder-class="input-placeholder"
              :maxlength="50"
            />
          </view>
        </view>

        <!-- 分类选择 - 勾选样式 -->
        <view class="form-item">
          <text class="form-label">分类</text>
          <view class="type-check-list">
            <view
              v-for="(opt, idx) in typeOptions"
              :key="opt.value"
              class="type-check-item"
              :class="{ 'is-checked': typeIndex === idx }"
              @click="handleTypeSelect(idx)"
            >
              <view class="type-check-box" :class="{ 'is-checked': typeIndex === idx }">
                <text v-if="typeIndex === idx" class="type-check-mark">✓</text>
              </view>
              <view
                class="type-color-dot"
                :style="{ backgroundColor: getCountdownTypeColor(opt.value) }"
              />
              <text class="type-check-label">{{ opt.label }}</text>
            </view>
          </view>
        </view>

        <!-- 目标日期 -->
        <view class="form-item">
          <text class="form-label">目标日期</text>
          <picker
            mode="date"
            :value="formData.targetDate"
            :start="todayStr"
            @change="handleDateChange"
          >
            <view class="form-select-wrap">
              <text class="select-text" :class="{ 'is-placeholder': !formData.targetDate }">
                {{ formData.targetDate || '请选择日期' }}
              </text>
              <text class="select-icon">📅</text>
            </view>
          </picker>
        </view>

        <!-- 时间 -->
        <view class="form-item">
          <text class="form-label">时间</text>
          <picker
            mode="time"
            :value="formData.targetTime"
            @change="handleTimeChange"
          >
            <view class="form-select-wrap">
              <text class="select-text" :class="{ 'is-placeholder': !formData.targetTime }">
                {{ formData.targetTime || '00:00' }}
              </text>
              <text class="select-icon">🕐</text>
            </view>
          </picker>
        </view>

        <!-- 颜色标签 - 精细样式 -->
        <view class="form-item">
          <text class="form-label">颜色标签</text>
          <view class="color-panel">
            <view
              v-for="color in colorOptions"
              :key="color"
              class="color-item"
              :class="{ 'is-selected': formData.color === color }"
              @click="formData.color = color"
            >
              <view class="color-circle" :style="{ backgroundColor: color }">
                <text v-if="formData.color === color" class="color-check">✓</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 提醒设置 -->
        <view class="form-item">
          <text class="form-label">提醒设置</text>
          <view class="reminder-list">
            <view
              v-for="opt in reminderOptions"
              :key="opt.value"
              class="reminder-item"
              @click="toggleReminder(opt.value)"
            >
              <view class="checkbox" :class="{ 'is-checked': formData.reminderKeys.includes(opt.value) }">
                <text v-if="formData.reminderKeys.includes(opt.value)" class="check-mark">✓</text>
              </view>
              <text class="reminder-text">{{ opt.label }}</text>
            </view>
          </view>
        </view>

        <!-- 每年重复（纪念日/生日） -->
        <view v-if="formData.type === 'anniversary' || formData.type === 'birthday'" class="form-item repeat-item">
          <view class="repeat-row">
            <text class="form-label" style="margin-bottom:0">每年重复</text>
            <view class="repeat-switch" :class="{ on: formData.isRecurring }" @click="formData.isRecurring = !formData.isRecurring">
              <view class="repeat-dot" />
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部保存按钮 -->
      <view class="popup-footer">
        <view class="save-btn" :class="{ 'is-disabled': !canSave }" @click="handleSave">
          <text class="save-btn-text">保存</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 新增倒计时页 - 居中弹窗式表单
 * 使用 uni-app 原生 picker 组件
 */
import { ref, reactive, computed } from 'vue'
import { useCountdownStore } from '@/stores/countdown'
import { getCountdownTypeColor } from '@/services/countdown'
import type { CountdownType } from '@/types'

const countdownStore = useCountdownStore()

/** 类型选项 */
const typeOptions: Array<{ label: string; value: CountdownType }> = [
  { label: '考试', value: 'exam' },
  { label: '项目截止', value: 'deadline' },
  { label: '纪念日', value: 'anniversary' },
  { label: '生日', value: 'birthday' },
  { label: '自定义', value: 'custom' }
]

const typeIndex = ref(4) // 默认选中"自定义"

/** 今天日期字符串 */
const todayStr = new Date().toISOString().split('T')[0]

const reminderOptions = [
  { label: '当天提醒', value: 'today' },
  { label: '提前1天', value: '1day' },
  { label: '提前3天', value: '3days' },
  { label: '提前7天', value: '7days' }
]

const reminderValueMap: Record<string, number> = {
  'today': 0, '1day': 1, '3days': 3, '7days': 7
}

const colorOptions = [
  '#FA3534', '#FF9900', '#FFC107', '#19BE6B',
  '#2196F3', '#8B5CF6', '#E91E8C'
]

const formData = reactive({
  name: '',
  type: 'custom' as CountdownType,
  targetDate: '',
  targetTime: '00:00',
  reminderKeys: ['today'] as string[],
  isRecurring: false,
  color: '#2196F3'
})

const canSave = computed(() => formData.name.trim() !== '' && formData.targetDate !== '')

const toggleReminder = (value: string) => {
  const idx = formData.reminderKeys.indexOf(value)
  if (idx > -1) formData.reminderKeys.splice(idx, 1)
  else formData.reminderKeys.push(value)
}

/** 分类勾选 */
const handleTypeSelect = (index: number) => {
  typeIndex.value = index
  const type = typeOptions[index].value
  formData.type = type
  if (type === 'anniversary' || type === 'birthday') {
    formData.isRecurring = true
  } else {
    formData.isRecurring = false
  }
  formData.color = getCountdownTypeColor(type)
}

const handleDateChange = (e: any) => {
  formData.targetDate = e.detail.value
}

const handleTimeChange = (e: any) => {
  formData.targetTime = e.detail.value
}

const handleSave = () => {
  if (!canSave.value) {
    uni.showToast({ title: '请填写标题和日期', icon: 'none' })
    return
  }
  const reminders = formData.reminderKeys.map(k => reminderValueMap[k]).filter(v => v !== undefined)
  const targetDateTime = `${formData.targetDate} ${formData.targetTime}`
  countdownStore.addItem({
    name: formData.name.trim(),
    type: formData.type,
    targetDate: new Date(targetDateTime).toISOString(),
    isPinned: false,
    isRecurring: formData.isRecurring,
    reminders,
    color: formData.color,
    isArchived: false
  })
  uni.showToast({ title: '创建成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 500)
}

const goBack = () => uni.navigateBack()
</script>

<style lang="scss" scoped>
.page-add {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 999;
}

/* 遮罩 */
.popup-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

/* ========== 居中弹窗 ========== */
.popup-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 88%;
  max-width: 640rpx;
  max-height: 85vh;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.15);
}

/* 弹窗头部 */
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 8rpx;
  flex-shrink: 0;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.popup-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 28rpx;
  color: #999999;
}

/* 表单滚动区 */
.popup-body {
  flex: 1;
  padding: 8rpx 32rpx 0;
  min-height: 0;
}

.form-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.form-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #666666;
  margin-bottom: 16rpx;
  display: block;
}

/* 输入框 */
.form-input-wrap {
  background-color: #F5F7FA;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  border: 2rpx solid transparent;
  transition: border-color 0.2s;
}

.form-input-wrap:focus-within {
  border-color: #3B82F6;
  background-color: #FFFFFF;
}

.form-input {
  font-size: 30rpx;
  color: #333333;
  width: 100%;
}

.input-placeholder { color: #BFBFBF; }

/* 选择器行 */
.form-select-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #F5F7FA;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  border: 2rpx solid transparent;
  transition: border-color 0.2s;
}

.form-select-wrap:active {
  border-color: #3B82F6;
}

.select-text {
  font-size: 30rpx;
  color: #333333;
  &.is-placeholder { color: #BFBFBF; }
}

.select-icon { font-size: 32rpx; }

/* ========== 分类勾选列表 ========== */
.type-check-list {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.type-check-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  transition: background-color 0.15s;

  &:active {
    background-color: #F5F7FA;
  }

  &.is-checked {
    background-color: rgba(59, 130, 246, 0.06);
  }
}

.type-check-box {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  border: 2rpx solid #DDDDDD;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;

  &.is-checked {
    background-color: #3B82F6;
    border-color: #3B82F6;
  }
}

.type-check-mark {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.type-color-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-check-label {
  font-size: 28rpx;
  color: #333333;
}

/* ========== 颜色标签 - 精细样式 ========== */
.color-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 8rpx 0;
}

.color-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-circle {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid transparent;
  transition: all 0.2s;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

  &.is-selected,
  .color-item.is-selected & {
    border-color: #1A1A2E;
    transform: scale(1.1);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  }
}

.color-check {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 700;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

/* ========== 提醒设置 ========== */
.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.reminder-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  border: 2rpx solid #DDDDDD;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &.is-checked {
    background-color: #3B82F6;
    border-color: #3B82F6;
  }
}

.check-mark {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.reminder-text {
  font-size: 28rpx;
  color: #333333;
}

/* ========== 每年重复 ========== */
.repeat-item { border-bottom: none; }

.repeat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.repeat-switch {
  width: 80rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background-color: #DDDDDD;
  position: relative;
  transition: background-color 0.3s;
  &.on { background-color: #3B82F6; }
}

.repeat-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background-color: #FFFFFF;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.3s;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.15);
}

.repeat-switch.on .repeat-dot { transform: translateX(40rpx); }

/* ========== 底部按钮 ========== */
.popup-footer {
  padding: 20rpx 32rpx 28rpx;
  flex-shrink: 0;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.35);
  &.is-disabled { opacity: 0.5; }
}

.save-btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
