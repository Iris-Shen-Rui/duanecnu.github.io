/**
 * 组会报告页面逻辑
 */

// 当前页面状态
const meetingsState = {
    meetings: [],
    filter: 'all',
    searchQuery: '',
    currentMeeting: null,
};

/**
 * 加载会议列表
 */
async function loadMeetings() {
    const container = document.getElementById('meetingsGrid');
    showLoading(container);
    
    try {
        // 模拟数据（实际项目中替换为API调用）
        const mockMeetings = [
            {
                id: '1',
                title: '第12周组会',
                date: '2026-03-15',
                time: '14:00',
                location: '理科大楼B301',
                status: 'upcoming',
                tags: ['文献讨论', '研究进展'],
                presenter: '张三',
                submissions: 3,
            },
            {
                id: '2',
                title: '第11周组会',
                date: '2026-03-08',
                time: '14:00',
                location: '理科大楼B301',
                status: 'completed',
                tags: ['论文汇报'],
                presenter: '李四',
                submissions: 5,
            },
            {
                id: '3',
                title: '第10周组会',
                date: '2026-03-01',
                time: '14:00',
                location: '理科大楼B301',
                status: 'completed',
                tags: ['研究方法', '数据处理'],
                presenter: '王五',
                submissions: 4,
            },
        ];
        
        meetingsState.meetings = mockMeetings;
        renderMeetings();
    } catch (error) {
        showToast('加载会议列表失败', 'error');
        showEmpty(container, '加载失败，请刷新重试');
    }
}

/**
 * 渲染会议列表
 */
