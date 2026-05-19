# TaskFlow - Team Task Manager
TaskFlow is a simple team task management app built using the MERN stack. Users can create projects, assign tasks, and track progress with role-based access.

## Features
- Signup & Login Authentication
- JWT Based Auth
- Admin and Member Roles
- Create & Manage Projects
- Task Assignment & Status Tracking
- Dashboard with Task Statistics
- Overdue Task Detection

## Roles

### Admin
- Create/Delete Projects
- Add Members
- Create/Edit/Delete Tasks

### Member
- View Assigned Tasks
- Update Task Status

## Task Status
- Pending
- In Progress
- Completed

## Tech Stack

### Frontend
- React
- Axios
- React Router
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Project Structure
```bash
backend/
frontend/
```

## Setup
```bash
git clone <repo-link>
cd backend
npm install

Create .env file

MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
PORT=5000

npm run dev

cd frontend
npm install
npm start
```
### Backend Variables
```env
MONGO_URI=
JWT_SECRET=
PORT=5000
```
### Frontend Variable
```env
REACT_APP_API_URL=your_backend_url/api
```

## Dashboard
Dashboard shows:
- Total Tasks
- Pending Tasks
- Completed Tasks
- Overdue Tasks

## Future Improvements
- Notifications
- File Upload
- Team Chat

## Author
Built as a MERN stack practice project.
