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
  "https://uluewsrikqrozijvkbhn.supabase.co", // Supabase project URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsdWV3c3Jpa3Fyb3ppanZrYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2OTY2MTUsImV4cCI6MjA3NDI3MjYxNX0.nleX6kBlbkNuz7JS00Ms0fLPJx7dgaGDf35CWhPV2v4" // Supabase anon key
);

// API route for leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    // Last 7 days timestamp
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // --- 1. Fetch upvotes with report owners ---
    const { data: upvotes, error: upvoteError } = await supabase
      .from("report_upvotes")
      .select("user_id, report_id, created_at, reports(reporter)")
      .gte("created_at", oneWeekAgo);

    if (upvoteError) throw upvoteError;

    // --- 2. Fetch reports to count per user ---
    const { data: reports, error: reportError } = await supabase
      .from("reports")
      .select("reporter, id, created_at")
      .gte("created_at", oneWeekAgo);

    if (reportError) throw reportError;

    // --- 3. Fetch profiles for names/emails (expand later with avatar, full_name etc.) ---
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, email");

    if (profileError) throw profileError;

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.id] = p;
    });

    // --- 4. Stats calculation ---
    const stats = {};

    // Upvotes → given & received
    upvotes.forEach(v => {
      const voter = v.user_id;               // who upvoted
      const owner = v.reports?.reporter;     // report ka owner

      if (!stats[voter]) stats[voter] = { received: 0, given: 0, reports: 0, hero_score: 0 };
      if (owner && !stats[owner]) stats[owner] = { received: 0, given: 0, reports: 0, hero_score: 0 };

      stats[voter].given++;
      if (owner) stats[owner].received++;
    });

    // Reports → count
    reports.forEach(r => {
      if (!stats[r.reporter]) stats[r.reporter] = { received: 0, given: 0, reports: 0, hero_score: 0 };
      stats[r.reporter].reports++;
    });

    // --- 5. Hero score calculation ---
    for (const user in stats) {
      stats[user].hero_score = (2 * stats[user].received) + (1 * stats[user].reports);
    }

    // --- 6. Convert object → array ---
    let leaderboard = Object.entries(stats)
      .map(([user_id, values]) => ({
        user_id,
        email: profileMap[user_id]?.email || "Unknown",
        ...values
      }))
      .sort((a, b) => b.hero_score - a.hero_score);

    // --- 7. Assign rank & badges ---
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

    // --- 8. Send response ---
    res.json(leaderboard);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
