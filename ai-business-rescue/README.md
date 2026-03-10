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
ai-business-rescue/
|
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- context/
|   |   |-- api/
|   |   `-- main.jsx
|   `-- package.json
|
|-- backend/
|   |-- server.js
|   |-- routes/
|   |-- services/
|   |-- middleware/
|   `-- package.json
|
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

## 5. Test Login, Roles, and Analysis

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

## Hackathon Notes

- Data is currently stored in-memory for simplicity.
- Use a persistent database (DynamoDB, PostgreSQL, etc.) for production.
- PDF parsing is best-effort and optional.
