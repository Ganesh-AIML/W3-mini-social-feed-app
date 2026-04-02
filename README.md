# Social App

A mini social media application where users can create accounts, share posts (text, images, or both), and interact with others through likes and comments on a public feed.

---

## Overview

Social App is a full-stack web application inspired by TaskPlanet. It provides a complete social feed experience with user authentication, media uploads, and real-time UI interactions.

**Key Features:**

- **User Authentication** — JWT-based signup and login with bcrypt password hashing
- **Post Creation** — Supports text, images, or both; images are uploaded directly to Cloudinary
- **Public Feed** — View all posts sorted by "All Posts", "Most Liked", or "Most Commented"
- **Like System** — Toggle likes with Optimistic UI updates (instant feedback before API resolves)
- **Comment System** — Add comments; count syncs back to the parent feed in real time
- **Pagination** — Feed loads in pages of 10 with a "Load More" mechanism
- **Dynamic Avatars** — User avatars are generated dynamically based on username hashing
- **Auto-Logout** — Axios interceptor catches `401 Unauthorized` responses and redirects to login

---

## Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | React.js (Vite), React Router, Axios, Pure CSS     |
| Backend    | Node.js, Express.js                                |
| Database   | MongoDB (Mongoose ORM)                             |
| Storage    | Cloudinary (via Multer / multer-storage-cloudinary)|
| Auth       | JSON Web Tokens (JWT), bcryptjs                    |
| Deployment | Frontend → Vercel/Netlify · Backend → Render · DB → MongoDB Atlas |

---

## Features

### Authentication
Users register with a `username`, `email`, and `password`. Passwords are hashed with `bcryptjs`. On login, a JWT containing `{ userId, username }` is returned and stored in `localStorage`. Every subsequent API request automatically attaches this token via an Axios request interceptor.

### Post Creation
The frontend sends a `FormData` payload (text + optional image) to the backend. Multer handles `multipart/form-data`; `multer-storage-cloudinary` streams the image directly to Cloudinary and returns a URL. A Mongoose `pre('save')` hook enforces that at least one of `text` or `imageUrl` is present before saving.

### Feed & Sorting
The backend returns posts sorted by `createdAt: -1` with `skip()`/`limit()` pagination. The frontend fetches 10 posts per page and implements client-side sorting for "Most Liked" and "Most Commented" tabs based on the currently loaded data.

### Like System
`PUT /api/posts/:id/like` toggles the authenticated user's username in the `post.likes` array. The frontend applies an Optimistic UI update — the like count changes immediately, and the state is rolled back only if the API call fails.

### Comment System
`POST /api/posts/:id/comment` pushes a new comment object into `post.comments`. The backend returns the newly created comment with its MongoDB `_id`. The comment count is propagated back to `Feed.jsx` via an `onUpdate` callback.

### Post Deletion
When a post is deleted, the backend calls `cloudinary.uploader.destroy` first to remove the associated image, then deletes the MongoDB document — preventing orphaned files in Cloudinary.

---

## Folder Structure

```bash
social-app/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic (authController.js, postController.js)
│   │   ├── middleware/        # auth.js (JWT verification), errorHandler.js
│   │   ├── models/            # Mongoose schemas (User.js, Post.js)
│   │   ├── routes/            # Express route definitions (authRoutes.js, postRoutes.js)
│   │   └── utils/             # Helper utilities (cloudinary.js)
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Entry point, Express config, DB connection
│
└── frontend/
    ├── src/
    │   ├── api/               # Axios instance with JWT interceptors (axios.js)
    │   ├── components/        # PostCard.jsx, CommentModal.jsx, CreatePost.jsx,
    │   │                      # Navbar.jsx, Skeleton.jsx
    │   ├── context/           # Global auth state (AuthContext.jsx)
    │   ├── pages/             # Login.jsx, Signup.jsx, Feed.jsx
    │   ├── utils/             # avatarColor.js
    │   ├── App.jsx            # Routing with PrivateRoute / PublicRoute wrappers
    │   |── main.jsx           # React DOM |entry point
    │    └── index.css    
    |
    ├── index.html          # Global styles and CSS variables
    ├── package.json
    ├── vercel.json            # SPA rewrite rules for Vercel deployment
    └── vite.config.js
```

