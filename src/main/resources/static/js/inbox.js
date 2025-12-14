document.addEventListener('DOMContentLoaded', () => {
    const inboxList = document.getElementById('inbox-list');
    const emptyMessage = document.getElementById('empty-inbox-message');
    const filterStatus = document.getElementById('filter-status');
    const userId = document.getElementById('user-id').value;

    let allMessages = [];

    // Fetch messages
    function fetchMessages() {
        if (!userId) return;

        fetch(`/api/inbox/${userId}`)
            .then(res => res.json())
            .then(data => {
                allMessages = data;
                renderMessages();
            })
            .catch(err => console.error("Error fetching messages:", err));
    }

    // Render messages based on filter
    function renderMessages() {
        const filter = filterStatus.value;
        inboxList.innerHTML = '';

        const filtered = allMessages.filter(msg => {
            if (filter === 'all') return true;
            return msg.msgType === filter; // 'read' or 'unread'
        });

        if (filtered.length === 0) {
            emptyMessage.classList.remove('hidden');
        } else {
            emptyMessage.classList.add('hidden');
            filtered.forEach(msg => {
                const li = document.createElement('li');
                li.className = 'session-item';
                
                // Bold text for unread messages
                const fontWeight = (msg.msgType === 'unread') ? 'bold' : 'normal';
                
                let actionBtnHtml = '';
                if (msg.msgType === 'unread') {
                    actionBtnHtml = `<button class="action-btn" onclick="markAsRead(${msg.id})">Mark as Read</button>`;
                } else {
                    actionBtnHtml = `<span style="color: green; font-size: 0.9em;">Read</span>`;
                }

                li.innerHTML = `
                    <div class="session-info">
                        <span class="session-title" style="font-weight: ${fontWeight}">${msg.message}</span>
                        <span class="session-date">${msg.date} ${msg.time}</span>
                    </div>
                    <div class="session-actions">
                        ${actionBtnHtml}
                    </div>
                `;
                inboxList.appendChild(li);
            });
        }
    }

    // Mark as Read function (Global to be called from onclick)
    window.markAsRead = function(id) {
        fetch(`/api/inbox/read/${id}`, { method: 'POST' })
            .then(res => {
                if (res.ok) {
                    // Update local data and re-render
                    const msg = allMessages.find(m => m.id === id);
                    if (msg) {
                        msg.msgType = 'read';
                        renderMessages();
                    }
                } else {
                    alert("Failed to mark as read");
                }
            })
            .catch(err => console.error("Error:", err));
    };

    // Listeners
    if (filterStatus) {
        filterStatus.addEventListener('change', renderMessages);
    }

    // Initial Fetch
    fetchMessages();
});