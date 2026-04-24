/**
 * FocusCount - 通用工具函数
 * 提供日期处理、防抖节流等通用工具方法
 */

/**
 * 格式化日期显示
 * @param date - 日期字符串（ISO格式或可解析格式）
 * @returns 格式化后的日期字符串，如 "2026年4月22日"
 */
export function formatDate(date: string): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${year}年${month}月${day}日`
}

/**
 * 判断目标日期是否是今天
 * @param date - 日期字符串（ISO格式或可解析格式）
 * @returns 是否为今天
 */
export function isToday(date: string): boolean {
  const target = new Date(date)
  const now = new Date()
  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()
  )
}

/**
 * 判断目标日期是否在指定天数内（从今天算起）
 * @param date - 目标日期字符串
 * @param days - 天数阈值
 * @returns 是否在指定天数内
 */
export function isWithinDays(date: string, days: number): boolean {
  const target = new Date(date)
  const now = new Date()
  // 将时间部分归零，只比较日期
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  const diffMs = target.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= days
}

/**
 * 防抖函数
 * 在最后一次调用后等待指定延迟时间才执行
 * @param fn - 需要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖处理后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 * 在指定时间间隔内最多执行一次
 * @param fn - 需要节流的函数
 * @param delay - 间隔时间（毫秒）
 * @returns 节流处理后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}
