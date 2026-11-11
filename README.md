# Admin & Employee Job Portal

A full-stack job portal where admins post and manage jobs and employees browse them. It uses a React and Redux frontend with a secured Express and MongoDB REST API, JWT sign-in and role-based access control.

## Features

**For employees**
- Register an employee account, log in, and stay logged in across page refreshes.
- Browse jobs as cards, search by title or company, and page through the results (6 per page).
- Press **Apply** to open a LinkedIn job search for that title and company in a new tab.
- See which companies are hiring and how many roles each has open, then jump to that company's jobs.

**For admins**
- Add jobs (company, title, description, salary) and delete them after a confirmation dialog.
- See every user in a searchable table with role chips.
- Create other admin accounts through the API with an admin token.

**For everyone**
- Light and dark themes with a toggle in the navbar; the choice is remembered in the browser.
- A navbar that collapses into a menu drawer on narrow screens, a footer, a skip-to-content link and a 404 page.
- Home page with stats computed from real data (open jobs and companies hiring).
- About page (capabilities, stack, security notes, known limitations, FAQ) and a Contact page.
- Pages are loaded on demand, and an error boundary shows a Reload button if a page fails to render or load.
- Automatic sign-out when the API rejects the token.

## Screenshots

<img width="1178" height="827" alt="Job Portal screenshot (1 of 2)" src="https://github.com/user-attachments/assets/f7d361e4-bc26-4f14-bc00-681a7db25789" />

<img width="1121" height="835" alt="Job Portal screenshot (2 of 2)" src="https://github.com/user-attachments/assets/27614e9d-5416-4f9b-a1cd-a8d1d4a95fba" />

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Redux Toolkit 2, React Router 7, Material UI 7 (with MUI icons), Axios, Vite 7 |
| Backend | Node.js, Express 5, Mongoose 8, bcrypt 6, jsonwebtoken 9, multer 2, cors, dotenv |
| Database | MongoDB (local or Atlas) |
| Tests | `node:test`, supertest, mongodb-memory-server |

The project was developed and tested on **Node.js 24**. Other versions have not been tested.

## Quick start

