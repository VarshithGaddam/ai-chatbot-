from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# OpenRouter API configuration
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', '')
API_URL = "https://openrouter.ai/api/v1/chat/completions"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        # Check if API key is set
        if not OPENROUTER_API_KEY:
            return jsonify({'error': 'API key not configured. Please set OPENROUTER_API_KEY environment variable.'}), 500
        
        user_message = request.json.get('message')
        conversation_history = request.json.get('history', [])
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
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

Be helpful and answer other questions normally."""
        
        # Build messages array
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history[-10:])  # Last 10 messages
        messages.append({"role": "user", "content": user_message})
        
        data = {
            "model": "openai/gpt-3.5-turbo",
            "messages": messages
        }
        
        response = requests.post(API_URL, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        bot_response = response.json()['choices'][0]['message']['content']
        
        return jsonify({
            'response': bot_response
        })
    except requests.exceptions.RequestException as e:
        print(f"API Request Error: {str(e)}")
        return jsonify({'error': f'API request failed: {str(e)}'}), 500
    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
