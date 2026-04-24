<template>
  <view class="page-list" @click="closePopover">
    <!-- 顶部导航栏 -->
    <view class="nav-bar safe-area-top">
      <text class="nav-title">全部倒计时</text>
      <view class="add-btn" @click="openAddDialog">
        <text class="add-icon">+</text>
      </view>
    </view>

    <!-- 列表区域 -->
    <scroll-view
      class="list-scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 有数据 -->
      <view v-if="displayItems.length > 0" class="list-content">
        <CountdownCard
          v-for="item in displayItems"
          :key="item.id"
          :item="item"
          :is-pinned="item.id === pinnedId"
          :show-popover="popoverItemId === item.id"
          :popover-actions="getPopoverActions(item)"
          @click="handleCardClick"
          @pin="handlePin"
          @more="handleMore"
          @popover-action="handlePopoverAction"
        />
      </view>

      <!-- 无数据 -->
      <view v-else class="empty-wrapper">
        <view class="empty-icon-wrap">
          <text class="empty-icon">📋</text>
        </view>
        <text class="empty-title">还没有倒计时项目</text>
        <text class="empty-desc">点击右上角 + 创建你的第一个倒计时</text>
      </view>
    </scroll-view>

    <!-- 新建/编辑倒计时 - 居中弹窗 -->
    <view v-if="showDialog" class="dialog-layer">
      <view class="dialog-mask" @click="closeDialog" />
      <view class="dialog-box" @click.stop>
        <!-- 头部 -->
        <view class="dialog-header">
          <text class="dialog-title">{{ dialogMode === 'edit' ? '编辑倒计时' : '新建倒计时' }}</text>
          <view class="dialog-close" @click="closeDialog">
            <text class="close-x">✕</text>
          </view>
        </view>

        <!-- 表单 -->
        <scroll-view class="dialog-body" scroll-y>
          <!-- 标题 -->
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

          <!-- 分类 - 勾选 -->
          <view class="form-item">
            <text class="form-label">分类</text>
            <view class="type-check-list">
              <view
                v-for="(opt, idx) in typeOptions"
                :key="opt.value"
                class="type-check-item"
                :class="{ 'is-checked': formData.typeIndex === idx }"
                @click="selectType(idx)"
              >
                <view class="type-check-box" :class="{ 'is-checked': formData.typeIndex === idx }">
                  <text v-if="formData.typeIndex === idx" class="type-check-mark">✓</text>
                </view>
                <view class="type-color-dot" :style="{ backgroundColor: getCountdownTypeColor(opt.value) }" />
                <text class="type-check-label">{{ opt.label }}</text>
              </view>
            </view>
          </view>

          <!-- 目标日期 -->
          <view class="form-item">
            <text class="form-label">目标日期</text>
            <picker mode="date" :value="formData.targetDate" :start="todayStr" @change="onDatePick">
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
            <picker mode="time" :value="formData.targetTime" @change="onTimePick">
              <view class="form-select-wrap">
                <text class="select-text">{{ formData.targetTime || '23:59' }}</text>
                <text class="select-icon">🕐</text>
              </view>
            </picker>
          </view>

          <!-- 颜色标签 -->
          <view class="form-item">
            <text class="form-label">颜色标签</text>
            <view class="color-panel">
              <view
                v-for="c in colorOptions"
                :key="c"
                class="color-item"
                :class="{ 'is-selected': formData.color === c }"
                @click="formData.color = c"
              >
                <view class="color-circle" :style="{ backgroundColor: c }">
                  <text v-if="formData.color === c" class="color-check">✓</text>
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

          <!-- 每年重复 -->
          <view v-if="showRepeat" class="form-item no-border">
            <view class="repeat-row">
              <text class="form-label" style="margin-bottom:0">每年重复</text>
              <view class="repeat-switch" :class="{ on: formData.isRecurring }" @click="formData.isRecurring = !formData.isRecurring">
                <view class="repeat-dot" />
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 底部按钮 -->
        <view class="dialog-footer">
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
 * 全部列表页（含新建/编辑倒计时弹窗）
 */
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CountdownCard from '@/components/CountdownCard.vue'
import { useCountdownStore } from '@/stores/countdown'
import { getCountdownTypeColor } from '@/services/countdown'
import type { CountdownItem, CountdownType } from '@/types'

const countdownStore = useCountdownStore()

// ========== 列表相关 ==========
const isRefreshing = ref(false)
const popoverItemId = ref<string | null>(null)

interface ActionItem {
  label: string
  icon: string
  danger?: boolean
  action: string
}

const pinnedId = computed(() => countdownStore.pinnedId)
const displayItems = computed(() => countdownStore.activeList)

const getPopoverActions = (item: CountdownItem): ActionItem[] => {
  const isPinned = item.id === pinnedId.value
  const hasReminder = item.reminders && item.reminders.length > 0
  return [
    { label: isPinned ? '取消首页置顶' : '设为首页置顶', icon: '⭐', action: isPinned ? 'unpin' : 'pin' },
    { label: '编辑', icon: '✏️', action: 'edit' },
    { label: hasReminder ? '关闭提醒' : '开启提醒', icon: '🔔', action: hasReminder ? 'closeReminder' : 'openReminder' },
    { label: '删除', icon: '🗑️', danger: true, action: 'delete' }
  ]
}

