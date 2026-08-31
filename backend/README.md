# CareerScout AI Backend

## Environment Configuration

The backend requires several environment variables to function properly.

### Required Environment Variables

- `MONGODB_URI`: The connection string for your MongoDB database. **This is required.** Do not use localhost for production.
  - Example format: `MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>`
- `PORT`: The port the server runs on (default: `5000`).
- `JWT_SECRET`: Secret key for JWT authentication.
- `GEMINI_API_KEY`: Google Gemini API key used by the LangGraph AI Agent.

### Setup

1. Copy `.env.example` to `.env`
2. Fill in the required variables (especially `MONGODB_URI` and `GEMINI_API_KEY`).
3. Run `npm install`
4. Run `npm run dev` to start the server.
