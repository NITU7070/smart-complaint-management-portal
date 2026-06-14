/* ===== THEME ===== */
function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.querySelector('.theme-icon').textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    if (window._barChart) window._barChart.update();
    if (window._donutChart) window._donutChart.update();
  }
  
  (function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    const icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = saved === 'dark' ? '☀️' : '🌙';
  })();
  
  /* ===== NAVIGATION ===== */
  function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const links = document.querySelectorAll('.nav-link');
    const order = ['home','submit','track','dashboard','analytics'];
    const idx = order.indexOf(id);
    if (idx > -1) links[idx]?.classList.add('active');
    window.scrollTo(0, 0);
    if (id === 'analytics') setTimeout(initCharts, 100);
    if (id === 'dashboard') renderDashboardTable();
  }
  
  function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('open');
  }
  
  /* ===== DEPT ROUTING ===== */
  const deptMap = {
    water: '💧 Water & Sanitation Dept.',
    electricity: '⚡ Electrical Department',
    roads: '🛣️ Roads & Transport Dept.',
    healthcare: '🏥 Health Services Dept.',
    education: '📚 Education Department',
    police: '🚔 Police Commissioner\'s Office',
    revenue: '📋 Revenue & Land Records',
    environment: '🌿 Environment Department',
    other: '📨 General Grievance Cell'
  };
  
  function updateDeptPreview() {
    const val = document.getElementById('category').value;
    const el = document.getElementById('deptPreview');
    if (val && deptMap[val]) {
      el.textContent = deptMap[val];
      el.classList.add('assigned');
    } else {
      el.textContent = 'Select a category to see assignment';
      el.classList.remove('assigned');
    }
  }
  
  /* ===== ANONYMOUS TOGGLE ===== */
  function toggleAnon() {
    const checked = document.getElementById('anonCheck').checked;
    document.getElementById('personalFields').style.display = checked ? 'none' : 'block';
  }
  
  /* ===== CHAR COUNT ===== */
  document.getElementById('description')?.addEventListener('input', function() {
    const n = this.value.length;
    document.getElementById('charCount').textContent = n;
    if (n > 900) document.getElementById('charCount').style.color = '#b91c1c';
    else document.getElementById('charCount').style.color = '';
  });
  
  /* ===== FILE HANDLING ===== */
  let uploadedFiles = [];
  
  function handleFileSelect(e) {
    addFiles(Array.from(e.target.files));
  }
  
  function handleDrop(e) {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  }
  
  function addFiles(files) {
    files.forEach(f => {
      if (f.size > 10 * 1024 * 1024) { alert(`${f.name} exceeds 10 MB limit.`); return; }
      uploadedFiles.push(f);
    });
    renderFileList();
  }
  
  function renderFileList() {
    const el = document.getElementById('fileList');
    el.innerHTML = uploadedFiles.map((f, i) => `
      <div class="file-item">
        📎 ${f.name} (${(f.size/1024).toFixed(0)} KB)
        <button onclick="removeFile(${i})">✕</button>
      </div>`).join('');
  }
  
  function removeFile(i) {
    uploadedFiles.splice(i, 1);
    renderFileList();
  }
  
  /* ===== FORM VALIDATION & SUBMIT ===== */
  function validate(id, errId, msg) {
    const el = document.getElementById(id);
    const val = el?.value?.trim();
    if (!val) {
      document.getElementById(errId).textContent = msg;
      el?.classList.add('invalid');
      return false;
    }
    document.getElementById(errId).textContent = '';
    el?.classList.remove('invalid');
    return true;
  }
  
  function submitComplaint(e) {
    e.preventDefault();
    const isAnon = document.getElementById('anonCheck').checked;
    let ok = true;
  
    if (!isAnon) {
      ok = validate('fullName', 'err-name', 'Full name is required.') && ok;
      const emailEl = document.getElementById('email');
      if (!emailEl.value || !/^\S+@\S+\.\S+$/.test(emailEl.value)) {
        document.getElementById('err-email').textContent = 'Valid email is required.';
        emailEl.classList.add('invalid');
        ok = false;
      } else {
        document.getElementById('err-email').textContent = '';
        emailEl.classList.remove('invalid');
      }
    }
  
    ok = validate('category', 'err-cat', 'Please select a category.') && ok;
    ok = validate('location', 'err-loc', 'Location is required.') && ok;
    ok = validate('subject', 'err-sub', 'Subject is required.') && ok;
  
    const desc = document.getElementById('description').value.trim();
    if (desc.length < 20) {
      document.getElementById('err-desc').textContent = 'Please describe the issue in at least 20 characters.';
      document.getElementById('description').classList.add('invalid');
      ok = false;
    } else {
      document.getElementById('err-desc').textContent = '';
      document.getElementById('description').classList.remove('invalid');
    }
  
    if (!ok) return;
  
    const id = generateTrackingId();
    document.getElementById('modalTrackingId').textContent = id;
    document.getElementById('successModal').classList.add('open');
    storeComplaint(id);
  }
  
  function generateTrackingId() {
    const n = String(Math.floor(10000 + Math.random() * 90000));
    return `NS-2025-${n}`;
  }
  
  function storeComplaint(id) {
    const complaints = JSON.parse(localStorage.getItem('ns_complaints') || '[]');
    complaints.push({
      id,
      subject: document.getElementById('subject')?.value || 'Submitted complaint',
      category: document.getElementById('category')?.value || 'other',
      location: document.getElementById('location')?.value || '',
      priority: document.getElementById('priority')?.value || 'medium',
      status: 'open',
      submittedAt: new Date().toISOString()
    });
    localStorage.setItem('ns_complaints', JSON.stringify(complaints));
  }
  
  function closeModal() {
    document.getElementById('successModal').classList.remove('open');
  }
  
  function copyTrackingId() {
    const id = document.getElementById('modalTrackingId').textContent;
    navigator.clipboard.writeText(id).then(() => alert('Tracking ID copied!'));
  }
  
  function resetForm() {
    document.getElementById('complaintForm').reset();
    uploadedFiles = [];
    document.getElementById('fileList').innerHTML = '';
    document.getElementById('charCount').textContent = '0';
    updateDeptPreview();
    document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    document.querySelectorAll('.invalid').forEach(e => e.classList.remove('invalid'));
  }
  
  /* ===== TRACK COMPLAINT ===== */
  const demoComplaints = {
    'NS-2025-08841': {
      id: 'NS-2025-08841',
      subject: 'Water supply disruption — Sector 14',
      dept: 'Water & Sanitation',
      loc: 'Sector 14, Lucknow',
      sla: '3 days left',
      slaClass: 'sla-ok',
      priority: 'High',
      status: 'inprogress',
      statusLabel: 'In Progress',
      timeline: [
        { done: true, icon: '✓', action: 'Complaint submitted', meta: 'Jan 14, 2025 · 09:22 AM', note: null },
        { done: true, icon: '✓', action: 'Acknowledged by system', meta: 'Jan 14, 2025 · 09:23 AM', note: null },
        { done: true, icon: '✓', action: 'Assigned — Water & Sanitation Dept.', meta: 'Jan 14, 2025 · 11:05 AM', note: 'SLA set: 3 business days (Priority: High)' },
        { done: false, active: true, icon: '●', action: 'Field inspection scheduled', meta: 'Jan 15, 2025 · In progress', note: 'Officer Ramesh Gupta assigned. Site visit on Jan 16.' },
        { done: false, icon: '○', action: 'Resolution', meta: 'Pending', note: null }
      ]
    },
    'NS-2025-07723': {
      id: 'NS-2025-07723',
      subject: 'Street light not working near Park Road',
      dept: 'Electricity Department',
      loc: 'Park Road, Lucknow',
      sla: 'Resolved on time',
      slaClass: 'sla-ok',
      priority: 'Medium',
      status: 'resolved',
      statusLabel: 'Resolved',
      showFeedback: true,
      timeline: [
        { done: true, icon: '✓', action: 'Complaint submitted', meta: 'Jan 10, 2025 · 07:14 PM', note: null },
        { done: true, icon: '✓', action: 'Assigned — Electrical Department', meta: 'Jan 10, 2025 · 07:15 PM', note: null },
        { done: true, icon: '✓', action: 'Work order raised', meta: 'Jan 11, 2025 · 10:00 AM', note: 'Work order #WO-2025-441 created.' },
        { done: true, icon: '✓', action: 'Repair completed', meta: 'Jan 13, 2025 · 03:45 PM', note: 'Faulty bulb replaced. Light operational.' },
        { done: true, icon: '✓', action: 'Closed', meta: 'Jan 13, 2025 · 04:00 PM', note: null }
      ]
    },
    'NS-2025-06614': {
      id: 'NS-2025-06614',
      subject: 'Garbage not collected for 5 days',
      dept: 'Environment Department',
      loc: 'Civil Lines, Lucknow',
      sla: 'SLA BREACHED',
      slaClass: 'sla-breach',
      priority: 'Urgent',
      status: 'escalated',
      statusLabel: 'Escalated',
      timeline: [
        { done: true, icon: '✓', action: 'Complaint submitted', meta: 'Jan 8, 2025 · 08:30 AM', note: null },
        { done: true, icon: '✓', action: 'Assigned — Environment Dept.', meta: 'Jan 8, 2025 · 08:31 AM', note: 'SLA: 24 hours (Urgent)' },
        { done: true, icon: '✓', action: 'Assigned to sanitation worker', meta: 'Jan 8, 2025 · 10:00 AM', note: null },
        { done: true, escalated: true, icon: '!', action: 'Escalated — SLA breached', meta: 'Jan 9, 2025 · 08:31 AM', note: 'Auto-escalated to Zonal Director after SLA breach.' },
        { done: false, active: true, icon: '●', action: 'Director review in progress', meta: 'Ongoing', note: null }
      ]
    }
  };
  
  function loadDemo(id) {
    document.getElementById('trackInput').value = id;
    trackComplaint();
  }
  
  function trackComplaint() {
    const input = document.getElementById('trackInput').value.trim().toUpperCase();
    const el = document.getElementById('trackResult');
  
    const local = JSON.parse(localStorage.getItem('ns_complaints') || '[]').find(c => c.id === input.toUpperCase());
  
    if (demoComplaints[input]) {
      renderTrackResult(demoComplaints[input]);
      el.classList.remove('hidden');
    } else if (local) {
      renderTrackResult({
        id: local.id,
        subject: local.subject,
        dept: deptMap[local.category]?.replace(/^[^ ]+ /, '') || 'General Grievance Cell',
        loc: local.location,
        sla: 'Pending assignment',
        slaClass: 'sla-warn',
        priority: local.priority.charAt(0).toUpperCase() + local.priority.slice(1),
        status: 'open',
        statusLabel: 'Open',
        timeline: [{ done: true, icon: '✓', action: 'Complaint submitted', meta: new Date(local.submittedAt).toLocaleString(), note: null },
                   { done: false, active: true, icon: '●', action: 'Awaiting department assignment', meta: 'Processing...', note: null }]
      });
      el.classList.remove('hidden');
    } else {
      alert('No complaint found with ID: ' + input + '. Try the demo IDs below.');
    }
  }
  
  function renderTrackResult(c) {
    document.getElementById('tc-id').textContent = c.id;
    document.getElementById('tc-subject').textContent = c.subject;
    document.getElementById('tc-dept').textContent = c.dept;
    document.getElementById('tc-loc').textContent = c.loc;
    const slaEl = document.getElementById('tc-sla');
    slaEl.textContent = c.sla;
    slaEl.className = c.slaClass;
    document.getElementById('tc-priority').textContent = c.priority;
  
    const badge = document.getElementById('tc-status');
    badge.textContent = c.statusLabel;
    badge.className = 'status-badge ' + c.status;
  
    const tl = document.getElementById('trackTimeline');
    tl.innerHTML = c.timeline.map(t => `
      <div class="tl-item">
        <div class="tl-dot ${t.done && !t.escalated ? 'done' : ''} ${t.active ? 'active' : ''} ${t.escalated ? 'escalated' : ''}">${t.icon}</div>
        <div class="tl-content">
          <div class="tl-action">${t.action}</div>
          <div class="tl-meta">${t.meta}</div>
          ${t.note ? `<div class="tl-note">${t.note}</div>` : ''}
        </div>
      </div>`).join('');
  
    const feedbackBtn = document.getElementById('feedbackBtn');
    feedbackBtn.style.display = c.showFeedback ? 'inline-block' : 'none';
    document.getElementById('feedbackSection').classList.add('hidden');
  }
  
  function escalateComplaint() {
    alert('Escalation request submitted. The complaint will be reviewed by a senior officer within 4 hours.');
  }
  
  function addNote() {
    const note = prompt('Add a note or additional information to your complaint:');
    if (note) alert('Note added successfully: "' + note + '"');
  }
  
  function showFeedback() {
    document.getElementById('feedbackSection').classList.remove('hidden');
  }
  
  let selectedRating = 0;
  
  function setRating(n) {
    selectedRating = n;
    document.querySelectorAll('#starRating span').forEach((s, i) => {
      s.classList.toggle('active', i < n);
    });
  }
  
  function submitFeedback() {
    if (!selectedRating) { alert('Please select a star rating.'); return; }
    alert(`Thank you! Rating of ${selectedRating}/5 submitted. Your feedback helps us improve.`);
    document.getElementById('feedbackSection').classList.add('hidden');
  }
  
  /* ===== DASHBOARD TABLE ===== */
  const sampleComplaints = [
    { id: 'NS-2025-08841', subject: 'Water supply disruption', priority: 'high', sla: '3 days', status: 'inprogress', assignee: 'R. Gupta' },
    { id: 'NS-2025-08790', subject: 'Sewer overflow on main road', priority: 'urgent', sla: '⚠️ 2 hrs', status: 'escalated', assignee: 'A. Singh' },
    { id: 'NS-2025-08755', subject: 'No water supply for 3 days', priority: 'high', sla: '1 day', status: 'open', assignee: 'Unassigned' },
    { id: 'NS-2025-08712', subject: 'Pipeline leakage near school', priority: 'urgent', sla: 'Resolved', status: 'resolved', assignee: 'P. Sharma' },
    { id: 'NS-2025-08680', subject: 'Low water pressure complaint', priority: 'medium', sla: '6 days', status: 'open', assignee: 'M. Khan' },
    { id: 'NS-2025-08640', subject: 'Billing discrepancy — Q3', priority: 'low', sla: '12 days', status: 'inprogress', assignee: 'S. Verma' },
    { id: 'NS-2025-08611', subject: 'Contaminated water supply', priority: 'urgent', sla: 'Resolved', status: 'resolved', assignee: 'R. Gupta' },
  ];
  
  const statusLabels = { open: 'Open', inprogress: 'In Progress', resolved: 'Resolved', escalated: 'Escalated' };
  
  function renderDashboardTable() {
    const statusFilter = document.getElementById('deptFilter')?.value || 'all';
    const sortBy = document.getElementById('sortFilter')?.value || 'newest';
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  
    let data = [...sampleComplaints];
    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter);
    if (sortBy === 'priority') data.sort((a,b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    else if (sortBy === 'oldest') data.reverse();
  
    const tbody = document.getElementById('complaintsTableBody');
    tbody.innerHTML = data.map(c => `
      <tr>
        <td style="font-family:'Courier New',monospace;font-size:0.78rem">${c.id}</td>
        <td style="max-width:220px">${c.subject}</td>
        <td><span class="priority-badge p-${c.priority}">${c.priority}</span></td>
        <td style="font-size:0.8rem">${c.sla}</td>
        <td><span class="status-badge ${c.status}">${statusLabels[c.status]}</span></td>
        <td style="font-size:0.82rem">${c.assignee}</td>
        <td>
          <button class="action-btn" onclick="viewComplaint('${c.id}')">View</button>
          ${c.status !== 'resolved' ? `<button class="action-btn resolve" onclick="resolveComplaint('${c.id}')">Resolve</button>` : ''}
        </td>
      </tr>`).join('');
  }
  
  function filterComplaints() { renderDashboardTable(); }
  
  function viewComplaint(id) {
    loadDemo(id);
    showPage('track');
  }
  
  function resolveComplaint(id) {
    if (confirm(`Mark complaint ${id} as resolved?`)) {
      alert(`Complaint ${id} marked as resolved. Citizen notification sent.`);
      renderDashboardTable();
    }
  }
  
  /* ===== ANALYTICS CHARTS ===== */
  function getChartColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      text: isDark ? '#9aabc4' : '#4a5568',
      border: isDark ? '#2d3752' : '#dde2ef',
      surface: isDark ? '#1e2535' : '#f0f2f8',
      blue: '#1a56a0',
      accent: '#d4401a',
    };
  }
  
  function initCharts() {
    const colors = getChartColors();
  
    if (window._barChart) window._barChart.destroy();
    if (window._donutChart) window._donutChart.destroy();
  
    const barCtx = document.getElementById('barChart')?.getContext('2d');
    if (barCtx) {
      window._barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
          datasets: [
            {
              label: 'Filed',
              data: [1840, 2110, 1950, 2340, 2600, 2280],
              backgroundColor: colors.blue + '33',
              borderColor: colors.blue,
              borderWidth: 1.5,
              borderRadius: 4,
            },
            {
              label: 'Resolved',
              data: [1720, 2050, 1890, 2200, 2510, 2190],
              backgroundColor: '#15803d33',
              borderColor: '#15803d',
              borderWidth: 1.5,
              borderRadius: 4,
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: colors.text, font: { family: 'Inter', size: 12 }, boxWidth: 14 } }
          },
          scales: {
            x: { ticks: { color: colors.text }, grid: { color: colors.border } },
            y: { ticks: { color: colors.text }, grid: { color: colors.border } }
          }
        }
      });
    }
  
    const donutCtx = document.getElementById('donutChart')?.getContext('2d');
    if (donutCtx) {
      window._donutChart = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: ['Water', 'Roads', 'Electricity', 'Health', 'Education', 'Other'],
          datasets: [{
            data: [28, 22, 18, 12, 9, 11],
            backgroundColor: ['#1a56a0','#d4401a','#f59e0b','#15803d','#7c3aed','#6b7280'],
            borderWidth: 2,
            borderColor: colors.surface,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { color: colors.text, font: { family: 'Inter', size: 11 }, boxWidth: 12, padding: 12 } }
          },
          cutout: '62%'
        }
      });
    }
  
    const depts = [
      { name: 'Water & Sanitation', pct: 94 },
      { name: 'Electricity', pct: 97 },
      { name: 'Roads & Transport', pct: 91 },
      { name: 'Healthcare', pct: 99 },
      { name: 'Education', pct: 88 },
    ];
  
    document.getElementById('deptPerfList').innerHTML = depts.map(d => `
      <div class="dept-perf-item">
        <div class="dpn"><span>${d.name}</span><span>${d.pct}%</span></div>
        <div class="dept-bar"><div class="dept-fill" style="width:${d.pct}%"></div></div>
      </div>`).join('');
  }
  
  /* ===== INIT ===== */
  document.addEventListener('DOMContentLoaded', () => {
    renderDashboardTable();
  });