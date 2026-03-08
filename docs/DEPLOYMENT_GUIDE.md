# 段门课题组内部管理系统 - 部署指南

本文档提供两种部署方案，请根据实际需求选择：

- **方案A：轻量应用服务器部署**（推荐，适合中小型团队）
- **方案B：阿里云函数计算 + OSS**（适合访问量波动大的场景）

---

## 📋 方案对比

| 特性 | 方案A：轻量服务器 | 方案B：函数计算 |
|------|------------------|----------------|
| 部署难度 | ⭐⭐ 简单 | ⭐⭐⭐ 中等 |
| 成本 | 固定（已购买服务器） | 按需付费 |
| 扩展性 | 需手动升级配置 | 自动扩展 |
| 适用场景 | 访问量稳定 | 访问量波动大 |
| 数据库 | SQLite/PostgreSQL | PostgreSQL (RDS) |
| 文件存储 | 本地/OSS | OSS |

---

## 🚀 方案A：轻量应用服务器部署

### 一、服务器信息

- **公网IP**: 106.14.248.251
- **区域**: 华东2（上海）
- **配置**: 2vCPU / 2GiB / 40GiB
- **到期时间**: 2027年3月9日

### 二、环境准备

#### 1. SSH连接服务器

```bash
# Windows用户可使用PuTTY或PowerShell
ssh root@106.14.248.251
```

#### 2. 安装Python 3.11+

```bash
# 更新软件包
sudo yum update -y

# 安装Python 3.11
sudo yum install -y python3.11 python3.11-pip python3.11-devel

# 创建虚拟环境
python3.11 -m venv /opt/duanmen/venv
source /opt/duanmen/venv/bin/activate
```

#### 3. 安装Nginx

```bash
sudo yum install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### 4. 安装Supervisor（进程管理）

```bash
sudo pip3.11 install supervisor
sudo mkdir -p /etc/supervisor/conf.d
```

### 三、部署应用

#### 1. 上传代码

```bash
# 创建应用目录
sudo mkdir -p /opt/duanmen
cd /opt/duanmen

# 使用Git克隆（推荐）
git clone https://github.com/your-username/duanmen-website.git .

# 或使用SCP上传（本地执行）
scp -r duanmen-website root@106.14.248.251:/opt/duanmen/
```

#### 2. 安装依赖

```bash
cd /opt/duanmen/backend
source /opt/duanmen/venv/bin/activate
pip install -r requirements.txt
```

#### 3. 配置环境变量

```bash
# 创建环境变量文件
sudo nano /opt/duanmen/.env
```

添加以下内容：

```env
# Flask配置
FLASK_ENV=production
SECRET_KEY=your-secret-key-here-change-this

# 数据库配置（使用SQLite）
DATABASE_URL=sqlite:////opt/duanmen/data/duanmen.db

# OSS配置（可选，如果使用OSS）
COZE_BUCKET_ENDPOINT_URL=https://oss-cn-shanghai.aliyuncs.com
COZE_BUCKET_NAME=your-bucket-name
COZE_BUCKET_ACCESS_KEY=your-access-key
COZE_BUCKET_SECRET_KEY=your-secret-key
OSS_REGION=cn-shanghai

# CORS配置
CORS_ORIGINS=https://duanecnu.site,http://106.14.248.251
```

#### 4. 初始化数据库

```bash
cd /opt/duanmen/backend
source /opt/duanmen/venv/bin/activate
export $(cat /opt/duanmen/.env | xargs)

# 创建数据目录
mkdir -p /opt/duanmen/data

# 初始化数据库
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

#### 5. 配置Supervisor

```bash
sudo nano /etc/supervisor/conf.d/duanmen.conf
```

添加以下内容：

```ini
[program:duanmen]
directory=/opt/duanmen/backend
command=/opt/duanmen/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
user=root
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/duanmen/access.log
stderr_logfile=/var/log/duanmen/error.log
environment=PATH="/opt/duanmen/venv/bin"
```

启动服务：

```bash
# 创建日志目录
sudo mkdir -p /var/log/duanmen

# 启动Supervisor
sudo supervisord -c /etc/supervisor/supervisord.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start duanmen
```

### 四、配置Nginx

#### 1. 创建Nginx配置

```bash
sudo nano /etc/nginx/conf.d/duanmen.conf
```

添加以下内容：

```nginx
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name duanecnu.site www.duanecnu.site;
    
    # 临时注释，配置SSL后再启用
    # return 301 https://$server_name$request_uri;
    
    # 临时使用HTTP（配置SSL前）
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 文件上传大小限制
        client_max_body_size 50M;
    }
    
    # 静态文件缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:5000;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}

# HTTPS配置（配置SSL后启用）
# server {
#     listen 443 ssl http2;
#     server_name duanecnu.site www.duanecnu.site;
#     
#     ssl_certificate /etc/nginx/ssl/duanecnu.site.pem;
#     ssl_certificate_key /etc/nginx/ssl/duanecnu.site.key;
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     
#     location / {
#         proxy_pass http://127.0.0.1:5000;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         
#         client_max_body_size 50M;
#     }
# }
```

