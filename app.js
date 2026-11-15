// Initial LMS Data Store (persisted in localStorage)
const defaultData = {
    courses: [
        { id: 1, title: "Modern Web & App Development", instructor: "Sir Rizwan", progress: "78%" },
        { id: 2, title: "Introduction to Modern AI", instructor: "Sir Bilal", progress: "65%" },
        { id: 3, title: "Database & Firebase Integration", instructor: "Miss Ayesha", progress: "90%" }
    ],
    assignments: [
        { id: 101, title: "Portfolio Website", due: "Nov 16, 2026", status: "NOT SUBMITTED", link: "", desc: "Profile picture, About, Services, Skills, Projects & Contact page." },
        { id: 102, title: "React User Student App", due: "Oct 23, 2026", status: "SUBMITTED", link: "https://github.com/aliyan/react-student-app", desc: "CRUD operations for student records in React." },
        { id: 103, title: "API Integration", due: "Oct 10, 2026", status: "APPROVED", link: "https://github.com/aliyan/api-users", desc: "Fetch users from fakestoreapi.noksha.dev/api/users." },
        { id: 104, title: "Contact List with Firebase", due: "Sep 20, 2026", status: "NOT SUBMITTED", link: "", desc: "Realtime DB add, edit, delete, and search contacts." }
    ],
    attendance: [
        { date: "Nov 12, 2026", topic: "Firebase Realtime CRUD", status: "Present" },
        { date: "Nov 10, 2026", topic: "React Hooks & State", status: "Present" },
        { date: "Nov 08, 2026", topic: "REST API Fetch & Async", status: "Absent" },
        { date: "Nov 05, 2026", topic: "JS PDF Generation", status: "Present" }
    ],
    payments: [
        { month: "November 2026", amount: "Rs. 1,000", method: "1Bill / Blinq", status: "Paid" },
        { month: "October 2026", amount: "Rs. 1,000", method: "1Bill / Blinq", status: "Paid" },
        { month: "September 2026", amount: "Rs. 1,000", method: "1Bill / Blinq", status: "Paid" }
    ],
    quizzes: [
        { id: 1, title: "JavaScript ES6 & DOM", score: "18 / 20", status: "Completed" },
        { id: 2, title: "Firebase Authentication", score: "Pending", status: "Available" }
    ]
};

let lmsData = JSON.parse(localStorage.getItem('smit_lms_data')) || defaultData;
let currentRole = 'student';
let currentTab = 'dashboard';

function saveData() {
    localStorage.setItem('smit_lms_data', JSON.stringify(lmsData));
}

// Set Date safely after DOM loads
window.addEventListener('DOMContentLoaded', () => {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.innerText = new Date().toDateString();
});

// Role Selection (Attached directly to window)
window.loginAs = function(role) {
    currentRole = role;
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('lmsContainer').classList.remove('hidden');

    const badge = document.getElementById('roleBadge');
    const uRoleText = document.getElementById('uRoleText');

    if (role === 'admin') {
        badge.innerText = 'ADMIN';
        badge.classList.add('admin-badge');
        uRoleText.innerText = 'Administrator Access';
    } else {
        badge.innerText = 'STUDENT';
        badge.classList.remove('admin-badge');
        uRoleText.innerText = 'Student ID: #SMIT-4092';
    }

    window.switchTab('dashboard');
};

window.logout = function() {
    document.getElementById('lmsContainer').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
};

// Navigation Tab Switcher
window.switchTab = function(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const titles = {
        dashboard: "Dashboard Overview",
        courses: "Enrolled Courses",
        assignments: "Assignments & Submissions",
        attendance: "Attendance Record",
        payments: "Fee Payment History",
        quizzes: "Online Quizzes"
    };
    document.getElementById('pageTitle').innerText = titles[tab];
    renderTabContent();
};

