# CareerScout AI

**"Your Personal AI Career Scout"**

CareerScout AI is an AI-powered personalized opportunity discovery platform. It automatically discovers, extracts, and matches you with the best career opportunities (Jobs, Internships, Hackathons, Webinars, etc.) based on your profile and resume.

## Features

- **Personalized Opportunity Feed**: Get opportunities matched precisely to your skills, experience, and preferences.
- **AI Matching System**: Uses LLMs and deterministic scoring to evaluate your compatibility with opportunities, explaining *why* you match.
- **Resume Analyzer**: Automatically extracts your skills and experience from your resume.
- **Application Tracker**: Track your applications from "Saved" to "Selected".
- **24-hour Auto-Discovery**: An autonomous AI agent (powered by LangGraph) continuously discovers and validates new opportunities daily.
- **Smart Filtering**: Filter by role, experience, location, and match score.
- **Dark Mode**: Beautiful, professional light and dark themes.

## Architecture

![Architecture Diagram](./docs/architecture.png)
*(Note: Refer to mermaid diagram in the repository)*

### Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Zustand, React Router, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JSON Web Tokens (JWT)
- **AI Agent**: LangGraph.js, LangChain, OpenAI/Gemini APIs
- **Scheduled Jobs**: node-cron

### Database Design (MongoDB)

- `users`: Core authentication info.
- `profiles`: Extracted resume info, preferences, skills.
- `opportunities`: The discovered opportunities (jobs, hackathons, etc.).
- `applications`: User's application pipeline.
- `savedOpportunities`: User bookmarks.
- `notifications`: User alerts.

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas URL)
- OpenAI API Key (or Gemini API Key)

### Environment Variables

Copy `.env.example` to `.env` in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Set up your variables in `.env`:
- `PORT=5000`
- `MONGODB_URI=...`
- `JWT_SECRET=your_secret_key`
- `OPENAI_API_KEY=...`

### Running Locally

1. **Install Dependencies**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Run Backend (API & Agent)**
   ```bash
   cd backend
   npm run dev
   ```

3. **Run Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## Seed Data

To populate the database with realistic development data, run:
```bash
cd backend
npm run seed
```

## AI Agent Workflow

The LangGraph Agent follows this pipeline:
`Discovery -> Extraction -> Validation -> Deduplication -> Classification -> Matching -> Ranking -> Storage`

To run the agent manually:
```bash
cd backend
npm run agent:run
```
