# 华东师范大学"段门"课题组内部管理系统

一个基于 Next.js 16、React 19、TypeScript 和 shadcn/ui 的课题组内部管理系统，用于管理组会报告、学期总结、资源汇总及成员信息。

## 📁 项目结构

```
githubfiles/
├── public/                      # 静态资源
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── src/                         # 源代码目录
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API 路由
│   │   │   ├── feedback/        # 反馈建议接口
│   │   │   ├── members/         # 成员管理接口
│   │   │   ├── meetings/        # 组会报告接口
│   │   │   │   ├── [id]/        # 单个会议操作
│   │   │   │   └── submissions/ # 会议提交记录
│   │   │   ├── resources/       # 资源汇总接口
│   │   │   ├── summaries/       # 学期总结接口
│   │   │   └── upload/          # 文件上传接口
│   │   ├── feedback/            # 反馈建议页面
│   │   ├── members/             # 成员管理页面
│   │   ├── meetings/            # 组会报告页面
│   │   ├── resources/           # 资源汇总页面
│   │   ├── summaries/           # 学期总结页面
│   │   ├── favicon.ico          # 网站图标
│   │   ├── globals.css          # 全局样式
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # 首页
│   │   └── robots.ts            # SEO 配置
│   │
│   ├── components/              # React 组件
│   │   ├── ui/                  # shadcn/ui 组件库
│   │   ├── header.tsx           # 页头组件
│   │   ├── meeting-calendar.tsx # 日历组件
│   │   ├── sidebar.tsx          # 侧边栏组件
│   │   ├── stats-chart.tsx      # 统计图表组件
│   │   └── word-cloud.tsx       # 词云组件
│   │
│   ├── hooks/                   # React Hooks
│   │   └── use-mobile.ts        # 移动端检测
│   │
│   ├── lib/                     # 工具函数
│   │   └── utils.ts             # 通用工具函数
│   │
│   └── storage/                 # 数据库和存储
│       ├── database/            # 数据库管理
│       │   ├── shared/          # 共享数据库文件
│       │   │   ├── relations.ts # 关系定义
│       │   │   └── schema.ts    # 数据库模式
│       │   ├── feedbackManager.ts       # 反馈管理器
│       │   ├── meetingManager.ts        # 会议管理器
│       │   ├── meetingSubmissionManager.ts # 提交管理器
│       │   ├── memberManager.ts         # 成员管理器
│       │   ├── semesterSummaryManager.ts # 学期总结管理器
│       │   └── index.ts                 # 导出所有管理器
│       └── index.ts             # 存储导出
│
├── components.json              # shadcn/ui 配置
├── eslint.config.mjs            # ESLint 配置
├── next.config.ts               # Next.js 配置
├── next-env.d.ts                # Next.js 类型声明
├── package.json                 # 项目依赖
├── postcss.config.mjs           # PostCSS 配置
├── tsconfig.json                # TypeScript 配置
└── README.md                    # 项目说明
```

## 🚀 功能模块

### 1. 组会报告
- 创建、编辑、删除会议
- 提交汇报材料（PPT/PDF）
- 标签管理和分类
- 日历查看历史记录
- 提交状态跟踪
- 老师点评功能

### 2. 学期总结
- 多类目提交（论文发表、投稿、公众号文章等）
- 印象深刻的文献记录
- 新理论构念总结
- 学期进度统计

### 3. 成员管理
- 成员信息管理
- 身份分类（教授、博士生、硕士生等）
- 院校信息管理

### 4. 资源汇总
- 文献资源收集
- 理论构念库
- 词云可视化
- 统计图表展示

### 5. 反馈建议
- 成员意见收集
- 问题反馈机制

## 🛠️ 技术栈

### 前端框架
- **Next.js 16** - React 框架（App Router）
- **React 19** - UI 库
- **TypeScript 5** - 类型安全
- **Tailwind CSS 4** - 样式框架

### UI 组件
- **shadcn/ui** - 基于 Radix UI 的组件库
- **Lucide React** - 图标库
- **Recharts** - 图表库
- **React Wordcloud** - 词云组件

### 后端与数据
- **Drizzle ORM** - 数据库 ORM
- **PostgreSQL** - 关系型数据库
- **S3 对象存储** - 文件存储

### 开发工具
- **ESLint** - 代码检查
- **PostCSS** - CSS 处理
- **pnpm** - 包管理器

## 📦 安装依赖

```bash
pnpm install
```

## 🏃 运行项目

### 开发环境
```bash
pnpm dev
```

访问 http://localhost:5000

### 构建生产版本
```bash
pnpm build
```

### 启动生产环境
```bash
pnpm start
```

## 🔑 环境变量

需要在项目根目录创建 `.env.local` 文件：

```env
# 数据库配置
DATABASE_URL=postgresql://user:password@host:port/database

# S3 对象存储配置
COZE_BUCKET_ENDPOINT_URL=your_s3_endpoint
COZE_BUCKET_NAME=your_bucket_name
COZE_BUCKET_ACCESS_KEY=your_access_key
COZE_BUCKET_SECRET_KEY=your_secret_key

# 认证密钥
AUTH_SECRET=your_auth_secret
```

## 📝 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 Airbnb 风格指南（部分）
- 使用 ESLint 进行代码检查

### 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链更新
```

## 📄 License

MIT

## 👥 联系方式

华东师范大学"段门"课题组

---

**注意：** 上传到 GitHub 时，请确保 `.env.local` 文件已添加到 `.gitignore`，不要泄露敏感信息！
