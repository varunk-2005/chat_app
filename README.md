# Chat App

A real-time one-to-one chat application built with the MERN stack and Socket.io. Users can sign up, log in, see who's online, and exchange messages that appear instantly, with no page refresh.

## Features

- **Real-time messaging** using Socket.io (WebSockets)
- **User authentication** with signup, login and logout
- **Online status** showing which users are currently connected
- **Persistent chat history** stored in MongoDB
- **Responsive UI** built with React

## Tech Stack

| Layer      | Technology                 |
|------------|----------------------------|
| Frontend   | React                      |
| Backend    | Node.js, Express           |
| Database   | MongoDB (Mongoose)         |
| Real-time  | Socket.io                  |

## Architecture

```
React client  ──HTTP (REST)──►  Express API  ──►  MongoDB
      │                             │
      └──────WebSocket (Socket.io)──┘
```

- **REST API** handles authentication, fetching users, and loading or saving message history.
- **Socket.io** pushes new messages and online-user updates to connected clients in real time.
- On login, the client opens **one** socket connection, and the server maps each `userId` to its `socketId` so it can deliver messages to the right recipient.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local install or MongoDB Atlas)

### Installation

```bash
git clone https://github.com/<your-username>/chat_app.git
cd chat_app

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Run Locally

```bash
# Terminal 1 – backend
cd backend
npm run dev

# Terminal 2 – frontend
cd frontend
npm run dev
```

Open the frontend URL shown in the terminal (usually `http://localhost:5173`).

## Project Structure

```
chat_app/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route logic (auth, messages)
│   │   ├── models/        # Mongoose schemas (User, Message)
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth protection
│   │   └── lib/           # DB connection, socket setup
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    # UI components
    │   ├── pages/         # Login, Signup, Home
    │   └── store/         # Client state and socket logic
    └── package.json
```

## Challenges & Learnings

**Bug: asymmetric messaging after deployment.** Messages reached one user but not the other.

- **Cause:** `connectSocket` was being called twice, so a user ended up with two socket connections. The server's `userId → socketId` map pointed to the wrong (stale) socket, and messages went to a connection the client wasn't listening on.
- **Fix:** Guard the connection so it opens only once (skip if a socket already exists and is connected), and clean up the socket on logout or disconnect.
- **Takeaway:** In real-time apps, connection lifecycle management matters as much as the messaging logic itself.

## Future Improvements

- Group chats
- Typing indicators and read receipts
- Image and file sharing
- Message search
- End-to-end encryption

## Author

**Varun** – [GitHub](https://github.com/<your-username>) · [LinkedIn](https://linkedin.com/in/<your-profile>)
