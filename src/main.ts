/**
 * main.ts - 应用入口文件
 * 创建Vue3应用实例，注册Pinia状态管理和uview-plus UI组件库
 */
import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

// 引入uview-plus
import uviewPlus from 'uview-plus'

export function createApp() {
  const app = createSSRApp(App)

  // 注册Pinia状态管理
  const pinia = createPinia()
  app.use(pinia)

  // 注册uview-plus UI组件库
  app.use(uviewPlus)

  return {
    app,
  }
}