Requirements: Node.js 24, Git, and a running MongoDB (see [MongoDB setup](#mongodb-setup)).

```bash
git clone https://github.com/avr5317/Admin-Employee-Portal.git
cd Admin-Employee-Portal

# Backend
cd assignment8/user-management-api
npm install
cp .env.example .env        # then edit .env: set MONGODB_URI and a strong JWT_SECRET
npm run seed                # optional: sample data and logins (local database only)
npm run dev                 # API on http://localhost:3000

# Frontend (second terminal, from the repo root)
cd assignment9/frontend/vite-project
npm install
npm run dev                 # app on http://localhost:5173
```

Open http://localhost:5173 and log in with a [sample login](#sample-data), or register a new employee account.

## MongoDB setup

**Local**
1. Install MongoDB Community Edition and start it, for example:
   - macOS (Homebrew): `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
   - Windows: `net start MongoDB`
2. Set `MONGODB_URI=mongodb://localhost:27017/jobportal` in `assignment8/user-management-api/.env` (any database name works).

**MongoDB Atlas**
1. Create a cluster, a database user, and allow your IP address in Network Access.
2. Copy the connection string into `MONGODB_URI`, with the database name in the path, for example `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/jobportal`.
3. Set `CLIENT_ORIGIN` to the address your frontend is served from.
4. The seed script refuses to run against anything but a local database. On a hosted database, register a user in the app and then change that user's `type` to `admin` in the database (Atlas Data Explorer or `mongosh`) to create the first admin.

The API connects with `mongoose.connect(MONGODB_URI)`, so any standard connection string works. The automated tests use an in-memory database; connecting to Atlas is not part of them.

## Environment variables

**Backend** (`assignment8/user-management-api/.env`, copied from `.env.example`)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PORT` | no | `3000` | Port the API listens on |
| `MONGODB_URI` | yes | none | MongoDB connection string |
| `JWT_SECRET` | yes | none | Signs and verifies login tokens. At least 32 characters and not the placeholder from `.env.example`; otherwise the server prints an error and exits. Generate one with `openssl rand -hex 32` |
| `CLIENT_ORIGIN` | no | `http://localhost:5173` | The one browser origin CORS allows |
| `UPLOAD_DIR` | no | `uploads/images` | Folder for uploaded images (the tests point it at a temporary folder) |

**Frontend** (`assignment9/frontend/vite-project/.env`, copied from `.env.example`)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `VITE_API_URL` | no | `http://localhost:3000` | Address of the API |
| `VITE_CONTACT_EMAIL` | no | empty | If set, the Contact page shows a "Send by email" button that opens a `mailto:` link |

`.env` files are gitignored. Never commit a real secret.

## Sample data

For a quick local setup, run this from `assignment8/user-management-api/`:

```bash
npm run seed
```

It creates two sample accounts, 12 jobs from fictional companies, and 6 fictional company accounts with generated placeholder images (they appear in the Employees table).

| Sample login | Email | Password |
|--------------|-------|----------|
| Admin | `admin@portal.test` | `Passw0rd!` |
| Employee | `employee@portal.test` | `Passw0rd!` |

- **Local development only.** These passwords are public. Do not use this data or these logins on a shared or deployed system.
- The seed refuses to run unless `MONGODB_URI` points at `localhost` or `127.0.0.1`.
- It is safe to run more than once. Users are matched by email and jobs by company name and job title, so nothing is duplicated. Each run resets the two sample passwords.
- The API never creates an admin without an admin token, so **the seed script is the only way to create the first admin** on a local database. On a hosted database, see step 4 of the Atlas setup above.

## Pages

| Path | Access | Page |
|------|--------|------|
| `/login`, `/register` | public | Log in, create an employee account |
| `/` | employee | Home |
| `/jobs` | employee | Jobs: search, pagination, Apply |
| `/companies` | employee | Companies hiring, built from the jobs |
| `/about`, `/contact` | employee | About, Contact |
| `/admin/employees` | admin | Users table |
| `/add-job` | admin | Add a job |
| `/admin/jobs` | admin | Jobs: search, pagination, delete |
| `/admin/companies`, `/admin/about`, `/admin/contact` | admin | Companies, About, Contact |
| anything else | public | 404 page |

Logged-out visitors are redirected to `/login`. A logged-in user who opens a page for the other role is redirected to their own home page.

## API

Send `Authorization: Bearer <token>` on protected routes. Login returns `{ message, user, token }`.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | public | API information |
| GET | `/images/<file>` | public | Uploaded and sample images (served with `X-Content-Type-Options: nosniff`) |
| POST | `/user/register` | public | Sign up. Always creates an `employee` and ignores any `type` in the body |
| POST | `/user/login` | public | Log in |
| POST | `/user/create` | public for `employee`; admin token for `admin` | Create a user. Creating an `admin` without a valid admin token returns 403 |
| GET | `/user/users` | admin | List users (no passwords) |
| GET | `/user/getAll` | admin | List users (no passwords) |
| PUT | `/user/edit` | admin | Update a user |
| DELETE | `/user/delete` | admin | Delete a user |
| POST | `/user/uploadImage` | logged-in | Upload an image for your own account. Admins may pass `email` to set any user's image |
| GET | `/api/jobs` | logged-in | List jobs, newest first |
| POST | `/api/create/job` | admin | Create a job |
| DELETE | `/api/delete/job/:id` | admin | Delete a job |

Status codes: `401` for a missing, invalid or expired token or a deleted account, `403` for the wrong role, `400` for invalid input or a rejected file, `413` for a file over 5 MB.

## Security

- Passwords are hashed with bcrypt.
- Login returns an HS256 JWT that expires after 1 day.
- The server refuses to start when `JWT_SECRET` is missing, shorter than 32 characters, or still the placeholder from `.env.example`.
- Roles are read from the database on every request, not from the token. A deleted user gets 401, and a demoted admin gets 403 immediately.
- Creating an admin account requires an admin token. Registration always creates an employee.
- Image uploads are limited to the account owner; admins may set an image for any user.
- Uploaded files are stored under random UUID names. The file type (PNG, JPEG, GIF or WebP) is checked from the file's content, not its name or declared type, and files over 5 MB are rejected.
- Email, password, name and type inputs must be plain strings, which blocks query-operator injection such as `{"$ne": ""}`.
- CORS allows the single origin in `CLIENT_ORIGIN` and does not enable credentials.
- Secrets come from environment variables; `.env` is gitignored.
- The frontend signs the user out when the API rejects the token.

## Testing

Backend tests live in `assignment8/user-management-api/test` and use Node's built-in test runner with supertest.

```bash
cd assignment8/user-management-api
npm install
npm test
```

The 98 tests cover:
- login success and failure, and 401 for no token, a bad or expired token, a token signed with another secret or algorithm, and a token for a deleted user;
- 403 for an employee on every admin route, a demoted admin losing access, and roles coming from the database;
- admin job create and delete, plus 400 for a malformed job id;
- registration always creating an employee, and anonymous or employee attempts to create an admin returning 403, including when the database has no admin;
- `getAll` being admin-only;
- upload ownership, random file names, file type checks by content, the 5 MB limit, replacing an image, path-traversal inputs, and cleanup when a request fails;
- operator-injection inputs returning 400, and no response containing a password or hash;
- the `JWT_SECRET` startup check exiting for a missing, short or placeholder secret.

How the tests stay safe: they use a temporary in-memory MongoDB (mongodb-memory-server downloads a `mongod` binary on the first run), set their own throwaway `JWT_SECRET`, write uploads to a temporary folder, and never read `.env`. They refuse to run if `MONGODB_URI` is set in the environment. The tests were run on Node.js 24.

The frontend has no automated tests. Its static checks are `npm run lint` and `npm run build` in `assignment9/frontend/vite-project`.

## Known limitations

1. **The login token is stored in `localStorage`**, so a script injected into the page could read it. Next step: move the token to an httpOnly cookie.
2. **There are no refresh tokens and no login rate limiting.** Tokens last 1 day and login attempts are unlimited. Next step: add refresh tokens and a rate limiter on the login route.
3. **Apply opens a LinkedIn job search** for the title and company. It is not a link to a specific posting, and the app does not track applications. Next step: store applications in the API.
4. **The Contact form does not send messages.** It validates the input only. Next step: add an API endpoint or an email service.
5. **The frontend has no automated tests.** Next step: add component tests (Vitest and React Testing Library) and end-to-end tests.

## Project structure

```
Admin-Employee-Portal/
├── assignment8/
│   └── user-management-api/            # Backend (Express + Mongoose)
│       ├── app.js                      # Builds the Express app (used by server.js and the tests)
│       ├── server.js                   # Loads .env, checks JWT_SECRET, connects to MongoDB, listens
│       ├── config/
│       │   ├── jwt.js                  # Algorithm and JWT_SECRET startup check
│       │   └── uploads.js              # Upload folder and size limit
│       ├── controllers/                # userController.js, jobControllers.js
│       ├── middleware/
│       │   ├── auth.js                 # requireAuth, requireAdmin, admin-creation guard
│       │   └── upload.js               # multer (in-memory) configuration
│       ├── models/                     # User.js, Job.js
│       ├── routes/                     # userRoutes.js, jobRoutes.js
│       ├── scripts/seed.js             # Local sample data (npm run seed)
│       ├── test/                       # npm test (98 tests)
│       ├── utils/                      # imageType.js (content check), validateInput.js
│       ├── .env.example
│       └── User_Management_API.postman_collection   # Older collection: no login, jobs or Bearer tokens
└── assignment9/
    └── frontend/
        └── vite-project/               # Frontend (React + Redux + MUI)
            ├── src/
            │   ├── api/client.js       # Shared axios client: auth header, 401 sign-out
            │   ├── components/         # Navbar, Footer, Login, ErrorBoundary, ProtectedRoute, Toast, ...
            │   ├── hooks/useLoadData.js
            │   ├── pages/              # Home, About, Contact, JobListings, CompanyShowcase,
            │   │                       # AdminEmployees, AddJob, Register, NotFound
            │   ├── store/              # Redux store and the auth, jobs and users slices
            │   ├── utils/              # format.js, linkedin.js
            │   ├── data/jobPosts.js    # Static sample posts (not used by the app)
            │   ├── navigation.js       # Role-aware links and paths
            │   ├── theme.js            # Material UI theme (light and dark)
            │   ├── colorMode.js
            │   ├── App.jsx
            │   └── main.jsx
            └── .env.example
```

The folder names `assignment8` and `assignment9` are kept from the repository's history.
