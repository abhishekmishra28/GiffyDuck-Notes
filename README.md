<h1 align="center">
  🦆 GiffyDuck — AI Powered Notes Application
</h1>

<p align="center">
  A modern full-stack AI notes platform with intelligent note management, creative writing assistance, semantic search, and productivity tools.
</p>

---

## 🚀 Overview

GiffyDuck is a powerful AI-integrated note-taking application designed to help users organize ideas, write creatively, and retrieve information efficiently.

The platform combines traditional note management with AI-powered workflows using the Gemini API to provide smart assistance directly inside the application.

---

# ✨ Features

## 📝 Notes Management
- Create, edit, archive, and pin notes
- Rich note organization system
- Clean dashboard experience
- Responsive UI for productivity

## 🤖 AI Assistant
- AI-powered note assistance using Gemini API
- Generate insights from notes
- Creative writing support
- Smart content suggestions

## 🏷️ Tag Management
- Organize notes with customizable tags
- Better categorization and filtering
- Structured content organization

## 🔍 Full-text Search
- Quickly search notes and content
- Fast retrieval of stored information
- Efficient note discovery

## 🔐 Authentication & Security
- JWT Authentication
- OTP Verification System
- Protected Routes
- Role-based architecture
- Rate limiting middleware

## 📊 Admin Features
- Admin dashboard
- User management system
- Analytics pages
- Content moderation support

---

# 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, OTP Verification |
| AI Integration | Gemini API |
| State Management | Redux Toolkit |
| Styling | CSS |
| API Communication | Axios |

---

# 📂 Project Structure

```bash
GiffyDuck/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── store/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── README.md
└── DevProcesses.md
```

---

# ⚡ Quick Start

## Prerequisites
- Node.js 18+
- Express.js
- MongoDB
- npm

---

## 1️⃣ Clone Repository

```bash
git clone <your-repository-url>
cd GiffyDuck-Notes
```

---

# 🔧 Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email
EMAIL_PASS=your_password
CLIENT_URL=http://localhost:5173
```

Run backend server:

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

# 💻 Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🔑 Core Functionalities

- AI-powered writing assistance
- Smart note generation
- Semantic search capabilities
- Authentication & authorization
- Archive & pinned notes
- Tag-based organization
- OTP email verification
- Admin analytics dashboard

---

# 🌐 API Modules

## Authentication
- Register
- Login
- OTP Verification
- Password Reset

## Notes
- Create Note
- Update Note
- Delete Note
- Archive Note
- Pin Note

## AI
- AI Chat Assistance
- Note Summarization
- Content Suggestions

## Admin
- User Management
- Analytics Dashboard

---

# 📸 Application Pages

- Landing Page
- Login/Register
- Dashboard
- AI Chat Page
- Notes Page
- Note Editor
- Archived Notes
- Pinned Notes
- Settings
- Admin Dashboard
- Admin Analytics

---

# 🔒 Security Features

- JWT Authentication
- Protected API Routes
- Rate Limiting
- Middleware-based Authorization
- Secure Environment Variables

---

# 🚀 Future Improvements

- Real-time collaboration
- Markdown support
- AI note summarization
- File uploads
- Team workspaces
- Dark mode enhancements

---

# 👨‍💻 Author

**Abhishek Kumar Mishra**

---

# 📜 License

This project is developed for educational and portfolio purposes.