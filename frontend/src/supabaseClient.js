import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
  console.error("Required variables:");
  console.error("REACT_APP_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("REACT_APP_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓" : "✗");
}

export const supabase = createClient(
  supabaseUrl || "https://ftamgxeycvyoqmtinsjm.supabase.co",
  supabaseAnonKey ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0YW1neGV5Y3Z5b3FtdGluc2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNDcxMDgsImV4cCI6MjA1MjYyMzEwOH0.o5a4Ir90JYvvLUYH20WHoMXJpxb19fLRus7myyf0dCE"
);
