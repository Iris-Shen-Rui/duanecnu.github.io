# 部署指南

本文档介绍如何将项目部署到生产环境。

## 📋 部署前准备

### 1. 环境检查
- Node.js >= 24
- pnpm >= 8
- PostgreSQL 数据库
- S3 兼容对象存储服务

### 2. 环境变量配置
复制 `.env.example` 为 `.env.local` 并填写实际值：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入实际配置。

## 🚀 部署步骤

### 1. 安装依赖
```bash
pnpm install
```

### 2. 构建项目
```bash
pnpm build
```

### 3. 启动服务
```bash
pnpm start
```

服务将运行在 `http://localhost:5000`

## 🌐 部署平台

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm@latest
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 5000

ENV PORT 5000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

构建并运行：

```bash
docker build -t group-management-system .
docker run -p 5000:5000 --env-file .env.local group-management-system
```

## 🗄️ 数据库迁移

如果使用 Prisma 或其他 ORM 工具，需要运行数据库迁移：

```bash
# 生成迁移文件
pnpm prisma migrate dev

# 或直接执行 SQL 脚本
psql -h localhost -U username -d database_name < schema.sql
```

## 🔐 安全建议

1. **环境变量安全**
   - 不要将 `.env.local` 提交到版本控制
   - 使用强密码和密钥
   - 定期轮换密钥

2. **数据库安全**
   - 使用强密码
   - 限制数据库访问 IP
   - 定期备份数据

3. **API 安全**
   - 实现速率限制
   - 使用 HTTPS
   - 验证所有输入

## 📊 监控和日志

### 日志配置
日志文件位于 `/app/work/logs/bypass/`：

- `app.log` - 主日志
- `dev.log` - 开发日志
- `console.log` - 控制台日志

### 监控建议
- 使用 APM 工具（如 New Relic、Datadog）
- 设置错误告警
- 监控性能指标

## 🔄 更新部署

1. 拉取最新代码
```bash
git pull origin main
```

2. 安装依赖（如有更新）
```bash
pnpm install
```

3. 构建项目
```bash
pnpm build
```

4. 重启服务
```bash
pnpm start
```

## 🐛 故障排查

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用 5000 端口的进程
   lsof -i :5000
   # 或
   ss -tuln | grep 5000
   
   # 终止进程
   kill -9 <PID>
   ```

2. **数据库连接失败**
   - 检查 `DATABASE_URL` 是否正确
   - 确认数据库服务是否运行
   - 检查防火墙设置

3. **S3 上传失败**
   - 检查 S3 凭证是否正确
   - 确认 bucket 是否存在
   - 检查权限设置

## 📞 技术支持

如有问题，请联系技术团队或查看项目文档。
