import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      // 路径别名 @ 指向 src 目录
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    // 全局预处理器配置
    preprocessorOptions: {
      scss: {
        // 自动引入全局SCSS变量文件
        additionalData: '@import "@/uni.scss";',
      },
    },
  },
})
