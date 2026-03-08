# GitHub 上传指南

本指南详细说明如何将项目上传到 GitHub。

## 📋 上传前检查清单

- [ ] 所有代码文件已复制到 `githubfiles` 文件夹
- [ ] `.env.local` 文件已添加到 `.gitignore`（不要上传）
- [ ] 敏感信息已移除（密钥、密码、token等）
- [ ] README.md 已更新
- [ ] 项目结构清晰规范

## 🚀 上传步骤

### 方法一：使用 GitHub CLI（推荐）

1. **安装 GitHub CLI**
   ```bash
   # macOS
   brew install gh
   
   # Windows
   winget install --id GitHub.cli
   
   # Linux
   sudo apt install gh
   ```

2. **登录 GitHub**
   ```bash
   gh auth login
   ```

3. **创建仓库并推送**
   ```bash
   cd githubfiles
   gh repo create group-management-system --public --source=. --remote=origin --push
   ```

### 方法二：使用 Git 命令

1. **初始化 Git 仓库**
   ```bash
   cd githubfiles
   git init
   ```

2. **添加所有文件**
   ```bash
   git add .
   ```

3. **创建初始提交**
   ```bash
   git commit -m "feat: 初始化课题组管理系统项目"
   ```

4. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - 创建新仓库（名称：`group-management-system`）
   - 不要初始化 README、.gitignore 或 LICENSE

5. **关联远程仓库**
   ```bash
   git remote add origin https://github.com/your-username/group-management-system.git
   ```

6. **推送到 GitHub**
   ```bash
   git branch -M main
   git push -u origin main
   ```

### 方法三：使用 GitHub Desktop

1. **下载并安装 GitHub Desktop**
   - 访问 https://desktop.github.com/
   - 下载并安装

2. **创建新仓库**
   - 打开 GitHub Desktop
   - 点击 "File" → "Add local repository"
   - 选择 `githubfiles` 文件夹

3. **发布到 GitHub**
   - 点击 "Publish repository"
   - 填写仓库名称和描述
   - 选择公开或私有
   - 点击 "Publish"

## ⚠️ 重要注意事项

### 1. 环境变量安全

**❌ 不要上传的文件：**
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`

**✅ 应该上传的文件：**
- `.env.example`（作为模板）

### 2. 敏感信息检查

在上传前，确保以下内容已移除：

- 数据库密码
- API 密钥
- S3 访问密钥
- 第三方服务的 token
- 个人邮箱、手机号等隐私信息

可以使用以下命令检查：

```bash
# 搜索可能的敏感信息
grep -r "password\|secret\|key\|token" --exclude-dir=node_modules src/
```

### 3. 忽略不必要的文件

`.gitignore` 已配置为忽略以下内容：

- `node_modules/` - 依赖包
- `.next/` - Next.js 构建输出
- `.env*` - 环境变量文件
- `*.log` - 日志文件
- `coverage/` - 测试覆盖率报告
- `.DS_Store` - macOS 系统文件

## 📝 提交信息规范

使用以下格式编写提交信息：

```
<type>: <subject>

<body>

<footer>
```

### Type（类型）

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具链更新

### 示例

```bash
git commit -m "feat: 添加组会报告的删除和编辑功能

- 新增 DELETE API 接口用于删除会议
- 新增 PUT API 接口用于编辑会议信息
- 前端添加编辑和删除按钮
- 创建删除确认对话框，防止误删
- 创建编辑会议对话框

Closes #123"
```

## 🌐 仓库配置

### 1. 设置仓库描述

在 GitHub 仓库页面设置描述：

```
华东师范大学"段门"课题组内部管理系统 - 基于 Next.js 16、React 19、TypeScript 和 shadcn/ui
```

### 2. 添加 Topics

添加以下标签：
- `nextjs`
- `react`
- `typescript`
- `tailwindcss`
- `shadcn-ui`
- `postgreSQL`
- `drizzle-orm`
- `education`

### 3. 设置 License

选择 `MIT License`

### 4. 启用 GitHub Pages（可选）

如果需要部署静态文档，可以启用 GitHub Pages。

## 🔐 仓库权限管理

### 添加协作者

1. 进入仓库 Settings
2. 点击 "Collaborators and teams"
3. 点击 "Add people"
4. 输入协作者的 GitHub 用户名

### 设置分支保护

1. 进入 Settings → Branches
2. 点击 "Add rule"
3. 选择 `main` 分支
4. 启用：
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging

## 📊 使用 GitHub Actions（可选）

### 创建自动部署工作流

在 `.github/workflows/deploy.yml` 中：

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '24'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Build
      run: pnpm build
    
    - name: Deploy
      run: |
        # 添加你的部署命令
        echo "Deploying to production..."
```

## 📞 获取帮助

如果遇到问题：

1. 查看 GitHub 官方文档：https://docs.github.com/
2. 搜索相关问题：https://github.com/search
3. 联系技术团队

---

**祝上传顺利！🎉**
