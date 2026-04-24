/**
 * FocusCount - 倒计时应用类型定义
 * 定义所有业务实体的 TypeScript 类型
 */

/** 倒计时项目类型 */
export type CountdownType = 'exam' | 'deadline' | 'anniversary' | 'birthday' | 'custom'

/** 倒计时项目接口 */
export interface CountdownItem {
  /** 唯一标识，UUID */
  id: string
  /** 项目名称 */
  name: string
  /** 项目类型 */
  type: CountdownType
  /** 目标日期时间 ISO格式 */
  targetDate: string
  /** 是否置顶 */
  isPinned: boolean
  /** 是否每年重复（纪念日/生日自动开启） */
  isRecurring: boolean
  /** 提醒天数数组 [0,1,3,7] 表示当天、提前1天、3天、7天 */
  reminders: number[]
  /** 颜色标签 */
  color: string
  /** 是否已归档 */
  isArchived: boolean
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/** 主题类型 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/** 设置接口 */
export interface AppSettings {
  /** 主题模式 */
  theme: ThemeMode
  /** 是否启用通知 */
  notificationEnabled: boolean
  /** 是否启用免打扰 */
  quietHoursEnabled: boolean
  /** 免打扰开始时间，如 "23:00" */
  quietHoursStart: string
  /** 免打扰结束时间，如 "07:00" */
  quietHoursEnd: string
  /** 是否显示秒数 */
  showSeconds: boolean
  /** 字体大小 */
  fontSize: 'small' | 'medium' | 'large'
  /** 通知提示音 */
  notificationSound: string
}

/** 倒计时计算结果 */
export interface CountdownResult {
  /** 剩余天数 */
  days: number
  /** 剩余小时 */
  hours: number
  /** 剩余分钟 */
  minutes: number
  /** 剩余秒数 */
  seconds: number
  /** 是否已过期 */
  isExpired: boolean
  /** 剩余总秒数 */
  totalSeconds: number
}
