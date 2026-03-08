"""
配置文件
"""
import os
from datetime import timedelta

class Config:
    """基础配置"""
    # Flask配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # 数据库配置
    # 优先使用环境变量，默认使用SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///duanmen.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False  # 生产环境设为False
    
    # 文件上传配置
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 最大50MB
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or '/tmp/uploads'
    ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'}
    
    # OSS配置（阿里云对象存储）
    COZE_BUCKET_ENDPOINT_URL = os.environ.get('COZE_BUCKET_ENDPOINT_URL')
    COZE_BUCKET_NAME = os.environ.get('COZE_BUCKET_NAME')
    COZE_BUCKET_ACCESS_KEY = os.environ.get('COZE_BUCKET_ACCESS_KEY', '')
    COZE_BUCKET_SECRET_KEY = os.environ.get('COZE_BUCKET_SECRET_KEY', '')
    OSS_REGION = os.environ.get('OSS_REGION', 'cn-shanghai')
    
    # CORS配置
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
    
    # JWT配置（可选）
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)


class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    SQLALCHEMY_ECHO = True  # 显示SQL语句


class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    
    # 生产环境必须设置环境变量
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("生产环境必须设置SECRET_KEY环境变量")


class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'  # 内存数据库


# 配置映射
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config():
    """获取当前配置"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])
