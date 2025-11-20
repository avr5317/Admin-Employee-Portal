# Job Portal Website

A simple job portal website where users can login, view available jobs, and see partner companies.

## What This Project Does

- Login page to authenticate users
- Browse job listings with details
- View partner companies with images
- Navigate between different pages
- Logout functionality

## Technologies Used

**Frontend:**
- React - for building the user interface
- Material-UI - for styling and components
- React Router - for navigation between pages
- Axios - for making API calls to backend

**Backend:**
- Node.js - runtime environment
- Express - web server framework
- CORS - to allow frontend-backend communication

## Project Setup

### Prerequisites
You need to have Node.js installed on your computer.

### Installation Steps

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

### Running the Application

You need to run both backend and frontend at the same time in separate terminals.

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend will start on http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will start on http://localhost:5173

Open your browser and go to: http://localhost:5173

## Folder Structure

```
job-portal/
├── backend/
│   ├── index.js          (server file with all API endpoints)
│   ├── package.json      (backend dependencies)
│   └── .env              (environment variables)
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Login.jsx       (login page)
│       │   └── Navbar.jsx      (navigation bar)
│       ├── pages/
│       │   ├── Home.jsx        (home page)
│       │   ├── About.jsx       (about page)
│       │   ├── JobListings.jsx (job listings page)
│       │   ├── Contact.jsx     (contact page)
│       │   └── CompanyShowcase.jsx (companies page)
│       ├── data/
│       │   └── jobPosts.js     (job data)
│       ├── App.jsx             (main app with routing)
│       └── main.jsx            (entry point)
│
└── README.md (this file)
```

## Login Credentials

Use these credentials to test the login:

- Email: john@example.com | Password: password123
- Email: jane@example.com | Password: password456
- Email: admin@example.com | Password: admin123
- Email: test@example.com | Password: test123

## Navigation

The website has 5 main pages:

1. **Home** (/) - Welcome page with buttons to view jobs and companies
2. **About** (/about) - Information about the job portal
3. **Jobs** (/jobs) - List of 6 available job positions
4. **Companies** (/companies) - Gallery of 6 partner companies with images
5. **Contact** (/contact) - Contact information

All pages are protected - you must login first to access them.

## Key Functionalities

### 1. Login System
- Enter email and password on login page
- Click login button
- Backend checks if credentials are correct
- If valid, you can access all pages
- If invalid, error message is shown

### 2. Session Management
- After login, you stay logged in
- Your name appears in the navigation bar
- You can navigate to all pages
- Click LOGOUT button to end session and return to login page

### 3. Job Listings
- Displays 6 job openings
- Each job shows:
  - Job title
  - Job description
  - Required skills (shown as chips)
  - Salary range
  - Last updated date
  - Apply button
- Job data is stored in frontend (jobPosts.js file)
- Uses map() function to display all jobs

### 4. Company Showcase
- Shows 6 partner companies
- Each company has:
  - Company image
  - Company name
  - Description
- Images are fetched from backend API
- Shows loading spinner while fetching data
- Displays error message if backend is not running

### 5. Navigation Bar
- Blue bar at the top of every page
- Links to all 5 pages
- Shows logged in user's name
- Logout button on the right

## Backend API Endpoints

The backend server provides these endpoints:

1. **GET /** - Check if server is running
2. **POST /auth/login** - Login with email and password
3. **POST /user/create** - Create a new user
4. **GET /api/companies** - Get list of all companies
5. **GET /api/products** - Get list of products (with optional search)

## How Components Work

### Login.jsx
- Has email and password input fields
- Uses Axios to send login request to backend
- Shows error if login fails
- Calls onLogin function when successful

### Navbar.jsx
- Uses Material-UI AppBar component
- Has links to all pages using React Router
- Displays username
- Has logout button that calls onLogout function

### App.jsx
- Sets up React Router for navigation
- Manages authentication state (isAuthenticated and username)
- Has ProtectedRoute component that checks if user is logged in
- If not logged in, redirects to login page

### JobListings.jsx
- Imports job data from jobPosts.js
- Uses map() to loop through all jobs
- Displays each job in a Material-UI Card
- Shows skills using Chip components

### CompanyShowcase.jsx
- Uses useEffect to fetch data when page loads
- Makes Axios GET request to backend /api/companies endpoint
- Stores companies in state using useState
- Shows loading spinner while fetching
- Displays companies in a grid layout

## Common Problems

### Backend won't start
**Fix:** Make sure port 3000 is not already in use
```bash
npx kill-port 3000
npm run dev
```

### Frontend won't start
**Fix:** Make sure port 5173 is not already in use
```bash
npx kill-port 5173
npm run dev
```

### Can't login
**Fix:** Make sure backend is running. Check terminal 1 to see if server is active.

### Companies page shows error
**Fix:** Backend must be running for companies to load. Start backend server first.

### Module not found error
**Fix:** Delete node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

## What I Learned

- How to build a full-stack application
- Connecting React frontend with Node.js backend
- Using Material-UI for styling
- Implementing authentication and protected routes
- Making API calls with Axios
- Managing state in React
- Using React Router for navigation

## Assignment Requirements Completed

- ✅ Login page with backend authentication
- ✅ Session management using Axios
- ✅ Logout feature
- ✅ 5 pages: Home, About, Jobs, Companies, Contact
- ✅ Separate folder structure (components, pages, data)
- ✅ Material-UI components used throughout
- ✅ React Router for navigation
- ✅ Job listings show title, skills, and salary
- ✅ Job data stored in frontend
- ✅ Company images fetched from backend API
- ✅ Used map() function to render lists
- ✅ .gitignore file included
- ✅ README.md file created

---

**Student Name:** Avadhanam Vinaya Rekha 
**Assignment:** 9 - React Job Portal  
**Course:** Web Design  
**Date:** Nov 13 2025