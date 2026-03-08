# Netlify 部署问题解决方案

## 🔍 问题原因

你的 Netlify 部署失败是因为：

1. **缺少 scripts 目录**：package.json 中的 build 脚本引用了 `bash ./scripts/build.sh`，但这个目录没有被复制到 GitHub
2. **缺少 Netlify 配置文件**：没有 `netlify.toml` 配置文件告诉 Netlify 如何构建项目
3. **构建命令不兼容**：Netlify 对 bash 脚本的支持有限

## ✅ 解决方案

### 步骤 1：上传缺失的文件到 GitHub

我已经为你准备好了以下文件，请将它们上传到 GitHub 仓库的根目录：

1. **scripts/** 目录（整个文件夹）
   - 包含：build.sh、dev.sh、prepare.sh、start.sh

2. **netlify.toml** 文件
   - Netlify 配置文件

### 方法一：通过 GitHub 网页上传（推荐）

1. 访问你的 GitHub 仓库：https://github.com/Iris-Shen-Rui/duanecnu.github.io

2. 点击 "Add file" → "Upload files"

3. **上传 scripts 目录**：
   - 先创建 `scripts` 文件夹
   - 然后依次上传以下文件到 scripts 文件夹：
     - `build.sh`
     - `dev.sh`
     - `prepare.sh`
     - `start.sh`
   
   这些文件的内容如下：

**build.sh**
```bash
#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

echo "Building the project..."
npx next build

echo "Build completed successfully!"
```

**dev.sh**
```bash
#!/bin/bash
set -Eeuo pipefail

PORT=5000
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
NODE_ENV=development
DEPLOY_RUN_PORT=5000

cd "${COZE_WORKSPACE_PATH}"

kill_port_if_listening() {
    local pids
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -z "${pids}" ]]; then
      echo "Port ${DEPLOY_RUN_PORT} is free."
      return
    fi
    echo "Port ${DEPLOY_RUN_PORT} in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs -I {} kill -9 {}
    sleep 1
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -n "${pids}" ]]; then
      echo "Warning: port ${DEPLOY_RUN_PORT} still busy after SIGKILL, PIDs: ${pids}"
    else
      echo "Port ${DEPLOY_RUN_PORT} cleared."
    fi
}

echo "Clearing port ${PORT} before start."
kill_port_if_listening
echo "Starting HTTP service on port ${PORT} for dev..."

npx next dev --webpack --port $PORT
```

**prepare.sh**
```bash
#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Preparing environment..."

# 任何环境准备逻辑
```

**start.sh**
```bash
#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"

start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
    npx next start --port ${DEPLOY_RUN_PORT}
}

echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
```

4. **上传 netlify.toml 文件**：
   
   在根目录创建 `netlify.toml` 文件，内容如下：

```toml
[build]
  command = "pnpm install && pnpm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Content-Security-Policy = "default-src 'self' https:; img-src 'self' https: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"

[dev]
  command = "pnpm run dev"
  targetPort = 5000
  port = 5000
```

### 方法二：使用 Git 命令（如果你有本地环境）

```bash
# 进入你的项目目录
cd /path/to/your/project

# 复制 scripts 目录
cp -r /path/to/githubfiles/scripts .

# 复制 netlify.toml
cp /path/to/githubfiles/netlify.toml .

# 提交并推送
git add .
git commit -m "fix: 添加 Netlify 部署所需的 scripts 目录和配置文件"
git push origin main
```

### 步骤 2：配置 Netlify

1. 访问 Netlify 控制台：https://app.netlify.com/

2. 选择你的项目 `duanecnu.site`

3. 点击 "Site configuration" 或 "Site settings"

4. 找到 "Build & deploy" 部分

5. 配置以下内容：
   - **Build command**: `pnpm run build`
   - **Publish directory**: `.next`
   - **Base directory**: 留空（如果你的代码在根目录）

6. 添加环境变量（Environment variables）：
   ```
   DATABASE_URL = your_database_url
   COZE_BUCKET_ENDPOINT_URL = your_s3_endpoint
   COZE_BUCKET_NAME = your_bucket_name
   COZE_BUCKET_ACCESS_KEY = your_access_key
   COZE_BUCKET_SECRET_KEY = your_secret_key
   AUTH_SECRET = your_auth_secret
   ```

### 步骤 3：触发重新部署

上传文件后，Netlify 会自动检测到更改并触发新的部署。

或者你也可以手动触发：
1. 在 Netlify 控制台点击 "Deploys"
2. 点击 "Trigger deploy" → "Deploy site"
3. 选择 "main" 分支
4. 点击 "Trigger deploy"

### 步骤 4：监控构建过程

1. 点击最新的部署记录
2. 查看构建日志（Build log）
3. 确保所有步骤都成功：
   - ✅ Installing dependencies
   - ✅ Building the project
   - ✅ Build completed successfully

## 🔧 如果仍然失败，尝试以下备选方案

### 备选方案 1：修改 package.json

如果 bash 脚本仍然有问题，可以修改 `package.json` 中的 scripts：

```json
{
  "scripts": {
    "build": "npx next build",
    "dev": "npx next dev",
    "start": "npx next start",
    "lint": "next lint"
  }
}
```

### 备选方案 2：使用 Netlify Functions

如果你的项目需要 API 路由，可以考虑使用 Netlify Functions：

1. 创建 `netlify.toml` 配置：
```toml
[build]
  command = "pnpm run build"
  publish = ".next"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

2. 将 API 路由转换为 Netlify Functions

## 📊 验证部署成功

部署成功后，你应该能看到：

1. ✅ Netlify 部署状态显示 "Published"
2. ✅ 访问 `https://duanecnu.site` 能看到实际网站，而不是 README
3. ✅ 控制台没有错误

## 🆘 常见问题

### Q1: 构建时提示 "pnpm command not found"
**解决**: 在 Netlify 环境变量中添加：
```
PNPM_VERSION = 9.0.0
```

### Q2: 构建时提示 "Module not found"
**解决**: 检查 `package.json` 中的依赖是否完整，确保运行了 `pnpm install`

### Q3: 部署成功但访问显示 404
**解决**: 检查 Publish directory 是否设置为 `.next`

### Q4: API 路由无法访问
**解决**: Next.js 的 API 路由需要服务器环境，Netlify 的静态部署不支持。需要使用 Netlify Functions 或改为纯前端实现。

## 💡 重要提醒

1. **环境变量必须配置**：数据库连接等敏感信息必须通过环境变量配置
2. **API 路由可能不工作**：如果使用静态部署，API 路由无法在 Netlify 上运行
3. **考虑使用 Vercel**：如果你的项目依赖 Next.js 的服务器功能，建议使用 Vercel

## 📞 需要帮助？

如果按照以上步骤仍然无法解决问题，请：

1. 查看 Netlify 构建日志，找到具体的错误信息
2. 确认所有文件都已正确上传
3. 检查环境变量是否完整

将错误信息发给我，我可以帮你进一步诊断！
