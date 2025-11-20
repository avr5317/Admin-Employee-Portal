# Assignment 10: Admin & Employee Portal with Redux

A full-stack job portal application with role-based authentication and Redux state management. Admins can manage jobs and view users, while employees can browse available positions.



## 📝 Assignment Overview

This assignment enhances a job portal application by implementing:
- **Role-based routing** - Separate admin and employee portals
- **Redux state management** - All state handled through Redux store
- **Material UI components** - Professional, responsive design
- **Protected routes** - Login required for all pages
- **RESTful API** - Backend with user type validation

---

## 🎯 Assignment Requirements Met

### ✅ Backend Enhancements

#### 1. POST /user/create Endpoint
- [x] Added `type` field (required)
- [x] Only accepts "admin" or "employee"
- [x] Rejects invalid values
- **Location:** `controllers/userController.js` (lines 28-33)

#### 2. GET /users Endpoint
- [x] Fetches all user details
- [x] Excludes passwords from response
- [x] Returns name, email, and type
- **Location:** `controllers/userController.js` (lines 65-79)

---

### ✅ Admin Portal Functionality

#### 1. Role-Based Routing
- [x] Admins only access admin-specific pages
- [x] Login redirects based on user type
- [x] Admin → `/admin/employees` after login
- [x] Employee → `/` after login
- **Location:** `components/Login.jsx` (lines 19-27)

#### 2. Employees Page
- [x] Admin-only page
- [x] Displays all users in a table
- [x] Shows: name, email, type
- [x] Route: `/admin/employees`
- **Location:** `pages/AdminEmployees.jsx`

#### 3. Add Jobs Page
- [x] Route: `/add-job`
- [x] Accessible only by admins
- [x] Form fields: Company Name, Job Title, Description, Salary
- [x] Calls API: POST `/api/create/job`
- **Location:** `pages/AddJob.jsx`

---

### ✅ Employee Portal Functionality

#### 1. Role-Based Routing
- [x] Employees only access employee-specific pages
- [x] Cannot access admin routes
- **Location:** `components/ProtectedRoute.jsx`

#### 2. Jobs Page
- [x] Route: `/jobs`
- [x] Accessible only by employees
- [x] Fetches jobs from GET `/api/jobs`
- [x] Displays jobs in card format
- [x] Shows: job title, company, description, salary
- **Location:** `pages/JobListings.jsx`

---

### ✅ Key Requirements

#### 1. Login Required
- [x] All routes protected
- [x] RequireAuth wrapper component
- [x] Redirects to login if not authenticated
- **Location:** `components/ProtectedRoute.jsx`

#### 2. Redux for State Management
- [x] Auth slice - user authentication
- [x] Jobs slice - job listings and creation
- [x] Users slice - user management
- [x] Redux store configured
- [x] All API calls through Redux thunks
- **Location:** `store/` folder

#### 3. Material UI
- [x] Used throughout the application
- [x] Components: Navbar, Cards, Forms, Tables, Buttons
- [x] Consistent design system
- **Location:** All component files

---

### ⭐ Optional Features Implemented

#### 1. Loading Spinners
- [x] Shown during all API calls
- [x] Better user experience
- **Location:** All page components with `CircularProgress`

#### 2. Pagination
- [x] Job listings paginated (6 per page)
- [x] Page navigation controls
- **Location:** `pages/JobListings.jsx` (lines 16-42)

---

## 🛠️ Technologies Used

### Frontend
- **React 19.2.0** - UI library
- **Redux Toolkit 2.10.1** - State management
- **React Router 7.9.5** - Client-side routing
- **Material-UI 7.3.5** - UI component library
- **Axios 1.13.2** - HTTP client
- **Vite 7.2.2** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **MongoDB** - Database
- **Mongoose 8.19.3** - ODM
- **bcrypt 6.0.0** - Password hashing
- **CORS 2.8.5** - Cross-origin requests
- **dotenv 17.2.3** - Environment variables

---