onShow(() => { countdownStore.loadList() })

const onRefresh = () => {
  isRefreshing.value = true
  countdownStore.loadList()
  setTimeout(() => { isRefreshing.value = false }, 500)
}

const handleCardClick = (item: CountdownItem) => {
  closePopover()
  openEditDialog(item)
}

const handlePin = (item: CountdownItem) => {
  if (item.id === pinnedId.value) {
    countdownStore.setPinned(null)
    uni.showToast({ title: '已取消置顶', icon: 'success' })
  } else {
    countdownStore.setPinned(item.id)
    uni.showToast({ title: '已设为首页置顶', icon: 'success' })
  }
}

const handleMore = (item: CountdownItem) => {
  popoverItemId.value = popoverItemId.value === item.id ? null : item.id
}

const closePopover = () => { popoverItemId.value = null }

const handlePopoverAction = (action: ActionItem) => {
  const item = displayItems.value.find(i => i.id === popoverItemId.value)
  popoverItemId.value = null
  if (!item) return

  switch (action.action) {
    case 'pin':
      countdownStore.setPinned(item.id)
      uni.showToast({ title: '已设为首页置顶', icon: 'success' })
      break
    case 'unpin':
      countdownStore.setPinned(null)
      uni.showToast({ title: '已取消置顶', icon: 'success' })
      break
    case 'edit':
      openEditDialog(item)
      break
    case 'openReminder':
      countdownStore.updateItem(item.id, { reminders: [0] })
      uni.showToast({ title: '已开启提醒', icon: 'success' })
      break
    case 'closeReminder':
      countdownStore.updateItem(item.id, { reminders: [] })
      uni.showToast({ title: '已关闭提醒', icon: 'none' })
      break
    case 'delete':
      uni.showModal({
        title: '确认删除',
        content: `确定要删除「${item.name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            countdownStore.deleteItem(item.id)
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
      break
  }
}

// ========== 新建/编辑弹窗相关 ==========
const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editId = ref('')

const typeOptions: Array<{ label: string; value: CountdownType }> = [
  { label: '考试', value: 'exam' },
  { label: '项目截止', value: 'deadline' },
  { label: '纪念日', value: 'anniversary' },
  { label: '生日', value: 'birthday' },
  { label: '自定义', value: 'custom' }
]

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

const reminderKeyMap: Record<number, string> = { 0: 'today', 1: '1day', 3: '3days', 7: '7days' }

const colorOptions = [
  '#FA3534', '#FF9900', '#FFC107', '#19BE6B',
  '#2196F3', '#8B5CF6', '#E91E8C'
]

const createEmptyForm = () => ({
  name: '',
  type: 'custom' as CountdownType,
  typeIndex: 4,
  targetDate: '',
  targetTime: '23:59',
  reminderKeys: ['today'] as string[],
  isRecurring: false,
  color: '#2196F3'
})

const formData = reactive(createEmptyForm())

const showRepeat = computed(() => formData.type === 'anniversary' || formData.type === 'birthday')
const canSave = computed(() => formData.name.trim() !== '' && formData.targetDate !== '')

const openAddDialog = () => {
  dialogMode.value = 'add'
  editId.value = ''
  Object.assign(formData, createEmptyForm())
  showDialog.value = true
}

const openEditDialog = (item: CountdownItem) => {
  dialogMode.value = 'edit'
  editId.value = item.id
  // 预填充表单
  formData.name = item.name
  formData.type = item.type
  formData.typeIndex = typeOptions.findIndex(o => o.value === item.type)
  if (formData.typeIndex < 0) formData.typeIndex = 4
  const date = new Date(item.targetDate)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  formData.targetDate = `${y}-${m}-${d}`
  formData.targetTime = `${h}:${min}`
  formData.reminderKeys = (item.reminders || []).map(r => reminderKeyMap[r] || '').filter(Boolean)
  formData.isRecurring = item.isRecurring || false
  formData.color = item.color || getCountdownTypeColor(item.type)
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
}

const selectType = (index: number) => {
  formData.typeIndex = index
  const type = typeOptions[index].value
  formData.type = type
  formData.isRecurring = type === 'anniversary' || type === 'birthday'
  formData.color = getCountdownTypeColor(type)
}

const toggleReminder = (value: string) => {
  const idx = formData.reminderKeys.indexOf(value)
  if (idx > -1) formData.reminderKeys.splice(idx, 1)
  else formData.reminderKeys.push(value)
}

const onDatePick = (e: any) => { formData.targetDate = e.detail.value }
const onTimePick = (e: any) => { formData.targetTime = e.detail.value }

const handleSave = () => {
  if (!canSave.value) {
    uni.showToast({ title: '请填写标题和日期', icon: 'none' })
    return
  }
  const reminders = formData.reminderKeys.map(k => reminderValueMap[k]).filter((v): v is number => v !== undefined)
  const targetDateTime = `${formData.targetDate} ${formData.targetTime}`

  if (dialogMode.value === 'edit' && editId.value) {
    countdownStore.updateItem(editId.value, {
      name: formData.name.trim(),
      type: formData.type,
      targetDate: new Date(targetDateTime).toISOString(),
      isRecurring: formData.isRecurring,
      reminders,
      color: formData.color
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
  } else {
    // 判断是否为第一个倒计时，自动设为置顶
    const isFirstItem = countdownStore.activeList.length === 0
    const newItem = countdownStore.addItem({
      name: formData.name.trim(),
      type: formData.type,
      targetDate: new Date(targetDateTime).toISOString(),
      isPinned: isFirstItem,
      isRecurring: formData.isRecurring,
      reminders,
      color: formData.color,
      isArchived: false
    })
    if (isFirstItem) {
      countdownStore.setPinned(newItem.id)
    }
    uni.showToast({ title: '创建成功', icon: 'success' })
  }
  closeDialog()
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-list {
  height: 100vh;
  background: linear-gradient(180deg, #EBF2FF 0%, #DBEAFE 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* ========== 顶部导航栏 ========== */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 16rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  position: relative;
  z-index: 10;
}

.nav-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.add-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.35);
  transition: transform 0.2s ease;
  &:active { transform: scale(0.92); }
}

.add-icon {
  font-size: 44rpx;
  color: #FFFFFF;
  font-weight: 300;
  line-height: 1;
  margin-top: -4rpx;
}

/* ========== 列表滚动区域 ========== */
.list-scroll {
  flex: 1;
  min-height: 0;
}

.list-content {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  position: relative;
  z-index: 1;
}

/* ========== 空状态 ========== */
.empty-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
}

.empty-icon-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background-color: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.empty-icon { font-size: 64rpx; }

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #666666;
  text-align: center;
}

/* ========== 新建弹窗 ========== */
.dialog-layer {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 999;
}

.dialog-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

.dialog-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 88%;
  max-width: 640rpx;
  max-height: 80vh;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx 4rpx;
  flex-shrink: 0;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.dialog-close {
  width: 48rpx;
  height: 48rpx;
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

/* 表单滚动区 - scroll-view 必须有明确高度才能滚动 */
.dialog-body {
  height: 60vh;
  padding: 4rpx 28rpx 8rpx;
}

.form-item {
  padding: 14rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
  &.no-border { border-bottom: none; }
}

.form-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #666666;
  margin-bottom: 10rpx;
  display: block;
}

/* 输入框 */
.form-input-wrap {
  background-color: #F5F7FA;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  border: 2rpx solid transparent;
  transition: border-color 0.2s;
}

.form-input-wrap:focus-within {
  border-color: #3B82F6;
  background-color: #FFFFFF;
}

.form-input {
  font-size: 28rpx;
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
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
}

.select-text {
  font-size: 28rpx;
  color: #333333;
  &.is-placeholder { color: #BFBFBF; }
}

.select-icon { font-size: 28rpx; }

/* 分类勾选列表 */
.type-check-list {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.type-check-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 16rpx;
  border-radius: 10rpx;
  transition: background-color 0.15s;
  &:active { background-color: #F5F7FA; }
  &.is-checked { background-color: rgba(59, 130, 246, 0.06); }
}

.type-check-box {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
  border: 2rpx solid #DDDDDD;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  &.is-checked { background-color: #3B82F6; border-color: #3B82F6; }
}

.type-check-mark {
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.type-color-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-check-label {
  font-size: 26rpx;
  color: #333333;
}

/* 颜色标签 */
.color-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 4rpx 0;
  overflow: visible;
}

.color-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-circle {
  width: 30rpx;
  height: 30rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid transparent;
  transition: all 0.2s;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
  .color-item.is-selected & {
    border-color: rgba(0, 0, 0, 0.2);
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.15);
  }
}

.color-check {
  font-size: 24rpx;
  color: #FFFFFF;
  font-weight: 700;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

/* 提醒设置 */
.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.reminder-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
  border: 2rpx solid #DDDDDD;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &.is-checked { background-color: #3B82F6; border-color: #3B82F6; }
}

.check-mark {
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.reminder-text {
  font-size: 26rpx;
  color: #333333;
}

/* 每年重复 */
.repeat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.repeat-switch {
  width: 72rpx;
  height: 36rpx;
  border-radius: 18rpx;
  background-color: #DDDDDD;
  position: relative;
  transition: background-color 0.3s;
  &.on { background-color: #3B82F6; }
}

.repeat-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background-color: #FFFFFF;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.3s;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.15);
}

.repeat-switch.on .repeat-dot { transform: translateX(36rpx); }

/* 底部按钮 */
.dialog-footer {
  padding: 12rpx 28rpx 20rpx;
  flex-shrink: 0;
}

.save-btn {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.35);
  &.is-disabled { opacity: 0.5; }
}

.save-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
