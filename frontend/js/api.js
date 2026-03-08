/**
 * API调用封装
 */

// API基础URL
const API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:5000/api' 
    : '/api';

/**
 * 基础请求方法
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    // 合并选项
    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '请求失败');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * GET请求
 */
async function get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const url = searchParams.toString() ? `${endpoint}?${searchParams}` : endpoint;
    return request(url, { method: 'GET' });
}

/**
 * POST请求
 */
async function post(endpoint, data = {}) {
    return request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * PUT请求
 */
async function put(endpoint, data = {}) {
    return request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * DELETE请求
 */
async function del(endpoint) {
    return request(endpoint, { method: 'DELETE' });
}

/**
 * 上传文件
 */
async function uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // 添加额外数据
    Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
    });
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || '上传失败');
    }
    
    return data;
}

// ===== 会议相关API =====
const meetingApi = {
    // 获取会议列表
    list: (params) => get('/meetings', params),
    
    // 获取单个会议
    get: (id) => get(`/meetings/${id}`),
    
    // 创建会议
    create: (data) => post('/meetings', data),
    
    // 更新会议
    update: (id, data) => put(`/meetings/${id}`, data),
    
    // 删除会议
    delete: (id) => del(`/meetings/${id}`),
    
    // 获取会议统计
    stats: (id) => get(`/meetings/${id}/stats`),
    
    // 提交会议材料
    submit: (data) => post('/meetings/submissions', data),
    
    // 获取提交记录
    submissions: (meetingId) => get('/meetings/submissions', { meetingId }),
};

// ===== 学期总结相关API =====
const summaryApi = {
    // 获取总结列表
    list: (params) => get('/summaries', params),
    
    // 获取单个总结
    get: (id) => get(`/summaries/${id}`),
    
    // 创建总结
    create: (data) => post('/summaries', data),
    
    // 更新总结
    update: (id, data) => put(`/summaries/${id}`, data),
    
    // 删除总结
    delete: (id) => del(`/summaries/${id}`),
};

// ===== 成员相关API =====
const memberApi = {
    // 获取成员列表
    list: (params) => get('/members', params),
    
    // 获取单个成员
    get: (id) => get(`/members/${id}`),
    
    // 创建成员
    create: (data) => post('/members', data),
    
    // 更新成员
    update: (id, data) => put(`/members/${id}`, data),
    
    // 删除成员
    delete: (id) => del(`/members/${id}`),
};

// ===== 资源相关API =====
const resourceApi = {
    // 获取资源列表
    list: (params) => get('/resources', params),
    
    // 获取单个资源
    get: (id) => get(`/resources/${id}`),
    
    // 上传资源
    upload: async (file, data) => {
        const formData = new FormData();
        formData.append('file', file);
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });
        
        const response = await fetch(`${API_BASE_URL}/resources`, {
            method: 'POST',
            body: formData,
        });
        
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || '上传失败');
        }
        return result;
    },
    
    // 删除资源
    delete: (id) => del(`/resources/${id}`),
    
    // 下载资源
    download: async (id) => {
        const response = await get(`/resources/${id}/download`);
        return response.url;
    },
};

// ===== 反馈相关API =====
const feedbackApi = {
    // 获取反馈列表
    list: (params) => get('/feedback', params),
    
    // 提交反馈
    create: (data) => post('/feedback', data),
    
    // 更新反馈状态
    update: (id, data) => put(`/feedback/${id}`, data),
};

// ===== 统计相关API =====
const statsApi = {
    // 获取首页统计数据
    dashboard: () => get('/stats/dashboard'),
    
    // 获取最近动态
    recentActivity: () => get('/stats/recent-activity'),
};
