// Import required libraries
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

// Create Express app
const app = express();
const PORT = 5000;

// Enable CORS so frontend can access
app.use(cors());

// Supabase client setup
const supabase = createClient(
  "https://YOUR_PROJECT_URL.supabase.co", // Replace with your Supabase project URL
  "YOUR_ANON_KEY"                         // Replace with your Supabase anon key
);

// API route for leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    // Last 7 days timestamp
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch votes from Supabase in last 7 days
    const { data: votes, error } = await supabase
      .from("votes")
      .select("user_id, posts(user_id), created_at") // Make sure posts relation exists
      .gte("created_at", oneWeekAgo);

    if (error) throw error;

    // Initialize stats object
    const stats = {};

    votes.forEach(v => {
      const voter = v.user_id;         // User who voted
      const owner = v.posts.user_id;   // Owner of the post

      // Initialize user stats if not present
      if (!stats[voter]) stats[voter] = { received: 0, given: 0, hero_score: 0 };
      if (!stats[owner]) stats[owner] = { received: 0, given: 0, hero_score: 0 };

      // Count votes given
      stats[voter].given++;

      // Count votes received
      stats[owner].received++;
    });

    // Calculate hero score
    for (const user in stats) {
      stats[user].hero_score = (2 * stats[user].received) + (1 * stats[user].given);
    }

    // Convert object → array and sort by hero score
    let leaderboard = Object.entries(stats)
      .map(([user_id, values]) => ({ user_id, ...values }))
      .sort((a, b) => b.hero_score - a.hero_score);

    // Assign rank + badges
    leaderboard = leaderboard.map((user, index) => {
      let badge = "Participant";
      if (index === 0) badge = "🏆 Hero of the Week (Gold)";
      else if (index === 1) badge = "🥈 Silver Hero";
      else if (index === 2) badge = "🥉 Bronze Hero";

      return {
        rank: index + 1,
        ...user,
        badge
      };
    });

    // Return leaderboard JSON
    res.json(leaderboard);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));