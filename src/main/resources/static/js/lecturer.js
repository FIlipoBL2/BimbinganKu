document.addEventListener('DOMContentLoaded', function () {
    
    // --- CONFIG ---
    const dayMap = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };
    let schedules = {}; 
    let weeklySchedules = []; 
    let selectedDate = new Date(); // Defaults to today
    
    const codeField = document.getElementById('user-id');
    const lecturerCode = codeField ? codeField.value : null;

    // --- DOM Elements (Matched to your HTML) ---
    const calendarGrid = document.getElementById('calendar-grid'); // HTML ID is calendar-grid
    const monthYearDisplay = document.getElementById('month-year-display'); // HTML ID is month-year-display
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const upcomingList = document.getElementById('upcoming-list'); // HTML ID is upcoming-list
    const weeklyTableBody = document.getElementById('schedule-body');

    // Modal Elements
    const sessionModal = document.getElementById('session-modal');
    const sessionModalTitle = document.getElementById('modal-title') || document.querySelector('#session-modal h3');
    const closeBtn = sessionModal ? sessionModal.querySelector('.close-btn') : null;
    const sessionForm = document.getElementById('session-form');
    const saveSessionBtn = document.getElementById('save-session-btn');
    const sessionIdField = document.getElementById('session-id');

    // --- INIT ---
    if (lecturerCode) {
        console.log("Loaded Lecturer JS for Code:", lecturerCode);
        fetchSchedules();
    } else {
        console.error("Lecturer Code is missing in hidden input!");
    }
    
    // Force render immediately
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

    // --- FETCH ---
    function fetchSchedules() {
        // Debugging URL
        const url = `/api/lecturer/schedule/${lecturerCode}`;
        console.log("Fetching from URL:", url);

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch schedule');
                return response.json();
            })
            .then(data => {
                console.log("Schedule data received:", data);
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
                // Re-render with data
                renderCalendar(selectedDate);
                renderUpcomingSessions(); // Changed to match function name below
                selectDate(selectedDate);
            })
            .catch(error => console.error('Error fetching schedules:', error));
    }

    // --- CALENDAR ---
    function selectDate(date) {
        selectedDate = new Date(date);
        renderCalendar(selectedDate);
        
        // Calculate start of week (Sunday)
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        renderWeeklySchedule(startOfWeek);
    }

    function renderCalendar(date) {
        if (!calendarGrid) return;
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Update header text
        if(monthYearDisplay) {
            monthYearDisplay.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
        }

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

    // --- TABLE ---
    function renderWeeklySchedule(startOfWeek) {
        if (!weeklyTableBody) return;
        const rows = weeklyTableBody.querySelectorAll('tr');
        
        // Clear previous
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
        
        // Highlight header
        const dayHeaders = document.querySelectorAll('#schedule-header-days th');
        dayHeaders.forEach(th => th.style.backgroundColor = ''); 
        // +1 index offset for Time column
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
                let title = session.studentName ? `${session.studentName}<br>(${session.topic})` : session.topic;
                cell.innerHTML = `<small><strong>${title}</strong></small>`;
                
                if (cssClass === 'session') {
                    cell.style.cursor = 'pointer';
                    cell.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openSessionModal(session);
                    });
                }
            }
        }
    }

    // --- LIST (Upcoming Sessions) ---
    function renderUpcomingSessions() {
        if (!upcomingList) return;
        upcomingList.innerHTML = '';
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
            
            let display = session.studentName ? `${session.studentName} - ${session.topic}` : session.topic;

            li.innerHTML = `
                <div class="session-info" style="border-left: 4px solid ${statusColor}; padding-left: 8px;">
                    <span class="session-title"><strong>${display}</strong></span>
                    <span class="session-date">${session.date} | ${session.time.substring(0,5)}</span>
                </div>
                <span class="session-location">📍 ${session.location}</span>
            `;
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => openSessionModal(session));
            upcomingList.appendChild(li);
        });
    }

    // --- MODAL ---
    function openSessionModal(session) {
        sessionModal.classList.remove('hidden');
        if(sessionModalTitle) sessionModalTitle.textContent = "Edit Session Details";
        
        // Fill Data
        if(sessionIdField) sessionIdField.value = session.id;
        
        // Safely set values if elements exist
        const topicInput = document.getElementById('session-topic');
        if(topicInput) topicInput.value = session.topicCode || session.topic;
        
        const dateInput = document.getElementById('session-date');
        if(dateInput) dateInput.value = session.date;
        
        const timeInput = document.getElementById('session-time');
        if(timeInput) timeInput.value = session.time.substring(0,5);
        
        const locInput = document.getElementById('session-location');
        if(locInput) locInput.value = session.location;
        
        const notesInput = document.getElementById('session-notes');
        if(notesInput) notesInput.value = session.notes || ""; 
    }

    if (sessionForm) {
        sessionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                id: sessionIdField.value,
                topicCode: document.getElementById('session-topic').value,
                date: document.getElementById('session-date').value,
                time: document.getElementById('session-time').value,
                location: document.getElementById('session-location').value,
                notes: document.getElementById('session-notes').value 
            };

            fetch('/api/student/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(res => {
                if(res.ok) {
                    alert("Session updated successfully!");
                    sessionModal.classList.add('hidden');
                    fetchSchedules();
                } else {
                    res.text().then(t => alert("Error: " + t));
                }
            })
            .catch(err => alert("Network Error: " + err));
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => sessionModal.classList.add('hidden'));
    
    // Listeners - Added safety checks
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => { 
            selectedDate.setMonth(selectedDate.getMonth() - 1); 
            selectDate(selectedDate); // Re-renders cal
        });
    }
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => { 
            selectedDate.setMonth(selectedDate.getMonth() + 1); 
            selectDate(selectedDate); // Re-renders cal
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logoutModal.classList.remove('hidden'); });
    if (document.getElementById('cancel-logout-btn')) document.getElementById('cancel-logout-btn').addEventListener('click', () => logoutModal.classList.add('hidden'));
    if (document.getElementById('confirm-logout-btn')) document.getElementById('confirm-logout-btn').addEventListener('click', () => window.location.href = '/logout');
});