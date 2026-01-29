# Deployment Guide

## Deploy to Render

### Step 1: Prepare Your Repository
1. Push this code to GitHub (if not already done)
2. Make sure all files are committed

### Step 2: Deploy on Render
1. Go to https://render.com and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: chatbot-app (or your choice)
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Free

### Step 3: Add Environment Variable
In Render dashboard:
1. Go to "Environment" tab
2. Add environment variable:
   - **Key**: `OPENROUTER_API_KEY`
   - **Value**: `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`

### Step 4: Deploy
Click "Create Web Service" and wait for deployment (2-3 minutes)

Your app will be live at: `https://your-app-name.onrender.com`

---

## Alternative: Deploy to Heroku

### Prerequisites
- Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

### Steps
```bash
# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Set environment variable
heroku config:set OPENROUTER_API_KEY=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

# Deploy
git push heroku main
```

---

## Alternative: Deploy to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variable `OPENROUTER_API_KEY` in settings
5. Railway will auto-detect and deploy

---

## Alternative: Deploy to PythonAnywhere

1. Sign up at https://www.pythonanywhere.com
2. Upload your files via Files tab
3. Create a new web app (Flask)
4. Configure WSGI file to point to your app
5. Set environment variable in web app settings
6. Reload the web app

---

## Important Notes

⚠️ **Session Storage**: This app uses Flask sessions which are stored in-memory. On free hosting platforms, the server may restart and lose conversations. For production, consider using:
- Redis for session storage
- Database (PostgreSQL, MongoDB) for persistent storage

⚠️ **API Key Security**: Never commit your API key to GitHub. Always use environment variables.
