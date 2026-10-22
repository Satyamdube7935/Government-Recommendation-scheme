# SchemeFind — AI-Based Government Scheme Recommender (MERN)

College project that matches a citizen’s profile against government scheme eligibility criteria and returns **ranked recommendations** with clear explanations.

## Problem

Scheme information is scattered and eligibility rules are complex. Citizens struggle to find schemes they actually qualify for.

## Objectives covered

- AI-style eligibility analysis of user profiles vs scheme criteria  
- Automatic eligibility determination per scheme  
- Relevance-based ranking of suitable schemes  
- Simple web interface for discovery and eligibility checking  

## Tech stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React (Vite), React Router, Axios   |
| Backend  | Node.js, Express                    |
| Database | MongoDB + Mongoose                  |
| Auth     | JWT + bcrypt                        |
| “AI”     | Weighted rule-matching & ranking engine |

## Project structure

```
├── client/          # React frontend
├── server/          # Express API + eligibility engine
└── README.md
```

## Prerequisites

- Node.js 18+  
- MongoDB running locally (or a MongoDB Atlas URI)

## Setup

### 1. Backend

```bash
cd server
npm install
```

Create / edit `server/.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/scheme_recommender
JWT_SECRET=scheme_recommender_college_project_secret_2026
JWT_EXPIRE=7d
```

Seed sample schemes + demo users:

```bash
npm run seed
```

Start API:

```bash
npm run dev
```

API runs at `http://localhost:5000`

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Demo accounts (after seeding)

| Role    | Email             | Password |
|---------|-------------------|----------|
| Citizen | citizen@demo.com  | demo123  |
| Admin   | admin@schemes.gov | admin123 |

## How the AI engine works

1. User saves a profile (age, income, category, occupation, state, BPL, etc.).  
2. Engine loads active schemes and evaluates each criterion with **weights** (income, age, category, occupation, …).  
3. Hard failures mark a scheme not eligible; soft **relevance boosts** personalize ranking (e.g. farmer → agriculture schemes).  
4. Results are sorted by eligibility status, then match score, and returned with an explanation summary.

Core logic: `server/src/services/eligibilityEngine.js`

## Main API routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register citizen |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/users/profile` | Update citizen profile |
| GET | `/api/schemes` | List / search schemes |
| GET | `/api/schemes/:id` | Scheme details |
| GET | `/api/recommend` | Ranked recommendations (auth) |
| GET | `/api/recommend/check/:schemeId` | Check one scheme (auth) |

## Suggested demo flow (viva / presentation)

1. Open the app → explain problem & objectives  
2. Login as `citizen@demo.com`  
3. Show profile → open **My Matches**  
4. Explain ranking, match %, and AI summary  
5. Open a scheme detail page → show criteria & documents  
6. Optionally show `eligibilityEngine.js` as the “AI” module  

## Notes for evaluation

- Seed data includes illustrative Central schemes (PM-KISAN, PMAY, Ayushman Bharat, etc.) for academic demo — always verify official portals for real applications.  
- Admin can manage schemes via protected API routes (`role: admin`).  
- For MongoDB Atlas, paste your connection string into `MONGO_URI`.
