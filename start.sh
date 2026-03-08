#!/bin/bash

# 段门课题组管理系统 - 启动脚本

echo "======================================"
echo "  段门课题组管理系统 - 启动脚本"
echo "======================================"
echo ""

# 检查Python版本
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python版本: $PYTHON_VERSION"

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "检查并安装依赖..."
pip install -q -r backend/requirements.txt

# 检查环境变量文件
if [ ! -f "backend/.env" ]; then
    echo "⚠️  未找到.env文件，使用默认配置"
    echo "   建议复制.env.example为.env并根据实际情况修改"
fi

# 创建必要目录
mkdir -p backend/uploads
mkdir -p backend/data

# 初始化数据库
echo "初始化数据库..."
cd backend
python -c "from app import app, db; app.app_context().push(); db.create_all()" 2>/dev/null
cd ..

echo ""
echo "✓ 环境准备完成"
echo ""
echo "启动选项："
echo "  1. 启动后端服务（开发模式）"
echo "  2. 启动前端服务（静态文件）"
echo "  3. 同时启动前后端"
echo ""
read -p "请选择 (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "启动后端服务..."
        echo "访问地址: http://localhost:5000"
        echo ""
        cd backend && python app.py
        ;;
    2)
        echo ""
        echo "启动前端服务..."
        echo "访问地址: http://localhost:8080"
        echo ""
        cd frontend && python -m http.server 8080
        ;;
    3)
        echo ""
        echo "同时启动前后端..."
        echo "后端地址: http://localhost:5000"
        echo "前端地址: http://localhost:8080"
        echo ""
        # 后台启动后端
        cd backend && python app.py &
        BACKEND_PID=$!
        cd ..
        
        # 前台启动前端
        cd frontend && python -m http.server 8080
        
        # 清理
        kill $BACKEND_PID 2>/dev/null
        ;;
    *)
        echo "无效选择"
        exit 1
        ;;
esac
