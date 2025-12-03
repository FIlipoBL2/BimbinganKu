document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const adminTabs = document.getElementById('admin-tabs');
    const tableTitle = document.getElementById('table-title');
    const dataTable = document.getElementById('admin-data-table');
    const searchInput = document.getElementById('search-input');

    const topAdminTabs = document.querySelectorAll('.tab-btn-admin');
    const tabContents = document.querySelectorAll('.tab-content-admin');
    const importTriggerBtns = document.querySelectorAll('.import-trigger, .update-trigger');

    const importModal = document.getElementById('import-modal');
    const modalCloseBtn = importModal.querySelector('.close-btn');
    const importForm = document.getElementById('import-form');

    const scheduleSearchBtn = document.getElementById('search-schedule-btn-new');
    const userCodeInput = document.getElementById('user-code-input-new');
    const userScheduleOutput = document.getElementById('user-schedule-output-new');


    // --- State ---
    let currentData = [];
    let currentTableType = 'student'; // Default

    // --- Functions ---

    // Fetch data from API
    const fetchData = async (type) => {
        try {
            let url = '';
            if (type === 'student') url = '/api/admin/students';
            else if (type === 'lecturer') url = '/api/admin/lecturers';
            else if (type === 'schedule') url = '/api/admin/schedules';
            else return []; // Compliance not implemented yet

            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    };

    // Renders the table
    const renderTable = (type, data) => {
        currentTableType = type;
        currentData = data;

        dataTable.innerHTML = ''; // Clear previous content

        // Define Headers based on type
        let headers = [];
        if (type === 'student') headers = ["NPM", "Name", "Email", "Total Guidance"];
        else if (type === 'lecturer') headers = ["Code", "Name", "Email"];
        else if (type === 'schedule') headers = ["Type", "Title", "Day", "Start", "End", "Description"];

        // Create Header
        let thead = dataTable.createTHead();
        let headerRow = thead.insertRow();
        headers.forEach(headerText => {
            let th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        // Create Body
        let tbody = dataTable.createTBody();
        data.forEach(item => {
            let row = tbody.insertRow();

            if (type === 'student') {
                row.insertCell().textContent = item.npm;
                row.insertCell().textContent = item.name;
                row.insertCell().textContent = item.email;
                row.insertCell().textContent = (item.totalGuidanceUTS || 0) + (item.totalGuidanceUAS || 0);
            } else if (type === 'lecturer') {
                // Lecturer ID is stored in 'id' field of User object, but usually mapped to lecturerCode
                // In LecturerRepository we mapped it to User object which has id, name, email.
                // Wait, LecturerRepository returns User objects. User object doesn't have 'lecturerCode' field explicitly if it's just User class.
                // Let's check User class. It has 'id'.
                row.insertCell().textContent = item.lecturerCode || 'N/A';
                row.insertCell().textContent = item.name;
                row.insertCell().textContent = item.email;
            } else if (type === 'schedule') {
                row.insertCell().textContent = item.type;
                row.insertCell().textContent = item.title;
                row.insertCell().textContent = item.day;
                row.insertCell().textContent = item.startTime;
                row.insertCell().textContent = item.endTime;
                row.insertCell().textContent = item.description || '-';
            }
        });

        if (data.length === 0) {
            let row = tbody.insertRow();
            let cell = row.insertCell();
            cell.colSpan = headers.length;
            cell.textContent = "No data found.";
            cell.style.textAlign = "center";
        }
    };

    const loadAndRender = async (type) => {
        const data = await fetchData(type);
        renderTable(type, data);

        // Update Title
        if (type === 'student') tableTitle.textContent = "Student Table";
        else if (type === 'lecturer') tableTitle.textContent = "Lecturer Table";
        else if (type === 'schedule') tableTitle.textContent = "Schedule Table";
    };

    // Filters the current table data based on search input
    const filterTable = () => {
        const query = searchInput.value.toLowerCase();
        if (!currentData) return;

        const filteredData = currentData.filter(item => {
            return Object.values(item).some(val =>
                String(val).toLowerCase().includes(query)
            );
        });

        // Re-render with filtered data (pass type to keep headers)
        renderTable(currentTableType, filteredData);
    };

    // --- Event Listeners ---

    // 1. Top-Level Tab Switching
    topAdminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab-content');

            topAdminTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));

            tab.classList.add('active');
            document.getElementById(targetTab).classList.remove('hidden');

            if (targetTab === 'data-preview-section') {
                loadAndRender('student'); // Default
            }
        });
    });


    // 2. Inner Tab Switching
    if (adminTabs) {
        adminTabs.addEventListener('click', (event) => {
            if (event.target.classList.contains('tab-btn')) {
                const selectedTable = event.target.getAttribute('data-table');

                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');

                loadAndRender(selectedTable);
                searchInput.value = '';
            }
        });
    }

    // 3. Search/Filter
    if (searchInput) {
        searchInput.addEventListener('keyup', filterTable);
    }

    // 4. Import/Update Modal
    importTriggerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            importModal.classList.remove('hidden');
            const targetTable = btn.closest('.card').querySelector('h3').textContent.split(' ')[0].toLowerCase();
            document.getElementById('target-table').value = targetTable;
        });
    });

    modalCloseBtn.addEventListener('click', () => {
        importModal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target === importModal) {
            importModal.classList.add('hidden');
        }
    });

    importForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const targetTable = document.getElementById('target-table').value;
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];

        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('table', targetTable);

        try {
            const response = await fetch('/api/admin/import', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Import successful!');
                importModal.classList.add('hidden');
                // Refresh table if we are viewing the one we just imported
                if (currentTableType === targetTable) {
                    loadAndRender(targetTable);
                }
            } else {
                const msg = await response.text();
                alert('Import failed: ' + msg);
            }
        } catch (error) {
            console.error('Error importing:', error);
            alert('Import failed: ' + error.message);
        }
    });

    // 5. Search User Schedule
    if (scheduleSearchBtn) {
        scheduleSearchBtn.addEventListener('click', async () => {
            const userCode = userCodeInput.value.trim();
            if (userCode) {
                userScheduleOutput.innerHTML = 'Loading...';
                try {
                    const response = await fetch(`/api/admin/schedule/${userCode}`);
                    const schedules = await response.json();

                    if (schedules.length > 0) {
                        let html = `<h4>Schedule for ${userCode}</h4><ul>`;
                        schedules.forEach(s => {
                            html += `<li><strong>${s.day} ${s.startTime}-${s.endTime}</strong>: ${s.title} (${s.type})</li>`;
                        });
                        html += '</ul>';
                        userScheduleOutput.innerHTML = html;
                    } else {
                        userScheduleOutput.innerHTML = `<p>No schedule found for ${userCode}</p>`;
                    }
                } catch (error) {
                    userScheduleOutput.innerHTML = `<p style="color: red;">Error fetching schedule.</p>`;
                }
            } else {
                userScheduleOutput.innerHTML = `<p style="color: red;">Please enter a valid NPM or LecturerCode.</p>`;
            }
        });
    }

    // --- Logout Modal Logic ---
    const logoutModal = document.getElementById('logout-modal');
    const logoutBtn = document.getElementById('logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            logoutModal.classList.remove('hidden');
        });
    }

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

    // --- Initialization ---
    loadAndRender('student');
});