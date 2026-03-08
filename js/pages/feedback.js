/**
 * 反馈建议页面逻辑
 */

// 当前页面状态
const feedbackState = {
    feedbacks: [],
};

/**
 * 加载反馈列表
 */
async function loadFeedbacks() {
    const container = document.getElementById('feedbackList');
    showLoading(container);
    
    try {
        // 模拟数据
        const mockFeedbacks = [
            {
                id: '1',
                type: 'suggestion',
                typeLabel: '功能建议',
                title: '增加文件批量下载功能',
                content: '建议在资源汇总页面增加批量下载功能，方便一次性下载多个文件。',
                contact: 'zhangsan@ecnu.edu.cn',
                status: 'pending',
                statusLabel: '待处理',
                createTime: '2026-03-10T10:30:00',
            },
            {
                id: '2',
                type: 'bug',
                typeLabel: 'Bug反馈',
                title: '移动端页面显示异常',
                content: '在手机浏览器中打开会议详情页面时，部分内容显示不完整。',
                contact: 'lisi@ecnu.edu.cn',
                status: 'resolved',
                statusLabel: '已解决',
                createTime: '2026-03-08T14:20:00',
            },
            {
                id: '3',
                type: 'question',
                typeLabel: '问题咨询',
                title: '如何修改个人信息？',
                content: '请问在哪里可以修改个人研究方向和联系方式？',
                contact: '',
                status: 'resolved',
                statusLabel: '已解决',
                createTime: '2026-03-05T09:15:00',
            },
        ];
        
        feedbackState.feedbacks = mockFeedbacks;
        renderFeedbacks();
    } catch (error) {
        showToast('加载反馈列表失败', 'error');
        showEmpty(container, '加载失败，请刷新重试');
    }
}

/**
 * 渲染反馈列表
 */
function renderFeedbacks() {
    const container = document.getElementById('feedbackList');
    
    if (feedbackState.feedbacks.length === 0) {
        showEmpty(container, '暂无反馈');
        return;
    }
    
    container.innerHTML = feedbackState.feedbacks.map(fb => `
        <div class="feedback-item">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <h4>${escapeHtml(fb.title)}</h4>
                <span class="tag ${fb.status === 'resolved' ? 'success' : 'warning'}">${fb.statusLabel}</span>
            </div>
            <p>${escapeHtml(fb.content)}</p>
            <div class="meta">
                <span class="tag">${fb.typeLabel}</span>
                <span style="margin-left: 8px;">${formatRelativeTime(fb.createTime)}</span>
                ${fb.contact ? `<span style="margin-left: 8px;">| ${escapeHtml(fb.contact)}</span>` : ''}
            </div>
        </div>
    `).join('');
}

/**
 * 提交反馈
 */
async function submitFeedback(event) {
    event.preventDefault();
    
    const type = document.getElementById('feedbackType').value;
    const title = document.getElementById('feedbackTitle').value;
    const content = document.getElementById('feedbackContent').value;
    const contact = document.getElementById('feedbackContact').value;
    
    const typeLabels = {
        bug: 'Bug反馈',
        suggestion: '功能建议',
        question: '问题咨询',
        other: '其他',
    };
    
    try {
        // 实际项目中调用API
        // await feedbackApi.create({ type, title, content, contact });
        
        // 模拟提交成功
        const newFeedback = {
            id: generateId(),
            type,
            typeLabel: typeLabels[type],
            title,
            content,
            contact,
            status: 'pending',
            statusLabel: '待处理',
            createTime: new Date().toISOString(),
        };
        
        feedbackState.feedbacks.unshift(newFeedback);
        renderFeedbacks();
        
        // 清空表单
        document.getElementById('feedbackForm').reset();
        
        showToast('反馈提交成功，感谢您的建议！', 'success');
    } catch (error) {
        showToast('提交失败，请重试', 'error');
    }
}