#### 2. 重启Nginx

```bash
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

### 五、域名配置

#### 1. 阿里云域名解析

登录阿里云域名控制台，添加解析记录：

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| A | @ | 106.14.248.251 |
| A | www | 106.14.248.251 |

#### 2. 配置SSL证书（可选但推荐）

```bash
# 安装Certbot
sudo yum install -y certbot python3-certbot-nginx

# 自动配置SSL证书
sudo certbot --nginx -d duanecnu.site -d www.duanecnu.site

# 自动续期
sudo systemctl enable certbot-renew.timer
```

### 六、防火墙配置

```bash
# 开放HTTP和HTTPS端口
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# 或使用iptables
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo service iptables save
```

### 七、维护命令

```bash
# 查看应用状态
sudo supervisorctl status duanmen

# 重启应用
sudo supervisorctl restart duanmen

# 查看日志
tail -f /var/log/duanmen/access.log
tail -f /var/log/duanmen/error.log

# 更新代码
cd /opt/duanmen
git pull
sudo supervisorctl restart duanmen
```

---

## ☁️ 方案B：阿里云函数计算 + OSS部署

### 一、创建OSS存储桶

1. 登录阿里云OSS控制台
2. 创建存储桶：
   - Bucket名称：`duanmen-files`
   - 区域：华东2（上海）
   - 存储类型：标准存储
   - 读写权限：私有

3. 获取访问密钥：
   - 创建AccessKey
   - 记录AccessKey ID和Secret

### 二、配置函数计算

#### 1. 安装Funcraft工具

```bash
npm install -g @alicloud/fun
fun config
```

#### 2. 创建函数配置文件

创建 `template.yml`：

```yaml
ROSTemplateFormatVersion: '2015-09-01'
Transform: 'Aliyun::Serverless-2018-04-03'
Resources:
  duanmen-api:
    Type: 'Aliyun::Serverless::Service'
    Properties:
      Description: 段门课题组API服务
      Policies:
        - AliyunOSSFullAccess
      EnvironmentVariables:
        FLASK_ENV: production
        SECRET_KEY: your-secret-key
        DATABASE_URL: postgresql://user:pass@host:5432/duanmen
        COZE_BUCKET_ENDPOINT_URL: https://oss-cn-shanghai.aliyuncs.com
        COZE_BUCKET_NAME: duanmen-files
        OSS_REGION: cn-shanghai

    duanmen-function:
      Type: 'Aliyun::Serverless::Function'
      Properties:
        Handler: index.handler
        Runtime: python3.9
        CodeUri: ./backend
        MemorySize: 512
        Timeout: 60
        EnvironmentVariables:
          FLASK_ENV: production

      HTTPTrigger:
        Type: HTTP
        Properties:
          AuthType: ANONYMOUS
          Methods:
            - GET
            - POST
            - PUT
            - DELETE
            - OPTIONS
```

#### 3. 创建函数入口文件

创建 `backend/index.py`：

```python
from app import app

def handler(environ, start_response):
    """函数计算入口"""
    return app(environ, start_response)
```

#### 4. 部署函数

```bash
fun deploy
```

### 三、配置域名

1. 在函数计算控制台添加自定义域名
2. 绑定域名：`api.duanecnu.site`
3. 配置路由：`/*` -> `duanmen-api/duanmen-function`

### 四、前端部署到OSS

1. 将前端文件上传到OSS存储桶
2. 配置静态网站托管
3. 绑定域名：`duanecnu.site`
4. 配置CDN加速（可选）

---

## 🔒 安全建议

1. **定期备份数据库**
   ```bash
   # SQLite备份
   cp /opt/duanmen/data/duanmen.db /opt/duanmen/backups/duanmen_$(date +%Y%m%d).db
   ```

2. **定期更新系统**
   ```bash
   sudo yum update -y
   ```

3. **监控日志**
   ```bash
   tail -f /var/log/duanmen/error.log
   ```

4. **限制SSH访问**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # PermitRootLogin no
   # PasswordAuthentication no
   ```

---

## 🆘 故障排查

### 问题1：无法访问网站

```bash
# 检查Nginx状态
sudo systemctl status nginx

# 检查应用状态
sudo supervisorctl status duanmen

# 检查端口监听
netstat -tlnp | grep :80
```

### 问题2：数据库错误

```bash
# 检查数据库文件权限
ls -la /opt/duanmen/data/

# 修复权限
chmod 644 /opt/duanmen/data/duanmen.db
```

### 问题3：文件上传失败

```bash
# 检查上传目录权限
ls -la /opt/duanmen/backend/uploads/

# 创建目录并设置权限
mkdir -p /opt/duanmen/backend/uploads
chmod 755 /opt/duanmen/backend/uploads
```

---

## 📞 技术支持

如有问题，请联系：
- 邮箱：duan@ecnu.edu.cn
- 项目地址：https://github.com/your-username/duanmen-website
