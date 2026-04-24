/**
 * FocusCount - 倒计时业务逻辑服务
 * 封装倒计时计算、格式化、排序等核心业务逻辑
 * 页面/组件通过导入方法调用，不直接编写计算逻辑
 */

import type { CountdownItem, CountdownResult, CountdownType } from '../types'

/**
 * 计算倒计时（天、时、分、秒）
 * @param targetDate - 目标日期时间（ISO格式）
 * @returns 倒计时计算结果
 */
export function calculateCountdown(targetDate: string): CountdownResult {
  const now = new Date().getTime()
  const target = new Date(targetDate).getTime()
  const diff = target - now

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalSeconds: 0,
    }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalSeconds,
  }
}

/**
 * 格式化倒计时显示文本
 * @param result - 倒计时计算结果
 * @param showSeconds - 是否显示秒数
 * @returns 格式化后的文本，如 "3天 05:30:15" 或 "3天 05:30"
 */
export function formatCountdown(result: CountdownResult, showSeconds: boolean): string {
  if (result.isExpired) {
    return '已到期'
  }

  const parts: string[] = []

  // 天数部分
  if (result.days > 0) {
    parts.push(`${result.days}天`)
  }

  // 时分秒部分，使用中文单位
  parts.push(`${result.hours}时`)
  parts.push(`${result.minutes}分`)

  if (showSeconds) {
    parts.push(`${result.seconds}秒`)
  }

  return parts.join(' ')
}

/**
 * 获取倒计时类型的中文标签
 * @param type - 倒计时类型
 * @returns 中文标签名称
 */
export function getCountdownTypeLabel(type: CountdownType): string {
  const labelMap: Record<CountdownType, string> = {
    exam: '考试',
    deadline: '项目截止',
    anniversary: '纪念日',
    birthday: '生日',
    custom: '自定义',
  }
  return labelMap[type] || '自定义'
}

/**
 * 获取倒计时类型的默认颜色
 * @param type - 倒计时类型
 * @returns 十六进制颜色值
 */
export function getCountdownTypeColor(type: CountdownType): string {
  const colorMap: Record<CountdownType, string> = {
    exam: '#4A6CF7',       // 蓝色 - 考试
    deadline: '#FA3534',    // 红色 - 截止日期
    anniversary: '#FF9900', // 橙色 - 纪念日
    birthday: '#E91E8C',    // 粉色 - 生日
    custom: '#909399',      // 灰色 - 自定义
  }
  return colorMap[type] || '#909399'
}

/**
 * 生成UUID唯一标识
 * @returns UUID格式的字符串
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

/**
 * 根据类型获取默认提醒天数设置
 * @param type - 倒计时类型
 * @returns 提醒天数数组
 */
export function getDefaultReminders(type: CountdownType): number[] {
  const reminderMap: Record<CountdownType, number[]> = {
    exam: [0, 1, 3, 7, 30],       // 考试：当天、1天、3天、7天、30天
    deadline: [0, 1, 3, 7],        // 截止日期：当天、1天、3天、7天
    anniversary: [0, 1, 3],        // 纪念日：当天、1天、3天
    birthday: [0, 1, 7],           // 生日：当天、1天、7天
    custom: [0, 1],                // 自定义：当天、1天
  }
  return reminderMap[type] || [0, 1]
}

/**
 * 计算下次重复日期（纪念日/生日使用）
 * 如果目标日期已过，自动计算到下一年的同一天
 * @param targetDate - 原始目标日期（ISO格式）
 * @returns 下一次目标日期的ISO字符串
 */
export function getNextOccurrence(targetDate: string): string {
  const target = new Date(targetDate)
  const now = new Date()

  // 获取今年的目标日期
  const thisYear = new Date(
    now.getFullYear(),
    target.getMonth(),
    target.getDate(),
    target.getHours(),
    target.getMinutes(),
    target.getSeconds()
  )

  // 如果今年的日期还没过，使用今年的
  if (thisYear.getTime() > now.getTime()) {
    return thisYear.toISOString()
  }

  // 否则使用明年的
  const nextYear = new Date(
    now.getFullYear() + 1,
    target.getMonth(),
    target.getDate(),
    target.getHours(),
    target.getMinutes(),
    target.getSeconds()
  )
  return nextYear.toISOString()
}

/**
 * 对倒计时列表按剩余时间升序排序
 * 规则：
 * 1. 未过期的项目排在已过期项目前面
 * 2. 同组内按剩余时间升序排列（即将到来的排前面）
 * 3. 已过期项目按过期时间降序排列（最近过期的排前面）
 * @param list - 倒计时项目数组
 * @returns 排序后的新数组（不修改原数组）
 */
export function sortCountdownList(list: CountdownItem[]): CountdownItem[] {
  return [...list].sort((a, b) => {
    const now = new Date().getTime()
    const diffA = new Date(a.targetDate).getTime() - now
    const diffB = new Date(b.targetDate).getTime() - now

    const aExpired = diffA <= 0
    const bExpired = diffB <= 0

    // 未过期 vs 已过期：未过期排前面
    if (aExpired !== bExpired) {
      return aExpired ? 1 : -1
    }

    // 都未过期：剩余时间少的排前面
    if (!aExpired && !bExpired) {
      return diffA - diffB
    }

    // 都已过期：最近过期的排前面（绝对值小的排前面）
    return Math.abs(diffA) - Math.abs(diffB)
  })
}
