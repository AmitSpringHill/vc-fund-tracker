# VC Fund Tracker

A web application for tracking and visualizing venture capital fund quarterly reports. Upload PDF reports, automatically extract investment data using AI, and view interactive charts and analytics.

## Features

- **AI-Powered PDF Extraction**: Upload quarterly fund reports and automatically extract:
  - Fund name
  - Quarter and year
  - Investment details (company name, date, cost, current value)
- **Interactive Dashboard**: View portfolio performance with:
  - Summary cards (total investment, value, multiples)
  - Investment bar charts (cost vs value)
  - Portfolio composition pie charts
  - Quarterly value trend charts
- **Fund Management**: Track multiple funds and quarters
- **Clean UI**: White background, gray accents, responsive design

## Tech Stack

**Backend:**
- Node.js + Express
- SQLite database (better-sqlite3)
- PDF parsing (pdf-parse)
- AI extraction (Claude API via @anthropic-ai/sdk)
- File upload (multer)

**Frontend:**
- React + Vite
- Tailwind CSS
- Recharts for data visualization
- Axios for API calls
- Context API for state management

## Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd vc-fund-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
# Create a .env file and add:
# PORT=3001
# NODE_ENV=development
# ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx

# Start the backend server
npm run dev
```

The backend will run on http://localhost:3001

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start the frontend dev server
npm run dev
```

The frontend will run on http://localhost:5173

## Usage

1. **Upload a PDF Report:**
   - Click "Upload Report" in the header
   - Select or drag-and-drop a PDF quarterly report
   - AI automatically extracts fund name, quarter, and investment data

2. **Review & Save:**
   - Review the extracted data in the table
   - Edit any incorrect values
   - Click "Confirm and Save"

3. **View Analytics:**
   - Select a fund from the sidebar
   - Select a quarter to view investments
   - Explore charts showing portfolio performance

## Deployment

### Backend Deployment (Railway)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway link
railway up

# Add environment variable in Railway dashboard:
# ANTHROPIC_API_KEY=your_key
```

### Frontend Deployment (Vercel)
```bash
npm i -g vercel
cd frontend
vercel
```

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=production
ANTHROPIC_API_KEY=your_api_key_here
```

## API Endpoints

- `POST /api/upload/analyze` - Analyze PDF and extract data
- `POST /api/upload/confirm` - Create quarter with extracted data
- `GET /api/funds` - List all funds
- `GET /api/quarters/fund/:fundId` - Get quarters for a fund
- `GET /api/investments/quarter/:quarterId` - Get investments for a quarter
- `POST /api/investments/bulk` - Bulk save investments
- `GET /api/analytics/fund-timeline/:fundId` - Get fund value over time

## License

MIT
