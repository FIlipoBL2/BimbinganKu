document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Data ---
    const MOCK_UNREAD_MESSAGES = [
        { id: 201, sender: "Student A", message: "New session request for Tuesday.", read: false },
        { id: 202, sender: "Student C", message: "Question about thesis topic.", read: false },
    ];
    
    // NEW MOCK LOCATIONS
    const MOCK_LOCATIONS = [
        { id: 'lr', name: "Lecturer's Room (L-205)" },
        { id: 'lx', name: "Lab X (B-101)" },
        { id: 'vc', name: "Virtual (Google Meet/Zoom)" },
        { id: 'other', name: "Other..." }
    ];

    const MOCK_STUDENTS = [
        { id: 's1', name: 'Student A' },
        { id: 's2', name: 'Student Y' }, 
        { id: 's3', name: 'Student C' },
    ];

    const MOCK_SESSIONS = [
        { id: 1, studentId: 's1', student: 'Student A', date: '2025-11-24', time: '08:00', notes: 'Discussed chapter 3, focus on literature review.', status: 'finished' },
        { id: 2, studentId: 's2', student: 'Student B', date: '2025-11-25', time: '09:00', notes: 'Thesis proposal review. Approved structure.', status: 'finished' },
        { id: 3, studentId: 's1', student: 'Student A', date: '2025-11-20', time: '14:00', notes: 'Reviewed initial data collection plan.', status: 'finished' },
        { id: 4, studentId: 's3', student: 'Student C', date: '2025-11-10', time: '11:00', notes: 'Methodology check. Advised on statistical tools.', status: 'finished' },
        { id: 5, studentId: 's2', student: 'Student B', date: '2025-11-18', time: '15:00', notes: 'Checked abstract and introduction.', status: 'finished' },
    ];

    // --- DOM Elements ---
    const notificationBell = document.getElementById('notification-bell');
    const unreadCountBadge = document.getElementById('unread-count');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const addSessionBtn = document.getElementById('add-session-btn');
    const modal = document.getElementById('session-modal');
    const closeBtn = document.querySelector('.modal-content .close-btn');
    const form = document.getElementById('session-form');
    const scheduleTable = document.getElementById('weekly-schedule-table');
    const historyList = document.getElementById('history-list');
    const historyStudentFilter = document.getElementById('history-student-filter');
    const sessionLocationSelect = document.getElementById('session-location'); // NEW
    const customLocationInput = document.getElementById('session-custom-location'); // NEW

    // --- Mock Notification Logic ---
    const unreadMessages = MOCK_UNREAD_MESSAGES.filter(msg => !msg.read);
    const unreadCount = unreadMessages.length;

    if (unreadCount > 0) {
        unreadCountBadge.textContent = unreadCount;
        unreadCountBadge.classList.remove('hidden');
        notificationDropdown.innerHTML = ''; 

        unreadMessages.forEach(msg => {
            const p = document.createElement('p');
            p.classList.add('unread');
            p.textContent = `${msg.sender}: ${msg.message}`;
            notificationDropdown.appendChild(p);
        });
    } else {
        unreadCountBadge.classList.add('hidden');
        notificationDropdown.innerHTML = '<p class="empty-message">No unread messages.</p>';
    }

    notificationBell.addEventListener('click', (event) => {
        notificationDropdown.classList.toggle('hidden');
        event.stopPropagation();
    });

    document.addEventListener('click', (event) => {
        if (!notificationBell.contains(event.target) && !notificationDropdown.contains(event.target)) {
            notificationDropdown.classList.add('hidden');
        }
    });
    
    // --- Location Dropdown Logic ---
    function populateLocationDropdown() {
        // Clear previous options
        sessionLocationSelect.innerHTML = ''; 
        
        // Add a default blank option at the start
        const defaultOpt = document.createElement('option');
        defaultOpt.value = "";
        defaultOpt.textContent = "Select Session Location";
        defaultOpt.setAttribute('disabled', true);
        defaultOpt.setAttribute('selected', true);
        sessionLocationSelect.appendChild(defaultOpt); 

        MOCK_LOCATIONS.forEach(loc => {
            const opt = document.createElement('option');
            opt.value = loc.id;
            opt.textContent = loc.name;
            sessionLocationSelect.appendChild(opt);
        });
    }
    
    // Event listener for location change (to show/hide custom input)
    sessionLocationSelect.addEventListener('change', (event) => {
        if (event.target.value === 'other') {
            customLocationInput.classList.remove('hidden');
            customLocationInput.setAttribute('required', 'required');
            customLocationInput.focus();
        } else {
            customLocationInput.classList.add('hidden');
            customLocationInput.removeAttribute('required');
            customLocationInput.value = ''; // Clear custom input when switching away
        }
    });

    // --- Session Management (New/Edit/Delete & Notes) ---
    // Open modal for New Session
    addSessionBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        form.reset();
        document.getElementById('delete-session-btn').classList.add('hidden');
        document.getElementById('session-notes').value = ''; 
        document.getElementById('save-session-btn').textContent = 'Save Session'; 
        // Reset location fields
        customLocationInput.classList.add('hidden');
        customLocationInput.removeAttribute('required');
        customLocationInput.value = '';
        if (sessionLocationSelect && sessionLocationSelect.options.length > 0) {
            sessionLocationSelect.selectedIndex = 0; // Select default
        }
    });

    // Open modal when clicking an existing session (to Edit/Delete)
    scheduleTable.addEventListener('click', (event) => {
        const sessionCell = event.target.closest('.session');
        if (sessionCell) {
            modal.classList.remove('hidden');
            document.getElementById('delete-session-btn').classList.remove('hidden');
            document.getElementById('save-session-btn').textContent = 'Update Session';
            
            // SIMULATE: Populate session data and notes for editing
            document.getElementById('session-notes').value = 'Discussed chapter 3, focus needed on methodology.';
            
            // SIMULATE: Populate location (e.g., this session was in Lab X)
            sessionLocationSelect.value = 'lx';
            customLocationInput.classList.add('hidden');
            customLocationInput.removeAttribute('required');
            customLocationInput.value = '';
        }
    });

    // Close modal
    closeBtn.addEventListener('click', () => { modal.classList.add('hidden'); });
    window.addEventListener('click', (event) => { if (event.target === modal) modal.classList.add('hidden'); });

    // Handle form submission (Save/Update)
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const notes = document.getElementById('session-notes').value;
        
        // Get Location
        const selectedLocationId = sessionLocationSelect.value;
        let finalLocation;
        if (selectedLocationId === 'other') {
            finalLocation = customLocationInput.value;
        } else {
            // Find the display name from the mock data
            const selectedMockLocation = MOCK_LOCATIONS.find(loc => loc.id === selectedLocationId);
            finalLocation = selectedMockLocation ? selectedMockLocation.name : 'Unknown Location';
        }

        console.log('Lecturer Notes Saved:', notes);
        console.log('Session Location:', finalLocation);
        alert(`Session saved/updated successfully! Location: ${finalLocation}`);
        modal.classList.add('hidden');
    });

    // Handle Delete button
    document.getElementById('delete-session-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this session?')) {
            alert('Session deleted successfully! Notification sent to the involved student.');
            modal.classList.add('hidden');
        }
    });
    // --- End Session Management ---

    // --- Logout Logic ---
    const logoutModal = document.getElementById('logout-modal');
    const logoutBtn = document.getElementById('logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');

    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault(); 
        logoutModal.classList.remove('hidden');
    });

    cancelLogoutBtn.addEventListener('click', () => {
        logoutModal.classList.add('hidden');
    });

    confirmLogoutBtn.addEventListener('click', () => {
        // Replace with actual logout path
        window.location.href = '/logout'; 
    });

    window.addEventListener('click', (event) => { 
        if (event.target === logoutModal) {
            logoutModal.classList.add('hidden');
        } 
    });

    // --- CALENDAR AND SCHEDULE INTERACTION LOGIC (Required for context) ---
    const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let selectedDateString = formatDate(new Date()); 
    const calendarDays = document.getElementById('calendar-days');
    let currentYear;
    let currentMonth;

    // Helper function: Finds the Sunday of the week for a given date (0)
    function getWeekStart(dateString) {
        const date = new Date(dateString);
        const dayOfWeek = date.getDay(); 
        let daysToSubtract = dayOfWeek; 
        date.setDate(date.getDate() - daysToSubtract);
        date.setHours(0, 0, 0, 0); 
        return date;
    }

    // Helper function: Formats Date object to YYYY-MM-DD string
    function formatDate(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    // Function to update the schedule table header based on the week start date
    function updateScheduleTable(startDate, highlightDateStr) {
        const headerRow = document.querySelector('#weekly-schedule-table thead tr');
        const scheduleBody = document.querySelector('#weekly-schedule-table tbody'); 
        
        headerRow.innerHTML = '<th>Time</th>'; 
        
        const date = new Date(startDate);
        
        const highlightDate = new Date(highlightDateStr + 'T00:00:00');
        const highlightDayOfWeek = highlightDate.getDay(); 

        for (let i = 0; i < 7; i++) {
            const dayOfWeek = date.getDay();
            const dayName = WEEKDAYS_SHORT[dayOfWeek];
            const dateStr = date.getDate();
            
            const currentDateStr = formatDate(date);
            const isHighlightedDay = (currentDateStr === highlightDateStr);
            
            const highlightClass = isHighlightedDay ? 'selected-column' : '';

            const headerHtml = `<th class="${highlightClass}" data-date="${currentDateStr}">${dayName}<br><small>(${dateStr})</small></th>`;
            headerRow.innerHTML += headerHtml;

            date.setDate(date.getDate() + 1);
        }
        
        scheduleBody.querySelectorAll('td').forEach(cell => {
            cell.classList.remove('selected-column');
        });
        
        let columnIndexToHighlight = highlightDayOfWeek + 2; 
        
        scheduleBody.querySelectorAll(`tr > td:nth-child(${columnIndexToHighlight})`).forEach(cell => {
             cell.classList.add('selected-column');
        });
        
        const studentScheduleFilter = document.getElementById('student-schedule-filter');
        if (studentScheduleFilter) {
            filterStudentStudySchedule(studentScheduleFilter.value);
        }
    }
    
    // Function to filter student's study/group time visibility
    function filterStudentStudySchedule(selectedStudentId) {
        const studyCells = document.querySelectorAll(`#weekly-schedule-table td.study-schedule`);
        
        studyCells.forEach(cell => {
            const studentId = cell.getAttribute('data-student-id');
            
            if (selectedStudentId === 'all' || studentId === selectedStudentId) {
                cell.classList.remove('hidden-schedule');
            } else {
                cell.classList.add('hidden-schedule');
            }
        });
    }

    // Function to handle the day click and update the state
    function handleDayClick(clickedDate) {
        selectedDateString = clickedDate; 
        
        document.querySelectorAll('.calendar-days div').forEach(div => {
            div.classList.remove('selected-day');
        });

        const newSelectedDayDiv = document.querySelector(`.calendar-days div[data-date="${clickedDate}"]`);
        if (newSelectedDayDiv) {
            newSelectedDayDiv.classList.add('selected-day');
        }

        const weekStartDate = getWeekStart(clickedDate);
        updateScheduleTable(weekStartDate, clickedDate);
    }
    

    // CALENDAR RENDER
    function renderCalendar(year, month) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];

        const monthYearDisplay = document.getElementById('current-month-year');
        
        calendarDays.innerHTML = ''; 
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay(); 
        
        const today = new Date();
        const todayStr = formatDate(today);

        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty');
            calendarDays.appendChild(emptyDiv);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            const dateStr = formatDate(date);
            dayDiv.dataset.date = dateStr; 

            if (dateStr === todayStr) {
                dayDiv.classList.add('current-day');
            }
            
            if (dateStr === selectedDateString) {
                dayDiv.classList.add('selected-day');
            }

            dayDiv.addEventListener('click', (event) => {
                const clickedDate = event.target.dataset.date;
                handleDayClick(clickedDate);
            });

            calendarDays.appendChild(dayDiv);
        }
    }
    
    // Session History Rendering & Filtering
    function populateStudentFilter() {
        if (historyStudentFilter) {
            MOCK_STUDENTS.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                historyStudentFilter.appendChild(opt);
            });
        }
    }

    function renderHistory(filterStudentId = 'all') {
        if (!historyList) return; 

        historyList.innerHTML = '';

        let filteredSessions = MOCK_SESSIONS.filter(s => s.status === 'finished');

        if (filterStudentId !== 'all') {
            filteredSessions = filteredSessions.filter(s => s.studentId === filterStudentId);
        }

        filteredSessions.sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));

        if (filteredSessions.length === 0) {
            historyList.innerHTML = '<p>No finished sessions found for the selected filter.</p>';
            return;
        }

        filteredSessions.forEach(s => {
            const card = document.createElement('div');
            card.style = 'background:white;border-radius:8px;padding:12px;margin-bottom:10px;box-shadow:0 2px 4px rgba(0,0,0,0.06)';
            
            const dateParts = s.date.split('-');
            const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); 
            const dateLabel = date.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
            
            card.innerHTML = `<strong>${dateLabel} • ${s.time}</strong>
                              <div style="margin-top:6px;">
                                <div><strong>Student:</strong> ${s.student}</div>
                                <div><strong>Notes:</strong> ${s.notes || 'No notes available.'}</div>
                              </div>`;
            historyList.appendChild(card);
        });
    }

    if (historyStudentFilter) {
        historyStudentFilter.addEventListener('change', (event) => {
            renderHistory(event.target.value);
        });
    }

    // --- INITIALIZATION ---
    currentYear = new Date().getFullYear();
    currentMonth = new Date().getMonth(); 

    // 1. Initial Render
    renderCalendar(currentYear, currentMonth);

    // 2. Initial Schedule Load for the current week
    updateScheduleTable(getWeekStart(selectedDateString), selectedDateString); 
    
    // 3. Initial History Load
    populateStudentFilter();
    renderHistory('all');

    // 4. Populate Student Filter for Schedule and add listener
    const studentScheduleFilter = document.getElementById('student-schedule-filter');
    if (studentScheduleFilter) {
        MOCK_STUDENTS.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name;
            studentScheduleFilter.appendChild(opt);
        });

        studentScheduleFilter.addEventListener('change', (event) => {
            filterStudentStudySchedule(event.target.value);
        });
        
        filterStudentStudySchedule('all');
    }
    
    // 5. Populate Location Dropdown
    populateLocationDropdown(); // NEW

    // Add event listeners for month navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentYear, currentMonth);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentYear, currentMonth);
    });
});