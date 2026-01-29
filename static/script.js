let currentConversationId = null;

// Load conversations on page load
window.onload = function() {
    loadConversations();
};

function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Display user message
    addMessage(message, 'user-message');
    input.value = '';
    
    // Send to backend
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            message: message,
            conversation_id: currentConversationId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            addMessage(data.response, 'bot-message');
            currentConversationId = data.conversation_id;
            loadConversations();
        } else {
            addMessage('Sorry, something went wrong.', 'bot-message');
        }
    })
    .catch(error => {
        addMessage('Error: Could not connect to the server.', 'bot-message');
    });
}

function addMessage(text, className) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    
    const p = document.createElement('p');
    p.textContent = text;
    messageDiv.appendChild(p);
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function newConversation() {
    currentConversationId = null;
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.innerHTML = '';
    addMessage("Hello! I'm your AI assistant. How can I help you today?", 'bot-message');
    
    // Remove active class from all conversations
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
}

function loadConversations() {
    fetch('/conversations')
        .then(response => response.json())
        .then(data => {
            const listDiv = document.getElementById('conversationsList');
            listDiv.innerHTML = '';
            
            data.conversations.forEach(conv => {
                const convDiv = document.createElement('div');
                convDiv.className = 'conversation-item';
                if (conv.id === currentConversationId) {
                    convDiv.className += ' active';
                }
                
                const titleSpan = document.createElement('span');
                titleSpan.textContent = conv.title;
                titleSpan.style.flex = '1';
                titleSpan.onclick = () => loadConversation(conv.id);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-conv-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                };
                
                convDiv.appendChild(titleSpan);
                convDiv.appendChild(deleteBtn);
                listDiv.appendChild(convDiv);
            });
        });
}

function loadConversation(convId) {
    fetch(`/conversation/${convId}`)
        .then(response => response.json())
        .then(data => {
            currentConversationId = convId;
            const messagesDiv = document.getElementById('chatMessages');
            messagesDiv.innerHTML = '';
            
            data.messages.forEach(msg => {
                if (msg.role === 'user') {
                    addMessage(msg.content, 'user-message');
                } else if (msg.role === 'assistant') {
                    addMessage(msg.content, 'bot-message');
                }
            });
            
            loadConversations();
        });
}

function deleteConversation(convId) {
    if (confirm('Delete this conversation?')) {
        fetch(`/conversation/${convId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (currentConversationId === convId) {
                newConversation();
            }
            loadConversations();
        });
    }
}

// Allow Enter key to send message
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
