const semester = {
  init() {
    // Render categories
    this.renderCategories();
    
    // Setup category click handlers
    document.querySelectorAll('.semester-category').forEach(category => {
      category.addEventListener('click', () => {
        const categoryId = category.getAttribute('data-id');
        this.showSubmissionForm(categoryId);
      });
    });
    
    // Setup submission form buttons
    document.getElementById('select-semester-files').addEventListener('click', () => {
      document.getElementById('semester-file-input').click();
    });
    
    document.getElementById('semester-file-input').addEventListener('change', (e) => {
      this.handleFileSelect(e.target.files);
    });
    
    document.getElementById('cancel-semester').addEventListener('click', () => {
      document.getElementById('semester-submission').classList.add('hidden');
    });
    
    document.getElementById('submit-semester').addEventListener('click', () => {
      this.submitSummary();
    });
  },
  
  renderCategories() {
    const container = document.getElementById('semester-categories');
    container.innerHTML = app.currentState.semesterCategories.map(category => `
      <div class="semester-category" data-id="${category.id}">
        <div class="category-tag"></div>
        <div class="category-title">${category.title}</div>
        <div class="category-hint">点击查看详情或提交</div>
      </div>
    `).join('');
  },
  
  showSubmissionForm(categoryId) {
    if (!auth.isAuthenticated()) {
      app.openModal('login-modal');
      return;
    }
    
    const category = app.currentState.semesterCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    document.getElementById('submission-title').textContent = category.title;
    document.getElementById('submission-instruction').textContent = category.instruction;
    document.getElementById('semester-text').value = '';
    document.getElementById('semester-file-list').innerHTML = '';
    
    document.getElementById('semester-submission').classList.remove('hidden');
    document.getElementById('tab-semester').scrollTo({ top: 0, behavior: 'smooth' });
  },
  
  handleFileSelect(files) {
    const fileList = document.getElementById('semester-file-list');
    Array.from(files).forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <span>${file.name}</span>
        <button class="file-remove" data-file="${file.name}">×</button>
      `;
      fileList.appendChild(fileItem);
    });
    
    // Setup remove buttons
    document.querySelectorAll('.file-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.file-item').remove();
      });
    });
  },
  
  submitSummary() {
    if (!auth.isAuthenticated()) {
      app.openModal('login-modal');
      return;
    }
    
    const text = document.getElementById('semester-text').value.trim();
    const files = document.querySelectorAll('#semester-file-list .file-item');
    
    if (!text && files.length === 0) {
      alert('请至少填写内容或上传附件');
      return;
    }
    
    // In production, this would upload files to OSS and save metadata to backend
    console.log('Submitting semester summary:', {
      category: document.getElementById('submission-title').textContent,
      text,
      fileCount: files.length
    });
    
    // Hide form and show success
    document.getElementById('semester-submission').classList.add('hidden');
    alert('学期总结提交成功！');
  }
};

// Export semester module
window.semester = semester;
