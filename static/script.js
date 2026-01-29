let conversations = JSON.parse(localStorage.getItem('conversations') || '{}');
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
    
    // Create new conversation if none exists
    if (!currentConversationId) {
        currentConversationId = Date.now().toString();
        conversations[currentConversationId] = {
            id: currentConversationId,
            title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
            messages: [],
            created_at: new Date().toISOString()
        };
    }
    
    // Add user message to conversation
    conversations[currentConversationId].messages.push({
        role: 'user',
        content: message
    });
    saveConversations();
    
    // Send to backend
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            message: message,
            history: conversations[currentConversationId].messages
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            addMessage(data.response, 'bot-message');
            conversations[currentConversationId].messages.push({
                role: 'assistant',
                content: data.response
            });
            saveConversations();
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

function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

function loadConversations() {
    conversations = JSON.parse(localStorage.getItem('conversations') || '{}');
    const listDiv = document.getElementById('conversationsList');
    listDiv.innerHTML = '';
    
    const convArray = Object.values(conversations).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );
    
    convArray.forEach(conv => {
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
}

function loadConversation(convId) {
    currentConversationId = convId;
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.innerHTML = '';
    
    const conv = conversations[convId];
    conv.messages.forEach(msg => {
        if (msg.role === 'user') {
            addMessage(msg.content, 'user-message');
        } else if (msg.role === 'assistant') {
            addMessage(msg.content, 'bot-message');
        }
    });
    
    loadConversations();
}

function deleteConversation(convId) {
    if (confirm('Delete this conversation?')) {
        delete conversations[convId];
        saveConversations();
        
        if (currentConversationId === convId) {
            newConversation();
        }
        loadConversations();
    }
}

// Allow Enter key to send message
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
