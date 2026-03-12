/**
 * 成员管理页面逻辑
 */

// 本地存储key
const MEMBERS_STORAGE_KEY = 'dm_members';

// 默认成员数据（首次加载使用）
const DEFAULT_MEMBERS = [
    {
        id: '1',
        name: '段老师',
        role: 'professor',
        roleLabel: '教授',
        university: '华东师范大学',
        department: '心理与认知科学学院',
        email: 'duan@ecnu.edu.cn',
        joinDate: '2010-09',
        avatar: '👨‍🏫',
    },
    {
        id: '2',
        name: '张三',
        role: 'phd',
        roleLabel: '博士生',
        university: '华东师范大学',
        department: '心理与认知科学学院',
        email: 'zhangsan@ecnu.edu.cn',
        joinDate: '2022-09',
        research: '学习分析、教育数据挖掘',
        avatar: '👨‍🎓',
    },
    {
        id: '3',
        name: '李四',
        role: 'phd',
        roleLabel: '博士生',
        university: '华东师范大学',
        department: '心理与认知科学学院',
        email: 'lisi@ecnu.edu.cn',
        joinDate: '2023-09',
        research: '人工智能教育应用',
        avatar: '👩‍🎓',
    },
    {
        id: '4',
        name: '王五',
        role: 'master',
        roleLabel: '硕士生',
        university: '华东师范大学',
        department: '心理与认知科学学院',
        email: 'wangwu@ecnu.edu.cn',
        joinDate: '2024-09',
        research: '在线学习环境设计',
        avatar: '👨‍🎓',
    },
    {
        id: '5',
        name: '赵六',
        role: 'undergraduate',
        roleLabel: '本科生',
        university: '华东师范大学',
        department: '教育技术学',
        email: 'zhaoliu@ecnu.edu.cn',
        joinDate: '2025-09',
        avatar: '👨‍🎓',
    },
];

function loadMembersFromStorage() {
    const saved = storage.get(MEMBERS_STORAGE_KEY, null);
    if (Array.isArray(saved)) {
        const roleLabels = {
            professor: '教授',
            phd: '博士生',
            master: '硕士生',
            undergraduate: '本科生',
        };
        return saved.map(member => ({
            ...member,
            roleLabel: member.roleLabel || roleLabels[member.role] || '成员',
        }));
    }
    return DEFAULT_MEMBERS;
}

function saveMembersToStorage() {
    storage.set(MEMBERS_STORAGE_KEY, membersState.members);
}

// 当前页面状态
const membersState = {
    members: [],
    filter: 'all',
};

/**
 * 加载成员列表
 */
async function loadMembers() {
    const container = document.getElementById('membersGrid');
    showLoading(container);
    
    try {
        membersState.members = loadMembersFromStorage();
        renderMembers();
        setupMemberFilters();
    } catch (error) {
        showToast('加载成员列表失败', 'error');
        showEmpty(container, '加载失败，请刷新重试');
    }
}

/**
 * 设置成员筛选器
 */
function setupMemberFilters() {
    const filter = document.getElementById('memberRoleFilter');
    if (filter) {
        filter.addEventListener('change', function() {
            membersState.filter = this.value;
            renderMembers();
        });
    }
}

/**
 * 渲染成员列表
 */
