document.addEventListener('DOMContentLoaded', function () {


    const dayMap = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };
    let schedules = {};
    let weeklySchedules = [];
    let selectedDate = new Date();

    const npmField = document.getElementById('user-id');
    const npm = npmField ? npmField.value : null;


    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const weeklyTableBody = document.getElementById('schedule-body');


    const upcomingList = document.getElementById('upcoming-list');
    const historyList = document.getElementById('history-list');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    const sessionModal = document.getElementById('session-modal');
    const sessionModalTitle = document.getElementById('modal-title');
    const requestSessionBtn = document.getElementById('request-session-btn');
    const closeBtn = sessionModal ? sessionModal.querySelector('.close-btn') : null;
    const sessionForm = document.getElementById('session-form');
    const saveSessionBtn = document.getElementById('save-session-btn');
    const sessionIdField = document.getElementById('session-id');


    const timeInput = document.getElementById('session-time');
    if (timeInput) {
        timeInput.min = "07:00";
        timeInput.max = "19:00";
        timeInput.step = "3600";
    }


    const topicInput = document.getElementById('session-topic');
    if (topicInput) {
        topicInput.style.display = 'none';
        topicInput.removeAttribute('required');
        const topicLabel = document.querySelector('label[for="session-topic"]');
        if (topicLabel) topicLabel.style.display = 'none';
    }


    const mainLecturerCode = document.getElementById('main-lecturer-code')?.value || '';
    const lecturerScheduleFilter = document.getElementById('lecturer-schedule-filter');


    let lecturerOverlaySchedules = [];
    let selectedLecturerCode = 'all';


    if (npm) {
        console.log("Loaded Student JS for NPM:", npm);
        fetchSchedules();
        fetchAllLecturers();
    }

    renderCalendar(selectedDate);


    function fetchAllLecturers() {
        fetch('/api/admin/lecturers')
            .then(res => res.json())
            .then(lecturers => {
                if (!lecturerScheduleFilter) return;

                lecturerScheduleFilter.innerHTML = '<option value="all">All Lecturers</option>';

                lecturers.forEach(l => {
                    const opt = document.createElement('option');
                    opt.value = l.lecturerCode;

                    if (l.lecturerCode === mainLecturerCode) {
                        opt.textContent = `${l.name} (Main Lecturer)`;
                        opt.style.fontWeight = 'bold';
                    } else {
                        opt.textContent = l.name;
                    }
                    lecturerScheduleFilter.appendChild(opt);
                });
            })
            .catch(err => console.error("Error loading lecturers:", err));
    }


    if (lecturerScheduleFilter) {
        lecturerScheduleFilter.addEventListener('change', (e) => {
            selectedLecturerCode = e.target.value;
            if (selectedLecturerCode === 'all') {
                lecturerOverlaySchedules = [];
                const startOfWeek = new Date(selectedDate);
                startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
                renderWeeklySchedule(startOfWeek);
            } else {
                fetchLecturerScheduleOverlay(selectedLecturerCode);
            }
        });
    }


    function fetchLecturerScheduleOverlay(lecturerCode) {
        fetch(`/api/lecturer/schedule/${lecturerCode}`)
            .then(res => res.json())
            .then(data => {
                lecturerOverlaySchedules = [];
                data.forEach(session => {
                    if (session.date) {

                        lecturerOverlaySchedules.push(session);
                    } else if (session.day_name && dayMap[session.day_name] !== undefined) {

                        session.dayIndex = dayMap[session.day_name];
                        lecturerOverlaySchedules.push(session);
                    }
                });
                const startOfWeek = new Date(selectedDate);
                startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
                renderWeeklySchedule(startOfWeek);
            })
            .catch(err => console.error("Error loading lecturer schedule:", err));
    }


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
                renderLists();
                selectDate(selectedDate);
            })
            .catch(error => console.error('Error:', error));
    }


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
            if (schedules[dateStr] && schedules[dateStr].length > 0) {
                dayCell.classList.add('has-session');
            }
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


            if (lecturerOverlaySchedules.length > 0) {
                lecturerOverlaySchedules.forEach(os => {
                    if (os.date && os.date === dateStr) {

                        placeSessionInTable(os, i, 'teaching-schedule');
                    } else if (os.dayIndex !== undefined && os.dayIndex === i) {

                        placeSessionInTable(os, i, 'blocked-schedule');
                    }
                });
            }


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

                let displayTime = session.time.substring(0, 5);
                cell.innerHTML = `<strong>${session.topic}</strong><br><small>${session.location || ''}<br>${displayTime}</small>`;

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


    function renderLists() {
        if (!upcomingList || !historyList) return;
        upcomingList.innerHTML = '';
        historyList.innerHTML = '';

        let allSessions = [];
        for (const [date, sessions] of Object.entries(schedules)) {
            allSessions = allSessions.concat(sessions);
        }
        allSessions.sort((a, b) => a.date.localeCompare(b.date));

        let hasUpcoming = false;
        let hasHistory = false;

        allSessions.forEach(session => {
            const past = isPast(session.date);
            const li = document.createElement('li');
            li.className = 'session-item';
            const statusColor = past ? '#6c757d' : '#28a745';

            li.innerHTML = `
                <div class="session-info" style="border-left: 4px solid ${statusColor}; padding-left: 8px;">
                    <span class="session-title"><strong>${session.topic}</strong></span>
                    <span class="session-date">${session.date} | ${session.time.substring(0, 5)}</span>
                </div>
                <span class="session-location">📍 ${session.location}</span>
            `;
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => openSessionModal(session, 'edit'));

            if (past) {
                historyList.appendChild(li);
                hasHistory = true;
            } else {
                upcomingList.appendChild(li);
                hasUpcoming = true;
            }
        });

        if (!hasUpcoming) upcomingList.innerHTML = '<li>No upcoming guidance sessions.</li>';
        if (!hasHistory) historyList.innerHTML = '<li>No session history found.</li>';
    }



    const deleteSessionBtn = document.getElementById('delete-session-btn');
    const deleteReasonContainer = document.getElementById('delete-reason-container');
    const deleteReasonInput = document.getElementById('delete-reason');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');


    const mainLecturerNameVal = document.getElementById('main-lecturer-name-val')?.value || "Main Lecturer";
    const mainLecturerInput = document.getElementById('session-main-lecturer');
    

    const notesLabel = document.querySelector('label[for="session-notes"]');
    const notesInput = document.getElementById('session-notes');

    function openSessionModal(session = null, mode = 'create') {
        sessionModal.classList.remove('hidden');
        sessionForm.reset();
        

        if (deleteReasonContainer) deleteReasonContainer.classList.add('hidden');
        if (saveSessionBtn) saveSessionBtn.classList.remove('hidden');

        if (mode === 'create') {
            if (sessionModalTitle) sessionModalTitle.textContent = "Book New Session";
            sessionIdField.value = "";
            document.getElementById('session-date').value = toLocalDateString(selectedDate);
            saveSessionBtn.classList.remove('hidden');
            if (deleteSessionBtn) deleteSessionBtn.classList.add('hidden');
            

            if (notesLabel) notesLabel.style.display = 'none';
            if (notesInput) notesInput.style.display = 'none';


            if (mainLecturerInput) {
                mainLecturerInput.value = mainLecturerNameVal;
                mainLecturerInput.style.display = 'block';
                document.querySelector('label[for="session-main-lecturer"]').style.display = 'block';
            }
            

            if (additionalLecturerSelect) {
                additionalLecturerSelect.value = ""; 
                additionalLecturerSelect.disabled = false;
                additionalLecturerSelect.parentElement.classList.remove('hidden'); 
                additionalLecturerSelect.style.display = 'block';
                document.querySelector('label[for="session-additional-lecturer"]').style.display = 'block';
            }
            if (attendeesContainer) attendeesContainer.classList.add('hidden');

        }
        else if (mode === 'edit') {
            sessionIdField.value = session.id;
            const past = isPast(session.date);


            if (notesLabel) notesLabel.style.display = 'block';
            if (notesInput) {
                notesInput.style.display = 'block';
                notesInput.value = session.notes || "";
            }


            if (mainLecturerInput) {
                mainLecturerInput.value = session.mainLecturerName || mainLecturerNameVal;
                mainLecturerInput.style.display = 'block';
                document.querySelector('label[for="session-main-lecturer"]').style.display = 'block';
            }


             if (additionalLecturerSelect) {
                additionalLecturerSelect.value = session.additionalLecturer || "";
            }

            if (past) {
                if (sessionModalTitle) sessionModalTitle.textContent = "Session Details (Completed)";
                document.getElementById('session-date').value = session.date;
                document.getElementById('session-time').value = session.time.substring(0, 5);
                document.getElementById('session-location').value = session.location;
                saveSessionBtn.classList.add('hidden');
                if (deleteSessionBtn) deleteSessionBtn.classList.add('hidden');
                

                 if (additionalLecturerSelect) {
                    additionalLecturerSelect.style.display = 'none';
                    document.querySelector('label[for="session-additional-lecturer"]').style.display = 'none';
                }

                if (mainLecturerInput) {
                     mainLecturerInput.style.display = 'none';
                     document.querySelector('label[for="session-main-lecturer"]').style.display = 'none';
                }

                if (attendeesContainer) {
                    attendeesContainer.classList.remove('hidden');
                    let attendeesText = session.mainLecturerName || 'Main Lecturer';
                    if (session.additionalLecturerName) {
                        attendeesText += ` & ${session.additionalLecturerName}`;
                    }
                    document.getElementById('session-attendees').value = attendeesText;
                }

            } else {
                if (sessionModalTitle) sessionModalTitle.textContent = "Update Session";
                saveSessionBtn.classList.remove('hidden');
                document.getElementById('session-date').value = session.date;
                document.getElementById('session-time').value = session.time.substring(0, 5);
                document.getElementById('session-location').value = session.location;
                

                if (additionalLecturerSelect) {
                    additionalLecturerSelect.style.display = 'block';
                    document.querySelector('label[for="session-additional-lecturer"]').style.display = 'block';
                }
                if (attendeesContainer) attendeesContainer.classList.add('hidden'); 

                

                if (deleteSessionBtn) deleteSessionBtn.classList.remove('hidden');
            }
        }
    }


    const locationSelect = document.getElementById('session-location');
    const customLocationInput = document.getElementById('session-location-custom');
    if (locationSelect && customLocationInput) {
        locationSelect.addEventListener('change', () => {
            if (locationSelect.value === 'Other') {
                customLocationInput.style.display = 'block';
                customLocationInput.required = true;
            } else {
                customLocationInput.style.display = 'none';
                customLocationInput.required = false;
                customLocationInput.value = '';
            }
        });
    }
    const additionalLecturerSelect = document.getElementById('session-additional-lecturer');
    const attendeesContainer = document.getElementById('attendees-container');


    sessionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const start = document.getElementById('session-time').value;


        const hour = parseInt(start.split(':')[0]);
        if (hour < 7 || hour > 19) {
             alert("Session time must be between 07:00 and 19:00.");
             return;
        }


        const finalTime = `${start.split(':')[0]}:00`;

        const payload = {
            id: sessionIdField.value || null,
            studentNpm: npm,
            date: document.getElementById('session-date').value,
            time: finalTime,
            topic: "Guidance Session",
            location: document.getElementById('session-location').value === 'Other' 
                      ? document.getElementById('session-location-custom').value 
                      : document.getElementById('session-location').value,
            additionalLecturer: additionalLecturerSelect ? additionalLecturerSelect.value : null,
            initiator: 'student'
        };

        fetch('/api/student/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                alert('Session saved successfully!');
                sessionModal.classList.add('hidden');
                fetchSchedules();
            } else {
                response.text().then(text => alert('Failed to save session: ' + text));
            }
        })
        .catch(err => console.error(err));
    });


    if (deleteSessionBtn) {
        deleteSessionBtn.addEventListener('click', () => {

             saveSessionBtn.classList.add('hidden');
             deleteSessionBtn.classList.add('hidden');
             if (confirmDeleteBtn) confirmDeleteBtn.classList.remove('hidden');
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
             const id = sessionIdField.value;

             
             if (!id) {
                 alert("Error: Session ID is missing. Please close and reopen the modal.");
                 return;
             }

             fetch(`/api/session/${id}?initiator=student`, {
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
        });
    }


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
    if (document.getElementById('cancel-logout-btn')) document.getElementById('cancel-logout-btn').addEventListener('click', () => logoutModal.classList.add('hidden'));
    if (document.getElementById('confirm-logout-btn')) document.getElementById('confirm-logout-btn').addEventListener('click', () => window.location.href = '/logout');
});