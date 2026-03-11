// Global state
let currentState = {
  activeTab: 'overview',
  currentUser: null,
  currentDate: new Date(),
  selectedMeeting: null,
  selectedDate: null,
  meetings: [
    {
      id: 1,
      date: '2026-01-20',
      location: '俊秀楼313',
      presenter: '张三',
      note: '王教授分享最新研究成果',
      isOnline: false,
      meetingLink: '',
      submitted: false,
      presentations: [
        { title: '深度学习在教育中的应用', presenter: '张三', tags: ['深度学习', 'AI'] },
        { title: '认知负荷理论新进展', presenter: '李四', tags: ['认知负荷', '学习理论'] }
      ]
    },
    {
      id: 2,
      date: '2026-01-13',
      location: '线上会议',
      presenter: '李四',
      note: '文献综述汇报',
      isOnline: true,
      meetingLink: 'https://meeting.tencent.com/123456789',
      submitted: true,
      presentations: [
        { title: '大语言模型与教育评估', presenter: '王五', tags: ['大语言模型', '教育评估'] }
      ]
    },
    {
      id: 3,
      date: '2026-01-06',
      location: '俊秀楼313',
      presenter: '王五',
      note: '实验进展汇报',
      isOnline: false,
      meetingLink: '',
      submitted: false,
      presentations: [
        { title: '教育数据挖掘方法综述', presenter: '张三', tags: ['数据挖掘', '机器学习'] }
      ]
    },
    {
      id: 4,
      date: '2025-12-30',
      location: '俊秀楼313',
      presenter: '赵六',
      note: '学期总结汇报',
      isOnline: false,
      meetingLink: '',
      submitted: true,
      presentations: [
        { title: '在线学习行为分析', presenter: '赵六', tags: ['在线教育', '行为分析'] }
      ]
    },
    {
      id: 5,
      date: '2025-12-23',
      location: '线上会议',
      presenter: '钱七',
      note: '研究方法分享',
      isOnline: true,
      meetingLink: 'https://meeting.tencent.com/987654321',
      submitted: false,
      presentations: [
        { title: '混合研究方法在教育中的应用', presenter: '钱七', tags: ['混合方法', '质性研究'] }
      ]
    }
  ],
  literatureData: [
    { id: 1, title: '深度学习在教育中的应用', author: '张三', type: '组会汇报', tags: ['深度学习', '教育技术', 'AI'], date: '2026-01-20' },
    { id: 2, title: '认知负荷理论新进展', author: '李四', type: '印象文献', tags: ['认知负荷', '教育心理学', '学习理论'], date: '2026-01-15' },
    { id: 3, title: '大语言模型与教育评估', author: '王五', type: '组会汇报', tags: ['大语言模型', '教育评估', 'AI'], date: '2026-01-13' },
    { id: 4, title: '社会学习理论在在线教育中的应用', author: '赵六', type: '印象文献', tags: ['社会学习理论', '在线教育', '教育心理学'], date: '2026-01-10' },
    { id: 5, title: '教育数据挖掘方法综述', author: '张三', type: '组会汇报', tags: ['数据挖掘', '教育技术', '机器学习'], date: '2026-01-06' }
  ],
  publicationsData: [
    { id: 1, title: '基于AI的教育评估系统', journal: '教育研究', level: 'CSSCI', date: '2026-01', type: '发表' },
    { id: 2, title: '智能教学系统设计', journal: '现代教育技术', date: '2026-01', type: '投稿' },
    { id: 3, title: '教育大数据分析方法', journal: '电化教育研究', level: 'CSSCI', date: '2025-12', type: '发表' },
    { id: 4, title: '在线学习行为分析', journal: '开放教育研究', date: '2025-12', type: '投稿' },
    { id: 5, title: 'AI如何改变教育模式', platform: '段门科普', views: 1200, date: '2025-11', type: '科普' }
  ],
  semesterCategories: [
    { id: 'publications', title: '发表/录用期刊', instruction: '请填写发表/录用的期刊信息（期刊名称、级别）' },
    { id: 'submissions', title: '新投稿情况', instruction: '请填写新投稿的详细信息（篇名和期刊）' },
    { id: 'literatureReports', title: '口头或书面文献报告', instruction: '请填写文献报告的详细信息（出处、报告时间、是否主动）' },
    { id: 'memorableLiterature', title: '本学期读的印象最深的文献', instruction: '请分享印象最深的文献（1-5篇；是否自己找）' },
    { id: 'newTheories', title: '本学期学习的新理论或构念', instruction: '请描述新学习的理论或构念（列出出处）' },
    { id: 'researchIdeas', title: '近期研究设想/金点子', instruction: '请阐述近期的研究设想/金点子（列1-3个）' },
    { id: 'teamBehaviors', title: '团队公民行为', instruction: '请记录团队公民行为的具体事例（如"传帮带"帮助同门学习、承担团队报销、协助审稿、组织召开例会、与导师或同门分享优质文献/研究方法、协助收集/输入/装订问卷等）' },
    { id: 'scienceArticles', title: '公众号科普文章', instruction: '请提供公众号科普文章的链接或内容（篇名、点击量）' },
    { id: 'futurePlans', title: '下半年目标和行动计划', instruction: '请制定下半年的目标和行动计划' }
  ]
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Setup tab navigation
  document.querySelectorAll('.sidebar-nav li').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // Setup login button
  document.getElementById('login-btn').addEventListener('click', () => {
    openModal('login-modal');
  });
  
  // Setup logout button
  document.getElementById('logout-btn').addEventListener('click', () => {
    auth.logout();
    updateUserUI();
  });
  
  // Initialize meetings module
  meetings.init();
  
  // Initialize semester module
  semester.init();
  
  // Initialize calendar
  meetings.renderCalendar();
  
  // Initialize literature resources
  renderLiteratureResources();
  
  // Initialize statistics
  renderStatistics();
  
  // Check for saved login state
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentState.currentUser = JSON.parse(savedUser);
    updateUserUI();
  }
});

