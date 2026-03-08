/**
 * 工具函数库
 */

// API基础URL（部署后需要修改为实际地址）
const API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:5000/api' 
    : '/api';

/**
 * 显示Toast提示
 * @param {string} message - 提示消息
 * @param {string} type - 类型: success, error, warning
 * @param {number} duration - 显示时长(毫秒)
 */
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${getToastIcon(type)}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * 获取Toast图标
 */
function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠'
    };
    return icons[type] || icons.success;
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期对象或字符串
 * @param {string} format - 格式: 'full', 'date', 'time'
 */
function formatDate(date, format = 'date') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    switch (format) {
        case 'full':
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        case 'time':
            return `${hours}:${minutes}`;
        case 'date':
        default:
            return `${year}-${month}-${day}`;
    }
}

/**
 * 格式化相对时间
 * @param {string|Date} date - 日期对象或字符串
 */
function formatRelativeTime(date) {
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return formatDate(date);
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间(毫秒)
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 时间限制(毫秒)
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 显示模态框
 * @param {string} content - 模态框HTML内容
 * @param {string} title - 模态框标题
 */
function showModal(content, title = '') {
    const modalContainer = document.getElementById('modalContainer');
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModalOnOverlay(event)">
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
    modalContainer.innerHTML = modalHTML;
    
    // 延迟添加active类以触发动画
    setTimeout(() => {
        modalContainer.querySelector('.modal-overlay').classList.add('active');
    }, 10);
}

/**
 * 关闭模态框
 */
function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            document.getElementById('modalContainer').innerHTML = '';
        }, 300);
    }
}

/**
 * 点击遮罩层关闭模态框
 */
function closeModalOnOverlay(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeModal();
    }
}

/**
 * 显示加载状态
 * @param {HTMLElement} container - 容器元素
 */
function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
}

/**
 * 显示空状态
 * @param {HTMLElement} container - 容器元素
 * @param {string} message - 提示消息
 */
function showEmpty(container, message = '暂无数据') {
    container.innerHTML = `
        <div class="empty-state">
            <div class="icon">📭</div>
            <p>${message}</p>
        </div>
    `;
}

/**
 * 生成唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 深拷贝对象
 * @param {Object} obj - 要拷贝的对象
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 */
function validatePhone(phone) {
    const re = /^1[3-9]\d{9}$/;
    return re.test(phone);
}

/**
 * 获取URL参数
 * @param {string} name - 参数名
 */
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * 转义HTML特殊字符
 * @param {string} str - 原始字符串
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * 文件大小格式化
 * @param {number} bytes - 字节数
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 */
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * 判断是否为图片文件
 * @param {string} filename - 文件名
 */
function isImageFile(filename) {
    const ext = getFileExtension(filename).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
}

/**
 * 判断是否为PDF文件
 * @param {string} filename - 文件名
 */
function isPdfFile(filename) {
    return getFileExtension(filename).toLowerCase() === 'pdf';
}

/**
 * 判断是否为PPT文件
 * @param {string} filename - 文件名
 */
function isPptFile(filename) {
    const ext = getFileExtension(filename).toLowerCase();
    return ['ppt', 'pptx'].includes(ext);
}

/**
 * 获取文件图标
 * @param {string} filename - 文件名
 */
function getFileIcon(filename) {
    if (isImageFile(filename)) return '🖼️';
    if (isPdfFile(filename)) return '📄';
    if (isPptFile(filename)) return '📊';
    return '📁';
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('复制成功', 'success');
        return true;
    } catch (err) {
        showToast('复制失败', 'error');
        return false;
    }
}

/**
 * 下载文件
 * @param {string} url - 文件URL
 * @param {string} filename - 文件名
 */
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * 获取当前周次
 * @param {Date} startDate - 学期开始日期
 */
function getCurrentWeek(startDate) {
    const now = new Date();
    const start = new Date(startDate);
    const diff = now - start;
    const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
    return week > 0 ? week : 1;
}

/**
 * 本地存储封装
 */
const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    }
};
