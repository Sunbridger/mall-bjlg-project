# 优选商城 · 商品选购 Web 应用

React 18 + TypeScript + Vite + antd 5 + Less 构建的纯前端商品选购应用，PC / 移动端响应式。
商品浏览、搜索、分类筛选、商品详情、购物车全部可用，**数据为本地 Mock，不涉及后端与真实支付**。

线上地址：[`Sunbridger/mall-bjlg-project`](https://github.com/Sunbridger/mall-bjlg-project)（Vercel 导入该仓库即可发布）

---

## 1. 环境要求

| 项 | 版本 |
| --- | --- |
| Node.js | >= 18（开发机实测 v22.21.1） |
| npm | >= 9（开发机实测 10.9.4） |

## 2. 启动命令

```bash
npm install       # 安装依赖
npm run dev       # 开发服务器，http://localhost:5173（带 HMR，自动打开浏览器）
```

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器（Vite） |
| `npm run build` | 类型检查（`tsc --noEmit`）+ 生产构建，产物输出到 `dist/` |
| `npm run preview` | 本地预览 `dist/` 构建产物，http://localhost:4173 |
| `npm run typecheck` | 只跑类型检查，不产出文件 |

## 3. 依赖声明

**运行时依赖**（`dependencies`）

| 包 | 声明范围 | 安装版本 | 用途 |
| --- | --- | --- | --- |
| `react` | ^18.3.1 | 18.3.1 | UI 框架（按要求锁定 18） |
| `react-dom` | ^18.3.1 | 18.3.1 | React DOM 渲染 |
| `react-router-dom` | ^6.26.0 | 6.30.6 | 路由（SPA，5 个页面 + 404） |
| `antd` | ^5.20.0 | 5.29.3 | 组件库（含主题 Token、ConfigProvider） |
| `@ant-design/icons` | ^5.4.0 | 5.6.1 | 图标 |

**开发依赖**（`devDependencies`）

| 包 | 声明范围 | 安装版本 | 用途 |
| --- | --- | --- | --- |
| `vite` | ^5.4.0 | 5.4.21 | 开发服务器 + 生产构建 |
| `@vitejs/plugin-react` | ^4.3.1 | 4.7.0 | React 支持（Fast Refresh） |
| `less` | ^4.2.0 | 4.9.1 | 样式预处理（antd 5 自身用 CSS-in-JS，这里的 Less 只服务业务样式） |
| `typescript` | ^5.5.4 | 5.9.3 | 类型系统 |
| `@types/react` | ^18.3.3 | 18.3.31 | React 类型 |
| `@types/react-dom` | ^18.3.0 | 18.3.7 | ReactDOM 类型 |
| `@types/node` | ^22.5.0 | 22.20.5 | 供 `vite.config.ts` 使用 `node:url` |

> 完整锁定版本见 `package-lock.json`。**没有引入** Redux / Zustand / axios / 任何 CSS 框架 / 任何测试框架。

## 4. 必要配置说明

| 文件 | 关键配置 | 说明 |
| --- | --- | --- |
| `vite.config.ts` | `resolve.alias` | `@` → `src`，全项目用 `@/xxx` 绝对引入 |
| | `css.preprocessorOptions.less.additionalData` | **全局注入** `variables.less` + `mixins.less`，业务样式文件无需重复 `@import` |
| | `build.rollupOptions.output.manualChunks` | 把 `react*` 与 `antd*` 拆成独立 chunk，避免业务代码变更导致整体缓存失效 |
| | `server.port` / `host` / `open` | 5173，监听 `0.0.0.0`（方便手机连同一局域网调试），自动开浏览器 |
| `tsconfig.json` | `strict` + `noUnusedLocals` + `noUnusedParameters` | 全量严格模式，未使用变量会直接构建失败 |
| | `paths` | `@/*` → `./src/*`，与 Vite alias 保持一致 |
| `vercel.json` | `framework: vite`、`buildCommand`、`outputDirectory` | Vercel 零配置识别 |
| | `rewrites: /(.*) → /index.html` | **SPA 路由重写**，刷新 `/product/xxx` 等子路由不会 404 |
| | `headers` | `/assets/*` 加一年 immutable 缓存头（文件名带 hash） |
| `index.html` | `viewport` 含 `viewport-fit=cover` | 配合 Less 里的 `env(safe-area-inset-bottom)` 处理 iPhone 底部横条 |
| `.npmrc` | — | 本机专用的 npm 缓存绕行配置（缓存指向项目内 `.npm-cache`，绕开本机 `~/.npm/_cacache` 的 `EACCES` 权限冲突）。已加入 `.gitignore`，但**当前仍被版本控制跟踪**，不需要时执行 `git rm --cached .npmrc` 可移出。对 Vercel 构建无影响，删掉也能跑 |

**需要成对修改的常量**：移动端断点写在两处，改动时必须同步 ——
`src/hooks/useResponsive.ts` 的 `MOBILE_BREAKPOINT = 768` 与 `src/styles/variables.less` 的 `@bp-md: 768px`。

## 5. 目录结构

```
src/
├── api/          seed.ts（80 条手写商品种子）· mockData.ts（确定性生成）· product.ts（异步 Mock 接口）
├── components/   AppLayout · ProductCard · ProductGrid · SearchBar · FilterBar
│                 CategoryNav · CartBadge · QuantityStepper · EmptyState · ScrollToTop
├── hooks/        useResponsive（断点） · useSearchHistory（搜索历史）
├── pages/        Home · Category · Search · ProductDetail · Cart · NotFound
├── router/       路由表（页面级 React.lazy 懒加载 + Suspense）
├── store/        cartReducer.ts（纯逻辑） · cart.tsx（Context + useReducer + localStorage 持久化）
├── styles/       variables.less · mixins.less · global.less
└── utils/        format（金额） · image（图源 + 降级） · search（匹配/筛选/排序） · product（规格）
```

## 6. 已完成的内容

**页面（5 + 1）**

| 页面 | 路由 | 已实现 |
| --- | --- | --- |
| 首页 | `/` | 商品实拍图轮播（4 张，点击进对应搜索词）、8 个分类入口、猜你喜欢网格 + 加载更多 |
| 分类 | `/category`、`/category/:id` | PC 左侧分类树（含二级分类）/ 移动端分类 Tab、排序与价格区间筛选 |
| 搜索 | `/search?q=` | 关键词搜索、输入联想、搜索历史（localStorage，最多 10 条、可单删可清空）、热门搜索、排序、价格区间、结果分页加载更多、零结果引导 |
| 商品详情 | `/product/:id` | 4 图切换（PC 悬停换图 / 移动点击）、规格选择、数量增减（受库存约束）、加入购物车、立即购买、相关推荐 |
| 购物车 | `/cart` | 单选 / 全选、数量增减、逐条删除、合计与省钱金额、空态引导；移动端底部结算栏 |
| 404 | `*` | antd `Result` + 回首页 |

**能力**

- **搜索**：名称 / 品牌 / 分类 / 二级分类 / 标签全文匹配；多关键词为 AND 语义；大小写、空格、`-`/`_`/`·` 分隔符均不敏感；
  排序支持 综合（销量加权）/ 销量 / 评分 / 价格升降。
- **购物车**：同一商品**不同规格算两行**，**同规格重复加购累加数量**；数量收敛到 1–99；
  全量写入 `localStorage`，刷新与跳转都不丢；角标显示总件数并在加购时播放跳动动画。
- **响应式**：断点 `768px`。移动端 = 顶部标题栏（子页带返回）+ 底部 4 项 TabBar + 详情页悬浮操作条 + 单行下拉筛选条；
  PC 端 = 顶部导航 + 搜索框 + 侧边分类树 + 双行标签筛选。商品网格 2 / 3 / 4 / 5 列随宽度自适应。
- **工程**：页面级懒加载分包、`@` 路径别名、Less 变量与 mixin 全局注入、antd 主题 Token 覆盖为红色系（`#ff4d4f`）、中文 locale。

## 7. 数据说明

- **8 个一级分类 / 80 件商品**（数码、服饰、家居、食品、美妆、运动、图书、母婴，每类 10 件），含二级分类。
- 手写部分只有名称、品牌、价格、卖点标签（`src/api/seed.ts`）；**销量、评分、库存、描述、规格由商品 id 哈希确定性生成**
  （`src/api/mockData.ts`），不使用 `Math.random`，因此同一 id 每次结果完全一致，便于截图与复现。
- 接口层 `src/api/product.ts` 带 **80–300ms 人为延迟**以复现真实加载态（骨架屏、按钮 loading）。
  接真实后端时只需替换这一层，组件无需改动。
- 商品图默认走 `picsum.photos` 的**种子图**：同一种子永远返回同一张照片，无需自备图床；
  加载失败会 `onError` 降级为本地生成的 SVG 占位图。

## 8. 实际验证过的场景

验证方式：`vite build` 产物 + `vite preview` 起服务，用**无头 Chrome + CDP（Chrome DevTools Protocol）**真实驱动页面，
断言 DOM 与 `localStorage`，而非只看构建是否通过。以下均为实测通过项。

**构建与类型**
- `npx tsc --noEmit` 0 错误；`npm run build` 成功（产物 `dist/` 约 920KB，antd chunk gzip 246KB）。

**购物链路**
- 详情页正确渲染标题 / 价格 `¥8,999.00` / 划线价 / 折扣 `9.0折` / 规格组 / 相关推荐。
- 选规格「星光白」后加购 → `localStorage.mall-cart-v1` 写入 `specText: "颜色:星光白 / 版本:标准版"`。
- 同商品选不同规格再加购 → **新增一行**；同规格连续加购两次 → **该行数量为 2**（两行合计 3 件）。
- 顶部购物车角标读数 = **3**。
- 购物车页刷新后数据仍在，合计金额 `¥26,997.00`（8999×1 + 8999×2），已选件数与全选状态联动。
- 逐条删除：点垃圾桶 → 弹出确认 → 确认后行数 2→1，顶部「共 N 件商品」同步更新。
- 取消全选后底部合计归零为 `¥0.00`，去结算按钮置灰。

**浏览与搜索**
- 首页渲染商品卡片、Banner 背景确认为「压暗遮罩 + 图片 URL」双层（`backgroundImage` 含 `url(`）。
- 首页 Banner 四层容器高度完全一致（176 / 176 / 176 / 176），无内嵌空白。
- 搜索「降噪耳机」返回 1 件并渲染卡片；搜索页显示结果统计文案。
- 分类页 `/category/digital` PC 端为双行标签（`.filter-bar__row` = 2），页面标题已移除。

**移动端筛选交互（390px）**
- 筛选条为单行 3 项（综合 / 价格 / 筛选），PC 版双行标记节点数为 0。
- 点「综合」弹出排序菜单 → 选「销量」→ 标签跟随更新为「销量」。
- 点「价格」→ 结果按价格升序（实测 8999 起），该项高亮为激活态。
- 点「筛选」→ 弹出价格区间面板 → 选「5000 以上」→ 结果全部 ≥5000，标签变为「5000 以上」，面板自动收起。

**响应式**
- 390px：渲染底部 TabBar，商品网格 **2 列**。
- 1280px：PC 顶部导航渲染、**不渲染** TabBar、商品网格 **5 列**（≥1200px 生效）。
- 820px：已截图确认 Banner 各层高度一致（260 / 260 / 260 / 260），未单独断言网格列数。

**路由与部署形态**
- 直接访问 `/`、`/category`、`/category/digital`、`/search?q=iphone`、`/product/digital-1`、`/cart`、`/nope` 均返回 200（SPA 回退正常）。
- 404 页、空购物车空态文案正常。

## 9. 已知问题

1. **商品图与商品无关**：图来自 `picsum.photos` 的随机照片，同一 id 图固定，但内容并非真实商品照。
   要彻底离线可把 `src/utils/image.ts` 的 `USE_REMOTE_IMAGES` 改成 `false`，会切换为纯色渐变 SVG 占位图（观感会明显变素）。
   接入真实商品图后此问题消失。
2. **搜索纯前端内存计算**：80 条数据下无感，但未做输入防抖、未做虚拟列表；数据量上万需要换后端接口 + 分页 + 防抖。
3. **分类页无分页**：按 `pageSize: 200` 一次取全再前端筛选（每类仅 10 件）。只有首页与搜索页有「加载更多」。
4. **首页「加载更多」的边界行为**：推荐按热度轮换取数，取满一轮后去重结果为空即判定到底，
   因此某次点击不会追加而是直接变成「已经到底啦」——观感上像是"点了没反应"。
5. **「去结算」只弹演示 Modal**：没有收货地址、订单、支付流程，这是按需求范围刻意省略的。
6. **购物车仅存本地**：清浏览器数据即丢失；未监听 `storage` 事件，**多个标签页之间不同步**。
7. **首屏 JS 偏大**：antd 分包 gzip 约 246KB（Dropdown / Popover / Skeleton / Modal 等拉入较多模块）。
   若在意首屏，可改用 antd 按需引入或把筛选组件进一步懒加载。
8. **移动端筛选条高 36px**，低于 iOS 建议的 44px 最小点击尺寸。因每格宽度约 119px，实测可正常点中，但不符合无障碍最佳实践。
9. **未配置 ESLint / Prettier / 单元测试**，代码风格靠约定维持。
10. **列表页加购直接使用默认规格**（每组第一项），不会拦用户去详情页选规格。需要"先选规格再加购"的话需额外加拦截逻辑。

## 10. 主要取舍

1. **只用 Vite，不用 Webpack**。最初需求写了 Webpack 打包，确认后去掉。一份配置同时管 dev 与 build，
   HMR 快、Vercel 零配置识别；代价是放弃 Webpack 的 loader/plugin 生态。当时也评估过「双构建 + 共享配置层」，因维护成本翻倍而放弃。
2. **一套响应式布局，不做 PC / 移动两套组件**。代码量减半、行为一致；代价是个别差异大的控件（分类导航、筛选条）仍需在组件内分支渲染。
3. **状态用 Context + useReducer，不用 Redux / Zustand**。全项目只有购物车一处共享状态，零额外依赖；
   `cartReducer.ts` 是纯函数、与 React 解耦，便于单独推演与将来加测试。代价是购物车变更会让 Provider 下所有消费者重渲染——当前规模无感。
4. **纯前端 Mock，不做后端与支付**。Mock 延迟刻意保留，接口层集中在 `src/api/product.ts` 一个文件，替换成本最低。
5. **图片走远程 CDN + 本地 SVG 降级**，而不是打包进仓库。免图床、部署即用、网络失败也不裂图；代价是首屏多依赖一个外部域名。
6. **不写单元测试**（按你的要求去掉 vitest 与 testing-library），改为无头浏览器端到端实测。
   好处是验证的是真实渲染结果而非纯函数；代价是缺少自动化回归网，改动后需要重新手工跑一遍。
7. **商品数据 = 手写种子 + 确定性生成**，而不是 `Math.random()` 造数据。数据看起来真实，且同一 id 每次结果一致，
   截图、复现问题、写断言都可预期。

## 11. 部署到 Vercel

仓库已含 `vercel.json`，Vercel 会自动识别为 Vite，无需填任何环境变量。

**方式：网页导入 Git 仓库（推荐，可自动持续部署）**

1. 把仓库推到 GitHub（本仓库 `origin` 已指向 `https://github.com/Sunbridger/mall-bjlg-project.git`）。
2. 打开 [vercel.com/new](https://vercel.com/new)，选择 **Import Git Repository**，授权并选中该仓库。
3. 配置页保持默认（Framework 会识别成 **Vite**，Build Command `npm run build`，Output Directory `dist`），点 **Deploy**。
4. 之后每次 `git push` 到默认分支都会自动重新部署。

**方式二：Vercel CLI**

```bash
npx vercel login     # 浏览器授权
npx vercel           # 首次部署（预览环境）
npx vercel --prod    # 发布到生产环境
```

**其他免费平台**：Netlify / Cloudflare Pages 同样可用 —— 构建命令 `npm run build`、发布目录 `dist`，
并需配置 SPA 重写（所有路径 → `/index.html`），否则刷新子路由会 404。
