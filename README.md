# Vocab Master 2.0 🚀

A modern, gamified vocabulary learning application built with **NestJS**, **Vue 3**, and **Prisma**.

## ✨ Features

- **Gamified Learning**: Earn XP, Coins, and unlock Achievements while learning.
- **Scientific Repetition**: Uses a spaced repetition algorithm to optimize review times.
- **Interactive UI**: Beautiful, responsive design with animations, glassmorphism, and **Full Dark Mode support**.
- **Mistake Tracking**: Automatically tracks mistakes and provides a dedicated "Mistake Book" for review.
- **Progress Sync**: Real-time progress synchronization with the backend.
- **PK Arena**: Real-time multiplayer (WebSocket) and Bot modes for competitive learning.
- **Settings**: Customizable experience with sound and theme toggles.
- **Reset Functionality**: Robust "Reset Progress" feature to clear all study records and user stats.

## 🛠️ Tech Stack

- **Frontend**: Vue 3, TailwindCSS, Vite
- **Backend**: NestJS, Prisma (SQLite)
- **State Management**: Reactive State (Vue 3)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1.  **Clone the repository** (if applicable)
2.  **Install Dependencies**:
    ```bash
    # Install root dependencies (if any)
    npm install

    # Install Backend
    cd server
    npm install
    
    # Intall Frontend
    cd ../client
    npm install
    ```

### Database Setup

1.  Navigate to the `server` directory.
2.  Run migrations:
    ```bash
    npx prisma migrate dev
    ```
3.  (Optional) Seed initial data:
    ```bash
    npx ts-node prisma/seed.ts
    ```

### Running the App

1.  **Start the Backend**:
    ```bash
    cd server
    npm run start:dev
    ```
    Backend will run on `http://localhost:3000`.

2.  **Start the Frontend**:
    ```bash
    cd client
    npm run dev
    ```
    Frontend will typically run on `http://localhost:5173`.

## 🧪 Development Scripts

- **Verify Reset**: `npx ts-node server/scripts/verify-reset.ts`
- **Seed Reviews**: `npx ts-node server/scripts/seed-reviews.ts`
- **Clean Vocab**: `node scripts/clean-vocab-safe.js`

## 🤝 Contributing

Feel free to improve the vocabulary list or add new game modes!

## 📄 License

MIT
