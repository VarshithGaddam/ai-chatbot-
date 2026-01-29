# Simple Chatbot with Flask and GPT-3.5 Turbo

A simple chatbot application built with Flask and OpenRouter API using GPT-3.5 Turbo model.

## Installation

1. Install Python dependencies:
```
pip install -r requirements.txt
```

## Running the Application Locally

1. Set your API key as environment variable:
```bash
# Windows CMD
set OPENROUTER_API_KEY=your_api_key_here

# Windows PowerShell
$env:OPENROUTER_API_KEY="your_api_key_here"

# Linux/Mac
export OPENROUTER_API_KEY=your_api_key_here
```

2. Run the Flask app:
```
python app.py
```

3. Open your browser and go to:
```
http://127.0.0.1:5000
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to Render, Heroku, Railway, or PythonAnywhere.

## Features

- Clean and modern chat interface
- Real-time messaging with GPT-3.5 Turbo
- Responsive design
- Easy to use and deploy

## Project Structure

- `app.py` - Main Flask application
- `templates/index.html` - Chat interface HTML
- `static/style.css` - Styling
- `static/script.js` - Frontend JavaScript
- `requirements.txt` - Python dependencies
