document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------
    // MOCK DATA: All historical messages (notifications)
    // ------------------------------
    // The main notification list should draw its unread subset from this global list.
    let INBOX_MESSAGES = [
        // Session Creation (Unread)
        { id: 1, sender: "Admin", subject: "Session Created", body: "Your guidance session with Dr. Smith on 2025-12-10 at 10:00 has been successfully booked.", date: "2025-12-05 14:30", status: 'unread', type: 'session' },
        
        // Session Update (Unread)
        { id: 2, sender: "Dr. Smith", subject: "Session Updated", body: "The location for your 2025-12-10 session has been changed to 'Online (Zoom/Meet)'.", date: "2025-12-05 14:45", status: 'unread', type: 'session' },

        // Session Deletion (Read)
        { id: 3, sender: "Admin", subject: "Session Cancelled", body: "Your session with Dr. Jones on 2025-12-08 was cancelled by the lecturer.", date: "2025-12-04 11:00", status: 'read', type: 'session' },
        
        // System Message (Read)
        { id: 4, sender: "System", subject: "Profile Update Reminder", body: "Please ensure your contact details are up to date in the system.", date: "2025-12-03 09:15", status: 'read', type: 'system' },

        // Session Notes Ready (Unread)
        { id: 5, sender: "Dr. Smith", subject: "Notes Available", body: "Session notes for your 2025-11-27 meeting are now available.", date: "2025-12-06 08:00", status: 'unread', type: 'session' },
    ];

    // ------------------------------
    // DOM Elements
    // ------------------------------
    const inboxList = document.getElementById('inbox-list');
    const filterStatus = document.getElementById('filter-status');
    const searchInput = document.getElementById('search-inbox');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    const emptyMessage = document.getElementById('empty-inbox-message');
    const backToHomeLink = document.getElementById('back-to-home-link');


    // ------------------------------
    // FUNCTIONS
    // ------------------------------

    /**
     * Renders the filtered and searched messages to the UI.
     */
    function renderInbox() {
        const statusFilter = filterStatus.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        let filteredMessages = INBOX_MESSAGES.filter(msg => {
            // 1. Filter by status (all, read, unread)
            const statusMatch = statusFilter === 'all' || msg.status === statusFilter;
            
            // 2. Filter by search term (check subject, body, and sender)
            const searchMatch = !searchTerm || 
                msg.subject.toLowerCase().includes(searchTerm) ||
                msg.body.toLowerCase().includes(searchTerm) ||
                msg.sender.toLowerCase().includes(searchTerm);
            
            return statusMatch && searchMatch;
        });

        inboxList.innerHTML = '';
        
        if (filteredMessages.length === 0) {
            emptyMessage.classList.remove('hidden');
            return;
        }

        emptyMessage.classList.add('hidden');

        filteredMessages.sort((a, b) => new Date(b.date) - new Date(a.date));

        filteredMessages.forEach(msg => {
            const listItem = document.createElement('li');
            listItem.classList.add('inbox-item');
            if (msg.status === 'unread') {
                listItem.classList.add('unread');
            }
            listItem.dataset.id = msg.id;
            
            // Format for quick view
            const bodyPreview = msg.body.length > 80 ? msg.body.substring(0, 77) + '...' : msg.body;

            listItem.innerHTML = `
                <div class="inbox-item-content">
                    <div class="inbox-item-subject">
                        <span><strong>${msg.sender}:</strong> ${msg.subject}</span>
                        <span class="inbox-item-date">${msg.date}</span>
                    </div>
                    <div class="inbox-item-body">${bodyPreview}</div>
                </div>
                <div class="inbox-actions">
                    <button data-action="${msg.status === 'unread' ? 'mark-read' : 'mark-unread'}" 
                            class="action-btn">
                        ${msg.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
                    </button>
                </div>
            `;
            
            inboxList.appendChild(listItem);
        });
    }

    /**
     * Marks a single message as read or unread.
     * @param {number} id - The ID of the message to update.
     * @param {string} newStatus - 'read' or 'unread'.
     */
    function toggleMessageStatus(id, newStatus) {
        const message = INBOX_MESSAGES.find(m => m.id === id);
        if (message) {
            message.status = newStatus;
            renderInbox(); // Re-render the list immediately
            console.log(`Message ${id} marked as ${newStatus}.`);
        }
    }

    /**
     * Marks all currently filtered unread messages as read.
     */
    function markAllAsRead() {
        if (!confirm("Are you sure you want to mark all messages as read?")) {
            return;
        }
        
        INBOX_MESSAGES.forEach(msg => {
            if (msg.status === 'unread') {
                msg.status = 'read';
            }
        });
        renderInbox();
        console.log("All messages marked as read.");
    }

    /**
     * Handles the click event delegation for all buttons within the inbox list.
     */
    function handleInboxAction(event) {
        const actionBtn = event.target.closest('.action-btn');
        if (!actionBtn) return;

        const listItem = actionBtn.closest('.inbox-item');
        const id = parseInt(listItem.dataset.id);
        const action = actionBtn.dataset.action;

        if (action === 'mark-read') {
            toggleMessageStatus(id, 'read');
        } else if (action === 'mark-unread') {
            toggleMessageStatus(id, 'unread');
        }
    }


    // ------------------------------
    // EVENT LISTENERS
    // ------------------------------

    filterStatus.addEventListener('change', renderInbox);
    searchInput.addEventListener('keyup', renderInbox);
    markAllReadBtn.addEventListener('click', markAllAsRead);
    inboxList.addEventListener('click', handleInboxAction);
    
    // Determine which dashboard link to use based on the current user's role
    // This is simple logic that assumes the user must be Student or Lecturer
    // In a real app, this would be determined by a server-side variable.
    // Determine which dashboard link to use based on the 'role' query parameter
    if (backToHomeLink) {
        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get('role'); 
        
        if (role === 'lecturer') {
            backToHomeLink.href = '/lecturer'; // Navigates to the server view mapped to lecturer.html
        } else {
            // Defaults to student if role is student or not specified
            backToHomeLink.href = '/student'; // Navigates to the server view mapped to student.html
        }
    }


    // ------------------------------
    // INITIALIZATION
    // ------------------------------
    renderInbox();
});