function renderMembers() {
    const container = document.getElementById('membersGrid');
    let filteredMembers = [...membersState.members];
    
    // 应用筛选
    if (membersState.filter !== 'all') {
        filteredMembers = filteredMembers.filter(m => m.role === membersState.filter);
    }
    
    if (filteredMembers.length === 0) {
        showEmpty(container, '暂无成员');
        return;
    }
    
    container.innerHTML = filteredMembers.map(member => `
        <div class="card member-card">
            <div class="card-header">
                <div class="member-avatar">${member.avatar}</div>
                <div style="flex: 1;">
                    <div class="card-title">${escapeHtml(member.name)}</div>
                    <div class="card-meta">
                        <span class="tag primary">${member.roleLabel}</span>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <p><strong>院校：</strong>${escapeHtml(member.university)}</p>
                <p><strong>院系：</strong>${escapeHtml(member.department)}</p>
                ${member.research ? `<p><strong>研究方向：</strong>${escapeHtml(member.research)}</p>` : ''}
                <p><strong>加入时间：</strong>${member.joinDate}</p>
            </div>
            <div class="card-footer">
                <button class="secondary-btn" onclick="viewMemberDetail('${member.id}')">查看详情</button>
                ${member.role !== 'professor' ? `
                    <button class="secondary-btn" onclick="editMember('${member.id}')">编辑</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

/**
 * 显示创建成员模态框
 */
function showCreateMemberModal() {
    const content = `
        <form onsubmit="createMember(event)">
            <div class="form-group">
                <label for="memberName">姓名</label>
                <input type="text" id="memberName" required placeholder="成员姓名">
            </div>
            <div class="form-group">
                <label for="memberRole">身份</label>
                <select id="memberRole" required>
                    <option value="phd">博士生</option>
                    <option value="master">硕士生</option>
                    <option value="undergraduate">本科生</option>
                </select>
            </div>
            <div class="form-group">
                <label for="memberUniversity">院校</label>
                <input type="text" id="memberUniversity" required value="华东师范大学">
            </div>
            <div class="form-group">
                <label for="memberDepartment">院系</label>
                <input type="text" id="memberDepartment" required value="教育技术学">
            </div>
            <div class="form-group">
                <label for="memberEmail">邮箱</label>
                <input type="email" id="memberEmail" required placeholder="xxx@ecnu.edu.cn">
            </div>
            <div class="form-group">
                <label for="memberResearch">研究方向</label>
                <input type="text" id="memberResearch" placeholder="例如：学习分析、教育数据挖掘">
            </div>
            <div class="form-group">
                <label for="memberJoinDate">加入时间</label>
                <input type="month" id="memberJoinDate" required>
            </div>
            <button type="submit" class="primary-btn">添加成员</button>
        </form>
    `;
    
    showModal(content, '添加成员');
}

/**
 * 创建成员
 */
async function createMember(event) {
    event.preventDefault();
    
    const roleLabels = {
        phd: '博士生',
        master: '硕士生',
        undergraduate: '本科生',
    };
    
    const role = document.getElementById('memberRole').value;
    
    const newMember = {
        id: generateId(),
        name: document.getElementById('memberName').value,
        role: role,
        roleLabel: roleLabels[role],
        university: document.getElementById('memberUniversity').value,
        department: document.getElementById('memberDepartment').value,
        email: document.getElementById('memberEmail').value,
        research: document.getElementById('memberResearch').value,
        joinDate: document.getElementById('memberJoinDate').value,
        avatar: role === 'phd' ? '👨‍🎓' : '👨‍🎓',
    };
    
    try {
        // 实际项目中调用API
        // await memberApi.create(newMember);
        
        membersState.members.push(newMember);
        saveMembersToStorage();
        renderMembers();
        closeModal();
        showToast('成员添加成功', 'success');
    } catch (error) {
        showToast('添加失败，请重试', 'error');
    }
}

/**
 * 查看成员详情
 */
function viewMemberDetail(memberId) {
    const member = membersState.members.find(m => m.id === memberId);
    if (!member) return;
    
    const content = `
        <div class="member-detail">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 64px;">${member.avatar}</div>
                <h3 style="margin-top: 12px;">${escapeHtml(member.name)}</h3>
                <span class="tag primary">${member.roleLabel}</span>
            </div>
            <div class="detail-row">
                <strong>院校：</strong>
                <span>${escapeHtml(member.university)}</span>
            </div>
            <div class="detail-row">
                <strong>院系：</strong>
                <span>${escapeHtml(member.department)}</span>
            </div>
            <div class="detail-row">
                <strong>邮箱：</strong>
                <span>${escapeHtml(member.email)}</span>
            </div>
            ${member.research ? `
                <div class="detail-row">
                    <strong>研究方向：</strong>
                    <span>${escapeHtml(member.research)}</span>
                </div>
            ` : ''}
            <div class="detail-row">
                <strong>加入时间：</strong>
                <span>${member.joinDate}</span>
            </div>
        </div>
        <div class="card-footer" style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 16px;">
            <button class="secondary-btn" onclick="closeModal()">关闭</button>
            <button class="secondary-btn" onclick="sendEmail('${member.email}')">发送邮件</button>
        </div>
    `;
    
    showModal(content, '成员详情');
}

/**
 * 编辑成员
 */
function editMember(memberId) {
    const member = membersState.members.find(m => m.id === memberId);
    if (!member) return;
    
    const content = `
        <form onsubmit="updateMember(event, '${memberId}')">
            <div class="form-group">
                <label for="editMemberName">姓名</label>
                <input type="text" id="editMemberName" required value="${escapeHtml(member.name)}">
            </div>
            <div class="form-group">
                <label for="editMemberResearch">研究方向</label>
                <input type="text" id="editMemberResearch" value="${escapeHtml(member.research || '')}">
            </div>
            <div class="form-group">
                <label for="editMemberEmail">邮箱</label>
                <input type="email" id="editMemberEmail" required value="${escapeHtml(member.email)}">
            </div>
            <button type="submit" class="primary-btn">保存修改</button>
        </form>
    `;
    
    showModal(content, '编辑成员');
}

/**
 * 更新成员信息
 */
async function updateMember(event, memberId) {
    event.preventDefault();
    
    const member = membersState.members.find(m => m.id === memberId);
    if (!member) return;
    
    member.name = document.getElementById('editMemberName').value;
    member.research = document.getElementById('editMemberResearch').value;
    member.email = document.getElementById('editMemberEmail').value;
    
    try {
        // 实际项目中调用API
        // await memberApi.update(memberId, member);
        
        saveMembersToStorage();
        renderMembers();
        closeModal();
        showToast('修改成功', 'success');
    } catch (error) {
        showToast('修改失败，请重试', 'error');
    }
}

/**
 * 发送邮件
 */
function sendEmail(email) {
    window.location.href = `mailto:${email}`;
}
