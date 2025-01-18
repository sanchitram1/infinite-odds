import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration:", {
    url: !!supabaseUrl,
    key: !!supabaseServiceKey,
  });
  throw new Error("Missing Supabase environment variables");
}

// Log configuration (without exposing the full key)
console.log("Supabase Configuration:", {
  url: supabaseUrl,
  key: `${supabaseServiceKey.slice(0, 6)}...${supabaseServiceKey.slice(-4)}`,
});

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  // Add request timeout
  db: {
    schema: "public",
  },
});
