<template>
  <view class="page-edit">
    <!-- 半屏弹窗遮罩 -->
    <view class="popup-mask" @click="goBack" />

    <!-- 弹窗主体 -->
    <view class="popup-sheet">
      <!-- 弹窗头部 -->
      <view class="popup-header">
        <text class="popup-title">编辑倒计时</text>
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
              placeholder="请输入项目名称（例：毕业论文提交截止）"
              placeholder-class="input-placeholder"
              :maxlength="50"
            />
          </view>
        </view>

        <!-- 分类选择 -->
        <view class="form-item">
          <text class="form-label">分类</text>
          <view class="type-options">
            <view
              v-for="opt in typeOptions"
              :key="opt.value"
              class="type-option"
              :class="{ 'is-active': formData.type === opt.value }"
              :style="formData.type === opt.value ? { backgroundColor: opt.color + '20', borderColor: opt.color, color: opt.color } : {}"
              @click="handleTypeChange(opt.value)"
            >
              <text class="type-option-text">{{ opt.label }}</text>
            </view>
          </view>
        </view>

        <!-- 目标日期 -->
        <view class="form-item">
          <text class="form-label">目标日期</text>
          <picker mode="date" :value="formData.targetDate" :start="todayStr" @change="handleDateChange">
            <view class="form-select">
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
          <picker mode="time" :value="formData.targetTime" @change="handleTimeChange">
            <view class="form-select">
              <text class="select-text">{{ formData.targetTime || '00:00' }}</text>
              <text class="select-icon">🕐</text>
            </view>
          </picker>
        </view>

        <!-- 颜色标签 -->
        <view class="form-item">
          <text class="form-label">颜色标签</text>
          <view class="color-panel">
            <view
              v-for="color in colorOptions"
              :key="color"
              class="color-dot"
              :class="{ 'is-selected': formData.color === color }"
              :style="{ backgroundColor: color }"
              @click="formData.color = color"
            />
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
            >
              <view class="checkbox" :class="{ 'is-checked': formData.reminderKeys.includes(opt.value) }" @click="handleReminderToggle(opt.value)">
                <text v-if="formData.reminderKeys.includes(opt.value)" class="check-mark">✓</text>
              </view>
              <text class="reminder-text">{{ opt.label }}</text>
            </view>
          </view>
        </view>

        <!-- 每年重复 -->
        <view v-if="formData.type === 'anniversary' || formData.type === 'birthday'" class="form-item repeat-item">
          <view class="repeat-row">
            <text class="form-label" style="margin-bottom:0">每年重复</text>
            <view class="repeat-switch" :class="{ on: formData.isRecurring }" @click="formData.isRecurring = !formData.isRecurring">
              <view class="repeat-dot" />
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="popup-footer">
        <view class="btn-row">
          <view class="cancel-btn" @click="goBack">
            <text class="cancel-btn-text">取消</text>
          </view>
          <view class="save-btn" :class="{ 'is-disabled': !canSave }" @click="handleSave">
            <text class="save-btn-text">保存</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
/**
 * 编辑倒计时页 - 底部弹窗式
 */
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useCountdownStore } from '@/stores/countdown'
import { getCountdownTypeColor } from '@/services/countdown'
import type { CountdownItem } from '@/types'

const countdownStore = useCountdownStore()

const editId = ref('')
const isLoading = ref(true)
const todayStr = new Date().toISOString().split('T')[0]

const reminderValueMap: Record<string, number> = { 'today': 0, '1day': 1, '3days': 3, '7days': 7 }
const reminderKeyMap: Record<number, string> = { 0: 'today', 1: '1day', 3: '3days', 7: '7days' }

const typeOptions = [
  { label: '考试', value: 'exam', color: '#4A6CF7' },
  { label: '项目截止', value: 'deadline', color: '#FA3534' },
  { label: '纪念日', value: 'anniversary', color: '#FF9900' },
  { label: '生日', value: 'birthday', color: '#E91E8C' },
  { label: '自定义', value: 'custom', color: '#909399' }
]

const reminderOptions = [
  { label: '当天提醒', value: 'today' },
  { label: '提前1天', value: '1day' },
  { label: '提前3天', value: '3days' },
  { label: '提前7天', value: '7days' }
]

const colorOptions = [
  '#FA3534', '#FF9900', '#FFC107', '#19BE6B',
  '#2196F3', '#8B5CF6', '#E91E8C', '#909399'
]

const formData = reactive({
  name: '',
  type: 'custom',
  targetDate: '',
  targetTime: '00:00',
  reminderKeys: [] as string[],
  isRecurring: false,
  color: '#909399'
})

const canSave = computed(() => formData.name.trim() && formData.targetDate)

onLoad((options) => {
  if (options && options.id) {
    editId.value = options.id
    loadItemData()
  } else {
    uni.showToast({ title: '参数错误', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1000)
  }
})

const loadItemData = () => {
  const item = countdownStore.countdownList.find(i => i.id === editId.value)
  if (item) {
    formData.name = item.name
    formData.type = item.type
    const date = new Date(item.targetDate)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    formData.targetDate = `${y}-${m}-${d}`
    formData.targetTime = `${h}:${min}`
    formData.reminderKeys = (item.reminders || []).map(d => reminderKeyMap[d] || '').filter(Boolean)
    formData.isRecurring = item.isRecurring || false
    formData.color = item.color || getCountdownTypeColor(item.type)
  } else {
    uni.showToast({ title: '项目不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1000)
  }
  isLoading.value = false
}

const handleTypeChange = (type: string) => {
  formData.type = type
  formData.isRecurring = type === 'anniversary' || type === 'birthday'
  formData.color = getCountdownTypeColor(type)
}

const handleReminderToggle = (value: string) => {
  const idx = formData.reminderKeys.indexOf(value)
  if (idx > -1) formData.reminderKeys.splice(idx, 1)
  else formData.reminderKeys.push(value)
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
  countdownStore.updateItem(editId.value, {
    name: formData.name.trim(),
    type: formData.type,
    targetDate: new Date(targetDateTime).toISOString(),
    isRecurring: formData.isRecurring,
    reminders,
    color: formData.color
  })
  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 500)
}

const goBack = () => uni.navigateBack()
</script>

<style lang="scss" scoped>
.page-edit {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 999;
}

.popup-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

.popup-sheet {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  max-height: 85vh;
  background-color: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 16rpx;
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

.popup-body {
  flex: 1;
  padding: 0 32rpx;
  max-height: 60vh;
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

.form-input-wrap {
  background-color: #F5F7FA;
  border-radius: 20rpx;
  padding: 16rpx 20rpx;
}

.form-input {
  font-size: 30rpx;
  color: #333333;
  width: 100%;
}

.input-placeholder { color: #BFBFBF; }

.type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.type-option {
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  border: 2rpx solid #E8E8E8;
  transition: all 0.2s;
}

.type-option-text {
  font-size: 26rpx;
  color: #666666;
}

.form-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
}

.select-text {
  font-size: 30rpx;
  color: #333333;
  &.is-placeholder { color: #BFBFBF; }
}

.select-icon { font-size: 32rpx; }

.color-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.color-dot {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
  transition: all 0.2s;
  &.is-selected {
    border-color: #3B82F6;
    transform: scale(1.15);
  }
}

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

.popup-footer {
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.btn-row {
  display: flex;
  gap: 20rpx;
}

.cancel-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn-text {
  font-size: 30rpx;
  color: #666666;
  font-weight: 500;
}

.save-btn {
  flex: 1;
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
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
