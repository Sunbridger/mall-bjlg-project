# 优选商城 · 商品选购 Web 应用

React 18 + Vite + TypeScript + antd 5 + Less 构建的纯前端商品选购应用，PC / 移动端响应式，
商品、购物车数据全部为本地 Mock，**不涉及任何后端与真实支付**。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173
```

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（HMR） |
| `npm run build` | 类型检查 + 生产构建，产物在 `dist/` |
| `npm run preview` | 本地预览构建产物 |
| `npm run typecheck` | 只跑 `tsc --noEmit` |

> 本仓库的 `.npmrc` 把 npm 缓存指向项目内的 `.npm-cache`，用于绕开本机
> `~/.npm/_cacache` 的权限冲突。换机器后可删除该文件。

## 功能

| 页面 | 路由 | 内容 |
| --- | --- | --- |
| 首页 | `/` | 轮播 Banner、8 个分类入口、猜你喜欢（加载更多） |
| 分类 | `/category/:id` | PC 左侧分类树 / 移动端分类 Tab、排序与价格筛选 |
| 搜索 | `/search?q=` | 关键词搜索、联想词、搜索历史、热门搜索、排序筛选、结果分页加载 |
| 商品详情 | `/product/:id` | 图集切换、规格选择、数量、加入购物车 / 立即购买、相关推荐 |
| 购物车 | `/cart` | 单选 / 全选、数量增减、删除、合计、清空、去结算（演示提示） |

- **搜索**：名称 / 品牌 / 分类 / 标签全文匹配，多关键词为 AND 语义，命中后按综合、销量、评分或价格排序。
- **购物车**：同一商品不同规格算两行，同规格重复加购累加数量；数据写入 `localStorage`，刷新不丢。
- **响应式**：断点 `768px`。移动端顶部标题栏 + 底部 TabBar + 详情页悬浮操作条；PC 端顶部导航 + 侧边筛选。

## 目录结构

```
src/
├── api/          seed.ts(手写商品种子) · mockData.ts(确定性生成) · product.ts(异步 mock 接口)
├── components/   AppLayout · ProductCard · ProductGrid · SearchBar · FilterBar
│                 CategoryNav · CartBadge · QuantityStepper · EmptyState · ScrollToTop
├── hooks/        useResponsive(断点) · useSearchHistory(搜索历史)
├── pages/        Home · Category · Search · ProductDetail · Cart · NotFound
├── router/       路由表（页面级懒加载）
├── store/        cartReducer.ts(纯逻辑) · cart.tsx(Context + useReducer + 持久化)
├── styles/       variables.less · mixins.less · global.less
└── utils/        format(金额) · image(图源+降级) · search(匹配/筛选/排序) · product(规格)
```

## 数据说明

- **80 个商品 / 8 个一级分类**（数码、服饰、家居、食品、美妆、运动、图书、母婴），每类 10 件，含二级分类。
- 销量、评分、库存等字段由商品 id 哈希确定性生成，**同一 id 每次结果一致**，便于截图与复现。
- 商品图默认走 `picsum.photos` 的种子图，同一种子永远返回同一张照片，无需自备图床；
  加载失败会降级为本地生成的 SVG 占位图。想完全离线，把 `src/utils/image.ts`
  里的 `USE_REMOTE_IMAGES` 改成 `false` 即可。
- 接口层（`src/api/product.ts`）带 200-300ms 人为延迟，用来复现真实的加载态；
  接真实后端时只替换这一层，组件无需改动。

## 部署到 Vercel

仓库已包含 `vercel.json`（构建命令、输出目录、SPA 路由重写、静态资源缓存头）。

**方式一：Vercel CLI（最快）**

```bash
npm i -g vercel     # 或 npx vercel
vercel login        # 浏览器授权
vercel              # 首次会问几个问题，全部回车用默认值即可
vercel --prod       # 发布到生产环境
```

**方式二：GitHub + Vercel 面板**

```bash
git init && git add -A && git commit -m "feat: 商品选购应用"
git remote add origin <你的仓库地址>
git push -u origin main
```

然后在 [vercel.com/new](https://vercel.com/new) 导入该仓库，框架会自动识别为 Vite，
直接 Deploy 即可。`vercel.json` 已处理刷新子路由 404 的问题。

其他免费平台（Netlify / Cloudflare Pages / GitHub Pages）也可用：
Netlify 构建命令 `npm run build`、发布目录 `dist`，并同样需要 SPA 重写到 `index.html`。
