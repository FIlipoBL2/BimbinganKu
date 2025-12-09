document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
    const inboxList = document.getElementById('inbox-list');
    const emptyMessage = document.getElementById('empty-inbox-message');
    const filterStatus = document.getElementById('filter-status');
    const searchInput = document.getElementById('search-inbox');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    const backToHomeLink = document.getElementById('back-to-home-link');

    // ------------------------------
    // MOCK DATA (No Database yet)
    // ------------------------------
    let currentMessages = [
        { 
            id: 1, 
            sender: "System", 
            subject: "Welcome", 
            body: "Welcome to BimbinganKu system!", 
            date: "2025-10-25 09:00", 
            status: 'unread' 
        },
        { 
            id: 2, 
            sender: "Admin", 
            subject: "Session Created", 
            body: "A new guidance session was scheduled.", 
            date: "2025-10-26 14:30", 
            status: 'unread' 
        },
        { 
            id: 3, 
            sender: "Lecturer CEN", 
            subject: "Feedback Added", 
            body: "Please revise Chapter 1 based on comments.", 
            date: "2025-10-28 10:00", 
            status: 'read' 
        }
    ];

    // ------------------------------
    // RENDER LOGIC
    // ------------------------------

    function renderInbox() {
        const filterVal = filterStatus ? filterStatus.value : 'all';
        const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

        // Filter Data
        const filteredMessages = currentMessages.filter(msg => {
            const matchesStatus = (filterVal === 'all') || (msg.status === filterVal);
            const matchesSearch = msg.subject.toLowerCase().includes(searchVal) || 
                                  msg.sender.toLowerCase().includes(searchVal) ||
                                  msg.body.toLowerCase().includes(searchVal);
            return matchesStatus && matchesSearch;
        });

        // Clear List
        inboxList.innerHTML = '';

        if (filteredMessages.length === 0) {
            emptyMessage.classList.remove('hidden');
        } else {
            emptyMessage.classList.add('hidden');
            
            filteredMessages.forEach(msg => {
                const li = document.createElement('li');
                li.className = 'session-item'; // Re-use card style from global.css
                
                // Visual distinction for unread
                const borderColor = msg.status === 'unread' ? '#007bff' : '#ccc';
                const fontWeight = msg.status === 'unread' ? 'bold' : 'normal';
                
                li.innerHTML = `
                    <div class="session-info" style="border-left: 4px solid ${borderColor}; padding-left: 10px; flex-grow: 1;">
                        <span class="session-title" style="font-weight: ${fontWeight};">${msg.subject}</span>
                        <span class="session-date" style="font-size: 0.85em; color: #666;">From: ${msg.sender} | ${msg.date}</span>
                        <p style="margin: 5px 0 0; font-size: 0.9em; color: #444;">${msg.body}</p>
                    </div>
                `;
                
                inboxList.appendChild(li);
            });
        }
    }

    // ------------------------------
    // EVENT LISTENERS
    // ------------------------------

    if(filterStatus) filterStatus.addEventListener('change', renderInbox);
    if(searchInput) searchInput.addEventListener('input', renderInbox);
    
    // Back Link Logic
    if (backToHomeLink) {
        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get('role'); 
        
        if (role === 'lecturer') {
            backToHomeLink.href = '/lecturer/home'; 
        } else {
            backToHomeLink.href = '/student/home'; 
        }
    }

    // Initial Render
    renderInbox();
});