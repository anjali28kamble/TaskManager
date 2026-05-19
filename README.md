# TaskFlow — Team Task Manager (MERN Stack)

A full-stack team task management app built with MongoDB, Express, React, and Node.js. Supports role-based access (Admin / Member), project management, task tracking, and a real-time dashboard.

---

## Features

- **JWT Authentication** — Signup/Login with token-based auth
- **Role-based access**
  - Admin: Create/delete projects, add/remove members, create/edit/delete tasks
  - Member: View assigned tasks, update task status
- **Task statuses**: Pending, In Progress, Completed
- **Overdue detection**: Tasks past due date that aren't completed
- **Dashboard**: Stats for total, completed, pending, in-progress, and overdue tasks
- **REST API** with proper validation using express-validator

---

## Folder Structure

```
team-task-manager/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Sidebar.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Dashboard.js
    │   │   ├── Projects.js
    │   │   ├── ProjectDetail.js
    │   │   └── Tasks.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env.example
    └── package.json
```

---

## Local Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user with username/password
4. Under Network Access, add `0.0.0.0/0` (allow all IPs — fine for dev/Railway)
5. Click "Connect" → "Connect your application" → copy the connection string
6. Replace `<username>`, `<password>`, and `<dbname>` in the URI

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env file:
# MONGO_URI=your_atlas_connection_string
# JWT_SECRET=some_random_long_string
# PORT=5000
npm run dev
```

The backend runs at `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set:
# REACT_APP_API_URL=http://localhost:5000/api
npm start
```

The frontend runs at `http://localhost:3000`

---

## API Routes

### Auth
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| POST | /api/auth/signup | Public | Create account |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | Auth | Get current user |
| GET | /api/auth/users | Admin | Get all users |

### Projects
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| GET | /api/projects | Auth | List projects |
| GET | /api/projects/:id | Auth | Get project |
| POST | /api/projects | Admin | Create project |
| PUT | /api/projects/:id | Admin | Update project |
| DELETE | /api/projects/:id | Admin | Delete project + tasks |
| POST | /api/projects/:id/members | Admin | Add member |
| DELETE | /api/projects/:id/members/:userId | Admin | Remove member |

### Tasks
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| GET | /api/tasks | Auth | List tasks (filtered by role) |
| GET | /api/tasks/:id | Auth | Get task |
| POST | /api/tasks | Admin | Create task |
| PUT | /api/tasks/:id | Auth | Update task (members: status only) |
| DELETE | /api/tasks/:id | Admin | Delete task |

### Dashboard
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| GET | /api/dashboard | Auth | Get stats |

---

## Deploying to Railway

Railway lets you deploy both frontend and backend for free.

### Deploy Backend

1. Go to [https://railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub Repo**
3. Select your repo, then set **Root Directory** to `backend`
4. Under **Variables**, add:
   ```
   MONGO_URI=your_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   NODE_ENV=production
   ```
5. Railway auto-detects Node and runs `npm start`
6. Copy the generated backend URL, e.g. `https://your-backend.up.railway.app`

### Deploy Frontend

1. In the same Railway project, click **New** → **GitHub Repo** again
2. Set **Root Directory** to `frontend`
3. Under **Variables**, add:
   ```
   REACT_APP_API_URL=https://your-backend.up.railway.app/api
   ```
4. Under **Build Command**: `npm run build`
5. Under **Start Command**: `npx serve -s build`
   - If `serve` isn't installed, add it: `npm install serve`
6. Railway will build and deploy the React app

> Tip: Make sure the backend CORS allows your frontend Railway domain. For now, the backend uses `cors()` with all origins, which works fine.

### Final .env files

**backend/.env** (on Railway as environment variables):
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/teamtasks
JWT_SECRET=supersecretkey123
PORT=5000
NODE_ENV=production
```

**frontend/.env** (on Railway as environment variables):
```
REACT_APP_API_URL=https://your-backend-service.up.railway.app/api
```

---

## Default Roles

When signing up, you can choose "Admin" or "Member". In a production app, you'd restrict admin signup to existing admins — this is simplified for learning purposes.

---

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios, CSS custom properties
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB Atlas
- **Auth**: JWT + bcryptjs
- **Validation**: express-validator
- **Deploy**: Railway

---

## Contributing

This project is beginner-friendly and meant for learning. Feel free to fork and improve it!
