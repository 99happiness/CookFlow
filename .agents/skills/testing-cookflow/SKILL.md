---
name: testing-cookflow
description: Test the CookFlow recipe app end-to-end. Use when verifying UI, navigation, recipe parsing, cooking guide, or persistence changes.
---

# Testing CookFlow

## Prerequisites
- Node.js >= 18
- Project dependencies installed (`npm install`)
- Web platform deps: `npx expo install react-dom react-native-web`

## Starting the Dev Server
```bash
cd /home/ubuntu/repos/CookFlow
npx expo start --web --port 8083
```
The app will be available at `http://localhost:8083`.

If port 8083 is in use, Expo will prompt to use the next available port — accept it.

## Demo Mode vs AI Mode
- **Demo mode** (default, no API key): Returns built-in mock recipes (番茄炒蛋 + 蒜蓉西兰花). To trigger multi-recipe flow, input text must be >= 30 characters. Short text (< 30 chars) returns a single recipe.
- **AI mode**: Set `OPENAI_API_KEY` environment variable before starting. Uses GPT-4o-mini for real recipe parsing.

## Key Test Flows

### 1. Multi-Recipe Text Input Flow
1. Home screen → Click "添加新食谱"
2. Ensure "文本识别" tab is active
3. Type a long Chinese text (>= 30 chars) e.g. "今天教大家做两道家常菜，第一道番茄炒蛋，第二道蒜蓉西兰花，都非常简单好吃"
4. Click "AI 智能识别" button
5. Verify: RecipeCollection screen with "2道美味食谱" header, two recipe cards

### 2. Recipe Detail Card
1. From collection, click "番茄炒蛋" card
2. Verify: Gradient cover, recipe name, "⏱ 10分钟" badge, 6 ingredients in "你需要准备", 6 steps in "跟着做" with duration badges
3. Verify: "开始烹饪" button at bottom

### 3. Cooking Guide
1. Click "开始烹饪"
2. Verify: Dark fullscreen, "步骤 1" badge, large white text, 1/6 counter
3. Step 1 should have NO timer ring (no duration)
4. Click "下一步" → Step 2 should show SVG timer ring counting down from 0:30
5. Navigate through all 6 steps
6. Last step shows "完成 ✓" button instead of "下一步"

### 4. Completion & Persistence
1. Click "完成 ✓" on last step
2. Verify: Confetti animation, "完成烹饪!" title, "拍摄成品照" and "回到首页" buttons
3. Click "回到首页"
4. Verify: Home shows saved collection card "2道美味食谱" with "2道食谱" meta

## Web Platform Limitations
These features require a native iOS/Android device and cannot be tested on web:
- TTS/Speech (expo-speech)
- Camera/Photo capture (expo-image-picker camera mode)
- Haptic feedback (expo-haptics)
- Swipe gestures (PanResponder — buttons work as alternative on web)

## Devin Secrets Needed
- `OPENAI_API_KEY` (optional) — only needed for AI parsing mode; demo mode works without it
