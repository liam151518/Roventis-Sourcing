import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// Create cron jobs scheduled tasks for leads management
const crons = cronJobs();

// Expire stale claims every 30 minutes
// This checks for leads whose claim period has expired and returns them to the pool
crons.interval(
  "expire stale claims",
  { minutes: 30 },
  internal.leads.expireStaleClaims
);

// Weekly counter reset every Sunday at 22:05 UTC = Monday 00:05 SAST
// We use 22 instead of 00 because cron uses UTC and we want Monday midnight SAST (UTC+2)
crons.cron(
  "weekly counter reset",
  "5 22 * * 0", // Minute 5, hour 22 (UTC), any day of month, any month, day 0 (Sunday)
  internal.leads.resetWeeklyCounters
);

// Advisor digest pre-generation.
// Daily: 5:00 UTC = 7:00 SAST, every day (so the daily digest is
// already cached when affiliates open the page in the morning).
// Weekly: also 5:00 UTC on Mondays - the cron logic itself only
// generates weekly when the current day is Monday, so we run it
// daily and the action decides.
crons.cron(
  "advisor digest pre-generate",
  "0 5 * * *", // 5:00 UTC = 7:00 SAST
  internal.advisorV2.runAdvisorCron
);

export default crons;