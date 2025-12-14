document.addEventListener('DOMContentLoaded', function () {


    const dayMap = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };
    let schedules = {};
    let weeklySchedules = [];
    let studentOverlaySchedules = [];
    let lecturerOverlaySchedules = [];
    let selectedDate = new Date();
    let currentFilter = 'all';
    let currentListFilter = 'all';

    const codeField = document.getElementById('user-id');
    const lecturerCode = codeField ? codeField.value : null;


    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const weeklyTableBody = document.getElementById('schedule-body');
    const listFilterSelect = document.getElementById('list-student-filter');


    const studentOverlayBtn = document.getElementById('student-overlay-btn');
    const studentOverlayDropdown = document.getElementById('student-overlay-dropdown');
    const lecturerOverlayBtn = document.getElementById('lecturer-overlay-btn');
    const lecturerOverlayDropdown = document.getElementById('lecturer-overlay-dropdown');
    let selectedStudentOverlays = [];
    let selectedLecturerOverlays = [];


    const upcomingList = document.getElementById('upcoming-list');
    const historyList = document.getElementById('history-list');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');


    const sessionModal = document.getElementById('session-modal');
    const sessionModalTitle = document.getElementById('modal-title') || document.querySelector('#session-modal h3');
    const closeBtn = sessionModal ? sessionModal.querySelector('.close-btn') : null;
    const sessionForm = document.getElementById('session-form');
    const saveSessionBtn = document.getElementById('save-session-btn');
    const sessionIdField = document.getElementById('session-id');
    const studentSelect = document.getElementById('session-student');
    const addSessionBtn = document.getElementById('add-session-btn');
    const deleteSessionBtn = document.getElementById('delete-session-btn');


    const timeInput = document.getElementById('session-time');
    if (timeInput) {
        timeInput.min = "06:00";
        timeInput.max = "23:00";
        timeInput.step = "60";
    }


    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        return d;
    }


    const weekDisplay = document.getElementById('week-display');
    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');
    let currentWeekStart = getStartOfWeek(new Date());


    const topicInput = document.getElementById('session-topic');
    if (topicInput) {
        topicInput.style.display = 'none';
        topicInput.removeAttribute('required');
        const topicLabel = document.querySelector('label[for="session-topic"]');
        if (topicLabel) topicLabel.style.display = 'none';
    }


    if (lecturerCode) {
        console.log("Loaded Lecturer JS for Code:", lecturerCode);
        fetchStudents().then(() => {
            fetchSchedules();
        });
        fetchLecturers();
    }

    renderCalendar(selectedDate);


    function fetchLecturers() {
        fetch('/api/admin/lecturers')
            .then(res => res.json())
            .then(lecturers => {
                initLecturerOverlayFilter(lecturers);
            })
            .catch(err => console.error("Error loading lecturers:", err));
    }


    function updateOverlayData() {
        // Clear current
        studentOverlaySchedules = [];
        lecturerOverlaySchedules = [];

        const promises = [];

        // Fetch selected Students
        selectedStudentOverlays.forEach(npm => {
            promises.push(fetch(`/api/student/schedule/${npm}`)
                .then(res => res.json())
                .then(data => {
                    data.forEach(s => {
                        // Adapt structure if needed
                         let label = s.type === 'class' ? 'Class' : 'Student';
                         let name = s.studentName || s.studentNpm || npm;
                         let detail = (s.type !== 'class' && (s.topicCode || s.topic)) ? ` (${s.topicCode || s.topic})` : '';
                         s.topic = `${label}: ${name}${detail}`;
                         studentOverlaySchedules.push(s);
                    });
                }));
        });

        // Fetch selected Lecturers
        selectedLecturerOverlays.forEach(code => {
            promises.push(fetch(`/api/lecturer/schedule/${code}`)
                .then(res => res.json())
                .then(data => {
                    data.forEach(s => {
                         let label = s.type === 'class' ? 'Class' : 'Session';
                         let detail = s.type === 'class' ? '' : ` (${s.topic})`;
                         s.topic = `${label}: ${s.lecturerName || code}${detail}`;
                         lecturerOverlaySchedules.push(s);
                    });
                }));
        });

        Promise.all(promises).then(() => {
            renderWeeklySchedule(currentWeekStart);
        });
    }

    function initLecturerOverlayFilter(lecturers) {
        if (!lecturerOverlayDropdown) return;
        lecturerOverlayDropdown.innerHTML = '';

        lecturers.forEach(l => {
            const item = document.createElement('div');
            item.className = 'overlay-checkbox-item';
            item.innerHTML = `
                <input type="checkbox" id="overlay-lecturer-${l.lecturerCode}" value="${l.lecturerCode}">
                <label for="overlay-lecturer-${l.lecturerCode}">${l.name}</label>
            `;
            lecturerOverlayDropdown.appendChild(item);

            item.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedLecturerOverlays.push(l.lecturerCode);
                } else {
                    selectedLecturerOverlays = selectedLecturerOverlays.filter(id => id !== l.lecturerCode);
                }
                updateOverlayData();
            });
        });
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


    let allStudents = [];
    const studentListContainer = document.getElementById('student-list-container');
    const studentSearch = document.getElementById('student-search');
    const currentPeriod = document.getElementById('current-period')?.value || 'UAS';
    const requiredSessions = 3;

    function fetchStudents() {
        return fetch(`/api/lecturer/students/${lecturerCode}`)
            .then(res => res.json())
            .then(students => {
                allStudents = students;


                if (studentSelect) {
                    studentSelect.innerHTML = '<option value="" disabled selected>Select Student</option>';
                    students.forEach(s => {
                        const modalOpt = document.createElement('option');
                        modalOpt.value = s.npm;
                        modalOpt.textContent = `${s.name} (${s.npm})`;
                        studentSelect.appendChild(modalOpt);
                    });
                }

                if (listFilterSelect) {
                    listFilterSelect.innerHTML = '<option value="all">All Students</option>';
                    students.forEach(s => {
                         const opt = document.createElement('option');
                         opt.value = s.npm;
                         opt.textContent = s.name;
                         listFilterSelect.appendChild(opt);
                    });

                    listFilterSelect.addEventListener('change', (e) => {
                        currentListFilter = e.target.value;
                        renderLists();
                    });
                }
                
                initStudentOverlayFilter(students);
                renderStudentList(students);
            })
            .catch(err => console.error("Error loading students:", err));
    }

    function renderStudentList(students) {
        if (!studentListContainer) return;
        studentListContainer.innerHTML = '';

        students.forEach(s => {
            // Get current period session count
            const count = currentPeriod === 'UTS' ? (s.totalGuidanceUTS || 0) : (s.totalGuidanceUAS || 0);


            let colorClass = 'eligibility-red';
            if (count >= requiredSessions) {
                colorClass = 'eligibility-green';
            } else if (count >= 2) {
                colorClass = 'eligibility-blue';
            }

            const card = document.createElement('div');
            card.className = 'student-card';
            card.innerHTML = `
                <div class="student-info">
                    <span class="student-name">${s.name}</span>
                    <span class="student-npm">${s.npm}</span>
                </div>
                <div class="student-badge">
                    <span class="session-count-badge ${colorClass}">${count}</span>
                </div>
            `;
            studentListContainer.appendChild(card);
            
            // Interaction: Click to Overlay AND Filter
            card.addEventListener('click', () => {
                // 1. Toggle Overlay Checkbox (Visual Schedule)
                const overlayCheckbox = document.getElementById(`overlay-student-${s.npm}`);
                if (overlayCheckbox) {
                    if (!overlayCheckbox.checked) {
                        overlayCheckbox.checked = true;
                        // Trigger change event to update the overlay map
                        overlayCheckbox.dispatchEvent(new Event('change'));
                    }
                    
                    // Scroll to the Weekly Schedule List Header (<h2>)
                    const scheduleHeader = document.getElementById('list-schedule-header');
                    if (scheduleHeader) {
                        const headerOffset = 100; // 80px fixed nav + buffer
                        const elementPosition = scheduleHeader.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.scrollY - headerOffset;
                    
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }
                }

                // 2. Set List Filter (Upcoming/History)
                if (listFilterSelect) {
                    listFilterSelect.value = s.npm;
                    // Trigger change manually since setting value programmatically doesn't fire it
                    listFilterSelect.dispatchEvent(new Event('change'));
                    
                    // Ensure the correct tab is visible (optional, but good UX)
                    // If focusing on a student, maybe Upcoming is best default?
                    // Already default.
                }
            });
        });
    }


    if (studentSearch) {
        studentSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allStudents.filter(s =>
                s.name.toLowerCase().includes(query) || s.npm.includes(query)
            );
            renderStudentList(filtered);
        });
    }



    function initStudentOverlayFilter(students) {
        if (!studentOverlayDropdown) return;
        studentOverlayDropdown.innerHTML = '';

        students.forEach(s => {
            const item = document.createElement('div');
            item.className = 'overlay-checkbox-item';
            item.innerHTML = `
                <input type="checkbox" id="overlay-student-${s.npm}" value="${s.npm}">
                <label for="overlay-student-${s.npm}">${s.name}</label>
            `;
            studentOverlayDropdown.appendChild(item);

            item.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedStudentOverlays.push(s.npm);
                } else {
                    selectedStudentOverlays = selectedStudentOverlays.filter(id => id !== s.npm);
                }
                updateOverlayData();
            });
        });
    }


    if (studentOverlayBtn) {
        studentOverlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            studentOverlayDropdown.classList.toggle('show');
            if (lecturerOverlayDropdown) lecturerOverlayDropdown.classList.remove('show');
        });
    }
    if (lecturerOverlayBtn) {
        lecturerOverlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            lecturerOverlayDropdown.classList.toggle('show');
            if (studentOverlayDropdown) studentOverlayDropdown.classList.remove('show');
        });
    }


    document.addEventListener('click', () => {
        if (studentOverlayDropdown) studentOverlayDropdown.classList.remove('show');
        if (lecturerOverlayDropdown) lecturerOverlayDropdown.classList.remove('show');
    });


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


    function createSessionListItem(session, isPast) {
        const li = document.createElement('li');
        li.className = 'session-item';


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

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() - 1);
            renderCalendar(selectedDate);
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() + 1);
            renderCalendar(selectedDate);
        });
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


            studentOverlaySchedules.forEach(s => {
                if (s.date === dateStr) {
                    let css = s.type === 'class' ? 'overlay-student-class' : 'overlay-student';
                    placeSessionInTable(s, i, css);
                }
                // Handle student weekly class (StudentSchedule has day_name)
                if (s.type === 'class' && s.day_name && dayMap[s.day_name] === i) {
                     placeSessionInTable(s, i, 'overlay-student-class');
                }
            });
            lecturerOverlaySchedules.forEach(l => {
                if (l.date === dateStr) {
                    let css = l.type === 'class' ? 'overlay-lecturer-class' : 'overlay-lecturer';
                    placeSessionInTable(l, i, css);
                }
                if (l.day_name && dayMap[l.day_name] === i) {
                    let css = l.type === 'class' ? 'overlay-lecturer-class' : 'overlay-lecturer';
                    placeSessionInTable(l, i, css);
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


    const deleteReasonContainer = document.getElementById('delete-reason-container');
    const deleteReasonInput = document.getElementById('delete-reason');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    function openSessionModal(session, mode) {
        sessionModal.classList.remove('hidden');
        sessionForm.reset();


        if (deleteReasonContainer) deleteReasonContainer.classList.add('hidden');
        if (saveSessionBtn) saveSessionBtn.classList.remove('hidden');

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


            const addLecturerSelect = document.getElementById('session-additional-lecturer');
            if (addLecturerSelect) {
                addLecturerSelect.value = session.additionalLecturer || session.additionallecturer || "";
            }

            let studentVal = session.studentNpm || session.studentnpm;
            if (studentSelect && studentVal) {
                studentSelect.value = studentVal;
                studentSelect.disabled = true;
            }


            if (deleteSessionBtn) deleteSessionBtn.classList.remove('hidden');
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
    

    sessionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const start = document.getElementById('session-time').value;
        const student = studentSelect ? studentSelect.value : null;

        if (!student) {
            alert("Please select a student.");
            return;
        }


        const hour = parseInt(start.split(':')[0]);
        if (hour < 6 || hour > 23) {
             alert("Session time must be between 06:00 and 23:00.");
             return;
        }
        const finalTime = `${start.split(':')[0]}:00`;
        
        const payload = {
            id: sessionIdField.value || null,
            studentNpm: student,
            date: document.getElementById('session-date').value,
            time: finalTime,
            location: document.getElementById('session-location').value === 'Other' 
                      ? document.getElementById('session-location-custom').value 
                      : document.getElementById('session-location').value,
            notes: document.getElementById('session-notes').value,
            additionalLecturer: document.getElementById('session-additional-lecturer') ? document.getElementById('session-additional-lecturer').value : null,
            initiator: 'lecturer'
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
                 alert("Error: Session ID is missing.");
                 return;
             }

             console.log("Sending DELETE request for ID:", id);
             fetch(`/api/session/${id}?initiator=lecturer`, {
                 method: 'DELETE'
             })
             .then(res => {
                 if (res.ok) {
                     alert("Session deleted.");
                     sessionModal.classList.add('hidden');
                     fetchSchedules();
                 } else {
                     res.text().then(text => alert("Failed to delete session: " + text));
                 }
             })
             .catch(err => alert("Network Error: " + err));
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => sessionModal.classList.add('hidden'));
    // Navigation Listeners
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
             currentWeekStart.setDate(currentWeekStart.getDate() - 7);
             updateWeekDisplay();
             renderWeeklySchedule(currentWeekStart);
        });
    }

    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
             currentWeekStart.setDate(currentWeekStart.getDate() + 7);
             updateWeekDisplay();
             renderWeeklySchedule(currentWeekStart);
        });
    }

    if (addSessionBtn) {
        addSessionBtn.addEventListener('click', () => openSessionModal(null, 'create'));
    }



    function selectDate(date) {
        selectedDate = new Date(date);
        renderCalendar(selectedDate);
        document.getElementById('session-date').value = toLocalDateString(selectedDate);
        

        currentWeekStart = new Date(selectedDate);
        currentWeekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        updateWeekDisplay();
        renderWeeklySchedule(currentWeekStart);
    }
    

    renderCalendar(selectedDate);
    fetchSchedules(); 
    fetchStudents();



    function updateWeekDisplay() {
        const endOfWeek = new Date(currentWeekStart);
        endOfWeek.setDate(currentWeekStart.getDate() + 6);
        const options = { month: 'short', day: 'numeric' };
        const startStr = currentWeekStart.toLocaleDateString('en-US', options);
        const endStr = endOfWeek.toLocaleDateString('en-US', options);
        if (weekDisplay) {
            weekDisplay.textContent = `🗓️ ${startStr} - ${endStr}`;
        }
    }

    // Initialize week display
    updateWeekDisplay();

    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logoutModal.classList.remove('hidden'); });
    if (document.getElementById('cancel-logout-btn')) document.getElementById('cancel-logout-btn').addEventListener('click', () => logoutModal.classList.add('hidden'));
    if (document.getElementById('confirm-logout-btn')) document.getElementById('confirm-logout-btn').addEventListener('click', () => window.location.href = '/logout');
});