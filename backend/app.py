"""
Flask主应用
"""
import os
import uuid
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import get_config
from models import db, Member, Meeting, MeetingSubmission, SemesterSummary, Resource, Feedback

# 导入OSS存储SDK
try:
    from coze_coding_dev_sdk.s3 import S3SyncStorage
    HAS_OSS = True
except ImportError:
    HAS_OSS = False
    print("Warning: coze-coding-dev-sdk not installed, file upload will use local storage")


def create_app(config_class=None):
    """创建Flask应用"""
    if config_class is None:
        config_class = get_config()
    
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # 启用CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # 初始化数据库
    db.init_app(app)
    
    # 创建上传目录
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # 初始化OSS存储
    storage = None
    if HAS_OSS and app.config['COZE_BUCKET_ENDPOINT_URL']:
        storage = S3SyncStorage(
            endpoint_url=app.config['COZE_BUCKET_ENDPOINT_URL'],
            access_key=app.config['COZE_BUCKET_ACCESS_KEY'],
            secret_key=app.config['COZE_BUCKET_SECRET_KEY'],
            bucket_name=app.config['COZE_BUCKET_NAME'],
            region=app.config['OSS_REGION'],
        )
    
    # 注册路由
    register_routes(app, storage)
    
    return app


def register_routes(app, storage):
    """注册API路由"""
    
    # ===== 健康检查 =====
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'timestamp': datetime.utcnow().isoformat()})
    
    # ===== 会议相关API =====
    @app.route('/api/meetings', methods=['GET'])
    def get_meetings():
        """获取会议列表"""
        status = request.args.get('status')
        query = Meeting.query
        
        if status and status != 'all':
            query = query.filter_by(status=status)
        
        meetings = query.order_by(Meeting.date.desc()).all()
        return jsonify([m.to_dict() for m in meetings])
    
    @app.route('/api/meetings', methods=['POST'])
    def create_meeting():
        """创建会议"""
        data = request.get_json()
        
        meeting = Meeting(
            id=str(uuid.uuid4()),
            title=data.get('title'),
            date=datetime.strptime(data.get('date'), '%Y-%m-%d').date(),
            time=data.get('time', '14:00'),
            location=data.get('location'),
            tags=json.dumps(data.get('tags', [])),
            presenter_id=data.get('presenterId'),
        )
        
        db.session.add(meeting)
        db.session.commit()
        
        return jsonify(meeting.to_dict()), 201
    
    @app.route('/api/meetings/<meeting_id>', methods=['GET'])
    def get_meeting(meeting_id):
        """获取单个会议"""
        meeting = Meeting.query.get_or_404(meeting_id)
        return jsonify(meeting.to_dict())
    
    @app.route('/api/meetings/<meeting_id>', methods=['PUT'])
    def update_meeting(meeting_id):
        """更新会议"""
        meeting = Meeting.query.get_or_404(meeting_id)
        data = request.get_json()
        
        if 'title' in data:
            meeting.title = data['title']
        if 'date' in data:
            meeting.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if 'time' in data:
            meeting.time = data['time']
        if 'location' in data:
            meeting.location = data['location']
        if 'tags' in data:
            meeting.tags = json.dumps(data['tags'])
        if 'status' in data:
            meeting.status = data['status']
        
        db.session.commit()
        return jsonify(meeting.to_dict())
    
    @app.route('/api/meetings/<meeting_id>', methods=['DELETE'])
    def delete_meeting(meeting_id):
        """删除会议"""
        meeting = Meeting.query.get_or_404(meeting_id)
        db.session.delete(meeting)
        db.session.commit()
        return jsonify({'message': '删除成功'})
    
    @app.route('/api/meetings/submissions', methods=['POST'])
    def submit_meeting_material():
        """提交会议材料"""
        meeting_id = request.form.get('meetingId')
        title = request.form.get('title')
        note = request.form.get('note')
        
        if 'file' not in request.files:
            return jsonify({'error': '未上传文件'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '未选择文件'}), 400
        
        # 上传文件
        file_key = None
        if storage:
            # 上传到OSS
            filename = secure_filename(file.filename)
            file_content = file.read()
            file_key = storage.upload_file(
                file_content=file_content,
                file_name=f'meetings/{meeting_id}/{filename}',
                content_type=file.content_type or 'application/octet-stream'
            )
        
        # 保存记录
        submission = MeetingSubmission(
            id=str(uuid.uuid4()),
            meeting_id=meeting_id,
            title=title,
            file_key=file_key,
            file_name=file.filename,
            file_size=len(file_content) if file_content else 0,
            file_type=file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else '',
            note=note,
        )
        
        db.session.add(submission)
        db.session.commit()
        
        return jsonify(submission.to_dict()), 201
    
    # ===== 成员相关API =====
    @app.route('/api/members', methods=['GET'])
    def get_members():
        """获取成员列表"""
        role = request.args.get('role')
        query = Member.query
        
        if role and role != 'all':
            query = query.filter_by(role=role)
        
        members = query.order_by(Member.created_at.desc()).all()
        return jsonify([m.to_dict() for m in members])
    
    @app.route('/api/members', methods=['POST'])
    def create_member():
        """创建成员"""
        data = request.get_json()
        
        member = Member(
            id=str(uuid.uuid4()),
            name=data.get('name'),
            role=data.get('role'),
            university=data.get('university'),
            department=data.get('department'),
            email=data.get('email'),
            research=data.get('research'),
            avatar=data.get('avatar', '👨‍🎓'),
            join_date=data.get('joinDate'),
        )
        
        db.session.add(member)
        db.session.commit()
        
        return jsonify(member.to_dict()), 201
    
    @app.route('/api/members/<member_id>', methods=['GET'])
    def get_member(member_id):
        """获取单个成员"""
        member = Member.query.get_or_404(member_id)
        return jsonify(member.to_dict())
    
    @app.route('/api/members/<member_id>', methods=['PUT'])
    def update_member(member_id):
        """更新成员"""
        member = Member.query.get_or_404(member_id)
        data = request.get_json()
        
        if 'name' in data:
            member.name = data['name']
        if 'email' in data:
            member.email = data['email']
        if 'research' in data:
            member.research = data['research']
        
        db.session.commit()
        return jsonify(member.to_dict())
    
    @app.route('/api/members/<member_id>', methods=['DELETE'])
    def delete_member(member_id):
        """删除成员"""
        member = Member.query.get_or_404(member_id)
        db.session.delete(member)
        db.session.commit()
        return jsonify({'message': '删除成功'})
    
    # ===== 学期总结相关API =====
    @app.route('/api/summaries', methods=['GET'])
    def get_summaries():
        """获取总结列表"""
        summary_type = request.args.get('type')
        query = SemesterSummary.query
        
        if summary_type:
            query = query.filter_by(type=summary_type)
        
        summaries = query.order_by(SemesterSummary.created_at.desc()).all()
        return jsonify([s.to_dict() for s in summaries])
    
    @app.route('/api/summaries', methods=['POST'])
    def create_summary():
        """创建总结"""
        data = request.get_json()
        
        summary = SemesterSummary(
            id=str(uuid.uuid4()),
            type=data.get('type'),
            title=data.get('title'),
            content=json.dumps(data.get('content', {})),
            semester=data.get('semester'),
            member_id=data.get('memberId'),
        )
        
        db.session.add(summary)
        db.session.commit()
        
        return jsonify(summary.to_dict()), 201
    
    @app.route('/api/summaries/<summary_id>', methods=['GET'])
    def get_summary(summary_id):
        """获取单个总结"""
        summary = SemesterSummary.query.get_or_404(summary_id)
        return jsonify(summary.to_dict())
    
    @app.route('/api/summaries/<summary_id>', methods=['DELETE'])
    def delete_summary(summary_id):
        """删除总结"""
        summary = SemesterSummary.query.get_or_404(summary_id)
        db.session.delete(summary)
        db.session.commit()
        return jsonify({'message': '删除成功'})
    
    # ===== 资源相关API =====
    @app.route('/api/resources', methods=['GET'])
    def get_resources():
        """获取资源列表"""
        category = request.args.get('category')
        query = Resource.query
        
        if category and category != 'all':
            query = query.filter_by(category=category)
        
        resources = query.order_by(Resource.created_at.desc()).all()
        return jsonify([r.to_dict() for r in resources])
    
    @app.route('/api/resources', methods=['POST'])
    def upload_resource():
        """上传资源"""
        title = request.form.get('title')
        category = request.form.get('category')
        description = request.form.get('description')
        
        if 'file' not in request.files:
            return jsonify({'error': '未上传文件'}), 400
        
        files = request.files.getlist('file')
        total_size = 0
        file_key = None
        
        if storage:
            # 上传到OSS
            for file in files:
                if file.filename:
                    filename = secure_filename(file.filename)
                    file_content = file.read()
                    total_size += len(file_content)
                    
                    file_key = storage.upload_file(
                        file_content=file_content,
                        file_name=f'resources/{filename}',
                        content_type=file.content_type or 'application/octet-stream'
                    )
        
        # 保存记录
        resource = Resource(
            id=str(uuid.uuid4()),
            title=title,
            category=category,
            description=description,
            file_key=file_key,
            file_count=len(files),
            file_size=total_size,
        )
        
        db.session.add(resource)
        db.session.commit()
        
        return jsonify(resource.to_dict()), 201
    
    @app.route('/api/resources/<resource_id>', methods=['GET'])
    def get_resource(resource_id):
        """获取单个资源"""
        resource = Resource.query.get_or_404(resource_id)
        return jsonify(resource.to_dict())
    
    @app.route('/api/resources/<resource_id>/download', methods=['GET'])
    def download_resource(resource_id):
        """下载资源"""
        resource = Resource.query.get_or_404(resource_id)
        
        if storage and resource.file_key:
            # 生成签名URL
            url = storage.generate_presigned_url(
                key=resource.file_key,
                expire_time=3600  # 1小时有效
            )
            
            # 更新下载次数
            resource.downloads += 1
            db.session.commit()
            
            return jsonify({'url': url})
        else:
            return jsonify({'error': '文件不存在'}), 404
    
    @app.route('/api/resources/<resource_id>', methods=['DELETE'])
    def delete_resource(resource_id):
        """删除资源"""
        resource = Resource.query.get_or_404(resource_id)
        
        # 删除OSS文件
        if storage and resource.file_key:
            try:
                storage.delete_file(file_key=resource.file_key)
            except Exception as e:
                print(f"删除OSS文件失败: {e}")
        
        db.session.delete(resource)
        db.session.commit()
        return jsonify({'message': '删除成功'})
    
    # ===== 反馈相关API =====
    @app.route('/api/feedback', methods=['GET'])
    def get_feedbacks():
        """获取反馈列表"""
        feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
        return jsonify([f.to_dict() for f in feedbacks])
    
    @app.route('/api/feedback', methods=['POST'])
    def create_feedback():
        """提交反馈"""
        data = request.get_json()
        
        feedback = Feedback(
            id=str(uuid.uuid4()),
            type=data.get('type'),
            title=data.get('title'),
            content=data.get('content'),
            contact=data.get('contact'),
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify(feedback.to_dict()), 201
    
    @app.route('/api/feedback/<feedback_id>', methods=['PUT'])
    def update_feedback(feedback_id):
        """更新反馈状态"""
        feedback = Feedback.query.get_or_404(feedback_id)
        data = request.get_json()
        
        if 'status' in data:
            feedback.status = data['status']
        
        db.session.commit()
        return jsonify(feedback.to_dict())
    
    # ===== 统计相关API =====
    @app.route('/api/stats/dashboard', methods=['GET'])
    def get_dashboard_stats():
        """获取首页统计数据"""
        stats = {
            'meetingCount': Meeting.query.count(),
            'memberCount': Member.query.count(),
            'submissionCount': MeetingSubmission.query.count(),
            'resourceCount': Resource.query.count(),
        }
        return jsonify(stats)
    
    @app.route('/api/stats/recent-activity', methods=['GET'])
    def get_recent_activity():
        """获取最近动态"""
        activities = []
        
        # 最近会议
        recent_meetings = Meeting.query.order_by(Meeting.created_at.desc()).limit(3).all()
        for meeting in recent_meetings:
            activities.append({
                'type': 'meeting',
                'icon': '📅',
                'title': '新组会创建',
                'description': meeting.title,
                'time': meeting.created_at.isoformat(),
            })
        
        # 最近提交
        recent_submissions = MeetingSubmission.query.order_by(
            MeetingSubmission.created_at.desc()
        ).limit(3).all()
        for sub in recent_submissions:
            activities.append({
                'type': 'submission',
                'icon': '📄',
                'title': '材料提交',
                'description': f'{sub.submitter.name if sub.submitter else "匿名"}提交了{sub.title}',
                'time': sub.created_at.isoformat(),
            })
        
        # 最近资源
        recent_resources = Resource.query.order_by(Resource.created_at.desc()).limit(3).all()
        for res in recent_resources:
            activities.append({
                'type': 'resource',
                'icon': '📚',
                'title': '资源上传',
                'description': res.title,
                'time': res.created_at.isoformat(),
            })
        
        # 按时间排序
        activities.sort(key=lambda x: x['time'], reverse=True)
        
        return jsonify(activities[:10])
    
    # ===== 前端静态文件服务 =====
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        """服务前端静态文件"""
        frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend')
        
        if path and os.path.exists(os.path.join(frontend_dir, path)):
            return send_from_directory(frontend_dir, path)
        else:
            return send_from_directory(frontend_dir, 'index.html')


# 创建应用实例
app = create_app()


# 创建数据库表
@app.before_request
def create_tables():
    """在首次请求时创建数据库表"""
    if not hasattr(app, '_tables_created'):
        db.create_all()
        app._tables_created = True


if __name__ == '__main__':
    # 开发环境运行
    app.run(host='0.0.0.0', port=5000, debug=True)
