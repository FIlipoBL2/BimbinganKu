document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Data ---
    const MOCK_DATA = {
        student: {
            title: "Student Table",
            headers: ["NPM", "Name", "Major", "Guidance Count"],
            rows: [
                ["6182301004", "Filipo Bintang", "Informatics", 3],
                ["6182301032", "Basilius Mozes", "Informatics", 5],
                ["6182301024", "Vince Farrel", "Informatics", 1],
            ]
        },
        lecturer: {
            title: "Lecturer Table",
            headers: ["Code", "Name", "Department", "Max Students"],
            rows: [
                ["L-001", "Dr. Smith", "Informatics", 10],
                ["L-002", "Prof. Jones", "IT", 8],
            ]
        },
        schedule: {
            title: "Schedule Table (All)",
            headers: ["Session ID", "Student NPM", "Lecturer Code", "Date", "Time", "Notes Status"],
            rows: [
                [1, "6182301004", "L-001", "2025-11-27", "09:00", "Completed"],
                [2, "6182301032", "L-002", "2025-11-28", "11:00", "Pending Notes"],
            ]
        },
        compliance: {
            title: "Compliance Report",
            headers: ["NPM", "Student Name", "Status", "Last Session Date"],
            rows: [
                ["6182301004", "Filipo Bintang", "Compliant (3/4)", "2025-11-27"],
                ["6182301024", "Vince Farrel", "Non-Compliant (1/4)", "2025-10-10"],
            ]
        }
    };
    
    // --- DOM Elements (Updated/New) ---
    const adminTabs = document.getElementById('admin-tabs'); // Kept for inner tabs
    const tableTitle = document.getElementById('table-title');
    const dataTable = document.getElementById('admin-data-table');
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementById('export-btn');
    
    // NEW Elements for top-level tabs and new import triggers
    const topAdminTabs = document.querySelectorAll('.tab-btn-admin');
    const tabContents = document.querySelectorAll('.tab-content-admin');
    const importTriggerBtns = document.querySelectorAll('.import-trigger, .update-trigger');

    // Updated/New Elements for Import Modal and Schedule Search
    const importModal = document.getElementById('import-modal');
    const modalCloseBtn = importModal.querySelector('.close-btn');
    const importForm = document.getElementById('import-form');
    // const importBtn = document.getElementById('import-btn'); // No longer needed as primary trigger
    
    // UPDATE THESE SELECTORS for the new schedule search area
    const scheduleSearchBtn = document.getElementById('search-schedule-btn-new'); 
    const userCodeInput = document.getElementById('user-code-input-new'); 
    const userScheduleOutput = document.getElementById('user-schedule-output-new');


    // --- Functions ---
    
    // Renders the selected data to the table
    const renderTable = (tableKey) => {
        const data = MOCK_DATA[tableKey];
        if (!data) return;

        tableTitle.textContent = data.title;
        dataTable.innerHTML = ''; // Clear previous content

        // Create Header
        let thead = dataTable.createTHead();
        let headerRow = thead.insertRow();
        data.headers.forEach(headerText => {
            let th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        // Create Body
        let tbody = dataTable.createTBody();
        data.rows.forEach(rowData => {
            let row = tbody.insertRow();
            rowData.forEach(cellData => {
                let cell = row.insertCell();
                cell.textContent = cellData;
            });
        });
    };

    // Filters the current table data based on search input
    const filterTable = () => {
        const query = searchInput.value.toLowerCase();
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-table');
        const originalData = MOCK_DATA[activeTab];
        
        if (!originalData) return;
        
        // Simple client-side filtering logic
        const filteredRows = originalData.rows.filter(row => 
            row.some(cell => String(cell).toLowerCase().includes(query))
        );

        // Re-render the table with filtered data
        dataTable.querySelector('tbody').innerHTML = '';
        let tbody = dataTable.createTBody();
        filteredRows.forEach(rowData => {
            let row = tbody.insertRow();
            rowData.forEach(cellData => {
                let cell = row.insertCell();
                cell.textContent = cellData;
            });
        });

        // Handle empty results
        if (filteredRows.length === 0) {
            dataTable.querySelector('tbody').innerHTML = `<tr><td colspan="${originalData.headers.length}" style="text-align: center;">No results found.</td></tr>`;
        }
    };

    // --- Event Listeners ---

    // NEW: 1. Top-Level Tab Switching (Data Preview vs. Import & Schedules)
    topAdminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab-content');
            
            // Deactivate all tabs and hide all content
            topAdminTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));

            // Activate the clicked tab and show content
            tab.classList.add('active');
            document.getElementById(targetTab).classList.remove('hidden');

            // If switching to Data Preview, re-render the default table
            if (targetTab === 'data-preview-section') {
                renderTable('student');
            }
        });
    });


    // 2. Inner Tab Switching (Student/Lecturer/Schedule/Compliance)
    // CRITICAL FIX: Check if adminTabs element exists before adding listener
    if (adminTabs) { 
        adminTabs.addEventListener('click', (event) => {
            if (event.target.classList.contains('tab-btn')) {
                const selectedTable = event.target.getAttribute('data-table');
                
                // Update active state
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');

                // Render new table
                renderTable(selectedTable);
                searchInput.value = ''; // Clear search when switching tabs
            }
        });
    }

    // 3. Search/Filter (Remains the same, uses the inner tab)
    if (searchInput) {
        searchInput.addEventListener('keyup', filterTable);
    }

    // 4. Import/Update Modal (Uses new triggers)
    importTriggerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            importModal.classList.remove('hidden');
            // Optional: Auto-select the table based on the card h3
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

    importForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const targetTable = document.getElementById('target-table').value;
        const fileName = document.getElementById('import-file').files[0].name;
        
        console.log(`Simulating import of file: ${fileName} into table: ${targetTable}`);
        alert(`Successfully started import/update for ${targetTable} using ${fileName}. (Simulation)`);
        importModal.classList.add('hidden');
        // In Spring Boot, this would be a file upload API endpoint.
    });

    // 5. Search User Schedule (Uses new triggers)
    // CRITICAL FIX: Check if scheduleSearchBtn element exists before adding listener
    if (scheduleSearchBtn) {
        scheduleSearchBtn.addEventListener('click', () => {
            const userCode = userCodeInput.value.trim();
            if (userCode) {
                console.log(`Searching schedule for user: ${userCode}`);
                // SIMULATION: Fetch relevant schedule data
                userScheduleOutput.innerHTML = `
                    <h4>Schedule for ${userCode}</h4>
                    <p><strong>Total Sessions Found:</strong> 2</p>
                    <p><strong>Next Session:</strong> 2025-12-05 10:00 with Lecturer X</p>
                    <p style="font-style: italic;">(In a real app, a mini-schedule table would be displayed here.)</p>
                `;
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
        // 1. Open the modal when the 'Logout' link is clicked
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault(); 
            logoutModal.classList.remove('hidden');
        });
    }

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
        // This URL typically directs to a server endpoint to clear the session
        window.location.href = '/logout'; 
    });

    // 4. Close modal if user clicks outside of it (optional but good UX)
    window.addEventListener('click', (event) => { 
        if (event.target === logoutModal) {
            logoutModal.classList.add('hidden');
        }
    });

    // --- Initialization ---
    renderTable('student'); // Load student table by default
});