## 📁 Project Structure
```
assignment-10/
│
├── backend/
│   ├── controllers/
│   │   ├── jobControllers.js       # Job CRUD operations
│   │   └── userController.js       # User management & auth
│   ├── middleware/
│   │   └── upload.js               # File upload config
│   ├── models/
│   │   ├── Job.js                  # Job schema
│   │   └── User.js                 # User schema with type field
│   ├── routes/
│   │   ├── jobRoutes.js            # Job API routes
│   │   └── userRoutes.js           # User API routes
│   ├── .env                        # Environment variables
│   ├── .gitignore                  # Git ignore rules
│   ├── package.json                # Backend dependencies
│   └── server.js                   # Express server setup
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx           # Login with role redirect
│   │   │   ├── Navbar.jsx          # Role-based navigation
│   │   │   └── ProtectedRoute.jsx  # Auth & role guards
│   │   ├── pages/
│   │   │   ├── About.jsx           # About page
│   │   │   ├── AddJob.jsx          # Admin: Create jobs
│   │   │   ├── AdminEmployees.jsx  # Admin: View users table
│   │   │   ├── CompanyShowcase.jsx # Companies page
│   │   │   ├── Contact.jsx         # Contact page
│   │   │   ├── Home.jsx            # Employee home
│   │   │   └── JobListings.jsx     # Job listings with pagination
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js    # Redux: Authentication
│   │   │   │   ├── jobsSlice.js    # Redux: Jobs management
│   │   │   │   └── usersSlice.js   # Redux: Users management
│   │   │   └── index.js            # Redux store config
│   │   ├── App.jsx                 # Main app with routing
│   │   ├── App.css                 # App styles
│   │   ├── main.jsx                # App entry point
│   │   └── index.css               # Global styles
│   ├── .gitignore                  # Git ignore rules
│   ├── index.html                  # HTML template
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   └── eslint.config.js            # ESLint configuration
│
└── README.md                       # This file
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v20 or higher)
- MongoDB (running locally)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/avadhanamvinayarekha/webdesign_vinayarekha/new/main/assignment10
cd assignment-10
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Configure Environment Variables

Create `.env` file in `backend/` folder:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/userdb
```

---

## ▶️ Running the Application

### Step 1: Start MongoDB
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Step 2: Start Backend Server
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:3000`

### Step 3: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### Step 4: Open Browser
Navigate to: `http://localhost:5173`

---

## 👥 User Credentials

### Creating Users

**Important:** You must create users via API before logging in.

#### Create Admin User
```bash
curl -X POST http://localhost:3000/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Admin User",
    "email": "admin@test.com",
    "password": "Admin123!",
    "type": "admin"
  }'
```

#### Create Employee User
```bash
curl -X POST http://localhost:3000/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Employee User",
    "email": "employee@test.com",
    "password": "Employee123!",
    "type": "employee"
  }'
```

### Test Credentials

**Admin Login:**
- Email: `admin@test.com`
- Password: `Admin123!`
- Redirects to: `/admin/employees`

**Employee Login:**
- Email: `employee@test.com`
- Password: `Employee123!`
- Redirects to: `/` (Home)

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character (@$!%*?&)

---

## 🔌 API Endpoints

### User Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/user/create` | Create new user | Public |
| POST | `/user/login` | User login | Public |
| GET | `/user/users` | Get all users (no passwords) | Protected |
| GET | `/user/getAll` | Get all users | Protected |
| PUT | `/user/edit` | Update user | Protected |
| DELETE | `/user/delete` | Delete user | Protected |
| POST | `/user/uploadImage` | Upload user image | Protected |

### Job Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/create/job` | Create new job | Admin only |
| GET | `/api/jobs` | Get all jobs | Protected |
| DELETE | `/api/delete/job/:id` | Delete job | Admin only |

---

## 🎨 Features Walkthrough

### Admin Flow
1. **Login** as admin → Redirected to `/admin/employees`
2. **View Employees** - See all users in a table
3. **Add Job** - Navigate to `/add-job`, fill form, submit
4. **View Jobs** - Navigate to `/admin/jobs`, see all listings
5. **Access Other Pages** - Companies, About, Contact
6. **Logout** - Return to login page

### Employee Flow
1. **Login** as employee → Redirected to `/` (Home)
2. **Browse Jobs** - Navigate to `/jobs`, see listings with pagination
3. **Apply to Jobs** - Click "Apply" button (shows confirmation)
4. **View Companies** - See partner companies
5. **Navigation** - Access About, Contact pages
6. **Logout** - Return to login page

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ Input validation on all forms
- ✅ Role-based access control
- ✅ Protected routes with authentication guards
- ✅ CORS configuration for cross-origin requests
- ✅ Environment variables for sensitive data

---

