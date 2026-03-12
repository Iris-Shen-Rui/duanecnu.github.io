/**
 * 主应用逻辑
 */

// 应用状态
const appState = {
    currentPage: 'home',
    isLoading: false,
};

/**
 * 初始化应用
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航
    initNavigation();
    
    // 初始化移动端菜单
    initMobileMenu();
    
    // 加载首页数据
    loadHomePageData();
    
    // 绑定键盘事件
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

/**
 * 初始化导航
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            navigateTo(page);
        });
    });
}

/**
 * 导航到指定页面
 */
function navigateTo(page) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // 更新页面显示
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`${page}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新应用状态
    appState.currentPage = page;
    
    // 关闭移动端菜单
    closeMobileMenu();
    
    // 加载页面数据
    loadPageData(page);
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 加载页面数据
 */
function loadPageData(page) {
    switch (page) {
        case 'home':
            loadHomePageData();
            break;
        case 'meetings':
            loadMeetings();
            break;
        case 'summaries':
            loadSummaries();
            break;
        case 'members':
            loadMembers();
            break;
        case 'resources':
            loadResources();
            break;
        case 'feedback':
            loadFeedbacks();
            break;
    }
}

/**
 * 加载首页数据
 */
async function loadHomePageData() {
    try {
        const meetings = storage.get('dm_meetings', null);
        const members = storage.get('dm_members', null);
        const resources = storage.get('dm_resources', null);
        
        const meetingCount = Array.isArray(meetings) ? meetings.length : 3;
        const memberCount = Array.isArray(members) ? members.length : 5;
        const submissionCount = Array.isArray(meetings)
            ? meetings.reduce((sum, m) => sum + (Number(m.submissions) || 0), 0)
            : 12;
        const resourceCount = Array.isArray(resources) ? resources.length : 5;
        
        const stats = {
            meetingCount,
            memberCount,
            submissionCount,
            resourceCount,
        };
        
        // 更新统计数字（带动画效果）
        animateNumber('meetingCount', stats.meetingCount);
        animateNumber('memberCount', stats.memberCount);
        animateNumber('submissionCount', stats.submissionCount);
        animateNumber('resourceCount', stats.resourceCount);
        
        // 加载最近动态
        loadRecentActivity();
    } catch (error) {
        console.error('加载首页数据失败:', error);
    }
}

/**
 * 数字增长动画
 */
function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 1000;
    const startTime = Date.now();
    const startValue = 0;
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * 加载最近动态
 */
function loadRecentActivity() {
    const container = document.getElementById('recentActivity');
    
    // 模拟最近动态数据
    const activities = [
        {
            icon: '📅',
            title: '新组会创建',
            description: '第12周组会已创建',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
            icon: '📄',
            title: '材料提交',
            description: '张三提交了研究进展报告',
            time: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
            icon: '📚',
            title: '资源上传',
            description: '深度学习论文合集已上传',
            time: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
            icon: '👥',
            title: '新成员加入',
            description: '赵六加入课题组',
            time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
    ];
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <h4>${escapeHtml(activity.title)}</h4>
                <p>${escapeHtml(activity.description)}</p>
            </div>
            <div class="activity-time">${formatRelativeTime(activity.time)}</div>
        </div>
    `).join('');
}

/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

/**
 * 关闭移动端菜单
 */
function closeMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (menuBtn && navMenu) {
        menuBtn.classList.remove('active');
        navMenu.classList.remove('active');
    }
}

/**
 * 全局错误处理
 */
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.error);
    showToast('发生错误，请刷新页面重试', 'error');
});

/**
 * 网络状态监听
 */
window.addEventListener('online', function() {
    showToast('网络已恢复', 'success');
});

window.addEventListener('offline', function() {
    showToast('网络连接已断开', 'warning');
});

// 添加CSS样式到详情行
const style = document.createElement('style');
style.textContent = `
    .detail-row {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .detail-row:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }
    
    .detail-row strong {
        min-width: 80px;
        color: var(--text-secondary);
        font-size: 14px;
    }
    
    .detail-row span,
    .detail-row p {
        flex: 1;
        font-size: 14px;
    }
    
    .member-avatar {
        font-size: 48px;
        text-align: center;
    }
    
    .summaries-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .tags-container {
        margin-top: 8px;
    }
    
    .member-card .card-header {
        align-items: center;
    }
`;
document.head.appendChild(style);
