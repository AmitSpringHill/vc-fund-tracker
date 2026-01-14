# Deployment Guide

Your code is now on GitHub: **https://github.com/AmitSpringHill/vc-fund-tracker**

Follow these steps to deploy your app to the cloud so it runs online (not locally).

## Option 1: Deploy to Railway (Recommended)

Railway is the easiest way to deploy full-stack applications with databases.

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign in with your GitHub account

### Step 2: Deploy Backend

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `AmitSpringHill/vc-fund-tracker`
4. Railway will automatically detect and deploy your app

### Step 3: Configure Environment Variables

1. Click on your deployed service
2. Go to "Variables" tab
3. Add these environment variables:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   PORT=3001
   NODE_ENV=production
   ```
   **Note**: Use the API key from your .env file locally

### Step 4: Get Your Backend URL

1. In Railway, go to "Settings" tab
2. Click "Generate Domain"
3. Copy your backend URL (e.g., `https://your-app.railway.app`)

### Step 5: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import `AmitSpringHill/vc-fund-tracker`
5. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variable:
   ```
   VITE_API_URL=https://your-app.railway.app/api
   ```
   (Replace with your Railway backend URL from Step 4)
7. Click "Deploy"

### Step 6: Test Your Deployed App

1. Visit your Vercel frontend URL
2. Try uploading a PDF report
3. The app should extract data and save it to your Railway backend

---

## Option 2: Deploy Everything to Railway

If you want both frontend and backend on Railway:

1. Follow Steps 1-4 above for backend
2. In Railway, click "New Service"
3. Select "GitHub Repo" again
4. Choose the same repository
5. Set **Root Directory**: `frontend`
6. Add build command: `npm run build`
7. Add start command: `npm run preview`
8. Add environment variable pointing backend to the first service

---

## Option 3: Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: vc-fund-tracker-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables (same as Railway)
7. Click "Create Web Service"

For frontend, create another web service with:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - Add `VITE_API_URL` pointing to your backend URL

---

## Troubleshooting

### PDF Extraction Not Working

If you get model errors, the API key might not have access to the specified Claude model. Try updating the model in `backend/src/services/aiExtractor.js`:

```javascript
// Try these models in order:
model: 'claude-3-sonnet-20240229'  // Current
model: 'claude-3-opus-20240229'    // If Sonnet doesn't work
model: 'claude-3-haiku-20240307'   // Fastest, cheapest
```

### Database Issues

Railway provides persistent storage. Make sure:
1. The `database` folder is created on deployment
2. SQLite file permissions are correct
3. Check Railway logs for errors

### CORS Errors

If frontend can't connect to backend, update CORS settings in `backend/src/app.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-url.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

---

## Quick Deploy Commands

```bash
# Deploy backend to Railway
railway login
railway link
railway up

# Deploy frontend to Vercel
cd frontend
vercel --prod
```

---

## Cost Estimates

- **Railway**: $5/month (includes 500 hours, 512MB RAM, 1GB disk)
- **Vercel**: Free for personal projects
- **Render**: Free tier available (apps sleep after inactivity)
- **Anthropic API**: Pay per usage (~$0.003 per request with Haiku)

---

## Next Steps

1. Deploy backend to Railway
2. Deploy frontend to Vercel
3. Test the application
4. Share the frontend URL with users
5. Monitor usage in Railway/Vercel dashboards

Your app will be live at: `https://your-app-name.vercel.app`
