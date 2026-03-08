"""
数据库模型定义
"""
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class Member(db.Model):
    """成员表"""
    __tablename__ = 'members'
    
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # professor, phd, master, undergraduate
    university = db.Column(db.String(200))
    department = db.Column(db.String(200))
    email = db.Column(db.String(200), unique=True)
    research = db.Column(db.Text)  # 研究方向
    avatar = db.Column(db.String(10))  # emoji头像
    join_date = db.Column(db.String(7))  # YYYY-MM格式
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    meetings = db.relationship('Meeting', backref='presenter', lazy='dynamic')
    submissions = db.relationship('MeetingSubmission', backref='submitter', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'role': self.role,
            'roleLabel': self.get_role_label(),
            'university': self.university,
            'department': self.department,
            'email': self.email,
            'research': self.research,
            'avatar': self.avatar,
            'joinDate': self.join_date,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }
    
    def get_role_label(self):
        labels = {
            'professor': '教授',
            'phd': '博士生',
            'master': '硕士生',
            'undergraduate': '本科生'
        }
        return labels.get(self.role, self.role)


class Meeting(db.Model):
    """会议表"""
    __tablename__ = 'meetings'
    
    id = db.Column(db.String(36), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(5), default='14:00')  # HH:MM格式
    location = db.Column(db.String(200))
    status = db.Column(db.String(20), default='upcoming')  # upcoming, completed
    tags = db.Column(db.Text)  # JSON格式的标签列表
    presenter_id = db.Column(db.String(36), db.ForeignKey('members.id'))
    notes = db.Column(db.Text)  # 老师点评
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    submissions = db.relationship('MeetingSubmission', backref='meeting', lazy='dynamic', 
                                  cascade='all, delete-orphan')
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'title': self.title,
            'date': self.date.isoformat() if self.date else None,
            'time': self.time,
            'location': self.location,
            'status': self.status,
            'tags': json.loads(self.tags) if self.tags else [],
            'presenter': self.presenter.name if self.presenter else '待定',
            'notes': self.notes,
            'submissions': self.submissions.count(),
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class MeetingSubmission(db.Model):
    """会议提交材料表"""
    __tablename__ = 'meeting_submissions'
    
    id = db.Column(db.String(36), primary_key=True)
    meeting_id = db.Column(db.String(36), db.ForeignKey('meetings.id'), nullable=False)
    submitter_id = db.Column(db.String(36), db.ForeignKey('members.id'))
    title = db.Column(db.String(200), nullable=False)
    file_key = db.Column(db.String(500))  # OSS文件key
    file_name = db.Column(db.String(200))
    file_size = db.Column(db.Integer)
    file_type = db.Column(db.String(20))  # pdf, ppt, pptx等
    note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'meetingId': self.meeting_id,
            'submitter': self.submitter.name if self.submitter else '匿名',
            'title': self.title,
            'fileName': self.file_name,
            'fileSize': self.file_size,
            'fileType': self.file_type,
            'note': self.note,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class SemesterSummary(db.Model):
    """学期总结表"""
    __tablename__ = 'semester_summaries'
    
    id = db.Column(db.String(36), primary_key=True)
    member_id = db.Column(db.String(36), db.ForeignKey('members.id'))
    type = db.Column(db.String(20), nullable=False)  # papers, submissions, articles, literature, theory
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)  # JSON格式的详细内容
    semester = db.Column(db.String(20))  # 例如：2025-2026-1
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    member = db.relationship('Member', backref='summaries')
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'type': self.type,
            'title': self.title,
            'content': json.loads(self.content) if self.content else {},
            'semester': self.semester,
            'author': self.member.name if self.member else '匿名',
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class Resource(db.Model):
    """资源表"""
    __tablename__ = 'resources'
    
    id = db.Column(db.String(36), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(20), nullable=False)  # literature, theory, tools, other
    description = db.Column(db.Text)
    file_key = db.Column(db.String(500))  # OSS文件key
    file_count = db.Column(db.Integer, default=1)
    file_size = db.Column(db.Integer)
    uploader_id = db.Column(db.String(36), db.ForeignKey('members.id'))
    downloads = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    uploader = db.relationship('Member', backref='resources')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'category': self.category,
            'categoryLabel': self.get_category_label(),
            'description': self.description,
            'fileCount': self.file_count,
            'size': self.format_size(),
            'uploader': self.uploader.name if self.uploader else '匿名',
            'downloads': self.downloads,
            'uploadDate': self.created_at.isoformat() if self.created_at else None,
        }
    
    def get_category_label(self):
        labels = {
            'literature': '文献',
            'theory': '理论构念',
            'tools': '工具',
            'other': '其他'
        }
        return labels.get(self.category, self.category)
    
    def format_size(self):
        """格式化文件大小"""
        if not self.file_size:
            return '0 B'
        
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f'{size:.1f} {unit}'
            size /= 1024
        return f'{size:.1f} TB'


class Feedback(db.Model):
    """反馈建议表"""
    __tablename__ = 'feedbacks'
    
    id = db.Column(db.String(36), primary_key=True)
    type = db.Column(db.String(20), nullable=False)  # bug, suggestion, question, other
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    contact = db.Column(db.String(200))
    status = db.Column(db.String(20), default='pending')  # pending, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'typeLabel': self.get_type_label(),
            'title': self.title,
            'content': self.content,
            'contact': self.contact,
            'status': self.status,
            'statusLabel': self.get_status_label(),
            'createTime': self.created_at.isoformat() if self.created_at else None,
        }
    
    def get_type_label(self):
        labels = {
            'bug': 'Bug反馈',
            'suggestion': '功能建议',
            'question': '问题咨询',
            'other': '其他'
        }
        return labels.get(self.type, self.type)
    
    def get_status_label(self):
        labels = {
            'pending': '待处理',
            'resolved': '已解决'
        }
        return labels.get(self.status, self.status)
