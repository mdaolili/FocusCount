/**
 * FocusCount - 桌面小组件数据服务
 * 封装小组件所需的数据获取、计算、格式化等业务逻辑
 * 小组件组件通过导入方法调用，不直接编写业务逻辑
 */

import type { CountdownItem } from '../types'
import { getCountdownList, getPinnedId, getAppSettings } from '../services/storage'

/** 小组件展示文本格式 */
export interface WidgetDisplayData {
  /** 倒计时项目名称 */
  name: string
  /** 剩余天数 */
  days: number
  /** 天数单位文本 */
  unit: string
  /** 是否已过期 */
  isExpired: boolean
  /** 项目颜色 */
  color: string
  /** 目标日期文本 */
  targetDateText: string
}

/**
 * 获取当前置顶的倒计时项目
 * 优先获取置顶项目，无置顶时获取第一个未过期项目
 * @returns 置顶/最近的倒计时项目，无数据时返回 null
 */
export function getPinnedCountdown(): CountdownItem | null {
  try {
    const list = getCountdownList()
    if (!list || list.length === 0) {
      return null
    }

    // 优先查找置顶项目
    const pinnedId = getPinnedId()
    if (pinnedId) {
      const pinned = list.find((item) => item.id === pinnedId)
      if (pinned) {
        return pinned
      }
    }

    // 无置顶时，返回第一个未过期且未归档的项目
    const now = new Date().getTime()
    const activeItem = list.find(
      (item) => !item.isArchived && new Date(item.targetDate).getTime() > now
    )
    return activeItem || list[0] || null
  } catch (e) {
    console.error('[WidgetService] 获取置顶倒计时失败:', e)
    return null
  }
}

/**
 * 计算剩余天数
 * @param targetDate - 目标日期（ISO格式）
 * @returns 剩余天数，已过期返回 0
 */
export function calculateRemainingDays(targetDate: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)

  const diff = target.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return Math.max(0, days)
}

/**
 * 格式化小组件展示文本
 * 将倒计时项目转换为小组件所需的展示数据
 * @param item - 倒计时项目
 * @returns 格式化后的展示数据
 */
export function formatWidgetText(item: CountdownItem): WidgetDisplayData {
  const days = calculateRemainingDays(item.targetDate)
  const target = new Date(item.targetDate)
  const isExpired = days === 0

  // 格式化目标日期为 MM/DD
  const month = String(target.getMonth() + 1).padStart(2, '0')
  const day = String(target.getDate()).padStart(2, '0')
  const targetDateText = `${month}/${day}`

  // 天数单位文本
  let unit = '天'
  if (isExpired) {
    unit = '已到期'
  } else if (days === 1) {
    unit = '天 (明天)'
  }

  return {
    name: item.name,
    days,
    unit,
    isExpired,
    color: item.color,
    targetDateText,
  }
}

/**
 * 获取当前主题模式
 * 用于小组件适配暗黑/浅色模式
 * @returns 'light' 或 'dark'
 */
export function getWidgetTheme(): 'light' | 'dark' {
  try {
    const settings = getAppSettings()
    if (settings.theme === 'dark') return 'dark'
    if (settings.theme === 'light') return 'light'

    // auto 模式下根据系统主题判断
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.osTheme === 'dark' ? 'dark' : 'light'
  } catch {
    // 默认浅色模式
    return 'light'
  }
}

/**
 * 获取小组件完整展示数据
 * 组合获取项目和格式化逻辑，提供一步到位的数据获取
 * @returns 小组件展示数据，无数据时返回 null
 */
export function getWidgetDisplayData(): WidgetDisplayData | null {
  const item = getPinnedCountdown()
  if (!item) {
    return null
  }
  return formatWidgetText(item)
}
