import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Setup dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing required environment variables. Please check .env.local file."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log("Testing Supabase connection...", new Date().toISOString());

  try {
    // Test the connection by getting the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log(
      "Connection test:",
      user ? "Authenticated" : "Not authenticated"
    );

    // Query the flips table
    console.log("\nQuerying flips table...");
    const { data, error } = await supabase
      .from("flips")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error querying flips:", error.message);
      return;
    }

    console.log("\nFlips data:");
    if (data.length === 0) {
      console.log("No records found");
    } else {
      data.forEach((flip, index) => {
        console.log(
          `${index + 1}. ID: ${flip.id}, Result: ${flip.result}, Created: ${
            flip.created_at || "N/A"
          }`
        );
      });
    }
    console.log(`\nTotal rows: ${data.length}`);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

// Run the test
testSupabaseConnection();
