# 段门课题组内部管理系统

华东师范大学段门课题组内部管理系统，用于管理组会报告、学期总结、资源汇总及成员信息。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![Flask](https://img.shields.io/badge/flask-3.0+-red.svg)

## 📋 项目简介

本系统是一个轻量级的课题组内部管理系统，主要功能包括：

- **组会报告管理**：创建组会、提交PPT/PDF材料、查看历史记录
- **学期总结**：论文发表、投稿、公众号文章、文献阅读、理论构念记录
- **成员管理**：成员信息管理、身份分类、研究方向记录
- **资源汇总**：文献资源、工具代码、理论构念库
- **反馈建议**：意见收集、问题反馈

## 🛠️ 技术栈

### 前端
- **HTML5 + CSS3** - 语义化标签、响应式设计
- **JavaScript (ES6+)** - 原生JS，无框架依赖
- **CSS Grid & Flexbox** - 现代布局方案

### 后端
- **Python 3.11+**
- **Flask 3.0** - 轻量级Web框架
- **SQLAlchemy** - ORM框架

### 存储
- **SQLite** - 轻量级数据库（默认）
- **PostgreSQL** - 生产环境数据库（可选）
- **阿里云OSS** - 对象存储服务

### 部署
- **方案A**：轻量应用服务器 + Nginx
- **方案B**：阿里云函数计算 + OSS

## 📁 项目结构

```
duanmen-website/
├── frontend/                # 前端静态文件
│   ├── index.html          # 主页面
│   ├── css/
│   │   ├── style.css       # 主样式
│   │   └── responsive.css  # 响应式样式
│   └── js/
│       ├── utils.js        # 工具函数
│       ├── api.js          # API封装
│       ├── app.js          # 主应用逻辑
│       └── pages/          # 各页面逻辑
│           ├── meetings.js
│           ├── summaries.js
│           ├── members.js
│           ├── resources.js
│           └── feedback.js
│
├── backend/                 # Flask后端
│   ├── app.py              # 主应用
│   ├── config.py           # 配置文件
│   ├── models.py           # 数据模型
│   └── requirements.txt    # Python依赖
│
├── docs/                    # 文档
│   └── DEPLOYMENT_GUIDE.md # 部署指南
│
└── README.md               # 项目说明
```

## 🚀 快速开始

### 方式一：本地开发

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/duanmen-website.git
cd duanmen-website
```

#### 2. 后端设置

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
cd backend
pip install -r requirements.txt

# 运行应用
python app.py
```

后端将在 `http://localhost:5000` 运行

#### 3. 前端访问

直接用浏览器打开 `frontend/index.html`，或使用任意静态服务器：

```bash
# 使用Python内置服务器
cd frontend
python -m http.server 8080
```

前端将在 `http://localhost:8080` 运行

### 方式二：生产部署

详细部署步骤请参考 [部署指南](docs/DEPLOYMENT_GUIDE.md)

## ⚙️ 环境变量配置

创建 `.env` 文件（后端目录）：

```env
# Flask配置
FLASK_ENV=production
SECRET_KEY=your-secret-key-here

# 数据库配置
DATABASE_URL=sqlite:///duanmen.db
# 或使用PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/duanmen

# OSS配置（可选）
COZE_BUCKET_ENDPOINT_URL=https://oss-cn-shanghai.aliyuncs.com
COZE_BUCKET_NAME=your-bucket-name
OSS_REGION=cn-shanghai

# CORS配置
CORS_ORIGINS=https://duanecnu.site
```

## 📡 API接口文档

### 会议相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/meetings` | 获取会议列表 |
| POST | `/api/meetings` | 创建会议 |
| GET | `/api/meetings/:id` | 获取会议详情 |
| PUT | `/api/meetings/:id` | 更新会议 |
| DELETE | `/api/meetings/:id` | 删除会议 |
| POST | `/api/meetings/submissions` | 提交会议材料 |

### 成员相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/members` | 获取成员列表 |
| POST | `/api/members` | 创建成员 |
| GET | `/api/members/:id` | 获取成员详情 |
| PUT | `/api/members/:id` | 更新成员 |
| DELETE | `/api/members/:id` | 删除成员 |

### 资源相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/resources` | 获取资源列表 |
| POST | `/api/resources` | 上传资源 |
| GET | `/api/resources/:id` | 获取资源详情 |
| GET | `/api/resources/:id/download` | 下载资源 |
| DELETE | `/api/resources/:id` | 删除资源 |

### 其他接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stats/dashboard` | 获取首页统计 |
| GET | `/api/stats/recent-activity` | 获取最近动态 |
| POST | `/api/feedback` | 提交反馈 |

## 🎨 功能特性

### ✅ 已实现功能

- [x] 响应式设计，支持移动端
- [x] 组会报告管理
- [x] 学期总结记录
- [x] 成员信息管理
- [x] 资源文件上传
- [x] 反馈建议收集
- [x] 统计数据展示

### 🔮 未来计划

- [ ] 用户认证与权限管理
- [ ] 邮件通知功能
- [ ] 数据导出功能
- [ ] 文件预览功能
- [ ] 日历视图优化
- [ ] 数据可视化增强

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📝 开发规范

### 代码风格
- Python遵循PEP 8规范
- JavaScript使用ES6+语法
- CSS使用BEM命名规范

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链更新
```

## 📄 许可证

本项目采用MIT许可证 - 详见 [LICENSE](LICENSE) 文件

## 👥 联系方式

- 项目维护：段门课题组
- 技术支持：duan@ecnu.edu.cn
- 项目地址：https://github.com/your-username/duanmen-website

## 🙏 致谢

感谢所有为本项目做出贡献的成员！

---

**华东师范大学 段门课题组 © 2026**
