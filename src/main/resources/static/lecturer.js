document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Notification Logic (Requirement 2) ---
    // Same as student logic: show unread messages from inbox
    const MOCK_UNREAD_MESSAGES = [
        { id: 201, sender: "Student A", message: "New session request for Tuesday.", read: false },
        { id: 202, sender: "Student C", message: "Question about thesis topic.", read: false },
    ];
    
    const notificationBell = document.getElementById('notification-bell');
    const unreadCountBadge = document.getElementById('unread-count');
    const notificationDropdown = document.getElementById('notification-dropdown');

    const unreadMessages = MOCK_UNREAD_MESSAGES.filter(msg => !msg.read);
    const unreadCount = unreadMessages.length;

    // Display unread count and messages
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

    // --- Calendar & Schedule Highlighting Logic (Requirement 3) ---
    const calendarDays = document.getElementById('calendar-days');
    const scheduleTable = document.getElementById('weekly-schedule-table');
    
    const handleDaySelect = (selectedButton) => {
        const dayIndex = selectedButton.getAttribute('data-day-index');
        const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex];

        document.querySelectorAll('#calendar-days button').forEach(btn => {
            btn.classList.remove('selected');
        });
        selectedButton.classList.add('selected');

        scheduleTable.querySelectorAll('th, td').forEach(cell => {
            cell.classList.remove('highlighted');
        });

        const columnIndex = Array.from(scheduleTable.querySelector('thead tr').children).findIndex(th => th.getAttribute('data-day') === dayName);
        if (columnIndex !== -1) {
            scheduleTable.querySelectorAll('th, tbody tr').forEach(row => {
                const cell = row.children[columnIndex];
                if (cell) cell.classList.add('highlighted');
            });
        }
    };

    calendarDays.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            handleDaySelect(event.target);
        }
    });

    // Initialize highlight
    const initialSelectedDay = document.querySelector('#calendar-days button.selected');
    if (initialSelectedDay) handleDaySelect(initialSelectedDay);
    
    // --- Session Management (New/Edit/Delete & Notes - Requirement 1) ---
    const addSessionBtn = document.getElementById('add-session-btn');
    const modal = document.getElementById('session-modal');
    const closeBtn = document.querySelector('.modal-content .close-btn');
    const form = document.getElementById('session-form');

    // Open modal for New Session
    addSessionBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        form.reset();
        document.getElementById('delete-session-btn').classList.add('hidden');
        document.getElementById('session-notes').value = ''; // Ensure notes are clear
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
        }
    });

    // Close modal
    closeBtn.addEventListener('click', () => { modal.classList.add('hidden'); });
    window.addEventListener('click', (event) => { if (event.target === modal) modal.classList.add('hidden'); });

    // Handle form submission (Save/Update)
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const notes = document.getElementById('session-notes').value;
        
        console.log('Lecturer Notes Saved:', notes);
        alert('Session saved/updated successfully! Notification sent to the involved student.');
        modal.classList.add('hidden');
        
        // In Spring Boot, this POST/PUT request would include the notes field.
    });

    // Handle Delete button
    document.getElementById('delete-session-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this session?')) {
            alert('Session deleted successfully! Notification sent to the involved student.');
            modal.classList.add('hidden');
        }
    });

    const logoutModal = document.getElementById('logout-modal');
    const logoutBtn = document.getElementById('logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');

    // 1. Open the modal when the 'Logout' link is clicked
    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault(); 
        logoutModal.classList.remove('hidden');
    });

    // 2. Close the modal when 'Cancel' is clicked
    cancelLogoutBtn.addEventListener('click', () => {
        logoutModal.classList.add('hidden');
    });

    // 3. Confirm logout and redirect
    confirmLogoutBtn.addEventListener('click', () => {
        // This URL maps to the /logout @GetMapping in your HomeController.java
        window.location.href = '/logout'; 
    });

    // 4. Close modal if user clicks outside of it (optional but good UX)
    window.addEventListener('click', (event) => { 
        if (event.target === logoutModal) {
            logoutModal.classList.add('hidden');
        } 
    });

    // --- NEW CALENDAR AND SCHEDULE INTERACTION LOGIC (REVISED) ---
    const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Global variable to track the currently selected date string (YYYY-MM-DD)
    let selectedDateString = formatDate(new Date()); 

    // Helper function: Finds the Monday of the week for a given date
    function getWeekStart(dateString) {
        const date = new Date(dateString);
        const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
        
        // Calculate days to subtract to reach Monday (1)
        let daysToSubtract = (dayOfWeek === 0) ? 6 : (dayOfWeek - 1);
        
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
        const scheduleBody = document.getElementById('schedule-body'); // Used for highlighting in the schedule table
        
        // 1. Clear and re-add the 'Time' header
        headerRow.innerHTML = '<th>Time</th>'; 
        
        // 2. Loop through 7 days starting from Monday (startDate)
        const date = new Date(startDate);
        
        // Calculate the index of the day to highlight within the week (0=Mon, 6=Sun)
        const highlightDayIndex = new Date(highlightDateStr).getDay(); 

        for (let i = 0; i < 7; i++) {
            const dayOfWeek = date.getDay();
            const dayName = WEEKDAYS_SHORT[dayOfWeek];
            const dateStr = date.getDate();
            
            // Check if the current day in the loop is the highlighted day
            const isHighlightedDay = (formatDate(date) === highlightDateStr);
            
            // Add a class to the header cell if it's the selected day's column
            const highlightClass = isHighlightedDay ? ' selected-column' : '';

            const headerHtml = `<th class="${highlightClass}" data-date="${formatDate(date)}">${dayName}<br><small>(${dateStr})</small></th>`;
            headerRow.innerHTML += headerHtml;

            // Move to the next day
            date.setDate(date.getDate() + 1);
        }
        
        // 3. Update the schedule body rows
        // We need to apply the highlightClass to the corresponding column cells (TDs)
        // NOTE: If your schedule body rows are complex, this part might require refinement. 
        // For now, we'll rely on CSS targeting the column index.
        
        // --- Schedule Body Column Highlighting ---
        // Remove previous column highlights from all body cells
        scheduleBody.querySelectorAll('td').forEach(cell => {
            cell.classList.remove('selected-column');
        });
        
        // Get the column index of the highlighted day (Time is index 0)
        // Monday is index 1, Tuesday is index 2, etc.
        // dayOfWeek is 0 (Sun) to 6 (Sat). We want 1 to 7.
        // (dayOfWeek === 0) ? 7 : dayOfWeek
        const columnIndexToHighlight = (highlightDayIndex === 0) ? 7 : highlightDayIndex;
        
        // Add highlight class to the cells in the correct column index
        scheduleBody.querySelectorAll(`tr > td:nth-child(${columnIndexToHighlight + 1})`).forEach(cell => {
            cell.classList.add('selected-column');
        });

        console.log(`Schedule table updated for week starting ${formatDate(startDate)}, highlighting ${highlightDateStr}`);
    }

    // Function to handle the click and update the state
    function handleDayClick(clickedDate) {
        // 1. Update the global selected date tracker
        selectedDateString = clickedDate; 
        
        // 2. Remove previous selected-day highlight from the mini-calendar
        document.querySelectorAll('.calendar-days div').forEach(div => {
            div.classList.remove('selected-day');
        });

        // 3. Highlight the newly selected day on the mini-calendar
        const newSelectedDayDiv = document.querySelector(`.calendar-days div[data-date="${clickedDate}"]`);
        if (newSelectedDayDiv) {
            newSelectedDayDiv.classList.add('selected-day');
        }

        // 4. Update the schedule table based on the selected day
        const weekStartDate = getWeekStart(clickedDate);
        updateScheduleTable(weekStartDate, clickedDate);
    }

    // --- CALENDAR RENDER (Modified to use handleDayClick) ---
    let currentYear;
    let currentMonth;

    function renderCalendar(year, month) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];

        const calendarDays = document.getElementById('calendar-days');
        const monthYearDisplay = document.getElementById('current-month-year');
        
        calendarDays.innerHTML = ''; 
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        // ... (rest of the date calculation logic remains the same) ...
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

            // Highlight today's date
            if (dateStr === todayStr) {
                dayDiv.classList.add('current-day');
            }
            
            // Highlight the currently selected date (from the global tracker)
            if (dateStr === selectedDateString) {
                dayDiv.classList.add('selected-day');
            }

            // Add the click handler
            dayDiv.addEventListener('click', (event) => {
                const clickedDate = event.target.dataset.date;
                handleDayClick(clickedDate);
            });

            calendarDays.appendChild(dayDiv);
        }
    }

    // --- INITIALIZATION (Called at the bottom of the JS file) ---
    // Get today's date and set initial state
    currentYear = new Date().getFullYear();
    currentMonth = new Date().getMonth(); 

    // 1. Initial Render
    renderCalendar(currentYear, currentMonth);

    // 2. Initial Schedule Load for the current week
    updateScheduleTable(getWeekStart(selectedDateString), selectedDateString); 

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