## 🎯 Redux State Management

### Auth Slice
```javascript
// Manages: user, loading, error
// Actions: loginThunk, logout
// File: store/slices/authSlice.js
```

### Jobs Slice
```javascript
// Manages: items (jobs array), loading, error
// Actions: fetchJobs, createJob
// File: store/slices/jobsSlice.js
```

### Users Slice
```javascript
// Manages: list (users array), loading, error
// Actions: fetchUsers
// File: store/slices/usersSlice.js
```

---

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Grid system for job cards:
  - Mobile (xs): 1 column
  - Tablet (sm): 2 columns
  - Desktop (md+): 3 columns
- ✅ Responsive navigation bar
- ✅ Touch-friendly buttons and forms

---

## ⚡ Performance Features

- ✅ Loading spinners during API calls
- ✅ Pagination for job listings (6 per page)
- ✅ Lazy loading with React Router
- ✅ Optimized Redux with createAsyncThunk
- ✅ Error boundary handling

---

## 🧪 Testing Checklist

### Admin Testing
- [ ] Login as admin redirects to `/admin/employees`
- [ ] Employees table displays all users
- [ ] Can navigate to `/add-job`
- [ ] Can create new job successfully
- [ ] Can view all jobs at `/admin/jobs`
- [ ] Cannot access employee routes (auto-redirects)
- [ ] Logout works correctly

### Employee Testing
- [ ] Login as employee redirects to `/`
- [ ] Can navigate to `/jobs`
- [ ] Jobs display in card format
- [ ] Pagination works (if >6 jobs)
- [ ] Apply button shows confirmation
- [ ] Cannot access admin routes (auto-redirects)
- [ ] Can access: Home, About, Companies, Contact
- [ ] Logout works correctly

### General Testing
- [ ] Login required for all protected routes
- [ ] Invalid login shows error message
- [ ] Loading spinners appear during API calls
- [ ] All Material UI components render correctly
- [ ] Responsive design works on mobile/tablet/desktop

---

## 🐛 Known Issues & Limitations

- Apply button shows alert (not connected to actual application system)
- No email verification for user registration
- No password reset functionality
- Session management uses Redux (no JWT tokens)
- File uploads limited to 5MB

---

## 🔮 Future Enhancements

- [ ] JWT token-based authentication
- [ ] Job application tracking system
- [ ] Email notifications
- [ ] Advanced job search and filters
- [ ] User profile management
- [ ] Resume upload functionality
- [ ] Real-time notifications
- [ ] Admin dashboard with analytics

---

## 📚 Learning Outcomes

Through this assignment, I learned:
- ✅ Redux Toolkit state management
- ✅ Role-based access control implementation
- ✅ Protected routing in React
- ✅ RESTful API design
- ✅ Material-UI component library
- ✅ MongoDB schema design with user types
- ✅ React hooks (useState, useEffect, useSelector, useDispatch)
- ✅ Async operations with Redux Thunks
- ✅ Form validation and error handling

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Kill process on port 3000
npx kill-port 3000
npm run dev
```

### Frontend won't start
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

### Can't login
- Ensure MongoDB is running
- Check backend terminal for errors
- Verify user was created successfully
- Check password meets requirements

### CORS errors
- Verify backend CORS configuration in `server.js`
- Check frontend is running on `http://localhost:5173`

### Jobs not showing
- Check backend is running
- Verify MongoDB connection
- Create jobs using `/add-job` page
- Check browser console for errors

---

## 📖 References Used

### Documentation
- [Redux Toolkit Official Docs](https://redux-toolkit.js.org/)
- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)

### Tutorials
- [Redux Quick Start Guide](https://redux.js.org/tutorials/quick-start)
- [Role-Based Routing in React](https://hygraph.com/blog/react-authentication)
- [Protected Routes YouTube Guide](https://www.youtube.com/watch?v=X8eAbu1RWZ4)

---

## 📦 Dependencies

### Frontend Dependencies
```json
{
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@mui/material": "^7.3.5",
  "@reduxjs/toolkit": "^2.10.1",
  "axios": "^1.13.2",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-redux": "^9.2.0",
  "react-router-dom": "^7.9.5"
}
```

### Backend Dependencies
```json
{
  "bcrypt": "^6.0.0",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.1.0",
  "mongoose": "^8.19.3",
  "multer": "^2.0.2"
}
```