---

## Database Design

Two collections are used: `users` and `posts`.

**`User` Schema**

| Field       | Type   | Notes            |
|-------------|--------|------------------|
| `username`  | String | Unique           |
| `email`     | String | Unique           |
| `password`  | String | bcrypt hash      |
| `avatar`    | String |                  |
| `timestamps`| —      | Auto-managed     |

**`Post` Schema**

| Field           | Type             | Notes                              |
|-----------------|------------------|------------------------------------|
| `author`        | Embedded Object  | `{ userId, username, avatar }`     |
| `text`          | String           | Max 1000 characters                |
| `imageUrl`      | String           | Cloudinary URL                     |
| `imagePublicId` | String           | For Cloudinary deletion            |
| `likes`         | Array of Strings | Usernames of users who liked       |
| `comments`      | Array of Objects | `{ username, userId, text, timestamps }` |
| `timestamps`    | —                | Auto-managed                       |

Author metadata and comments are embedded directly in `Post` documents. No `$lookup` joins are required for feed reads.

---

## API Reference

### Auth Routes

| Method | Endpoint            | Body                            | Response                                  |
|--------|---------------------|---------------------------------|-------------------------------------------|
| POST   | `/api/auth/signup`  | `{ username, email, password }` | `{ token, user: { userId, username, avatar } }` |
| POST   | `/api/auth/login`   | `{ email, password }`           | `{ token, user: { userId, username, avatar } }` |

### Post Routes

All post routes require the header: `Authorization: Bearer <token>`

| Method | Endpoint                   | Body / Query                   | Response                                      |
|--------|----------------------------|--------------------------------|-----------------------------------------------|
| GET    | `/api/posts?page=1&limit=10` | —                            | `{ posts: [...], pagination: { page, totalPages, hasMore } }` |
| POST   | `/api/posts`               | `FormData`: `text`, `image`    | Post object                                   |
| PUT    | `/api/posts/:id/like`      | —                              | `{ likes: [...], likesCount }`                |
| POST   | `/api/posts/:id/comment`   | `{ text }`                     | `{ comment: {...}, commentsCount }`           |
| DELETE | `/api/posts/:id`           | —                              | `{ message: "Post deleted" }`                 |

---

## Setup & Installation

### Prerequisites

- Node.js
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Environment Variables

**`backend/.env`**

```env
PORT=
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=
```

**`frontend/.env`**

```env
VITE_API_URL=
```

### Run the Backend

```bash
cd backend
npm install --legacy-peer-deps
npm run dev
```

> `--legacy-peer-deps` is required due to a peer dependency conflict in `multer-storage-cloudinary`.

### Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

**Frontend (Vercel / Netlify)**

`vercel.json` includes a rewrite rule to prevent 404 errors on SPA page reloads:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Backend (Render)**

- Start command: `node server.js`
- CORS is configured dynamically using the `CLIENT_URL` environment variable.

**Database (MongoDB Atlas)**

- Connection string is injected via the `MONGO_URI` environment variable.

---

## Known Limitations

- **Likes Array Scaling** — Likes are stored as a string array inside the `Post` document. This works well for a mini-app but could approach MongoDB's 16MB BSON document limit at very high scale.
- **Client-Side Sorting** — "Most Liked" and "Most Commented" tabs sort only the currently loaded (paginated) posts, not the entire database.
- **No Real-Time Updates** — The UI feels responsive due to Optimistic UI, but changes made by other users are not pushed automatically. A page refresh or new interaction is required to see others' updates.