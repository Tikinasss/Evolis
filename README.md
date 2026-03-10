# AI Business Rescue

AI Business Rescue is a hackathon-ready full-stack web app that analyzes companies in financial difficulty and generates an AI-powered recovery strategy using Amazon Nova on AWS.

## Features

- React + Tailwind frontend with pages: Home, Login, Register, Dashboard
- JWT authentication with role-based access:
  - `employee`
  - `company`
  - `personnel` (admin)
- Business analysis form with optional PDF upload
- Amazon Nova-powered diagnosis response:
  - `risk_level`
  - `main_problems`
  - `recovery_plan`
  - `recommendations`
- REST backend with required endpoints:
  - `POST /api/register`
  - `POST /api/login`
  - `POST /api/analyze-business`

## Project Structure

```text
.
|-- backend/
|-- frontend/
|-- LICENSE
`-- README.md
```

## 1. Install Dependencies

Open two terminals.

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## 2. Configure AWS Credentials

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
JWT_SECRET=change_this_to_a_long_random_secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
NOVA_MODEL_ID=amazon.nova-lite-v1:0
```

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Notes:
- The IAM user/role must have permission to call Amazon Bedrock models.
- Model ID can be changed via `NOVA_MODEL_ID` if your account uses a different Nova alias/version.

## 3. Run Backend Server

```bash
cd backend
npm run dev
```

API health check:

```bash
GET http://localhost:5000/api/health
```

## 4. Run Frontend App

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## 5. Deploy on Vercel

Deploy backend and frontend as two separate Vercel projects.

### 5.1 Deploy Backend (Vercel Project #1)

- Create a new Vercel project with root directory: `backend`
- Framework preset: `Other`
- Build/Output settings: keep defaults (routing is handled by `backend/vercel.json`)

Set these environment variables in Vercel (Project Settings -> Environment Variables):

- `JWT_SECRET`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `NOVA_MODEL_ID` (optional, default: `amazon.nova-lite-v1:0`)

After deployment, note the backend URL, for example:

```text
https://your-backend-project.vercel.app
```

Health check:

```text
https://your-backend-project.vercel.app/api/health
```

### 5.2 Deploy Frontend (Vercel Project #2)

- Create a second Vercel project with root directory: `frontend`
- Framework preset: `Vite`

Set frontend environment variable:

```env
VITE_API_URL=https://your-backend-project.vercel.app/api
```

Redeploy frontend after setting `VITE_API_URL`.

### 5.3 Important Notes for Vercel

- Backend runs as serverless functions on Vercel.
- App data is in-memory (`backend/data/db.js`), so it resets on cold starts/redeploys.
- PDF uploads should stay reasonably small due to serverless limits.

## 6. Test Login, Roles, and Analysis

1. Register users with each role (`employee`, `company`, `personnel`).
2. Login and open Dashboard.
3. Submit business data and optionally upload a PDF.
4. Confirm AI response fields are shown:
   - risk level
   - main problems
   - recovery plan
   - recommendations
5. Confirm role-based dashboard behavior:
   - `employee`: sees analysis summaries
   - `company`: sees own analyses
   - `personnel`: sees all analyses

## API Examples

### Register

```http
POST /api/register
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@company.com",
  "password": "Password123",
  "role": "company"
}
```

### Login

```http
POST /api/login
Content-Type: application/json

{
  "email": "alice@company.com",
  "password": "Password123"
}
```

### Analyze Business

Use `multipart/form-data`:
- text fields: `companyName`, `industry`, `revenueChange`, `debt`, `reviewTrend`
- optional file field: `document` (PDF)

Expected JSON response:

```json
{
  "risk_level": "Low | Medium | High",
  "main_problems": [],
  "recovery_plan": [],
  "recommendations": []
}
```

## 7. Hackathon Notes

- Data is currently stored in-memory for simplicity.
- Use a persistent database (DynamoDB, PostgreSQL, etc.) for production.
- PDF parsing is best-effort and optional.
