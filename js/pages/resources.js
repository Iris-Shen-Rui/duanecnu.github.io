/**
 * 资源汇总页面逻辑
 */

// 当前页面状态
const resourcesState = {
    resources: [],
    category: 'all',
};

/**
 * 加载资源列表
 */
async function loadResources() {
    const container = document.getElementById('resourcesGrid');
    showLoading(container);
    
    try {
        // 模拟数据
        const mockResources = [
            {
                id: '1',
                title: '深度学习论文合集',
                category: 'literature',
                categoryLabel: '文献',
                description: '包含ResNet、Transformer、BERT等经典论文',
                fileCount: 15,
                size: '25.6 MB',
                uploadDate: '2026-03-05',
                uploader: '张三',
                downloads: 45,
            },
            {
                id: '2',
                title: '认知负荷理论综述',
                category: 'theory',
                categoryLabel: '理论构念',
                description: '认知负荷理论的定义、测量方法及应用场景',
                fileCount: 1,
                size: '1.2 MB',
                uploadDate: '2026-03-01',
                uploader: '李四',
                downloads: 32,
            },
            {
                id: '3',
                title: 'Python数据分析工具包',
                category: 'tools',
                categoryLabel: '工具',
                description: '包含numpy、pandas、matplotlib常用代码模板',
                fileCount: 10,
                size: '156 KB',
                uploadDate: '2026-02-20',
                uploader: '王五',
                downloads: 78,
            },
            {
                id: '4',
                title: '学习分析研究方法',
                category: 'literature',
                categoryLabel: '文献',
                description: '学习分析领域的研究方法综述',
                fileCount: 5,
                size: '8.5 MB',
                uploadDate: '2026-02-15',
                uploader: '张三',
                downloads: 56,
            },
            {
                id: '5',
                title: 'SPSS统计分析教程',
                category: 'tools',
                categoryLabel: '工具',
                description: 'SPSS常用统计分析操作指南',
                fileCount: 1,
                size: '3.2 MB',
                uploadDate: '2026-02-10',
                uploader: '李四',
                downloads: 89,
            },
        ];
        
        resourcesState.resources = mockResources;
        renderResources();
        setupCategoryFilters();
    } catch (error) {
        showToast('加载资源列表失败', 'error');
        showEmpty(container, '加载失败，请刷新重试');
    }
}

/**
 * 设置分类筛选
 */
function setupCategoryFilters() {
    const buttons = document.querySelectorAll('.resource-categories .category-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            resourcesState.category = this.dataset.category;
            renderResources();
        });
    });
}

/**
 * 渲染资源列表
 */
function renderResources() {
    const container = document.getElementById('resourcesGrid');
    let filteredResources = [...resourcesState.resources];
    
    // 应用筛选
    if (resourcesState.category !== 'all') {
        filteredResources = filteredResources.filter(r => r.category === resourcesState.category);
    }
    
    if (filteredResources.length === 0) {
        showEmpty(container, '暂无资源');
        return;
    }
    
    container.innerHTML = filteredResources.map(resource => `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">${escapeHtml(resource.title)}</div>
                    <div class="card-meta">${resource.fileCount}个文件 | ${resource.size}</div>
                </div>
                <span class="tag">${resource.categoryLabel}</span>
            </div>
            <div class="card-body">
                <p style="color: var(--text-secondary); font-size: 14px;">${escapeHtml(resource.description)}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 12px; color: var(--text-secondary);">
                    <span>上传者：${escapeHtml(resource.uploader)}</span>
                    <span>${formatDate(resource.uploadDate)}</span>
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
                    <span>下载次数：${resource.downloads}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="secondary-btn" onclick="viewResourceDetail('${resource.id}')">查看详情</button>
                <button class="primary-btn" onclick="downloadResource('${resource.id}')">下载</button>
            </div>
        </div>
    `).join('');
}

/**
 * 显示上传资源模态框
 */
