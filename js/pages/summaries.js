/**
 * 学期总结页面逻辑
 */

// 当前页面状态
const summariesState = {
    activeTab: 'papers',
    summaries: {
        papers: [],
        submissions: [],
        articles: [],
        literature: [],
        theory: [],
    },
};

/**
 * 加载学期总结数据
 */
async function loadSummaries() {
    const container = document.getElementById('summaryContent');
    showLoading(container);
    
    try {
        // 模拟数据
        summariesState.summaries = {
            papers: [
                {
                    id: '1',
                    title: '深度学习在教育领域的应用研究',
                    author: '张三',
                    journal: '计算机教育',
                    date: '2026-03',
                    status: 'published',
                },
                {
                    id: '2',
                    title: '基于NLP的知识图谱构建方法',
                    author: '李四',
                    journal: '人工智能学报',
                    date: '2026-02',
                    status: 'published',
                },
            ],
            submissions: [
                {
                    id: '3',
                    title: '认知负荷理论在学习分析中的应用',
                    author: '王五',
                    journal: '教育技术学报',
                    date: '2026-03-01',
                    status: 'under_review',
                },
            ],
            articles: [
                {
                    id: '4',
                    title: '如何高效阅读文献',
                    author: '张三',
                    platform: '课题组公众号',
                    date: '2026-03-10',
                    views: 520,
                },
            ],
            literature: [
                {
                    id: '5',
                    title: '深度学习经典论文合集',
                    category: '机器学习',
                    count: 15,
                    note: '包含ResNet、Transformer等经典论文',
                    date: '2026-03-05',
                },
            ],
            theory: [
                {
                    id: '6',
                    name: '认知负荷理论',
                    field: '教育心理学',
                    definition: '描述工作记忆在学习过程中的容量限制',
                    applications: ['多媒体教学设计', '教学材料开发', '学习环境优化'],
                    date: '2026-03-01',
                },
            ],
        };
        
        renderSummaries();
        setupSummaryTabs();
    } catch (error) {
        showToast('加载数据失败', 'error');
        showEmpty(container, '加载失败，请刷新重试');
    }
}

/**
 * 设置标签页切换
 */
function setupSummaryTabs() {
    const tabs = document.querySelectorAll('.summary-tabs .tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            summariesState.activeTab = this.dataset.tab;
            renderSummaries();
        });
    });
}

/**
 * 渲染学期总结
 */
function renderSummaries() {
    const container = document.getElementById('summaryContent');
    const tab = summariesState.activeTab;
    const data = summariesState.summaries[tab];
    
    if (!data || data.length === 0) {
        showEmpty(container, '暂无数据');
        return;
    }
    
    switch (tab) {
        case 'papers':
            renderPapers(container, data);
            break;
        case 'submissions':
            renderSubmissions(container, data);
            break;
        case 'articles':
            renderArticles(container, data);
            break;
        case 'literature':
            renderLiterature(container, data);
            break;
        case 'theory':
            renderTheory(container, data);
            break;
    }
}

/**
 * 渲染论文发表
 */
