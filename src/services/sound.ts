/**
 * FocusCount - 铃声服务
 * 封装通知铃声的列表获取、播放和停止功能
 * 页面/组件通过导入方法调用，不直接操作音频API
 */

/** 铃声信息接口 */
export interface SoundItem {
  /** 铃声标识名 */
  name: string
  /** 铃声显示名称 */
  label: string
  /** 铃声描述 */
  description: string
}

/** 可用铃声列表 */
const SOUND_LIST: SoundItem[] = [
  {
    name: 'default',
    label: '默认铃声',
    description: '系统默认通知提示音',
  },
  {
    name: 'gentle',
    label: '轻柔提醒',
    description: '柔和的提示音，适合日常提醒',
  },
  {
    name: 'urgent',
    label: '紧急提醒',
    description: '急促的提示音，适合重要事项',
  },
  {
    name: 'celebration',
    label: '庆祝铃声',
    description: '欢快的铃声，适合纪念日和生日',
  },
  {
    name: 'chime',
    label: '清脆铃声',
    description: '清脆悦耳的铃声，适合考试倒计时',
  },
  {
    name: 'none',
    label: '静音',
    description: '不播放提示音',
  },
]

/** 当前音频上下文 */
let currentAudioContext: UniApp.InnerAudioContext | null = null

/**
 * 获取可用铃声列表
 * @returns 铃声信息数组
 */
export function getSoundList(): SoundItem[] {
  return [...SOUND_LIST]
}

/**
 * 根据铃声名称获取铃声信息
 * @param soundName - 铃声标识名
 * @returns 铃声信息，未找到时返回默认铃声
 */
export function getSoundByName(soundName: string): SoundItem {
  return SOUND_LIST.find((s) => s.name === soundName) || SOUND_LIST[0]
}

/**
 * 播放指定铃声
 * 使用 uni.createInnerAudioContext 创建音频实例
 * @param soundName - 铃声标识名
 */
export function playSound(soundName: string): void {
  // 静音模式不播放
  if (soundName === 'none') {
    return
  }

  // 先停止当前正在播放的铃声
  stopSound()

  try {
    // 创建音频上下文
    const audioContext = uni.createInnerAudioContext()

    // 根据铃声名称设置音频源
    // 注意：实际音频文件需要放在 static/sounds/ 目录下
    // 这里使用条件编译处理不同平台的音频路径
    const soundMap: Record<string, string> = {
      default: '/static/sounds/default.mp3',
      gentle: '/static/sounds/gentle.mp3',
      urgent: '/static/sounds/urgent.mp3',
      celebration: '/static/sounds/celebration.mp3',
      chime: '/static/sounds/chime.mp3',
    }

    const src = soundMap[soundName] || soundMap.default
    audioContext.src = src

    // 音频播放结束后的回调
    audioContext.onEnded(() => {
      destroyAudioContext()
    })

    // 音频播放错误的回调
    audioContext.onError((err) => {
      console.warn('[SoundService] 铃声播放失败:', err)
      destroyAudioContext()
    })

    // 播放铃声
    audioContext.play()
    currentAudioContext = audioContext
  } catch (e) {
    console.error('[SoundService] 创建音频上下文失败:', e)
  }
}

/**
 * 停止当前正在播放的铃声
 */
export function stopSound(): void {
  if (currentAudioContext) {
    try {
      currentAudioContext.stop()
    } catch (e) {
      // 忽略停止时的错误
    }
    destroyAudioContext()
  }
}

/**
 * 销毁音频上下文并释放资源
 */
function destroyAudioContext(): void {
  if (currentAudioContext) {
    try {
      currentAudioContext.destroy()
    } catch (e) {
      // 忽略销毁时的错误
    }
    currentAudioContext = null
  }
}
