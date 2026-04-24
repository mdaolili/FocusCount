/**
 * FocusCount - 设置状态管理（Pinia Store）
 * 管理应用设置的状态，封装设置相关的操作
 * 页面/组件通过 useSettingsStore() 调用
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppSettings, ThemeMode } from '../types'
import { getAppSettings, saveAppSettings } from '../services/storage'

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

export const useSettingsStore = defineStore('settings', () => {
  // ==================== State ====================

  /** 应用设置 */
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })

  // ==================== Getters ====================

  /** 获取当前主题模式 */
  const themeMode = computed<ThemeMode>(() => {
    return settings.value.theme
  })

  /** 判断是否为深色模式（auto模式下根据系统判断） */
  const isDarkMode = computed<boolean>(() => {
    if (settings.value.theme === 'dark') return true
    if (settings.value.theme === 'light') return false
    // auto 模式下根据系统主题判断
    // uni.getSystemInfoSync 在非H5端可用
    try {
      const systemInfo = uni.getSystemInfoSync()
      return systemInfo.osTheme === 'dark'
    } catch {
      return false
    }
  })

  /** 是否显示秒数 */
  const showSeconds = computed<boolean>(() => {
    return settings.value.showSeconds
  })

  // ==================== Actions ====================

  /**
   * 从本地存储加载设置
   */
  function loadSettings(): void {
    settings.value = getAppSettings()
  }

  /**
   * 更新设置（部分更新）
   * @param updates - 需要更新的设置字段
   */
  function updateSettings(updates: Partial<AppSettings>): void {
    settings.value = {
      ...settings.value,
      ...updates,
    }
    saveAppSettings(settings.value)
  }

  /**
   * 重置所有设置为默认值
   */
  function resetSettings(): void {
    settings.value = { ...DEFAULT_SETTINGS }
    saveAppSettings(settings.value)
  }

  return {
    // State
    settings,
    // Getters
    themeMode,
    isDarkMode,
    showSeconds,
    // Actions
    loadSettings,
    updateSettings,
    resetSettings,
  }
})
