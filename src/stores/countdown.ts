/**
 * FocusCount - 倒计时状态管理（Pinia Store）
 * 管理倒计时列表的状态，封装所有列表相关的操作
 * 页面/组件通过 useCountdownStore() 调用，不直接操作存储
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CountdownItem } from '../types'
import {
  getCountdownList,
  saveCountdownList,
  getPinnedId,
  setPinnedId,
  exportData as storageExportData,
  importData as storageImportData,
} from '../services/storage'
import { generateId, sortCountdownList } from '../services/countdown'
import { scheduleNotification, cancelNotification, updateNotification } from '../services/notification'

export const useCountdownStore = defineStore('countdown', () => {
  // ==================== State ====================

  /** 倒计时列表 */
  const countdownList = ref<CountdownItem[]>([])

  /** 置顶项目ID */
  const pinnedId = ref<string | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  // ==================== Getters ====================

  /** 获取置顶项目 */
  const pinnedItem = computed<CountdownItem | null>(() => {
    if (!pinnedId.value) return null
    return countdownList.value.find((item) => item.id === pinnedId.value) || null
  })

  /** 排序后的完整列表 */
  const sortedList = computed<CountdownItem[]>(() => {
    return sortCountdownList(countdownList.value)
  })

  /** 未归档的活跃列表 */
  const activeList = computed<CountdownItem[]>(() => {
    const active = countdownList.value.filter((item) => !item.isArchived)
    return sortCountdownList(active)
  })

  /** 已归档列表 */
  const archivedList = computed<CountdownItem[]>(() => {
    const archived = countdownList.value.filter((item) => item.isArchived)
    return sortCountdownList(archived)
  })

  // ==================== Actions ====================

  /**
   * 从本地存储加载倒计时列表
   */
  function loadList(): void {
    loading.value = true
    try {
      countdownList.value = getCountdownList()
      pinnedId.value = getPinnedId()
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加新的倒计时项目
   * @param itemData - 项目数据（不含id、createdAt、updatedAt）
   * @returns 新创建的倒计时项目
   */
  function addItem(itemData: Omit<CountdownItem, 'id' | 'createdAt' | 'updatedAt'>): CountdownItem {
    const now = new Date().toISOString()
    const newItem: CountdownItem = {
      ...itemData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }

    countdownList.value.push(newItem)
    saveCountdownList(countdownList.value)

    // 设置通知
    scheduleNotification(newItem)

    return newItem
  }

  /**
   * 更新倒计时项目
   * @param id - 项目ID
   * @param updates - 需要更新的字段
   */
  function updateItem(id: string, updates: Partial<CountdownItem>): void {
    const index = countdownList.value.findIndex((item) => item.id === id)
    if (index === -1) return

    const updatedItem = {
      ...countdownList.value[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    countdownList.value.splice(index, 1, updatedItem)
    saveCountdownList(countdownList.value)

    // 更新通知
    updateNotification(updatedItem)
  }

  /**
   * 删除倒计时项目
   * @param id - 项目ID
   */
  function deleteItem(id: string): void {
    const index = countdownList.value.findIndex((item) => item.id === id)
    if (index === -1) return

    countdownList.value.splice(index, 1)
    saveCountdownList(countdownList.value)

    // 如果删除的是置顶项目，清除置顶
    if (pinnedId.value === id) {
      pinnedId.value = null
      setPinnedId(null)
    }

    // 取消通知
    cancelNotification(id)
  }

  /**
   * 设置置顶项目
   * @param id - 项目ID，传null取消置顶
   */
  function setPinned(id: string | null): void {
    pinnedId.value = id
    setPinnedId(id)

    // 更新列表中各项目的isPinned状态
    countdownList.value.forEach((item) => {
      item.isPinned = item.id === id
    })
    saveCountdownList(countdownList.value)
  }

  /**
   * 切换项目的归档状态
   * @param id - 项目ID
   */
  function toggleArchive(id: string): void {
    const item = countdownList.value.find((item) => item.id === id)
    if (!item) return

    item.isArchived = !item.isArchived
    item.updatedAt = new Date().toISOString()
    saveCountdownList(countdownList.value)

    // 归档后取消通知
    if (item.isArchived) {
      cancelNotification(id)
    } else {
      scheduleNotification(item)
    }
  }

  /**
   * 导入数据
   * @param jsonStr - JSON格式数据字符串
   * @returns 导入是否成功
   */
  function importDataAction(jsonStr: string): boolean {
    const success = storageImportData(jsonStr)
    if (success) {
      loadList()
    }
    return success
  }

  /**
   * 导出数据
   * @returns JSON格式数据字符串
   */
  function exportDataAction(): string {
    return storageExportData()
  }

  return {
    // State
    countdownList,
    pinnedId,
    loading,
    // Getters
    pinnedItem,
    sortedList,
    activeList,
    archivedList,
    // Actions
    loadList,
    addItem,
    updateItem,
    deleteItem,
    setPinned,
    toggleArchive,
    importData: importDataAction,
    exportData: exportDataAction,
  }
})
