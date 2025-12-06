document.addEventListener('DOMContentLoaded', function () {
    
    // --- 1. CONFIG & STATE ---
    const dayMap = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };
    let schedules = {};      // Map: "YYYY-MM-DD" -> Array of Session Objects
    let weeklySchedules = []; // Array of Recurring Classes
    let selectedDate = new Date();
    
    const npmField = document.getElementById('user-id');
    const npm = npmField ? npmField.value : null; 

    // DOM Elements
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const upcomingList = document.getElementById('upcoming-list');
    const weeklyTableBody = document.getElementById('schedule-body');

    // Modal Elements
    const sessionModal = document.getElementById('session-modal');
    const sessionModalTitle = document.getElementById('modal-title');
    const requestSessionBtn = document.getElementById('request-session-btn');
    const closeBtn = sessionModal ? sessionModal.querySelector('.close-btn') : null;
    const sessionForm = document.getElementById('session-form');
    const saveSessionBtn = document.getElementById('save-session-btn');
    
    // Hidden Input for ID
    const sessionIdField = document.getElementById('session-id');

    // --- INITIALIZATION ---
    if (npm) {
        console.log("Loaded Student JS for NPM:", npm);
        fetchSchedules(); 
    }

    // --- HELPER: Local Date String ---
    function toLocalDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- HELPER: Check if Date is Past ---
    function isPast(dateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const target = new Date(dateStr);
        const parts = dateStr.split('-');
        target.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return target < today;
    }

    // --- 2. FETCH DATA ---
    function fetchSchedules() {
        fetch(`/api/student/schedule/${npm}`) 
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch schedule');
                return response.json();
            })
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
                renderUpcomingSessions();
                selectDate(selectedDate); 
            })
            .catch(error => { console.error('Error:', error); });
    }

    // --- 3. INTERACTIVE CALENDAR ---
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
        monthYearDisplay.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
        calendarGrid.innerHTML = ''; 
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const selectedStr = selectedDate.toDateString(); 

        for (let i = 0; i < firstDay; i++) {
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

            if (currentDayObj.toDateString() === selectedStr) {
                dayCell.classList.add('today'); 
                dayCell.style.backgroundColor = '#007bff';
                dayCell.style.color = 'white';
            }
            if (schedules[dateStr] && schedules[dateStr].length > 0) {
                dayCell.classList.add('has-session');
            }
            dayCell.addEventListener('click', () => selectDate(currentDayObj));
            calendarGrid.appendChild(dayCell);
        }
    }

    // --- 4. RENDER WEEKLY TABLE ---
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
                schedules[dateStr].forEach(session => {
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
        if(dayHeaders[selectedDate.getDay() + 1]) {
            dayHeaders[selectedDate.getDay() + 1].style.backgroundColor = '#e6f7ff'; 
        }
    }

    function placeSessionInTable(session, dayIndex, cssClass) {
        let timeKey = session.time.substring(0, 5); 
        const row = weeklyTableBody.querySelector(`tr[data-time="${timeKey}"]`);
        if (row) {
            const cell = row.children[dayIndex + 1]; 
            if (cell) {
                cell.classList.add(cssClass);
                cell.innerHTML = `<strong>${session.topic}</strong><br><small>${session.location || ''}</small>`;
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

    // --- 5. RENDER LIST ---
    function renderUpcomingSessions() {
        if (!upcomingList) return;
        upcomingList.innerHTML = ''; 
        const todayStr = toLocalDateString(new Date());
        let allUpcoming = [];
        for (const [date, sessions] of Object.entries(schedules)) {
            allUpcoming = allUpcoming.concat(sessions);
        }
        allUpcoming.sort((a, b) => a.date.localeCompare(b.date));

        if (allUpcoming.length === 0) {
            upcomingList.innerHTML = '<li>No sessions found.</li>';
            return;
        }

        allUpcoming.forEach(session => {
            const li = document.createElement('li');
            li.className = 'session-item';
            const past = isPast(session.date);
            const statusColor = past ? '#6c757d' : '#28a745'; 
            
            li.innerHTML = `
                <div class="session-info" style="border-left: 4px solid ${statusColor}; padding-left: 8px;">
                    <span class="session-title"><strong>${session.topic}</strong></span>
                    <span class="session-date">${session.date} | ${session.time.substring(0,5)}</span>
                </div>
                <span class="session-location">📍 ${session.location}</span>
            `;
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => openSessionModal(session, 'edit'));
            upcomingList.appendChild(li);
        });
    }

    // --- 6. MODAL & SAVE ---
    function openSessionModal(session = null, mode = 'create') {
        sessionModal.classList.remove('hidden');
        const topicSelect = document.getElementById('session-topic');
        const dateInput = document.getElementById('session-date');
        const timeInput = document.getElementById('session-time');
        const locSelect = document.getElementById('session-location');
        
        sessionForm.reset();
        
        // Reset Inputs
        topicSelect.disabled = false;
        dateInput.disabled = false;
        timeInput.disabled = false;
        locSelect.disabled = false;
        saveSessionBtn.classList.remove('hidden');

        if (mode === 'create') {
            sessionModalTitle.textContent = "Book a New Session";
            saveSessionBtn.textContent = "Save Session";
            dateInput.value = toLocalDateString(selectedDate);
            sessionIdField.value = ""; // Clear ID for new session
        } 
        else if (mode === 'edit') {
            sessionIdField.value = session.id; // SET ID for update

            const past = isPast(session.date);
            if (past) {
                sessionModalTitle.textContent = "Session Details (Completed)";
                topicSelect.value = session.topicCode || ""; 
                dateInput.value = session.date;
                timeInput.value = session.time.substring(0,5);
                locSelect.value = session.location;
                
                topicSelect.disabled = true;
                dateInput.disabled = true;
                timeInput.disabled = true;
                locSelect.disabled = true;
                saveSessionBtn.classList.add('hidden');
            } else {
                sessionModalTitle.textContent = "Update Session";
                saveSessionBtn.textContent = "Update Changes";
                // Pre-fill
                topicSelect.value = "TA-001"; // Simplify for demo
                dateInput.value = session.date;
                timeInput.value = session.time.substring(0,5);
                locSelect.value = session.location;
            }
        }
    }

    if (sessionForm) {
        sessionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                id: sessionIdField.value, // SEND ID to Backend
                topicCode: document.getElementById('session-topic').value,
                date: document.getElementById('session-date').value,
                time: document.getElementById('session-time').value,
                location: document.getElementById('session-location').value
            };

            fetch('/api/student/session', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(res => {
                if(res.ok) {
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

    // --- LISTENERS ---
    if (requestSessionBtn) requestSessionBtn.addEventListener('click', () => openSessionModal(null, 'create'));
    if (closeBtn) closeBtn.addEventListener('click', () => sessionModal.classList.add('hidden'));
    
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => {
        selectedDate.setMonth(selectedDate.getMonth() - 1);
        selectDate(selectedDate);
    });
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => {
        selectedDate.setMonth(selectedDate.getMonth() + 1);
        selectDate(selectedDate);
    });
    
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logoutModal.classList.remove('hidden'); });
    document.getElementById('cancel-logout-btn').addEventListener('click', () => logoutModal.classList.add('hidden'));
    document.getElementById('confirm-logout-btn').addEventListener('click', () => window.location.href = '/logout');
});