function renderTabContent() {
    const container = document.getElementById('tabContent');

    if (currentTab === 'dashboard') {
        const totalTasks = lmsData.assignments.length;
        const completedTasks = lmsData.assignments.filter(a => a.status === 'APPROVED' || a.status === 'SUBMITTED').length;
        const pendingTasks = totalTasks - completedTasks;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><h4>Enrolled Courses</h4><div class="value">${lmsData.courses.length}</div></div>
                <div class="stat-card"><h4>Total Assignments</h4><div class="value">${totalTasks}</div></div>
                <div class="stat-card"><h4>Submitted / Approved</h4><div class="value" style="color:#4ade80;">${completedTasks}</div></div>
                <div class="stat-card"><h4>Pending Tasks</h4><div class="value" style="color:#facc15;">${pendingTasks}</div></div>
            </div>

            <div class="panel-card">
                <div class="panel-header">
                    <h3>Recent Assignments (${currentRole === 'admin' ? 'Admin Review' : 'Your Tasks'})</h3>
                    <button class="btn btn-primary" onclick="switchTab('assignments')">View All</button>
                </div>
                <table>
                    <thead><tr><th>Assignment</th><th>Due Date</th><th>Status</th></tr></thead>
                    <tbody>
                        ${lmsData.assignments.slice(0, 3).map(a => `
                            <tr>
                                <td>${a.title}</td>
                                <td>${a.due}</td>
                                <td>${getStatusBadge(a.status)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (currentTab === 'courses') {
        container.innerHTML = `
            <div class="panel-card">
                <div class="panel-header">
                    <h3>Active Courses</h3>
                    ${currentRole === 'admin' ? `<button class="btn btn-primary" onclick="openAddCourseModal()">+ Add New Course</button>` : ''}
                </div>
                <table>
                    <thead><tr><th>Course Title</th><th>Instructor</th><th>Completion</th></tr></thead>
                    <tbody>
                        ${lmsData.courses.map(c => `
                            <tr>
                                <td><strong>${c.title}</strong></td>
                                <td>${c.instructor}</td>
                                <td>${c.progress}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (currentTab === 'assignments') {
        container.innerHTML = `
            <div class="panel-card">
                <div class="panel-header">
                    <h3>Assignments List</h3>
                    ${currentRole === 'admin' ? `<button class="btn btn-primary" onclick="openCreateAssignmentModal()">+ Create Assignment</button>` : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Submission Link</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lmsData.assignments.map(a => `
                            <tr>
                                <td><strong>${a.title}</strong><br><small style="color:#94a3b8;">${a.desc}</small></td>
                                <td>${a.due}</td>
                                <td>${getStatusBadge(a.status)}</td>
                                <td>${a.link ? `<a href="${a.link}" target="_blank" style="color:#38bdf8;">View Repo</a>` : '—'}</td>
                                <td>
                                    ${currentRole === 'student' 
                                        ? `<button class="btn btn-primary" onclick="openSubmitModal(${a.id})">${a.status === 'NOT SUBMITTED' ? 'Submit' : 'Edit'}</button>`
                                        : `
                                            <button class="btn btn-success" onclick="updateAssignmentStatus(${a.id}, 'APPROVED')">Approve</button>
                                            <button class="btn btn-danger" onclick="updateAssignmentStatus(${a.id}, 'REJECTED')">Reject</button>
                                          `
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (currentTab === 'attendance') {
        container.innerHTML = `
            <div class="panel-card">
                <div class="panel-header"><h3>Class Attendance</h3></div>
                <table>
                    <thead><tr><th>Date</th><th>Lecture Topic</th><th>Status</th></tr></thead>
                    <tbody>
                        ${lmsData.attendance.map(att => `
                            <tr>
                                <td>${att.date}</td>
                                <td>${att.topic}</td>
                                <td><span class="status-pill ${att.status === 'Present' ? 'status-approved' : 'status-rejected'}">${att.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (currentTab === 'payments') {
        container.innerHTML = `
            <div class="panel-card">
                <div class="panel-header"><h3>Monthly Fee Vouchers</h3></div>
                <table>
                    <thead><tr><th>Month</th><th>Fee Amount</th><th>Gateway</th><th>Status</th></tr></thead>
                    <tbody>
                        ${lmsData.payments.map(p => `
                            <tr>
                                <td>${p.month}</td>
                                <td>${p.amount}</td>
                                <td>${p.method}</td>
                                <td><span class="status-pill status-approved">${p.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (currentTab === 'quizzes') {
        container.innerHTML = `
            <div class="panel-card">
                <div class="panel-header"><h3>Module Quizzes</h3></div>
                <table>
                    <thead><tr><th>Quiz Topic</th><th>Score</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        ${lmsData.quizzes.map(q => `
                            <tr>
                                <td>${q.title}</td>
                                <td>${q.score}</td>
                                <td>${q.status}</td>
                                <td>
                                    ${q.status === 'Available' 
                                        ? `<button class="btn btn-primary" onclick="takeQuiz(${q.id})">Start Quiz</button>` 
                                        : '—'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

function getStatusBadge(status) {
    if (status === 'APPROVED') return `<span class="status-pill status-approved">APPROVED</span>`;
    if (status === 'SUBMITTED') return `<span class="status-pill status-submitted">SUBMITTED</span>`;
    if (status === 'REJECTED') return `<span class="status-pill status-rejected">REJECTED</span>`;
    return `<span class="status-pill status-pending">NOT SUBMITTED</span>`;
}

window.openSubmitModal = function(id) {
    const task = lmsData.assignments.find(a => a.id === id);
    document.getElementById('modalTitle').innerText = `Submit: ${task.title}`;
    document.getElementById('modalBody').innerHTML = `
        <label>GitHub Repository / Live Hosted URL</label>
        <input type="url" id="repoUrl" value="${task.link}" placeholder="https://github.com/username/project" required>
        <button class="btn btn-primary" style="width:100%;" onclick="submitTask(${id})">Confirm Submission</button>
    `;
    document.getElementById('modalOverlay').classList.remove('hidden');
};

window.submitTask = function(id) {
    const url = document.getElementById('repoUrl').value.trim();
    if (!url) return alert("Please enter a valid project URL.");
    lmsData.assignments = lmsData.assignments.map(a => 
        a.id === id ? { ...a, link: url, status: 'SUBMITTED' } : a
    );
    saveData();
    window.closeModal();
    renderTabContent();
};

window.updateAssignmentStatus = function(id, newStatus) {
    lmsData.assignments = lmsData.assignments.map(a => 
        a.id === id ? { ...a, status: newStatus } : a
    );
    saveData();
    renderTabContent();
};

window.openCreateAssignmentModal = function() {
    document.getElementById('modalTitle').innerText = "Create New Assignment";
    document.getElementById('modalBody').innerHTML = `
        <input type="text" id="newTaskTitle" placeholder="Assignment Title">
        <input type="text" id="newTaskDue" placeholder="Due Date (e.g., Nov 25, 2026)">
        <textarea id="newTaskDesc" rows="3" placeholder="Instructions / Description"></textarea>
        <button class="btn btn-primary" style="width:100%;" onclick="createAssignment()">Publish Assignment</button>
    `;
    document.getElementById('modalOverlay').classList.remove('hidden');
};

window.createAssignment = function() {
    const title = document.getElementById('newTaskTitle').value.trim();
    const due = document.getElementById('newTaskDue').value.trim();
    const desc = document.getElementById('newTaskDesc').value.trim();
    if (!title || !due) return alert("Title and Due Date are required.");

    lmsData.assignments.unshift({
        id: Date.now(),
        title,
        due,
        desc: desc || "Complete the task as instructed.",
        status: "NOT SUBMITTED",
        link: ""
    });
    saveData();
    window.closeModal();
    renderTabContent();
};

window.openAddCourseModal = function() {
    document.getElementById('modalTitle').innerText = "Add New Course";
    document.getElementById('modalBody').innerHTML = `
        <input type="text" id="newCourseTitle" placeholder="Course Name">
        <input type="text" id="newCourseInstructor" placeholder="Instructor Name">
        <button class="btn btn-primary" style="width:100%;" onclick="addCourse()">Add Course</button>
    `;
    document.getElementById('modalOverlay').classList.remove('hidden');
};

window.addCourse = function() {
    const title = document.getElementById('newCourseTitle').value.trim();
    const instructor = document.getElementById('newCourseInstructor').value.trim();
    if (!title || !instructor) return;

    lmsData.courses.push({
        id: Date.now(),
        title,
        instructor,
        progress: "0%"
    });
    saveData();
    window.closeModal();
    renderTabContent();
};

window.takeQuiz = function(id) {
    const ans = prompt("Quick Quiz: What does DOM stand for in JavaScript?");
    if (ans !== null) {
        lmsData.quizzes = lmsData.quizzes.map(q => 
            q.id === id ? { ...q, score: "19 / 20", status: "Completed" } : q
        );
        saveData();
        renderTabContent();
    }
};

window.closeModal = function() {
    document.getElementById('modalOverlay').classList.add('hidden');
};