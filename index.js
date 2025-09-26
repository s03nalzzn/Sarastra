// ──────────────────────────────────────
// 📦 Import required libraries
// ──────────────────────────────────────
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// ──────────────────────────────────────
// 🌍 Load environment variables
// ──────────────────────────────────────
dotenv.config();

// ──────────────────────────────────────
// 🚀 Create Express app
// ──────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────
// 🌐 Enable CORS (allow frontend access)
// ──────────────────────────────────────
app.use(cors());

// ──────────────────────────────────────
// 🔐 Supabase client setup using env vars
// ──────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ──────────────────────────────────────
// 🏆 Leaderboard API Route
// ──────────────────────────────────────
app.get("/leaderboard", async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch upvotes
    const { data: upvotes, error: upvoteError } = await supabase
      .from("report_upvotes")
      .select("user_id, report_id, created_at, reports(reporter)")
      .gte("created_at", oneWeekAgo);

    if (upvoteError) throw upvoteError;

    // Fetch reports
    const { data: reports, error: reportError } = await supabase
      .from("reports")
      .select("reporter, id, created_at")
      .gte("created_at", oneWeekAgo);

    if (reportError) throw reportError;

    // Fetch profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, email");

    if (profileError) throw profileError;

    // Create profile lookup map
    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.id] = p;
    });

    // Stats calculation
    const stats = {};

    // Upvotes → given & received
    upvotes.forEach(v => {
      const voter = v.user_id;
      const owner = v.reports?.reporter;

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

    // Hero score calculation
    for (const user in stats) {
      stats[user].hero_score = (2 * stats[user].received) + (1 * stats[user].reports);
    }

    // Convert to array
    let leaderboard = Object.entries(stats)
      .map(([user_id, values]) => ({
        user_id,
        email: profileMap[user_id]?.email || "Unknown",
        ...values
      }))
      .sort((a, b) => b.hero_score - a.hero_score);

    // Assign rank and badges
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

    // Send final leaderboard response
    res.json(leaderboard);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// 🔊 Start the server
// ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
