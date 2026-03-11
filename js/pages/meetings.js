const meetings = {
  init() {
    // Setup create meeting button
    document.getElementById('create-meeting-btn').addEventListener('click', () => {
      if (!auth.isAuthenticated()) {
        app.openModal('login-modal');
        return;
      }
      app.openModal('meeting-modal');
    });
    
    // Setup meeting form submission
    document.getElementById('create-meeting').addEventListener('click', this.createMeeting.bind(this));
    
    // Setup online meeting toggle
    document.getElementById('is-online').addEventListener('change', (e) => {
      document.getElementById('meeting-link-group').classList.toggle('hidden', !e.target.checked);
    });
    
    // Setup calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => {
      const date = app.currentState.currentDate;
      date.setMonth(date.getMonth() - 1);
      app.currentState.currentDate = new Date(date);
      this.renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
      const date = app.currentState.currentDate;
      date.setMonth(date.getMonth() + 1);
      app.currentState.currentDate = new Date(date);
      this.renderCalendar();
    });
    
    // Setup year/month selectors
    document.getElementById('year-select').addEventListener('change', (e) => {
      const year = parseInt(e.target.value);
      const date = app.currentState.currentDate;
      date.setFullYear(year);
      app.currentState.currentDate = new Date(date);
      this.renderCalendar();
    });
    
    document.getElementById('month-select').addEventListener('change', (e) => {
      const month = parseInt(e.target.value);
      const date = app.currentState.currentDate;
      date.setMonth(month);
      app.currentState.currentDate = new Date(date);
      this.renderCalendar();
    });
    
    // Setup submission form buttons
    document.getElementById('select-files-btn').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });
    
    document.getElementById('file-input').addEventListener('change', (e) => {
      this.handleFileSelect(e.target.files);
    });
    
    document.getElementById('cancel-submit').addEventListener('click', () => {
      document.getElementById('submission-form').classList.add('hidden');
      app.currentState.selectedMeeting = null;
    });
    
    document.getElementById('confirm-submit').addEventListener('click', () => {
      this.submitMaterials();
    });
    
    // Initial render
    this.renderMeetings();
  },
  
  renderMeetings() {
    // Sort meetings by date (newest first)
    const sortedMeetings = [...app.currentState.meetings].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Get recent meetings (last 3)
    const recentMeetings = sortedMeetings.slice(0, 3);
    
    const container = document.getElementById('meetings-container');
    container.innerHTML = recentMeetings.map(meeting => `
      <div class="meeting-item ${app.currentState.selectedMeeting?.id === meeting.id ? 'selected' : ''}" 
           data-id="${meeting.id}">
        <div class="meeting-header">
          <div>
            <div class="meeting-date">
              <i class='bx bx-calendar'></i>
              <span>${meeting.date}</span>
            </div>
            <div class="meeting-location">
              <i class='bx bx-map'></i>
              <span>${meeting.location}</span>
            </div>
          </div>
          <button class="btn-submit ${meeting.submitted ? 'disabled' : ''}" 
                  ${meeting.submitted ? 'disabled' : ''}>
            ${meeting.submitted ? '已提交' : '提交材料'}
          </button>
        </div>
        <div class="meeting-meta">
          <span>汇报人: ${meeting.presenter}</span>
          ${meeting.note ? `<span>· ${meeting.note}</span>` : ''}
        </div>
      </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.meeting-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.btn-submit')) return;
        
        const meetingId = parseInt(item.getAttribute('data-id'));
        const meeting = app.currentState.meetings.find(m => m.id === meetingId);
        
        if (meeting) {
          app.currentState.selectedMeeting = meeting;
          this.renderSelectedMeeting(meeting);
          
          // Highlight selected meeting
          document.querySelectorAll('.meeting-item').forEach(el => 
            el.classList.remove('selected')
          );
          item.classList.add('selected');
        }
      });
    });
    
    document.querySelectorAll('.btn-submit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!auth.isAuthenticated()) {
          app.openModal('login-modal');
          return;
        }
        
        const meetingId = parseInt(btn.closest('.meeting-item').getAttribute('data-id'));
        const meeting = app.currentState.meetings.find(m => m.id === meetingId);
        
        if (meeting && !meeting.submitted) {
          app.currentState.selectedMeeting = meeting;
          this.showSubmissionForm(meeting);
        }
      });
    });
  },
  
  renderSelectedMeeting(meeting) {
    const infoElement = document.getElementById('selected-meeting-info');
    const dateElement = document.getElementById('selected-meeting-date');
    const detailElement = document.getElementById('selected-meeting-detail');
    const submitBtn = document.getElementById('submit-materials-btn');
    
    dateElement.textContent = `${meeting.date} - ${meeting.location}`;
    detailElement.textContent = `汇报人: ${meeting.presenter}${meeting.note ? ` | 备注: ${meeting.note}` : ''}`;
    submitBtn.disabled = meeting.submitted;
    submitBtn.textContent = meeting.submitted ? '已提交' : '提交材料';
    
    infoElement.classList.remove('hidden');
    
    // Setup submit button
    submitBtn.onclick = () => {
      if (!auth.isAuthenticated()) {
        app.openModal('login-modal');
        return;
      }
      
      if (!meeting.submitted) {
        this.showSubmissionForm(meeting);
      }
    };
  },
  
  showSubmissionForm(meeting) {
    document.getElementById('submission-meeting-info').textContent = 
      `${meeting.date} - ${meeting.location}`;
    document.getElementById('submission-presenter-info').textContent = 
      `汇报人: ${meeting.presenter}${meeting.note ? ` | 备注: ${meeting.note}` : ''}`;
    
    document.getElementById('submission-form').classList.remove('hidden');
    document.getElementById('tab-meetings').scrollTo({ top: 0, behavior: 'smooth' });
  },
  
  handleFileSelect(files) {
    const fileList = document.getElementById('file-list');
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
  
  submitMaterials() {
    if (!auth.isAuthenticated()) {
      app.openModal('login-modal');
      return;
    }
    
    const meeting = app.currentState.selectedMeeting;
    if (!meeting) return;
    
    // In production, this would upload files to OSS and save metadata to backend
    console.log('Submitting materials for meeting:', meeting.id);
    console.log('Files:', document.querySelectorAll('.file-item').length);
    console.log('Tags:', document.getElementById('tags-input').value);
    
    // Mark as submitted
    const index = app.currentState.meetings.findIndex(m => m.id === meeting.id);
    if (index !== -1) {
      app.currentState.meetings[index].submitted = true;
      this.renderMeetings();
      this.renderSelectedMeeting(app.currentState.meetings[index]);
    }
    
    // Hide form
    document.getElementById('submission-form').classList.add('hidden');
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('tags-input').value = '';
    
    // Show success message (in production, use a toast notification)
    alert('材料提交成功！');
  },
  
  createMeeting() {
    const date = document.getElementById('meeting-date').value;
    const location = document.getElementById('meeting-location').value;
    const presenter = document.getElementById('meeting-presenter').value;
    const note = document.getElementById('meeting-note').value;
    const isOnline = document.getElementById('is-online').checked;
    const meetingLink = document.getElementById('meeting-link').value;
    
    if (!date || !location || !presenter) {
      alert('请填写日期、地点和汇报人');
      return;
    }
    
    const newMeeting = {
      id: Date.now(),
      date,
      location,
      presenter,
      note,
      isOnline,
      meetingLink: isOnline ? meetingLink : '',
      submitted: false,
      presentations: []
    };
    
    app.currentState.meetings.unshift(newMeeting);
    this.renderMeetings();
    this.renderCalendar();
    
    // Close modal and reset form
    app.closeModal('meeting-modal');
    document.getElementById('meeting-date').value = '';
    document.getElementById('meeting-location').value = '';
    document.getElementById('meeting-presenter').value = '';
    document.getElementById('meeting-note').value = '';
    document.getElementById('is-online').checked = false;
    document.getElementById('meeting-link').value = '';
    document.getElementById('meeting-link-group').classList.add('hidden');
  },
  
  renderCalendar() {
    const date = app.currentState.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Update month display
    document.getElementById('current-month').textContent = `${year}年${month + 1}月`;
    document.getElementById('year-select').value = year.toString();
    document.getElementById('month-select').value = month.toString();
    
    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    // Get meeting dates
    const meetingDates = app.currentState.meetings.map(m => m.date);
    
    // Generate calendar days
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';
    
    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      this.addCalendarDay(calendarDays, day, false, meetingDates.includes(dateStr), dateStr);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      this.addCalendarDay(
        calendarDays, 
        day, 
        true, 
        meetingDates.includes(dateStr), 
        dateStr,
        isToday
      );
    }
    
    // Next month days
    const totalCells = 42; // 6 rows x 7 days
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month + 1;
      const nextYear = nextMonth > 11 ? year + 1 : year;
      const actualNextMonth = nextMonth > 11 ? 0 : nextMonth;
      const dateStr = `${nextYear}-${String(actualNextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      this.addCalendarDay(calendarDays, i, false, meetingDates.includes(dateStr), dateStr);
    }
  },
  
  addCalendarDay(container, day, isCurrentMonth, hasMeeting, dateStr, isToday = false) {
    const dayEl = document.createElement('div');
    dayEl.className = `calendar-day ${isCurrentMonth ? '' : 'other-month'} ${hasMeeting ? 'has-meeting' : ''} ${isToday ? 'today' : ''}`;
    dayEl.textContent = day;
    
    if (hasMeeting) {
      dayEl.addEventListener('click', () => {
        // Find meeting for this date
        const meeting = app.currentState.meetings.find(m => m.date === dateStr);
        if (meeting) {
          app.currentState.selectedDate = dateStr;
          app.currentState.selectedMeeting = meeting;
          
          // Update UI
          document.querySelectorAll('.calendar-day').forEach(el => 
            el.classList.remove('selected')
          );
          dayEl.classList.add('selected');
          
          this.renderSelectedMeeting(meeting);
          
          // Scroll to selected meeting info
          document.getElementById('selected-meeting-info').scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    
    container.appendChild(dayEl);
  }
};

// Export meetings module
window.meetings = meetings;
