document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------
    // MOCK DATA (Replace with API calls)
    // ------------------------------
    const MOCK_UNREAD_MESSAGES = [
        { id: 101, sender: "Dr. Smith", message: "Reminder: Session moved to 10:00.", read: false },
        { id: 102, sender: "Admin", message: "Schedule updated for next week.", read: false },
        { id: 103, sender: "Dr. Jones", message: "Session notes are ready.", read: false },
    ];

    // Sessions - NOTE: dates are YYYY-MM-DD and chosen BEFORE 2025-11-27
    // These are "scheduled" sessions—some may be in the past (rendered on schedule/history)
    const MOCK_SCHEDULE = [
        { id: 1, lecturerId: 'lx', lecturer: 'Dr. X', date: '2025-11-24', time: '08:00', notes: 'Discuss chapter 3', status: 'finished' },
        { id: 2, lecturerId: 'ly', lecturer: 'Dr. Y', date: '2025-11-25', time: '09:00', notes: 'Thesis progress review', status: 'finished' },
        { id: 3, lecturerId: 'ls', lecturer: 'Dr. Smith', date: '2025-11-26', time: '10:00', notes: 'Proposal feedback', status: 'finished' },
        { id: 4, lecturerId: 'lx', lecturer: 'Dr. X', date: '2025-11-20', time: '14:00', notes: 'Write-up review', status: 'finished' },
        { id: 5, lecturerId: 'ly', lecturer: 'Dr. Y', date: '2025-11-10', time: '11:00', notes: 'Methodology check', status: 'finished' },
    ];

    const MOCK_LECTURERS = [
        { id: 'lx', name: 'Dr. X' },
        { id: 'ly', name: 'Dr. Y' },
        { id: 'ls', name: 'Dr. Smith' }
    ];

    // ------------------------------
    // Notification rendering
    // ------------------------------
    const notificationBell = document.getElementById('notification-bell');
    const unreadCountBadge = document.getElementById('unread-count');
    const notificationDropdown = document.getElementById('notification-dropdown');

    const unreadMessages = MOCK_UNREAD_MESSAGES.filter(m => !m.read);
    const unreadCount = unreadMessages.length;

    function renderNotifications() {
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
    }

    renderNotifications();

    notificationBell.addEventListener('click', (e) => {
        notificationDropdown.classList.toggle('hidden');
        const expanded = notificationBell.getAttribute('aria-expanded') === 'true';
        notificationBell.setAttribute('aria-expanded', !expanded);
        e.stopPropagation();
    });

    document.addEventListener('click', (event) => {
        if (!document.getElementById('notification-area').contains(event.target)) {
            notificationDropdown.classList.add('hidden');
            notificationBell.setAttribute('aria-expanded', 'false');
        }
    });

    // ------------------------------
    // Calendar & schedule DOM refs
    // ------------------------------
    const calendarDays = document.getElementById('calendar-days');
    const monthYearDisplay = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    const scheduleHeader = document.getElementById('schedule-header-days');
    const scheduleBody = document.getElementById('schedule-body');
    const scheduleTable = document.getElementById('weekly-schedule-table');
    const weeklyTitle = document.getElementById('weekly-title');

    const WEEKDAYS_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

    // schedule time 
    const SCHEDULE_START_HOUR = 7;
    const SCHEDULE_END_HOUR = 17;

    // selected date global (YYYY-MM-DD)
    let selectedDateString = formatDate(new Date()); // default today

    // ------------------------------
    // Helpers
    // ------------------------------
    function pad(n){ return n < 10 ? '0' + n : '' + n; }
    function formatDate(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    }
    function parseDate(s) { return new Date(s + 'T00:00:00'); } // safe parse for YYYY-MM-DD

    // return Date object for Monday of the week containing dateString
    function getWeekStart(dateString) {
        const date = parseDate(dateString);
        const day = date.getDay(); // 0 (Sun) - 6 (Sat)
        // we want Monday -> subtract (day === 0 ? 6 : day - 1)
        const subtract = (day === 0) ? 6 : (day - 1);
        date.setDate(date.getDate() - subtract);
        date.setHours(0,0,0,0);
        return date;
    }

    // produce array of dates (YYYY-MM-DD) for 7 days starting from mondayDate (Date)
    function weekDatesFromMonday(mondayDate) {
        const arr = [];
        const d = new Date(mondayDate);
        for (let i = 0; i < 7; i++) {
            arr.push(formatDate(d));
            d.setDate(d.getDate() + 1);
        }
        return arr;
    }

    // ------------------------------
    // Render timetable header + rows
    // ------------------------------
    function updateWeeklyTitle(mondayDate) {
        const end = new Date(mondayDate);
        end.setDate(end.getDate() + 6);
        const opts = { month: 'short', day: 'numeric' };
        const startStr = mondayDate.toLocaleDateString(undefined, opts);
        const endStr = end.toLocaleDateString(undefined, opts);
        weeklyTitle.textContent = `🗓️ Weekly Schedule (${startStr} — ${endStr})`;
    }

    function renderScheduleForWeek(containingDateStr) {
        // 1) compute Monday and week dates
        const monday = getWeekStart(containingDateStr);
        const weekDates = weekDatesFromMonday(monday); // array of YYYY-MM-DD for Mon..Sun
        updateWeeklyTitle(monday);

        // 2) build header row (first TH is Time)
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Time</th>';
        for (let i = 0; i < 7; i++) {
            const dateStr = weekDates[i];
            const dayLabel = WEEKDAYS_LABELS[i];
            const dayNum = parseDate(dateStr).getDate();
            const cls = (dateStr === selectedDateString) ? 'selected-column' : '';
            const th = document.createElement('th');
            th.className = cls;
            th.setAttribute('data-date', dateStr);
            th.innerHTML = `${dayLabel}<br><small>(${dayNum})</small>`;
            headerRow.appendChild(th);
        }
        scheduleHeader.innerHTML = '';
        scheduleHeader.appendChild(headerRow);

        // 3) build body rows for each hour
        scheduleBody.innerHTML = '';
        for (let hour = SCHEDULE_START_HOUR; hour <= SCHEDULE_END_HOUR; hour++) {
            const tr = document.createElement('tr');
            // first cell is time label
            const timeCell = document.createElement('td');
            timeCell.textContent = `${pad(hour)}:00`;
            tr.appendChild(timeCell);

            // create 7 cells for the 7 days
            for (let d = 0; d < 7; d++) {
                const td = document.createElement('td');
                td.setAttribute('data-date', weekDates[d]);
                td.setAttribute('data-hour', `${pad(hour)}:00`);
                // check if there's a session matching this date+hour
                const session = MOCK_SCHEDULE.find(s => s.date === weekDates[d] && s.time === `${pad(hour)}:00`);
                if (session) {
                    const div = document.createElement('div');
                    div.className = 'session';
                    div.setAttribute('data-session-id', session.id);
                    div.innerHTML = `${session.time}<br><small>(${session.lecturer})</small>`;
                    // mark finished sessions visually (we don't change CSS; keep same class)
                    td.appendChild(div);
                }
                tr.appendChild(td);
            }
            scheduleBody.appendChild(tr);
        }

        // 4) highlight selected date column (apply selected-column to TH and TDs)
        scheduleBody.querySelectorAll('td').forEach(cell => cell.classList.remove('selected-column'));
        const headers = Array.from(scheduleHeader.querySelectorAll('th'));
        const colIndex = headers.findIndex(h => h.getAttribute('data-date') === selectedDateString);
        if (colIndex !== -1) {
            // add to header th
            headers.forEach(h => h.classList.remove('selected-column'));
            headers[colIndex].classList.add('selected-column');
            // th index is 0..7 where 0 is Time, but we used header row elements appended; find actual column index in tbody (1-based)
            const bodyNth = colIndex + 1; // because first th is Time, but headers array includes that as index 0
            scheduleBody.querySelectorAll(`tr > td:nth-child(${bodyNth + 1})`).forEach(td => {
                td.classList.add('selected-column');
            });
        }
    }

    // ------------------------------
    // Calendar rendering (mini calendar) + interactions
    // ------------------------------
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    function renderCalendar(year, month) {
        calendarDays.innerHTML = '';
        const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay(); // 0..6 where 0 = Sunday

        const today = new Date();
        const todayStr = formatDate(today);

        // Leading empties for previous month's tail
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty');
            calendarDays.appendChild(emptyDiv);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dateStr = formatDate(date);
            const dayDiv = document.createElement('div');
            dayDiv.textContent = d;
            dayDiv.dataset.date = dateStr;
            dayDiv.setAttribute('role', 'gridcell');
            if (dateStr === todayStr) dayDiv.classList.add('current-day');
            if (dateStr === selectedDateString) dayDiv.classList.add('selected-day');

            dayDiv.addEventListener('click', (e) => {
                // NEW BEHAVIOR (Option A): clicking a date changes the weekly schedule to that date's week
                selectedDateString = e.currentTarget.dataset.date;
                // re-render calendar selection visuals
                document.querySelectorAll('.calendar-days .selected-day').forEach(el => el.classList.remove('selected-day'));
                e.currentTarget.classList.add('selected-day');

                // update schedule to show the week containing the clicked date
                renderScheduleForWeek(selectedDateString);

                // scroll the weekly schedule into view (optional UX)
                document.getElementById('schedule-view-wrapper').scrollIntoView({ behavior: 'smooth' });
            });

            calendarDays.appendChild(dayDiv);
        }
    }

    // month nav
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar(currentYear, currentMonth);
    });
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar(currentYear, currentMonth);
    });

    // ------------------------------
    // Session modal (new / edit / delete)
    // ------------------------------
    const addSessionBtn = document.getElementById('add-session-btn');
    const modal = document.getElementById('session-modal');
    const closeBtn = modal.querySelector('.close-btn');
    const form = document.getElementById('session-form');
    const deleteBtn = document.getElementById('delete-session-btn');
    const saveSessionBtn = document.getElementById('save-session-btn');
    const lecturerSelect = document.getElementById('session-lecturer');

    function populateLecturers() {
        lecturerSelect.innerHTML = '<option value="">Select Lecturer</option>';
        MOCK_LECTURERS.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.id;
            opt.textContent = l.name;
            lecturerSelect.appendChild(opt);
        });
    }
    populateLecturers();

    function openModal(m) { m.classList.remove('hidden'); }
    function closeModal(m) { m.classList.add('hidden'); }

    addSessionBtn.addEventListener('click', () => {
        form.reset();
        deleteBtn.classList.add('hidden');
        saveSessionBtn.textContent = 'Save Session';
        openModal(modal);
    });

    closeBtn.addEventListener('click', () => closeModal(modal));
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal(modal);
    });

    // clicking a session cell opens modal for edit
    scheduleBody.addEventListener('click', (event) => {
        const sessionCell = event.target.closest('.session');
        if (sessionCell) {
            const id = sessionCell.getAttribute('data-session-id');
            const session = MOCK_SCHEDULE.find(s => String(s.id) === String(id));
            if (session) {
                // populate the form with session data
                lecturerSelect.value = session.lecturerId || '';
                document.getElementById('session-date').value = session.date;
                document.getElementById('session-time').value = session.time;
                deleteBtn.classList.remove('hidden');
                saveSessionBtn.textContent = 'Update Session';
                openModal(modal);
            }
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            lecturer: lecturerSelect.value,
            date: document.getElementById('session-date').value,
            time: document.getElementById('session-time').value
        };
        console.log('Simulated save session:', data);
        alert('Session saved successfully! (simulated)');
        closeModal(modal);
        // TODO: POST to backend and refresh schedule; for now we could push to MOCK_SCHEDULE and re-render
    });

    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this session?')) {
            alert('Session deleted (simulated).');
            closeModal(modal);
        }
    });

    // ------------------------------
    // Logout modal logic
    // ------------------------------
    const logoutModal = document.getElementById('logout-modal');
    const logoutBtn = document.getElementById('logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(logoutModal);
    });
    cancelLogoutBtn.addEventListener('click', () => closeModal(logoutModal));
    confirmLogoutBtn.addEventListener('click', () => {
        window.location.href = '/logout'; // Spring Security /logout mapping
    });
    window.addEventListener('click', (e) => {
        if (e.target === logoutModal) closeModal(logoutModal);
    });

    // ------------------------------
    // Session History rendering
    // ------------------------------
    const historyList = document.getElementById('history-list');

    function renderHistory() {
        historyList.innerHTML = '';
        // filter finished sessions before 2025-11-27
        const cutoff = '2025-11-27';
        const finished = MOCK_SCHEDULE
            .filter(s => s.status === 'finished' && s.date < cutoff)
            .sort((a,b) => (b.date + b.time) - (a.date + a.time)); // newest first

        if (finished.length === 0) {
            historyList.innerHTML = '<p>No finished sessions yet.</p>';
            return;
        }

        finished.forEach(s => {
            const card = document.createElement('div');
            card.style = 'background:white;border-radius:8px;padding:12px;margin-bottom:10px;box-shadow:0 2px 4px rgba(0,0,0,0.06)';
            const date = new Date(s.date);
            const dateLabel = date.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
            card.innerHTML = `<strong>${dateLabel} • ${s.time}</strong>
                              <div style="margin-top:6px;">
                                <div><strong>Lecturer:</strong> ${s.lecturer}</div>
                                <div><strong>Notes:</strong> ${s.notes || '-'}</div>
                              </div>`;
            historyList.appendChild(card);
        });
    }

   

    // ------------------------------
    // Initial rendering
    // ------------------------------
    // initial state: render calendar and schedule for today's week
    renderCalendar(currentYear, currentMonth);
    renderScheduleForWeek(selectedDateString);
    renderHistory();


    // ensure current-month nav buttons wired (already wired above)
    // done

    // ------------------------------
    // END DOMContentLoaded
    // ------------------------------
});
