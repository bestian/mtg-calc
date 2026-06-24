# 🃏 MTG 機率計算機

計算並視覺化《魔法風雲會》(Magic: The Gathering) 紙牌遊戲起手與前幾回合的牌組機率分佈 —— 包含地牌數量、各色色源、以及指定法術的施放機率 (castability),並提供即時牌組建議。

純前端單頁應用 (Vue 3 SPA),所有機率以超幾何分佈 (hypergeometric distribution) 在 log-space 計算,無後端、無外部 API。

開發中。

## 功能

- **地牌分佈** —— 起手 7至11 張時抽到 0至11 張地牌的機率長條圖與表格
- **色源分佈** —— 每個指定顏色 (B/W/U/G/R) 的色源抽取機率
- **施放機率** —— 給定法力費用 (如 `1GG`、`2UB`),逐回合計算可如期施放的機率,含先手/後手的下地節奏 (turn-drop gate)
- **即時建議** —— 地牌數量基準、卡頓/灌水風險、色源是否足夠等提示

## 技術棧

Vue 3 (Composition API, `<script setup>`) · Vite · Tailwind CSS v3 · Chart.js + vue-chartjs · Vitest

## 環境需求

- Node.js 18+ (建議 20+)
- npm

## 開發指令

```bash
# 安裝相依套件
npm install

# 啟動開發伺服器 (預設 http://localhost:5173)
npm run dev

# 執行單元測試 (一次性)
npm run test

# 監看模式執行測試
npm run test:watch

# 打包正式版到 dist/
npm run build

# 本機預覽打包結果
npm run preview
```

## 專案結構

```
src/
├─ main.js                      # 進入點,掛載 App
├─ App.vue                      # 組裝 composables 與所有區塊
├─ math/
│  └─ hypergeometric.js         # 超幾何 PMF + buildMatrix (log-space)
├─ composables/                 # 全部狀態與計算 (reactive)
│  ├─ useLandProbability.js     # 牌組/地牌設定 → 地牌機率矩陣
│  ├─ useColorProbability.js    # 色源 + 法力費用解析 → 色源矩陣 + 施放率
│  └─ useAdvisor.js             # 依以上推導出建議訊息
└─ components/                  # 純顯示元件 (props in, events out)
   ├─ ProbChart.vue             # 共用機率長條圖
   ├─ ProbTable.vue             # 共用機率表格
   ├─ DeckConfig.vue            # 牌組/先後手設定
   ├─ AdvisorCard.vue           # 建議卡片
   ├─ LandSection.vue           # 地牌分佈區塊
   ├─ ColorConfig.vue           # 色源/費用輸入
   └─ ColorSection.vue          # 各色分佈 + 施放率表
```

架構原則:三個 composable 持有所有狀態與數學,元件純顯示;composable 在 `App.vue` 以傳入 reactive ref 的方式串接,沒有隱藏的模組層共享狀態。

## 設計與計畫文件

- 規格:[`docs/superpowers/specs/2026-06-23-mtg-calc-design.md`](docs/superpowers/specs/2026-06-23-mtg-calc-design.md)
- 實作計畫與進度:[`docs/superpowers/plans/2026-06-23-mtg-calc.md`](docs/superpowers/plans/2026-06-23-mtg-calc.md)
