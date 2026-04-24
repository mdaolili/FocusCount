/**
 * FocusCount - 通知服务
 * 封装本地通知的创建、取消、更新等操作
 * 依赖 uni.createPushMessage 等 uni-app 通知API
 */

import type { CountdownItem, AppSettings } from '../types'
import { calculateCountdown } from './countdown'

/**
 * 为倒计时项目设置通知
 * 根据项目的提醒天数数组，为每个提醒时间点创建本地通知
 * @param item - 倒计时项目
 */
export function scheduleNotification(item: CountdownItem): void {
  try {
    // #ifdef APP-PLUS
    cancelNotification(item.id)

    const now = new Date()
    const target = new Date(item.targetDate)

    item.reminders.forEach((daysBefore) => {
      // 计算提醒时间 = 目标日期 - 提前天数
      const reminderTime = new Date(target.getTime() - daysBefore * 24 * 60 * 60 * 1000)

      // 只设置未来的提醒
      if (reminderTime.getTime() > now.getTime()) {
        const countdown = calculateCountdown(item.targetDate)
        let content = ''

        if (daysBefore === 0) {
          content = `${item.name} 今天就到了！`
        } else {
          content = `${item.name} 还有 ${countdown.days} 天到达`
        }

        // 使用 plus.push 创建本地通知
        plus.push.createMessage(
          content,
          JSON.stringify({
            type: 'countdown_reminder',
            itemId: item.id,
          }),
          {
            title: '倒计时提醒',
          }
        )
      }
    })
    // #endif

    // #ifdef MP-WEIXIN
    // 小程序端暂不支持本地推送，可后续接入订阅消息
    console.log('[NotificationService] 小程序端暂不支持本地推送通知')
    // #endif
  } catch (e) {
    console.error('[NotificationService] 设置通知失败:', e)
  }
}

/**
 * 取消指定项目的所有通知
 * @param id - 倒计时项目ID
 */
export function cancelNotification(id: string): void {
  try {
    // #ifdef APP-PLUS
    // 清除该项目的所有本地通知
    plus.push.clear()
    // #endif

    console.log(`[NotificationService] 已取消项目 ${id} 的通知`)
  } catch (e) {
    console.error('[NotificationService] 取消通知失败:', e)
  }
}

/**
 * 更新倒计时项目的通知
 * 先取消旧通知，再重新设置新通知
 * @param item - 更新后的倒计时项目
 */
export function updateNotification(item: CountdownItem): void {
  try {
    cancelNotification(item.id)
    scheduleNotification(item)
  } catch (e) {
    console.error('[NotificationService] 更新通知失败:', e)
  }
}

/**
 * 检查当前时间是否在免打扰时段内
 * @param settings - 应用设置
 * @returns 是否在免打扰时段
 */
export function checkQuietHours(settings: AppSettings): boolean {
  if (!settings.quietHoursEnabled) {
    return false
  }

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // 解析免打扰开始时间
  const [startHour, startMinute] = settings.quietHoursStart.split(':').map(Number)
  const startMinutes = startHour * 60 + startMinute

  // 解析免打扰结束时间
  const [endHour, endMinute] = settings.quietHoursEnd.split(':').map(Number)
  const endMinutes = endHour * 60 + endMinute

  // 处理跨午夜的情况，如 23:00 - 07:00
  if (startMinutes > endMinutes) {
    // 跨午夜：当前时间在开始之后 或 在结束之前
    return currentMinutes >= startMinutes || currentMinutes < endMinutes
  } else {
    // 不跨午夜：当前时间在开始和结束之间
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  }
}

/**
 * 初始化通知服务
 * 在应用启动时调用，检查权限并设置监听
 */
export function initNotificationService(): void {
  try {
    // #ifdef APP-PLUS
    // 检查通知权限
    if (plus.os.name === 'Android') {
      plus.android.runtimeMainActivity()
      // Android 13+ 需要请求通知权限
      // 这里做基础检查，具体权限请求在页面层处理
    }
    // #endif

    console.log('[NotificationService] 通知服务初始化完成')
  } catch (e) {
    console.error('[NotificationService] 通知服务初始化失败:', e)
  }
}
