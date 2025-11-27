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
                ["6182301063", "Antonius Revan Hariputera", "Informatics", 4],

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
    
    // --- DOM Elements ---
    const adminTabs = document.getElementById('admin-tabs');
    const tableTitle = document.getElementById('table-title');
    const dataTable = document.getElementById('admin-data-table');
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importModal = document.getElementById('import-modal');
    const modalCloseBtn = importModal.querySelector('.close-btn');
    const importForm = document.getElementById('import-form');
    const scheduleSearchBtn = document.getElementById('search-schedule-btn');
    const userCodeInput = document.getElementById('user-code-input');
    const userScheduleOutput = document.getElementById('user-schedule-output');


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

    // 1. Tab Switching
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

    // 2. Search/Filter
    searchInput.addEventListener('keyup', filterTable);

    // 3. Export CSV
    exportBtn.addEventListener('click', () => {
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-table');
        console.log(`Simulating export of ${activeTab} table to CSV...`);
        alert(`Successfully generated and downloaded ${activeTab}.csv. (Simulation)`);
        // In Spring Boot, this would trigger an API endpoint that streams the CSV data.
    });

    // 4. Import/Update Modal
    importBtn.addEventListener('click', () => {
        importModal.classList.remove('hidden');
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

    // 5. Search User Schedule
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
    // --- Initialization ---
    renderTable('student'); // Load student table by default
});