# CareerScout AI

"Your AI-powered career opportunity scout."

## Overview
CareerScout AI is a full-stack SaaS platform designed to discover jobs, internships, hackathons, and other opportunities automatically based on a user's profile, resume, and career goals.

## Architecture
This project uses a clean monorepo architecture:
- `apps/web`: React, Vite, Tailwind CSS Frontend
- `apps/api`: Node.js, Express, MongoDB Backend
- `apps/worker`: BullMQ, Redis Background Worker
- `packages/shared`, `packages/types`, `packages/ai`: Shared utilities

## Tech Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Express, MongoDB, Redis, JWT
- Background: BullMQ

## Setup Instructions

### Environment Setup
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Fill in the AI Provider API keys (e.g., Gemini).

### Install Dependencies
From the root directory, run:
```bash
npm install
```

### Run Infrastructure
Start MongoDB and Redis using Docker:
```bash
docker compose up -d
```

### Run Application
Start the frontend, API, and worker:
```bash
npm run dev
```

## AI Architecture
The `ai.service.ts` uses `@google/generative-ai` to power the semantic extraction of the Resume uploaded by users. The matching engine compares these extracted properties against scheduled opportunities.

## Background Worker
The worker polls opportunity providers daily through BullMQ in a decentralized asynchronous manner without blocking API requests.
