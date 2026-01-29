from flask import Flask, render_template, request, jsonify, session
import requests
import secrets
import uuid
from datetime import datetime

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)  # For session management

# OpenRouter API configuration
OPENROUTER_API_KEY = "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"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Store conversations in session
def get_all_conversations():
    if 'conversations' not in session:
        session['conversations'] = {}
    return session['conversations']

def get_conversation(conv_id):
    conversations = get_all_conversations()
    if conv_id not in conversations:
        conversations[conv_id] = {
            'id': conv_id,
            'title': 'New Chat',
            'messages': [],
            'created_at': datetime.now().isoformat()
        }
        session['conversations'] = conversations
    return conversations[conv_id]

def save_conversation(conv_id, conversation):
    conversations = get_all_conversations()
    conversations[conv_id] = conversation
    session['conversations'] = conversations

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    conv_id = request.json.get('conversation_id')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    # Create new conversation if none exists
    if not conv_id:
        conv_id = str(uuid.uuid4())
    
    conversation = get_conversation(conv_id)
    
    # Add user message to conversation
    conversation['messages'].append({"role": "user", "content": user_message})
    
    # Update conversation title with first message
    if conversation['title'] == 'New Chat':
        conversation['title'] = user_message[:30] + ('...' if len(user_message) > 30 else '')
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # System prompt
    system_prompt = """You are an AI chatbot assistant. When asked about your framework, architecture, or how you were built, explain that:

- You are built using Flask (a Python web framework) for the backend
- Your frontend uses HTML, CSS, and JavaScript for the user interface
- You use the OpenRouter API to access GPT-3.5 Turbo model
- The architecture includes:
  * Flask server (app.py) handling HTTP requests
  * HTML template (index.html) for the chat interface
  * CSS styling for modern, responsive design
  * JavaScript for real-time message handling
  * REST API endpoint (/chat) for communication between frontend and backend
- You don't use Bot Framework SDK or emulator - this is a custom web-based implementation
- The application runs on localhost (127.0.0.1:5000) during development

Be helpful and answer other questions normally."""
    
    # Build messages array
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation['messages'][-10:])  # Last 10 messages
    
    data = {
        "model": "openai/gpt-3.5-turbo",
        "messages": messages
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=data)
        response.raise_for_status()
        bot_response = response.json()['choices'][0]['message']['content']
        
        # Add bot response to conversation
        conversation['messages'].append({"role": "assistant", "content": bot_response})
        save_conversation(conv_id, conversation)
        
        return jsonify({
            'response': bot_response,
            'conversation_id': conv_id
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/conversations', methods=['GET'])
def get_conversations():
    conversations = get_all_conversations()
    conv_list = [
        {
            'id': conv['id'],
            'title': conv['title'],
            'created_at': conv['created_at']
        }
        for conv in conversations.values()
    ]
    # Sort by created_at descending
    conv_list.sort(key=lambda x: x['created_at'], reverse=True)
    return jsonify({'conversations': conv_list})

@app.route('/conversation/<conv_id>', methods=['GET'])
def get_conversation_by_id(conv_id):
    conversation = get_conversation(conv_id)
    return jsonify({'messages': conversation['messages']})

@app.route('/conversation/<conv_id>', methods=['DELETE'])
def delete_conversation(conv_id):
    conversations = get_all_conversations()
    if conv_id in conversations:
        del conversations[conv_id]
        session['conversations'] = conversations
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)
