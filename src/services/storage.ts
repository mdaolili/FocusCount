/**
 * FocusCount - 本地存储服务
 * 封装所有 uni.setStorageSync / uni.getStorageSync 操作
 * 页面/组件不应直接调用存储API，统一通过此服务访问
 */

import type { CountdownItem, AppSettings } from '../types'

/** 存储键名常量 */
export const STORAGE_KEYS = {
  /** 倒计时列表 */
  COUNTDOWN_LIST: 'focuscount_countdown_list',
  /** 置顶项目ID */
  PINNED_ID: 'focuscount_pinned_id',
  /** 应用设置 */
  APP_SETTINGS: 'focuscount_app_settings',
} as const

/** 默认应用设置 */
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  notificationEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '23:00',
  quietHoursEnd: '07:00',
  showSeconds: true,
  fontSize: 'medium',
  notificationSound: 'default',
}

/**
 * 获取所有倒计时列表
 * @returns 倒计时项目数组，无数据时返回空数组
 */
export function getCountdownList(): CountdownItem[] {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.COUNTDOWN_LIST)
    if (data && Array.isArray(data)) {
      return data as CountdownItem[]
    }
    return []
  } catch (e) {
    console.error('[StorageService] 获取倒计时列表失败:', e)
    return []
  }
}

/**
 * 保存倒计时列表
 * @param list - 倒计时项目数组
 */
export function saveCountdownList(list: CountdownItem[]): void {
  try {
    uni.setStorageSync(STORAGE_KEYS.COUNTDOWN_LIST, list)
  } catch (e) {
    console.error('[StorageService] 保存倒计时列表失败:', e)
  }
}

/**
 * 获取置顶项目ID
 * @returns 置顶项目ID，无置顶时返回null
 */
export function getPinnedId(): string | null {
  try {
    const id = uni.getStorageSync(STORAGE_KEYS.PINNED_ID)
    return id || null
  } catch (e) {
    console.error('[StorageService] 获取置顶ID失败:', e)
    return null
  }
}

/**
 * 设置置顶项目ID
 * @param id - 置顶项目ID，传null取消置顶
 */
export function setPinnedId(id: string | null): void {
  try {
    if (id) {
      uni.setStorageSync(STORAGE_KEYS.PINNED_ID, id)
    } else {
      uni.removeStorageSync(STORAGE_KEYS.PINNED_ID)
    }
  } catch (e) {
    console.error('[StorageService] 设置置顶ID失败:', e)
  }
}

/**
 * 获取应用设置
 * @returns 应用设置对象，首次获取返回默认值
 */
export function getAppSettings(): AppSettings {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.APP_SETTINGS)
    if (data && typeof data === 'object') {
      // 合并默认值，防止新增字段缺失
      return { ...DEFAULT_SETTINGS, ...data } as AppSettings
    }
    return { ...DEFAULT_SETTINGS }
  } catch (e) {
    console.error('[StorageService] 获取应用设置失败:', e)
    return { ...DEFAULT_SETTINGS }
  }
}

/**
 * 保存应用设置
 * @param settings - 应用设置对象
 */
export function saveAppSettings(settings: AppSettings): void {
  try {
    uni.setStorageSync(STORAGE_KEYS.APP_SETTINGS, settings)
  } catch (e) {
    console.error('[StorageService] 保存应用设置失败:', e)
  }
}

/**
 * 导出所有数据为JSON字符串
 * @returns 包含所有数据的JSON字符串
 */
export function exportData(): string {
  try {
    const data = {
      countdownList: getCountdownList(),
      pinnedId: getPinnedId(),
      settings: getAppSettings(),
      exportTime: new Date().toISOString(),
      version: '1.0.0',
    }
    return JSON.stringify(data, null, 2)
  } catch (e) {
    console.error('[StorageService] 导出数据失败:', e)
    return ''
  }
}

/**
 * 导入数据
 * @param jsonStr - JSON格式数据字符串
 * @returns 导入是否成功
 */
export function importData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr)
    if (!data || typeof data !== 'object') {
      console.error('[StorageService] 导入数据格式无效')
      return false
    }

    // 导入倒计时列表
    if (Array.isArray(data.countdownList)) {
      saveCountdownList(data.countdownList)
    }

    // 导入置顶ID
    if (data.pinnedId !== undefined) {
      setPinnedId(data.pinnedId || null)
    }

    // 导入设置
    if (data.settings && typeof data.settings === 'object') {
      saveAppSettings({ ...DEFAULT_SETTINGS, ...data.settings })
    }

    return true
  } catch (e) {
    console.error('[StorageService] 导入数据失败:', e)
    return false
  }
}

/**
 * 清空所有应用数据
 */
export function clearAllData(): void {
  try {
    uni.removeStorageSync(STORAGE_KEYS.COUNTDOWN_LIST)
    uni.removeStorageSync(STORAGE_KEYS.PINNED_ID)
    uni.removeStorageSync(STORAGE_KEYS.APP_SETTINGS)
  } catch (e) {
    console.error('[StorageService] 清空数据失败:', e)
  }
}
