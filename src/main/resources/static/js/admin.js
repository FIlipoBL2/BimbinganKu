document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const topAdminTabs = document.querySelectorAll('.tab-btn-admin');
    const tabContents = document.querySelectorAll('.tab-content-admin');
    
    // Data Preview Elements
    const subTabs = document.querySelectorAll('#admin-tabs .tab-btn');
    const tableTitle = document.getElementById('table-title');
    const dataTable = document.getElementById('admin-data-table');
    const searchInput = document.getElementById('search-input');

    // Import Elements
    const importModal = document.getElementById('import-modal');
    const importForm = document.getElementById('import-form');
    const importTriggerBtns = document.querySelectorAll('.import-trigger');
    const importFile = document.getElementById('import-file');
    const targetTableSelect = document.getElementById('target-table');
    const modalCloseBtn = importModal.querySelector('.close-btn');

    // Schedule Search Elements
    const scheduleSearchBtn = document.getElementById('search-schedule-btn-new');
    const userCodeInput = document.getElementById('user-code-input-new');
    const userScheduleOutput = document.getElementById('user-schedule-output-new');

    // Logout Elements
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');


    // --- 1. TAB NAVIGATION ---

    // Top Level Tabs (Data Preview vs Import)
    topAdminTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            topAdminTabs.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab-content');
            document.getElementById(targetId).classList.remove('hidden');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Sub Tabs (Student / Lecturer / Schedule)
    subTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            subTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const type = btn.getAttribute('data-table');
            fetchAndRenderData(type);
        });
    });


    // --- 2. DATA FETCHING & RENDERING ---

    let currentData = []; // Store for search filtering

    function fetchAndRenderData(type) {
        let url = '';
        let title = '';

        if (type === 'student') {
            url = '/api/admin/students';
            title = 'Student Table';
        } else if (type === 'lecturer') {
            url = '/api/admin/lecturers';
            title = 'Lecturer Table';
        } else if (type === 'schedule') {
            url = '/api/admin/schedules';
            title = 'Global Schedule Table';
        }

        tableTitle.textContent = title;
        dataTable.innerHTML = '<tr><td>Loading...</td></tr>';

        fetch(url)
            .then(res => res.json())
            .then(data => {
                currentData = data;
                renderTable(data, type);
            })
            .catch(err => {
                console.error(err);
                dataTable.innerHTML = '<tr><td style="color:red">Error loading data.</td></tr>';
            });
    }

    function renderTable(data, type) {
        dataTable.innerHTML = ''; // Clear existing

        if (!data || data.length === 0) {
            dataTable.innerHTML = '<tr><td>No data available.</td></tr>';
            return;
        }

        // Generate Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Define columns based on type
        let columns = [];
        if (type === 'student') {
            columns = ['id', 'name', 'email', 'totalGuidanceUTS', 'totalGuidanceUAS'];
        } else if (type === 'lecturer') {
            columns = ['id', 'name', 'email'];
        } else if (type === 'schedule') {
            columns = ['title', 'day', 'startTime', 'endTime', 'place'];
        }

        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.toUpperCase();
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        dataTable.appendChild(thead);

        // Generate Body
        const tbody = document.createElement('tbody');
        data.forEach(item => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = item[col] || '-';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        dataTable.appendChild(tbody);
    }

    // --- 3. SEARCH FILTER ---
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        if (!currentData) return;

        const filtered = currentData.filter(item => {
            return Object.values(item).some(val => 
                String(val).toLowerCase().includes(term)
            );
        });
        
        // Check which tab is active to know how to render
        const activeType = document.querySelector('#admin-tabs .active').getAttribute('data-table');
        renderTable(filtered, activeType);
    });


    // --- 4. IMPORT LOGIC ---
    
    // Open Modal
    importTriggerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-target');
            if(target) targetTableSelect.value = target;
            importModal.classList.remove('hidden');
        });
    });

    // Close Modal
    modalCloseBtn.addEventListener('click', () => importModal.classList.add('hidden'));

    // Handle Form Submit
    importForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', importFile.files[0]);
        formData.append('table', targetTableSelect.value);

        fetch('/api/admin/import', {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (res.ok) {
                alert('Import Successful!');
                importModal.classList.add('hidden');
                // Refresh current table if applicable
                const activeType = document.querySelector('#admin-tabs .active').getAttribute('data-table');
                fetchAndRenderData(activeType);
            } else {
                res.text().then(text => alert('Error: ' + text));
            }
        })
        .catch(err => alert('Import Failed: ' + err));
    });


    // --- 5. SCHEDULE SEARCH PREVIEW ---
    scheduleSearchBtn.addEventListener('click', () => {
        const code = userCodeInput.value.trim();
        if (!code) return;

        userScheduleOutput.innerHTML = 'Loading...';

        fetch(`/api/admin/schedule/${code}`)
            .then(res => res.json())
            .then(data => {
                if (!data || data.length === 0) {
                    userScheduleOutput.innerHTML = '<p>No schedule found.</p>';
                    return;
                }

                let html = '<ul style="list-style:none; padding:0;">';
                data.forEach(s => {
                    // Handle both class (day_name) and guidance (date)
                    let time = `${s.time || ''}`; 
                    let when = s.date ? s.date : s.day_name;
                    html += `<li style="margin-bottom:5px; border-bottom:1px solid #ccc; padding:5px;">
                        <strong>${s.topic || 'Session'}</strong> <br>
                        ${when} | ${time} | ${s.location || 'TBA'}
                    </li>`;
                });
                html += '</ul>';
                userScheduleOutput.innerHTML = html;
            })
            .catch(err => {
                userScheduleOutput.innerHTML = '<p style="color:red">Error fetching schedule.</p>';
            });
    });


    // --- 6. LOGOUT LOGIC (FIXED) ---
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutModal.classList.remove('hidden');
    });

    cancelLogoutBtn.addEventListener('click', () => {
        logoutModal.classList.add('hidden');
    });

    confirmLogoutBtn.addEventListener('click', () => {
        // Redirect to the backend logout endpoint
        window.location.href = '/logout'; 
    });


    // --- INITIAL LOAD ---
    // Load student table by default
    fetchAndRenderData('student');

});