function renderPapers(container, papers) {
    container.innerHTML = `
        <div class="summaries-list">
            ${papers.map(paper => `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${escapeHtml(paper.title)}</div>
                            <div class="card-meta">${escapeHtml(paper.author)} | ${escapeHtml(paper.journal)} | ${paper.date}</div>
                        </div>
                        <span class="tag success">已发表</span>
                    </div>
                    <div class="card-footer">
                        <button class="secondary-btn" onclick="viewPaperDetail('${paper.id}')">查看详情</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * 渲染投稿中
 */
function renderSubmissions(container, submissions) {
    container.innerHTML = `
        <div class="summaries-list">
            ${submissions.map(sub => `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${escapeHtml(sub.title)}</div>
                            <div class="card-meta">${escapeHtml(sub.author)} | ${escapeHtml(sub.journal)} | 提交于${formatDate(sub.date)}</div>
                        </div>
                        <span class="tag warning">审稿中</span>
                    </div>
                    <div class="card-footer">
                        <button class="secondary-btn" onclick="viewSubmissionDetail('${sub.id}')">查看详情</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * 渲染公众号文章
 */
function renderArticles(container, articles) {
    container.innerHTML = `
        <div class="summaries-list">
            ${articles.map(article => `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${escapeHtml(article.title)}</div>
                            <div class="card-meta">${escapeHtml(article.author)} | ${escapeHtml(article.platform)} | ${formatDate(article.date)}</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <p>阅读量：${article.views}</p>
                    </div>
                    <div class="card-footer">
                        <button class="secondary-btn" onclick="viewArticleDetail('${article.id}')">查看详情</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * 渲染文献阅读
 */
function renderLiterature(container, literature) {
    container.innerHTML = `
        <div class="summaries-list">
            ${literature.map(lit => `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${escapeHtml(lit.title)}</div>
                            <div class="card-meta">分类：${escapeHtml(lit.category)} | ${lit.count}篇文献</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <p>${escapeHtml(lit.note)}</p>
                        <p style="font-size: 12px; color: var(--text-secondary);">记录时间：${formatDate(lit.date)}</p>
                    </div>
                    <div class="card-footer">
                        <button class="secondary-btn" onclick="viewLiteratureDetail('${lit.id}')">查看详情</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * 渲染理论构念
 */
function renderTheory(container, theories) {
    container.innerHTML = `
        <div class="summaries-list">
            ${theories.map(theory => `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${escapeHtml(theory.name)}</div>
                            <div class="card-meta">领域：${escapeHtml(theory.field)}</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <p><strong>定义：</strong>${escapeHtml(theory.definition)}</p>
                        <p><strong>应用场景：</strong></p>
                        <ul style="margin-left: 20px; color: var(--text-secondary); font-size: 14px;">
                            ${theory.applications.map(app => `<li>${escapeHtml(app)}</li>`).join('')}
                        </ul>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                            记录时间：${formatDate(theory.date)}
                        </p>
                    </div>
                    <div class="card-footer">
                        <button class="secondary-btn" onclick="viewTheoryDetail('${theory.id}')">查看详情</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * 显示创建总结模态框
 */
function showCreateSummaryModal() {
    const content = `
        <form onsubmit="createSummary(event)">
            <div class="form-group">
                <label for="summaryType">类型</label>
                <select id="summaryType" required onchange="updateSummaryForm(this.value)">
                    <option value="papers">论文发表</option>
                    <option value="submissions">投稿中</option>
                    <option value="articles">公众号文章</option>
                    <option value="literature">文献阅读</option>
                    <option value="theory">理论构念</option>
                </select>
            </div>
            <div id="summaryFormFields">
                <!-- 动态表单字段 -->
            </div>
            <button type="submit" class="primary-btn">提交</button>
        </form>
    `;
    
    showModal(content, '新建学期总结');
    updateSummaryForm('papers');
}

/**
 * 更新总结表单字段
 */
function updateSummaryForm(type) {
    const fieldsContainer = document.getElementById('summaryFormFields');
    
    let fieldsHTML = '';
    
    switch (type) {
        case 'papers':
        case 'submissions':
            fieldsHTML = `
                <div class="form-group">
                    <label for="summaryTitle">标题</label>
                    <input type="text" id="summaryTitle" required placeholder="论文标题">
                </div>
                <div class="form-group">
                    <label for="summaryAuthor">作者</label>
                    <input type="text" id="summaryAuthor" required placeholder="作者姓名">
                </div>
                <div class="form-group">
                    <label for="summaryJournal">期刊</label>
                    <input type="text" id="summaryJournal" required placeholder="期刊名称">
                </div>
            `;
            break;
        case 'articles':
            fieldsHTML = `
                <div class="form-group">
                    <label for="summaryTitle">标题</label>
                    <input type="text" id="summaryTitle" required placeholder="文章标题">
                </div>
                <div class="form-group">
                    <label for="summaryAuthor">作者</label>
                    <input type="text" id="summaryAuthor" required placeholder="作者姓名">
                </div>
                <div class="form-group">
                    <label for="summaryPlatform">平台</label>
                    <input type="text" id="summaryPlatform" required placeholder="发布平台">
                </div>
            `;
            break;
        case 'literature':
            fieldsHTML = `
                <div class="form-group">
                    <label for="summaryTitle">文献集合名称</label>
                    <input type="text" id="summaryTitle" required placeholder="例如：深度学习经典论文">
                </div>
                <div class="form-group">
                    <label for="summaryCategory">分类</label>
                    <input type="text" id="summaryCategory" required placeholder="例如：机器学习">
                </div>
                <div class="form-group">
                    <label for="summaryCount">文献数量</label>
                    <input type="number" id="summaryCount" required placeholder="文献篇数" min="1">
                </div>
                <div class="form-group">
                    <label for="summaryNote">备注</label>
                    <textarea id="summaryNote" rows="3" placeholder="文献集合说明"></textarea>
                </div>
            `;
            break;
        case 'theory':
            fieldsHTML = `
                <div class="form-group">
                    <label for="summaryName">理论名称</label>
                    <input type="text" id="summaryName" required placeholder="例如：认知负荷理论">
                </div>
                <div class="form-group">
                    <label for="summaryField">所属领域</label>
                    <input type="text" id="summaryField" required placeholder="例如：教育心理学">
                </div>
                <div class="form-group">
                    <label for="summaryDefinition">定义</label>
                    <textarea id="summaryDefinition" rows="3" required placeholder="简要描述理论定义"></textarea>
                </div>
                <div class="form-group">
                    <label for="summaryApplications">应用场景（逗号分隔）</label>
                    <input type="text" id="summaryApplications" placeholder="例如：多媒体教学,材料开发">
                </div>
            `;
            break;
    }
    
    fieldsContainer.innerHTML = fieldsHTML;
}

/**
 * 创建总结
 */
async function createSummary(event) {
    event.preventDefault();
    
    const type = document.getElementById('summaryType').value;
    const title = document.getElementById('summaryTitle')?.value || '';
    
    try {
        // 实际项目中调用API
        // await summaryApi.create({ type, ...data });
        
        // 模拟创建成功
        closeModal();
        showToast('创建成功', 'success');
        loadSummaries();
    } catch (error) {
        showToast('创建失败，请重试', 'error');
    }
}

// 详情查看函数（简化实现）
function viewPaperDetail(id) {
    showToast('功能开发中', 'warning');
}

function viewSubmissionDetail(id) {
    showToast('功能开发中', 'warning');
}

function viewArticleDetail(id) {
    showToast('功能开发中', 'warning');
}

function viewLiteratureDetail(id) {
    showToast('功能开发中', 'warning');
}

function viewTheoryDetail(id) {
    showToast('功能开发中', 'warning');
}
