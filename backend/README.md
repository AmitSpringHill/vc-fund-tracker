# VC Fund Tracker - Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Anthropic API Key

The application uses Claude AI to extract investment data from PDF reports. You need to configure your Anthropic API key:

1. Sign up for an Anthropic API account at https://console.anthropic.com/
2. Generate an API key from the dashboard
3. Open the `.env` file in this directory
4. Replace `your_api_key_here` with your actual API key:

```env
PORT=3001
NODE_ENV=development
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:** Keep your API key secret. Never commit the `.env` file to version control.

### 3. Run the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on http://localhost:3001

## Features

- **AI-Powered PDF Extraction**: Uses Claude AI to automatically extract:
  - Fund name
  - Quarter and year
  - Investment details (company name, date, cost, current value)
- **Automatic Fund Creation**: Creates new funds automatically from PDF uploads
- **SQLite Database**: Local storage with better-sqlite3
- **REST API**: Full CRUD operations for funds, quarters, and investments

## API Endpoints

- `POST /api/upload/analyze` - Analyze PDF and extract data
- `POST /api/upload/confirm` - Create quarter with extracted data
- `GET /api/funds` - List all funds
- `GET /api/quarters/fund/:fundId` - Get quarters for a fund
- `GET /api/investments/quarter/:quarterId` - Get investments for a quarter
- `POST /api/investments/bulk` - Bulk save investments
- `GET /api/analytics/fund-timeline/:fundId` - Get fund value over time
