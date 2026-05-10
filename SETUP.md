# CookFlow - 食谱笔记 + 烹饪向导

一款基于 React Native (Expo) 开发的移动应用，帮助你从抖音视频或文本中智能提取食谱，并提供沉浸式烹饪向导体验。

## 功能特性

- 📝 **文本识别**：粘贴食谱文本，AI 自动提取结构化食谱
- 🔗 **链接识别**：粘贴抖音视频链接，自动解析食谱
- 📖 **多食谱集合**：一次识别多个食谱，以卡片列表展示
- 🗒️ **笔记卡片**：精美的纵向笔记风格食谱详情页
- 🔥 **烹饪向导**：全屏大字步骤、自动倒计时、语音播报
- 📷 **成品拍照**：烹饪完成后拍照记录
- 💾 **本地存储**：所有数据持久化保存在本地

## 环境要求

- Node.js >= 18
- npm >= 9
- Expo CLI (`npx expo`)
- iOS Simulator (macOS) 或 Android Emulator 或 Expo Go App

## 快速开始

### 1. 安装依赖

```bash
cd CookFlow
npm install
```

### 2. 配置 API Key（可选）

应用支持两种模式：

- **演示模式**（默认）：不需要 API Key，使用内置的示例食谱数据
- **AI 模式**：配置 OpenAI API Key 后，可使用 AI 智能解析食谱

如需使用 AI 模式，请设置环境变量：

```bash
export OPENAI_API_KEY=your_openai_api_key_here
```

或在 `src/services/aiService.ts` 中直接配置（仅用于开发）。

### 3. 启动开发服务器

```bash
npx expo start
```

### 4. 在设备上运行

- **iOS Simulator**: 按 `i`
- **Android Emulator**: 按 `a`
- **Expo Go**: 扫描终端中的二维码
- **Web**: 按 `w`（部分功能如相机可能不可用）

## 项目结构

```
CookFlow/
├── App.tsx                      # 应用入口
├── src/
│   ├── types/
│   │   └── recipe.ts            # 类型定义
│   ├── theme/
│   │   └── index.ts             # 主题颜色、字体、间距
│   ├── storage/
│   │   └── recipeStorage.ts     # AsyncStorage 数据持久化
│   ├── services/
│   │   └── aiService.ts         # AI 食谱解析服务
│   ├── navigation/
│   │   └── AppNavigator.tsx     # 导航配置
│   ├── components/
│   │   ├── RecipeCard.tsx       # 食谱卡片组件
│   │   └── TimerRing.tsx        # 环形计时器组件
│   └── screens/
│       ├── HomeScreen.tsx       # 首页 - 食谱列表
│       ├── InputScreen.tsx      # 输入页 - 文本/链接识别
│       ├── RecipeCollectionScreen.tsx  # 食谱集合页
│       ├── RecipeDetailScreen.tsx      # 食谱详情页（笔记卡片）
│       ├── CookingGuideScreen.tsx      # 烹饪向导页
│       └── CompletionScreen.tsx        # 完成页（庆祝动画）
├── SETUP.md                     # 本文件
└── package.json
```

## 技术栈

- **React Native** + **Expo SDK 54**
- **React Navigation** - 原生栈导航
- **AsyncStorage** - 本地数据持久化
- **Expo Speech** - TTS 语音播报
- **Expo Haptics** - 触觉反馈
- **Expo Image Picker** - 拍照/选图
- **React Native Reanimated** - 高性能动画
- **React Native SVG** - 环形计时器
- **React Native Gesture Handler** - 手势控制

## 设计风格

采用温暖、高级的"数字笔记"风格：
- 主色调：暖奶油色背景 (`#FDF6EC`)
- 强调色：温暖珊瑚色 (`#E07A5F`)
- 笔记卡片有轻微阴影和圆角，模拟纸张质感
- 烹饪界面使用深色背景，突出大号白色文字
- 参考 Notion / Apple Notes 的清爽质感

## 注意事项

- 链接识别功能当前使用 AI 推断（GPT-4o-mini），实际生产中需要集成抖音 API 获取视频字幕
- 演示模式下会返回预设的示例食谱（番茄炒蛋、蒜蓉西兰花）
- 所有数据存储在设备本地，卸载 App 会清除数据
- TTS 语音播报使用系统自带的中文语音引擎