function showUploadResourceModal() {
    const content = `
        <form onsubmit="uploadResource(event)">
            <div class="form-group">
                <label for="resourceTitle">资源标题</label>
                <input type="text" id="resourceTitle" required placeholder="请输入资源标题">
            </div>
            <div class="form-group">
                <label for="resourceCategory">分类</label>
                <select id="resourceCategory" required>
                    <option value="literature">文献</option>
                    <option value="theory">理论构念</option>
                    <option value="tools">工具</option>
                    <option value="other">其他</option>
                </select>
            </div>
            <div class="form-group">
                <label for="resourceDescription">描述</label>
                <textarea id="resourceDescription" rows="3" placeholder="简要描述资源内容"></textarea>
            </div>
            <div class="form-group">
                <label for="resourceFile">上传文件</label>
                <div class="file-upload-area" onclick="document.getElementById('resourceFile').click()">
                    <input type="file" id="resourceFile" multiple onchange="handleResourceFileSelect(this)">
                    <div class="icon">📁</div>
                    <p id="resourceFileInfo">点击上传文件或拖拽到此处</p>
                </div>
            </div>
            <button type="submit" class="primary-btn">上传资源</button>
        </form>
    `;
    
    showModal(content, '上传资源');
}

/**
 * 处理资源文件选择
 */
function handleResourceFileSelect(input) {
    const files = input.files;
    const fileInfo = document.getElementById('resourceFileInfo');
    
    if (files.length > 0) {
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
        fileInfo.textContent = `${files.length}个文件 (${formatFileSize(totalSize)})`;
    }
}

/**
 * 上传资源
 */
async function uploadResource(event) {
    event.preventDefault();
    
    const title = document.getElementById('resourceTitle').value;
    const category = document.getElementById('resourceCategory').value;
    const description = document.getElementById('resourceDescription').value;
    const fileInput = document.getElementById('resourceFile');
    
    if (!fileInput.files[0]) {
        showToast('请选择文件', 'warning');
        return;
    }
    
    try {
        // 实际项目中调用API
        // await resourceApi.upload(fileInput.files[0], { title, category, description });
        
        // 模拟上传成功
        const categoryLabels = {
            literature: '文献',
            theory: '理论构念',
            tools: '工具',
            other: '其他',
        };
        
        const newResource = {
            id: generateId(),
            title,
            category,
            categoryLabel: categoryLabels[category],
            description,
            fileCount: fileInput.files.length,
            size: formatFileSize(Array.from(fileInput.files).reduce((sum, f) => sum + f.size, 0)),
            uploadDate: new Date().toISOString(),
            uploader: '当前用户',
            downloads: 0,
        };
        
        resourcesState.resources.unshift(newResource);
        renderResources();
        closeModal();
        showToast('资源上传成功', 'success');
    } catch (error) {
        showToast('上传失败，请重试', 'error');
    }
}

/**
 * 查看资源详情
 */
function viewResourceDetail(resourceId) {
    const resource = resourcesState.resources.find(r => r.id === resourceId);
    if (!resource) return;
    
    const content = `
        <div class="resource-detail">
            <div class="detail-row">
                <strong>资源标题：</strong>
                <span>${escapeHtml(resource.title)}</span>
            </div>
            <div class="detail-row">
                <strong>分类：</strong>
                <span class="tag">${resource.categoryLabel}</span>
            </div>
            <div class="detail-row">
                <strong>描述：</strong>
                <p style="color: var(--text-secondary); margin-top: 4px;">${escapeHtml(resource.description)}</p>
            </div>
            <div class="detail-row">
                <strong>文件信息：</strong>
                <span>${resource.fileCount}个文件，共${resource.size}</span>
            </div>
            <div class="detail-row">
                <strong>上传者：</strong>
                <span>${escapeHtml(resource.uploader)}</span>
            </div>
            <div class="detail-row">
                <strong>上传时间：</strong>
                <span>${formatDate(resource.uploadDate)}</span>
            </div>
            <div class="detail-row">
                <strong>下载次数：</strong>
                <span>${resource.downloads}次</span>
            </div>
        </div>
        <div class="card-footer" style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 16px;">
            <button class="secondary-btn" onclick="closeModal()">关闭</button>
            <button class="primary-btn" onclick="downloadResource('${resource.id}'); closeModal();">下载资源</button>
        </div>
    `;
    
    showModal(content, resource.title);
}

/**
 * 下载资源
 */
async function downloadResource(resourceId) {
    const resource = resourcesState.resources.find(r => r.id === resourceId);
    if (!resource) return;
    
    try {
        // 实际项目中调用API获取下载链接
        // const url = await resourceApi.download(resourceId);
        // downloadFile(url, resource.title);
        
        // 模拟下载
        resource.downloads++;
        showToast('开始下载...', 'success');
    } catch (error) {
        showToast('下载失败，请重试', 'error');
    }
}
