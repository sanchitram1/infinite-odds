import { FlipGame, INITIAL_STAKE, MAX_FLIPS } from "../src/utils/gameLogic.js";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";

// Setup dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from frontend root
const envPath = resolve(__dirname, "../.env.local");
console.log("Looking for .env.local at:", envPath);

if (!existsSync(envPath)) {
  console.error(`Error: Environment file not found at ${envPath}`);
  process.exit(1);
}

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error("Error loading environment variables:", result.error);
  process.exit(1);
}

// Create Supabase client for tests
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Test Suite Statistics
const stats = {
  totalTests: 5,
  passed: 0,
  failed: 0,
  testResults: [],
};

function recordTestResult(testName, passed, error = null) {
  stats.testResults.push({ name: testName, passed, error });
  if (passed) {
    stats.passed++;
    console.log(`✓ ${testName}\n`);
  } else {
    stats.failed++;
    console.log(`✗ ${testName}`);
    if (error) console.error(`  Error: ${error}\n`);
  }
}

async function runIntegrationTests() {
  console.log("\nRunning Integration Tests\n");

  try {
    // Test 1: Game Initialization
    console.log("Test 1: Game Initialization");
    const game = new FlipGame();
    const initialState = game.getGameState();
    const initTestPassed =
      initialState.currentStake === INITIAL_STAKE &&
      initialState.flipCount === 0;
    recordTestResult("Game Initialization", initTestPassed);

    // Test 2: Flip Mechanics
    console.log("Test 2: Flip Mechanics");
    const result = game.flip();
    const flipTestPassed =
      result.flipNumber === 1 &&
      (result.result === "heads"
        ? result.stake === INITIAL_STAKE * 2
        : result.stake === 0);
    recordTestResult("Flip Mechanics", flipTestPassed);

    // Test 3: Max Flips Limit
    console.log("Test 3: Max Flips Limit");
    const maxGame = new FlipGame();
    let flipsCount = 0;
    while (flipsCount < MAX_FLIPS + 2) {
      const flipResult = maxGame.flip();
      if (!flipResult) break;
      flipsCount++;
    }
    recordTestResult("Max Flips Limit", flipsCount <= MAX_FLIPS);

    // Test 4: Supabase Connection
    console.log("Test 4: Supabase Connection");
    const { error: connectionError } = await supabase
      .from("flips")
      .select("*")
      .limit(1);
    recordTestResult(
      "Supabase Connection",
      !connectionError,
      connectionError?.message
    );

    // Test 5: Data Format
    console.log("Test 5: Data Format");
    const testData = {
      result: "win",
      initial_stake: 1,
      stake: 2,
      num_flips: 1,
      flip_history: "H",
    };
    const { error: insertError } = await supabase
      .from("flips")
      .insert([testData]);
    recordTestResult("Data Format", !insertError, insertError?.message);
  } catch (err) {
    console.error("Unexpected error during tests:", err);
    process.exit(1);
  }

  // Print Test Summary
  console.log("\nTest Summary");
  console.log("============");
  console.log(`Total Tests: ${stats.totalTests}`);
  console.log(`Passed: ${stats.passed}`);
  console.log(`Failed: ${stats.failed}`);

  if (stats.failed > 0) {
    console.log("\nFailed Tests:");
    stats.testResults
      .filter((test) => !test.passed)
      .forEach((test) =>
        console.log(`- ${test.name}${test.error ? ": " + test.error : ""}`)
      );
    process.exit(1);
  }
}

runIntegrationTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