function renderMeetings() {
    const container = document.getElementById('meetingsGrid');
    let filteredMeetings = [...meetingsState.meetings];
    
    // 应用筛选
    if (meetingsState.filter !== 'all') {
        filteredMeetings = filteredMeetings.filter(m => m.status === meetingsState.filter);
    }
    
    // 应用搜索
    if (meetingsState.searchQuery) {
        const query = meetingsState.searchQuery.toLowerCase();
        filteredMeetings = filteredMeetings.filter(m => 
            m.title.toLowerCase().includes(query) ||
            m.tags.some(t => t.toLowerCase().includes(query))
        );
    }
    
    if (filteredMeetings.length === 0) {
        showEmpty(container, '暂无会议');
        return;
    }
    
    container.innerHTML = filteredMeetings.map(meeting => `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">${escapeHtml(meeting.title)}</div>
                    <div class="card-meta">${formatDate(meeting.date)} ${meeting.time}</div>
                </div>
                <span class="tag ${meeting.status === 'upcoming' ? 'primary' : 'success'}">
                    ${meeting.status === 'upcoming' ? '即将召开' : '已结束'}
                </span>
            </div>
            <div class="card-body">
                <p><strong>地点：</strong>${escapeHtml(meeting.location)}</p>
                <p><strong>汇报人：</strong>${escapeHtml(meeting.presenter)}</p>
                <p><strong>提交数：</strong>${meeting.submissions}份</p>
                <div class="tags-container">
                    ${meeting.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
            <div class="card-footer">
                <button class="secondary-btn" onclick="viewMeetingDetail('${meeting.id}')">
                    查看详情
                </button>
                ${meeting.status === 'upcoming' ? `
                    <button class="primary-btn" onclick="showSubmitMaterialModal('${meeting.id}')">
                        提交材料
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

/**
 * 筛选会议
 */
function filterMeetings() {
    const filter = document.getElementById('meetingFilter').value;
    meetingsState.filter = filter;
    renderMeetings();
}

/**
 * 搜索会议
 */
function searchMeetings() {
    const query = document.getElementById('meetingSearch').value;
    meetingsState.searchQuery = query;
    renderMeetings();
}

/**
 * 显示创建会议模态框
 */
function showCreateMeetingModal() {
    const content = `
        <form onsubmit="createMeeting(event)">
            <div class="form-group">
                <label for="meetingTitle">会议标题</label>
                <input type="text" id="meetingTitle" required placeholder="例如：第12周组会">
            </div>
            <div class="form-group">
                <label for="meetingDate">日期</label>
                <input type="date" id="meetingDate" required>
            </div>
            <div class="form-group">
                <label for="meetingTime">时间</label>
                <input type="time" id="meetingTime" required value="14:00">
            </div>
            <div class="form-group">
                <label for="meetingLocation">地点</label>
                <input type="text" id="meetingLocation" required placeholder="例如：理科大楼B301">
            </div>
            <div class="form-group">
                <label for="meetingTags">标签（逗号分隔）</label>
                <input type="text" id="meetingTags" placeholder="例如：文献讨论,研究进展">
            </div>
            <button type="submit" class="primary-btn">创建会议</button>
        </form>
    `;
    showModal(content, '创建组会');
}

/**
 * 创建会议
 */
async function createMeeting(event) {
    event.preventDefault();
    
    const title = document.getElementById('meetingTitle').value;
    const date = document.getElementById('meetingDate').value;
    const time = document.getElementById('meetingTime').value;
    const location = document.getElementById('meetingLocation').value;
    const tagsStr = document.getElementById('meetingTags').value;
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
    
    try {
        // 实际项目中调用API
        // await meetingApi.create({ title, date, time, location, tags });
        
        // 模拟创建
        const newMeeting = {
            id: generateId(),
            title,
            date,
            time,
            location,
            tags,
            status: 'upcoming',
            presenter: '待定',
            submissions: 0,
        };
        
        meetingsState.meetings.unshift(newMeeting);
        renderMeetings();
        closeModal();
        showToast('会议创建成功', 'success');
    } catch (error) {
        showToast('创建失败，请重试', 'error');
    }
}

/**
 * 查看会议详情
 */
function viewMeetingDetail(meetingId) {
    const meeting = meetingsState.meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    const content = `
        <div class="meeting-detail">
            <div class="detail-row">
                <strong>会议标题：</strong>
                <span>${escapeHtml(meeting.title)}</span>
            </div>
            <div class="detail-row">
                <strong>时间：</strong>
                <span>${formatDate(meeting.date)} ${meeting.time}</span>
            </div>
            <div class="detail-row">
                <strong>地点：</strong>
                <span>${escapeHtml(meeting.location)}</span>
            </div>
            <div class="detail-row">
                <strong>汇报人：</strong>
                <span>${escapeHtml(meeting.presenter)}</span>
            </div>
            <div class="detail-row">
                <strong>状态：</strong>
                <span class="tag ${meeting.status === 'upcoming' ? 'primary' : 'success'}">
                    ${meeting.status === 'upcoming' ? '即将召开' : '已结束'}
                </span>
            </div>
            <div class="detail-row">
                <strong>标签：</strong>
                <div>
                    ${meeting.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
            <div class="detail-row">
                <strong>提交材料：</strong>
                <span>${meeting.submissions}份</span>
            </div>
        </div>
        <div class="card-footer" style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 16px;">
            <button class="secondary-btn" onclick="closeModal()">关闭</button>
            ${meeting.status === 'upcoming' ? `
                <button class="primary-btn" onclick="closeModal(); showSubmitMaterialModal('${meeting.id}')">
                    提交材料
                </button>
            ` : ''}
        </div>
    `;
    
    showModal(content, meeting.title);
}

/**
 * 显示提交材料模态框
 */
function showSubmitMaterialModal(meetingId) {
    const meeting = meetingsState.meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    const content = `
        <form onsubmit="submitMaterial(event, '${meetingId}')">
            <div class="form-group">
                <label for="materialTitle">材料标题</label>
                <input type="text" id="materialTitle" required placeholder="请输入材料标题">
            </div>
            <div class="form-group">
                <label for="materialFile">上传文件（PPT/PDF）</label>
                <div class="file-upload-area" onclick="document.getElementById('materialFile').click()">
                    <input type="file" id="materialFile" accept=".ppt,.pptx,.pdf" onchange="handleFileSelect(this)">
                    <div class="icon">📁</div>
                    <p id="fileInfo">点击上传文件或拖拽到此处</p>
                </div>
            </div>
            <div class="form-group">
                <label for="materialNote">备注</label>
                <textarea id="materialNote" rows="3" placeholder="可选：添加备注说明"></textarea>
            </div>
            <button type="submit" class="primary-btn">提交材料</button>
        </form>
    `;
    
    showModal(content, `提交材料 - ${meeting.title}`);
}

/**
 * 处理文件选择
 */
function handleFileSelect(input) {
    const file = input.files[0];
    const fileInfo = document.getElementById('fileInfo');
    
    if (file) {
        fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
    }
}

/**
 * 提交材料
 */
async function submitMaterial(event, meetingId) {
    event.preventDefault();
    
    const title = document.getElementById('materialTitle').value;
    const fileInput = document.getElementById('materialFile');
    const note = document.getElementById('materialNote').value;
    
    if (!fileInput.files[0]) {
        showToast('请选择文件', 'warning');
        return;
    }
    
    try {
        // 实际项目中调用API
        // await meetingApi.submit({ meetingId, title, file: fileInput.files[0], note });
        
        // 模拟提交
        const meeting = meetingsState.meetings.find(m => m.id === meetingId);
        if (meeting) {
            meeting.submissions++;
        }
        
        closeModal();
        showToast('材料提交成功', 'success');
        renderMeetings();
    } catch (error) {
        showToast('提交失败，请重试', 'error');
    }
}
