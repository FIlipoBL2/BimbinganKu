document.addEventListener('DOMContentLoaded', function () {

    // --- CONFIG ---
    const dayMap = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };
    let schedules = {};
    let weeklySchedules = [];
    let selectedDate = new Date();
    let currentFilter = 'all';
    let currentListFilter = 'all';

    const codeField = document.getElementById('user-id');
    const lecturerCode = codeField ? codeField.value : null;

    // Elements
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const weeklyTableBody = document.getElementById('schedule-body');
    const filterSelect = document.getElementById('student-schedule-filter');
    const listFilterSelect = document.getElementById('list-student-filter');

    // List & Tab Elements
    const upcomingList = document.getElementById('upcoming-list');
    const historyList = document.getElementById('history-list');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Modal Elements
    const sessionModal = document.getElementById('session-modal');
    const sessionModalTitle = document.getElementById('modal-title') || document.querySelector('#session-modal h3');
    const closeBtn = sessionModal ? sessionModal.querySelector('.close-btn') : null;
    const sessionForm = document.getElementById('session-form');
    const saveSessionBtn = document.getElementById('save-session-btn');
    const sessionIdField = document.getElementById('session-id');
    const studentSelect = document.getElementById('session-student');
    const addSessionBtn = document.getElementById('add-session-btn');
    const deleteSessionBtn = document.getElementById('delete-session-btn');

    // Time Restriction
    const timeInput = document.getElementById('session-time');
    if (timeInput) {
        timeInput.min = "07:00";
        timeInput.max = "19:00";
        timeInput.step = "3600";
    }

    // FIX: Hide Topic Input
    const topicInput = document.getElementById('session-topic');
    if (topicInput) {
        topicInput.style.display = 'none';
        topicInput.removeAttribute('required');
        const topicLabel = document.querySelector('label[for="session-topic"]');
        if (topicLabel) topicLabel.style.display = 'none';
    }

    // --- INIT ---
    if (lecturerCode) {
        console.log("Loaded Lecturer JS for Code:", lecturerCode);
        fetchStudents().then(() => {
            fetchSchedules();
        });
    }

    renderCalendar(selectedDate);

    // --- HELPERS ---
    function toLocalDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function isPast(dateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        const parts = dateStr.split('-');
        target.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return target < today;
    }

    // --- TABS LOGIC ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            if (targetId === 'upcoming') {
                document.getElementById('upcoming-tab').classList.add('active');
            } else {
                document.getElementById('history-tab').classList.add('active');
            }
        });
    });

    // --- 1. FETCH STUDENTS ---
    function fetchStudents() {
        return fetch(`/api/lecturer/students/${lecturerCode}`)
            .then(res => res.json())
            .then(students => {
                if (filterSelect) filterSelect.innerHTML = '<option value="all">All Students</option>';
                if (listFilterSelect) listFilterSelect.innerHTML = '<option value="all">All Students</option>';
                if (studentSelect) studentSelect.innerHTML = '<option value="" disabled selected>Select Student</option>';

                students.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s.npm;
                    opt.textContent = `${s.name} (${s.npm})`;
                    if (filterSelect) filterSelect.appendChild(opt);

                    const opt2 = opt.cloneNode(true);
                    if (listFilterSelect) listFilterSelect.appendChild(opt2);

                    if (studentSelect) {
                        const modalOpt = document.createElement('option');
                        modalOpt.value = s.npm;
                        modalOpt.textContent = `${s.name} (${s.npm})`;
                        studentSelect.appendChild(modalOpt);
                    }
                });
            })
            .catch(err => console.error("Error loading students:", err));
    }

    // --- 2. FILTERS ---
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            const startOfWeek = new Date(selectedDate);
            startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
            renderWeeklySchedule(startOfWeek);
            renderCalendar(selectedDate);
        });
    }

    if (listFilterSelect) {
        listFilterSelect.addEventListener('change', (e) => {
            currentListFilter = e.target.value;
            renderLists();
        });
    }

    function matchesFilter(session) {
        if (currentFilter === 'all') return true;
        let sNpm = session.studentNpm || session.studentnpm;
        return sNpm === currentFilter;
    }

    function matchesListFilter(session) {
        if (currentListFilter === 'all') return true;
        let sNpm = session.studentNpm || session.studentnpm;
        return sNpm === currentListFilter;
    }

    // --- 3. FETCH SCHEDULES ---
    function fetchSchedules() {
        const url = `/api/lecturer/schedule/${lecturerCode}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Schedule data:", data);
                schedules = {};
                weeklySchedules = [];

                data.forEach(session => {
                    if (session.date) {
                        const dateStr = session.date;
                        if (!schedules[dateStr]) schedules[dateStr] = [];
                        schedules[dateStr].push(session);
                    } else if (session.day_name && dayMap[session.day_name] !== undefined) {
                        session.dayIndex = dayMap[session.day_name];
                        weeklySchedules.push(session);
                    }
                });
                renderCalendar(selectedDate);
                renderLists();
                selectDate(selectedDate);
            })
            .catch(error => console.error('Error fetching schedules:', error));
    }

    // --- 4. RENDER LISTS ---
    function renderLists() {
        if (!upcomingList || !historyList) return;
        upcomingList.innerHTML = '';
        historyList.innerHTML = '';

        let allSessions = [];
        for (const [date, sessions] of Object.entries(schedules)) {
            allSessions = allSessions.concat(sessions);
        }

        allSessions = allSessions.filter(s => matchesListFilter(s));
        allSessions.sort((a, b) => a.date.localeCompare(b.date));

        let hasUpcoming = false;
        let hasHistory = false;

        allSessions.forEach(session => {
            const past = isPast(session.date);
            const li = createSessionListItem(session, past);

            if (past) {
                historyList.appendChild(li);
                hasHistory = true;
            } else {
                upcomingList.appendChild(li);
                hasUpcoming = true;
            }
        });

        if (!hasUpcoming) upcomingList.innerHTML = '<li>No upcoming sessions.</li>';
        if (!hasHistory) historyList.innerHTML = '<li>No session history found.</li>';
    }

    // FIX: Updated to match Student Dashboard styling
    function createSessionListItem(session, isPast) {
        const li = document.createElement('li');
        li.className = 'session-item';

        // Status color for left border logic (green future, grey past)
        const statusColor = isPast ? '#6c757d' : '#28a745';

        let sName = session.studentName || session.studentname;
        let display = sName ? `${sName} - ${session.topic}` : session.topic;
        let timeDisplay = session.time.substring(0, 5);

        li.innerHTML = `
            <div class="session-info" style="border-left: 4px solid ${statusColor}; padding-left: 8px;">
                <span class="session-title">${display}</span>
                <span class="session-date">${session.date} | ${timeDisplay}</span>
            </div>
            <span class="session-location">📍 ${session.location}</span>
        `;

        li.addEventListener('click', () => openSessionModal(session, 'edit'));
        return li;
    }

    // --- 5. CALENDAR & TABLE ---
    function selectDate(date) {
        selectedDate = new Date(date);
        renderCalendar(selectedDate);
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        renderWeeklySchedule(startOfWeek);
    }

    function renderCalendar(date) {
        if (!calendarGrid) return;
        const year = date.getFullYear();
        const month = date.getMonth();
        if (monthYearDisplay) monthYearDisplay.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);

        calendarGrid.innerHTML = '';
        const firstDayOfMonth = new Date(year, month, 1);
        const firstDayIndex = firstDayOfMonth.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const totalCells = 42;

        for (let i = 0; i < firstDayIndex; i++) {
            const empty = document.createElement('div');
            empty.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.textContent = day;
            const currentDayObj = new Date(year, month, day);
            const dateStr = toLocalDateString(currentDayObj);

            if (currentDayObj.toDateString() === selectedDate.toDateString()) {
                dayCell.classList.add('today');
                dayCell.style.backgroundColor = '#007bff';
                dayCell.style.color = 'white';
            }

            let hasEvent = false;
            if (schedules[dateStr]) {
                hasEvent = schedules[dateStr].some(s => matchesFilter(s));
            }
            if (hasEvent) dayCell.classList.add('has-session');

            dayCell.addEventListener('click', () => selectDate(currentDayObj));
            calendarGrid.appendChild(dayCell);
        }

        const remainingCells = totalCells - (firstDayIndex + daysInMonth);
        for (let i = 0; i < remainingCells; i++) {
            const empty = document.createElement('div');
            empty.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(empty);
        }
    }

    function renderWeeklySchedule(startOfWeek) {
        if (!weeklyTableBody) return;
        const rows = weeklyTableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            for (let i = 1; i < cells.length; i++) {
                cells[i].innerHTML = '';
                cells[i].className = '';
                cells[i].style.backgroundColor = '';
                cells[i].onclick = null;
                cells[i].style.cursor = 'default';
            }
        });

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            const dateStr = toLocalDateString(currentDay);

            if (schedules[dateStr]) {
                schedules[dateStr].filter(s => matchesFilter(s)).forEach(session => {
                    placeSessionInTable(session, i, 'session');
                });
            }
            weeklySchedules.forEach(ws => {
                if (ws.dayIndex === i) {
                    placeSessionInTable(ws, i, 'teaching-schedule');
                }
            });
        }

        const dayHeaders = document.querySelectorAll('#schedule-header-days th');
        dayHeaders.forEach(th => th.style.backgroundColor = '');
        if (dayHeaders[selectedDate.getDay() + 1]) {
            dayHeaders[selectedDate.getDay() + 1].style.backgroundColor = '#e6f7ff';
        }
    }

    function placeSessionInTable(session, dayIndex, cssClass) {
        let timeKey = session.time.substring(0, 5);
        let hour = timeKey.split(':')[0];
        let rowKey = `${hour}:00`;

        const row = weeklyTableBody.querySelector(`tr[data-time="${rowKey}"]`);
        if (row) {
            const cell = row.children[dayIndex + 1];
            if (cell) {
                cell.classList.add(cssClass);
                let title = session.studentName ? `${session.studentName}<br>(${session.topic})` : session.topic;
                cell.innerHTML = `<small><strong>${title}</strong><br>${timeKey}</small>`;

                if (cssClass === 'session') {
                    cell.style.cursor = 'pointer';
                    cell.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openSessionModal(session, 'edit');
                    });
                }
            }
        }
    }

    // --- 6. MODAL & SAVE ---
    function openSessionModal(session, mode) {
        sessionModal.classList.remove('hidden');
        sessionForm.reset();

        if (mode === 'create') {
            if (sessionModalTitle) sessionModalTitle.textContent = "Book New Session";
            sessionIdField.value = "";
            document.getElementById('session-date').value = toLocalDateString(selectedDate);
            if (studentSelect) {
                studentSelect.disabled = false;
                studentSelect.value = "";
            }
            if (deleteSessionBtn) deleteSessionBtn.classList.add('hidden');
        }
        else {
            if (sessionModalTitle) sessionModalTitle.textContent = "Edit Session Details";
            sessionIdField.value = session.id;

            document.getElementById('session-date').value = session.date;
            document.getElementById('session-time').value = session.time.substring(0, 5);
            document.getElementById('session-location').value = session.location;
            document.getElementById('session-notes').value = session.notes || "";

            // Task 4: Populate Additional Lecturer
            const addLecturerSelect = document.getElementById('session-additional-lecturer');
            if (addLecturerSelect) {
                addLecturerSelect.value = session.additionalLecturer || "";
            }

            let studentVal = session.studentNpm || session.studentnpm;
            if (studentSelect && studentVal) {
                studentSelect.value = studentVal;
                studentSelect.disabled = true;
            }
            if (deleteSessionBtn) deleteSessionBtn.classList.remove('hidden');
        }
    }

    if (sessionForm) {
        sessionForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const timeVal = document.getElementById('session-time').value;
            if (timeVal < "07:00" || timeVal > "19:00") {
                alert("Session time must be between 07:00 and 19:00.");
                return;
            }

            const formData = {
                id: sessionIdField.value,
                studentNpm: studentSelect ? studentSelect.value : null,
                date: document.getElementById('session-date').value,
                time: timeVal,
                location: document.getElementById('session-location').value,
                notes: document.getElementById('session-notes').value,
                additionalLecturer: document.getElementById('session-additional-lecturer').value // Task 4
            };

            fetch('/api/student/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(res => {
                    if (res.ok) {
                        alert("Session saved successfully!");
                        sessionModal.classList.add('hidden');
                        fetchSchedules();
                    } else {
                        res.text().then(t => alert("Error: " + t));
                    }
                })
                .catch(err => alert("Network Error: " + err));
        });
    }

    if (deleteSessionBtn) {
        deleteSessionBtn.addEventListener('click', () => {
            const id = sessionIdField.value;
            if (!id) return;

            if (confirm("Are you sure you want to delete this session?")) {
                fetch(`/api/session/${id}`, {
                    method: 'DELETE'
                })
                    .then(res => {
                        if (res.ok) {
                            alert("Session deleted.");
                            sessionModal.classList.add('hidden');
                            fetchSchedules();
                        } else {
                            alert("Failed to delete session.");
                        }
                    })
                    .catch(err => alert("Network Error: " + err));
            }
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => sessionModal.classList.add('hidden'));

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() - 1);
            selectDate(selectedDate);
        });
    }
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() + 1);
            selectDate(selectedDate);
        });
    }

    if (addSessionBtn) {
        addSessionBtn.addEventListener('click', () => openSessionModal(null, 'create'));
    }

    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logoutModal.classList.remove('hidden'); });
    if (document.getElementById('cancel-logout-btn')) document.getElementById('cancel-logout-btn').addEventListener('click', () => logoutModal.classList.add('hidden'));
    if (document.getElementById('confirm-logout-btn')) document.getElementById('confirm-logout-btn').addEventListener('click', () => window.location.href = '/logout');
});