# 桌面小组件（Desktop Widget）说明文档

## 概述

FocusCount 桌面小组件用于在设备桌面/主屏幕上展示置顶倒计时项目的名称和剩余天数，用户无需打开应用即可快速查看重要倒计时信息。

> **注意**：由于 UniApp 对桌面小组件的支持有限，本模块主要提供组件代码和配置框架，实际部署需要原生开发配合。

---

## 架构设计

```
src/widgets/
├── README.md                  # 本说明文档
├── countdown-widget.vue       # 小组件 UI 组件（Vue 模板）
└── widget-service.ts          # 小组件数据服务（业务逻辑）
```

### 工作流程

1. **数据获取**：小组件通过 `widget-service.ts` 中的服务方法从本地存储读取置顶倒计时数据
2. **数据计算**：服务层计算剩余天数，格式化展示内容
3. **UI 渲染**：`countdown-widget.vue` 接收 props 数据，渲染简洁的倒计时卡片
4. **主题适配**：根据系统/用户设置自动切换暗黑/浅色模式

---

## 各平台实现方式

### 1. Android 平台

#### 实现方式
使用 UniApp 的 `app-plus` widget 配置 + Android AppWidget 原生实现。

#### 配置说明

在 `manifest.json` 的 `app-plus` 节点下添加 widget 配置：

```json
{
  "app-plus": {
    "widgets": [
      {
        "name": "countdown-widget",
        "minWidth": 4,
        "minHeight": 2,
        "updateInterval": 1800000,
        "targetCellWidth": 4,
        "targetCellHeight": 2
      }
    ]
  }
}
```

#### 原生开发步骤

1. **创建 AppWidget Provider**：在 Android 原生工程中创建 `CountdownWidgetProvider`，继承 `AppWidgetProvider`
2. **布局文件**：在 `res/layout/` 下创建小组件布局 XML
3. **更新逻辑**：在 `onUpdate()` 中读取本地存储数据，更新 RemoteViews
4. **定时刷新**：通过 `AlarmManager` 设置定时更新（建议 30 分钟一次）
5. **点击跳转**：通过 `PendingIntent` 实现点击小组件跳转到应用主页

#### 关键代码示例（Android 原生）

```java
// CountdownWidgetProvider.java
public class CountdownWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // 从 SharedPreferences 读取置顶倒计时数据
        // 更新 RemoteViews 显示名称和剩余天数
        // 设置点击跳转 PendingIntent
    }
}
```

---

### 2. iOS 平台

#### 实现方式
使用 WidgetKit Extension（iOS 14+）。

#### 原生开发步骤

1. **添加 Widget Extension Target**：在 Xcode 中为项目添加 WidgetKit Extension
2. **创建 Timeline Provider**：实现 `TimelineProvider` 协议，提供小组件数据
3. **定义 Widget 视图**：使用 SwiftUI 构建小组件 UI
4. **数据共享**：通过 App Group 共享 UserDefaults 数据
5. **配置 Widget 种类**：在 `WidgetBundle` 中注册不同尺寸的小组件

#### 关键代码示例（Swift）

```swift
// CountdownWidgetEntry.swift
struct CountdownEntry: TimelineEntry {
    let date: Date
    let name: String
    let remainingDays: Int
    let color: String
}

// CountdownWidgetProvider.swift
struct CountdownProvider: TimelineProvider {
    func placeholder(in context: Context) -> CountdownEntry {
        CountdownEntry(date: Date(), name: "加载中...", remainingDays: 0, color: "#4A6CF7")
    }

    func getSnapshot(in context: Context, completion: @escaping (CountdownEntry) -> Void) {
        // 从 App Group UserDefaults 读取数据
        let sharedDefaults = UserDefaults(suiteName: "group.com.focuscount.widget")
        // ... 读取置顶倒计时数据并返回 Entry
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CountdownEntry>) -> Void) {
        // 生成时间线，建议每 30 分钟刷新一次
    }
}
```

#### App Group 配置

在 Xcode 中配置 App Group：
- 主应用和 Widget Extension 需要使用相同的 App Group ID
- 例如：`group.com.focuscount.shared`

---

### 3. 微信小程序

#### 实现方式
使用小程序自定义组件 + Canvas 绘制，配合 `wx.onAppShow` 生命周期更新数据。

#### 实现步骤

1. **创建自定义组件**：在小程序 `components/` 目录下创建小组件组件
2. **Canvas 绘制**：使用 Canvas 2D API 绘制倒计时卡片
3. **数据同步**：通过 `wx.getStorageSync` 读取倒计时数据
4. **页面嵌入**：在首页或独立页面中嵌入小组件组件

#### 关键代码示例

```javascript
// components/countdown-widget/countdown-widget.js
Component({
  properties: {
    theme: { type: String, value: 'light' }
  },
  lifetimes: {
    attached() {
      this.loadData()
    }
  },
  methods: {
    loadData() {
      const pinnedList = wx.getStorageSync('pinnedCountdowns') || []
      if (pinnedList.length > 0) {
        this.drawWidget(pinnedList[0])
      }
    },
    drawWidget(item) {
      // 使用 Canvas 2D 绘制小组件卡片
      const query = this.createSelectorQuery()
      query.select('#widgetCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          // 绘制背景、文字、倒计时天数
        })
    }
  }
})
```

---

## 数据服务接口

小组件通过 `widget-service.ts` 提供的服务方法获取数据：

| 方法名 | 说明 | 返回值 |
|--------|------|--------|
| `getPinnedCountdown()` | 获取置顶倒计时项目 | `CountdownItem \| null` |
| `calculateRemainingDays(targetDate)` | 计算剩余天数 | `number` |
| `formatWidgetText(item)` | 格式化小组件展示文本 | `{ name, days, unit }` |
| `getWidgetTheme()` | 获取当前主题模式 | `'light' \| 'dark'` |

---

## 小组件尺寸规格

| 平台 | 小尺寸 | 中尺寸 | 大尺寸 |
|------|--------|--------|--------|
| Android | 2x2 (110x110dp) | 4x2 (250x110dp) | 4x4 (250x250dp) |
| iOS | small (155x155pt) | medium (329x155pt) | large (329x329pt) |
| 微信小程序 | 自定义（建议 350x150rpx） | - | - |

---

## 注意事项

1. **UniApp 限制**：UniApp 框架本身不直接支持桌面小组件的完整开发，需要配合原生代码实现
2. **数据同步**：小组件数据通过本地存储（App Group / SharedPreferences / wx.Storage）与主应用同步
3. **刷新频率**：建议设置 30 分钟以上的刷新间隔，避免耗电
4. **主题适配**：小组件需监听系统主题变化，自动切换暗黑/浅色模式
5. **最低版本**：
   - Android：API 26 (Android 8.0) 以上支持完整的 AppWidget 功能
   - iOS：iOS 14.0 以上支持 WidgetKit
   - 微信小程序：基础库 2.9.0 以上支持 Canvas 2D
