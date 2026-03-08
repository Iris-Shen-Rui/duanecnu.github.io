# 文件清单

本文档列出了 `githubfiles` 文件夹中的所有文件及其说明。

## 📁 根目录文件

### 配置文件
- `.env.example` - 环境变量模板（供用户参考）
- `.gitignore` - Git 忽略规则
- `.npmrc` - pnpm 配置
- `components.json` - shadcn/ui 组件配置
- `eslint.config.mjs` - ESLint 代码检查配置
- `next-env.d.ts` - Next.js 类型声明
- `next.config.ts` - Next.js 配置
- `package.json` - 项目依赖和脚本
- `postcss.config.mjs` - PostCSS 配置
- `tsconfig.json` - TypeScript 配置

### 文档文件
- `README.md` - 项目说明文档
- `DEPLOYMENT.md` - 部署指南
- `GITHUB_UPLOAD.md` - GitHub 上传指南

## 📂 public/ - 静态资源

- `file.svg` - 文件图标
- `globe.svg` - 地球图标
- `next.svg` - Next.js 图标
- `vercel.svg` - Vercel 图标
- `window.svg` - 窗口图标

## 📂 src/ - 源代码

### app/ - Next.js App Router

#### 页面文件
- `page.tsx` - 首页
- `layout.tsx` - 根布局
- `globals.css` - 全局样式
- `robots.ts` - SEO 配置
- `favicon.ico` - 网站图标

#### 功能页面
- `feedback/page.tsx` - 反馈建议页面
- `members/page.tsx` - 成员管理页面
- `meetings/page.tsx` - 组会报告页面
- `resources/page.tsx` - 资源汇总页面
- `summaries/page.tsx` - 学期总结页面

#### API 路由
- `api/feedback/route.ts` - 反馈建议接口
- `api/members/route.ts` - 成员管理接口
- `api/meetings/route.ts` - 会议列表接口
- `api/meetings/[id]/route.ts` - 单个会议操作接口
- `api/meetings/[id]/stats/route.ts` - 会议统计接口
- `api/meetings/submissions/route.ts` - 会议提交接口
- `api/resources/route.ts` - 资源汇总接口
- `api/summaries/route.ts` - 学期总结列表接口
- `api/summaries/[id]/route.ts` - 单个学期总结接口
- `api/upload/route.ts` - 文件上传接口

### components/ - React 组件

#### 核心组件
- `header.tsx` - 页头组件
- `sidebar.tsx` - 侧边栏组件
- `meeting-calendar.tsx` - 日历组件
- `stats-chart.tsx` - 统计图表组件
- `word-cloud.tsx` - 词云组件

#### UI 组件 (ui/)
- `accordion.tsx` - 手风琴组件
- `alert-dialog.tsx` - 警告对话框组件
- `alert.tsx` - 警告提示组件
- `aspect-ratio.tsx` - 宽高比组件
- `avatar.tsx` - 头像组件
- `badge.tsx` - 徽章组件
- `breadcrumb.tsx` - 面包屑组件
- `button-group.tsx` - 按钮组组件
- `button.tsx` - 按钮组件
- `calendar.tsx` - 日历组件
- `card.tsx` - 卡片组件
- `carousel.tsx` - 轮播组件
- `chart.tsx` - 图表组件
- `checkbox.tsx` - 复选框组件
- `collapsible.tsx` - 折叠组件
- `command.tsx` - 命令面板组件
- `context-menu.tsx` - 上下文菜单组件
- `dialog.tsx` - 对话框组件
- `drawer.tsx` - 抽屉组件
- `dropdown-menu.tsx` - 下拉菜单组件
- `empty.tsx` - 空状态组件
- `field.tsx` - 字段组件
- `form.tsx` - 表单组件
- `hover-card.tsx` - 悬停卡片组件
- `input-group.tsx` - 输入框组组件
- `input-otp.tsx` - OTP 输入框组件
- `input.tsx` - 输入框组件
- `item.tsx` - 列表项组件
- `kbd.tsx` - 快捷键组件
- `label.tsx` - 标签组件
- `menubar.tsx` - 菜单栏组件
- `navigation-menu.tsx` - 导航菜单组件
- `pagination.tsx` - 分页组件
- `popover.tsx` - 弹出层组件
- `progress.tsx` - 进度条组件
- `radio-group.tsx` - 单选框组组件
- `resizable.tsx` - 可调整大小组件
- `scroll-area.tsx` - 滚动区域组件
- `select.tsx` - 选择器组件
- `separator.tsx` - 分隔线组件
- `sheet.tsx` - 侧边面板组件
- `sidebar.tsx` - 侧边栏组件
- `skeleton.tsx` - 骨架屏组件
- `slider.tsx` - 滑块组件
- `sonner.tsx` - Toast 通知组件
- `spinner.tsx` - 加载指示器组件
- `switch.tsx` - 开关组件
- `table.tsx` - 表格组件
- `tabs.tsx` - 标签页组件
- `textarea.tsx` - 文本域组件
- `toggle-group.tsx` - 开关组组件
- `toggle.tsx` - 开关组件
- `tooltip.tsx` - 工具提示组件

### hooks/ - React Hooks

- `use-mobile.ts` - 移动端检测 Hook

### lib/ - 工具函数

- `utils.ts` - 通用工具函数（cn 函数等）

### storage/ - 数据存储

#### 数据库管理
- `database/index.ts` - 数据库管理器导出
- `database/feedbackManager.ts` - 反馈管理器
- `database/meetingManager.ts` - 会议管理器
- `database/meetingSubmissionManager.ts` - 会议提交管理器
- `database/memberManager.ts` - 成员管理器
- `database/semesterSummaryManager.ts` - 学期总结管理器

#### 共享数据库文件
- `database/shared/relations.ts` - 关系定义
- `database/shared/schema.ts` - 数据库模式

#### 存储导出
- `index.ts` - 存储导出

## 📊 文件统计

### 按类型分类
- TypeScript 文件 (.ts): 43
- TypeScript JSX 文件 (.tsx): 44
- CSS 文件 (.css): 1
- 配置文件 (.json, .mjs, .ts): 7
- 文档文件 (.md): 3
- 其他文件 (.env.example, .gitignore, .npmrc): 3
- SVG 图标: 5

### 按目录分类
- `src/app/`: 19 个文件
- `src/components/ui/`: 58 个组件
- `src/components/`: 5 个核心组件
- `src/storage/database/`: 8 个文件
- `src/hooks/`: 1 个文件
- `src/lib/`: 1 个文件
- `public/`: 5 个文件
- 根目录: 15 个文件

### 总计
- **总文件数**: 107
- **总目录数**: 27

## ✅ 上传前检查清单

- [ ] 所有文件已复制到 `githubfiles` 文件夹
- [ ] `.env.local` 文件未包含在提交中
- [ ] 敏感信息已移除
- [ ] README.md 已更新
- [ ] 项目结构清晰规范
- [ ] 所有配置文件完整

## 🚀 快速开始

上传后，按照以下步骤开始使用：

1. 克隆仓库到本地
2. 复制 `.env.example` 为 `.env.local`
3. 填写环境变量
4. 运行 `pnpm install`
5. 运行 `pnpm dev`

---

**最后更新时间**: 2026-03-08
