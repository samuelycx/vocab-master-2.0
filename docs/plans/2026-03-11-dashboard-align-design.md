# Dashboard Concept V2 像素级对齐设计

## 目标
将小程序 Dashboard 页面与 Pencil 文件中的 `Dashboard Concept V2 - Next` 进行像素级对齐，作为唯一真值来源。范围仅限 Dashboard 单页。

## 范围
- 仅修改 `miniprogram/src/components/Dashboard.vue`
- 不修改其他页面、不改业务逻辑

## 设计规范（真值来源：Pencil）

### 画布与布局
- 背景色：`#F6F1E8`
- 外边距（padding）：`[62, 24, 16, 24]`
- 垂直间距（gap）：`14`

### 主卡片（Main Focus Card）
- 尺寸：`height 292`，`width fill_container`
- 圆角：`30`
- 背景：`#FFF9F1`

#### 装饰元素
- 橙色圆：`170 x 170`，颜色 `#FF8A5B`
- 橙色光晕：`88 x 88`，颜色 `#FFD8C3`
- 头像底：`64 x 64`，颜色 `#EFE7DD`
- 头像内核：`30 x 30`，颜色 `#D2C7B8`

#### 文案
- Today Pill：`30` 高，圆角 `15`，背景 `#FFE5D6`
- Hero Title：`开始今天的\n10 词挑战`，`Inter 34/800`，`#1A1A1A`
- Hero Sub：`先学完本轮，再清空复习队列。`，`Inter 14`，`#3D3D3D`

#### CTA（mainCta）
- 尺寸：`183 x 63`
- 圆角：`24`
- 背景：`#6F58D9`

#### Focus Summary
- 尺寸：`136 x 142`
- 圆角：`24`
- 背景：`#1A1A1A`
- 副文案：`学完本轮后\n解锁奖励`

### 核心卡片区域（Core Row）
- 两卡并排，gap `14`，每卡 `height 172`，圆角 `24`
- Review Queue：背景 `#DCD3FF`
- Wordbook：背景 `#CDEAD7`

### Social Card
- 尺寸：`height 94`
- 圆角：`22`
- 背景：`#FFFFFF`

### Achievement Rail
- 尺寸：`height 142`
- 圆角：`22`
- 背景：`#FFFFFF`
- 轨道：`width 220`，`height 88`，背景 `#F3EBE2`
- 箭头按钮：`42 x 42`，圆角 `21`，背景 `#1A1A1A`

## 字体
- 英文/数字/中文统一使用 `Inter`

## 交付与验收
- 以真机预览与 Pencil 对照，做到布局、尺寸、颜色、字体、间距一致
- 若存在系统字体回退导致的轻微差异，以字号、间距一致为准
