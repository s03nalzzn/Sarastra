# 🦸 Civic Leaderboard Backend

This is the backend service for the **Civic Hero Leaderboard** app. It provides an API endpoint that calculates and returns weekly leaderboard statistics based on user activity from Supabase.

---

## 🚀 Features

- 📊 Leaderboard data from Supabase (reports, upvotes, profiles)
- 🧠 Calculates "Hero Score" based on user contributions
- 🏆 Ranks users and assigns badges (Gold, Silver, Bronze)
- 🌍 CORS enabled — ready for frontend integration
- 🔗 Deployed on Render

---

## 🌐 API Endpoint

| Method | Endpoint       | Description                         |
|--------|----------------|-------------------------------------|
| GET    | `/leaderboard` | Returns leaderboard for last 7 days |

**Full URL:**

https://sarastra.onrender.com/leaderboard

## 📦 Tech Stack

- Node.js + Express
- Supabase (PostgreSQL + Auth)
- Render (Hosting)
- dotenv (Environment variables)
- CORS (Cross-origin support)

---

## 🛠️ Setup Instructions

### 1. Clone the repository
git clone https://github.com/your-username/civic-leaderboard-backend.git

cd civic-leaderboard-backend

### 2. Install dependencies
npm install

### 3. Create a .env file
PORT=5000

SUPABASE_URL=your-supabase-url

SUPABASE_ANON_KEY=your-supabase-anon-key

⚠️ Keep this file secret. Do not commit it to Git.

### 4. Start the server
node index.js

### 📤 Deployment (Render)
Push your code to GitHub

Go to https://render.com

Create a Web Service

Set:

Build Command: npm install

Start Command: node index.js

Add your environment variables under "Environment"

🧪 Testing
You can test the API using:

curl https://sarastra.onrender.com/leaderboard

Or use Postman, Insomnia, or your frontend.

📄 Sample Response
[

  {
  
    "rank": 1,
    
    "user_id": "uuid-123",
    
    "email": "hero@example.com",
    
    "received": 10,
    
    "given": 5,
    
    "reports": 3,
    
    "hero_score": 23,
    
    "badge": "🏆 Hero of the Week (Gold)"
    
  },
  
]

📁 Project Structure

├── index.js

├── .env , .gitignore         # Not committed

├── package.json

└── package-lock.json
