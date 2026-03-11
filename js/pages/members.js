const auth = {
  // Mock user database (in production, this would be in backend)
  mockUsers: [
    { name: '张三', role: '硕士生', school: '华东师范大学', email: '111@mail.com' },
    { name: '李四', role: '博士生', school: '华东师范大学', email: '222@mail.com' },
    { name: '王教授', role: '老师', school: '华东师范大学', email: '333@mail.com' }
  ],
  
  login(name, email) {
    const user = this.mockUsers.find(u => u.name === name && u.email === email);
    if (user) {
      // In production, this would be a real JWT token from backend
      const token = btoa(JSON.stringify({ name, email, timestamp: Date.now() }));
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      app.currentState.currentUser = user;
      return { success: true, user };
    }
    return { success: false, error: '姓名或邮箱地址不正确' };
  },
  
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    app.currentState.currentUser = null;
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },
  
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Setup login form
document.getElementById('confirm-login').addEventListener('click', () => {
  const name = document.getElementById('login-name').value.trim();
  const email = document.getElementById('login-email').value.trim();
  
  if (!name || !email) {
    showError('login-error', '请填写姓名和邮箱');
    return;
  }
  
  const result = auth.login(name, email);
  if (result.success) {
    app.closeModal('login-modal');
    app.updateUserUI();
    showError('login-error', '', true); // Clear error
    document.getElementById('login-name').value = '';
    document.getElementById('login-email').value = '';
  } else {
    showError('login-error', result.error);
  }
});

// Helper function to show error messages
function showError(elementId, message, clear = false) {
  const element = document.getElementById(elementId);
  if (clear) {
    element.textContent = '';
    element.classList.add('hidden');
    return;
  }
  
  element.textContent = message;
  element.classList.remove('hidden');
}

// Export auth module
window.auth = auth;