// Tab switching
function switchTab(tabId) {
  // Update active tab in sidebar
  document.querySelectorAll('.sidebar-nav li').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
  });
  
  // Update active content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tabId}`);
  });
  
  // Update page title
  document.querySelector('.page-title').textContent = 
    tabId === 'overview' ? '功能总览' :
    tabId === 'meetings' ? '组会报告' :
    tabId === 'semester' ? '学期总结' : '反馈建议';
  
  // Update state
  currentState.activeTab = tabId;
  
  // Special handling for meetings tab (re-render calendar)
  if (tabId === 'meetings') {
    meetings.renderCalendar();
  }
}

// Update user UI based on login state
function updateUserUI() {
  const user = currentState.currentUser;
  const userInfo = document.getElementById('user-info');
  
  if (user) {
    document.querySelector('.user-name').textContent = user.name;
    document.querySelector('.user-role').textContent = `${user.role} · ${user.school}`;
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'block';
  } else {
    document.querySelector('.user-name').textContent = '游客';
    document.querySelector('.user-role').textContent = '未登录';
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'none';
  }
}

// Modal handling
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Close modals when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal.id);
    }
  });
});

// Close buttons
document.getElementById('close-login').addEventListener('click', () => closeModal('login-modal'));
document.getElementById('close-meeting').addEventListener('click', () => closeModal('meeting-modal'));
document.getElementById('cancel-login').addEventListener('click', () => closeModal('login-modal'));
document.getElementById('cancel-meeting').addEventListener('click', () => closeModal('meeting-modal'));

// Render literature resources
function renderLiteratureResources() {
  // Render tag cloud
  const tagContainer = document.getElementById('tag-container');
  const allTags = [...new Set(currentState.literatureData.flatMap(item => item.tags))];
  
  tagContainer.innerHTML = allTags.map(tag => {
    const frequency = currentState.literatureData.filter(item => item.tags.includes(tag)).length;
    const sizeClass = frequency >= 3 ? 'tag-lg' : frequency >= 2 ? 'tag-md' : '';
    return `<span class="tag ${sizeClass}" data-tag="${tag}">${tag}</span>`;
  }).join('');
  
  // Add click handlers to tags
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedTag = tag.getAttribute('data-tag');
      document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      filterLiterature(selectedTag);
    });
  });
  
  // Render literature list
  filterLiterature(null);
}

// Filter literature by tag or search
function filterLiterature(tag) {
  const searchTerm = document.getElementById('literature-search').value.toLowerCase();
  const filtered = currentState.literatureData.filter(item => {
    const matchesTag = tag ? item.tags.includes(tag) : true;
    const matchesSearch = searchTerm ? 
      item.title.toLowerCase().includes(searchTerm) ||
      item.author.toLowerCase().includes(searchTerm) ||
      item.tags.some(t => t.toLowerCase().includes(searchTerm)) :
      true;
    return matchesTag && matchesSearch;
  });
  
  renderLiteratureList(filtered);
}

// Render literature list
function renderLiteratureList(items) {
  const container = document.getElementById('literature-container');
  const count = document.getElementById('literature-count');
  
  count.textContent = `(${items.length} 篇)`;
  
  container.innerHTML = items.map(item => `
    <div class="literature-item">
      <div class="literature-title">${item.title}</div>
      <div class="literature-meta">
        <span>${item.author}</span>
        <span>${item.type}</span>
        <span>${item.date}</span>
      </div>
      <div class="literature-tags">
        ${item.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// Render statistics
function renderStatistics() {
  document.getElementById('published-count').textContent = 
    currentState.publicationsData.filter(p => p.type === '发表').length;
  document.getElementById('submitted-count').textContent = 
    currentState.publicationsData.filter(p => p.type === '投稿').length;
  document.getElementById('science-count').textContent = 
    currentState.publicationsData.filter(p => p.type === '科普').length;
}

// Export public functions
window.app = {
  switchTab,
  updateUserUI,
  openModal,
  closeModal,
  currentState
};
