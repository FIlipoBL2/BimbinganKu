document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------
    // MOCK DATA
    // ------------------------------
    const MOCK_UNREAD_MESSAGES = [
        { id: 101, sender: "Dr. Smith", message: "Reminder: Session moved to 10:00.", read: false },
        { id: 102, sender: "Admin", message: "Schedule updated for next week.", read: false },
        { id: 103, sender: "Dr. Jones", message: "Session notes are ready.", read: false },
    ];

    // Mock Locations added
    const MOCK_LOCATIONS = [
        { id: 'office', name: 'Lecturer Office (Check notes)' },
        { id: 'online', name: 'Online (Zoom/Meet)' },
        { id: 'library', name: 'Library Study Room' },
        { id: 'other', name: 'Other (Specify below)' },
    ];

    const MOCK_SCHEDULE = [
        { id: 1, lecturerId: 'lx', lecturer: 'Dr. X', date: '2025-11-24', time: '08:00', notes: 'Discuss chapter 3', status: 'finished', location: 'office' },
        { id: 2, lecturerId: 'ly', lecturer: 'Dr. Y', date: '2025-11-25', time: '09:00', notes: 'Thesis progress review', status: 'finished', location: 'online' },
        { id: 3, lecturerId: 'ls', lecturer: 'Dr. Smith', date: '2025-11-26', time: '10:00', notes: 'Proposal feedback', status: 'finished', location: 'library' },
        // Future sessions for schedule display (Mock data for the visual schedule grid)
        { id: 10, lecturerId: 'lx', lecturer: 'Dr. X', date: '2025-12-01', time: '09:00', notes: 'Upcoming Session 1', status: 'scheduled', location: 'office' }, // Mon, 9:00
        { id: 11, lecturerId: 'ly', lecturer: 'Dr. Y', date: '2025-12-03', time: '11:00', notes: 'Upcoming Session 2', status: 'scheduled', location: 'online' }, // Wed, 11:00
        { id: 12, lecturerId: 'lz', lecturer: 'Dr. Z', date: '2025-12-05', time: '14:00', notes: 'Upcoming Session 3', status: 'scheduled', location: 'other', customLocation: 'Cafe B' }, // Fri, 14:00
    ];
    
    // Mock Lecturers for the session modal dropdown and the new schedule filter
    const MOCK_LECTURERS = [
        { id: 'lx', name: 'Dr. X' },
        { id: 'ly', name: 'Dr. Y' },
        { id: 'lz', name: 'Dr. Z' },
    ];

    // ------------------------------
    // Calendar/Schedule/Date Helpers (Updated for Sunday Start)
    // ------------------------------
    const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let selectedDateString = formatDate(new Date()); 
    const scheduleTable = document.getElementById('weekly-schedule-table');
    const calendarDays = document.getElementById('calendar-days');
    let currentYear;
    let currentMonth;

    // Helper function: Finds the Sunday of the week for a given date (0)
    function getWeekStart(dateString) {
        const date = new Date(dateString);
        const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
        
        // Calculate days to subtract to reach Sunday (0)
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
        const headerRow = document.getElementById('schedule-header-days');
        const scheduleBody = document.getElementById('schedule-body'); 
        
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
        
        // Columns are: 1-Time, 2-Sun, 3-Mon, ..., 8-Sat
        // Day index: 0 (Sun), 1 (Mon), ..., 6 (Sat)
        let columnIndexToHighlight = highlightDayOfWeek + 2; 
        
        scheduleBody.querySelectorAll(`tr > td:nth-child(${columnIndexToHighlight})`).forEach(cell => {
             cell.classList.add('selected-column');
        });
        
        // Re-apply filter after updating the table to ensure visibility is correct
        const lecturerScheduleFilter = document.getElementById('lecturer-schedule-filter');
        if (lecturerScheduleFilter) {
            filterLecturerTeachingSchedule(lecturerScheduleFilter.value);
        }
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
    
    // --- NEW FILTER VISIBILITY FUNCTION (REPLACING THE OLD TOGGLE) ---
    function filterLecturerTeachingSchedule(selectedLecturerId) {
        const teachingCells = document.querySelectorAll(`#weekly-schedule-table td.teaching-schedule`);
        
        teachingCells.forEach(cell => {
            const lecturerId = cell.getAttribute('data-lecturer-id');
            
            if (selectedLecturerId === 'all' || lecturerId === selectedLecturerId) {
                cell.classList.remove('hidden-schedule');
            } else {
                cell.classList.add('hidden-schedule');
            }
        });
    }
    // --- END NEW FILTER VISIBILITY FUNCTION ---

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

        // Fill leading empty days
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty');
            calendarDays.appendChild(emptyDiv);
        }

        // Fill days of the month
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


    // ------------------------------
    // Eligibility Bar Logic (Retained)
    // ------------------------------
    function updateEligibilityBar(count) {
        const total = 5; 
        const percentage = (count / total) * 100;
        const bar = document.getElementById('eligibility-bar');
        
        bar.style.width = percentage + '%';
        bar.dataset.count = count; 
        
        if (count >= total) {
            bar.classList.remove('blue');
            bar.classList.add('green');
        } else {
            bar.classList.remove('green');
            bar.classList.add('blue');
        }
    }
    
    // ------------------------------
    // History Rendering 
    // ------------------------------
    function renderHistory() {
        const historyList = document.getElementById('history-list');
        const cutoff = new Date(); 
        
        const finished = MOCK_SCHEDULE
            .filter(s => s.status === 'finished')
            .filter(s => new Date(s.date) < cutoff)
            .sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time)); // newest first

        if (finished.length === 0) {
            historyList.innerHTML = '<p>No finished sessions yet.</p>';
            return;
        }

        // Renamed 'finished' to 'filteredSessions' for consistency, though it's the full list here.
        finished.forEach(s => {
            const card = document.createElement('div');
            card.style = 'background:white;border-radius:8px;padding:12px;margin-bottom:10px;box-shadow:0 2px 4px rgba(0,0,0,0.06)';
            
            const dateParts = s.date.split('-');
            const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); 
            const dateLabel = date.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
            
            // Display location, using customLocation if location is 'other'
            let displayLocation = s.location || 'N/A';
            if (s.location === 'other' && s.customLocation) {
                displayLocation = s.customLocation;
            } else if (s.location) {
                const locationObj = MOCK_LOCATIONS.find(l => l.id === s.location);
                displayLocation = locationObj ? locationObj.name : s.location;
            }

            card.innerHTML = `<strong>${dateLabel} • ${s.time}</strong>
                              <div style="margin-top:6px;">
                                <div><strong>Lecturer:</strong> ${s.lecturer}</div>
                                <div><strong>Location:</strong> ${displayLocation}</div> 
                                <div><strong>Notes:</strong> ${s.notes || '-'}</div>
                              </div>`;
            historyList.appendChild(card);
        });
    }

    // ------------------------------
    // Session Management (New Create/Update/Delete Flow)
    // ------------------------------
    const addSessionBtn = document.getElementById('add-session-btn');
    const modal = document.getElementById('session-modal');
    const closeBtn = document.querySelector('#session-modal .close-btn');
    const form = document.getElementById('session-form');
    const sessionLecturerSelect = document.getElementById('session-lecturer');
    
    // NEW: Location elements
    const sessionLocationSelect = document.getElementById('session-location');
    const sessionCustomLocationInput = document.getElementById('session-custom-location');

    // Populate the lecturer dropdown for session management
    MOCK_LECTURERS.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = l.name;
        sessionLecturerSelect.appendChild(opt);
    });
    
    // Populate the location dropdown
    MOCK_LOCATIONS.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = l.name;
        sessionLocationSelect.appendChild(opt);
    });

    // Toggle custom location input
    sessionLocationSelect.addEventListener('change', (event) => {
        if (event.target.value === 'other') {
            sessionCustomLocationInput.classList.remove('hidden');
            sessionCustomLocationInput.setAttribute('required', 'required');
        } else {
            sessionCustomLocationInput.classList.add('hidden');
            sessionCustomLocationInput.removeAttribute('required');
        }
    });

    // Helper to reset modal fields correctly
    function resetSessionModal() {
        form.reset();
        document.getElementById('delete-session-btn').classList.add('hidden');
        document.getElementById('save-session-btn').textContent = 'Create Session';
        // Ensure custom location is hidden and not required on reset
        sessionCustomLocationInput.classList.add('hidden');
        sessionCustomLocationInput.removeAttribute('required');
    }

    // Open modal for New Session
    addSessionBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        resetSessionModal();
    });

    // Open modal when clicking an existing session (to Edit/Delete)
    scheduleTable.addEventListener('click', (event) => {
        const sessionCell = event.target.closest('.session');
        if (sessionCell) {
            modal.classList.remove('hidden');
            document.getElementById('delete-session-btn').classList.remove('hidden');
            document.getElementById('save-session-btn').textContent = 'Update Session';
            
            // SIMULATE: Populate session data for editing (e.g., session 11)
            const sessionToEdit = MOCK_SCHEDULE.find(s => s.id === 11) || MOCK_SCHEDULE[0];

            document.getElementById('session-lecturer').value = sessionToEdit.lecturerId; 
            document.getElementById('session-date').value = sessionToEdit.date; 
            document.getElementById('session-time').value = sessionToEdit.time; 

            // SIMULATE: Location Population
            document.getElementById('session-location').value = sessionToEdit.location;
            
            if (sessionToEdit.location === 'other') {
                sessionCustomLocationInput.value = sessionToEdit.customLocation || '';
                sessionCustomLocationInput.classList.remove('hidden');
                sessionCustomLocationInput.setAttribute('required', 'required');
            } else {
                sessionCustomLocationInput.value = '';
                sessionCustomLocationInput.classList.add('hidden');
                sessionCustomLocationInput.removeAttribute('required');
            }
        }
    });

    // Close modal
    closeBtn.addEventListener('click', () => { modal.classList.add('hidden'); });
    window.addEventListener('click', (event) => { if (event.target === modal) modal.classList.add('hidden'); });

    // Handle form submission (Save/Update)
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const locationValue = sessionLocationSelect.value;
        const customLocationValue = sessionCustomLocationInput.value;
        
        // Log values for mock submission
        console.log("Location:", locationValue);
        if (locationValue === 'other') {
            console.log("Custom Location:", customLocationValue);
        }
        
        const action = document.getElementById('save-session-btn').textContent.includes('Update') ? 'updated' : 'created';
        
        alert(`Session successfully ${action}!`);
        modal.classList.add('hidden');
    });

    // Handle Delete button
    document.getElementById('delete-session-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this session?')) {
            alert('Session deleted successfully!');
            modal.classList.add('hidden');
        }
    });

    // ------------------------------
    // Other Common Logic (Notifications, Logout - Retained)
    // ------------------------------
    const notificationBell = document.getElementById('notification-bell');
    const unreadCountBadge = document.getElementById('unread-count');
    const notificationDropdown = document.getElementById('notification-dropdown');

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
        window.location.href = '/logout'; 
    });

    window.addEventListener('click', (event) => { 
        if (event.target === logoutModal) {
            logoutModal.classList.add('hidden');
        } 
    });

    // ------------------------------
    // INITIALIZATION 
    // ------------------------------
    currentYear = new Date().getFullYear();
    currentMonth = new Date().getMonth(); 

    // 1. Initial Render
    renderCalendar(currentYear, currentMonth);

    // 2. Initial Schedule Load for the current week (Must be before step 5)
    updateScheduleTable(getWeekStart(selectedDateString), selectedDateString); 
    
    // 3. Initial History Load
    renderHistory();
    
    // 4. Update eligibility bar 
    updateEligibilityBar(MOCK_SCHEDULE.filter(s => s.status === 'finished').length);

    // 5. Populate Lecturer Filter for Schedule and add listener
    const lecturerScheduleFilter = document.getElementById('lecturer-schedule-filter');
    if (lecturerScheduleFilter) {
        // Populate the dropdown (starting from the second option, as the first is 'All')
        MOCK_LECTURERS.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.id;
            opt.textContent = l.name;
            lecturerScheduleFilter.appendChild(opt);
        });

        // Add listener
        lecturerScheduleFilter.addEventListener('change', (event) => {
            filterLecturerTeachingSchedule(event.target.value);
        });
        
        // Initial state (filter by 'all' on load)
        filterLecturerTeachingSchedule('all');
    }

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