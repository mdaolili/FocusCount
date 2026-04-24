# 心选倒计时 (FocusCount)

一款基于 **UniApp + Vue3 + Vite + TypeScript** 的跨平台倒计时应用，支持 H5 网页端和微信小程序。

## 功能特性

- **首页置顶展示**：星标置顶项目，首页全屏沉浸式倒计时，秒级实时更新
- **多类型管理**：支持考试、项目截止、纪念日、生日、自定义等多种分类
- **卡片列表**：全部倒计时以卡片形式展示，支持星标置顶、编辑、提醒、删除
- **内联弹窗操作**：新增和编辑均使用居中弹窗，无需跳转页面
- **悬浮菜单**：卡片右上角三点菜单，操作便捷
- **颜色标签**：7 种颜色标签可选，视觉区分不同项目
- **提醒设置**：支持当天、提前 1/3/7 天提醒
- **每年重复**：纪念日和生日类型自动支持每年重复
- **7 天预警**：剩余 7 天内数字自动变红预警
- **设置弹窗**：首页内嵌设置弹窗，展示使用提示

## 技术栈

| 技术 | 说明 |
|------|------|
| UniApp | 跨平台框架 |
| Vue 3 | 前端框架（Composition API） |
| Vite | 构建工具 |
| TypeScript | 类型安全 |
| Pinia | 状态管理 |
| SCSS | 样式预处理 |

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── CountdownCard.vue    # 倒计时卡片（含悬浮菜单）
│   ├── CountdownDisplay.vue # 倒计时数字展示
│   ├── EmptyState.vue       # 空状态组件
│   └── TypeTag.vue          # 类型标签组件
├── pages/               # 页面
│   ├── index/index.vue      # 首页（置顶倒计时 + 设置弹窗）
│   ├── list/list.vue        # 全部倒计时列表（含新增/编辑弹窗）
│   ├── settings/settings.vue # 设置页（居中弹窗）
│   ├── edit/edit.vue        # 编辑页（备用）
│   ├── add/add.vue          # 新增页（备用）
│   └── archive/archive.vue  # 归档页
├── services/            # 服务层（业务逻辑）
│   ├── countdown.ts         # 倒计时计算、格式化、类型颜色
│   ├── notification.ts      # 通知服务
│   ├── sound.ts             # 提示音服务
│   └── storage.ts           # 本地存储服务
├── stores/              # Pinia 状态管理
│   ├── countdown.ts         # 倒计时数据 store
│   └── settings.ts          # 应用设置 store
├── styles/              # 全局样式
│   ├── variables.scss       # 设计变量（颜色、字体、间距）
│   ├── common.scss          # 公共样式
│   ├── global.scss          # 全局样式
│   └── animations.scss      # 动画样式
├── types/               # TypeScript 类型定义
│   └── index.ts             # CountdownItem、AppSettings 等
├── utils/               # 工具函数
│   └── index.ts
├── static/              # 静态资源
│   ├── tab-home.png         # 首页 tab 图标
│   ├── tab-home-active.png  # 首页 tab 选中图标
│   ├── tab-list.png         # 列表 tab 图标
│   ├── tab-list-active.png  # 列表 tab 选中图标
│   └── icon-settings.png    # 设置齿轮图标
├── App.vue
├── main.ts
├── pages.json           # 页面路由与 tab 配置
├── manifest.json        # 应用配置
└── uni.scss             # UniApp 全局样式变量
```

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
cd FocusCount
npm install
```

### 启动开发

```bash
# H5 网页端
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin
```

### 构建生产

```bash
# H5 网页端
npm run build:h5

# 微信小程序
npm run build:mp-weixin
```

## 设计规范

### 配色方案

| 用途 | 色值 | 说明 |
|------|------|------|
| 主色调 | `#3B82F6` | 蓝色 |
| 主色浅 | `#60A5FA` | 渐变/悬浮 |
| 主色深 | `#2563EB` | 强调/标签 |
| 页面背景 | `#E8EEF8` | 薰衣草蓝 |
| 卡片背景 | `#FFFFFF` | 白色 |
| 主文字 | `#1A1A2E` | 深蓝黑 |
| 次文字 | `#8B9DC3` | 蓝灰 |
| 辅助文字 | `#BFBFBF` | 浅灰 |

### 分层架构

```
页面/组件（UI 渲染 + 用户交互）
    ↓ 调用
Store（Pinia 状态管理）
    ↓ 调用
Service（业务逻辑 + 数据处理）
    ↓ 调用
Utils / Types（工具函数 + 类型定义）
```

- **页面/组件**：仅负责 UI 渲染和触发事件，不包含业务逻辑
- **Service**：封装接口请求、数据处理、业务计算，导出清晰方法名
- **Store**：管理应用状态，调用 Service 层方法

## 页面说明

### 首页（重点关注）

- 展示单个置顶倒计时项目，全屏沉浸式布局
- 天数大卡片 + 时分秒小卡片，居中排列
- 7 天内自动红色预警，到期显示「已结束」
- 右上角齿轮图标打开设置弹窗

### 全部倒计时

- 卡片列表展示所有倒计时项目
- 右上角 `+` 按钮新建倒计时（居中弹窗）
- 卡片星标可设为首页置顶
- 三点悬浮菜单：置顶、编辑、提醒、删除
- 点击卡片直接打开编辑弹窗

### 设置

- 首页内嵌居中弹窗，不跳转页面
- 展示使用提示信息

