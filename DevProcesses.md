# 🚀 AI Notes Backend – Development Log

---

# 📦 PHASE 1: Project Setup (Client + Server)

## 📁 Project Structure

```bash
ai-notes-app/
├── client/   # Next.js frontend
└── server/   # Express backend
```

---

## ⚙️ Backend Setup (Express)

### 🔹 Initialize Backend

```bash
mkdir server
cd server
npm init -y
```

---

### 🔹 Install Dependencies

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken cookie-parser nodemailer express-rate-limit axios
npm install --save-dev nodemon
```

---

### 🔹 Core Server Setup

```js
// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { globalLimiter } = require('./src/middlewares/rateLimiter');

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(cookieParser());

// 🌍 Global Rate Limiting
app.use(globalLimiter);

app.get('/', (req, res) => {
  res.send("API running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

# 🍃 PHASE 2: MongoDB Connection

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

GEMINI_API_KEY=your_api_key
```

---

# 🔐 PHASE 3: Authentication System

## 🎯 Features

* OTP-based Registration
* Email Verification (mandatory for AI access)
* JWT Authentication
* Role-Based Access Control (RBAC)
* Protected Routes

---

## 🔑 Flow

```text
Register → OTP → Email → Verify → JWT → Access APIs
```

---

# 🔐 PHASE 4: Password Recovery

## 🎯 Features

* Forgot Password (email reset link)
* Reset Password (secure token + expiry)

---

## 🔁 Flow

```text
Forgot → Generate Token → Email → Reset
```

---

# 📧 PHASE 5: Email System

* OTP email delivery
* Password reset emails
* HTML templates (structured)

---

# 🔒 PHASE 6: Rate Limiting & Security

## 🎯 Features

* Global API rate limiting
* Auth route protection
* OTP request limiting
* Chat API rate limiting

---

## 🔁 Flow

```text
Request → Identify (IP/User) → Count → Allow / Block (429)
```

---

# 🧩 PHASE 7: Notes Backend (CORE FEATURE)

## 🎯 Features

* Create Note
* Get Notes (pagination + search + filter)
* Update Note
* Delete Note
* Ownership enforcement

---

## 🧠 Data Model

```js
Note {
  user: ObjectId
  title: String
  content: String
  tags: [String]
  isPinned: Boolean
  isArchived: Boolean
  embedding: [Number] // vector representation
  createdAt
  updatedAt
}
```

---

## ⚙️ Optimizations

* Index: `{ user, createdAt }`
* Text index: `{ title, content }`
* Pagination limit enforced (max 50)

---

## 🔐 Security

```text
All queries include userId → prevents data leaks
```

---

# 🤖 PHASE 8: AI Integration (Gemini)

---

## 🎯 Features

* Context-aware chatbot (RAG-based)
* Answers based on user's notes only
* Structured HTML responses
* AI usage quota control

---

## 🔑 Chat Flow

```text
User Query
→ Fetch Relevant Notes
→ Build Context
→ Gemini API
→ Structured Response
```

---

## 🔒 Access Control

* Only authenticated users
* Only verified users
* AI quota enforcement
* Rate limiting on chat endpoint

---

# 🧠 PHASE 9: Vector Search (Semantic Retrieval)

---

## 🎯 Features

* Embedding generation (Gemini)
* Vector storage in MongoDB
* Semantic similarity search

---

## 🔁 Flow

```text
Note → Embedding stored
Query → Embedding generated
→ Vector Search → Top Notes
```

---

## 🧠 Advantage

```text
"binary exponentiation" ≈ "fast power method"
```

---

## ⚙️ Requirements

* MongoDB Atlas Vector Index
* Cosine similarity search

---

# 💬 PHASE 10: Chat Memory System

---

## 🎯 Features

* Persistent chat history (MongoDB)
* Context-aware responses
* Conversation continuity

---

## 🧠 Data Model

```js
Chat {
  user: ObjectId
  messages: [
    { role: "user" | "assistant", content: String }
  ]
}
```

---

## 🔁 Flow

```text
User Query
→ Fetch Chat History
→ Combine with Notes Context
→ AI Response
→ Save Conversation
```

---

## ⚙️ Optimization

* Store last N messages only (memory limit)
* Prevent token overflow

---

# 🧠 PHASE 11: RAG Architecture (FINAL SYSTEM)

---

## 🔥 Complete Flow

```text
User Query
→ Embedding
→ Vector Search (Notes)
→ Fetch Chat History
→ Build Context
→ Gemini
→ Save Response
```

---

# 🚀 CURRENT STATUS

✅ Backend Setup Complete
✅ MongoDB Connected
✅ Auth System (OTP + JWT)
✅ Password Recovery System
✅ Email System (Nodemailer)
✅ Rate Limiting (Global + Auth + Chat)
✅ Notes CRUD (Advanced Queries)
✅ Embedding Storage
✅ Vector Search (Semantic Retrieval)
✅ AI Chatbot (Gemini Integration)
✅ Chat Memory System
✅ AI Usage Quota System

---

# 🔜 NEXT PHASE

## 🌐 Frontend Integration

* Chat UI (ChatGPT-style)
* Notes dashboard
* Real-time updates

---

## 🚀 Advanced Enhancements

* Streaming responses (typing effect)
* Multi-chat threads
* Caching (Redis)
* Background jobs (BullMQ)
* AI suggestions inside notes

---

# 💡 Engineering Principles

* MVC architecture
* Service-layer AI abstraction
* Secure token handling
* Rate limiting & abuse prevention
* Scalable query design
* Context-aware AI (RAG)

---

# 🧠 System Design Insight

```text
OTP → Identity Verification
JWT → Authorization
Rate Limiting → Abuse Control
Vector Search → Semantic Understanding
Chat Memory → Context Awareness
RAG → Intelligent AI Responses
```

---

# 🏁 Final Summary

You have built a **production-level AI backend system** with:

* Secure authentication
* Email-based workflows
* Advanced CRUD APIs
* Semantic search (vector DB)
* AI-powered chatbot (RAG)
* Persistent chat memory
* Rate limiting & quota control

👉 This is **top-tier SDE-1 / early SDE-2 level backend system**
